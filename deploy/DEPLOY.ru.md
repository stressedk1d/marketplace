# Деплой VogueWay из приватного репозитория

Стек: **PostgreSQL + FastAPI + Next.js + Nginx**. Один `docker compose up` на VPS.

## Что нужно

| Что | Зачем |
|-----|--------|
| VPS **4 GB RAM** | поиск по фото включён по умолчанию; на 2 GB отключите в `.env` |
| Ubuntu 22.04+ | Docker и Docker Compose |
| Приватный GitHub | Deploy key или PAT для клонирования |
| Домен (опционально) | A-запись на IP сервера |
| Gmail SMTP | Письма при регистрации и заказе |

## Быстрый старт на VPS

```bash
# 1. Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# перелогиньтесь в SSH

# 2. Клон (приватный репо — см. раздел «Приватный GitHub»)
git clone git@github.com:ВАШ_АККАУНТ/marketplace.git
cd marketplace

# 3. Настройка
cp .env.example .env
nano .env   # SECRET_KEY, POSTGRES_PASSWORD, PUBLIC_*_URL, CORS, SMTP, ADMIN_EMAILS

# 4. Запуск
docker compose up -d --build

# 5. Проверка
curl http://127.0.0.1:8000/site/status
```

Откройте в браузере:

- Сайт: `http://ВАШ_IP` (порт 80, nginx → фронт)
- API / Swagger: `http://ВАШ_IP:8000/docs`

В `.env` должны совпадать:

- `PUBLIC_SITE_URL` = URL сайта (например `http://203.0.113.10`)
- `PUBLIC_API_URL` = URL API (например `http://203.0.113.10:8000`)
- `CORS_ORIGINS` = тот же URL сайта (можно через запятую несколько)
- `FRONTEND_BASE_URL` = как `PUBLIC_SITE_URL`

После смены `PUBLIC_API_URL` пересоберите фронт: `docker compose up -d --build frontend`.

## Приватный GitHub

**Вариант A — SSH deploy key на сервере**

```bash
ssh-keygen -t ed25519 -C "vps-deploy" -f ~/.ssh/github_deploy -N ""
cat ~/.ssh/github_deploy.pub
```

GitHub → репозиторий → **Settings → Deploy keys → Add** (read-only достаточно).

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/github_deploy
git clone git@github.com:stressedk1d/marketplace.git
```

**Вариант B — Coolify / Dokploy (UI)**

1. Установите [Coolify](https://coolify.io) на VPS (одна команда с их сайта).
2. **+ New Resource → Application → Private GitHub App** (или Deploy Key).
3. Репозиторий, ветка `main` (или `cursor/railway-docker-deploy`).
4. **Build Pack: Docker Compose**, путь `docker-compose.yml`.
5. Переменные из `.env.example` вставить в UI Coolify.
6. Deploy.

Coolify сам подтянет приватный репо и пересоберёт при push.

## Переменные (.env)

| Переменная | Пример |
|------------|--------|
| `POSTGRES_PASSWORD` | длинный пароль |
| `SECRET_KEY` | `openssl rand -hex 32` |
| `PUBLIC_SITE_URL` | `https://shop.example.com` |
| `PUBLIC_API_URL` | `https://api.example.com` или `https://shop.example.com:8000` |
| `CORS_ORIGINS` | URL фронта |
| `ADMIN_EMAILS` | ваш email |
| `SMTP_*` | Gmail |

## Поиск по фото

Включён по умолчанию (`INSTALL_AI=1`, `DISABLE_AI_SEARCH=false`).

Если сервер слабый (OOM при старте или первом поиске), в `.env`:

```env
INSTALL_AI=0
DISABLE_AI_SEARCH=true
```

Затем: `docker compose build --no-cache backend && docker compose up -d`

## HTTPS

На VPS с доменом — Certbot + отдельный nginx или прокси Coolify. Минимально: Cloudflare перед доменом (Flexible SSL) и `PUBLIC_*_URL` на `https://...`.

## Обновление после git push

```bash
cd marketplace
git pull
docker compose up -d --build
```

## Логи и сброс БД

```bash
docker compose logs -f backend
docker compose down -v   # удалит том Postgres (осторожно!)
```
