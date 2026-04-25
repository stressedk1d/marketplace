# Catalog UI (Next.js + Design System + Visual Search)

Frontend-каталог e-commerce проекта, ориентированный на production-качество: visual search, строгая дизайн-система и консистентный UI.

## Обзор

Проект реализует современный пользовательский сценарий маркетплейса:

- Поиск товаров через фильтры, сортировку и пагинацию
- Visual Search (поиск по фото)
- Полностью адаптивный интерфейс (desktop + mobile)
- UI, построенный на слое дизайн-системы

Архитектурный принцип: компоненты не принимают локальные стилистические решения, а используют системные примитивы.

## Design System

Слой дизайн-системы расположен в `frontend/app/catalog/ui/`:

- `tokens.ts` — дизайн-токены (радиусы, тени, transitions, правила цвета)
- `classes.ts` — композиционные UI-примитивы (buttons, cards, inputs, chips, overlays и т.д.)
- `rules.ts` — правила enforcement (запрещенные и разрешенные паттерны)

Ключевой принцип:

**UI полностью управляется системой. Никакого ad-hoc стилизования внутри компонентов.**

## Возможности

- Каталог товаров с фильтрацией
- Сортировка и пагинация
- Visual Search (поиск похожих товаров по изображению)
- Responsive layout (desktop sidebar + mobile drawer/sheet)
- Принудительная консистентность UI через design system layer

## Архитектура

- **URL-driven state** — состояние каталога синхронизировано с query params
- **Backend-driven data** — бизнес-логика не дублируется во frontend
- **Cached query layer** — детерминированные query keys и кеширование ответов
- **Separation of concerns**
  - API слой: запросы и транспорт данных
  - UI слой: композиция интерфейса
  - Design system слой: tokens, classes, rules

## Технологический стек

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

## Ключевые принципы

- Нет стилистических решений внутри компонентов
- Composition-only UI
- Tokens-first design system
- Backend-driven состояние каталога

## Структура проекта

```text
backend/                         # FastAPI backend
frontend/
  app/catalog/
    components/                 # Каталог-компоненты (потребители системы)
    ui/
      tokens.ts                 # Дизайн-токены
      classes.ts                # UI-примитивы
      rules.ts                  # Правила enforcement
  lib/                          # API/query слой интеграции
```

## Локальный запуск

### Backend

```bash
cd backend
python -m venv venv312
venv312\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
alembic upgrade head
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

При необходимости укажите `NEXT_PUBLIC_API_URL` в `frontend/.env.local`.

## Примечания

- Visual Search использует backend endpoints и сохраняет текущий UX flow.
- Отрисовка каталога, фильтры и визуальные состояния стандартизованы через `tokens.ts + classes.ts + rules.ts`.
