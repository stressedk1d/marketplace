# VogueWay — маркетплейс модной одежды

Полнофункциональный маркетплейс с каталогом товаров, корзиной, системой заказов, отзывами, визуальным поиском по фото и админ-панелью.

**Стек:** PostgreSQL · FastAPI · Next.js · Nginx · Docker

**Демо:** [http://5.42.112.54](http://5.42.112.54) · **Домен:** [vogueway.ru](http://vogueway.ru)

## Возможности

### Покупатели

- Каталог с фильтрами (бренд, тип, цена), сортировкой и пагинацией
- Визуальный поиск — загрузите фото и найдите похожие товары (CLIP)
- Карточка товара с галереей, выбором размера, вкладками (описание, бренд, отзывы)
- Корзина с изменением количества, избранным и шерингом
- Страница оформления заказа с адресом доставки
- Избранное с возможностью добавить товар в корзину
- История заказов с отслеживанием статусов
- Отзывы с рейтингом (1–5 звёзд) на каждый товар
- Личный кабинет — редактирование профиля, смена пароля
- Бренды, коллекции, знаменитости — отдельные разделы

### Администраторы

- Статистика: пользователи, товары, заказы, выручка
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
│   │   ├── forgot-password/ # Восстановление пароля
│   │   ├── components/    # Header, Footer, Breadcrumbs, Toast, и др.
│   │   └── not-found.tsx  # Кастомная 404
│   ├── lib/               # API-клиент, контексты, хуки
│   ├── public/            # Статика (иконки, изображения)
│   ├── Dockerfile
│   └── package.json
├── deploy/
│   ├── nginx.conf         # Конфигурация Nginx
│   └── DEPLOY.ru.md       # Инструкция по деплою
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

# 5. Проверить
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
| POST | `/orders/checkout` | Оформить заказ |
| GET | `/orders/my` | Мои заказы |
| POST/DELETE | `/wishlist/{id}` | Избранное |
| GET | `/brands` | Список брендов |
| GET | `/collections` | Коллекции |
| POST | `/ai/search` | Поиск по фото |
| GET/POST/PATCH/DELETE | `/admin/*` | Админ-панель |

Swagger UI: `http://localhost:8000/docs`

## Обновление

```bash
cd marketplace
git pull
docker compose up -d --build
```

## Автор

Громов Игорь Владимирович — дипломный проект
