-- Seed Script: Demo data for OEF City Climate Action Tracker
-- This script is idempotent (re-runnable) using ON CONFLICT DO UPDATE/DO NOTHING.
-- Fixed UUIDs ensure consistent references across re-runs.

-- 1. Seed demo Organization
INSERT INTO organizations (id, name, slug, clerk_org_id, created_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Demo City Government',
  'demo-city-gov',
  'org_demo_greenville',
  now()
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  clerk_org_id = EXCLUDED.clerk_org_id;

-- 2. Seed demo City "Greenville"
--    baseline_emissions = 500000 tonnes CO2e
--    target_year = 2035
INSERT INTO cities (id, organization_id, name, slug, baseline_emissions, target_year, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Greenville',
  'greenville',
  500000.00,
  2035,
  now(),
  now()
)
ON CONFLICT (organization_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  baseline_emissions = EXCLUDED.baseline_emissions,
  target_year = EXCLUDED.target_year,
  updated_at = now();

-- 3. Seed Climate Actions (6 actions across 5 sectors)

-- Action 1: Transport sector - Expand bike lane network
INSERT INTO climate_actions (id, organization_id, city_id, title, sector, annual_reduction, status, start_year, created_at, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333330001',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'Expand bike lane network',
  'transport',
  12000.00,
  'in_progress',
  2024,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  sector = EXCLUDED.sector,
  annual_reduction = EXCLUDED.annual_reduction,
  status = EXCLUDED.status,
  start_year = EXCLUDED.start_year,
  updated_at = now();

-- Action 2: Energy sector - Solar panel incentive program
INSERT INTO climate_actions (id, organization_id, city_id, title, sector, annual_reduction, status, start_year, created_at, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333330002',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'Solar panel incentive program',
  'energy',
  45000.00,
  'in_progress',
  2023,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  sector = EXCLUDED.sector,
  annual_reduction = EXCLUDED.annual_reduction,
  status = EXCLUDED.status,
  start_year = EXCLUDED.start_year,
  updated_at = now();

-- Action 3: Buildings sector - Municipal building retrofits
INSERT INTO climate_actions (id, organization_id, city_id, title, sector, annual_reduction, status, start_year, created_at, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333330003',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'Municipal building retrofits',
  'buildings',
  18000.00,
  'planned',
  2026,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  sector = EXCLUDED.sector,
  annual_reduction = EXCLUDED.annual_reduction,
  status = EXCLUDED.status,
  start_year = EXCLUDED.start_year,
  updated_at = now();

-- Action 4: Waste sector - Organic waste composting program
INSERT INTO climate_actions (id, organization_id, city_id, title, sector, annual_reduction, status, start_year, created_at, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333330004',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'Organic waste composting program',
  'waste',
  8000.00,
  'completed',
  2022,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  sector = EXCLUDED.sector,
  annual_reduction = EXCLUDED.annual_reduction,
  status = EXCLUDED.status,
  start_year = EXCLUDED.start_year,
  updated_at = now();

-- Action 5: Land Use sector - Urban reforestation initiative
INSERT INTO climate_actions (id, organization_id, city_id, title, sector, annual_reduction, status, start_year, created_at, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333330005',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'Urban reforestation initiative',
  'land_use',
  15000.00,
  'planned',
  2025,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  sector = EXCLUDED.sector,
  annual_reduction = EXCLUDED.annual_reduction,
  status = EXCLUDED.status,
  start_year = EXCLUDED.start_year,
  updated_at = now();

-- Action 6: Transport sector - EV fleet transition for public transit
INSERT INTO climate_actions (id, organization_id, city_id, title, sector, annual_reduction, status, start_year, created_at, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333330006',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'EV fleet transition for public transit',
  'transport',
  30000.00,
  'planned',
  2026,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  sector = EXCLUDED.sector,
  annual_reduction = EXCLUDED.annual_reduction,
  status = EXCLUDED.status,
  start_year = EXCLUDED.start_year,
  updated_at = now();
