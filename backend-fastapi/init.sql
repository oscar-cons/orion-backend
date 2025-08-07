-- Initialize Orion Database Schema
-- This file creates all tables with the current structure

-- Create extension for UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sources table (base table)
CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    description VARCHAR,
    type VARCHAR NOT NULL,
    nature VARCHAR,
    status BOOLEAN NOT NULL DEFAULT true,
    author VARCHAR NOT NULL,
    country VARCHAR NOT NULL,
    language VARCHAR NOT NULL,
    associated_domains VARCHAR[],
    owner VARCHAR,
    monitored VARCHAR DEFAULT 'NO',
    discovery_source VARCHAR
);

-- Create forums table (inherits from sources)
CREATE TABLE forums (
    id UUID PRIMARY KEY REFERENCES sources(id),
    user_count INTEGER NOT NULL DEFAULT 0,
    post_count INTEGER NOT NULL DEFAULT 0,
    thread_count INTEGER NOT NULL DEFAULT 0,
    last_member VARCHAR,
    categories VARCHAR[]
);

-- Create ransomware_groups table (inherits from sources)
CREATE TABLE ransomware_groups (
    id UUID PRIMARY KEY REFERENCES sources(id),
    group_name VARCHAR NOT NULL UNIQUE
);

-- Create ransomware_entries table
CREATE TABLE ransomware_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES ransomware_groups(id),
    "BreachName" VARCHAR NOT NULL,
    "Domain" VARCHAR,
    "Rank" VARCHAR,
    "Category" VARCHAR,
    "DetectionDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "Country" VARCHAR,
    "OriginalSource" VARCHAR,
    "Download" VARCHAR,
    ai_summary TEXT,
    ai_tags VARCHAR[]
);

-- Create telegram_sources table (inherits from sources)
CREATE TABLE telegram_sources (
    id UUID PRIMARY KEY REFERENCES sources(id),
    channel_username VARCHAR,
    member_count INTEGER DEFAULT 0,
    last_message_date TIMESTAMP WITH TIME ZONE
);

-- Create forum_posts table
CREATE TABLE forum_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    forum_id UUID NOT NULL REFERENCES forums(id),
    url VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    author_username VARCHAR NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR NOT NULL,
    comments JSONB,
    number_comments INTEGER NOT NULL DEFAULT 0,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    ai_summary TEXT,
    ai_tags VARCHAR[],
    "screenshotUrl" VARCHAR
);

-- Create indexes for better performance
CREATE INDEX idx_sources_type ON sources(type);
CREATE INDEX idx_sources_country ON sources(country);
CREATE INDEX idx_sources_language ON sources(language);
CREATE INDEX idx_forums_user_count ON forums(user_count);
CREATE INDEX idx_ransomware_entries_group_id ON ransomware_entries(group_id);
CREATE INDEX idx_ransomware_entries_detection_date ON ransomware_entries("DetectionDate");
CREATE INDEX idx_forum_posts_forum_id ON forum_posts(forum_id);
CREATE INDEX idx_forum_posts_date ON forum_posts(date);
CREATE INDEX idx_forum_posts_category ON forum_posts(category); 