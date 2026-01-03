/*
  TraceWeave Core Schema - v2 (Production Hardened)
  Work Package: OP#344
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------
-- 0. UTILITIES (Triggers & Functions)
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ---------------------------------------------------------
-- 1. USERS
-- ---------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- 2. WORKSPACES
-- ---------------------------------------------------------
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) DEFAULT 'TEAM', -- 'PERSONAL' or 'TEAM'
    
    -- SAFETY: If user is deleted, workspace persists (set owner to NULL or handle in app)
    owner_id UUID REFERENCES users(id), 
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL -- Soft Delete
);

-- ---------------------------------------------------------
-- 3. WORKSPACE MEMBERS (RBAC)
-- ---------------------------------------------------------
CREATE TABLE workspace_members (
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE, -- Hard delete only if Workspace is truly purged
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- If user is gone, membership is gone
    role VARCHAR(20) CHECK (role IN ('ADMIN', 'EDITOR', 'VIEWER')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (workspace_id, user_id)
);

-- ---------------------------------------------------------
-- 4. ENVIRONMENTS
-- ---------------------------------------------------------
CREATE TABLE environments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    variables JSONB DEFAULT '{}'::jsonb, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- ---------------------------------------------------------
-- 5. COLLECTIONS (Folders)
-- ---------------------------------------------------------
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    
    -- SAFETY: Soft Delete Children handled by App Logic, not DB Cascade
    parent_id UUID REFERENCES collections(id), 
    
    name VARCHAR(100) NOT NULL,
    is_system BOOLEAN DEFAULT FALSE, -- For "Trash" or "Restored" folders
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- ---------------------------------------------------------
-- 6. REQUESTS (Configuration)
-- ---------------------------------------------------------
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- SAFETY: Soft Delete handled by App Logic
    collection_id UUID REFERENCES collections(id), 
    
    name VARCHAR(200) NOT NULL,
    method VARCHAR(10) NOT NULL,
    url TEXT NOT NULL,
    
    -- Definitions stored as JSONB
    headers JSONB DEFAULT '{}'::jsonb,
    params JSONB DEFAULT '{}'::jsonb,
    auth_config JSONB DEFAULT '{}'::jsonb,
    body_config JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- ---------------------------------------------------------
-- 7. INDEXES & TRIGGERS
-- ---------------------------------------------------------

-- Performance Indexes (ignoring deleted items for speed)
CREATE INDEX idx_requests_collection ON requests(collection_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_collections_parent ON collections(parent_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_workspaces_owner ON workspaces(owner_id);

-- Apply Auto-Update Triggers
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_workspaces_modtime BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_environments_modtime BEFORE UPDATE ON environments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_collections_modtime BEFORE UPDATE ON collections FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_requests_modtime BEFORE UPDATE ON requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();