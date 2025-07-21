from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from .. import crud, schemas, models
from typing import List

router = APIRouter()

@router.post("/ransomware/", response_model=schemas.RansomwareOut)
async def create_ransomware(ransomware: schemas.RansomwareCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_ransomware(db, ransomware)

@router.get("/ransomware", response_model=List[schemas.RansomwareOut])
async def get_ransomware(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Ransomware))
    ransomware_list = result.scalars().all()
    return ransomware_list 