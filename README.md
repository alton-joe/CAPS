# CAPS - Comprehensive Academic & Presence System

CAPS is a modern, responsive web application built with Next.js that streamlines student attendance tracking, academic grade management, and advanced analytics for educational institutions.

## Features

### 🔐 Secure Role-Based Access Control (RBAC)
- **Admin Accounts**: Have full read/write privileges. Admins can create students, mark attendance, assign letter grades, and view platform-wide analytics.
- **Student Accounts**: Have restricted read-only access. Students can log in to view their personal attendance records and assigned grades, but cannot alter data or view other students' information.

### 📊 Admin Analytics Dashboard
- View real-time platform statistics (Total Students, Overall Attendance, Grades Assigned).
- Interactive **Attendance Bar Chart** comparing 'Present' vs 'Absent' counts across all tracked events.
- Interactive **Grade Distribution Chart** visualizing the curve of letter grades (A, B, C, D, F) awarded across all subjects.

### 📝 Attendance & Grades Trackers
- Dynamic rosters that adapt to the currently selected Subject or Event.
- Seamless dropdowns for assigning letter grades and one-click toggle buttons for attendance.
- **Export Engine**: Instantly export any class roster to a `.CSV` file or automatically copy the data and redirect to a blank Google Sheet for external manipulation.

### 💾 Local JSON Persistence
- Data is stored lightning-fast using local filesystem reads/writes into the `data/` directory (`users.json`, `attendance.json`, `grades.json`), removing the need for a complex external database during development.

---

## Getting Started

### 1. Installation
Clone the repository and install the required dependencies:
```bash
npm install
```

### 2. Environment Variables
To ensure secure login sessions, you need to create a `.env` file in the root of your project. You can copy the `.env.example` file and populate it:
```env
JWT_SECRET=replace_with_a_long_random_secure_string
NEXT_PUBLIC_APP_NAME=CAPS
```

### 3. Login Credentials
When you start the app, the database is pre-populated with a default Admin account:
- **Email:** `admin@caps.cu`
- **Password:** `admin`

Any new students added by the Admin through the platform will automatically be assigned the default password: `12345`.

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Production Deployment (Vercel)

If you plan to deploy this application to Vercel, please note the following:

1. **Environment Variables:** You MUST add the `JWT_SECRET` manually in your Vercel Project Settings -> Environment Variables.
2. **Serverless Filesystem:** Vercel utilizes serverless functions which run on a **read-only filesystem**. Because this application currently uses local `.json` files to store data, Vercel will block any attempts to "write" new attendance or grades in production. 
3. **Database Migration:** To run this securely in production on Vercel, you should provision a Vercel Postgres database and migrate the API routes to use SQL. (Migration schema files like `attendance_setup.sql` and `grades_setup.sql` are provided in the repository).
