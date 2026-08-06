-- ========================================================
-- BSN Acquaintance Party 2026 - Supabase Complete Schema
-- Copy and run this entire script in Supabase SQL Editor
-- ========================================================

-- 1. Create or update Attendees table
CREATE TABLE IF NOT EXISTS attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  fullname VARCHAR(255) NOT NULL,
  unique_code VARCHAR(20) UNIQUE NOT NULL,
  seat_confirmed BOOLEAN DEFAULT FALSE,
  table_number INT,
  seat_number INT,
  seat_confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all columns exist on attendees table
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS seat_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS table_number INT;
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS seat_number INT;
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS seat_confirmed_at TIMESTAMP WITH TIME ZONE;

-- 2. Create Seats table (id is TEXT format "table-1-seat-1")
CREATE TABLE IF NOT EXISTS seats (
  id TEXT PRIMARY KEY,
  table_number INT NOT NULL,
  seat_number INT NOT NULL,
  attendee_id UUID REFERENCES attendees(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'available',
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- 3. Auto-populate 60 seats (6 tables × 10 seats) if empty
DO $$
DECLARE
  t INT;
  s INT;
  seat_key TEXT;
BEGIN
  FOR t IN 1..6 LOOP
    FOR s IN 1..10 LOOP
      seat_key := 'table-' || t || '-seat-' || s;
      INSERT INTO seats (id, table_number, seat_number, status)
      VALUES (seat_key, t, s, 'available')
      ON CONFLICT (id) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- 4. Enable Row Level Security (RLS) & Grant Access Policies
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Allow public read on attendees" ON attendees;
DROP POLICY IF EXISTS "Allow public insert on attendees" ON attendees;
DROP POLICY IF EXISTS "Allow public update on attendees" ON attendees;
DROP POLICY IF EXISTS "Allow public delete on attendees" ON attendees;
DROP POLICY IF EXISTS "Students can view their own attendee record" ON attendees;
DROP POLICY IF EXISTS "Admins can view all attendees" ON attendees;

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

-- 5. Enable Realtime Replication
ALTER PUBLICATION supabase_realtime ADD TABLE attendees;
ALTER PUBLICATION supabase_realtime ADD TABLE seats;
