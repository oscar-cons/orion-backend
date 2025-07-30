from sqlalchemy import Column, String, Boolean, ForeignKey, Integer, DateTime, Enum, ARRAY, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from .database import Base
from sqlalchemy.orm import relationship
import enum

class MonitoredEnum(enum.Enum):
    YES_MANUAL = "YES_MANUAL"
    YES_AUTOMATED = "YES_AUTOMATED"
    NO = "NO"

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
    monitored = Column(String, nullable=True, default="NO")
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


class RansomwareGroup(Source):
    __tablename__ = "ransomware_groups"
    id = Column(UUID(as_uuid=True), ForeignKey("sources.id"), primary_key=True)
    group_name = Column(String, nullable=False, unique=True)
    # Add any ransomware group-specific fields here if needed

    entries = relationship("RansomwareEntry", back_populates="group", cascade="all, delete-orphan")

    __mapper_args__ = {
        "polymorphic_identity": "ransomware_group",
    }


class RansomwareEntry(Base):
    __tablename__ = "ransomware_entries"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id = Column(UUID(as_uuid=True), ForeignKey("ransomware_groups.id"), nullable=False)
    BreachName = Column(String, nullable=False)
    Domain = Column(String, nullable=True)
    Rank = Column(String, nullable=True)
    Category = Column(String, nullable=True)
    DetectionDate = Column(DateTime(timezone=True), nullable=False)
    Country = Column(String, nullable=True)
    OriginalSource = Column(String, nullable=True)
    Download = Column(String, nullable=True)
    ai_summary = Column(Text, nullable=True)
    ai_tags = Column(ARRAY(String), nullable=True)
    # group_name is inherited from RansomwareGroup via the relationship, so no need to redefine it here.

    group = relationship("RansomwareGroup", back_populates="entries")

    __mapper_args__ = {
        "polymorphic_identity": "ransomware_entry",
    }


class Telegram(Source):
    __tablename__ = "telegram_sources"
    id = Column(UUID(as_uuid=True), ForeignKey("sources.id"), primary_key=True)
    channel_username = Column(String, nullable=True)
    member_count = Column(Integer, nullable=True, server_default="0")
    last_message_date = Column(DateTime(timezone=True), nullable=True)
    __mapper_args__ = {
        "polymorphic_identity": "telegram",
    }


class ForumPost(Base):
    __tablename__ = "forum_posts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    forum_id = Column(UUID(as_uuid=True), ForeignKey("forums.id"), nullable=False)
    url = Column(String, nullable=False)
    title = Column(String, nullable=False)
    author_username = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String, nullable=False)
    comments = Column(JSON, nullable=True)
    number_comments = Column(Integer, nullable=False, default=0)
    date = Column(DateTime(timezone=True), nullable=False)
    forum = relationship("Forum", back_populates="posts")
    ai_summary = Column(Text, nullable=True)
    ai_tags = Column(ARRAY(String), nullable=True)
    screenshotUrl = Column(String, nullable=True)

