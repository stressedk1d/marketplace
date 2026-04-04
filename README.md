# VogueWay

Маркетплейс одежды и коллекций: бренды, избранные коллекции, мерч знаменитостей, корзина, заказы и ИИ-поиск по фото. Учебный / дипломный проект.

## Стек

**Бэкенд**

- Python 3.12+
- FastAPI, SQLAlchemy (sync), Alembic, Pydantic v2
- JWT + bcrypt, опционально SMTP для подтверждения email
- SQLite (разработка) или PostgreSQL (см. `.env.postgres.example`)
- pytest
- Опционально: `sentence-transformers` / CLIP для `/ai/search`

**Фронтенд**

- Next.js (App Router), TypeScript, Tailwind CSS
- Переменная `NEXT_PUBLIC_API_URL` — базовый URL API (по умолчанию `http://localhost:8000`)

## Возможности

- Регистрация, вход, подтверждение email (в dev код может логироваться)
- Каталог: фильтры (категория, бренд, коллекция, цена), сортировка в т.ч. **по популярности** (`views_count`), бесконечная подгрузка
- **Бренды** (Nike, Adidas, Puma, Under Armour, New Balance, Converse и др.) и **знаменитости** (Recrent, Kanye West, Rihanna, Drake, Billie Eilish и др.) — флаг `is_celebrity`, отдельные разделы на главной
- Коллекции, в т.ч. избранные на главной (без коллекций знаменитостей в блоке «Featured»)
- Карточка товара, просмотры → **тренды** на главной
- **Недавно просмотренные** (localStorage, до 10 товаров)
- Корзина, оформление заказа, статусы заказа, история
- Избранное (wishlist)
- ИИ-поиск по изображению товара

## Структура репозитория

```
backend/          # FastAPI, модели, сервисы, роутеры, Alembic
frontend/         # Next.js приложение, публичные ассеты (favicon, images)
scripts/          # migrate_backend.cmd, run_backend.cmd, run_frontend.cmd и др.
```

Бэкенд: `routers/` → тонкий HTTP-слой, `services/` — логика, `models.py`, `schemas.py`, `seed_catalog.py` — идемпотентное наполнение демо-каталога при старте API.

## Локальный запуск

### 1. Бэкенд

```bash
cd backend
python -m venv venv312
venv312\Scripts\activate          # Windows
pip install -r requirements.txt
copy .env.example .env            # настройте SECRET_KEY и при необходимости SMTP
alembic upgrade head
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

- API: http://127.0.0.1:8000  
- Swagger: http://127.0.0.1:8000/docs  

Либо: `scripts\run_backend.cmd`  
Миграции: `scripts\migrate_backend.cmd`

После миграций при старте приложения вызывается **`seed_catalog`**: добавляются только отсутствующие бренды, коллекции и товары (проверка по slug и маркерам).

### 2. Фронтенд

```bash
cd frontend
npm install
# при необходимости: .env.local с NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
npm run dev
```

Открыть http://localhost:3000  

Либо: `scripts\run_frontend.cmd`

### 3. Иконка вкладки

Файл `frontend/public/favicon.png`; в `app/layout.tsx` задано `metadata.icons`.

## Категории товаров (демо)

| Категория              | Примеры назначения                          |
|------------------------|---------------------------------------------|
| **Celebrities**        | Мерч и коллабы знаменитостей, Travis Scott |
| **Sports**             | New Balance                                 |
| **Streetwear**         | Converse                                    |
| **Спорт и streetwear** | Nike, Adidas, Puma, Under Armour          |

## API (кратко)

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/auth/register`, `/auth/login` | Регистрация, JWT |
| GET | `/brands` | Список брендов; `?is_celebrity=true\|false` — фильтр |
| GET | `/collections` | `featured`, `is_featured`, `exclude_celebrity_brands` |
| GET | `/categories` | Категории |
| GET | `/products` | Список: `search`, `category_id`, `brand_id`, `brand_slug`, `collection_id`, `sort` (`popular`, `price_asc`, …) |
| GET | `/products/{id}` | Товар (увеличивает `views_count`) |
| GET | `/collections/{slug}/products` | Товары коллекции |
| POST | `/cart/add`, GET `/cart`, DELETE `/cart/{id}` | Корзина (JWT) |
| POST | `/orders/checkout`, GET `/orders/my` | Заказы (JWT) |
| GET/POST | wishlist, verify и др. | См. `/docs` |
| POST | `/ai/search` | Поиск по фото |

## Переменные окружения (бэкенд)

См. `backend/.env.example`: `SECRET_KEY`, `DATABASE_URL`, `CORS_ORIGINS`, `FRONTEND_BASE_URL`, SMTP для писем.

## Тесты

```bash
cd backend
python -m pytest tests/ -v
```

Отдельно каталог: `python -m pytest tests/test_catalog.py -v`

## Лицензия / назначение

Проект создан в учебных целях.
