# 1. Base Image: Python 3.10 (Lightweight version)
FROM python:3.10-slim

# 2. Set Work Directory
WORKDIR /app

# 3. Install Poetry (Dependency Manager)
RUN pip install poetry

# 4. Copy Dependency Files
COPY pyproject.toml poetry.lock* /app/

# 5. Configure Poetry
# We don't need a virtual environment inside Docker, so we install globally.
RUN poetry config virtualenvs.create false

# 6. Install Dependencies
# --no-dev: We don't need test tools in the production container
RUN poetry install --without dev --no-root --no-interaction --no-ansi

# 7. Copy Source Code
COPY backend /app/backend

# 8. Create Uploads Directory
RUN mkdir -p uploads

# 9. Expose Port 8000
EXPOSE 8000

# 10. Start Command
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

