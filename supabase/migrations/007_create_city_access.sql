-- Migration 007: Create city_access table
-- Allows organizations beyond the owning org to access a city's data.
-- The owning org (cities.organization_id) always has implicit access.
-- This table grants additional orgs read/write access to a city.

CREATE TABLE city_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_by UUID -- references the user who granted access (optional audit field)
);

-- Each org can only have one access grant per city
ALTER TABLE city_access ADD CONSTRAINT city_access_city_org_unique UNIQUE (city_id, organization_id);

-- Indexes for lookup patterns
CREATE INDEX idx_city_access_organization_id ON city_access (organization_id);
CREATE INDEX idx_city_access_city_id ON city_access (city_id);

-- Enable RLS (service role bypasses; application layer enforces)
ALTER TABLE city_access ENABLE ROW LEVEL SECURITY;

-- Public read policy (so the landing page directory can show all cities)
CREATE POLICY "Public can read city_access" ON city_access
  FOR SELECT USING (true);
