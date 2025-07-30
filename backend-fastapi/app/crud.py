from .models import ForumPost, Forum, Source, MonitoredEnum, RansomwareGroup, RansomwareEntry, Telegram
from .schemas import ForumPostCreate, SourceCreate, ForumCreate, RansomwareGroupEntryOut, RansomwareEntryCreate, RansomwareGroupOut, RansomwareEntryOut, RansomwareGroupEntryCreate
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.future import select
from uuid import uuid4
from datetime import datetime

def serialize_ransomware_group(group: RansomwareGroup) -> dict:
    """Serialize RansomwareGroup model to dictionary."""
    return {
        "id": str(group.id),
        "group_name": group.group_name,
        "name": group.name,
        "description": group.description,
        "type": group.type,
        "nature": group.nature,
        "status": group.status,
        "author": group.author,
        "country": group.country,
        "language": group.language,
        "associated_domains": group.associated_domains,
        "owner": group.owner,
        "monitored": group.monitored,
        "discovery_source": group.discovery_source
    }

def serialize_ransomware_entry(entry: RansomwareEntry) -> dict:
    """Serialize RansomwareEntry model to dictionary."""
    return {
        "id": str(entry.id),
        "group_id": str(entry.group_id),
        "BreachName": entry.BreachName,
        "Domain": entry.Domain,
        "Rank": entry.Rank,
        "Category": entry.Category,
        "DetectionDate": entry.DetectionDate.isoformat() if entry.DetectionDate else None,
        "Country": entry.Country,
        "OriginalSource": entry.OriginalSource,
        "Download": entry.Download
    }

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



async def create_ransomware_group_entry(db: AsyncSession, ransomware_data: RansomwareGroupEntryCreate):
    # Campos obligatorios para el grupo, excepto group_name que es manejado aparte
    required_group_fields = [
        "type", "author", "country",
        "language", "status", "monitored", "name",
        "description", "nature", "associated_domains",
        "owner", "discovery_source"
    ]

    group_input = ransomware_data.group

    # Validar group_name explícitamente
    if not getattr(group_input, "group_name", None):
        raise HTTPException(status_code=422, detail="El campo 'group_name' del grupo es obligatorio y no puede estar vacío.")

    # Construir diccionario con defaults para campos faltantes en group
    group_data = {"group_name": group_input.group_name}
    for field in required_group_fields:
        value = getattr(group_input, field, None)
        if value is None or (isinstance(value, str) and value.strip() == ""):
            if field == "status":
                group_data[field] = False
            elif field == "associated_domains":
                group_data[field] = []
            elif field == "monitored":
                group_data[field] = "unknown"
            else:
                group_data[field] = "unknown"
        else:
            group_data[field] = value

    # Validar campos obligatorios en la entrada con los nombres exactos
    required_entry_fields = ["BreachName", "DetectionDate"]
    for field in required_entry_fields:
        if not getattr(ransomware_data.entry, field, None):
            raise HTTPException(status_code=422, detail=f"El campo '{field}' de la entrada es obligatorio y no puede estar vacío.")

    try:
        # Buscar grupo existente
        result = await db.execute(select(RansomwareGroup).where(RansomwareGroup.group_name == group_data["group_name"]))
        existing_group = result.scalar_one_or_none()

        if existing_group:
            group = existing_group
        else:
            group = RansomwareGroup(
                id=uuid4(),
                group_name=group_data["group_name"],
                name=group_data["name"],
                description=group_data["description"],
                type=group_data["type"],
                nature=group_data["nature"],
                status=group_data["status"],
                author=group_data["author"],
                country=group_data["country"],
                language=group_data["language"],
                associated_domains=group_data["associated_domains"],
                owner=group_data["owner"],
                monitored=group_data["monitored"],
                discovery_source=group_data["discovery_source"],
            )
            db.add(group)
            await db.flush()

        new_entry = RansomwareEntry(
            id=uuid4(),
            group_id=group.id,
            BreachName=ransomware_data.entry.BreachName,
            Domain=ransomware_data.entry.Domain,
            Rank=ransomware_data.entry.Rank,
            Category=ransomware_data.entry.Category,
            DetectionDate=ransomware_data.entry.DetectionDate,
            Country=ransomware_data.entry.Country,
            OriginalSource=ransomware_data.entry.OriginalSource,
            Download=ransomware_data.entry.Download,
        )
        db.add(new_entry)
        await db.commit()
        await db.refresh(group)
        await db.refresh(new_entry)

        return RansomwareGroupEntryOut(
            group=RansomwareGroupOut.model_validate(group),
            entry=RansomwareEntryOut(
                id=new_entry.id,
                group_id=new_entry.group_id,
                group_name=group.group_name,  # <- Aquí lo añadimos a mano
                BreachName=new_entry.BreachName,
                Domain=new_entry.Domain,
                Rank=new_entry.Rank,
                Category=new_entry.Category,
                DetectionDate=new_entry.DetectionDate,
                Country=new_entry.Country,
                OriginalSource=new_entry.OriginalSource,
                Download=new_entry.Download,
            )
        )
        
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Error de integridad en la base de datos.")

async def create_ransomware_entry_from_nocodb(db: AsyncSession, nocodb_data: dict):
    """
    Create ransomware entry from NocoDB data with intelligent group handling.
    This function creates groups only when they don't exist and uses sensible defaults.
    """
    try:
        # Filter out unwanted NocoDB fields
        unwanted_fields = ['Id', 'CreatedAt', 'UpdatedAt']
        filtered_data = {k: v for k, v in nocodb_data.items() if k not in unwanted_fields}
        
        # Extract and validate required data from NocoDB
        breach_name = filtered_data.get("BreachName")
        detection_date = filtered_data.get("DetectionDate")
        group_name = filtered_data.get("Group")
        
        if not breach_name or not detection_date or not group_name:
            raise HTTPException(
                status_code=422, 
                detail="Missing required fields: BreachName, DetectionDate, or Group"
            )
        
        # Validate detection_date format
        try:
            if isinstance(detection_date, str):
                # Handle different date formats from NocoDB
                if 'T' in detection_date:
                    # ISO format with T
                    detection_date = datetime.fromisoformat(detection_date.replace('Z', '+00:00'))
                elif '+' in detection_date:
                    # Format like '2023-07-13 00:00:00+00:00'
                    detection_date = datetime.fromisoformat(detection_date)
                else:
                    # Simple date format, assume UTC
                    detection_date = datetime.fromisoformat(detection_date + '+00:00')
            elif isinstance(detection_date, datetime):
                # Already a datetime object
                pass
            else:
                raise ValueError(f"Unsupported date format: {type(detection_date)}")
        except ValueError as e:
            raise HTTPException(
                status_code=422,
                detail=f"Invalid DetectionDate format: {detection_date}. Error: {str(e)}"
            )
        
        # Check if group already exists
        result = await db.execute(
            select(RansomwareGroup).where(RansomwareGroup.group_name == group_name)
        )
        existing_group = result.scalar_one_or_none()
        
        # Check if entry already exists (same group, breach name, and detection date)
        existing_entry_result = await db.execute(
            select(RansomwareEntry)
            .join(RansomwareGroup)
            .where(
                RansomwareGroup.group_name == group_name,
                RansomwareEntry.BreachName == breach_name,
                RansomwareEntry.DetectionDate == detection_date
            )
        )
        existing_entry = existing_entry_result.scalar_one_or_none()
        
        if existing_entry:
            return {
                "group": {
                    "id": str(existing_entry.group.id),
                    "group_name": existing_entry.group.group_name,
                    "name": existing_entry.group.name,
                    "description": existing_entry.group.description,
                    "type": existing_entry.group.type,
                    "nature": existing_entry.group.nature,
                    "status": existing_entry.group.status,
                    "author": existing_entry.group.author,
                    "country": existing_entry.group.country,
                    "language": existing_entry.group.language,
                    "associated_domains": existing_entry.group.associated_domains,
                    "owner": existing_entry.group.owner,
                    "monitored": existing_entry.group.monitored,
                    "discovery_source": existing_entry.group.discovery_source
                },
                "entry": {
                    "id": str(existing_entry.id),
                    "group_id": str(existing_entry.group_id),
                    "BreachName": existing_entry.BreachName,
                    "Domain": existing_entry.Domain,
                    "Rank": existing_entry.Rank,
                    "Category": existing_entry.Category,
                    "DetectionDate": existing_entry.DetectionDate.isoformat(),
                    "Country": existing_entry.Country,
                    "OriginalSource": existing_entry.OriginalSource,
                    "Download": existing_entry.Download
                },
                "group_created": False,
                "entry_created": False,
                "message": "Entry already exists"
            }
        
        if existing_group:
            group = existing_group
        else:
            # Create new group with sensible defaults based on NocoDB data
            country = filtered_data.get("Country")
            domain = filtered_data.get("Domain")
            
            # Ensure all required fields have valid values
            if not country or country.strip() == "":
                country = "Unknown"
            
            # Validate that we have all required fields for Source
            group_data = {
                "id": uuid4(),
                "group_name": group_name,
                "name": group_name,  # Use group name as the source name
                "description": f"Auto-generated from NocoDB for group {group_name}",
                "type": "ransomware_group",
                "nature": "ransomware",  # Default nature for ransomware groups
                "status": True,  # Active by default
                "author": "nocodb-sync",  # Indicate this was created by sync
                "country": country,
                "language": "en",  # Default language
                "associated_domains": [domain] if domain else [],
                "owner": "unknown",
                "monitored": "YES_AUTOMATED",  # Mark as automated monitoring
                "discovery_source": "nocodb-sync"
            }
            
            # Validate required fields
            required_fields = ["name", "type", "author", "country", "language"]
            for field in required_fields:
                if not group_data.get(field) or str(group_data[field]).strip() == "":
                    raise HTTPException(
                        status_code=422,
                        detail=f"Required field '{field}' is missing or empty for group creation"
                    )
            
            group = RansomwareGroup(**group_data)
            db.add(group)
            await db.flush()  # Flush to get the ID
        
        # Create the ransomware entry
        new_entry = RansomwareEntry(
            id=uuid4(),
            group_id=group.id,
            BreachName=breach_name,
            Domain=filtered_data.get("Domain"),
            Rank=filtered_data.get("Rank"),
            Category=filtered_data.get("Category"),
            DetectionDate=detection_date,
            Country=filtered_data.get("Country"),
            OriginalSource=filtered_data.get("OriginalSource"),
            Download=filtered_data.get("Download"),
        )
        db.add(new_entry)
        await db.commit()
        await db.refresh(group)
        await db.refresh(new_entry)
        
        return {
            "group": {
                "id": str(group.id),
                "group_name": group.group_name,
                "name": group.name,
                "description": group.description,
                "type": group.type,
                "nature": group.nature,
                "status": group.status,
                "author": group.author,
                "country": group.country,
                "language": group.language,
                "associated_domains": group.associated_domains,
                "owner": group.owner,
                "monitored": group.monitored,
                "discovery_source": group.discovery_source
            },
            "entry": {
                "id": str(new_entry.id),
                "group_id": str(new_entry.group_id),
                "BreachName": new_entry.BreachName,
                "Domain": new_entry.Domain,
                "Rank": new_entry.Rank,
                "Category": new_entry.Category,
                "DetectionDate": new_entry.DetectionDate.isoformat(),
                "Country": new_entry.Country,
                "OriginalSource": new_entry.OriginalSource,
                "Download": new_entry.Download
            },
            "group_created": existing_group is None,
            "entry_created": True,
            "message": "Entry created successfully"
        }
        
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Error de integridad en la base de datos.")

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
