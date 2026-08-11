# FuelFlow AI 🚗⚡⛽

FuelFlow AI is a sophisticated full-stack geospatial application designed to empower Electric Vehicle (EV) and Compressed Natural Gas (CNG) owners in India. It bridges the gap between infrastructure location, intelligent route planning, and predictive AI to ensure a seamless and efficient travel experience.

## 🌟 Core Features

- **Geospatial Route Infrastructure Detection:** Automatically detects EV and CNG stations strictly along the user's driving path using intelligent coordinate sampling (preventing API exhaustion) and bounding box queries.
- **Arya (AI Copilot):** A conversational, context-aware chatbot powered by Google Gemini that assists users with journey planning, app navigation, and vehicle performance queries.
- **Predictive AI Queue Estimator:** Uses historical context, real-time time-of-day multipliers (handling Indian rush hours), and Gemini AI to predict wait times at specific stations.
- **Smart Charge Doctor:** A performance analysis module that compares actual EV charging kW inputs against expected curves to diagnose battery health and charging efficiency.
- **Dynamic Fallbacks:** Gracefully falls back from real-time OpenStreetMap data to high-quality curated mock data when external APIs rate-limit or fail.

## 🏗️ Architecture & Tech Stack Deep Dive

The application follows a modern monolithic structure in development, where an Express backend simultaneously handles API routing and serves the React frontend via Vite middleware.

### 🎨 Frontend Tech Stack
- **Framework:** **React 19** with **TypeScript**, leveraging modern React concurrency features.
- **Bundler:** **Vite** for ultra-fast Hot Module Replacement (HMR) and optimized production builds.
- **Performance Optimization:** Pages are dynamically imported using `React.lazy()` and `<Suspense>`, reducing the initial JavaScript bundle size by over 60%.
- **Styling & UI:** 
  - **Tailwind CSS (v4)** for highly customizable utility-first styling.
  - **Framer Motion (`motion`)** for fluid, physics-based micro-animations and layout transitions.
  - **Lucide React** for consistent, scalable iconography.
- **Routing:** **React Router v7** (`react-router-dom`), implementing custom `ProtectedRoute` and `GuestRoute` wrappers to handle mock authentication flows.

### ⚙️ Backend Tech Stack
- **Runtime:** **Node.js** with `tsx` for seamless TypeScript execution without pre-compilation during development.
- **Server:** **Express.js** (`server.ts`).
- **Middleware:** 
  - `express-rate-limit` for DDoS protection and API quota management (general routes capped at 100 req/15min, AI routes strictly capped at 30 req/15min to prevent Gemini quota exhaustion).
  - Custom Vite integration (`createServer` from `vite`) running in `middlewareMode` to serve the SPA during development.
- **Production Build:** In production, Express statically serves the compiled `/dist` directory.

### 🔌 APIs & Integrations

1. **Google Maps Platform (`@react-google-maps/api`)**
   - **Directions API:** Calculates optimized driving routes and poly-lines.
   - **Places API:** Used for fallback localized searches.
   - **Geocoding API:** Performs reverse-geocoding to translate coordinates into human-readable City/State formats.
   - **Geometry Library:** Powers the decoding of poly-lines and calculating spherical distances between route paths and infrastructure.

2. **Google Gemini API (`@google/genai`)**
   - Utilizes `gemini-3-flash-preview` model.
   - **Use cases:** Powers the "Arya" Copilot chat interface, generates natural language queue trend analysis, and evaluates EV charging curves.

3. **OpenStreetMap Overpass API (Custom Proxy)**
   - **Purpose:** Fetches real-world, live EV and CNG node data without requiring proprietary API keys.
   - **Implementation:** The Express backend acts as a proxy (`/api/overpass-stations`) to formulate complex Overpass QL bounding box queries, bypassing frontend CORS restrictions.

## 🧠 Application Logic & Workflows

### 1. Intelligent Route Sampling
To find stations along a route (e.g., a 1400km trip from Delhi to Mumbai), the app decodes the Google Maps polyline. Instead of querying the entire line, it intelligently samples coordinates every ~20km. It then queries the backend proxy, which constructs a bounding box (`bbox`) to fetch infrastructure within a 5km radius of the route.

### 2. Time-of-Day Queue Prediction Multipliers
The `/api/predict-queue` endpoint dynamically adjusts base charging/fueling times based on local Indian peak hours:
- **Morning Rush (07:00 - 10:00):** 1.8x multiplier.
- **Evening Peak (17:00 - 20:00):** 2.0x multiplier.
- **Nighttime Low (22:00 - 05:00):** 0.4x multiplier.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- A Google Maps API Key (with Directions, Places, and Geocoding APIs enabled)
- A Google Gemini API Key

### Environment Setup
Create a `.env` file in the root directory:
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
GEMINI_API_KEY=your_gemini_api_key
```

### Installation & Execution
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the integrated Vite/Express development server:
   ```bash
   npm run dev
   ```
   *The server will start on `http://localhost:3000`.*

## 📂 Project Structure
```text
├── server.ts               # Express backend, Overpass proxy, and AI endpoints
├── src/
│   ├── components/         # Reusable UI (Hero, SmartChargeDoctor, AIInsights)
│   ├── hooks/              # Custom React hooks (useAuth)
│   ├── pages/              # Lazy-loaded views (Dashboard, QueuePredictor)
│   ├── services/           # External API handlers (geminiService, overpassService)
│   └── App.tsx             # Route definitions and Suspense boundary
├── context.md              # Detailed internal architectural context
└── tasks.md                # Ongoing development tasks and roadmaps
```

## ⚠️ Known Limitations
- **Overpass API Timeouts:** The public OpenStreetMap Overpass API often rate-limits or times out during heavy bounding box queries (`HTTP 504 Gateway Timeout`). Future iterations plan to integrate localized JSON dumps (`all_station_files`) or implement backend Redis caching to mitigate this.

---
*Built for sustainable transport. Driven by AI.*
