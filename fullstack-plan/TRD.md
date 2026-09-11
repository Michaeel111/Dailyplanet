**Daily-Planet Technical Requirements & Design Document (TRD)**

**Product:** Daily-Planet (Weather App MVP)  
**Version:** 1.0  
**Date:** July 13, 2026  
**Tech Stack Confirmed:**  
- **Frontend:** Next.js 14+ (App Router, React Server Components where applicable)  
- **Backend:** Node.js + Express.js  
- **Database:** MySQL (with Prisma ORM recommended)  
- **Others:** Paystack, Weather API (Open-Meteo primary), Email service

---

### 1. Architecture Overview

**High-Level Architecture:**
- **Monorepo** (recommended) using Turborepo or separate repos (frontend + backend).
- **Frontend:** Next.js web app (can be deployed as PWA for mobile-like experience).
- **Backend:** Separate Express.js API server (RESTful).
- **Database:** MySQL hosted on PlanetScale, Railway, or AWS RDS.
- **Deployment:** Vercel (Next.js) + Render/Heroku/ Railway (Express + MySQL).
- **Communication:** Frontend calls Backend API (or uses Next.js API routes for simpler MVP if combining).

**Data Flow:**
1. User → Next.js Frontend → Express Backend API → MySQL / External APIs.
2. Cron jobs (node-cron or Vercel Cron) → Fetch weather → Check alert conditions → Send emails.

---

### 2. Database Schema (MySQL)

```sql
-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- hashed with bcrypt
    name VARCHAR(100),
    preferred_units ENUM('metric', 'imperial') DEFAULT 'metric',
    is_premium BOOLEAN DEFAULT FALSE,
    premium_expires_at DATETIME NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Saved Locations
CREATE TABLE locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    city VARCHAR(100) NOT NULL,
    lat DECIMAL(10,8) NOT NULL,
    lon DECIMAL(11,8) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Alert Preferences (Premium)
CREATE TABLE alert_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    location_id INT NOT NULL,
    alert_types JSON NOT NULL, -- e.g. ["rain", "temp_high", "storm"]
    threshold JSON, -- e.g. {"rain_mm": 5}
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- Subscription Logs (for reconciliation)
CREATE TABLE subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    paystack_reference VARCHAR(255),
    plan VARCHAR(50),
    amount DECIMAL(10,2),
    status ENUM('active', 'cancelled', 'expired'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**ORM Recommendation:** Use **Prisma** for type-safe queries with MySQL.

---

### 3. Backend (Node.js + Express)

**Project Structure:**
```
/backend
├── src/
│   ├── config/          # db, env, paystack
│   ├── controllers/     # auth, weather, user, subscription
│   ├── routes/          # auth.routes.js, etc.
│   ├── middleware/      # auth, errorHandler, validate
│   ├── services/        # weatherService, emailService, cronJobs
│   ├── utils/           # helpers
│   └── server.js
├── prisma/              # schema.prisma
└── package.json
```

**Key Endpoints (REST API):**

| Method | Endpoint                    | Description                          | Auth Required |
|--------|-----------------------------|--------------------------------------|---------------|
| POST   | `/api/auth/register`        | Register user                        | No            |
| POST   | `/api/auth/login`           | Login + JWT                          | No            |
| GET    | `/api/user/profile`         | Get user + locations                 | Yes           |
| PUT    | `/api/user/profile`         | Update profile                       | Yes           |
| POST   | `/api/locations`            | Add saved location                   | Yes           |
| GET    | `/api/weather/current`      | Current weather (by city/latlon)     | Yes           |
| GET    | `/api/weather/forecast`     | 7-day forecast                       | Yes           |
| GET    | `/api/subscription/plans`   | List plans                           | Yes           |
| POST   | `/api/subscription/init`    | Initialize Paystack checkout         | Yes           |
| POST   | `/api/webhook/paystack`     | Paystack webhook (verify + activate) | No (signature)|

**Authentication:** JWT (jsonwebtoken) + httpOnly cookies or Authorization Bearer. Refresh tokens optional for MVP.

**Weather Service:**
- Primary: Open-Meteo API (no key needed).
- Example fetch: `https://api.open-meteo.com/v1/forecast?latitude=...&longitude=...&current=...&daily=...`
- Caching: Redis (optional) or in-memory + MySQL for user data.

**Email Alerts:**
- Use **Nodemailer** + Gmail/SendGrid/Resend.
- Cron job (every hour): Query active premium users → fetch latest weather → match preferences → send email.

**Paystack Integration:**
- Use official Paystack Node library or Axios.
- Create subscription plans in Paystack dashboard.
- On successful webhook: Update `is_premium = true` and `premium_expires_at`.

---

### 4. Frontend (Next.js)

**Project Structure:**
```
/frontend
├── app/
│   ├── (auth)/             # login, register pages
│   ├── dashboard/          # home weather
│   ├── profile/
│   ├── api/                # optional route handlers
├── components/
│   ├── WeatherCard.tsx
│   ├── Forecast.tsx
│   ├── SubscriptionModal.tsx
├── lib/
│   ├── api.ts              # axios instance with token
│   └── utils.ts
├── hooks/
└── types/
```

**Key Pages & Features:**
- `/` or `/dashboard`: Current weather + forecast (Server Component fetching via API).
- `/auth/login`, `/auth/register`.
- `/profile`: Manage locations, preferences, subscription status.
- Protected routes using middleware or client-side checks.
- Tailwind CSS + shadcn/ui or custom components for weather icons.
- Responsive + PWA ready (`next-pwa`).

**State Management:** React Context + useSWR or TanStack Query for data fetching/caching.

---

### 5. Security & Best Practices

- **Auth:** Bcrypt for passwords, JWT expiration + refresh.
- **Validation:** Zod + express-validator.
- **Rate Limiting:** express-rate-limit.
- **CORS:** Configured for frontend domain.
- **Environment Variables:** `.env` with `DATABASE_URL`, `JWT_SECRET`, `PAYSTACK_SECRET_KEY`, `WEATHER_API_BASE`.
- **Error Handling:** Centralized middleware.
- **Input Sanitization:** Prevent SQL injection (Prisma handles).
- **HTTPS:** Enforced in production.

---

### 6. Deployment & DevOps

- **Development:** MySQL + backend + frontend.
- **Production:**
  - Frontend → Vercel.
  - Backend → Railway / Render.
  - Database → PlanetScale (serverless MySQL) or AWS RDS.
- **CI/CD:** GitHub Actions.
- **Monitoring:** Sentry or basic logging.
- **Cron Jobs:** Use node-cron on backend server or Vercel Cron Jobs.

---

### 7. Non-Functional Requirements

- **Performance:** API responses < 500ms (weather cached where possible).
- **Scalability:** Horizontal scaling for Express; Prisma + connection pooling.
- **Reliability:** Retry logic for external APIs, fallback weather sources.
- **Testing:** Jest + Supertest (unit/integration), Playwright/Cypress (E2E).
- **Logging:** Winston or Pino.

---

### 8. Implementation Roadmap (MVP)

1. Setup monorepo + Prisma schema + DB connection.
2. Auth system (register/login + JWT).
3. User & Location CRUD.
4. Weather integration (Open-Meteo service).
5. Frontend UI + API consumption.
6. Paystack integration + webhook.
7. Alert system (basic cron + email).
8. Testing + Deployment.

**Estimated Effort:** 4-6 weeks for a solo/full-stack developer.

---

### 9. Recommendations & Next Steps

- Start with **Prisma** + **Zod** for strong typing.
- Use **Open-Meteo** initially — zero cost and excellent docs.
- Test Paystack in **Test Mode** first.
- For emails: Start with Resend (great DX) or Nodemailer.
