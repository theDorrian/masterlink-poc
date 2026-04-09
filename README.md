# MasterLink — Find Reliable Tradesmen Instantly

> Enterprise Project PoC — платформа для найма мастеров (сантехники, электрики, плотники, маляры и др.)

---

## Стек технологий

| Часть | Технология |
|-------|-----------|
| Backend | Node.js + Express + SQLite (better-sqlite3) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Web Frontend | React + Vite |
| Routing | React Router v6 |
| HTTP | Axios |

---

## Структура проекта

```
EP_Project_PoC/
├── backend/                       # REST API
│   ├── server.js
│   ├── .env.example
│   ├── db/
│   │   ├── database.js            # SQLite подключение
│   │   ├── schema.sql             # Таблицы
│   │   └── seed.js                # Демо-данные
│   ├── middleware/
│   │   ├── auth.js                # JWT middleware
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── auth.js                # POST /api/auth/register|login, GET /api/auth/me
│   │   ├── tradesmen.js           # GET /api/tradesmen, GET /api/tradesmen/:id
│   │   └── jobs.js                # POST /api/jobs, GET /api/jobs/mine, PATCH /api/jobs/:id/status
│   └── controllers/
│
└── web/                           # React веб-приложение
    ├── .env.example
    └── src/
        ├── api/client.js          # Axios + JWT interceptor
        ├── context/AuthContext.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   └── TradesmanCard.jsx
        └── pages/
            ├── LandingPage.jsx    # Главная с hero и категориями
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── SearchPage.jsx     # Поиск + фильтры
            ├── TradesmanDetailPage.jsx
            ├── JobRequestPage.jsx
            ├── MyJobsPage.jsx
            └── ProfilePage.jsx
```

---

## Локальный запуск

### Требования

- [Node.js](https://nodejs.org/) v18+
- Браузер

---

### 1. Клонировать репозиторий

```bash
git clone https://github.com/theDorrian/masterlink-poc.git
cd masterlink-poc
```

---

### 2. Запустить Backend

```bash
cd backend

# Установить зависимости
npm install

# Создать .env из шаблона
cp .env.example .env

# Заполнить базу демо-данными
npm run seed

# Запустить сервер
npm run dev
```

Сервер запустится на `http://localhost:3000`

Проверка: открой в браузере `http://localhost:3000/health` → должно вернуть `{"status":"ok"}`

---

### 3. Запустить Web Frontend

Открыть **новый терминал** (backend должен продолжать работать):

```bash
cd web

# Установить зависимости
npm install

# Создать .env из шаблона
cp .env.example .env

# Запустить dev-сервер
npm run dev
```

Открыть в браузере: **`http://localhost:5173`**

---

## Демо аккаунты

Все аккаунты используют пароль: **`password123`**

| Роль | Email | Специальность |
|------|-------|---------------|
| Клиент | alice@example.com | — |
| Клиент | bob@example.com | — |
| Мастер | mike.j@example.com | Plumber (Лондон) |
| Мастер | david.c@example.com | Electrician (Лондон) |
| Мастер | robert.s@example.com | Carpenter (Лондон) |
| Мастер | sarah.o@example.com | Electrician (Манчестер) |
| Мастер | tom.m@example.com | Plumber (Манчестер) |
| Мастер | aisha.p@example.com | Painter (Лондон) |
| Мастер | lucas.f@example.com | Carpenter (Бирмингем) |
| Мастер | yuki.t@example.com | Painter (Лондон) |

---

## Сценарий демо

```
1. Открыть http://localhost:5173
2. Log in как alice@example.com (клиент)
3. Search → увидеть список мастеров
4. Выбрать фильтр "Plumber" в боковой панели → Apply
5. Нажать "View Profile" на Mike Johnson
6. Нажать "Request Job" → заполнить форму → Send Request
7. Открыть My Jobs → видна заявка со статусом "Pending"

8. Log out → Log in как mike.j@example.com (мастер)
9. Открыть Requests → видна входящая заявка
10. Нажать "Accept"

11. Log out → Log in снова как alice
12. My Jobs → статус изменился на "Accepted"
13. Нажать "Mark as Completed"
```

---

## API Endpoints

### Auth

| Метод | Путь | Тело | Описание |
|-------|------|------|----------|
| `POST` | `/api/auth/register` | `name, email, password, role, [trade, hourly_rate, city]` | Регистрация |
| `POST` | `/api/auth/login` | `email, password` | Вход, возвращает JWT |
| `GET` | `/api/auth/me` | — | Текущий пользователь (Bearer) |

### Мастера

| Метод | Путь | Query params | Описание |
|-------|------|------|----------|
| `GET` | `/api/tradesmen` | `trade, city, min_rate, max_rate, min_rating, available` | Список с фильтрами |
| `GET` | `/api/tradesmen/:id` | — | Профиль + отзывы |

### Заявки (требуют Authorization: Bearer `<token>`)

| Метод | Путь | Описание |
|-------|------|----------|
| `POST` | `/api/jobs` | Создать заявку (только клиент) |
| `GET` | `/api/jobs/mine` | Мои заявки (роль-зависимо) |
| `PATCH` | `/api/jobs/:id/status` | Обновить статус |

---

## Деплой

### Backend → Railway

1. Зарегистрироваться на [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo → выбрать этот репозиторий
3. Указать **Root Directory**: `backend`
4. Добавить переменные окружения:
   ```
   JWT_SECRET=your_random_secret_here
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   PORT=3000
   ```
5. После деплоя скопировать URL (например `https://masterlink-api.up.railway.app`)
6. Выполнить seed через Railway CLI или встроенный терминал: `node db/seed.js`

### Frontend → Vercel

1. Зарегистрироваться на [vercel.com](https://vercel.com)
2. New Project → Import из GitHub → выбрать этот репозиторий
3. Указать **Root Directory**: `web`
4. Добавить переменную окружения:
   ```
   VITE_API_URL=https://masterlink-api.up.railway.app
   ```
5. Deploy → получить URL вида `https://masterlink-poc.vercel.app`

---
