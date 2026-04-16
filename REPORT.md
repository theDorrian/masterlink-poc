# MasterLink PoC — Development Report

**Project:** MasterLink — платформа для найма мастеров в Таджикистане  
**Period:** Sprint 1 (PR #3 – PR #5)  
**Stack:** Node.js + Express + SQLite / React 18 + Vite

---

## PR #3 — Tajikistan Localization & Core Features

**Branch:** `feat/tajikistan-localization`

### What was done

- Localized the platform for Tajikistan: currency changed to **TJS/hr**, cities set to **Dushanbe** and **Khujand**
- Added a **date/time picker** for scheduling job requests
- Implemented the **reviews system**: customers can leave a star rating (1–5) and a comment after a job is completed
- Added **Completed Jobs** section on the customer profile page
- Expanded demo dataset: more tradesmen across both cities with realistic Tajik names

---

## PR #4 — English UI, Search & UX Improvements

**Branch:** `feat/english-ui-more-data`

### What was done

- Translated entire UI to **English** (location names and personal names remain Tajik)
- Fixed currency label: `сом/ч` → `tjs/hr` throughout
- Restored the **search bar** and moved it inside the filters sidebar
- **City filter** redesigned as toggle buttons (same style as trade filter)
- Renamed "Trade" filter label → **"Jobs"**
- **Completed Jobs** section turned into a **collapsible accordion** on the profile page with a count badge
- Added a clickable tradesman link inside completed jobs so customers can navigate back to the tradesman's profile
- Profile card width aligned to match the tradesman detail page (removed max-width constraint)
- Logo updated: full word **"Link"** is now orange (previously only the letter "L")
- Added more demo accounts (6 customers, 12 tradesmen) and 18 completed jobs with English reviews

---

## PR #5 — Profile Editing, Balance System & Payment Flow

**Branch:** `feat/profile-balance-payments`

### What was done

#### Profile Settings
- Added **Edit Profile** section: customers can edit their name; tradesmen can also edit trade, bio, city, hourly rate, call-out fee, years of experience and availability toggle
- Added **Change Password** with current password verification
- Added **Payment Method** selector (Visa, Mastercard, PayMe, Click, Bank Transfer, Cash) with account identifier field
- Profile page restructured: info rows in the card, all editable features moved into a collapsible **Settings** section

#### Balance System
- Every user has an **available balance** and a **frozen balance** (escrow)
- Customers can **top up** their balance with any amount
- Users can **withdraw** funds from their available balance
- All customers seeded with **5 000 TJS** starting balance

#### Payment Flow (hours-based escrow)
Implemented a 4-stage job lifecycle with automated fund management:

```
pending → accepted → done → completed
                   ↘ declined (frozen funds returned to customer)
```

| Stage | Who | Action |
|-------|-----|--------|
| **Accept** | Tradesman | Job status → `accepted` |
| **Mark as Done** | Tradesman | Enters hours + minutes worked → system calculates `final_fee = hours × hourly_rate` → amount frozen from customer balance |
| **Confirm & Pay** | Customer | Sees cost breakdown → frozen funds transferred to tradesman → status → `completed` |
| **Decline** (from done) | Either | Frozen funds automatically returned to customer |

- The "Mark as Done" modal uses separate **hours + minutes** inputs (minutes in 5-min increments) with a live cost preview
- Emergency job requests **hide the date/time field** (not needed for urgent jobs)
- Tradesman profile now shows a **"My Reviews"** accordion with all received reviews (star rating + comment + date)
- Completed jobs now display the **actual paid amount** (`final_fee`) instead of the initial budget

#### Schema Migrations
- Added `balance`, `frozen_balance`, `payment_method` columns to `users`
- Added `hours_worked`, `final_fee` columns to `job_requests`
- Added `done` to the job status CHECK constraint via full table recreation migration (SQLite limitation)

---

## Summary

| | PR #3 | PR #4 | PR #5 |
|---|---|---|---|
| Backend changes | Reviews API, seed data | Seed expansion | Auth (profile/password/balance/withdraw), Jobs (escrow logic), Reviews (mine endpoint) |
| Frontend changes | Reviews UI, date picker | Search, filters, UI polish | Profile settings, balance UI, payment flow, Mark Done modal |
| DB schema changes | — | — | 5 new columns + status migration |
| New API endpoints | `POST /api/reviews` | — | `PUT /profile`, `PUT /password`, `POST /topup`, `POST /withdraw`, `PUT /payment-method`, `GET /reviews/mine` |
