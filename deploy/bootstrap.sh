#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Создан .env — отредактируйте SECRET_KEY, POSTGRES_PASSWORD, PUBLIC_*_URL, SMTP"
  exit 1
fi

docker compose up -d --build
echo ""
echo "Готово. Сайт: см. PUBLIC_SITE_URL в .env (порт 80)"
echo "API:   см. PUBLIC_API_URL (порт 8000, /docs)"
