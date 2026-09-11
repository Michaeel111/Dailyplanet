
# Project Development Plan: Weather App

## 1. Overview
- **What is this app?** A web app that lets users search for a city and see current weather + a 7-day forecast, with the option to save favorite cities.
- **Who is it for?** Anyone who wants a quick, simple weather lookup tool.
- **Core problem it solves:** Quick access to weather info for cities the user cares about, without digging through a cluttered weather site.

## 2. Core Features
- [ ] Search weather by city name
- [ ] Show current conditions (temp, humidity, wind, description)
- [ ] 7-day forecast
- [ ] Save/view favorite cities (requires login + database)
- [ ] Premium subscription via Paystack (perk TBD — see Open Questions)

## 3. Backend Plan

### Data Models

```
User
- name: String
- email: String
- password: String (hashed)
- isPremium: Boolean (default false)

Payment
- userId: ObjectId (linked to User)
- reference: String (Paystack transaction reference)
- amount: Number
- status: String (pending/success/failed)

FavoriteCity
- userId: ObjectId (linked to User)
- cityName: String
- lat: Number
- lon: Number
```

### API Routes
| Method | Route | Purpose | Auth required? |
|--------|-------|---------|-----------------|
| POST   | /api/users/signup | Create a user | No |
| POST   | /api/users/login  | Log in         | No |
| GET    | /api/weather/:city | Fetch current + forecast for a city | No |
| POST   | /api/favorites | Save a favorite city | Yes |
| GET    | /api/favorites | Get user's saved cities | Yes |
| DELETE | /api/favorites/:id | Remove a favorite | Yes |
| POST | /api/payments/paystack | Initialize a Paystack payment | Yes |
| POST | /api/payments/webhook | Paystack webhook — confirm payment, upgrade user to premium | No (secured via Paystack signature) |

### Auth Strategy
- [ ] Sessions / [ ] JWT / [ ] Third-party (e.g. Google login)

### Core Business Logic
- Handle weather API errors gracefully (e.g. city not found, API down)
- Only logged-in users can save/view/delete favorites
- Premium features locked behind `isPremium` check
- Verify Paystack webhook signature before trusting payment confirmation

## 4. Frontend Plan

### Pages / Screens
- [ ] Home (search + current weather)
- [ ] Forecast view
- [ ] Favorites list
- [ ] Login / Signup
- [ ] Upgrade / Pricing page

### Components (reusable pieces)
- [ ] SearchBar
- [ ] WeatherCard
- [ ] ForecastList
- [ ] FavoriteButton
- [ ] Navbar
- [ ] PaystackButton (triggers Paystack popup/inline widget)

### State & Data Flow
- Current search result (weather data for searched city)
- List of favorite cities
- Loading / error states (weather API calls can fail)
- Whether current user is premium (to conditionally show upgrade prompts / premium features)


### Styling Approach
- [ ] Plain CSS / [ ] Tailwind / [ ] Other:

## 5. Tech Stack
- Backend: Node.js + Express
- Database: mySQL
- Frontend: Next.js
- Weather Data: OpenWeatherMap API
- Hosting/Deployment: - Frontend → Vercel.
  - Backend → Railway / Render.
  - Database → PlanetScale (serverless MySQL) or AWS RDS.
- **CI/CD:** GitHub Actions.
- **Monitoring:** Sentry or basic logging.
- **Cron Jobs:** Use node-cron on backend server or Vercel Cron Jobs.
