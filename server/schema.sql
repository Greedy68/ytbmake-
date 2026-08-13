-- Google Cloud SQL (PostgreSQL / MySQL) Database Schema for DGMD Video Platform

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(128) PRIMARY KEY, -- Firebase Auth UID
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(32) DEFAULT 'user', -- 'admin' or 'user'
    avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Videos & Lessons Table
CREATE TABLE IF NOT EXISTS videos (
    id VARCHAR(64) PRIMARY KEY,
    module_id VARCHAR(64) NOT NULL,
    module_title VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    duration VARCHAR(32) NOT NULL,
    thumbnail_url TEXT NOT NULL,
    video_url TEXT NOT NULL,
    is_free_preview BOOLEAN DEFAULT FALSE,
    price DECIMAL(10, 2) DEFAULT 19.99,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Comments & Moderation Queue Table
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(64) PRIMARY KEY,
    lesson_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(128) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_avatar TEXT,
    content TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Orders & PayPal Purchases Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(128) UNIQUE NOT NULL,
    user_id VARCHAR(128) NOT NULL,
    lesson_id VARCHAR(64) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(32) DEFAULT 'COMPLETED',
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
