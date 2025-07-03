from sqlalchemy import Column, String, Boolean, ForeignKey, Integer, DateTime, Enum, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from .database import Base
from sqlalchemy.orm import relationship
import enum

class MonitoredEnum(enum.Enum):
    YES_MANUAL = "yes manual"
    YES_AUTOMATED = "yes automated"
    NO = "No"

class Source(Base):
    __tablename__ = "sources"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    type = Column(String, nullable=False)  # Discriminator: 'forum', 'other', etc.
    nature = Column(String, nullable=True)  # Tags like 'credentials', 'hacking', 'ransomware', can be empty
    status = Column(Boolean, nullable=False, server_default="true")  # "active" or "inactive"
    author = Column(String, nullable=False)
    country = Column(String, nullable=False)
    language = Column(String, nullable=False)
    associated_domains = Column(ARRAY(String), nullable=True)  # Array of domains
    owner = Column(String, nullable=True)
    monitored = Column(Enum(MonitoredEnum), nullable=False, default=MonitoredEnum.NO)
    discovery_source = Column(String, nullable=True)
    __mapper_args__ = {
        "polymorphic_identity": "source",
        "polymorphic_on": type,
    }


class Forum(Source):
    __tablename__ = "forums"
    id = Column(UUID(as_uuid=True), ForeignKey("sources.id"), primary_key=True)
    user_count = Column(Integer, nullable=False, server_default="0")
    post_count = Column(Integer, nullable=False, server_default="0")
    thread_count = Column(Integer, nullable=False, server_default="0")
    last_member = Column(String, nullable=True)
    categories = Column(ARRAY(String), nullable=True)  # Array of categories
    posts = relationship("ForumPost", back_populates="forum", cascade="all, delete-orphan")
    __mapper_args__ = {
        "polymorphic_identity": "forum",
    }




class ForumPost(Base):
    __tablename__ = "forum_posts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    forum_id = Column(UUID(as_uuid=True), ForeignKey("forums.id"), nullable=False)
    url = Column(String, nullable=False)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    image_path = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    forum = relationship("Forum", back_populates="posts")


