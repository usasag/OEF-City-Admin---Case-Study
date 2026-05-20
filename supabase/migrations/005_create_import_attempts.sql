-- Migration 005: Create import_attempts table
-- Audit log for LLM extraction attempts, tracking input, output, and status

CREATE TABLE import_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  city_id UUID NOT NULL REFERENCES cities(id),
  input_text TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  parsed_json JSONB,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_import_attempts_organization_id ON import_attempts (organization_id);
CREATE INDEX idx_import_attempts_city_id ON import_attempts (city_id);
