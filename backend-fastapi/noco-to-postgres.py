"""
Script to synchronize a NocoDB table with a local PostgreSQL database.

Usage:
    python sync_nocodb_to_pg.py

Requirements:
    - requests
    - psycopg2

Install dependencies:
    pip install requests psycopg2

You must set your NocoDB API token, project name, table name, and PostgreSQL credentials.
"""

import asyncio
import asyncpg
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def migrate_data():
    # Get database credentials from environment variables
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "5432")
    db_name = os.getenv("DB_NAME", "inteligencia")
    
    if not db_user or not db_password:
        raise ValueError("DB_USER and DB_PASSWORD environment variables must be set")
    
    # Database connection configuration
    db_config = {
        'user': db_user,
        'password': db_password,
        'database': db_name,
        'host': db_host,
        'port': db_port
    }
    
    try:
        # Connect to PostgreSQL
        conn = await asyncpg.connect(**db_config)
        print("Connected to PostgreSQL successfully!")
        
        # Your migration logic here
        # ...
        
        await conn.close()
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Error during migration: {e}")

if __name__ == "__main__":
    asyncio.run(migrate_data())
