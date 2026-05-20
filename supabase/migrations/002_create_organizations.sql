-- Migration 002: Create organizations table
-- Root tenant table; all other tables reference this via organization_id

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  clerk_org_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraints
ALTER TABLE organizations ADD CONSTRAINT organizations_slug_unique UNIQUE (slug);
ALTER TABLE organizations ADD CONSTRAINT organizations_clerk_org_id_unique UNIQUE (clerk_org_id);

-- Indexes
CREATE INDEX idx_organizations_slug ON organizations (slug);
