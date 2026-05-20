-- Migration 003: Create cities table
-- Each city belongs to an organization; slug is unique within an organization

CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  baseline_emissions DECIMAL(12,2) NOT NULL,
  target_year INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Composite unique constraint: slug must be unique per organization
ALTER TABLE cities ADD CONSTRAINT cities_organization_id_slug_unique UNIQUE (organization_id, slug);

-- Indexes
CREATE INDEX idx_cities_organization_id ON cities (organization_id);
CREATE INDEX idx_cities_slug ON cities (slug);
