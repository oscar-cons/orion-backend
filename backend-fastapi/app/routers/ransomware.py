from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from .. import crud, schemas, models
from typing import List
from sqlalchemy.orm import selectinload
from uuid import UUID


router = APIRouter()

@router.post("/ransomware/", response_model=schemas.RansomwareGroupEntryOut)
async def create_ransomware_entry(
    ransomware: schemas.RansomwareGroupEntryCreate,
    db: AsyncSession = Depends(get_db)
):
    return await crud.create_ransomware_group_entry(db, ransomware)

@router.post("/ransomware/nocodb/", response_model=dict)
async def create_ransomware_from_nocodb(
    nocodb_data: dict,
    db: AsyncSession = Depends(get_db)
):
    """
    Create ransomware entry directly from NocoDB data.
    This endpoint intelligently creates groups when they don't exist.
    """
    return await crud.create_ransomware_entry_from_nocodb(db, nocodb_data)

@router.get("/ransomware/groups", response_model=List[schemas.RansomwareGroupOut])
async def get_ransomware_groups(db: AsyncSession = Depends(get_db)):
    """
    Devuelve todos los grupos de ransomware registrados.
    """
    result = await db.execute(select(models.RansomwareGroup))
    groups = result.scalars().all()
    return groups

@router.get("/ransomware/entries", response_model=List[schemas.RansomwareEntryOut])
async def get_all_ransomware_entries(db: AsyncSession = Depends(get_db)):
    """
    Devuelve todas las entradas de ransomware asociadas a cualquier grupo.
    """
    result = await db.execute(
        select(models.RansomwareEntry).options(selectinload(models.RansomwareEntry.group))
    )
    entries = result.scalars().all()
    
    # Manually populate group_name from the relationship
    for entry in entries:
        entry.group_name = entry.group.group_name if entry.group else None
    
    return entries

@router.get("/ransomware/groups/{group_id}/entries", response_model=List[schemas.RansomwareEntryOut])
async def get_entries_by_group_id(group_id: UUID, db: AsyncSession = Depends(get_db)):
    """
    Devuelve todas las entradas de ransomware asociadas a un grupo específico por ID.
    """
    result = await db.execute(
        select(models.RansomwareEntry)
        .where(models.RansomwareEntry.group_id == group_id)
        .options(selectinload(models.RansomwareEntry.group))
    )
    entries = result.scalars().all()

    if not entries:
        # Opcional: puedes verificar si el grupo existe
        group_check = await db.execute(
            select(models.RansomwareGroup).where(models.RansomwareGroup.id == group_id)
        )
        if not group_check.scalar():
            raise HTTPException(status_code=404, detail="Grupo de ransomware no encontrado.")

    # Manually populate group_name from the relationship
    for entry in entries:
        entry.group_name = entry.group.group_name if entry.group else None

    return entries

@router.get("/ransomware/groups/name/{group_name}/entries", response_model=List[schemas.RansomwareEntryOut])
async def get_entries_by_group_name(group_name: str, db: AsyncSession = Depends(get_db)):
    """
    Devuelve todas las entradas de ransomware asociadas a un grupo específico por nombre.
    """
    result = await db.execute(
        select(models.RansomwareEntry)
        .join(models.RansomwareGroup)
        .where(models.RansomwareGroup.group_name == group_name)
        .options(selectinload(models.RansomwareEntry.group))
    )
    entries = result.scalars().all()

    if not entries:
        # Check if group exists
        group_check = await db.execute(
            select(models.RansomwareGroup).where(models.RansomwareGroup.group_name == group_name)
        )
        if not group_check.scalar():
            raise HTTPException(status_code=404, detail=f"Grupo de ransomware '{group_name}' no encontrado.")

    # Manually populate group_name from the relationship
    for entry in entries:
        entry.group_name = entry.group.group_name if entry.group else None

    return entries

@router.get("/ransomware/stats", response_model=dict)
async def get_ransomware_stats(db: AsyncSession = Depends(get_db)):
    """
    Get statistics about ransomware groups and entries.
    """
    # Count groups
    groups_result = await db.execute(select(models.RansomwareGroup))
    groups = groups_result.scalars().all()
    
    # Count entries
    entries_result = await db.execute(select(models.RansomwareEntry))
    entries = entries_result.scalars().all()
    
    # Count entries per group
    entries_per_group = {}
    for group in groups:
        group_entries_result = await db.execute(
            select(models.RansomwareEntry).where(models.RansomwareEntry.group_id == group.id)
        )
        group_entries = group_entries_result.scalars().all()
        entries_per_group[group.group_name] = len(group_entries)
    
    return {
        "total_groups": len(groups),
        "total_entries": len(entries),
        "entries_per_group": entries_per_group,
        "groups": [{"id": str(g.id), "name": g.group_name} for g in groups]
    }

@router.get("/ransomware/groups/{group_id}", response_model=schemas.RansomwareGroupOut)
async def get_ransomware_group_by_id(group_id: UUID, db: AsyncSession = Depends(get_db)):
    """
    Get a specific ransomware group by ID.
    """
    result = await db.execute(
        select(models.RansomwareGroup).where(models.RansomwareGroup.id == group_id)
    )
    group = result.scalar_one_or_none()
    
    if not group:
        raise HTTPException(status_code=404, detail="Ransomware group not found.")
    
    return group

@router.get("/ransomware/entries/{entry_id}", response_model=schemas.RansomwareEntryOut)
async def get_ransomware_entry_by_id(entry_id: UUID, db: AsyncSession = Depends(get_db)):
    """
    Get a specific ransomware entry by ID.
    """
    result = await db.execute(
        select(models.RansomwareEntry)
        .where(models.RansomwareEntry.id == entry_id)
        .options(selectinload(models.RansomwareEntry.group))
    )
    entry = result.scalar_one_or_none()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Ransomware entry not found.")
    
    # Manually populate group_name from the relationship
    entry.group_name = entry.group.group_name if entry.group else None
    
    return entry

@router.patch("/ransomware/entries/{entry_id}", response_model=schemas.RansomwareEntryOut)
async def update_ransomware_entry(
    entry_id: UUID, 
    entry_update: dict, 
    db: AsyncSession = Depends(get_db)
):
    """
    Update a specific ransomware entry by ID.
    """
    result = await db.execute(
        select(models.RansomwareEntry)
        .where(models.RansomwareEntry.id == entry_id)
        .options(selectinload(models.RansomwareEntry.group))
    )
    entry = result.scalar_one_or_none()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Ransomware entry not found.")
    
    # Update only the fields that are provided
    for field, value in entry_update.items():
        if hasattr(entry, field):
            setattr(entry, field, value)
    
    await db.commit()
    await db.refresh(entry)
    
    # Manually populate group_name from the relationship
    entry.group_name = entry.group.group_name if entry.group else None
    
    return entry

@router.delete("/ransomware/entries/{entry_id}")
async def delete_ransomware_entry(entry_id: UUID, db: AsyncSession = Depends(get_db)):
    """
    Delete a specific ransomware entry by ID.
    """
    result = await db.execute(
        select(models.RansomwareEntry).where(models.RansomwareEntry.id == entry_id)
    )
    entry = result.scalar_one_or_none()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Ransomware entry not found.")
    
    await db.delete(entry)
    await db.commit()
    
    return {"message": "Ransomware entry deleted successfully."}