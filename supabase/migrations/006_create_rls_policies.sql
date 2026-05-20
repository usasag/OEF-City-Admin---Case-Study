-- Migration 006: Enable Row-Level Security and create public read policies
-- RLS serves as defense-in-depth for tenant isolation.
-- Admin write operations use the Supabase service role client which bypasses RLS.
-- Tenant isolation for writes is enforced at the application layer (Server Action pipeline).

-- Enable RLS on all tenant-scoped tables
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE climate_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_attempts ENABLE ROW LEVEL SECURITY;

-- Public read policies: allow anyone to SELECT from cities and climate_actions
-- These support the unauthenticated public dashboard
CREATE POLICY "Public can read cities" ON cities
  FOR SELECT USING (true);

CREATE POLICY "Public can read climate actions" ON climate_actions
  FOR SELECT USING (true);

-- Note: No public read policy for import_attempts.
-- import_attempts is admin-only data accessible exclusively via the service role client.
