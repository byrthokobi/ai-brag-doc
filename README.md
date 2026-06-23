# AI Brag Doc

An AI-powered developer productivity tool that captures daily work logs and automatically generates weekly summaries and monthly brag documents — ready for performance reviews, standups, and self-assessments.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Generation Flow](#generation-flow)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Background Worker & Cron Jobs](#background-worker--cron-jobs)

---

## Overview

Developers log their daily work across four categories — **Frontend**, **Backend**, **QA**, and **Management**. The system then:

1. Aggregates those logs into **AI-generated weekly summaries** every Monday at 08:00 UTC
2. Compiles weekly summaries into a polished **monthly brag document** on the 1st of each month at 08:00 UTC
3. Sends **daily push reminders** at 18:00 UTC to users who haven't logged yet
4. Notifies users via **FCM push notification** if generation fails after all retries

Users can also trigger or re-trigger generation manually from the web UI.

---

## Architecture

```mermaid
graph TD
    Browser["🌐 Browser\nNext.js 16 — apps/web\nport 3000"]

    subgraph API["NestJS API — apps/api · port 3001"]
        Auth["AuthModule\nPOST /auth/*"]
        Worklogs["WorklogsModule\nPOST · PATCH · GET /worklogs"]
        Generation["AiGenerationModule\nPOST · GET /generation/*"]
        Notifications["NotificationsModule\nPOST /notifications/token"]
    end

    subgraph Infra["Infrastructure"]
        Postgres[("PostgreSQL\nport 5433")]
        Redis[("Redis\nport 6379")]
    end

    subgraph Worker["Background Worker — apps/worker"]
        BullMQ["BullMQ Consumer\nweekly-summary · monthly-doc"]
        Cron["node-cron\nMon 08:00 · 1st 08:00 · Daily 18:00"]
        LangChain["LangChain + DeepSeek\ndeepseek-chat"]
        FCM["Firebase Admin SDK\nFCM Push Notifications"]
    end

    Browser -->|"REST / JWT"| API
    API -->|"Prisma"| Postgres
    API -->|"BullMQ enqueue"| Redis
    Redis -->|"consume jobs"| BullMQ
    Cron -->|"enqueue"| Redis
    BullMQ --> LangChain
    LangChain -->|"upsert result"| Postgres
    BullMQ -->|"on failure"| FCM
    Cron -->|"daily reminder"| FCM
    FCM -->|"push"| Browser
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16.2 (App Router), React 19, Tailwind CSS v4 |
| Backend API | NestJS, Prisma ORM, JWT auth |
| Background Worker | Node.js + tsx, BullMQ, node-cron |
| AI Generation | LangChain (`@langchain/openai`), DeepSeek (`deepseek-chat`) |
| Database | PostgreSQL 18 |
| Job Queue | Redis 7 + BullMQ |
| Push Notifications | Firebase Cloud Messaging (FCM) via `firebase-admin` |
| Monorepo | Turborepo + npm workspaces |
| Containerisation | Docker Compose |

---

## Database Schema

```mermaid
erDiagram
    User {
        uuid id PK
        string email UK
        string firstName
        string lastName
        string password
        enum role "USER | ADMIN"
        boolean isActive
        string[] fcmTokens
        datetime createdAt
        datetime updatedAt
    }

    WorkLog {
        uuid id PK
        uuid userId FK
        datetime date
        string frontend "nullable"
        string backend "nullable"
        string qa "nullable"
        string management "nullable"
        datetime createdAt
    }

    WeeklySummary {
        uuid id PK
        uuid userId FK
        datetime weekStart
        string content
        datetime createdAt
    }

    MonthlyDoc {
        uuid id PK
        uuid userId FK
        string month "YYYY-MM"
        string content
        datetime createdAt
    }

    User ||--o{ WorkLog : "logs"
    User ||--o{ WeeklySummary : "has"
    User ||--o{ MonthlyDoc : "has"
```

> **Unique constraints:** `WorkLog(userId, date)` · `WeeklySummary(userId, weekStart)` · `MonthlyDoc(userId, month)`

---

## Generation Flow

```mermaid
sequenceDiagram
    actor User
    participant Web as Next.js Web
    participant API as NestJS API
    participant Queue as Redis / BullMQ
    participant Worker as Background Worker
    participant AI as DeepSeek (LangChain)
    participant DB as PostgreSQL
    participant FCM as Firebase FCM

    User->>Web: Log daily work
    Web->>API: POST /worklogs
    API->>DB: Upsert WorkLog

    User->>Web: Trigger weekly summary
    Web->>API: POST /generation/weekly
    API->>Queue: Enqueue weekly-summary job
    API-->>Web: 202 { jobId }

    Queue->>Worker: Dispatch job
    Worker->>DB: Fetch WorkLogs for week
    Worker->>AI: Generate summary
    AI-->>Worker: Summary content
    Worker->>DB: Upsert WeeklySummary

    alt Generation succeeds
        Worker-->>Web: User refreshes to see result
    else All 3 retries exhausted
        Worker->>FCM: Send failure push notification
        FCM-->>User: "Generation failed" alert
    end
```

---

## API Reference

All endpoints except `POST /auth/login` and `POST /auth/register` require `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Body | Response | Description |
|--------|----------|------|----------|-------------|
| `POST` | `/auth/register` | `{ email, password, firstName, lastName }` | `201 UserDto` | Create account |
| `POST` | `/auth/login` | `{ email, password }` | `200 { accessToken }` | Sign in |
| `GET` | `/auth/profile` | — | `200 UserDto` | Current user info |

### Worklogs

| Method | Endpoint | Body / Query | Response | Description |
|--------|----------|--------------|----------|-------------|
| `POST` | `/worklogs` | `{ date, frontend?, backend?, qa?, management? }` | `201 WorkLog` | Upsert daily log |
| `PATCH` | `/worklogs/:date` | `{ frontend?, backend?, qa?, management? }` | `200 WorkLog` | Partial update |
| `GET` | `/worklogs` | `?page&limit&dateFrom&dateTo&category` | `200 { data, total, page, limit }` | Paginated history |

### AI Generation

| Method | Endpoint | Body | Response | Description |
|--------|----------|------|----------|-------------|
| `POST` | `/generation/weekly` | `{ weekStart: YYYY-MM-DD }` | `202 { jobId }` | Queue weekly summary |
| `POST` | `/generation/monthly` | `{ month: YYYY-MM }` | `202 { jobId }` | Queue monthly doc |
| `POST` | `/generation/weekly/regenerate` | `{ weekStart }` | `202 { jobId }` | Re-generate existing summary |
| `POST` | `/generation/monthly/regenerate` | `{ month }` | `202 { jobId }` | Re-generate existing doc |
| `GET` | `/generation/weekly` | — | `200 WeeklySummary[]` | List all summaries |
| `GET` | `/generation/monthly` | — | `200 MonthlyDoc[]` | List all monthly docs |

### Notifications

| Method | Endpoint | Body | Response | Description |
|--------|----------|------|----------|-------------|
| `POST` | `/notifications/token` | `{ token: string }` | `200 { success }` | Register FCM device token (idempotent) |

---

## Project Structure

```
ai-brag-doc/
├── apps/
│   ├── api/                          # NestJS REST API — port 3001
│   │   ├── prisma/schema.prisma
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── auth/             # JWT auth, register, login
│   │       │   ├── users/            # User CRUD, FCM token management
│   │       │   ├── worklogs/         # Daily log entry
│   │       │   ├── ai-generation/    # Queue + list generation jobs
│   │       │   ├── notifications/    # FCM token registration
│   │       │   └── prisma/           # PrismaService
│   │       └── common/
│   │           ├── decorators/       # @CurrentUser()
│   │           └── guards/           # JwtAuthGuard, RolesGuard
│   │
│   ├── worker/                       # Standalone background worker
│   │   └── src/
│   │       ├── queue/worker.ts       # BullMQ consumer entry point
│   │       ├── processors/           # weekly-summary, monthly-doc
│   │       ├── cron/                 # node-cron scheduler + daily reminder
│   │       ├── ai/ai-provider.ts     # LangChain + DeepSeek integration
│   │       ├── notifications/        # FCM failure alert + shared send utility
│   │       └── prisma/               # Prisma client (shared from api/generated)
│   │
│   └── web/                          # Next.js 16 frontend — port 3000
│       └── src/
│           ├── app/
│           │   ├── (auth)/           # /login  /register
│           │   ├── (dashboard)/      # /  /logs  /logs/new  /summaries/*
│           │   └── actions/          # Server Actions: auth, worklogs, summaries
│           ├── components/ui/        # Button, Input, Textarea, Label
│           ├── components/           # RegenerateButton, CopyButton, StreakCard
│           ├── lib/                  # api.ts, utils.ts
│           └── proxy.ts              # Route guard (JWT cookie check)
│
├── docker-compose.yml                # PostgreSQL + Redis
├── turbo.json
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose

### 1. Install dependencies

```bash
npm install
```

### 2. Start infrastructure

```bash
docker compose up -d
```

Starts **PostgreSQL** on `localhost:5433` and **Redis** on `localhost:6379`.

### 3. Configure environment variables

See [Environment Variables](#environment-variables) for all required values.

```bash
# create .env files for each app
cp apps/api/.env.example    apps/api/.env
cp apps/worker/.env.example apps/worker/.env
cp apps/web/.env.example    apps/web/.env.local
```

### 4. Run database migrations

```bash
cd apps/api && npx prisma migrate dev && npx prisma generate
```

### 5. Start all apps

```bash
npx turbo run dev
```

| App | URL |
|-----|-----|
| Web | http://localhost:3000 |
| API | http://localhost:3001 |
| Worker | background process — no HTTP port |

---

## Environment Variables

### `apps/api/.env`

```env
DATABASE_URL=postgresql://postgres:1234@localhost:5433/ai_brag_doc
JWT_SECRET=your_jwt_secret
PORT=3001

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
```

### `apps/worker/.env`

```env
DATABASE_URL=postgresql://postgres:1234@localhost:5433/ai_brag_doc
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

AI_API_KEY=your_deepseek_api_key

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
```

### `apps/web/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Background Worker & Cron Jobs

The worker is a standalone Node.js process (no HTTP server) that shares the same PostgreSQL and Redis instance as the API.

### Job Queue (`ai-jobs`)

| Job | Trigger | Behaviour |
|-----|---------|-----------|
| `weekly-summary` | API enqueue or Monday cron | Fetch WorkLogs → LangChain → upsert `WeeklySummary` |
| `monthly-doc` | API enqueue or 1st-of-month cron | Fetch WeeklySummaries + WorkLogs → LangChain → upsert `MonthlyDoc` |

Both jobs retry **3 times** with **exponential backoff** (5s base). On final failure an FCM push is sent to the user.

### Cron Schedule

| Cron | UTC Time | Action |
|------|----------|--------|
| `0 8 * * 1` | Monday 08:00 | Queue `weekly-summary` for all active users |
| `0 8 1 * *` | 1st of month 08:00 | Queue `monthly-doc` for all active users (previous month) |
| `0 18 * * *` | Daily 18:00 | FCM reminder to users who haven't logged today |
