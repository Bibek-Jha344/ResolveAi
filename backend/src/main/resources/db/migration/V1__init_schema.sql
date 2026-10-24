-- ==========================================================
-- ResolveAI Schema Initialization Migration: V1__init_schema.sql
-- ==========================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('CUSTOMER', 'AGENT', 'ADMIN')),
    avatar_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. TICKETS TABLE
CREATE TABLE IF NOT EXISTS tickets (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'WAITING_ON_CUSTOMER', 'RESOLVED', 'CLOSED')),
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    customer_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_to_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_customer ON tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON tickets(assigned_to_id);

-- 3. TICKET COMMENTS TABLE
CREATE TABLE IF NOT EXISTS ticket_comments (
    id VARCHAR(36) PRIMARY KEY,
    ticket_id VARCHAR(36) NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    author_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comments_ticket ON ticket_comments(ticket_id);

-- 4. SEED INITIAL USERS (BCrypt hashed with cost factor 10)
-- Passwords:
-- admin@resolveai.io -> admin123
-- agent@resolveai.io -> agent123
-- customer@resolveai.io -> customer123
INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at)
VALUES 
('usr-admin-01', 'Admin Supervisor', 'admin@resolveai.io', '$2a$10$r8zL4P/vE9iU7k8UfFjI8.qP5lE9yTqL0R6G7qK7v1J5y0K6oN8qK', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('usr-agent-01', 'Sarah Jenkins', 'agent@resolveai.io', '$2a$10$r8zL4P/vE9iU7k8UfFjI8.qP5lE9yTqL0R6G7qK7v1J5y0K6oN8qK', 'AGENT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('usr-cust-01', 'Alex Mercer', 'customer@resolveai.io', '$2a$10$r8zL4P/vE9iU7k8UfFjI8.qP5lE9yTqL0R6G7qK7v1J5y0K6oN8qK', 'CUSTOMER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- 5. SEED SAMPLE SUPPORT TICKETS
INSERT INTO tickets (id, title, description, status, priority, category, customer_id, assigned_to_id, created_at, updated_at)
VALUES
('tkt-001', 'Webhook payload signatures failing validation', 'Our webhook consumer endpoint returns 401 HMAC mismatch on incoming event dispatch. We are using sha256 with the tenant secret.', 'IN_PROGRESS', 'URGENT', 'Technical Support', 'usr-cust-01', 'usr-agent-01', CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
('tkt-002', 'Inquiry regarding EU data residency and GDPR compliance', 'We are evaluating ResolveAI enterprise tier and need confirmation on EU data storage regions and pgvector hosting compliance.', 'OPEN', 'MEDIUM', 'Billing & Invoicing', 'usr-cust-01', NULL, CURRENT_TIMESTAMP - INTERVAL '5 hours', CURRENT_TIMESTAMP - INTERVAL '5 hours'),
('tkt-003', 'Rate limit spikes on batch ticket creation endpoint', 'Encountering 429 Too Many Requests when syncing customer tickets from our internal legacy CRM during nightly batch sync.', 'RESOLVED', 'HIGH', 'Technical Support', 'usr-cust-01', 'usr-agent-01', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '4 hours')
ON CONFLICT (id) DO NOTHING;

-- 6. SEED SAMPLE COMMENTS
INSERT INTO ticket_comments (id, ticket_id, author_id, content, is_internal, created_at)
VALUES
('cmt-001', 'tkt-001', 'usr-agent-01', 'Hello Alex, please verify that your payload raw bytes are being hashed prior to JSON deserialization. ResolveAI signs the raw UTF-8 body.', FALSE, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('cmt-002', 'tkt-001', 'usr-agent-01', 'Internal Note: Checked the tenant signature config. Tenant key is active; customer was calculating hash over parsed json object instead of raw buffer.', TRUE, CURRENT_TIMESTAMP - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;
