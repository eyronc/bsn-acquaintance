# BSN Acquaintance Party 2026 - Seating & Event Management Portal

> **Official Event Management & Seat Reservation System**  
> *University of Cebu Lapu-Lapu and Mandaue (UCLM) - College of Nursing & Nursing Student Body Organization (NSBO)*

---

## Event Details

- **Venue**: **Mactan Expo Center**
- **Date**: **September 26, 2026 (Saturday)**
- **Time**: **5:00 PM – 10:00 PM**
- **Theme**: **Celestial Garden: A Night of Wonder and Grace**

---

## Overview

The **BSN Acquaintance Party 2026 Portal** is a production-ready, full-stack event management and real-time seat reservation platform tailored for nursing students, faculty, and administrators. 

Built with **React 18**, **Vite**, **Tailwind CSS**, and **Supabase (PostgreSQL)**, the system manages **149 banquet tables (1,490 total seats)** arranged across **7 dedicated societies (Societies A through G)**, matching the venue floor layout.

---

## Key Features

### 1. Student Experience (Multi-Route Portal)
- **Dedicated Multi-Route Navigation**:
  - `/dashboard`: **Student Hub** displaying confirmed reservation status, personal access code, assigned society capacity analytics, and event schedule.
  - `/seats` (and `/seats/:societyParam`): **Interactive Seat Selector** with 360-degree round table rendering, 6 tables per page pagination, search filtering by table code, and real-time seat occupancy indicators.
  - `/pass` (and `/ticket`): **Digital Admission Pass** displaying student credentials (`BSN - 4B`), unique access code, seat coordinates (`Table B-02 • Seat 6`), and official event guidelines.
  - Deep-linkable `/dashboard/:societySlug` routing for instant society zone sharing.
- **Seat Restriction Enforcement**: Students are restricted to picking seats within their assigned society zone, while retaining permission to browse other zones.
- **Confirmation Safeguards**: 2-step confirmation modal with cautionary notices and acknowledgment checkboxes to prevent accidental seat bookings.

### 2. Official Digital Pass Print / PDF Export
- **100% Society Theming**: When printing or saving as PDF (`Ctrl + P`), the entire document fills edge-to-edge with the student's assigned society pastel color (e.g. Society B soft sky blue `#f0f7fc`).
- **Clean Borderless Output**: `@page { margin: 0; }` configuration completely strips browser-injected URLs (`localhost:5173/pass`), timestamps, page counts (`1/1`), and header titles.
- **Dead-Center Layout**: Digital pass card is centered vertically and horizontally on the page for a premium, frameless presentation.
- **Interface Element Suppression**: Action buttons, headers, and navigation bars automatically hide when printing.

### 3. Dynamic Neumorphic Society Theming
- **Dynamic Theming Engine**: Each society features its own tailored pastel palette and neumorphic tokens (`--neu-bg`, `--neu-shadow-dark`, `--neu-shadow-light`, `--neu-accent`, `--neu-border`):
  - **Society A**: **Emerald / Sage Green** (`#e8f5ed`) - *Row A (Front Stage)*
  - **Society B**: **Sky Blue** (`#f0f7fc`) - *Row B (Instructors & NSBO Front)*
  - **Society C**: **Royal Lavender** (`#f3ecfb`) - *Row C (Hall Mid-Front)*
  - **Society D**: **Warm Amber / Gold** (`#faf4e4`) - *Row D (Hall Center)*
  - **Society E**: **Rose / Coral Pink** (`#fae9f0`) - *Row E (Working Area Mid-Back)*
  - **Society F**: **Fresh Teal / Mint** (`#e8f8f5`) - *Row F (Hall Back)*
  - **Society G**: **Peach / Bronze** (`#fbf0e6`) - *Row G (Near Food Stations)*
- **Global CSS Synchronization**: `data-society` attribute synchronizes across `<html>` and `<body>` for seamless background transitions.

### 4. Interactive Hall Stage Floor Plan
- **High-Res Stage Map**: Zoomable and draggable modal rendering `/STAGE.png`.
- **Pan & Zoom Controls**: Mouse wheel zooming, pinch gestures for touch screens, drag-to-pan, zoom in/out buttons, and reset view.
- **High-Res Download**: Direct download trigger for offline student reference.

### 5. Administrative Management Panel (`/admin/panel`)
- **Passcode Protection**: Secured via environment variable (`VITE_ADMIN_PASSWORD`).
- **Guest List Management**: Real-time attendees table with search by Name, Email, Access Code, Class Badge, or Society.
- **Filtering & Multi-Attribute Sorting**: Filter by Year Level (1st–4th Year), Section (A–M), Society, and Confirmation status. Sort by Name, Class, or Registration Date.
- **Attendee Creation & Unique Code Generator**: Automatic generation of 12-character cryptographic access codes.
- **Edit Attendee Modal**: Update attendee names, email, society, class, payment amount, and release/reassign reserved seats.
- **Multi-Sheet Excel Export (`.xlsx`)**: Exports complete attendee rosters and seating reports powered by SheetJS.

### 6. Automated Email Notification Engine
- **Dual-Environment Architecture**:
  - **Local Development**: Node.js & Express server running on port `3001` with Nodemailer.
  - **Production (Vercel)**: Serverless API handler (`api/send-access-code.js`).
- **Automated Access Code Email**: Dispatches unique access code and login instructions upon registration with multi-tier failover (Resend → Brevo → Gmail).
- **Direct Digital Ticket Pass**: Seat confirmation instantly generates a downloadable & printable admission pass on-site, preserving 100% of email quota.

---

## Venue Seating Architecture

Based on the official Mactan Expo Center Stage configuration (`/STAGE.png`):

| Row Letter | Zone / Society | Tables Count | Seats Count | Description |
| :---: | :---: | :---: | :---: | :--- |
| **Row A** | **Society A** | **19 Tables** (`A-01` to `A-19`) | **190 Seats** | Front Stage Area |
| **Row B** | **Society B** | **22 Tables** (`B-01` to `B-22`) | **220 Seats** | Instructors & NSBO Front |
| **Row C** | **Society C** | **22 Tables** (`C-01` to `C-22`) | **220 Seats** | Hall Mid-Front Area |
| **Row D** | **Society D** | **22 Tables** (`D-01` to `D-22`) | **220 Seats** | Hall Center Area |
| **Row E** | **Society E** | **24 Tables** (`E-01` to `E-24`) | **240 Seats** | Working Area Mid-Back |
| **Row F** | **Society F** | **24 Tables** (`F-01` to `F-24`) | **240 Seats** | Hall Back Area |
| **Row G** | **Society G** | **16 Tables** (`G-01` to `G-16`) | **160 Seats** | Near Food Stations |
| **TOTAL** | **7 Societies** | **149 Tables** | **1,490 Seats** | **10 Seats Per Table** |

---

## Tech Stack

- **Frontend Core**: **React 18**, **Vite 5**, **React Router v7**
- **Styling & Neumorphism**: **Tailwind CSS v3**, **Custom CSS Tokens**, Google Fonts (Plus Jakarta Sans, Inter)
- **Icons**: **Lucide React**
- **Spreadsheet Engine**: **XLSX (SheetJS)**
- **Backend Service**: **Node.js**, **Express**, **Nodemailer**
- **Serverless (Cloud)**: **Vercel Serverless Functions** (`/api/*`)
- **Database & Storage**: **Supabase (PostgreSQL with Row Level Security & Real-Time Channels)**

---

## Project Structure

```text
uclm-bsn-acquaintance/
├── api/                                # Vercel Serverless Functions
│   ├── send-access-code.js             # Access code email handler
│   └── society-email-theme.js          # Dynamic color palettes per society
├── backend/                            # Local Node/Express Email Service
│   ├── server.js                       # Express email server (Port 3001)
│   └── package.json
├── frontend/                           # React + Vite Application
│   ├── public/                         # Static assets (STAGE.png, emblems, logos)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Admin/                  # AdminPanel, EditAttendeeModal
│   │   │   ├── Auth/                   # StudentLogin, AdminLogin
│   │   │   ├── Dashboard/              # StudentDashboard, SeatMap, DigitalTicketView,
│   │   │   │                           # StudentOverview, SeatSelectionView, FloorPlanModal
│   │   │   └── UI/                     # Modal, Toast
│   │   ├── hooks/                      # useAuth, useSeats
│   │   ├── services/                   # emailService
│   │   ├── supabase/                   # Supabase client & schema.sql
│   │   ├── utils/                      # societyTheme (Color palettes & slug helpers)
│   │   ├── App.jsx                     # Route architecture & auth guards
│   │   ├── index.css                   # Neumorphic tokens, scrollbars & print CSS
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── vercel.json                         # Vercel deployment & rewrite configuration
├── package.json                        # Root helper scripts
└── README.md
```

---

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/eyronc/bsn-acquaintance.git
cd bsn-acquaintance
```

### 2. Install Dependencies
Install dependencies for both frontend and backend:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Return to root
cd ..
```

### 3. Configure Environment Variables
Create `.env.local` inside the `frontend/` folder:
```bash
cd frontend
cp .env.example .env.local
```

Fill in your Supabase project credentials and admin password:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_ADMIN_PASSWORD=your_secure_admin_password
```

*(Optional for local email testing)* Create `.env` inside the `backend/` folder:
```env
PORT=3001
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### 4. Setup Supabase Database Schema
1. Open your project dashboard at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor**.
3. Copy and run the full database script from [`frontend/src/supabase/schema.sql`](file:///c:/Users/aaron/OneDrive/Documents/uclm-bsn-acquaintance/frontend/src/supabase/schema.sql).
   - Creates the `attendees` table with full student profile attributes.
   - Creates the `seats` table configured for 149 tables across Rows A through G.

### 5. Run the Application Locally

#### Launch Frontend (Vite Dev Server)
```bash
cd frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

#### Launch Local Email Service (Optional for testing email dispatch)
```bash
cd backend
npm run dev
```
Runs the Express service on [http://localhost:3001](http://localhost:3001).

---

## Login Credentials

### Student Access
- **Email Address**: Student's registered email (e.g. `student@uclm.edu.ph`)
- **Access Code**: Cryptographic 12-character code (e.g. `ILE9W7NK51U6`) generated upon registration.

### Admin Portal Access
- Navigate to `/admin` or click **Admin Portal** on the login page.
- **Admin Password**: The value defined in `VITE_ADMIN_PASSWORD` (default: `admin123` or your customized secret).

---

## Production Deployment (Vercel)

The repository is pre-configured with [`vercel.json`](file:///c:/Users/aaron/OneDrive/Documents/uclm-bsn-acquaintance/vercel.json) to deploy both the static frontend and serverless email functions seamlessly:

1. Push your changes to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Configure the **Environment Variables** in your Vercel Project Settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_PASSWORD`
   - `EMAIL_USER` *(Gmail or SMTP address)*
   - `EMAIL_PASS` *(Gmail App Password or SMTP password)*
4. Click **Deploy**. Vercel will automatically build the React Vite bundle and mount serverless API routes under `/api/*`.

---

## License

This project is developed for the **University of Cebu Lapu-Lapu and Mandaue (UCLM) - College of Nursing** and the **Nursing Student Body Organization (NSBO)** for the 2026 Acquaintance Party. All rights reserved.
