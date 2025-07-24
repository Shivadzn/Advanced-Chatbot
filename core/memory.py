import time
from langchain.memory import ConversationBufferWindowMemory
from typing import Dict, Tuple

SESSION_TIMEOUT = 3600  # 1 hour in seconds
# Store (memory, last_access_time)
conversation_memories: Dict[str, Tuple[ConversationBufferWindowMemory, float]] = {}
# Store chat names for sessions
chat_names: Dict[str, str] = {}

def get_memory(session_id: str, max_history: int = 10) -> ConversationBufferWindowMemory:
    """Get or create conversation memory for a session, with expiry."""
    now = time.time()
    # Clean up expired sessions
    expired = [sid for sid, (_, t) in conversation_memories.items() if now - t > SESSION_TIMEOUT]
    for sid in expired:
        del conversation_memories[sid]
        if sid in chat_names:
            del chat_names[sid]
    # Usual logic
    if session_id not in conversation_memories:
        conversation_memories[session_id] = (
            ConversationBufferWindowMemory(
                k=max_history,
                return_messages=True,
                input_key="input",
                output_key="output"
            ),
            now
        )
    else:
        # Update last access time
        memory, _ = conversation_memories[session_id]
        conversation_memories[session_id] = (memory, now)
    return conversation_memories[session_id][0] 