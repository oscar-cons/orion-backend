FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    git \
    && rm -rf /var/lib/apt/lists/*

# Clone the public repository
RUN git clone https://github.com/oscar-cons/orion-backend.git . && \
    git checkout v0.5-beta-docker

# Debug: List contents to see structure
RUN ls -la && \
    echo "=== Contents of current directory ===" && \
    find . -maxdepth 2 -type f -name "*.py" && \
    echo "=== Checking for app directory ===" && \
    ls -la app/ 2>/dev/null || echo "app directory not found"

# Check if we need to change to backend-fastapi directory
RUN if [ -d "backend-fastapi" ]; then \
        echo "Found backend-fastapi directory, changing to it"; \
        cd backend-fastapi && \
        ls -la && \
        echo "=== Contents of backend-fastapi ===" && \
        find . -maxdepth 2 -type f -name "*.py"; \
    else \
        echo "No backend-fastapi directory found"; \
    fi

# Install Python dependencies
RUN if [ -f "requirements.txt" ]; then \
        pip install --no-cache-dir -r requirements.txt; \
    elif [ -f "backend-fastapi/requirements.txt" ]; then \
        pip install --no-cache-dir -r backend-fastapi/requirements.txt; \
    else \
        echo "No requirements.txt found, installing basic dependencies"; \
        pip install --no-cache-dir fastapi uvicorn sqlalchemy psycopg2-binary alembic python-multipart; \
    fi

# Set the correct working directory for the app
WORKDIR /app/backend-fastapi

# Debug: Check if app module exists in the correct location
RUN python -c "import sys; print('Python path:', sys.path)" && \
    python -c "import app; print('App module found')" 2>/dev/null || echo "App module not found"

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] 