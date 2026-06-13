-- 1. Create the Table
-- This table stores the emails of users who have been granted access.
CREATE TABLE IF NOT EXISTS authorized_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Grant Access (Insert example)
-- Replace 'student@caps.cu' with the actual email you want to insert.
INSERT INTO authorized_users (email) 
VALUES ('student@caps.cu');

-- 3. Verify Login Access (Select example)
-- Used to check if an email exists in the system when someone tries to log in.
SELECT email 
FROM authorized_users 
WHERE email = 'student@caps.cu' 
LIMIT 1;

-- 4. Fetch All Users
-- Used to list all authorized users on the Admin Dashboard.
SELECT email 
FROM authorized_users 
ORDER BY granted_at DESC;

-- 5. Revoke Access (Delete example)
-- Used when the Admin clicks the "Remove" button.
DELETE FROM authorized_users 
WHERE email = 'student@caps.cu';
