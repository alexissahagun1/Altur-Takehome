from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import pandas as pd

from . import models, schemas, database, services

# 1. Initialize Database
# This line physically creates the 'calls.db' file and the tables if they don't exist.
models.Base.metadata.create_all(bind=database.engine)

# 2. Create API App
app = FastAPI(
    title="Altur Call Analyzer API",
    description="Advanced Call Analysis with STT, LLM, and Analytics",
    version="1.0.0"
)

# 3. CORS Setup
# Browsers block requests from localhost:3000 (Frontend) to localhost:8000 (Backend)
# unless we explicitly allow it. This is a security feature.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In a real production app, list specific domains (e.g., ["https://altur.io"])
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROUTE 1: UPLOAD ---
# This handles the file upload. It uses 'UploadFile' to stream the data.
@app.post("/upload", response_model=schemas.Call)
async def upload_call(file: UploadFile = File(...), db: Session = Depends(database.get_db)):
    """
    Uploads an audio file (WAV/MP3), transcribes it, and analyzes it using ai.
    """
    # Validation: Check file extension
    if not file.filename.lower().endswith(('.wav', '.mp3')):
        raise HTTPException(status_code=400, detail="Invalid file type. Only WAV or MP3 allowed.")
    
    try:
        # Delegate to our Service layer
        return await services.process_upload(file, db)
    except Exception as e:
        # If anything crashes (e.g. OpenAI is down), return a 500 error
        raise HTTPException(status_code=500, detail=str(e))

# --- ROUTE 2: LIST CALLS ---
# Returns a list of all calls, with optional filtering.
@app.get("/calls", response_model=List[schemas.Call])
def get_calls(
    tag: Optional[str] = None, 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Call)
    
    # Sort by newest first
    calls = query.order_by(models.Call.upload_timestamp.desc()).all()
    
    # Filter by Tag (Python-side)
    # We check both system tags AND user custom tags
    if tag:
        filtered_calls = []
        for call in calls:
            has_system_tag = tag in call.tags
            has_custom_tag = tag in call.custom_tags

            if has_system_tag or has_custom_tag:
                filtered_calls.append(call)

        calls = filtered_calls
        
    return calls[skip : skip + limit]

# --- ROUTE 3: GET SINGLE CALL ---
@app.get("/calls/{call_id}", response_model=schemas.Call)
def get_call(call_id: int, db: Session = Depends(database.get_db)):
    call = db.query(models.Call).filter(models.Call.id == call_id).first()
    # look call by id in the database and return it, if not found, return 404 error
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    return call

# --- ROUTE 4: UPDATE TAGS (Bonus) ---
# Allows the user to manually tag a call.
@app.patch("/calls/{call_id}/tags", response_model=schemas.Call)
def update_tags(
    call_id: int, 
    tags_update: schemas.CallUpdateTags, 
    db: Session = Depends(database.get_db)
):
    call = db.query(models.Call).filter(models.Call.id == call_id).first()
    # look call by id in the database and update the tags, if not found, return 404 error
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    
    # Update the field and commit
    call.custom_tags = tags_update.custom_tags # update the custom tags field with the new tags
    db.commit()
    db.refresh(call)
    return call

# --- ROUTE 5: EXPORT (Bonus) ---
# Returns a downloadable JSON file.
@app.get("/calls/{call_id}/export")
def export_call_json(call_id: int, db: Session = Depends(database.get_db)):
    call = db.query(models.Call).filter(models.Call.id == call_id).first()
    # look call by id in the database and export it, if not found, return 404 error
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    
    export_data = {
        "filename": call.filename,
        "timestamp": call.upload_timestamp.isoformat(),
        "transcript": call.transcript,
        "analysis": call.analysis_json,
        "system_tags": call.tags,
        "user_tags": call.custom_tags
    }
    
    # JSONResponse with specific headers triggers a browser download
    return JSONResponse(
        content=export_data,
        headers={"Content-Disposition": f"attachment; filename=call_{call_id}_export.json"}
    )

# --- ROUTE 6: ANALYTICS (Bonus) ---
# Returns aggregated stats for the dashboard.
@app.get("/analytics")
def get_analytics(db: Session = Depends(database.get_db)):
    calls = db.query(models.Call).all()
    
    if not calls:
        return {
            "total_calls": 0,
            "avg_sentiment": 0,
            "sentiment_distribution": {"Positive": 0, "Neutral": 0, "Negative": 0},
            "top_tags": []
        }

    # Use Pandas to easily calculate stats
    data = []
    all_tags = []
    
    for c in calls:
        sentiment = c.analysis_json.get("sentiment_score", 0)
        label = c.analysis_json.get("sentiment_label", "Neutral")
        data.append({"sentiment": sentiment, "label": label})
        all_tags.extend(c.tags)
        all_tags.extend(c.custom_tags)
    
    df = pd.DataFrame(data)
    tag_counts = pd.Series(all_tags).value_counts().head(5).to_dict()
    
    return {
        "total_calls": len(calls),
        "avg_sentiment": round(df["sentiment"].mean(), 2),
        "sentiment_distribution": df["label"].value_counts().to_dict(),
        "top_tags": tag_counts
    }
