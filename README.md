# MasterLink — Find Reliable Tradesmen Instantly

> PoC platform for hiring tradesmen in Tajikistan (plumbers, electricians, carpenters, painters, etc.)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express + SQLite (better-sqlite3, WAL mode) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Web Frontend | React 18 + Vite |
| Routing | React Router v6 |
| HTTP | Axios |

---

## Project Structure

```
EP_Project_PoC/
├── backend/
│   ├── server.js
│   ├── .env.example
│   ├── db/
│   │   ├── database.js          # SQLite connection + auto-migrations
│   │   ├── schema.sql           # Table definitions
│   │   └── seed.js              # Demo data (18 tradesmen + reviews)
│   ├── middleware/
│   │   ├── auth.js              # JWT middleware
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tradesmen.js
│   │   ├── jobs.js
│   │   └── reviews.js
│   └── controllers/
│       ├── authController.js
│       ├── jobsController.js
│       ├── tradesmensController.js
│       └── reviewsController.js
│
└── web/
    ├── .env.example
    └── src/
        ├── api/client.js        # Axios instance + JWT interceptor
        ├── context/AuthContext.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   └── TradesmanCard.jsx
        └── pages/
            ├── LandingPage.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── SearchPage.jsx       # Search + sidebar filters
            ├── TradesmanDetailPage.jsx
            ├── JobRequestPage.jsx
            ├── MyJobsPage.jsx       # Job lifecycle + payment flow
            └── ProfilePage.jsx      # Profile, balance, reviews, settings
```

---

## Local Setup

### Requirements

- Node.js v18+

### 1. Clone

```bash
git clone https://github.com/theDorrian/masterlink-poc.git
cd masterlink-poc
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run seed      # populate demo data
npm run dev       # starts on http://localhost:3000
```

Health check: `http://localhost:3000/health` → `{"status":"ok"}`

### 3. Frontend

Open a new terminal:

```bash
cd web
npm install
cp .env.example .env
npm run dev       # starts on http://localhost:5173
```

---

## Demo Accounts

Password for all accounts: **`password123`**

### Customers

| Email |
|-------|
| sarvinoz@example.com |
| alisher@example.com |
| zulfiya@example.com |
| parviz@example.com |
| kamola@example.com |
| maftuna@example.com |

> All customers start with **5 000 TJS** balance.

### Tradesmen

| Email | Name | Trade | City |
|-------|------|-------|------|
| rustam.n@example.com | Rustam Nazarov | Plumber | Dushanbe |
| firuz.r@example.com | Firuz Rahimov | Electrician | Dushanbe |
| bahrom.k@example.com | Bahrom Karimov | Carpenter | Dushanbe |
| sherzod.m@example.com | Sherzod Mirzoev | Electrician | Khujand |
| umed.s@example.com | Umed Safarov | Plumber | Khujand |
| nilufar.r@example.com | Nilufar Rahmatullayeva | Painter | Dushanbe |
| komil.d@example.com | Komil Davlatov | Carpenter | Khujand |
| dilnoza.y@example.com | Dilnoza Yusupova | Painter | Dushanbe |
| nodir.t@example.com | Nodir Toshmatov | Tiler | Dushanbe |
| akbar.n@example.com | Akbar Nazarov | Builder | Dushanbe |
| gulbahor.m@example.com | Gulbahor Mirzoyeva | Painter | Khujand |
| davron.h@example.com | Davron Hakimov | Plumber | Khujand |

---

## Demo Scenario

```
1. Open http://localhost:5173

--- As a customer ---
2. Log in as sarvinoz@example.com
3. Search → browse tradesmen, filter by trade / city
4. Open a tradesman profile → click "Request Job"
5. Fill in the form (Emergency hides the date field) → Submit
6. My Jobs → request appears with status "Pending"

--- As a tradesman ---
7. Log out → log in as rustam.n@example.com
8. Incoming Requests → click "Accept" on the job
9. After finishing the work → click "Mark as Done"
10. Enter hours worked (hours + minutes) → system calculates fee → Submit
    (customer's balance is frozen for the calculated amount)

--- Back as customer ---
11. Log out → log in as sarvinoz@example.com
12. My Jobs → job shows "Done — Awaiting Payment" with cost breakdown
13. Click "Confirm & Pay X TJS" → funds transfer to tradesman
14. Click "⭐ Leave a Review"
```

---

## Payment Flow

```
pending → accepted → done → completed
                   ↘ declined (frozen funds returned)
```

| Step | Who | What happens |
|------|-----|-------------|
| Accept | Tradesman | Job status → `accepted` |
| Mark as Done | Tradesman | Submits hours worked → `final_fee = hours × hourly_rate` → amount frozen from customer balance |
| Confirm & Pay | Customer | Frozen amount transferred to tradesman balance → status → `completed` |
| Decline (from done) | Either | Frozen amount returned to customer |

---

## API Reference

### Auth (no token required for register/login)

| Method | Path | Body | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | `name, email, password, role, [trade, hourly_rate, city]` | Register |
| `POST` | `/api/auth/login` | `email, password` | Login → JWT |
| `GET` | `/api/auth/me` | — | Current user + profile |
| `PUT` | `/api/auth/profile` | `name, [trade, bio, city, hourly_rate, ...]` | Update profile |
| `PUT` | `/api/auth/password` | `current_password, new_password` | Change password |
| `POST` | `/api/auth/topup` | `amount` | Add funds to balance |
| `POST` | `/api/auth/withdraw` | `amount` | Withdraw from balance |
| `PUT` | `/api/auth/payment-method` | `payment_method` | Save payment method |

### Tradesmen

| Method | Path | Query | Description |
|--------|------|-------|-------------|
| `GET` | `/api/tradesmen` | `trade, city, min_rate, max_rate, min_rating, available` | List with filters |
| `GET` | `/api/tradesmen/:id` | — | Profile + reviews |

### Jobs (Bearer token required)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/jobs` | Create job request (customer only) |
| `GET` | `/api/jobs/mine` | My jobs (role-dependent) |
| `PATCH` | `/api/jobs/:id/status` | Update status (`accepted`, `declined`, `done`, `completed`) |

### Reviews (Bearer token required)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/reviews` | Submit review (customer, completed jobs only) |
| `GET` | `/api/reviews/mine` | My reviews (tradesman — reviews received) |

---

## Deployment

### Backend → Railway

1. Sign up at [railway.app](https://railway.app)
2. New Project → Deploy from GitHub → select this repo
3. Set **Root Directory**: `backend`
4. Add environment variables:
   ```
   JWT_SECRET=your_random_secret_here
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   PORT=3000
   ```
5. After deploy, run seed via Railway terminal: `node db/seed.js`

### Frontend → Vercel

1. Sign up at [vercel.com](https://vercel.com)
2. New Project → Import from GitHub → select this repo
3. Set **Root Directory**: `web`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-railway-url.up.railway.app
   ```
5. Deploy
