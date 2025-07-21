from .models import ForumPost, Forum, Source, MonitoredEnum, Ransomware, Telegram
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
    db_post = ForumPost(
        forum_id=post.forum_id,
        url=post.url,
        title=post.title,
        author_username=post.author_username,
        content=post.content,
        category=post.category,
        comments=post.comments,
        number_comments=post.number_comments,
        date=post.date
    )
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

async def create_ransomware(db: AsyncSession, ransomware_data):
    required_fields = ["name", "type", "author", "country", "language", "status", "monitored"]
    for field in required_fields:
        value = getattr(ransomware_data, field, None)
        if value in [None, ""]:
            raise HTTPException(status_code=422, detail=f"El campo '{field}' es obligatorio y no puede estar vacío.")
    try:
        new_ransomware = Ransomware(
            name=ransomware_data.name,
            description=ransomware_data.description,
            type="ransomware",
            nature=ransomware_data.nature,
            status=ransomware_data.status,
            author=ransomware_data.author,
            country=ransomware_data.country,
            language=ransomware_data.language,
            associated_domains=ransomware_data.associated_domains,
            owner=ransomware_data.owner,
            monitored=ransomware_data.monitored,
            discovery_source=ransomware_data.discovery_source,
            group_name=ransomware_data.group_name,
            leak_site=ransomware_data.leak_site,
            victim_count=ransomware_data.victim_count,
            last_leak=ransomware_data.last_leak,
        )
        db.add(new_ransomware)
        await db.commit()
        await db.refresh(new_ransomware)
        return new_ransomware
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Error de integridad en la base de datos. Revisa los campos obligatorios.")

async def create_telegram(db: AsyncSession, telegram_data):
    required_fields = ["name", "type", "author", "country", "language", "status", "monitored"]
    for field in required_fields:
        value = getattr(telegram_data, field, None)
        if value in [None, ""]:
            raise HTTPException(status_code=422, detail=f"El campo '{field}' es obligatorio y no puede estar vacío.")
    try:
        new_telegram = Telegram(
            name=telegram_data.name,
            description=telegram_data.description,
            type="telegram",
            nature=telegram_data.nature,
            status=telegram_data.status,
            author=telegram_data.author,
            country=telegram_data.country,
            language=telegram_data.language,
            associated_domains=telegram_data.associated_domains,
            owner=telegram_data.owner,
            monitored=telegram_data.monitored,
            discovery_source=telegram_data.discovery_source,
            channel_username=telegram_data.channel_username,
            member_count=telegram_data.member_count,
            last_message_date=telegram_data.last_message_date,
        )
        db.add(new_telegram)
        await db.commit()
        await db.refresh(new_telegram)
        return new_telegram
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Error de integridad en la base de datos. Revisa los campos obligatorios.")
