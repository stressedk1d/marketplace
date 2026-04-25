# Catalog UI (Next.js + Design System + Visual Search)

Production-oriented e-commerce catalog frontend with visual search and a strict design system layer.

## Overview

This project implements a modern marketplace catalog experience:

- Product discovery through filters, sorting, and pagination
- Visual Search for image-based product matching
- Responsive catalog UX for desktop and mobile
- System-driven UI built on reusable design primitives

The frontend is intentionally architecture-first: UI components consume design system primitives instead of defining ad-hoc styles.

## Design System

Catalog UI is implemented with a lightweight enforced design system under `frontend/app/catalog/ui/`.

- `tokens.ts` - design primitives (radius, shadow, transition, color usage rules)
- `classes.ts` - composable UI primitives (buttons, cards, inputs, chips, overlays, selectable states)
- `rules.ts` - enforcement contract (forbidden patterns, allowed patterns, architecture rule)

Core principle:

**UI is fully system-driven. No ad-hoc styling decisions inside components.**

## Features

- Product catalog with filtering
- Sorting and pagination
- Visual Search (image-based product discovery)
- Responsive layout (desktop sidebar + mobile drawer/sheet)
- Enforced design system UI consistency

## Architecture

- **URL-driven state** - catalog state synchronized with query params
- **Backend-driven data** - no frontend business logic duplication
- **Cached query layer** - deterministic query keys and response caching
- **Separation of concerns**
  - API layer: data fetching and transport
  - UI layer: component composition
  - Design system layer: tokens, classes, and rules

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

## Key Principles

- No styling decisions inside components
- Composition-only UI
- Tokens-first design system
- Backend-driven catalog state

## Project Structure

```text
backend/                         # FastAPI backend
frontend/
  app/catalog/
    components/                 # Catalog UI components (system consumers)
    ui/
      tokens.ts                 # Design tokens
      classes.ts                # UI primitives
      rules.ts                  # Enforcement rules
  lib/                          # API/query integration layer
```

## Local Run

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

If needed, set `NEXT_PUBLIC_API_URL` in `frontend/.env.local`.

## Notes

- Visual Search integration uses backend endpoints and keeps the existing UX flow intact.
- Catalog rendering, filtering UI, and visual states are standardized via `tokens.ts + classes.ts + rules.ts`.
