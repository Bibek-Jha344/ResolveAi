# ResolveAI — Enterprise AI Customer Support SaaS Platform

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)
[![Java](https://img.shields.io/badge/Java-21_LTS-ED8B00.svg)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.4-6DB33F.svg)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16_pgvector-4169E1.svg)](https://github.com/pgvector/pgvector)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)

**ResolveAI** is a customer support SaaS platform built to unify ticketing operations with high-fidelity, grounded Retrieval-Augmented Generation (RAG).

Every AI response is grounded directly in internal knowledge base documents with verifiable citations and cosine similarity confidence scores.

---

## Key Features

- **Grounded AI Copilot & RAG Retrieval:** Queries internal documents using cosine vector similarity. Synthesizes answers with verbatim citations and confidence metrics.
- **Enterprise Ticketing Pipeline:** Priorities (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), lifecycle states (`OPEN`, `IN_PROGRESS`, `WAITING_ON_CUSTOMER`, `RESOLVED`, `CLOSED`), categories, SLA tracking, and staff-only internal notes.
- **Knowledge Base Ingestion:** Upload `.txt`, `.md`, or `.pdf` files up to 10MB. Automated sliding-window chunking (600 characters with 100-character overlap) and interactive chunk inspection.
- **Real Database Analytics:** Dynamic KPI cards, resolution time tracking, ticket volume history, and CSAT metrics.
- **Strict Role-Based Access Control (RBAC):** `CUSTOMER` (isolated personal ticket access), `AGENT` (ticket queue triage, assignment, internal notes), and `ADMIN` (team role governance, documentation management).
- **Stateless JWT Security:** BCrypt password hashing, configurable CORS origins via environment variables, and centralized exception handling.
- **Dark Navy SaaS Aesthetics:** Navy palette (`#060913`, `#0B0F19`, `#151E32`) paired with violet and indigo accents (`#6366F1`, `#8B5CF6`).

---

## Pre-Seeded Demo Accounts

The database migration pre-seeds test accounts with password `admin123`, `agent123`, or `customer123`:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **ADMIN** | `admin@resolveai.io` | `admin123` | Full access to team directory, knowledge documents, and system settings |
| **AGENT** | `agent@resolveai.io` | `agent123` | Ticket assignment, triage, customer responses, and staff internal notes |
| **CUSTOMER** | `customer@resolveai.io` | `customer123` | Create and track personal support tickets, view public comments |

---

## Local Development Quickstart

### Prerequisites
- **Node.js** v18+ (tested on Node 24)
- **Java 21 LTS**
- **PostgreSQL 16** with pgvector (or use Docker Compose)

### 1. Start Database (Docker Option)
```bash
docker-compose up -d postgres
```

### 2. Start Backend (Spring Boot 3)
The project includes a Maven Wrapper so a globally installed Maven is not required:
```bash
cd backend
# Windows:
.\mvnw.cmd spring-boot:run

# Linux / macOS:
./mvnw spring-boot:run
```
The backend initializes on `http://localhost:8080`.
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Health check: `http://localhost:8080/api/v1/health`

### 3. Start Frontend (React + Vite)
In a separate terminal:
```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## Running Automated Tests

### Backend Unit Tests (12 Tests across Auth, Tickets, RAG):
```bash
cd backend
# Windows:
.\mvnw.cmd test

# Linux / macOS:
./mvnw test
```

### Frontend Production Build & TypeScript Verification:
```bash
npm run build
```

---

## Project Structure

```
ResolveAI/
├── backend/                             # Spring Boot 3.3.x Application
│   ├── .mvn/wrapper/                    # Maven Wrapper binaries & runner scripts
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/resolveai/
│   │   │   │   ├── config/              # OpenAPI / Swagger configuration
│   │   │   │   ├── controller/          # REST Controllers (/auth, /tickets, /documents, /ai, /health)
│   │   │   │   ├── dto/                 # Request & Response Data Transfer Objects
│   │   │   │   ├── exception/           # Centralized GlobalExceptionHandler & ApiErrorResponse
│   │   │   │   ├── model/               # JPA Entities (User, Ticket, TicketComment, Document, Chunk)
│   │   │   │   ├── repository/          # Spring Data JPA Repositories
│   │   │   │   ├── security/            # SecurityConfig, JWT Provider, Auth Filter, UserPrincipal
│   │   │   │   ├── service/             # Business Logic, RAG Engine, Sliding Chunker, Pluggable LLM
│   │   │   │   └── ResolveAiApplication.java
│   │   │   └── resources/
│   │   │       ├── db/migration/        # Flyway SQL Migrations (V1 init schema, V2 RAG knowledge base)
│   │   │       ├── application.yml      # Base configuration
│   │   │       └── application-prod.yml # Production profile
│   │   └── test/java/com/resolveai/     # Automated Tests (AuthServiceTest, TicketServiceTest, RagChunkingTest)
│   ├── pom.xml
│   ├── mvnw & mvnw.cmd
│   └── Dockerfile
├── src/                                 # React 18 + Vite + TypeScript Frontend
│   ├── components/                      # Sidebar, Header, StatusBadge, PriorityBadge, Modals, MetricCards
│   ├── pages/                           # Landing, Login, Register, Dashboard, Tickets, AI Copilot, etc.
│   ├── api.ts                           # Centralized API client with JWT interceptor & error handling
│   ├── types.ts                         # TypeScript domain models and interfaces
│   ├── styles.css                       # Tailwind directives, dark navy theme, and glow utilities
│   ├── App.tsx                          # App shell, routing state, and health checking
│   └── main.tsx
├── docs/
│   ├── ARCHITECTURE.md                  # Comprehensive System Architecture & Mermaid Diagrams
│   ├── API.md                           # Complete REST API Specification
│   └── DEPLOYMENT.md                    # Vercel & Backend Hosting Guides with Smoke-Test Checklist
├── docker-compose.yml                   # Container orchestration (Postgres pgvector, Backend, Frontend)
├── IMPLEMENTATION_STATUS.md             # Project phase-by-phase tracker
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

---

## Documentation Links

- [System Architecture & RAG Pipeline Specification](docs/ARCHITECTURE.md)
- [REST API Reference](docs/API.md)
- [Production Deployment Guide & Smoke Checklist](docs/DEPLOYMENT.md)
- [Implementation Status Tracker](IMPLEMENTATION_STATUS.md)
