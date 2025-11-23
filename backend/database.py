import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Get the URL from .env
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Fallback for local testing if .env is missing (Optional)
if not SQLALCHEMY_DATABASE_URL:
    # Use SQLite locally if no Cloud URL provided
    SQLALCHEMY_DATABASE_URL = "sqlite:///./data/calls.db"

# 2. Create Engine
if "sqlite" in SQLALCHEMY_DATABASE_URL:
    # SQLite specific args
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL (Supabase) - No special args needed
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
