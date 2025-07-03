from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "postgresql+asyncpg://OscarGranados:Ogr_1181%24%21@localhost:5433/inteligencia"
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
