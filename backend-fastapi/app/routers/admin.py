from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from .. import models

router = APIRouter()

@router.delete("/admin/clear-all-tables")
async def clear_all_tables(db: AsyncSession = Depends(get_db)):
    # Borrar primero las tablas dependientes
    await db.execute(models.ForumPost.__table__.delete())
    await db.execute(models.Forum.__table__.delete())
    await db.execute(models.RansomwareEntry.__table__.delete())
    await db.execute(models.RansomwareGroup.__table__.delete())
    await db.execute(models.Telegram.__table__.delete())
    await db.execute(models.Source.__table__.delete())
    await db.commit()
    return {"detail": "Todas las tablas han sido vaciadas correctamente"} 