from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from .. import crud, schemas, models

router = APIRouter()

@router.post("/telegram/", response_model=schemas.SourceCreate)
async def create_telegram(telegram: schemas.TelegramCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_telegram(db, telegram)

@router.get("/telegram", response_model=list[schemas.SourceCreate])
async def get_telegram(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Telegram))
    telegram_list = result.scalars().all()
    return telegram_list 