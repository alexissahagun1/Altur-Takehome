from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 1. Database Connection URL
# We are using SQLite, a file-based database. 
# "calls.db" will be created in the root directory.
SQLALCHEMY_DATABASE_URL = "sqlite:///./data/calls.db"

# 2. Create Engine
# This is the core interface to the database.
# check_same_thread=False is a specific requirement for SQLite when using with FastAPI
# because FastAPI uses multiple threads to handle requests.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 3. Session Factory
# This creates a "Session" class. Each time we need to talk to the DB (like saving a call),
# we will instantiate this class.
# autocommit=False: We want to manually commit changes (safer).
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Base Class
# All our database models (like class Call) will inherit from this.
Base = declarative_base()

# 5. Dependency Injection Helper
# This function will be used by FastAPI to give each request a database session.
# The 'yield' keyword makes it a "generator".
# It ensures the session is closed after the request finishes, even if there was an error.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
