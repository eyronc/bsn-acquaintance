-- ========================================================
-- BSN Acquaintance Party 2026 - Supabase Complete Schema
-- Floor Plan: stage-final-layout.png (12 Societies & Shared Tables)
-- ========================================================

-- 1. Create or update Attendees table
CREATE TABLE IF NOT EXISTS attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  fullname VARCHAR(255) NOT NULL,
  year VARCHAR(20) NOT NULL DEFAULT '4th Year',
  section VARCHAR(10) NOT NULL DEFAULT 'B',
  society VARCHAR(100) NOT NULL DEFAULT 'Nursing Informatics Society',
  unique_code VARCHAR(20) UNIQUE NOT NULL,
  payment_amount NUMERIC(10,2) DEFAULT 950.00,
  seat_confirmed BOOLEAN DEFAULT FALSE,
  table_number INT,
  table_code VARCHAR(50),
  seat_number INT,
  seat_confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all columns exist on attendees table
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS year VARCHAR(20) NOT NULL DEFAULT '4th Year';
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS section VARCHAR(10) NOT NULL DEFAULT 'B';
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS society VARCHAR(100) NOT NULL DEFAULT 'Nursing Informatics Society';
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS payment_amount NUMERIC(10,2) DEFAULT 950.00;
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS seat_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS table_number INT;
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS table_code VARCHAR(50);
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS seat_number INT;
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS seat_confirmed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Create Seats table
CREATE TABLE IF NOT EXISTS seats (
  id TEXT PRIMARY KEY,
  table_code VARCHAR(50) NOT NULL,
  table_number INT NOT NULL,
  seat_number INT NOT NULL,
  society VARCHAR(100) NOT NULL,
  attendee_id UUID REFERENCES attendees(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'available',
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(table_code, seat_number)
);

ALTER TABLE seats ADD COLUMN IF NOT EXISTS table_code VARCHAR(50);
ALTER TABLE seats ADD COLUMN IF NOT EXISTS society VARCHAR(100);
ALTER TABLE seats ADD COLUMN IF NOT EXISTS table_number INT;
