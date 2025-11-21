# Altur Call Analyzer

A full-stack application for analyzing sales calls using AI (OpenAI Whisper + GPT).

## 🏗 Architecture & Design Decisions

The project follows a **Layered Architecture** pattern to ensure modularity, scalability, and separation of concerns. We build from the "inside out":

### 1. Data Layer (The Foundation)
*   **`backend/database.py`**: Handles the raw connection to SQLite.
*   **`backend/models.py`**: Defines the database schema using SQLAlchemy. We chose **JSON columns** for analysis data (`analysis_json`) to allow flexible AI schema evolution without requiring database migrations for every new insight type.

### 2. Contract Layer (The Interface)
*   **`backend/schemas.py`**: Defines Pydantic models. This acts as a strict contract between the API and the Frontend/User, validating all inputs and filtering all outputs to ensure type safety.

### 3. Logic Layer (The Brain)
*   **`backend/services.py`**: Contains the core business logic.
    *   **Orchestration**: Manages the pipeline (Save -> Transcribe -> Analyze).
    *   **AI Integration**: We use a **Chain-of-Thought** prompt strategy to extract Summary, Sentiment, Intent, and Tags in a *single* LLM call, optimizing for cost and latency.

### 4. Presentation Layer (The Doorway)
*   **`backend/main.py`**: The FastAPI router. It handles HTTP requests, input validation (via Schemas), and delegates work to the Service layer.

## 🚀 Tech Stack

*   **Backend**: FastAPI, SQLAlchemy, Pydantic, OpenAI API.
*   **Frontend**: Next.js 15, TypeScript, Tailwind CSS.
*   **Database**: SQLite (File-based).

## 🏃‍♂️ How to Run

*(Instructions to be added as we build the frontend)*
