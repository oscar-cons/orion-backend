from .models import ForumPost, Forum, Source, MonitoredEnum
from .schemas import ForumPostCreate, SourceCreate, ForumCreate
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError

async def create_source(db: AsyncSession, source_data: SourceCreate):
    # Validación manual de campos requeridos
    required_fields = ["name", "type", "author", "country", "language", "status", "monitored"]
    for field in required_fields:
        value = getattr(source_data, field, None)
        if value in [None, ""]:
            raise HTTPException(status_code=422, detail=f"El campo '{field}' es obligatorio y no puede estar vacío.")
    try:
        new_source = Source(**source_data.dict())
        db.add(new_source)
        await db.commit()
        await db.refresh(new_source)
        return new_source
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Error de integridad en la base de datos. Revisa los campos obligatorios.")

async def create_forum(db: AsyncSession, forum_data: ForumCreate):
    # Validación manual de campos requeridos
    required_fields = ["name", "type", "author", "country", "language", "status", "monitored",
                       "user_count", "post_count", "thread_count"]
    for field in required_fields:
        value = getattr(forum_data, field, None)
        if value in [None, ""]:
            raise HTTPException(status_code=422, detail=f"El campo '{field}' es obligatorio y no puede estar vacío.")
    try:
        # Crea directamente el Forum (hereda de Source)
        new_forum = Forum(
            name=forum_data.name,
            description=forum_data.description,
            type="forum",
            nature=forum_data.nature,
            status=forum_data.status,
            author=forum_data.author,
            country=forum_data.country,
            language=forum_data.language,
            associated_domains=forum_data.associated_domains,
            owner=forum_data.owner,
            monitored=forum_data.monitored,
            discovery_source=forum_data.discovery_source,
            user_count=forum_data.user_count,
            post_count=forum_data.post_count,
            thread_count=forum_data.thread_count,
            last_member=forum_data.last_member,
            categories=forum_data.categories,
        )
        db.add(new_forum)
        await db.commit()
        await db.refresh(new_forum)
        return new_forum
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Error de integridad en la base de datos. Revisa los campos obligatorios.")

async def create_forum_post(db: AsyncSession, post: ForumPostCreate):
    db_post = ForumPost(**post.dict())
    db.add(db_post)
    await db.commit()
    await db.refresh(db_post)
    return db_post

async def update_post_image(db: AsyncSession, post_id: str, image_path: str):
    result = await db.execute(select(ForumPost).where(ForumPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise Exception("Post not found")
    setattr(post, "image_path", image_path)
    await db.commit()
    await db.refresh(post)
    return post
