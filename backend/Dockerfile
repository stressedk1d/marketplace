FROM public.ecr.aws/docker/library/python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-prod.txt .
RUN pip install --no-cache-dir -r requirements-prod.txt

ARG INSTALL_AI=1
# CPU-only PyTorch (без CUDA ~1 GB) — на VPS нет видеокарты
RUN if [ "$INSTALL_AI" = "1" ]; then \
    pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir sentence-transformers; \
    fi

COPY . .

ENV PORT=8000
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/site/status')" || exit 1

CMD sh -c "alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"
