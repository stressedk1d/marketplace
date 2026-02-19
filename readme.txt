# SAVEPOINT Marketplace - quick start

## Current state
- Backend: auth, catalog, cart, orders, ai photo search.
- Frontend: register/login, catalog, cart, checkout, orders page.
- DB migrations: Alembic is configured and has initial revision.
- AI: CLIP model is loaded lazily on first `/ai/search` request.

## One-time setup
Run from project root `d:\Diplom\my_marketplace`:

```bat
scripts\setup_backend.cmd
scripts\setup_frontend.cmd
```

## Backend env
Edit `backend\.env` and set at minimum:
- `SECRET_KEY`
- `TELEGRAM_BOT_TOKEN`

You can keep SQLite for local dev:
- `DATABASE_URL=sqlite:///./sql_app.db`

For PostgreSQL use template:
- `backend\.env.postgres.example`

## Migrations
Use one of these commands from project root:

- Fresh DB or normal migration flow:
```bat
scripts\migrate_backend.cmd
```

- Existing DB created earlier outside Alembic (only once):
```bat
scripts\stamp_backend.cmd
```

## Run
Terminal 1 (backend):
```bat
scripts\run_backend.cmd
```
Backend URL: `http://127.0.0.1:8000`
Docs: `http://127.0.0.1:8000/docs`

Terminal 2 (frontend):
```bat
scripts\run_frontend.cmd
```
Frontend URL: `http://localhost:3000`

## Telegram bot (optional manual run)
Use venv python, not system python:

```bat
cd backend
venv312\Scripts\python.exe bot.py
```

## Tests
Run backend tests:

```bat
cd backend
venv312\Scripts\python.exe -m pytest -q
```

## Known runtime notes
- First `/ai/search` call can be slow because CLIP model is loaded from cache.
- Startup logs are printed in the terminal where backend is running.

## Next day plan
1. Switch local DB to PostgreSQL and run Alembic there.
2. Add admin CRUD for products/categories.
3. Add seller role and seller-scoped product management.
4. Improve AI search quality and add background embedding job.
