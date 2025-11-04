# Analytics Dashboard Backend (TypeScript)

Backend API exposing Google Search Console (GSC) and Google Analytics 4 (GA4) data for the SEO dashboard.

## ✅ Features

-   Service Account or OAuth2 authentication (service account preferred)
-   GSC endpoints: top pages, queries per page, daily metrics
-   GA4 endpoints: pages aggregate, site metrics
-   Scoreboard endpoint (priority suggestions)
-   In-memory TTL cache
-   Strict TypeScript configuration

## 📦 Setup

1. Install dependencies:
    ```bash
    npm install
    ```
2. Copy `env.example` to `.env` and fill values (see below).
3. Place your service account JSON somewhere safe (outside repo if possible) and set `GOOGLE_APPLICATION_CREDENTIALS` to its path.
4. Grant the service account email access in:
    - Search Console (settings → users & permissions)
    - GA4 (Admin → Property Access Management)
5. Run in dev (TypeScript directly):
    ```bash
    npm run dev
    ```
6. Build & run production:
    ```bash
    npm run build
    npm start
    ```

## 🔐 Environment Variables (from `env.example`)

| Name                                                                 | Description                                                |
| -------------------------------------------------------------------- | ---------------------------------------------------------- |
| `GOOGLE_APPLICATION_CREDENTIALS`                                     | Absolute or relative path to service account JSON file     |
| `GSC_SITE_URL`                                                       | Your verified property URL (e.g. https://www.example.com/) |
| `GA4_PROPERTY_ID`                                                    | Numeric GA4 property ID                                    |
| `PORT`                                                               | Server port (default 3001)                                 |
| `CACHE_TTL_SECONDS`                                                  | TTL for in-memory cache entries (default 900)              |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REFRESH_TOKEN` | Optional OAuth2 credentials if not using service account   |

If both service account and OAuth credentials exist, service account wins.

## 🌐 API Endpoints

| Endpoint                                    | Description                         |
| ------------------------------------------- | ----------------------------------- |
| `GET /health`                               | Health & mode info                  |
| `GET /api/gsc/top?start&end&limit`          | Top pages by impressions            |
| `GET /api/gsc/queries?page&start&end&limit` | Top queries for a specific page     |
| `GET /api/gsc/daily?start&end`              | Daily GSC metrics                   |
| `GET /api/ga4/pages?start&end`              | GA4 page-level aggregated metrics   |
| `GET /api/ga4/metrics?start&end`            | Overall GA4 site metrics            |
| `GET /api/scoreboard?start&end`             | Prioritized page update suggestions |
| `POST /api/cache/clear`                     | Clear in-memory cache               |
| `GET /api/cache/stats`                      | Cache statistics                    |

Date params default to the last 28 days if omitted.

## 🛠 Development Scripts

| Script              | Purpose                        |
| ------------------- | ------------------------------ |
| `npm run dev`       | Run TS directly with ts-node   |
| `npm run build`     | Compile to `dist/`             |
| `npm start`         | Run compiled JS from `dist/`   |
| `npm run clean`     | Remove `dist/`                 |
| `npm run typecheck` | Strict type checking (no emit) |

## 🧪 Smoke Test

After `npm run dev` hit:

```bash
curl http://localhost:3001/health
curl "http://localhost:3001/api/gsc/top?limit=10"
curl "http://localhost:3001/api/ga4/metrics"
```

## 🔒 Security Notes

-   Don’t commit credential JSON files.
-   Prefer absolute path for `GOOGLE_APPLICATION_CREDENTIALS` in production.
-   Consider moving to a secrets manager (GCP Secret Manager / Vault) later.

## 🚀 Next Improvements

-   Add proper rolling period calculations for scoreboard trends.
-   Introduce Redis for distributed caching.
-   Add Jest tests for clients and transforms.
-   Graceful token refresh metrics & health diagnostics.

---

Questions or need a patch applied? Open an issue or ask. ✅
