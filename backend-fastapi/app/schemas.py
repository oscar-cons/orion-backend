from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class ForumPostCreate(BaseModel):
    forum_id: UUID
    title: str
    content: str

class ForumPostOut(BaseModel):
    id: UUID
    forum_id: UUID
    title: str
    content: str
    image_path: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True

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