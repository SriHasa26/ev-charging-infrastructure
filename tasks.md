# FuelFlow AI - Task List

## 🔴 Critical Bug Fixes (All Completed ✅)

- [x] **Fix Refresh/Retry buttons** — Added `refetchTrigger` counter state; both buttons now properly increment it so the `useEffect` re-runs. (`QueuePredictor.tsx`)
- [x] **Fix mock station coordinates** — All 6 stations updated from San Francisco to real Indian city coordinates: Delhi, Mumbai, Bengaluru, Hyderabad, Pune, Chennai. (`server.ts`)
- [x] **Fix `/api/predict-queue` random data** — Replaced `Math.random()` with deterministic time-of-day heuristics (morning peak ×1.8, evening peak ×2.0, night ×0.4). (`server.ts`)
- [x] **Wire up "Reserve Slot" button** — Navigates to `/queue-predictor?station=...&type=...` with the selected station pre-filled. (`AIInsights.tsx`)
- [x] **Make SmartChargeDoctor interactive** — Added dual sliders for expected/actual kW, debounced Gemini calls, real-time efficiency bar, and color-coded diagnosis. (`SmartChargeDoctor.tsx`)
- [x] **Fix routeService random queue times** — Replaced `Math.random()` with time-of-day logic matching backend. (`routeService.ts`)

## 1. Backend & Database Integration

- [x] **Fix deterministic predictions** — `/api/predict-queue` now uses time-of-day peak multipliers instead of random numbers.
- [ ] **Replace Mock Data with real DB** — Replace `stations` array in `server.ts` with a real database (PostgreSQL via Supabase or MongoDB).
- [ ] **Database Schema Design** — Design schemas for `Users`, `Stations`, `Reviews`, and `Sessions`.
- [x] **Fix station coordinates** — Updated from San Francisco to 6 real Indian city locations.
- [ ] **Live Station Data** — Integrate with real-time India EV/CNG APIs (e.g., EVSE portal, PlugShare API).

## 2. Auth & Security

- [x] **Password validation** — `useAuth.tsx` now hashes passwords, validates minimum length, checks for account existence, and prevents duplicate signups.
- [x] **Protected Routes** — `App.tsx` now has `ProtectedRoute` and `GuestRoute` wrappers; `/dashboard` and `/queue-predictor` redirect to `/login` if not authenticated.
- [x] **Login page** — Shows inline error banner, show/hide password toggle, loading spinner, clears errors on typing.
- [x] **Signup page** — Confirm password field with match indicator, password strength bar, show/hide toggle, inline errors.
- [x] **Rate Limiting** — `express-rate-limit` installed; 100 req/15min general limiter on `/api/*`, strict 30 req/15min limiter on `/api/predict-queue`. (`server.ts`)
- [ ] **Secret Management** — Ensure no hardcoded API key fallbacks remain in production builds. Rotate keys before deployment.
- [ ] **Real Auth Provider** — Upgrade from localStorage-based hash auth to Firebase Auth or Supabase Auth with server-side JWT verification.

## 3. Gemini AI Enhancements

- [x] **Robust Error Handling** — `geminiService.ts` now has an exponential-backoff retry wrapper (max 2 retries) for 429/5xx errors. `chatWithAryaStream` returns a graceful fallback stream instead of re-throwing.
- [x] **Context Injection** — `chatWithAryaStream` accepts `AryaContext` (user name, vehicle type, origin, destination, station count, selected station) and injects it into the system instruction. Dashboard passes live route state to `<Chatbot />`.
- [x] **Model upgrade** — All Gemini calls updated to `gemini-2.0-flash`.
- [ ] **Queue ML Model** — Train or fine-tune a time-series model (Prophet/LSTM) for queue prediction instead of relying entirely on Gemini heuristics.

## 4. UI/UX & Frontend Optimization

- [x] **Code Splitting** — All 5 page components now use `React.lazy` + `Suspense` with a full-screen loader. Eliminates the >500kB bundle warning. (`App.tsx`)
- [ ] **PWA Support** — Configure `vite-plugin-pwa` to allow offline access to cached station data.
- [ ] **Internationalization (i18n)** — Add `react-i18next` with Hindi and regional Indian languages.

## 5. Maps & Geospatial Features

- [x] **Fix random queue times on map** — `routeService.ts` now uses time-of-day logic; also adds a `congestionLevel` field per station.
- [x] **Live Navigation** — "Open in Maps" button now deep-links to Google Maps with origin, station waypoints, and destination encoded in the URL. (`Dashboard.tsx`)
- [ ] **Intelligent Sampling** — Currently samples every 20km flat. Implement adaptive sampling based on route density and vehicle range.
- [ ] **Station Check-in** — Allow users to check in at stations to crowd-source real-time wait times.

## 6. Testing

- [ ] **Unit tests** — Write Vitest unit tests for `routeService.ts` (polyline decoding, sampling, time-of-day logic).
- [ ] **E2E tests** — Write Playwright tests for the route planning flow and queue prediction flow.
- [ ] **Auth tests** — Test login, signup, duplicate account, and wrong password flows.

---

> **Overall progress:** ~65% of planned improvements implemented. Priority 1 (all critical bugs) = ✅ Done. Priority 2 (core features) = ✅ Done. Remaining: real database, real auth provider, ML model, i18n, PWA, tests.
