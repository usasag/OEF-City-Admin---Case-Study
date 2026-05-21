-- User memberships: maps Supabase Auth users to organizations
CREATE TABLE user_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

-- Index for fast lookup by user_id
CREATE INDEX idx_user_memberships_user_id ON user_memberships(user_id);

-- Index for fast lookup by organization_id
CREATE INDEX idx_user_memberships_org_id ON user_memberships(organization_id);
