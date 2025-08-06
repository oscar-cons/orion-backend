import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker, declarative_base

# Database configuration with environment variables - NO DEFAULTS for security
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "inteligencia")

# Validate required environment variables
if not DB_USER or not DB_PASSWORD:
    raise ValueError("DB_USER and DB_PASSWORD environment variables must be set")

DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_async_engine(DATABASE_URL, echo=True)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)
Base = declarative_base()

async def get_db():
    async with SessionLocal() as session:
        yield session

async def create_mockup_data():
    from .models import Forum, ForumPost, MonitoredEnum
    async with SessionLocal() as session:
        # Crea un Forum directamente (hereda de Source)
        forum = Forum(
            name="Test Source",
            description="A test source for mockup.",
            type="forum",
            nature="credentials",
            status=True,
            author="admin",
            country="US",
            language="en",
            associated_domains=["example.com", "test.com"],
            owner="admin",
            monitored=MonitoredEnum.NO,
            discovery_source="manual",
            user_count=10,
            post_count=5,
            thread_count=2,
            last_member="user123",
            categories=["General", "News"]
        )
        session.add(forum)
        await session.flush()
        # Crea un ForumPost relacionado
        post = ForumPost(
            forum_id=forum.id,
            url="https://example.com/post/1",
            title="Welcome Post",
            content="This is a welcome post.",
            image_path=None
        )
        session.add(post)
        await session.commit()
