# Altur Call Analyzer

A production-grade full-stack application for analyzing sales calls using AI.

## 🚀 Features

*   **Audio Transcription**: Converts WAV/MP3 sales calls to text using OpenAI Whisper.
*   **Intelligent Analysis**: Uses GPT-4o to extract:
    *   Executive Summary
    *   Sentiment Analysis (Score & Label)
    *   User Intent Classification
    *   Speaker Role Identification
    *   Key Insights
*   **Analytics Dashboard**: Visualizes call volume, sentiment trends, and top tags.
*   **Data Persistence**: Stores data in SQLite (file-based).
*   **Tag Management**: Auto-tagging by AI with user override capabilities.
*   **Export**: Download call records as JSON.

## 🏗 Architecture & Design Decisions

### 1. "Monorepo-lite" Structure
I chose to keep `backend/` (FastAPI) and `frontend/` (Next.js) in a single repository to simplify development and deployment coordination.

### 2. Layered Backend Architecture
*   **Data Layer (`database.py`, `models.py`)**: Defines the SQLite schema. I used **JSON columns** for analysis data to allow flexible AI schema evolution without requiring migrations.
*   **Logic Layer (`services.py`)**: Handles the orchestration of File Save -> Transcribe -> Analyze. Uses a **Chain-of-Thought** prompt to extract all insights in a single API call (optimizing cost/latency).
*   **API Layer (`main.py`, `schemas.py`)**: Exposes endpoints using Pydantic for strict validation.

### 3. Modern Frontend
*   Built with **Next.js 15 (App Router)** and **Server Components** for performance.
*   Uses **Tailwind CSS** for rapid styling and **Recharts** for the analytics dashboard.

## 🛠 Tech Stack

*   **Backend**: Python 3.10, FastAPI, SQLAlchemy, Pydantic, Pandas.
*   **Frontend**: Node.js 18, Next.js 15, TypeScript, Tailwind CSS.
*   **AI**: OpenAI API (Whisper-1, GPT-3.5/4).
*   **Infrastructure**: Docker & Docker Compose.

## 🏃‍♂️ How to Run

### Prerequisites
*   Docker & Docker Compose installed.
*   An OpenAI API Key.

### Quick Start (Docker)

1.  **Create Environment File**
    Create a file named `.env` in the root directory:
    ```env
    OPENAI_API_KEY=sk-your-key-here
    ```

2.  **Run the App**
    ```bash
    docker-compose up --build
    ```

3.  **Access the App**
    *   Frontend: [http://localhost:3000](http://localhost:3000)
    *   Backend API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Local Development (Optional)

If you want to run it without Docker:

**Backend:**
```bash
cd backend
poetry install
export OPENAI_API_KEY=sk-...
poetry run uvicorn backend.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing

1.  **Upload**: Drag & drop one of the sample files from the `calls/` folder.
2.  **Analyze**: Watch the status change to "Processing...".
3.  **View**: Click the card to see the transcript and AI insights.
4.  **Edit**: Click "Edit" on the Tags section to manually override AI tags.
5.  **Dashboard**: Go back to Home to see the Analytics charts update.
