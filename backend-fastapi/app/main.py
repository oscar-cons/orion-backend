from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import SessionLocal, engine, Base
from .routers import forum, source

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

app.include_router(forum.router)
app.include_router(source.router)

@app.post("/mockup-data/")
async def create_mockup_data_route():
    from .database import create_mockup_data
    await create_mockup_data()
    return {"message": "Mockup data created."}
