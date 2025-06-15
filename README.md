# 311 Insight Dashboard

A full-stack dashboard to visualize City of Toronto 311 service requests.

## Features

* **Data Ingestion**: Pulls monthly CSVs and implements incremental loading into PostgreSQL.
* **Backend API** (Node.js + Express + Redis):

  * `GET /api/requests/recent?minutes=`: Counts by request type for last *N* minutes.
  * `GET /api/requests/historical?start=&end=`: Daily counts between two dates.
  * `GET /api/requests/types`: Distinct request types.
  * `GET /api/requests/map?category=&minutes=`: GeoJSON of counts by FSA.
* **Frontend** (React + TypeScript + Leaflet):

  * Interactive category & timeframe selectors.
  * Scaled, geocoded markers (postal FSA centroids).
  * Recharts for time-series and bar charts (in other components).

## Repository Structure

```bash
311-insight-dashboard/
├── src/
│   ├── backend/          # Express API service
│   │   ├── app.js
│   │   └── package.json
│   ├── data-ingestion/   # Poller scripts & config
│   ├── data/             # Static data files (postal centroids)
│   │   └── postal_centroids.json
│   └── frontend/         # React application
│       ├── public/
│       ├── src/
│       │   ├── api/
│       │   ├── components/
│       │   └── App.tsx
│       └── package.json
├── .env                  # Environment variables
├── .gitignore
└── README.md
```

## Prerequisites

* Node.js (>= 14.x)
* PostgreSQL
* Redis
* Python 3 + GeoPandas (for centroid generation)
* `brew` (on macOS) for service management

## Setup & Running

1. **Clone the repo**

   ```bash
   git clone <repo-url>
   cd 311-insight-dashboard
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env with your DATABASE_URL, REDIS_URL and mail credentials
   ```

3. **Install dependencies**

   ```bash
   # Backend
   cd src/backend && npm install && cd ../..

   # Frontend
   cd src/frontend && npm install && cd ../..
   ```

4. **Initialize database**

   ```sql
   -- Connect as postgres superuser
   CREATE USER insight_user WITH ENCRYPTED PASSWORD '<password>';
   CREATE DATABASE insight311 OWNER insight_user;
   \c insight311
  CREATE TABLE requests (
    id TEXT PRIMARY KEY,
    request_type TEXT,
    ward TEXT,
    created_at TIMESTAMP,
    closed_at TIMESTAMP,
    postal_area TEXT,
    description TEXT
  );
  CREATE TABLE contact_requests (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT NOW()
  );
  ```

5. **Generate postal centroids (optional)**

   ```bash
   pip install geopandas
   python generate_centroids.py
   ```

6. **Start services**

   ```bash
   # Redis
   brew services start redis

   # PostgreSQL (if not already running)
   brew services start postgresql
   ```

7. **Run backend**

   ```bash
   node src/backend/app.js
   ```

8. **Run frontend**

   ```bash
   cd src/frontend
   npm start  # runs on 3001 by default and proxies API requests to the backend
   ```

9. **View**
   Open [http://localhost:3001](http://localhost:3001) in your browser.

## Development Tips

* **Linting & Formatting**: ESLint + Prettier can be added.
* **Hot Reload**: Backend uses `nodemon` for auto-restart.
* **Debugging**: Check browser console & network tab for API logs.

## Contributing

1. Fork and clone the repo.
2. Create a feature branch: `git checkout -b feature/<name>`
3. Commit changes: `git commit -m 'Add XYZ feature'`
4. Push branch: `git push origin feature/<name>`
5. Open a pull request.

---

© 2025 Toronto 311 Insight Dashboard Team
