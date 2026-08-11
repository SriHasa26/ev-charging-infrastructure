# FuelFlow AI - Project Context

## Project Overview
FuelFlow AI is a geospatial React application designed for Electric Vehicle (EV) and Compressed Natural Gas (CNG) owners in India. It assists users with routing, locating charging and fueling stations, predicting queue wait times, and provides AI-driven recommendations using Google Gemini.

## System Architecture
The project follows a standard modern full-stack application architecture:
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js server running via Vite middleware (`server.ts`)
- **APIs**:
  - Google Maps API (Directions, Places, Geocoding)
  - Google Gemini API (AI chatbot, queue prediction, performance analysis)

## Core Components
1. **Routing and Mapping**
   - The application uses `@react-google-maps/api` to render maps and route poly-lines.
   - It implements intelligent sampling of route points to find relevant stations within a 5km radius of the driving path without exceeding API rate limits.
2. **AI Copilot (Arya)**
   - A floating chatbot powered by `gemini-3-flash-preview` that provides real-time, context-aware advice for the journey.
3. **Queue Predictor**
   - A dedicated page and feature that estimates wait times for EV/CNG stations using Gemini-based inference.
4. **Smart Charge Doctor**
   - Analyzes charging efficiency by comparing actual vs. expected charging speeds.

## Key Files & Directories
- `server.ts`: The Express backend serving mock APIs (`/api/stations`, `/api/predict-queue`) and Vite frontend in development.
- `src/pages/`: Contains the main application views (`LandingPage`, `Dashboard`, `QueuePredictor`, `LoginPage`, `SignupPage`).
- `src/services/geminiService.ts`: Encapsulates all interactions with the Google Gemini API.
- `src/hooks/useAuth.tsx`: Provides mock authentication context and state management for users.
- `src/constants/stations.ts`: Contains fallback static geographical data for EV and CNG stations across major Indian routes.

## Current State
The project is a fully functional Minimum Viable Product (MVP) with mock backend data and live AI integration. Local development and production builds complete successfully.
