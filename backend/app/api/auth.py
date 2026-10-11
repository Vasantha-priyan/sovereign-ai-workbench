from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.db.models import User
from app.schemas import UserResponse

router = APIRouter(tags=["Users"])

@router.get("/users", response_model=List[UserResponse])
async def list_users(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(User))
    return res.scalars().all()
