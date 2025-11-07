FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# requirements.txt se trouve à la racine de MLO_P5_Sources
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Code source
COPY src/ /app/src

# Pour que "python -m src.ingest" trouve bien les modules
ENV PYTHONPATH=/app

# Commande par défaut : exécuter l’ingest
CMD ["python", "-m", "src.ingest"]

