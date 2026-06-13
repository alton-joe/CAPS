-- 1. Create the Grades Table
-- This table maps a specific subject, a specific student, and their grade.
-- The UNIQUE constraint ensures a student only has one grade record per subject.
CREATE TABLE IF NOT EXISTS grades_records (
    id SERIAL PRIMARY KEY,
    subject_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    grade VARCHAR(10) DEFAULT 'Ungraded',
    UNIQUE (subject_name, student_email)
);

-- 2. Save or Update Grade (Upsert)
-- When you select a grade from the dropdown, you save the state. 
-- ON CONFLICT is used to insert a new record if one doesn't exist, or update the existing one if it does.
INSERT INTO grades_records (subject_name, student_email, grade)
VALUES ('Computer Science 101', 'student@caps.cu', 'A')
ON CONFLICT (subject_name, student_email) 
DO UPDATE SET grade = EXCLUDED.grade;

-- 3. Fetch Grades for a Subject
-- Run this query to load the grades so the dropdowns show the correct values immediately.
SELECT student_email, grade 
FROM grades_records 
WHERE subject_name = 'Computer Science 101';
