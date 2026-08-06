# BSN Acquaintance Party 2026 - Seating System

An enchanted web application for managing seat reservations for the UCLM Bachelor of Science in Nursing (BSN) Acquaintance Party 2026.

## Features

- **Student Dashboard**: Students login with email + unique code and select their seat from 6 banquet tables (10 seats each)
- **Admin Panel**: Admins create attendee records, generate cryptic access codes, and manage registrations
- **Real-time Updates**: Supabase real-time subscriptions show live seat availability across all users
- **Enchanted Theme**: Soft pastel nursing colors with smooth animations and magical UI
- **Mobile Responsive**: Fully responsive design for all devices
- **Secure**: Row-level security in Supabase, hardcoded admin password protection

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS with custom enchanted theme
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase WebSocket subscriptions
- **Icons**: Lucide React
- **Deployment**: Vercel

## Installation

### 1. Clone Repository
```bash
cd C:\PROJECTS
git clone https://github.com/iggyboi2x/bsn-acquaintance.git
cd bsn-acquaintance
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Environment Variables
```bash
copy .env.example .env.local
```

Then fill in your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_PASSWORD=your-admin-password
```

### 4. Setup Supabase Database

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `src/supabase/schema.sql`
3. Copy your project URL and anon key to `.env.local`

### 5. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:5173`

## Login Credentials

### Student Access
- **Email**: Any registered attendee email
- **Password**: The unique cryptic code (sent to their email by admin)

### Admin Access
- **Password**: Use the `VITE_ADMIN_PASSWORD` from `.env.local`

## Database Schema

### attendees table
- `id`: UUID (primary key)
- `email`: Unique email address
- `fullname`: Student full name
- `unique_code`: Cryptic 12-character access code
- `created_at`: Timestamp
- `updated_at`: Timestamp

### seats table
- `id`: UUID (primary key)
- `table_number`: 1-6
- `seat_number`: 1-10 per table
- `attendee_id`: FK to attendees (null if unoccupied)
- `status`: 'available' | 'reserved' | 'confirmed'
- `confirmed_at`: Timestamp of confirmation
- `created_at`, `updated_at`: Timestamps

## Workflow

1. **Admin**: Creates attendee (email + name) → generates unique code → sends via email
2. **Student**: Logs in with email + code
3. **Student**: Clicks white seat → seat turns green (reserved)
4. **Student**: Clicks "Confirm" → modal with caution warning
5. **Student**: Checks "I understand" → confirms seat
6. **Real-time**: All other users see seat as occupied (pink, faded)
7. **Student**: Cannot change seat once confirmed

## Theme Colors

- **Pink**: `#FFB6D9` (Primary, nursing soft)
- **Lavender**: `#E6D4F7` (Secondary)
- **Sage Green**: `#C8E6D1` (Accent/confirmed)
- **Cream**: `#FEF9F3` (Background)
- **Deep Plum**: `#4A3F5C` (Text)
- **Gold**: `#F4D8A6` (Accents, sparkle)

## Responsive Design

- Mobile-first approach
- Tablet optimized
- Desktop enhanced with seat circle layout

## Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Build for Production
```bash
npm run build
npm run preview
```

---
