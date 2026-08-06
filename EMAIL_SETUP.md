# BSN Acquaintance Party 2026 - Email Setup

## 🚀 Quick Start

### Local Development (with Backend)

**Terminal 1: Frontend**
```bash
npm run dev
# Opens http://localhost:5173
```

**Terminal 2: Backend** (NEW!)
```bash
cd backend
npm install
npm run dev
# Starts http://localhost:3001
```

Both need to run for emails to work locally!

---

## 🏗️ Architecture

### Local Development
```
Frontend (localhost:5173)
    ↓ POST /api/send-access-code
Backend (localhost:3001)
    ↓ API call with Resend key
Resend API
    ↓
Email sent ✉️
```

### Production (Vercel)
```
Frontend (your-app.vercel.app)
    ↓ POST /api/send-access-code
Vercel Serverless Function (/api/send-access-code.js)
    ↓ API call with Resend key
Resend API
    ↓
Email sent ✉️
```

**Key Benefit:** Same code path, different deployment!

---

## 📋 File Structure

```
bsn-acquaintance/
├── src/
│   └── services/
│       └── emailService.js           ← Calls backend endpoint
├── backend/                          ← Local development server
│   ├── server.js                     ← Express server
│   ├── package.json
│   └── .env                          ← Resend API key
├── api/                              ← Vercel serverless functions
│   └── send-access-code.js           ← Production endpoint
├── .env.local                        ← Frontend env vars
└── vercel.json                       ← Vercel config
```

---

## 🔧 Local Setup Steps

### 1. Install Backend Dependencies

```bash
cd C:\PROJECTS\bsn-acquaintance\backend
npm install
```

This installs: express, cors, dotenv

### 2. Start Both Servers

**Terminal 1:**
```bash
cd C:\PROJECTS\bsn-acquaintance
npm run dev
```

**Terminal 2:**
```bash
cd C:\PROJECTS\bsn-acquaintance\backend
npm run dev
```

### 3. Test

Go to http://localhost:5173/admin
- Create attendee
- Check browser console
- Email should send! ✉️

---

## 🌐 Production Deployment (Vercel)

### 1. Push to GitHub

```bash
git add .
git commit -m "Add backend for email service and Vercel serverless functions"
git push
```

### 2. Connect to Vercel

1. Go to: https://vercel.com
2. Click "New Project"
3. Import your GitHub repo
4. Select root directory
5. Click "Deploy"

### 3. Set Environment Variable

In Vercel Dashboard:
1. Project Settings → Environment Variables
2. Add: `VITE_RESEND_API_KEY` = `re_dDMM7xoh_HuAWb5Nk5rcNHZwn6bDi7TSK`
3. Redeploy

**That's it!** Your production app will use `/api/send-access-code.js` automatically.

---

## ✅ Verification

### Local
- Backend runs: http://localhost:3001/health
- Should return: `{ "status": "ok", "message": "Backend is running" }`

### Production
- Check Vercel Logs for any errors
- Test by creating attendee in admin panel
- Email should arrive

---

## 🐛 Troubleshooting

### "Email service not configured"
- Make sure `.env.local` has `VITE_RESEND_API_KEY`
- Restart dev servers
- Check backend console for errors

### "Failed to connect to localhost:3001"
- Make sure backend server is running in second terminal
- Check if port 3001 is available

### "Email still not sending on production"
- Check Vercel environment variables are set
- View Vercel function logs
- Make sure Resend API key is valid

---

## 📧 How It Works

1. Admin creates attendee (name + email)
2. Frontend calls: `POST /api/send-access-code`
3. Backend receives request
4. Backend calls Resend API with email + code
5. Resend sends beautiful HTML email
6. Response sent back to frontend
7. Toast notification shows status

Simple, clean, works everywhere! 🚀