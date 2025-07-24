from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, String, Integer, DateTime, Text, delete, select
import datetime

DATABASE_URL = "sqlite+aiosqlite:///./chatbot.db"

engine = create_async_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)
    sender = Column(String)  # "Human" or "AI"
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    session_id = Column(String, primary_key=True, index=True)
    chat_name = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

async def save_session_name(session_id, chat_name):
    print(f"DEBUG: save_session_name called with session_id={session_id}, chat_name={chat_name}")
    try:
        async with SessionLocal() as session:
            # Try to get existing session
            result = await session.execute(select(ChatSession).where(ChatSession.session_id == session_id))
            session_obj = result.scalar_one_or_none()
            if session_obj:
                session_obj.chat_name = chat_name
            else:
                session_obj = ChatSession(session_id=session_id, chat_name=chat_name)
            session.add(session_obj)
            await session.commit()
        print("DEBUG: save_session_name committed successfully")
    except Exception as e:
        print(f"ERROR in save_session_name: {e}")

async def get_session_names_db():
    print("DEBUG: get_session_names_db called")
    async with SessionLocal() as session:
        result = await session.execute(
            select(ChatSession).order_by(ChatSession.created_at.desc())
        )
        sessions = result.scalars().all()
        print(f"DEBUG: get_session_names_db found {len(sessions)} sessions")
        return sessions

async def clear_history_db(session_id):
    async with SessionLocal() as session:
        await session.execute(
            delete(ChatMessage).where(ChatMessage.session_id == session_id)
        )
        await session.commit()

async def delete_session_db(session_id):
    async with SessionLocal() as session:
        await session.execute(
            delete(ChatMessage).where(ChatMessage.session_id == session_id)
        )
        await session.execute(
            delete(ChatSession).where(ChatSession.session_id == session_id)
        )
        await session.commit()

async def migrate_add_created_at_to_sessions():
    """Set created_at for existing sessions that are missing it."""
    async with SessionLocal() as session:
        result = await session.execute(select(ChatSession).where(ChatSession.created_at == None))
        sessions = result.scalars().all()
        now = datetime.datetime.utcnow()
        for s in sessions:
            s.created_at = now
        await session.commit() 