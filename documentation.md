# Documentation

## Overview
This project is a Call Analyzer application that processes audio calls, transcribes them, and analyzes them using LLMs to provide insights.

## Architecture
- **Frontend**: Next.js
- **Backend**: FastAPI (Python)
- **Database**: SQLAlchemy (SQLite/Postgres)
- **AI Services**: OpenAI (Whisper for STT, GPT-4o-mini for Analysis)

## Decisions Log

### 2025-11-21
- **Model Update**: Switched from `gpt-3.5-turbo` to `gpt-4o-mini` in `backend/services.py` for cost-efficiency and improved performance. Updated related comments.

