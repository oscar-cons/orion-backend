from pydantic import BaseModel
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

    class Config:
        orm_mode = True
        from_attributes = True

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

class RansomwareCreate(SourceCreate):
    BreachName: str
    Domain: Optional[str] = None
    Rank: Optional[str] = None
    Category: Optional[str] = None
    DetectionDate: datetime
    Country: str
    OriginalSource: Optional[str] = None
    Group: str
    Download: Optional[str] = None
    
class RansomwareOut(BaseModel):
    id: UUID
    BreachName: str
    Domain: Optional[str] = None
    Rank: Optional[str] = None
    Category: Optional[str] = None
    DetectionDate: datetime
    Country: Optional[str] = None
    OriginalSource: Optional[str] = None
    Group: str
    Download: Optional[str] = None

    class Config:
        orm_mode = True
        from_attributes = True

class TelegramCreate(SourceCreate):
    channel_username: Optional[str] = None
    member_count: Optional[int] = 0
    last_message_date: Optional[datetime] = None

class SourceOut(BaseModel):
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

    class Config:
        orm_mode = True
        from_attributes = True