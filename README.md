# VogueWay — маркетплейс модной одежды

Полнофункциональный маркетплейс с каталогом товаров, корзиной, системой заказов, отзывами, визуальным поиском по фото и админ-панелью.

**Стек:** PostgreSQL · FastAPI · Next.js · Nginx · Docker

**Демо:** [http://5.42.112.54](http://5.42.112.54) · **Домен:** [vogueway.ru](http://vogueway.ru)

## Возможности

### Покупатели

- Каталог с фильтрами (бренд, тип, цена), сортировкой и пагинацией
- Визуальный поиск — загрузите фото и найдите похожие товары (CLIP)
- Сравнение до 3 товаров, избранное, недавно просмотренные и рекомендации
- Карточка товара с галереей, выбором размера, вкладками (описание, бренд, отзывы)
- Корзина с изменением количества и мини-drawer в шапке
- Оформление заказа: адрес доставки, промокоды (WELCOME10, SAVE500), баллы лояльности
- История заказов с отслеживанием статусов и адресом доставки
- Отзывы с рейтингом (1–5 звёзд) на каждый товар
- Личный кабинет — профиль, смена пароля, баллы лояльности
- Бренды, коллекции, знаменитости — отдельные разделы
- PWA (manifest), тёмная тема, адаптивная вёрстка

### Администраторы

- Статистика: пользователи, товары, заказы, выручка, графики за 7 дней
- Управление заказами — смена статусов (оформлен → оплачен → отправлен → доставлен)
- CRUD товаров — создание, редактирование, удаление
- Список пользователей
- Режим технических работ

### Инфраструктура

- Docker Compose — один `docker compose up` поднимает всё
- Nginx — reverse proxy на порту 80
- PostgreSQL 16 — продакшен-БД
- Alembic — автоматические миграции при старте
- JWT-авторизация с bcrypt-хешированием паролей
- SMTP-уведомления (Gmail)

## Технологический стек

| Слой | Технология |
|------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| Backend | FastAPI, SQLAlchemy, Alembic, Pydantic |
| БД (dev) | SQLite |
| БД (prod) | PostgreSQL 16 |
| AI/Поиск | sentence-transformers, CLIP (PyTorch CPU) |
| Контейнеры | Docker, Docker Compose |
| Прокси | Nginx 1.27 |

## Структура проекта

```
my_marketplace/
├── backend/
│   ├── routers/          # API-роутеры (auth, catalog, cart, orders, wishlist, admin, reviews, ai_search, site)
│   ├── services/         # Бизнес-логика
│   ├── alembic/          # Миграции БД
│   ├── models.py         # SQLAlchemy-модели
│   ├── schemas.py        # Pydantic-схемы
│   ├── main.py           # Точка входа FastAPI
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── catalog/      # Каталог с дизайн-системой
│   │   ├── product/[id]/ # Карточка товара
│   │   ├── cart/          # Корзина
│   │   ├── checkout/      # Оформление заказа
│   │   ├── orders/        # История заказов
│   │   ├── wishlist/      # Избранное
│   │   ├── compare/       # Сравнение товаров
│   │   ├── account/       # Личный кабинет
│   │   ├── admin/         # Админ-панель
│   │   ├── brands/        # Бренды
│   │   ├── celebrities/   # Знаменитости
│   │   ├── collections/   # Коллекции
│   │   ├── about/         # О нас
│   │   ├── contacts/      # Контакты
│   │   ├── faq/           # Частые вопросы
│   │   ├── privacy/       # Политика конфиденциальности
│   │   ├── terms/         # Пользовательское соглашение
│   │   ├── login/         # Вход
│   │   ├── register/      # Регистрация
│   │   ├── forgot-password/ # Запрос через поддержку (mailto)
│   │   ├── components/    # Header, Footer, Breadcrumbs, Toast, и др.
│   │   └── not-found.tsx  # Кастомная 404
│   ├── lib/               # API-клиент, контексты, хуки
│   ├── public/            # Статика (иконки, изображения)
│   ├── Dockerfile
│   └── package.json
├── deploy/
│   ├── nginx.conf         # Конфигурация Nginx
│   └── DEPLOY.ru.md       # Инструкция по деплою
├── docs/
│   ├── demo-dod.md        # Чеклист готовности к демо
│   └── demo-script.ru.md  # Сценарий защиты (5–7 мин)
├── docker-compose.yml     # Продакшен-стек
├── .env.example           # Шаблон переменных окружения
└── README.md
```

## Быстрый старт (локально)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac
pip install -r requirements.txt
copy .env.example .env       # заполнить переменные
alembic upgrade head
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Откройте http://localhost:3000. API доступен на http://localhost:8000/docs.

## Деплой на VPS (продакшен)

```bash
# 1. Установить Docker
curl -fsSL https://get.docker.com | sh

# 2. Склонировать репозиторий
git clone git@github.com:stressedk1d/marketplace.git
cd marketplace

# 3. Настроить переменные
cp .env.example .env
nano .env   # SECRET_KEY, POSTGRES_PASSWORD, PUBLIC_*_URL, CORS, SMTP, ADMIN_EMAILS

# 4. Запустить
docker compose up -d --build

# 5. Применить миграции (если не применились при старте)
docker compose exec backend alembic upgrade head

# 6. Проверить
docker compose ps
curl http://127.0.0.1:8000/site/status
```

Подробная инструкция: [deploy/DEPLOY.ru.md](deploy/DEPLOY.ru.md)

## Переменные окружения

| Переменная | Описание | Пример |
|-----------|----------|--------|
| `POSTGRES_PASSWORD` | Пароль БД | длинный пароль |
| `SECRET_KEY` | Ключ JWT | `openssl rand -hex 32` |
| `PUBLIC_SITE_URL` | URL сайта | `http://vogueway.ru` |
| `NEXT_PUBLIC_SITE_URL` | URL для OG-превью (сборка фронта) | как `PUBLIC_SITE_URL` |
| `PUBLIC_API_URL` | URL API | `http://vogueway.ru:8000` |
| `CORS_ORIGINS` | Разрешённые домены | URL фронта |
| `ADMIN_EMAILS` | Email администраторов | `admin@example.com` |
| `INSTALL_AI` | Установить AI-зависимости | `1` или `0` |
| `DISABLE_AI_SEARCH` | Отключить поиск по фото | `false` или `true` |
| `SMTP_USER` | Gmail для уведомлений | `mail@gmail.com` |

## API-эндпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/auth/register` | Регистрация |
| POST | `/auth/login` | Вход (JWT) |
| GET/PATCH | `/auth/profile` | Профиль пользователя |
| GET | `/products` | Каталог с фильтрами |
| GET | `/products/{id}` | Карточка товара |
| GET/POST | `/products/{id}/reviews` | Отзывы на товар |
| POST | `/cart/add` | Добавить в корзину |
| GET | `/cart` | Содержимое корзины |
| PATCH/DELETE | `/cart/{id}` | Изменить/удалить позицию |
| POST | `/orders/checkout` | Оформить заказ (адрес, промокод) |
| GET | `/orders/my` | Мои заказы |
| POST | `/promo/validate` | Проверка промокода |
| POST/DELETE | `/wishlist/{id}` | Избранное |
| GET | `/brands` | Список брендов |
| GET | `/collections` | Коллекции |
| POST | `/ai/search` | Поиск по фото |
| GET/POST/PATCH/DELETE | `/admin/*` | Админ-панель (в т.ч. `/admin/analytics`) |

Swagger UI: `http://localhost:8000/docs`

## Тестирование

```bash
# Backend (72+ тестов)
cd backend && pytest

# Frontend — production-сборка
cd frontend && npm run build

# E2E smoke (Playwright, опционально)
cd frontend && npx playwright test
```

Демо-промокоды после seed: **WELCOME10** (−10%), **SAVE500** (−500 ₽ от 3000 ₽).

## Документация

- [Чеклист готовности к демо](docs/demo-dod.md)
- [Сценарий защиты (5–7 мин)](docs/demo-script.ru.md)
- [Деплой на VPS](deploy/DEPLOY.ru.md)

## Обновление

```bash
cd marketplace
git pull
docker compose up -d --build
docker compose exec backend alembic upgrade head
```

## Автор

Громов Игорь Владимирович — дипломный проект
