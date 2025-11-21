import os
import json
import shutil
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import UploadFile
import openai
from . import models, schemas

# Directories
# We need a place to save the raw audio files.
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- SERVICE 1: ORCHESTRATOR ---
# This function manages the entire lifecycle of a file upload.
async def process_upload(file: UploadFile, db: Session) -> models.Call:
    """
    1. Save File to Disk
    2. Transcribe (STT)
    3. Analyze (LLM)
    4. Save to DB
    """
    # 1. Save file locally
    # We prepend a timestamp to avoid filename collisions (e.g. two "call.mp3" files)
    timestamp = int(datetime.now().timestamp())
    safe_filename = f"{timestamp}_{file.filename}"
    file_location = os.path.join(UPLOAD_DIR, safe_filename)
    
    # Write the stream to disk
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
    
    # Get file size for metadata (Bonus: extracting extra insights to display them in a nice dashboard :D )
    file_size = os.path.getsize(file_location)
    
    # Create initial DB record
    # We save it NOW so even if transcription fails, we have a record of the file.
    db_call = models.Call(
        filename=file.filename,
        metadata_json={"file_size_bytes": file_size, "local_path": file_location}
    )
    db.add(db_call)
    db.commit()
    db.refresh(db_call)

    # 2. Transcribe
    # We await this because it's an external API call (IO-bound)
    transcript = await transcribe_audio(file_location)
    db_call.transcript = transcript
    db.commit()

    # 3. Analyze
    # We feed the transcript into the LLM
    analysis_result = await analyze_transcript(transcript)
    
    # Unpack analysis into our database model
    db_call.analysis_json = analysis_result
    # We pull tags out to the top level for easier filtering later
    db_call.tags = analysis_result.get("tags", [])
    
    db.commit()
    db.refresh(db_call)
    
    return db_call

# --- SERVICE 2: SPEECH-TO-TEXT (STT) ---
async def transcribe_audio(file_path: str) -> str:
    """
    Uses OpenAI Whisper to transcribe audio.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    
    # Mock Fallback: If no API key is set, return a fake transcript.
    # This allows the app to "work" even without paying for OpenAI.
    if not api_key:
        return (
            "MOCK TRANSCRIPT [No API Key]: Agent: Hello, calling from Altur. "
            "Customer: Yes, I'm interested in your premium plan. "
            "Agent: Great! I can help you with that upgrade right now."
        )
    
    client = openai.AsyncOpenAI(api_key=api_key)
    
    try:
        with open(file_path, "rb") as audio_file:
            # Call Whisper API
            transcript = await client.audio.transcriptions.create(
                model="whisper-1", 
                file=audio_file
            )
        return transcript.text
    except Exception as e:
        print(f"Error transcribing: {e}")
        return "Error: Transcription failed."

# --- SERVICE 3: LLM ANALYSIS ---
async def analyze_transcript(transcript: str) -> dict:
    """
    Uses GPT-4o (or 3.5-turbo) to extract structured insights.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    
    # Mock Fallback
    default_response = {
        "summary": "Mock summary: User wants to upgrade.",
        "tags": ["sales", "positive"],
        "speaker_roles": ["Agent", "Customer"],
        "sentiment_score": 0.8,
        "sentiment_label": "Positive",
        "intent": "Upgrade Purchase",
        "key_insights": ["Customer is ready to buy", "Price is not an objection"]
    }

    if not api_key:
        return default_response

    client = openai.AsyncOpenAI(api_key=api_key)
    
    # PROMPT ENGINEERING
    # We use "Chain-of-Thought" prompting here.
    # Instead of asking "What is the sentiment?" and then "What is the summary?" (2 calls),
    # we ask for a JSON object containing ALL of it.
    prompt = f"""
    You are an expert Sales Call Analyst. Analyze the transcript below.
    
    Transcript:
    "{transcript}"
    
    Your task is to extract the following structured data:
    1. Summary: A concise 2-sentence summary.
    2. Tags: A list of categories (e.g., "voicemail", "wrong number", "sales", "complaint", "follow-up-needed").
    3. Sentiment Score: A float from -1.0 (Negative) to 1.0 (Positive).
    4. Sentiment Label: "Positive", "Negative", or "Neutral".
    5. Intent: What was the caller's primary goal? (e.g., "Buy product", "Get support").
    6. Speaker Roles: Identify likely speakers (e.g., ["Agent", "Customer"]).
    7. Key Insights: A list of 2-3 bullet points of actionable info.

    Return strictly JSON.
    """
    
    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo", # You can swap this to "gpt-4o" for better results
            messages=[
                {"role": "system", "content": "You are a helpful AI assistant that outputs JSON."},
                {"role": "user", "content": prompt}
            ],
            # This forces the model to output valid JSON, preventing parsing errors.
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        data = json.loads(content)
        
        # Robustness: We use .get() with defaults in case the LLM hallucinates a different key name.
        return {
            "summary": data.get("Summary", data.get("summary", "")),
            "tags": data.get("Tags", data.get("tags", [])),
            "speaker_roles": data.get("Speaker Roles", data.get("speaker_roles", [])),
            "sentiment_score": data.get("Sentiment Score", data.get("sentiment_score", 0.0)),
            "sentiment_label": data.get("Sentiment Label", data.get("sentiment_label", "Neutral")),
            "intent": data.get("Intent", data.get("intent", "Unknown")),
            "key_insights": data.get("Key Insights", data.get("key_insights", []))
        }
    except Exception as e:
        print(f"Error analyzing: {e}")
        return default_response
