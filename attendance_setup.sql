-- 1. Create the Attendance Table
-- This table maps a specific event, a specific student, and whether they were present.
-- The UNIQUE constraint ensures a student only has one record per event.
CREATE TABLE IF NOT EXISTS attendance_records (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    is_present BOOLEAN DEFAULT FALSE,
    UNIQUE (event_name, student_email)
);

-- 2. Save or Update Attendance (Upsert)
-- When you click the toggle button, you save the state. 
-- ON CONFLICT is used to insert a new record if one doesn't exist, or update the existing one if it does.
-- Change TRUE to FALSE if you are marking them absent.
INSERT INTO attendance_records (event_name, student_email, is_present)
VALUES ('Web Development Workshop', 'student@caps.cu', TRUE)
ON CONFLICT (event_name, student_email) 
DO UPDATE SET is_present = EXCLUDED.is_present;

-- 3. Fetch Attendance for an Event
-- Run this query to load who has been marked present so the buttons show the correct colors immediately.
-- Replace the event name with the one you are currently viewing.
SELECT student_email, is_present 
FROM attendance_records 
WHERE event_name = 'Web Development Workshop';
