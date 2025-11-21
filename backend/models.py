from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from datetime import datetime
from .database import Base

# This class represents the "calls" table in our database.
# It inherits from 'Base', which we defined in database.py.
class Call(Base):
    # The name of the table in SQLite
    __tablename__ = "calls"

    # 1. Primary Key
    # Every call needs a unique ID. We use an auto-incrementing Integer.
    id = Column(Integer, primary_key=True, index=True)

    # 2. Basic Metadata
    # We index the filename to make searching faster if needed.
    filename = Column(String, index=True)
    upload_timestamp = Column(DateTime, default=datetime.utcnow)
    
    # 3. The Transcript
    # This holds the full text returned by OpenAI Whisper.
    # It can be long, so we use the 'Text' type.
    transcript = Column(Text, nullable=True)
    
    # 4. AI Analysis (The "Brain" Output)
    # Instead of creating separate columns for "sentiment", "summary", "intent", etc.,
    # we store the entire JSON output from the LLM in one column.
    # Why?
    #   - Flexibility: If you want to add "Mood" later, you just update the Prompt, 
    #     you don't need to migrate the database schema.
    #   - Structure: JSON allows us to store nested lists like ["Agent", "Customer"].
    analysis_json = Column(JSON, default=dict)
    
    # 5. Tags
    # We store tags as a JSON list of strings: ["sales", "urgent", "voicemail"]
    tags = Column(JSON, default=list)
    
    # 6. User Overrides
    # If a user adds a tag manually, we store it here separately from the AI tags.
    custom_tags = Column(JSON, default=list)
    
    # 7. File Metadata
    # Stores things like file_size_bytes, duration_seconds, local_path, etc.
    metadata_json = Column(JSON, default=dict)
