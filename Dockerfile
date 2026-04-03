# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies (for building some python packages if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy the backend requirements first for caching
COPY backend/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY backend/ .

# Ensure the app user can write to the database
RUN chmod 777 .

# Initialize the database and seed it on every build/startup for testability
# Note: In a production environment with persistent storage, you'd use migrations.
RUN python -c "from utils.db import init_db; init_db()"
RUN python seed.py

# Expose the port (Render uses $PORT)
ENV PORT=5000
EXPOSE ${PORT}

# Run the application with Gunicorn
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT} app:app"]
