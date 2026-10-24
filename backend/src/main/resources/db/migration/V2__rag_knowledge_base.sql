-- ==========================================================
-- ResolveAI RAG Knowledge Base Migration: V2__rag_knowledge_base.sql
-- ==========================================================

-- Enable pgvector if available on the PostgreSQL instance
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS vector;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'pgvector extension not installed in environment; vector search will operate via cosine similarity fallback.';
END $$;

-- 1. KNOWLEDGE DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    content_type VARCHAR(100) NOT NULL DEFAULT 'text/plain',
    status VARCHAR(20) NOT NULL DEFAULT 'INDEXED' CHECK (status IN ('PENDING', 'INDEXED', 'FAILED')),
    chunk_count INT NOT NULL DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_status ON knowledge_documents(status);

-- 2. DOCUMENT CHUNKS TABLE
CREATE TABLE IF NOT EXISTS document_chunks (
    id VARCHAR(36) PRIMARY KEY,
    document_id VARCHAR(36) NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    embedding_vector TEXT, -- Stores serialized vector or pgvector representation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chunks_document ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_index ON document_chunks(chunk_index);

-- 3. SEED INITIAL KNOWLEDGE DOCUMENTS
INSERT INTO knowledge_documents (id, title, file_name, file_size, content_type, status, chunk_count, created_at, updated_at)
VALUES
('doc-001', 'ResolveAI API Integration & Webhook Guide', 'api_webhook_guide.md', 4120, 'text/markdown', 'INDEXED', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('doc-002', 'Support Escalation & SLA Policy', 'support_sla_policy.md', 3240, 'text/markdown', 'INDEXED', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED SAMPLE VECTOR CHUNKS FOR GROUNDED RAG RETRIEVAL
INSERT INTO document_chunks (id, document_id, chunk_index, content, embedding_vector, created_at)
VALUES
('chk-001', 'doc-001', 0, 'Authentication: All REST API calls to ResolveAI endpoints under /api/v1 require an Authorization header with a valid Bearer JWT token. Tokens are issued via POST /api/v1/auth/login or /api/v1/auth/register and expire after 24 hours. The JWT payload contains subject userId, email, and granted authority role.', NULL, CURRENT_TIMESTAMP),
('chk-002', 'doc-001', 1, 'Webhooks: ResolveAI dispatches event webhooks for ticket.created, ticket.updated, and ticket.resolved. Outgoing webhooks are signed using HMAC-SHA256 with the tenant secret in header X-ResolveAI-Signature. Consumers must calculate HMAC on the raw UTF-8 payload before JSON parsing to verify authenticity.', NULL, CURRENT_TIMESTAMP),
('chk-003', 'doc-001', 2, 'File Ingestion & Rate Limits: The knowledge base supports documents up to 10 MB in plaintext, Markdown, and PDF formats. Document uploads are chunked into 500-token blocks with a 50-token sliding overlap. API rate limits default to 120 requests per minute per IP for standard tiers.', NULL, CURRENT_TIMESTAMP),
('chk-004', 'doc-002', 0, 'SLA & Priority Escalations: ResolveAI enforces 4 ticket priority levels: URGENT (1-hour response SLA, triggers immediate on-call pager notification), HIGH (4-hour response SLA), MEDIUM (12-hour response SLA), and LOW (24-hour response SLA). Unassigned URGENT tickets automatically escalate to team supervisors after 30 minutes.', NULL, CURRENT_TIMESTAMP),
('chk-005', 'doc-002', 1, 'Customer Roles & Permissions: ResolveAI supports three distinct roles: CUSTOMER (can create and view own tickets, receive public comments), AGENT (can triage tickets, claim assignments, update priority and status, write internal notes), and ADMIN (can manage team roles, upload knowledge base docs, and configure AI credentials).', NULL, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;
