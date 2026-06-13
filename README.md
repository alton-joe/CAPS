# CAPS - Attendance Management System

A polished Next.js 14.2 web app for managing students, attendance, and grades, with data persisted in Google Sheets through Google Apps Script.

## Stack

- Next.js 14.2 (App Router)
- React 18.3 + React DOM
- TypeScript 5.6
- Tailwind CSS 3.4
- Recharts (dashboard visualizations)

## Features

- Login (demo auth with secure HTTP-only cookie)
- CAPS branded UI with responsive dashboard
- Add student
- Search, edit, and delete student
- Log attendance and grade entries
- Search, edit, and delete records
- Dashboard cards + charts
- Analytics page with insights
- Google Apps Script + Google Sheets backend integration

## 1. Local setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and fill values:

```env
NEXT_PUBLIC_APP_NAME=CAPS
NEXT_PUBLIC_DEMO_EMAIL=admin@caps.local
NEXT_PUBLIC_DEMO_PASSWORD=123456
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXXXXXX/exec
GOOGLE_APPS_SCRIPT_API_KEY=your_api_key
JWT_SECRET=replace_with_a_long_random_string
```

3. Run dev server:

```bash
npm run dev
```

## 2. Google Apps Script backend setup

1. Create a Google Sheet.
2. Open Extensions -> Apps Script.
3. Replace generated content with [apps-script/Code.gs](apps-script/Code.gs).
4. In Apps Script, open Project Settings -> Script properties and add:
   - `API_KEY`: same value as `GOOGLE_APPS_SCRIPT_API_KEY` in your Next.js `.env`.
5. Deploy:
   - Deploy -> New deployment
   - Type: Web app
   - Execute as: Me
   - Who has access: Anyone
6. Copy the web app URL into `GOOGLE_APPS_SCRIPT_URL`.

## 3. Submission guidance (as per assignment)

Your assignment asks for a published Google Site link. For best impression:

1. Deploy Next.js app (Vercel recommended).
2. Create a Google Site page that includes:
   - Project title + short overview
   - Deployed app link
   - Demo credentials
   - Architecture note: Next.js UI + Google Sheets via Apps Script
3. Publish the Google Site and submit that public link.

## Optional Supabase support

This project currently uses Google Sheets (required by your brief), so Supabase is not needed.
If evaluators ask for database-grade design, see [supabase/migrations.sql](supabase/migrations.sql) for a ready schema.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
