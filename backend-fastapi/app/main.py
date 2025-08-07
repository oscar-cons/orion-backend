from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .database import SessionLocal, engine, Base
from .routers import forum, source, admin, ai, ransomware
import subprocess
import os
import sys

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # O especifica ["http://localhost:3000"] si usas Next.js ahí
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "orion-backend-api"}

@app.post("/init-database/")
async def initialize_database():
    """
    Initialize the database by running Alembic migrations.
    This endpoint will create all tables and apply all migrations.
    """
    try:
        # Set environment variables for Alembic
        env = os.environ.copy()
        
        # Run Alembic upgrade head
        result = subprocess.run(
            ["python", "-m", "alembic", "upgrade", "head"],
            capture_output=True,
            text=True,
            env=env,
            cwd="/app/backend-fastapi"  # Ensure we're in the correct directory
        )
        
        if result.returncode == 0:
            return {
                "status": "success",
                "message": "Database initialized successfully",
                "output": result.stdout
            }
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to initialize database: {result.stderr}"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error initializing database: {str(e)}"
        )


app.include_router(forum.router)
app.include_router(source.router)
app.include_router(ransomware.router)
app.include_router(admin.router)
app.include_router(ai.router)

@app.post("/mockup-data/")
async def create_mockup_data_route():
    from .database import create_mockup_data
    await create_mockup_data()
    return {"message": "Mockup data created."}
