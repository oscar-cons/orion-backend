from fastapi import APIRouter, Depends, HTTPException, Path, Query, Response
from fastapi.responses import FileResponse
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_, Date, cast, DateTime
from ..database import get_db
from .. import crud, schemas, models
from ..schemas import ForumPostCreate, ForumPostOut, ForumOut, ForumCreate, RansomwareOut, SourceOut
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

@router.get("/forum-posts/{post_id}/screenshot")
async def get_forum_post_screenshot(post_id: str):
    screenshots_dir = os.path.join(os.path.dirname(__file__), '../../screenshots')
    # Buscar por extensiones comunes
    for ext in [".png", ".jpg", ".jpeg", ".webp"]:
        image_path = os.path.abspath(os.path.join(screenshots_dir, f"{post_id}{ext}"))
        if os.path.isfile(image_path):
            return FileResponse(image_path, media_type=f"image/{ext.lstrip('.')}")
    raise HTTPException(status_code=404, detail="Screenshot not found")

@router.delete("/delete-forum-posts")
async def delete_forum_posts(forum_id: UUID = Query(...), db: AsyncSession = Depends(get_db)):
    await db.execute(models.ForumPost.__table__.delete().where(models.ForumPost.forum_id == forum_id))
    await db.commit()
    return {"detail": "Entradas eliminadas correctamente"}

@router.get("/search", response_model=dict)
async def global_search(
    q: str = Query(None, description="Término de búsqueda global"),
    entity: str = Query(None, description="Filtrar por entidad (separadas por coma): forum-posts,ransomware,telegram"),
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

    # Search in Ransomware
    if not entities or "ransomware" in entities:
        query = select(models.Ransomware)
        if is_q_search:
            query = query.where(
                or_(
                    models.Ransomware.BreachName.ilike(f"%{q}%"),
                    models.Ransomware.Domain.ilike(f"%{q}%"),
                    models.Ransomware.Category.ilike(f"%{q}%"),
                    models.Ransomware.Country.ilike(f"%{q}%"),
                    models.Ransomware.Group.ilike(f"%{q}%")
                )
            )
        
        query, filters_applied = apply_filters(query, models.Ransomware, filter)
        
        if is_q_search or filters_applied:
            ransomware = await db.execute(query)
            results["ransomware"] = [schemas.RansomwareOut.from_orm(r) for r in ransomware.scalars().all()]
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

# ...otros endpoints relacionados a foros...