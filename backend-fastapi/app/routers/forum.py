from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from .. import crud, schemas, models
from ..schemas import ForumPostCreate, ForumPostOut, ForumOut, ForumCreate

router = APIRouter()

@router.post("/forum-posts/", response_model=schemas.ForumPostOut)
async def create_forum_post(post: schemas.ForumPostCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_forum_post(db, post)

@router.get("/forums", response_model=list[schemas.ForumOut])
async def get_forums(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Forum))
    forums = result.scalars().all()
    return forums

@router.post("/forums/", response_model=schemas.ForumOut)
async def create_forum(forum: schemas.ForumCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_forum(db, forum)

# ...otros endpoints relacionados a foros...