# SAVEPOINT Marketplace - быстрый запуск

## Что уже сделано
- Backend модульный:
  - `backend/routers/auth.py`
  - `backend/routers/catalog.py`
  - `backend/routers/cart.py`
  - `backend/routers/orders.py`
  - `backend/routers/ai_search.py`
- Реализованы заказы:
  - `POST /orders/checkout`
  - `GET /orders/my`
- Frontend:
  - оформление заказа из корзины
  - страница заказов
  - ссылка "Заказы" в header
- Добавлена база под миграции Alembic:
  - `backend/alembic.ini`
  - `backend/alembic/env.py`
  - `backend/alembic/versions/20260219_0001_initial_schema.py`

## Почему были ошибки в PowerShell
- `Activate.ps1` и `npm.ps1` блокируются Execution Policy.
- Поэтому запуск сделан через `.cmd` скрипты (без активации venv и без `npm.ps1`).

## Новый способ запуска (рекомендуется)
Запускать из корня проекта `d:\Diplom\my_marketplace`.

### 1) Подготовка backend (один раз)
`scripts\setup_backend.cmd`

Что делает:
- создает `backend\.env` из `.env.example` (если нет),
- создает `backend\venv312`,
- ставит зависимости из `backend\requirements.txt`.

### 2) Подготовка frontend (один раз)
`scripts\setup_frontend.cmd`

### 3) Запуск backend
`scripts\run_backend.cmd`

Backend будет доступен на:
- `http://127.0.0.1:8000`

### 4) Запуск frontend
`scripts\run_frontend.cmd`

Frontend будет доступен на:
- `http://localhost:3000`

## Важные env-переменные backend
Файл: `backend\.env`

Минимум заполнить:
- `SECRET_KEY`
- `TELEGRAM_BOT_TOKEN`

Дополнительно:
- `DATABASE_URL=sqlite:///./sql_app.db`
- `AUTO_CREATE_SCHEMA=true` (на dev можно оставить так)

## Alembic (когда будешь переходить на миграции полностью)
- для новой БД:
  1. `AUTO_CREATE_SCHEMA=false`
  2. `backend\venv312\Scripts\python.exe -m alembic upgrade head`
- для уже существующей БД от `create_all`:
  - `backend\venv312\Scripts\python.exe -m alembic stamp head`

## Следующий шаг по проекту
1. Перевести `DATABASE_URL` на PostgreSQL.
2. Добавить базовые тесты для `auth/cart/orders`.
