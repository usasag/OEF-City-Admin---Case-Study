-- Migration 001: Create database enums
-- Defines sector and action status enums used by climate_actions table

CREATE TYPE sector_enum AS ENUM ('transport', 'energy', 'buildings', 'waste', 'land_use');
CREATE TYPE action_status_enum AS ENUM ('planned', 'in_progress', 'completed');
