-- Attendees table
CREATE TABLE attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  fullname VARCHAR(255) NOT NULL,
  unique_code VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seats table (6 tables × 10 seats = 60 total)
CREATE TABLE seats (
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
CREATE POLICY "Students can view their own attendee record"
  ON attendees FOR SELECT
  USING (email = current_user_email());

CREATE POLICY "Admins can view all attendees"
  ON attendees FOR SELECT
  USING (TRUE);

-- RLS Policies for seats
CREATE POLICY "Anyone can view seat status"
  ON seats FOR SELECT
  USING (TRUE);

CREATE POLICY "Students can update their own seat"
  ON seats FOR UPDATE
  USING (attendee_id = (SELECT id FROM attendees WHERE email = current_user_email()));

-- Indexes for performance
CREATE INDEX idx_attendees_email ON attendees(email);
CREATE INDEX idx_seats_table ON seats(table_number);
CREATE INDEX idx_seats_attendee ON seats(attendee_id);
CREATE INDEX idx_seats_status ON seats(status);
