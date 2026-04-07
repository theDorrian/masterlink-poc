# MasterLink — Find Reliable Tradesmen Instantly

> Enterprise Project PoC — мобильное приложение для найма мастеров (сантехники, электрики, плотники, маляры и др.)

---

## Скриншоты

| Splash | Логин | Поиск | Фильтры | Профиль мастера | Заявка |
|--------|-------|-------|---------|-----------------|--------|
| Выбор роли | Email + пароль | Список мастеров | По специальности, цене, рейтингу | Отзывы, цены | Описание, фото, срочность |

---

## Стек технологий

| Часть | Технология |
|-------|-----------|
| Backend | Node.js + Express + SQLite (better-sqlite3) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Mobile | React Native + Expo |
| Navigation | React Navigation (Stack + Bottom Tabs) |
| HTTP | Axios |
| Storage | AsyncStorage |

---

## Структура проекта

```
EP_Project_PoC/
├── backend/
│   ├── server.js                  # Express точка входа
│   ├── .env.example               # Шаблон переменных окружения
│   ├── db/
│   │   ├── database.js            # SQLite подключение
│   │   ├── schema.sql             # Таблицы: users, tradesman_profiles, job_requests, reviews
│   │   └── seed.js                # Демо-данные (8 мастеров, 2 клиента)
│   ├── middleware/
│   │   ├── auth.js                # JWT middleware
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── auth.js                # /api/auth
│   │   ├── tradesmen.js           # /api/tradesmen
│   │   └── jobs.js                # /api/jobs
│   └── controllers/
│       ├── authController.js
│       ├── tradesmensController.js
│       └── jobsController.js
│
└── mobile/
    ├── App.js
    ├── .env.example
    └── src/
        ├── api/client.js          # Axios + JWT interceptor
        ├── context/AuthContext.js # Глобальный auth state
        ├── navigation/            # AuthStack + MainTabs
        └── screens/
            ├── SplashScreen.js
            ├── LoginScreen.js
            ├── RegisterScreen.js
            ├── SearchResultsScreen.js
            ├── FilterScreen.js
            ├── TradesmanDetailScreen.js
            ├── JobRequestScreen.js
            ├── MyJobsScreen.js
            └── ProfileScreen.js
```

---

## Локальный запуск

### Требования

- [Node.js](https://nodejs.org/) v18+
- [Expo Go](https://expo.dev/go) на телефоне (iOS или Android)
- Телефон и компьютер в **одной Wi-Fi сети**

### 1. Клонировать репозиторий

```bash
git clone https://github.com/YOUR_USERNAME/masterlink-poc.git
cd masterlink-poc
```

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

Проверка: `curl http://localhost:3000/health` → `{"status":"ok"}`

### 3. Запустить Mobile

```bash
cd mobile

# Установить зависимости
npm install

# Создать .env из шаблона
cp .env.example .env
```

Отредактировать `mobile/.env` — вписать локальный IP компьютера:

```bash
# Узнать IP (macOS/Linux):
ipconfig getifaddr en0

# Узнать IP (Windows):
ipconfig
```

```env
EXPO_PUBLIC_API_URL=http://192.168.X.X:3000
```

> ⚠️ **Важно:** `localhost` не работает с реального устройства — нужен IP компьютера в локальной сети.

```bash
# Запустить Expo
npx expo start --clear
```

Отсканировать QR-код через приложение **Expo Go** на телефоне.

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

### Заявки

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| `POST` | `/api/jobs` | Customer | Создать заявку |
| `GET` | `/api/jobs/mine` | Bearer | Мои заявки (роль-зависимо) |
| `PATCH` | `/api/jobs/:id/status` | Bearer | Обновить статус |

---

## Деплой Backend (Railway)

1. Зарегистрироваться на [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Выбрать папку `backend` как Root Directory
4. Добавить переменные окружения:
   ```
   JWT_SECRET=your_secret_here
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   PORT=3000
   ```
5. После деплоя скопировать URL (например `https://masterlink-backend.up.railway.app`)
6. В `mobile/.env` заменить на этот URL:
   ```
   EXPO_PUBLIC_API_URL=https://masterlink-backend.up.railway.app
   ```

---

## Сценарий демо

```
1. Открыть приложение → Splash Screen
2. "Join as customer" → Войти как alice@example.com
3. Search → увидеть список мастеров
4. Нажать ⚙ → Filters → выбрать "Plumber", нажать "Show Results"
5. Нажать на Mike Johnson → просмотреть профиль
6. "Request Job" → заполнить заявку → "Send Request"
7. Выйти → войти как mike.j@example.com (мастер)
8. Вкладка "Requests" → увидеть входящую заявку → "Accept"
9. Выйти → войти снова как alice → "My Jobs" → статус "Accepted"
```

---

## Лицензия

MIT
