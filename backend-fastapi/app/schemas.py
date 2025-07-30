from pydantic import BaseModel, Field
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime

class ForumPostCreate(BaseModel):
    forum_id: UUID
    url: str
    title: str
    author_username: str
    content: Any
    category: str
    comments: Any = []
    number_comments: int = 0
    date: datetime

class ForumPostOut(BaseModel):
    id: UUID
    forum_id: UUID
    url: str
    title: str
    author_username: str
    content: Any
    category: str
    comments: Any
    number_comments: int
    date: datetime
    ai_summary: Optional[str] = None
    ai_tags: Optional[List[str]] = None

    class Config:
        orm_mode = True
        from_attributes = True

class AISummaryOut(BaseModel):
    summary: str
    tags: List[str]

class ForumOut(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    type: str
    nature: Optional[str]
    status: bool
    author: str
    country: str
    language: str
    associated_domains: Optional[List[str]]
    owner: Optional[str]
    monitored: str
    discovery_source: Optional[str]
    user_count: int
    post_count: int
    thread_count: int
    last_member: Optional[str]
    categories: Optional[List[str]]

    class Config:
        orm_mode = True
        from_attributes = True

class SourceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    type: str
    country: str
    language: str
    status: bool
    author: str
    monitored: str
    nature: Optional[str] = None
    associated_domains: Optional[List[str]] = None
    owner: Optional[str] = None
    discovery_source: Optional[str] = None

class ForumCreate(SourceCreate):
    user_count: int
    post_count: int
    thread_count: int
    last_member: Optional[str] = None
    categories: Optional[List[str]] = None

class RansomwareGroupCreate(SourceCreate):
    group_name: str

class RansomwareGroupOut(BaseModel):
    id: UUID
    group_name: str
    description: Optional[str] = None
    type: str
    country: str
    language: str
    status: bool
    author: str
    monitored: str
    nature: Optional[str] = None
    associated_domains: Optional[List[str]] = None
    owner: Optional[str] = None
    discovery_source: Optional[str] = None

    class Config:
        orm_mode = True
        from_attributes = True

class RansomwareEntryCreate(BaseModel):
    BreachName: str = Field(..., alias="BreachName")
    Domain: Optional[str] = Field(None, alias="Domain")
    Rank: Optional[str] = Field(None, alias="Rank")
    Category: Optional[str] = Field(None, alias="Category")
    DetectionDate: datetime = Field(..., alias="DetectionDate")
    Country: Optional[str] = Field(None, alias="Country")
    OriginalSource: Optional[str] = Field(None, alias="OriginalSource")
    Download: Optional[str] = Field(None, alias="Download")

    class Config:
        allow_population_by_field_name = True

class RansomwareEntryOut(BaseModel):
    id: UUID
    group_id: UUID
    BreachName: str = Field(..., alias="BreachName")
    Domain: Optional[str] = Field(None, alias="Domain")
    Rank: Optional[str] = Field(None, alias="Rank")
    Category: Optional[str] = Field(None, alias="Category")
    DetectionDate: datetime = Field(..., alias="DetectionDate")
    Country: Optional[str] = Field(None, alias="Country")
    OriginalSource: Optional[str] = Field(None, alias="OriginalSource")
    Download: Optional[str] = Field(None, alias="Download")
    ai_summary: Optional[str] = None
    ai_tags: Optional[List[str]] = None
    group_name: Optional[str] = None  # This will be populated from the relationship

    class Config:
        orm_mode = True
        from_attributes = True
        allow_population_by_field_name = True


class RansomwareGroupEntryCreate(BaseModel):
    group: RansomwareGroupCreate
    entry: RansomwareEntryCreate

class RansomwareGroupEntryOut(BaseModel):
    group: RansomwareGroupOut
    entry: RansomwareEntryOut


class TelegramCreate(SourceCreate):
    channel_username: Optional[str] = None
    member_count: Optional[int] = 0
    last_message_date: Optional[datetime] = None

class SourceOut(BaseModel):
    id: UUID
    name: str
    type: str
    description: Optional[str]
    nature: Optional[str]
    status: bool
    author: str
    country: str
    language: str
    associated_domains: Optional[List[str]]
    owner: Optional[str]
    monitored: str
    discovery_source: Optional[str]

    class Config:
        orm_mode = True
        from_attributes = True