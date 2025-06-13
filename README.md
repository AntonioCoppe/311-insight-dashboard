# 311 Insight Dashboard

A web application for exploring Toronto 311 service requests. The project includes scripts to ingest open data, a Node.js API with caching, and a React interface with interactive charts and maps.

## Contents

- [Features](#features)
- [Requirements](#requirements)
- [Setup](#setup)
- [Running the App](#running-the-app)
- [Data Ingestion](#data-ingestion)
- [Development](#development)

## Features

**Data ingestion**
- Python script `scripts/load_requests.py` loads CSV files in `data/csv/` into PostgreSQL.
- Optional `generate_centroids.py` produces postal code centroids for the map.

**Backend API** (`src/backend`)
- Built with Express, PostgreSQL and Redis.
- Endpoints:
  - `GET /api/requests/recent?minutes=&types=` – counts by request type for the last N minutes.
  - `GET /api/requests/historical?start=&end=&types=` – daily totals between two dates.
  - `GET /api/requests/types` – list of available request types.
  - `GET /api/requests/map?category=&minutes=` – GeoJSON of counts by postal FSA.
- WebSocket updates via Socket.IO when new data is ingested.

**Frontend** (`src/frontend`)
- React + TypeScript with Chart.js and Leaflet.
- Line chart for historical trends, bar chart for recent activity and a map showing request density.

## Requirements

- Node.js 14 or higher
- PostgreSQL and Redis
- Python 3 (for data scripts)
- GeoPandas if generating centroids

## Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd 311-insight-dashboard
   ```
2. **Configure environment variables**
   ```bash
   cp .env.example src/backend/.env
   # edit DATABASE_URL and REDIS_URL in src/backend/.env
   ```
3. **Install dependencies**
   ```bash
   # backend
   cd src/backend && npm install && cd ../..

   # frontend
   cd src/frontend && npm install && cd ../..
   ```
4. **Create the database**
   ```bash
   psql -f sql/create_requests_table.pgsql "$DATABASE_URL"
   ```
5. **(Optional) generate postal centroids**
   ```bash
   pip install geopandas
   python generate_centroids.py
   ```

## Running the App

Start supporting services (PostgreSQL, Redis) then run:

```bash
# backend API
cd src/backend && npm start
```

In another terminal:

```bash
# frontend
cd src/frontend && npm start
```

The frontend runs on [http://localhost:3000](http://localhost:3000) and proxies API calls to the backend.

## Data Ingestion

Place yearly CSV files in `data/csv/` (e.g. `SR2025.csv`). Then run:

```bash
python scripts/load_requests.py
```

Each file is loaded into the `requests` table and the backend is notified so connected clients update automatically.

## Development

- Backend tests live in `src/backend/tests` and run with `npm test` inside `src/backend`.
- The frontend was bootstrapped with Create React App.
- Style and lint rules can be added as desired.

---

© 2025 Toronto 311 Insight Dashboard Team
