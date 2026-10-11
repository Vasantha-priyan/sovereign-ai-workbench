from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.db.models import Conversation, Message, User
from app.services.llm.chat_service import process_chat_message

router = APIRouter(prefix="", tags=["Workbench Sessions"])

class MessagePayload(BaseModel):
    conversation_id: Optional[str] = None
    prompt: str
    kb_id: Optional[str] = "kb-1"

@router.get("/workbench/sessions")
@router.get("/chat/conversations")
async def list_conversations(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Conversation).order_by(Conversation.updated_at.desc()))
    return res.scalars().all()

@router.post("/workbench/sessions")
@router.post("/chat/conversations")
async def create_conversation(title: Optional[str] = "Pump P-102A Inspection Review", db: AsyncSession = Depends(get_db)):
    user_res = await db.execute(select(User))
    user = user_res.scalars().first()

    conv = Conversation(
        user_id=user.id if user else "user-1",
        title=title,
        selected_model="qwen2.5:7b-instruct"
    )
    db.add(conv)
    await db.commit()
    await db.refresh(conv)
    return conv

@router.get("/chat/conversations/{conv_id}/messages")
async def get_messages(conv_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Message).where(Message.conversation_id == conv_id).order_by(Message.created_at.asc()))
    return res.scalars().all()

@router.post("/chat/message")
@router.post("/workbench/message")
async def send_message(payload: MessagePayload, db: AsyncSession = Depends(get_db)):
    result = await process_chat_message(
        conversation_id=payload.conversation_id,
        prompt=payload.prompt,
        kb_id=payload.kb_id,
        db=db
    )
    return result
