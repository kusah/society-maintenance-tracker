-- ============================================
-- Database Schema
-- ============================================
-- 1. USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'resident'
        CHECK (role IN ('resident', 'admin')),
    flat_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 2. COMPLAINTS
CREATE TABLE complaints (
    id SERIAL PRIMARY KEY,
    resident_id INTEGER NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    photo_url TEXT,
    priority VARCHAR(20) NOT NULL DEFAULT 'Low'
        CHECK (priority IN ('Low', 'Medium', 'High')),
    status VARCHAR(20) NOT NULL DEFAULT 'Open'
        CHECK (status IN ('Open', 'In Progress', 'Resolved')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,

    CONSTRAINT fk_complaint_resident
        FOREIGN KEY (resident_id)
        REFERENCES users(id)
);


-- 3. COMPLAINT STATUS HISTORY
CREATE TABLE complaint_status_history (
    id SERIAL PRIMARY KEY,
    complaint_id INTEGER NOT NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_by INTEGER NOT NULL,
    note TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_history_complaint
        FOREIGN KEY (complaint_id)
        REFERENCES complaints(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_history_user
        FOREIGN KEY (changed_by)
        REFERENCES users(id)
);


-- 4. NOTICES
CREATE TABLE notices (
    id SERIAL PRIMARY KEY,
    posted_by INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    is_important BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notice_admin
        FOREIGN KEY (posted_by)
        REFERENCES users(id)
);


-- 5. NOTIFICATIONS LOG
CREATE TABLE notifications_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL
        CHECK (type IN ('status_change', 'notice')),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT FALSE,

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);