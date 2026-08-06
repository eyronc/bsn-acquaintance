-- Attendees table
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

-- Seats table (6 tables × 10 seats = 60 total)
CREATE TABLE IF NOT EXISTS seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INT NOT NULL,
  seat_number INT NOT NULL,
  attendee_id UUID REFERENCES attendees(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'available', -- available, reserved, confirmed
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(table_number, seat_number)
);

-- Enable Row Level Security
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attendees
DROP POLICY IF EXISTS "Students can view their own attendee record" ON attendees;
DROP POLICY IF EXISTS "Admins can view all attendees" ON attendees;
DROP POLICY IF EXISTS "Allow public read on attendees" ON attendees;
DROP POLICY IF EXISTS "Allow public insert on attendees" ON attendees;
DROP POLICY IF EXISTS "Allow public update on attendees" ON attendees;

CREATE POLICY "Allow public read on attendees" ON attendees FOR SELECT USING (TRUE);
CREATE POLICY "Allow public insert on attendees" ON attendees FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow public update on attendees" ON attendees FOR UPDATE USING (TRUE);

-- RLS Policies for seats
DROP POLICY IF EXISTS "Anyone can view seat status" ON seats;
DROP POLICY IF EXISTS "Allow public update on seats" ON seats;
DROP POLICY IF EXISTS "Allow public insert on seats" ON seats;

CREATE POLICY "Anyone can view seat status" ON seats FOR SELECT USING (TRUE);
CREATE POLICY "Allow public insert on seats" ON seats FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow public update on seats" ON seats FOR UPDATE USING (TRUE);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_attendees_email ON attendees(email);
CREATE INDEX IF NOT EXISTS idx_seats_table ON seats(table_number);
CREATE INDEX IF NOT EXISTS idx_seats_attendee ON seats(attendee_id);
CREATE INDEX IF NOT EXISTS idx_seats_status ON seats(status);
