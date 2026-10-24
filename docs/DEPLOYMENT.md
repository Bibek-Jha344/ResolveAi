# ResolveAI Production Deployment Guide

This guide outlines step-by-step instructions to deploy ResolveAI frontend to **Vercel** and the backend to **Render**, **Railway**, or **Fly.io** with managed **PostgreSQL + pgvector**.

---

## 1. Production Architecture Overview

- **Frontend:** Single Page Application (SPA) deployed on Vercel CDN. Communicates with backend using the `VITE_API_URL` environment variable.
- **Backend:** Spring Boot 3.3.x on Java 21 containerized on Render, Railway, or Fly.io.
- **Database:** PostgreSQL 16+ with `pgvector` extension enabled and automated Flyway schema migrations.

---

## 2. PostgreSQL Database Setup

### Option A: Managed Cloud Database (Neon, Supabase, AWS RDS, Railway)
1. Provision a PostgreSQL 16 database.
2. In the database SQL console, enable the pgvector extension:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```
3. Copy your connection URL (e.g. `postgres://user:password@ep-sample-123.eu-central-1.aws.neon.tech/resolveai_db?sslmode=require`).

### Option B: Docker Compose (Local / Virtual Machine)
Run the bundled `docker-compose.yml`:
```bash
docker-compose up -d postgres
```
This automatically initializes `pgvector/pgvector:pg16` on port `5432` with pre-configured health checks.

---

## 3. Backend Deployment (Render / Railway / Fly.io)

### Environment Variables
Configure the following environment variables in your hosting provider's dashboard:

| Variable | Description | Example Production Value |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | `prod` |
| `PORT` | Web server listening port | `8080` (or assigned by provider) |
| `SPRING_DATASOURCE_URL` | JDBC connection string | `jdbc:postgresql://ep-sample-123.neon.tech:5432/resolveai_db?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | Database user | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `your-db-password` |
| `JWT_SECRET` | 256-bit cryptographic hex key | `generate-a-secure-random-64-character-hex-string` |
| `JWT_EXPIRATION_MS` | Token lifespan in milliseconds | `86400000` (24 hours) |
| `CORS_ALLOWED_ORIGINS` | Exact allowed frontend origin(s) | `https://resolveai.vercel.app` |
| `AI_PROVIDER` | LLM provider | `openai` or `fallback` |
| `AI_API_KEY` | OpenAI API Secret Key (if using OpenAI) | `sk-proj-...` |
| `AI_MODEL` | Grounding model name | `gpt-4o-mini` |

### Deploy via Dockerfile
Point your platform to `backend/Dockerfile`. The multi-stage build will compile the Java 21 binary using Maven and run the lightweight Alpine JRE image.

---

## 4. Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel.
2. Configure Project Settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Environment Variables:
   - Add `VITE_API_URL` set to your live backend URL (e.g. `https://resolveai-api.onrender.com/api/v1`).
   - Do **NOT** include trailing slash.
4. Deploy the project.

---

## 5. Deployment Smoke-Test Checklist

Follow this checklist after deployment to eliminate recurring `Failed to fetch` or CORS errors:

- [ ] **Step 1: Backend Health Check**
  - Run: `curl -I https://resolveai-api.onrender.com/api/v1/health`
  - Verify HTTP 200 OK and JSON body contains `"status":"UP"` and `"database":"CONNECTED"`.

- [ ] **Step 2: CORS Preflight Verification**
  - Execute preflight test with your Vercel domain origin:
  ```bash
  curl -I -X OPTIONS https://resolveai-api.onrender.com/api/v1/auth/login \
    -H "Origin: https://resolveai.vercel.app" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: authorization,content-type"
  ```
  - Verify response headers contain:
    - `Access-Control-Allow-Origin: https://resolveai.vercel.app`
    - `Access-Control-Allow-Credentials: true`

- [ ] **Step 3: User Authentication Test**
  - Open the Vercel URL in an incognito window.
  - Sign in with pre-seeded demo account: `admin@resolveai.io` / `admin123`.
  - Verify JWT is returned and saved to browser `localStorage` without console exceptions.

- [ ] **Step 4: Ticket Lifecycle Verification**
  - Submit a test ticket from the UI.
  - Verify it renders in the queue with status `OPEN` and correct priority.
  - Add a comment and toggle status to `IN_PROGRESS`.

- [ ] **Step 5: RAG Document Grounding Test**
  - Navigate to **AI Support Copilot** in the dashboard.
  - Submit the question: *"What is the ticket escalation SLA policy for Urgent issues?"*
  - Verify that the response includes exact verbatim citations from `support_sla_policy.md` and confidence percentage.
