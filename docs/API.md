# ResolveAI REST API Documentation

Base URL: `/api/v1`  
Interactive Swagger UI: `http://localhost:8080/swagger-ui.html`  
OpenAPI JSON Specification: `http://localhost:8080/v3/api-docs`  

---

## 1. Authentication Endpoints

### Register User
- **Method:** `POST`
- **Path:** `/api/v1/auth/register`
- **Access:** Public
- **Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123!",
  "role": "CUSTOMER"
}
```
- **Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "e2a34fcb-871d-4054-94df-7f37435f79aa",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "CUSTOMER",
    "avatarUrl": null,
    "createdAt": "2026-10-24T16:50:00Z"
  }
}
```

### User Login
- **Method:** `POST`
- **Path:** `/api/v1/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "admin@resolveai.io",
  "password": "admin123"
}
```
- **Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr-admin-01",
    "name": "Admin Supervisor",
    "email": "admin@resolveai.io",
    "role": "ADMIN",
    "createdAt": "2026-10-24T16:00:00Z"
  }
}
```

### Get Current User Identity
- **Method:** `GET`
- **Path:** `/api/v1/auth/me`
- **Access:** Authenticated (Bearer Token)
- **Response (200 OK):** `UserDto`

---

## 2. Tickets Endpoints

### List Tickets
- **Method:** `GET`
- **Path:** `/api/v1/tickets`
- **Access:** Authenticated
- **Query Parameters:**
  - `status`: Filter by `OPEN`, `IN_PROGRESS`, `WAITING_ON_CUSTOMER`, `RESOLVED`, `CLOSED`
  - `priority`: Filter by `LOW`, `MEDIUM`, `HIGH`, `URGENT`
  - `search`: Keyword search over title and description
- **Behavior:** `CUSTOMER` role only receives their own submitted tickets. `AGENT` and `ADMIN` receive all organization tickets.

### Get Ticket by ID
- **Method:** `GET`
- **Path:** `/api/v1/tickets/{id}`
- **Access:** Authenticated (Owner or Staff)
- **Response (200 OK):** Full ticket details including conversation comments thread.

### Create Ticket
- **Method:** `POST`
- **Path:** `/api/v1/tickets`
- **Access:** Authenticated
- **Request Body:**
```json
{
  "title": "Webhook payload delivery timeout",
  "description": "Our server failed to receive dispatch events on subscription sub_01.",
  "priority": "HIGH",
  "category": "Technical Support"
}
```
- **Response (201 Created):** `TicketResponseDto`

### Update Ticket
- **Method:** `PATCH`
- **Path:** `/api/v1/tickets/{id}`
- **Access:** Authenticated (Staff or Owner with status=CLOSED)
- **Request Body:**
```json
{
  "status": "IN_PROGRESS",
  "priority": "URGENT",
  "assignedToId": "usr-agent-01"
}
```

### Add Comment / Staff Note
- **Method:** `POST`
- **Path:** `/api/v1/tickets/{id}/comments`
- **Access:** Authenticated
- **Request Body:**
```json
{
  "content": "Verified server logs: firewall had blocked outbound traffic on port 8443.",
  "isInternal": true
}
```
- **Constraint:** Customers attempting to set `isInternal: true` will be rejected with `403 Forbidden`.

---

## 3. Knowledge Base & RAG Endpoints

### List Knowledge Documents
- **Method:** `GET`
- **Path:** `/api/v1/documents`
- **Access:** Authenticated
- **Response (200 OK):** Array of indexed documents with file size and chunk count.

### Upload and Index Document
- **Method:** `POST`
- **Path:** `/api/v1/documents/upload`
- **Access:** Staff only (`AGENT`, `ADMIN`)
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `file`: Document file (`.txt`, `.md`, `.pdf`, max 10MB)
  - `title`: Display title string
- **Response (201 Created):** `DocumentResponseDto`

### View Document Vector Chunks
- **Method:** `GET`
- **Path:** `/api/v1/documents/{id}/chunks`
- **Access:** Authenticated

### Delete Document
- **Method:** `DELETE`
- **Path:** `/api/v1/documents/{id}`
- **Access:** Staff only (`AGENT`, `ADMIN`)
- **Response:** `204 No Content`

---

## 4. AI Assistant / Grounded RAG Chat

### Process Grounded Query
- **Method:** `POST`
- **Path:** `/api/v1/ai/chat`
- **Access:** Authenticated
- **Request Body:**
```json
{
  "message": "What is the ticket escalation SLA policy for Urgent issues?"
}
```
- **Response (200 OK):**
```json
{
  "answer": "ResolveAI enforces a 1-hour response SLA for URGENT priority tickets, which triggers an immediate on-call pager notification. Unassigned urgent tickets automatically escalate to supervisors after 30 minutes.",
  "citations": [
    {
      "documentId": "doc-002",
      "documentTitle": "Support Escalation & SLA Policy",
      "chunkId": "chk-004",
      "snippet": "SLA & Priority Escalations: ResolveAI enforces 4 ticket priority levels: URGENT (1-hour response SLA)...",
      "relevanceScore": 0.884
    }
  ],
  "confidence": 0.88,
  "isFallback": true,
  "modelUsed": "Local Grounded Engine (Deterministic RAG)"
}
```

---

## 5. Analytics & Diagnostics

### Get Summary KPIs
- **Method:** `GET`
- **Path:** `/api/v1/analytics/summary`
- **Access:** Authenticated
- **Response (200 OK):** Aggregated metrics computed from live database entities.

### System Health
- **Method:** `GET`
- **Path:** `/api/v1/health`
- **Access:** Public
- **Response (200 OK):**
```json
{
  "status": "UP",
  "database": "CONNECTED",
  "vectorStore": "AVAILABLE",
  "aiProvider": "FALLBACK",
  "aiProviderName": "Local Grounded Engine (Deterministic RAG)",
  "version": "1.0.0",
  "uptimeSeconds": 1420
}
```
