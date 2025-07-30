from fastapi import APIRouter, Depends, HTTPException, Path, Query, Response, Body
from fastapi.responses import FileResponse
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_, Date, cast, DateTime
from sqlalchemy.orm import selectinload
from ..database import get_db
from .. import crud, schemas, models

from uuid import UUID
from typing import List
from datetime import datetime, timedelta, timezone

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

@router.get("/forums/{forum_id}", response_model=schemas.ForumOut)
async def get_forum(forum_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Forum).where(models.Forum.id == forum_id))
    forum = result.scalar_one_or_none()
    if forum is None:
        raise HTTPException(status_code=404, detail="Forum not found")
    return forum

@router.get("/forums/{forum_id}/posts", response_model=list[schemas.ForumPostOut])
async def get_forum_posts(forum_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.ForumPost).where(models.ForumPost.forum_id == forum_id))
    posts = result.scalars().all()
    return posts



@router.get("/forum-posts/{post_id}", response_model=schemas.ForumPostOut)
async def get_forum_post(post_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.ForumPost).where(models.ForumPost.id == post_id))
    post = result.scalar_one_or_none()
    if post is None:
        raise HTTPException(status_code=404, detail="Forum post not found")
    return post

@router.patch("/forum-posts/{post_id}", response_model=schemas.ForumPostOut)
async def update_forum_post(post_id: UUID, data: dict = Body(...), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.ForumPost).where(models.ForumPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Forum post not found")
    for key, value in data.items():
        if hasattr(post, key):
            setattr(post, key, value)
    await db.commit()
    await db.refresh(post)
    return post

@router.get("/forum-posts/{post_id}/screenshot")
async def get_forum_post_screenshot(post_id: str, db: AsyncSession = Depends(get_db)):
    print(f"--- DEBUG: Received request for screenshot for post_id: {post_id} ---")
    from uuid import UUID
    try:
        post_uuid = UUID(post_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid post_id format")

    result = await db.execute(select(models.ForumPost).where(models.ForumPost.id == post_uuid))
    post = result.scalar_one_or_none()

    if not post:
        print("--- DEBUG: Post not found in database. ---")
        raise HTTPException(status_code=404, detail="Post not found in DB")

    print(f"--- DEBUG: Post found. Checking for screenshotUrl... ---")
    
    custom_path = getattr(post, "screenshotUrl", None)

    if custom_path:
        # Limpiar la ruta de comillas y espacios extra
        cleaned_path = custom_path.strip().strip('\'"')
        print(f"--- DEBUG: screenshotUrl found in DB: '{custom_path}' ---")
        print(f"--- DEBUG: Cleaned path for check: '{cleaned_path}' ---")
        
        normalized_path = os.path.normpath(cleaned_path)
        print(f"--- DEBUG: Normalized path: '{normalized_path}' ---")

        file_exists = os.path.isfile(normalized_path)
        print(f"--- DEBUG: os.path.isfile() on normalized path returned: {file_exists} ---")

        if file_exists:
            ext = os.path.splitext(normalized_path)[1].lstrip(".")
            print(f"--- DEBUG: File exists. Serving file. ---")
            return FileResponse(normalized_path, media_type=f"image/{ext}")
        else:
            print(f"--- DEBUG: File does not exist at path: '{normalized_path}' ---")
    else:
        print("--- DEBUG: screenshotUrl not found or is empty in the database. ---")

    print("--- DEBUG: Falling back to old logic (searching in screenshots/ directory)... ---")
    screenshots_dir = os.path.join(os.path.dirname(__file__), '../../screenshots')
    for ext in [".png", ".jpg", ".jpeg", ".webp"]:
        image_path = os.path.abspath(os.path.join(screenshots_dir, f"{post_id}{ext}"))
        if os.path.isfile(image_path):
            print(f"--- DEBUG: Found file in fallback directory: {image_path} ---")
            return FileResponse(image_path, media_type=f"image/{ext.lstrip('.')}")
    
    print("--- DEBUG: Screenshot not found in custom path or fallback directory. Raising 404. ---")
    raise HTTPException(status_code=404, detail="Screenshot not found")

@router.delete("/delete-forum-posts")
async def delete_forum_posts(forum_id: UUID = Query(...), db: AsyncSession = Depends(get_db)):
    await db.execute(models.ForumPost.__table__.delete().where(models.ForumPost.forum_id == forum_id))
    await db.commit()
    return {"detail": "Entradas eliminadas correctamente"}

@router.delete("/forum-posts/{post_id}")
async def delete_forum_post(post_id: UUID, db: AsyncSession = Depends(get_db)):
    # Query the database for the post by ID
    result = await db.execute(select(models.ForumPost).where(models.ForumPost.id == post_id))
    post = result.scalar_one_or_none()

    # If post does not exist, return 404 error
    if not post:
        raise HTTPException(status_code=404, detail="Forum post not found")

    # Delete the post and commit the transaction
    await db.delete(post)
    await db.commit()

    return {"detail": "Forum post deleted successfully"}

@router.get("/search", response_model=dict)
async def global_search(
    q: str = Query(None, description="Término de búsqueda global"),
    entity: str = Query(None, description="Filtrar por entidad (separadas por coma): forum-posts,ransomware-group-entry,telegram"),
    filter: List[str] = Query([], description="Filtros avanzados en formato campo:operador:valor"),
    db: AsyncSession = Depends(get_db)
):
    def apply_filters(query, model, filters):
        valid_conditions = []
        for f in filters:
            try:
                field, op, value = f.split(":", 2)
                if hasattr(model, field):
                    column = getattr(model, field)
                    # Comprobar si es un campo de fecha
                    if isinstance(column.type, (Date, DateTime)):
                        try:
                            # Convertir string YYYY-MM-DD a un objeto datetime
                            filter_dt = datetime.strptime(value, "%Y-%m-%d")
                            
                            # Crear un rango de día completo en UTC para la comparación
                            day_start_utc = filter_dt.replace(tzinfo=timezone.utc)
                            day_end_utc = day_start_utc + timedelta(days=1)

                            if op == "on":
                                valid_conditions.append(and_(column >= day_start_utc, column < day_end_utc))
                            elif op == "before":
                                valid_conditions.append(column < day_start_utc)
                            elif op == "after":
                                valid_conditions.append(column >= day_end_utc)
                        except ValueError:
                            continue # Ignorar filtro de fecha con formato incorrecto
                    else: # Lógica para campos de texto
                        if op == "contains":
                            valid_conditions.append(column.ilike(f"%{value}%"))
                        elif op == "equals":
                            valid_conditions.append(column == value)
                        elif op == "startsWith":
                            valid_conditions.append(column.ilike(f"{value}%"))
                        elif op == "endsWith":
                            valid_conditions.append(column.ilike(f"%{value}"))
            except ValueError:
                continue
        
        if valid_conditions:
            return query.where(and_(*valid_conditions)), True
        return query, False

    results = {}
    entities = [e.strip() for e in entity.split(',')] if entity else []
    is_q_search = q and q.strip() != ""

    # Search in ForumPost
    if not entities or "forum-posts" in entities:
        query = select(models.ForumPost)
        if is_q_search:
            query = query.where(
                or_(
                    models.ForumPost.title.ilike(f"%{q}%"),
                    models.ForumPost.content.ilike(f"%{q}%"),
                    models.ForumPost.author_username.ilike(f"%{q}%"),
                    models.ForumPost.category.ilike(f"%{q}%"),
                    models.ForumPost.url.ilike(f"%{q}%")
                )
            )
        
        query, filters_applied = apply_filters(query, models.ForumPost, filter)
        
        if is_q_search or filters_applied:
            forum_posts = await db.execute(query)
            results["forum-posts"] = [schemas.ForumPostOut.from_orm(fp) for fp in forum_posts.scalars().all()]
        else:
            results["forum-posts"] = []

    # Search in Ransomware Entries
    if not entities or "ransomware" in entities:
        query = select(models.RansomwareEntry).options(selectinload(models.RansomwareEntry.group))

        if is_q_search:
            query = query.where(
                or_(
                    models.RansomwareEntry.BreachName.ilike(f"%{q}%"),
                    models.RansomwareEntry.Domain.ilike(f"%{q}%"),
                    models.RansomwareEntry.Category.ilike(f"%{q}%"),
                    models.RansomwareEntry.Country.ilike(f"%{q}%"),
                    models.RansomwareGroup.group_name.ilike(f"%{q}%")  # Relación
                )
            )

        # Aplica filtros sobre RansomwareEntry (puedes extender apply_filters para incluir joins si necesario)
        query, filters_applied = apply_filters(query, models.RansomwareEntry, filter)

        if is_q_search or filters_applied:
            result = await db.execute(query)
            entries = result.scalars().all()
            results["ransomware"] = [schemas.RansomwareEntryOut.from_orm(e) for e in entries]
        else:
            results["ransomware"] = []

    # Search in Telegram
    if hasattr(models, "Telegram") and (not entities or "telegram" in entities):
        query = select(models.Telegram)
        if is_q_search:
            query = query.where(
                or_(
                    models.Telegram.name.ilike(f"%{q}%"),
                    models.Telegram.description.ilike(f"%{q}%"),
                    models.Telegram.author.ilike(f"%{q}%"),
                    models.Telegram.country.ilike(f"%{q}%"),
                    models.Telegram.language.ilike(f"%{q}%"),
                    models.Telegram.channel_username.ilike(f"%{q}%")
                )
            )
        
        query, filters_applied = apply_filters(query, models.Telegram, filter)

        if is_q_search or filters_applied:
            telegrams = await db.execute(query)
            results["telegram"] = [dict(t.__dict__) for t in telegrams.scalars().all()]
        else:
            results["telegram"] = []
            
    return results

