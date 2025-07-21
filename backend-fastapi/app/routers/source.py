from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from .. import crud, schemas, models
from typing import List

router = APIRouter()

@router.post("/sources/")
async def create_source(source: schemas.SourceCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_source(db, source)

@router.get("/sources", response_model=List[schemas.SourceOut])
async def get_sources(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Source).where(~models.Source.type.in_(["ransomware", "telegram"]))
    )
    sources = result.scalars().all()
    return sources
