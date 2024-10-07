-- Create Users Table
-- Drop the old users table (if it exists)
DROP TABLE IF EXISTS users;

-- Create the new users table with additional meaningful columns
CREATE TABLE users (
    id SERIAL PRIMARY KEY,            -- Unique identifier for each user
    first_name VARCHAR(255) NOT NULL, -- User's first name
    last_name VARCHAR(255) NOT NULL,  -- User's last name
    username VARCHAR(255) NOT NULL UNIQUE, -- Unique username
    email VARCHAR(255) NOT NULL UNIQUE,    -- Unique email address
    password_hash VARCHAR(255) NOT NULL,   -- Hashed password for secure login
    role VARCHAR(50) DEFAULT 'user',       -- User role (e.g., 'admin', 'user')
    mobile_number VARCHAR(15),             -- User's mobile number (optional)
    address1 TEXT,                         -- Address line 1
    address2 TEXT,                         -- Address line 2 (optional)
    profile_picture_url TEXT,              -- Optional profile picture URL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the user was created
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp for when user was last updated
);


-- Create Courses Table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    topic_detail TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Progress Table (Tracks completed courses)
CREATE TABLE progress (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    course_id INT REFERENCES courses(id),
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create QuizScores Table (Tracks users' quiz scores)
CREATE TABLE quiz_scores (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    course_id INT REFERENCES courses(id),
    score INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
