-- Migration 004: Create climate_actions table
-- Stores individual climate initiatives belonging to a city and organization

CREATE TABLE climate_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  city_id UUID NOT NULL REFERENCES cities(id),
  title TEXT NOT NULL,
  sector sector_enum NOT NULL,
  annual_reduction DECIMAL(12,2) NOT NULL,
  status action_status_enum NOT NULL,
  start_year INTEGER NOT NULL,
  source_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_climate_actions_organization_id ON climate_actions (organization_id);
CREATE INDEX idx_climate_actions_city_id ON climate_actions (city_id);
