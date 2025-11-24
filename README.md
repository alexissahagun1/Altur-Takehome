# Altur Call Analyzer 📞 🤖

A production-grade, full-stack application that transforms sales calls into actionable intelligence using OpenAI Whisper and GPT-4o.

![License](https://img.shields.io/badge/license-MIT-blue)
![Status](https://img.shields.io/badge/status-production-green)

## 🌐 Live Demo

👉 **[Try the Live App Here](https://altur-takehome.vercel.app/)**

> **Note**: The live demo uses a shared backend. Please be respectful with the uploads. 25mb file limit is set by Open AI Whisper, uploads over 25mb will throw an error.

---


## 🚀 Features

-   **🎙️ Audio Transcription**: High-fidelity transcription of WAV/MP3 files using `whisper-1`.
-   **🧠 Intelligent Analysis**: Uses a **Chain-of-Thought** prompt with GPT-4o to extract:
    -   Executive Summary
    -   Sentiment Analysis (Score & Label)
    -   User Intent Classification
    -   Speaker Role Identification
    -   Key Actionable Insights
-   **📊 Analytics Dashboard**: Visualizes call volume, sentiment trends, and top tags using Recharts.
-   **🏷️ Smart Tagging**: Auto-tagging by AI with manual user override capabilities.
-   **💾 Hybrid Persistence**: Supports both SQLite (local dev) and PostgreSQL (production/Supabase).
-   **☁️ Robust Deployment**: Dockerized "Monorepo-lite" deployed on Render (Backend) and Vercel (Frontend).


## 🏗️ Architecture & Design Decisions

This project follows a **Monorepo-lite** structure, keeping the Frontend and Backend in a single repository for easier coordination while maintaining clear separation of concerns.

### 1. Backend: Layered FastAPI Service
We chose **FastAPI** for its speed and native Pydantic integration.
-   **API Layer (`main.py`)**: Handles routing and request validation.
-   **Logic Layer (`services.py`)**: Contains the core business logic. We use a **"Fat Service, Thin Controller"** pattern.
    -   *Trade-off*: We process files synchronously for simplicity, but for a larger scale, we would use a task queue (Celery/Redis) to handle long transcriptions.
-   **Data Layer (`models.py`)**: We use a **JSON Column** for the analysis results.
    -   *Why?* AI outputs are unpredictable and evolve fast. A JSON column allows us to add new fields (e.g., "objection_handling_score") without running complex database migrations.

### 2. Frontend: Next.js 15 App Router
-   **Server Components**: heavily used for data fetching to reduce client-side JavaScript and improve SEO/Performance.
-   **Tailwind CSS**: For rapid, responsive UI development.
-   **Error Handling**: Implemented graceful fallbacks (empty states, error toasts) if the API is unreachable.

### 3. AI Integration Strategy
-   **Chain-of-Thought Prompting**: Instead of making 5 separate API calls (one for summary, one for sentiment, etc.), we use a single, structured prompt that asks the LLM to "think" and output a single JSON object.
    -   *Benefit*: Reduces latency and OpenAI costs by ~80%.
-   **JSON Mode**: We enforce valid JSON output from GPT-4o to prevent parsing errors.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15, React 19, Tailwind, Recharts, Lucide, Axios | Modern, server-first UI with beautiful charts and icons. |
| **Backend** | Python 3.10, FastAPI, Uvicorn, SQLAlchemy, Pydantic, Pandas, Poetry | High-performance async API with robust dependency management and data processing. |
| **Database** | PostgreSQL (Supabase) | Robust relational data storage. |
| **AI** | OpenAI Whisper + GPT-4o | State-of-the-art transcription & reasoning. |
| **DevOps** | Docker, Docker Compose, Render, Vercel | Consistent environments & seamless cloud deployment. |

---

## 🏃‍♂️ How to Run

### Prerequisites

1.  **OpenAI API Key**: You need an active account with credits (top up $5 if needed).
2.  **Supabase Account**: We use Supabase for the PostgreSQL database.
    *   Create a new project.
    *   Get the **Session Pooler Connection String** (port 5432) or Transaction Pooler (port 6543) from the "Connect" button in Supabase.
3.  **Docker Desktop**: Ensure it is running.

### Option A: Docker (Recommended)

1.  **Clone & Configure**:
    ```bash
    git clone <repo-url>
    cd altur-call-analyzer
    
    # Create .env file in the root directory
    # Replace with your actual keys
    echo "OPENAI_API_KEY=sk-..." > .env
    echo "DATABASE_URL=postgresql://postgres.xxxx:password@aws-0-us-west-1.pooler.supabase.com:5432/postgres" >> .env
    ```

    > **Important**: If using Supabase, make sure to use the **Session Pooler** URL (`port 5432`) or Transaction Pooler (`port 6543`) to manage connections effectively.

2.  **Run**:
    ```bash
    docker compose up --build
    ```

3.  **Access (When Running Locally)**:
    -   **Frontend**: `http://localhost:3000`
    -   **Backend API**: `http://localhost:8000`

### Option B: Deployment (Render + Vercel)

This project is designed to be deployed easily.

**1. Backend (Render)**
*   Connect your repo to Render.
*   Create a **Web Service** with **Docker** runtime.
*   Set **Root Directory** to `.`.
*   Set **Dockerfile Path** to `backend/Dockerfile`.
*   Add Environment Variables: `OPENAI_API_KEY` and `DATABASE_URL` (Supabase).

**2. Frontend (Vercel)**
*   Connect your repo to Vercel.
*   Set **Root Directory** to `frontend`.
*   Add Environment Variable: `NEXT_PUBLIC_API_URL` pointing to your Render URL (e.g., `https://altur-backend.onrender.com`, replace this with your actual Render URL).

### Option C: Local Development (No Docker)

**Backend**:
```bash
cd backend
poetry install
export OPENAI_API_KEY=sk-...
poetry run uvicorn backend.main:app --reload
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing

We include a suite of tests to verify API health and error handling.

```bash
# Run from the root directory
poetry install  # Installs dev dependencies like pytest
poetry run pytest
```

**What we test:**
-   ✅ Server Health Check
-   ✅ Database Connection
-   ✅ Invalid File Type Handling (Security)

---

## 🏆 Evaluation Criteria Checklist

| Criterion | How We Met It |
| :--- | :--- |
| **Functionality** | Complete flow: Upload -> Whisper -> GPT-4 -> DB -> UI. |
| **Code Quality** | Modular `services.py`, typed Pydantic schemas, clean `api.ts` wrapper. |
| **AI Logic** | Structured JSON prompting, fallback "mock" modes for dev without keys. |
| **Documentation** | Comprehensive README, architecture explanation, setup guide. |
| **Tests** | Pytest suite for endpoints and error cases. |
| **UI/UX** | Upload progress bars, empty states, clean data visualization. |
| **Polish** | **Dockerized**, **Cloud Deployed**, **Export to JSON** feature added. |

---

## 🔮 Future Roadmap

To scale this from an MVP to a production SaaS, we have identified these high-impact improvements:

1.  **⚡ Async Processing (Task Queues)**
    *   *Current*: Synchronous processing (can timeout on large files).
    *   *Future*: Implement **Celery + Redis** to handle long audio files in the background and notify the frontend via WebSockets.

2.  **🔎 Semantic Search (RAG)**
    *   *Current*: Keyword filtering by tag.
    *   *Future*: Use **pgvector** (Supabase) and OpenAI Embeddings to allow users to ask natural language questions like "Show me calls where the customer asked about pricing."

3.  **🎹 "Karaoke-Style" Interactive Player**
    *   *Current*: Static text transcript.
    *   *Future*: Use Whisper's timestamp data to highlight words in real-time as the audio plays.
