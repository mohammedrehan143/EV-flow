# EV-Flow: Next-Gen Electric Vehicle Charging & Grid Infrastructure Platform

[![Vite](https://img.shields.io/badge/Frontend-Vite%20%7C%20React%2019-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-000000?style=flat&logo=express)](https://expressjs.com/)
[![Database](https://img.shields.io/badge/Database-Supabase%20%7C%20Fallback-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Map](https://img.shields.io/badge/Map-Leaflet%20%7C%20React--Leaflet-199900?style=flat&logo=leaflet)](https://leafletjs.com/)

An end-to-end, high-performance Electric Vehicle (EV) charging station management and slot booking platform built for real-time grid monitoring, distance-locked reservation holds, employee clearance management, and high-availability deployment on **Vercel** and **Render**.

---

## 🌟 Architecture & Core Capabilities

### 1. 📍 Interactive Leaflet Grid Map & Custom Neon Green Markers
- Custom Leaflet dark tile map rendering **20 active EV charging hubs** across Bengaluru (**Yelahanka, Hebbal, RT Nagar, Nagavara, Central Bengaluru**).
- High-visibility glowing green EV station pins (`#00ff88`) with pulse radar animations and SVG charging indicators.
- **Click-to-Focus Interaction**: Clicking any station pin or popup button automatically zooms the map to `level 15` and smoothly scrolls the sidebar into view.

### 2. ⚡ Distance-Locked 2km Booking System
- Uses the Haversine formula to compute exact distance from user's current GPS coordinates to target charging stations.
- Enforces a strict **2km proximity limit**: booking is enabled only when the user is within range.

### 3. 🚘 Driver & Vehicle Modal with 10-Minute Hold Countdown
- Prompts for **Driver Name** and **Vehicle Registration Number** (e.g. `KA 04 EV 1234`).
- Activates a live **10-minute (`10:00` -> `00:00`) countdown timer** banner on booking confirmation.
- Includes a **"Cancel Booking"** button under the timer to manually release the slot.
- Automatically releases the slot and notifies the driver if the 10-minute hold timer expires.

### 4. 🔐 Restricted Employee Command Center
- Role-based clearance terminal with case-insensitive authentication.
- **Master Admin Passkey (`ADMIN123`)**: Unlocks global access over all 20 stations.
- **Station Clearance Passkeys**: Unlocks individual station management (e.g., `YELAHANKA10`, `HEBBAL14`, `RTNAGAR17`).
- Live node reactivation/deactivation and station passkey updates.

### 5. 📊 Dynamic Page Hits Counter
- Live tracking of **Page Hits Today** and **Total Page Hits** displayed on the Home page hero stats section.

### 6. 🗄️ Zero-Downtime Database Resilience
- Dual-database layer: Primary connection to **Supabase PostgreSQL** with an automatic in-memory fallback.
- Guarantees `0` server crashes and zero `500 Internal Server Error` responses even if Supabase network requests time out or fail.

---

## 📁 Repository Structure

```text
ev-charging-platform/
├── ev-frontend/                     # Frontend Application (Vite + React + TS)
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # UI components
│   │   │   ├── AmbientBackground.tsx # Mesh gradient background
│   │   │   ├── CustomCursor.tsx     # Custom luxury cursor
│   │   │   └── Magnetic.tsx        # Magnetic hover button container
│   │   ├── pages/                   # Application Views
│   │   │   ├── Home.tsx            # Landing page + Page Hits Counter
│   │   │   ├── UserDashboard.tsx   # Interactive Map, Station List, Booking Modal & Timer
│   │   │   └── EmployeeDashboard.tsx # Clearance Authentication & Node Management
│   │   ├── App.tsx                  # Main router & navigation menu
│   │   ├── config.ts                # Dynamic API Base URL Resolver (Vercel / Local)
│   │   ├── index.css                # Design tokens, custom map icons & glassmorphism
│   │   └── main.tsx                 # Entrypoint with Leaflet CSS imports
│   ├── package.json
│   ├── tsconfig.json
│   ├── vercel.json                  # Vercel SPA rewrite routing rules
│   └── vite.config.ts
│
├── ev-backend/                      # Backend API (Node.js + Express)
│   ├── data/                        # Local fallback data stores
│   ├── db.js                        # Supabase client + Fail-safe DB functions (20 Stations)
│   ├── index.js                     # Express REST API routes & middleware
│   ├── supabase_schema.sql          # Complete Supabase SQL schema & seed scripts
│   ├── vercel.json                  # Optional Vercel serverless config
│   └── package.json
│
└── README.md                        # Project Documentation
```

---

## 🛠️ Environment Configuration

### Frontend (`ev-frontend/.env`)
```env
VITE_API_URL=http://localhost:5000
```
> **Note**: In production deployments on Vercel, `src/config.ts` automatically defaults to `https://ev-flow-backend.onrender.com` if `VITE_API_URL` is omitted.

### Backend (`ev-backend/.env`)
```env
PORT=5000
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```
> **Note**: If `SUPABASE_URL` is omitted or offline, the backend seamlessly uses internal seeded stations without crashing.

---

## 🚀 Local Development Setup

### 1. Run Backend Server
```bash
cd ev-backend
npm install
npm run dev    # Runs on http://localhost:5000 with auto-reload
```

### 2. Run Frontend Application
```bash
cd ev-frontend
npm install
npm run dev    # Runs on http://localhost:5173
```

### 3. Build & Typecheck
```bash
cd ev-frontend
npm run build  # Runs tsc -b && vite build
```

---

## 🌐 Deployment Configuration Guide

### Deploying Frontend to **Vercel**
1. Import repository `mohammedrehan143/EV-flow` into Vercel.
2. Set **Root Directory**: `ev-frontend`
3. Set **Framework Preset**: `Vite`
4. Set **Build Command**: `npm run build`
5. Set **Output Directory**: `dist`

### Deploying Backend to **Render**
1. Create a new **Web Service** on Render connected to `mohammedrehan143/EV-flow`.
2. Set **Root Directory**: `ev-backend`
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node index.js` (or `npm start`)

---

## 🔑 Access Passkeys Quick Reference

| Station ID | Station Name | Location Area | Station Clearance Passkey |
| :--- | :--- | :--- | :--- |
| **ALL** | **Master Admin Global Access** | Global | `ADMIN123` |
| **1** | Taj West End Hub | Central | `TAJ123` |
| **2** | BESCOM KR Circle | Central | `BESCOM456` |
| **3** | UB City Charging Point | Central | `UBCITY789` |
| **4** | Croma Koramangala | Koramangala | `CROMA000` |
| **5** | Phoenix Marketcity | Whitefield | `PHOENIX555` |
| **6** | Electronic City EZ Charge | Electronic City | `ECITY888` |
| **7** | Jayanagar 4th Block Node | Jayanagar | `JAYANAGAR222` |
| **8** | Shell Recharge Station | Yelahanka | `SHELL111` |
| **9** | GLIDA Mandovi Motors | Yelahanka | `GLIDA222` |
| **10** | Yelahanka New Town Hub | Yelahanka | `YELAHANKA10` |
| **11** | RMZ Galleria Yelahanka | Yelahanka | `GALLERIA11` |
| **12** | Jakkur Aerodrome EV Point | Yelahanka/Jakkur | `JAKKUR12` |
| **13** | Kogilu Cross EV Spot | Yelahanka | `KOGILU13` |
| **14** | Hebbal Flyover Supercharger | Hebbal | `HEBBAL14` |
| **15** | Manyata Tech Park Hub | Hebbal | `MANYATA15` |
| **16** | Esteem Mall Hebbal | Hebbal | `ESTEEM16` |
| **17** | RT Nagar BDA Complex | RT Nagar | `RTNAGAR17` |
| **18** | Ganganagar EV Point | RT Nagar | `GANGANAGAR18` |
| **19** | Dinnur Main Road Node | RT Nagar | `DINNUR19` |
| **20** | Nagavara Junction EZ | Nagavara | `NAGAVARA20` |

---

## 📡 API Endpoints Reference

### Public & Monitoring
- `GET /` - Root status message
- `GET /api/health` - Server health ping
- `GET /api/hits` - Retrieve total hits and daily hits
- `POST /api/hits/increment` - Increment visitor hit counter

### Stations & Slots
- `GET /api/stations` - Fetch all active stations and slots
- `POST /api/stations/debug` - Deploy a local test node at user position
- `PUT /api/stations/:stationId/slots/:slotId` - Reactivate/deactivate slot status

### Authentication & Bookings
- `POST /api/auth` - Authenticate clearance passkey (`ADMIN123` or station key)
- `PUT /api/stations/:stationId/passkey` - Update station passkey
- `POST /api/bookings` - Create slot reservation with name & vehicle number
- `POST /api/bookings/cancel` - Cancel active slot reservation & release node

---

## 👨‍💻 Maintainer & Licensing
- **Project**: EV-Flow Digital Experience
- **Author**: mohammedrehan143
- **License**: ISC
