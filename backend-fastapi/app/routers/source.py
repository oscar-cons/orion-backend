from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from .. import crud, schemas

router = APIRouter()

@router.post("/sources/")
async def create_source(source: schemas.SourceCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_source(db, source)
