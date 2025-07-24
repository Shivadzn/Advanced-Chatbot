from fastapi import APIRouter, HTTPException, Request
from api.models import PromptRequest, HistoryRequest
from core.llm import llm, GROQ_MODEL
from core.memory import get_memory, conversation_memories, chat_names
from core.utils import classify_message, process_response
import uuid
import time
from langchain.schema import HumanMessage, AIMessage
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain, ConversationChain
from core.db import SessionLocal, ChatMessage, save_session_name, get_session_names_db, clear_history_db, delete_session_db
from sqlalchemy.future import select

router = APIRouter()

STRUCTURED_CONVERSATION_TEMPLATE = """You are a helpful and friendly AI assistant. Respond to the user's messages in clear, natural-sounding plain text. Avoid using markdown, headings, or special formatting.

Write in simple, conversational language. Use paragraphs for clarity.

- Use emojis only when they add clarity or emotion to your response
- Use plain text bullet points if they help structure the information
- When you provide a list, always start each item with a dash (- ) or a number (1. 2. 3. ...).
- Keep responses informative, concise, and polite

Conversation so far:
{history}
Human: {input}
AI:"""

def format_structured_response(response: str) -> dict:
    """Format the response for conversation."""
    return {
        "response": response,
        "message_type": "conversation"
    }

async def save_message(session_id, sender, content):
    async with SessionLocal() as session:
        msg = ChatMessage(session_id=session_id, sender=sender, content=content)
        session.add(msg)
        await session.commit()

async def get_history_db(session_id):
    async with SessionLocal() as session:
        result = await session.execute(
            select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.timestamp)
        )
        return result.scalars().all()

def create_chain(template: str, memory=None):
    input_vars = ["input"]
    if memory:
        input_vars.append("history")
    prompt = PromptTemplate(
        input_variables=input_vars,
        template=template
    )
    if memory:
        return ConversationChain(
            llm=llm,
            prompt=prompt,
            memory=memory,
            verbose=True,
            output_key="output"
        )
    else:
        return LLMChain(
            llm=llm,
            prompt=prompt,
            verbose=True,
            output_key="text"
        )

@router.get("/")
async def root():
    return {
        "status": "ok",
        "title": "Conversational LangChain Chat Bot",
        "version": "2.1.0",
        "model": GROQ_MODEL,
        "description": "Conversational chatbot with memory and session management",
        "features": [
            "Conversational Responses", 
            "Conversation Memory", 
            "Session Management"
        ]
    }

@router.post("/generate/")
async def generate_response(request: PromptRequest):
    if llm is None:
        raise HTTPException(status_code=503, detail="AI model not initialized. Check server logs for errors during startup (e.g., missing API key).")
    try:
        session_id = request.session_id or str(uuid.uuid4())
        # Save user message
        await save_message(session_id, "Human", request.prompt)
        memory = get_memory(session_id, request.max_history)
        # Set chat name to first user message if not already set
        if session_id not in chat_names:
            chat_name = request.prompt[:40]
            chat_names[session_id] = chat_name
            await save_session_name(session_id, chat_name)
        # Always treat as conversation
        chain = create_chain(STRUCTURED_CONVERSATION_TEMPLATE, memory)
        response = chain.predict(input=request.prompt)
        # Try to extract code block from response
        import re
        code_match = re.search(r"```(?:[a-zA-Z]+)?\n([\s\S]+?)```", response)
        code = code_match.group(1).strip() if code_match else None
        # Remove all code blocks from the explanation
        explanation = re.sub(r"```[a-zA-Z]*\n[\s\S]+?```", "", response).strip()
        response_data = format_structured_response(explanation)
        response_data["session_id"] = session_id
        response_data["timestamp"] = time.time()
        if code:
            response_data["code"] = code
        # Save AI message
        await save_message(session_id, "AI", response_data["response"])
        print(f"✅ Generated conversational response for session {session_id}")
        return response_data
    except Exception as e:
        print(f"❌ Error in generate_response: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Generation error: {str(e)}")

@router.post("/clear_history/")
async def clear_history(request: HistoryRequest):
    await clear_history_db(request.session_id)
    return {"status": "success", "message": "Conversation history cleared"}

@router.post("/get_history/")
async def get_history(request: HistoryRequest):
    try:
        messages = await get_history_db(request.session_id)
        if messages:
            history = [f"{msg.sender}: {msg.content}" for msg in messages]
            return {"status": "success", "history": history}
        return {"status": "not_found", "message": "Session ID not found"}
    except Exception as e:
        print(f"Error in get_history: {e}")
        raise HTTPException(status_code=500, detail=f"Internal error: {e}")

@router.get("/sessions/")
async def get_active_sessions():
    return {
        "active_sessions": list(conversation_memories.keys()),
        "total_sessions": len(conversation_memories)
    }

@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    await delete_session_db(session_id)
    return {"status": "success", "message": f"Session {session_id} deleted"}

@router.get("/session_names/")
async def get_session_names():
    sessions = await get_session_names_db()
    return [
        {"session_id": s.session_id, "chat_name": s.chat_name, "created_at": s.created_at.isoformat() if s.created_at else None} for s in sessions
    ]

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model": llm.model if llm else None,
        "active_sessions": len(conversation_memories),
        "langchain_version": "0.0.350"
    }  