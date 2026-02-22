# Gold VN Track

Track gold prices from Bao Tin Minh Chau (BTMC) API with PostgreSQL and Bootstrap UI.

**API Reference:** [BTMC API Giá vàng](https://btmc.vn/thong-tin/tai-lieu-api/api-gia-vang-17784.html)

## Prerequisites

- Node.js 18+
- PostgreSQL (or use Docker)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Database

**Option A: Docker (recommended)**

```bash
cd infras
docker-compose up -d
```

PostgreSQL runs with schema auto-initialized from `infras/db.init/init.sql`.

**Option B: Local PostgreSQL**

```bash
createdb gold_vn_track
psql -d gold_vn_track -f schema.sql
```

### 3. Configure environment

Copy `.env.example` to `.env` and adjust database settings:

```bash
cp .env.example .env
```

| Variable      | Description          | Default   |
|---------------|----------------------|-----------|
| `PG_HOST`     | PostgreSQL host      | localhost |
| `PG_PORT`     | PostgreSQL port      | 5432      |
| `PG_USER`     | Database user        | postgres  |
| `PG_PASSWORD` | Database password    | postgres  |
| `PG_DATABASE` | Database name        | gold_vn_track |
| `BTMC_API_URL`| BTMC price API URL   | (see .env.example) |
| `PORT`        | App server port      | 3000      |

Alternatively, set `DATABASE_URL` with a full connection string to override individual vars.

### 4. Run

```bash
npm start
```

Open http://localhost:3000

## Features

- **Cron job**: Fetches BTMC data daily at 8:00 AM
- **Dashboard**: Latest gold prices + Line chart for "NHẪN TRÒN TRƠN" sell price (last 30 entries)
