from pydantic import BaseModel
# prevents bugs by checking data types. i.e custom tags: 123 will throw an error because it's not a list of strings
from datetime import datetime
from typing import List, Optional, Dict, Any

# --- WHAT IS A SCHEMA? ---
# In FastAPI, "Models" (models.py) talk to the Database.
# "Schemas" (this file) talk to the API User (Frontend).
# They act as a filter/validation layer.

# 1. Base Schema
# Contains fields common to creating or reading a call.
class CallBase(BaseModel):
    filename: str

# 2. Update Schema
# This defines what data we allow a user to send when updating a call.
# Currently, we only allow updating custom tags.
class CallUpdateTags(BaseModel):
    custom_tags: List[str]

# 3. Response Schema
# This is the full object we send back to the frontend.
# It includes the database ID and timestamps, which the user can't create themselves.
class Call(CallBase):
    id: int
    upload_timestamp: datetime
    transcript: Optional[str] = None
    
    # We use Dict[str, Any] because our 'analysis_json' is flexible.
    # However, we expect keys like: summary, sentiment_score, etc.
    #Sometimes "sentiment" might be a number: 0.8.
    #Sometimes "sentiment" might be a string: "Positive".
    
    analysis_json: Dict[str, Any] = {}
    
    tags: List[str] = []
    custom_tags: List[str] = []
    metadata_json: Dict[str, Any] = {}

    # This config tells Pydantic: "It's okay to read data from a SQLAlchemy model"
    class Config:
        from_attributes = True
