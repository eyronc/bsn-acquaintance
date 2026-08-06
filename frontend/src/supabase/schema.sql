-- ========================================================
-- BSN Acquaintance Party 2026 - Supabase Complete Schema
-- Copy and run this entire script in Supabase SQL Editor
-- ========================================================

-- 1. Create or update Attendees table (Name, Year, Section, Email, Access Code)
CREATE TABLE IF NOT EXISTS attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  fullname VARCHAR(255) NOT NULL,
  year VARCHAR(20) NOT NULL DEFAULT '4th Year',
  section VARCHAR(10) NOT NULL DEFAULT 'B',
  unique_code VARCHAR(20) UNIQUE NOT NULL,
  seat_confirmed BOOLEAN DEFAULT FALSE,
  table_number INT,
  seat_number INT,
  seat_confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all columns exist on attendees table
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS year VARCHAR(20) NOT NULL DEFAULT '4th Year';
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS section VARCHAR(10) NOT NULL DEFAULT 'B';
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS seat_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS table_number INT;
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS seat_number INT;
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS seat_confirmed_at TIMESTAMP WITH TIME ZONE;

-- Update any existing attendees without year/section to 4th Year Section B (BSN - 4B)
UPDATE attendees 
SET 
  year = '4th Year',
  section = 'B'
WHERE year IS NULL OR section IS NULL OR year = '' OR section = '';

-- 2. Create Seats table (id is TEXT format "table-01-seat-01" for clean sorting)
CREATE TABLE IF NOT EXISTS seats (
  id TEXT PRIMARY KEY,
  table_number INT NOT NULL,
  seat_number INT NOT NULL,
  attendee_id UUID REFERENCES attendees(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'available',
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(table_number, seat_number)
);

-- Ensure unique constraint exists on (table_number, seat_number)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'seats_table_seat_unique'
  ) THEN
    ALTER TABLE seats ADD CONSTRAINT seats_table_seat_unique UNIQUE (table_number, seat_number);
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 3. Auto-populate / Update 60 seats with zero-padded IDs for clean sorting (table-01-seat-01 .. table-06-seat-10)
DO $$
DECLARE
  t INT;
  s INT;
  seat_key TEXT;
  t_pad TEXT;
  s_pad TEXT;
BEGIN
  FOR t IN 1..6 LOOP
    FOR s IN 1..10 LOOP
      t_pad := lpad(t::text, 2, '0');
      s_pad := lpad(s::text, 2, '0');
      seat_key := 'table-' || t_pad || '-seat-' || s_pad;
      
      INSERT INTO seats (id, table_number, seat_number, status)
      VALUES (seat_key, t, s, 'available')
      ON CONFLICT (table_number, seat_number)
      DO UPDATE SET id = EXCLUDED.id;
    END LOOP;
  END LOOP;
END $$;

-- 4. Synchronize all existing confirmed attendees into the seats table in Supabase!
UPDATE seats s
SET 
  attendee_id = a.id,
  status = 'confirmed',
  confirmed_at = COALESCE(a.seat_confirmed_at, NOW())
FROM attendees a
WHERE a.seat_confirmed = TRUE 
  AND a.table_number = s.table_number 
  AND a.seat_number = s.seat_number;

-- 5. Enable Row Level Security (RLS) & Grant Access Policies
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Allow public read on attendees" ON attendees;
DROP POLICY IF EXISTS "Allow public insert on attendees" ON attendees;
DROP POLICY IF EXISTS "Allow public update on attendees" ON attendees;
DROP POLICY IF EXISTS "Allow public delete on attendees" ON attendees;

DROP POLICY IF EXISTS "Anyone can view seat status" ON seats;
DROP POLICY IF EXISTS "Allow public read on seats" ON seats;
DROP POLICY IF EXISTS "Allow public insert on seats" ON seats;
DROP POLICY IF EXISTS "Allow public update on seats" ON seats;
DROP POLICY IF EXISTS "Allow public delete on seats" ON seats;

-- Create full read/write/update policies for attendees
CREATE POLICY "Allow public read on attendees" ON attendees FOR SELECT USING (TRUE);
CREATE POLICY "Allow public insert on attendees" ON attendees FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow public update on attendees" ON attendees FOR UPDATE USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow public delete on attendees" ON attendees FOR DELETE USING (TRUE);

-- Create full read/write/update policies for seats
CREATE POLICY "Allow public read on seats" ON seats FOR SELECT USING (TRUE);
CREATE POLICY "Allow public insert on seats" ON seats FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow public update on seats" ON seats FOR UPDATE USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow public delete on seats" ON seats FOR DELETE USING (TRUE);

-- 6. Enable Realtime Replication
ALTER PUBLICATION supabase_realtime ADD TABLE attendees;
ALTER PUBLICATION supabase_realtime ADD TABLE seats;
