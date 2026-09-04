-- ========================================================
-- BSN Acquaintance Party 2026 - Supabase Complete Schema
-- Copy and run this entire script in Supabase SQL Editor
-- Supports STAGE.png Hall Layout (Rows A to G) & Society System
-- ========================================================

-- 1. Create or update Attendees table
CREATE TABLE IF NOT EXISTS attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  fullname VARCHAR(255) NOT NULL,
  year VARCHAR(20) NOT NULL DEFAULT '4th Year',
  section VARCHAR(10) NOT NULL DEFAULT 'B',
  society VARCHAR(100) NOT NULL DEFAULT 'Society A',
  unique_code VARCHAR(20) UNIQUE NOT NULL,
  payment_amount NUMERIC(10,2) DEFAULT 650.00,
  seat_confirmed BOOLEAN DEFAULT FALSE,
  table_number INT,
  table_code VARCHAR(20),
  seat_number INT,
  seat_confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all columns exist on attendees table
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS year VARCHAR(20) NOT NULL DEFAULT '4th Year';
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS section VARCHAR(10) NOT NULL DEFAULT 'B';
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS society VARCHAR(100) NOT NULL DEFAULT 'Society A';
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS payment_amount NUMERIC(10,2) DEFAULT 650.00;
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS seat_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS table_number INT;
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS table_code VARCHAR(20);
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS seat_number INT;
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS seat_confirmed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

UPDATE attendees SET payment_amount = 650.00 WHERE payment_amount IS NULL;
UPDATE attendees SET society = 'Society A' WHERE society IS NULL OR society = '';

-- 2. Create Seats table (id format "table-A-01-seat-01")
CREATE TABLE IF NOT EXISTS seats (
  id TEXT PRIMARY KEY,
  table_code VARCHAR(20) NOT NULL,
  table_number INT,
  seat_number INT NOT NULL,
  society VARCHAR(100) NOT NULL DEFAULT 'Society A',
  attendee_id UUID REFERENCES attendees(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'available',
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(table_code, seat_number)
);

-- Ensure columns exist on seats table
ALTER TABLE seats ADD COLUMN IF NOT EXISTS table_code VARCHAR(20);
ALTER TABLE seats ADD COLUMN IF NOT EXISTS society VARCHAR(100) NOT NULL DEFAULT 'Society A';
ALTER TABLE seats ADD COLUMN IF NOT EXISTS table_number INT;

-- Populate legacy table_code if null
UPDATE seats SET table_code = 'T-' || lpad(table_number::text, 2, '0') WHERE table_code IS NULL;

-- 3. Auto-populate STAGE.png Tables & Seats (Rows A through G, 10 seats per table)
-- Row A: A-01 to A-19 (Society A)
-- Row B: B-01 to B-22 (Society B)
-- Row C: C-01 to C-22 (Society C)
-- Row D: D-01 to D-22 (Society D)
-- Row E: E-01 to E-24 (Society E)
-- Row F: F-01 to F-24 (Society F)
-- Row G: G-01 to G-16 (Society G)

DO $$
DECLARE
  row_letter TEXT;
  max_tables INT;
  t INT;
  s INT;
  t_code TEXT;
  seat_key TEXT;
  soc_name TEXT;
  t_pad TEXT;
  s_pad TEXT;
BEGIN
  FOR row_letter, max_tables IN VALUES 
    ('A', 19),
    ('B', 22),
    ('C', 22),
    ('D', 22),
    ('E', 24),
    ('F', 24),
    ('G', 16)
  LOOP
    soc_name := 'Society ' || row_letter;
    
    FOR t IN 1..max_tables LOOP
      t_pad := lpad(t::text, 2, '0');
      t_code := row_letter || '-' || t_pad;

      FOR s IN 1..10 LOOP
        s_pad := lpad(s::text, 2, '0');
        seat_key := 'table-' || t_code || '-seat-' || s_pad;

        INSERT INTO seats (id, table_code, table_number, seat_number, society, status)
        VALUES (seat_key, t_code, t, s, soc_name, 'available')
        ON CONFLICT (table_code, seat_number)
        DO UPDATE SET 
          society = EXCLUDED.society,
          table_number = EXCLUDED.table_number;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- 4. Clean up any orphaned seats and synchronize all active confirmed attendees
UPDATE seats
SET attendee_id = NULL, status = 'available', confirmed_at = NULL
WHERE status = 'confirmed' AND (attendee_id IS NULL OR attendee_id NOT IN (SELECT id FROM attendees WHERE seat_confirmed = TRUE));

UPDATE seats s
SET 
  attendee_id = a.id,
  status = 'confirmed',
  confirmed_at = COALESCE(a.seat_confirmed_at, NOW())
FROM attendees a
WHERE a.seat_confirmed = TRUE 
  AND (
    (a.table_code IS NOT NULL AND a.table_code = s.table_code AND a.seat_number = s.seat_number)
    OR
    (a.table_number IS NOT NULL AND a.table_number = s.table_number AND a.seat_number = s.seat_number AND a.table_code IS NULL)
  );

-- 5. Trigger to automatically free seat when an attendee is deleted
CREATE OR REPLACE FUNCTION free_seat_on_attendee_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE seats
  SET attendee_id = NULL, status = 'available', confirmed_at = NULL
  WHERE attendee_id = OLD.id 
     OR (table_code = OLD.table_code AND seat_number = OLD.seat_number)
     OR (OLD.table_code IS NULL AND table_number = OLD.table_number AND seat_number = OLD.seat_number);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_free_seat_on_attendee_delete ON attendees;
CREATE TRIGGER trigger_free_seat_on_attendee_delete
BEFORE DELETE ON attendees
FOR EACH ROW EXECUTE FUNCTION free_seat_on_attendee_delete();

-- 6. Enable Row Level Security (RLS) & Grant Access Policies
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

-- 7. Enable Realtime Replication
ALTER PUBLICATION supabase_realtime ADD TABLE attendees;
ALTER PUBLICATION supabase_realtime ADD TABLE seats;
