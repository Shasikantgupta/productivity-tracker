-- ============================================
-- PostgreSQL Database Initialization Script
-- Employee Productivity Analytics System
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'employee'
        CHECK (role IN ('super_admin', 'admin', 'manager', 'hr', 'employee', 'viewer')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_login TIMESTAMP,
    failed_login_attempts VARCHAR(10) DEFAULT '0',
    locked_until TIMESTAMP,
    password_changed_at TIMESTAMP,
    refresh_token TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- DEPARTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) UNIQUE NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    head_id UUID,
    parent_id UUID REFERENCES departments(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TEAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(id),
    lead_id UUID,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- EMPLOYEES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id),
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    department_id UUID REFERENCES departments(id),
    team_id UUID REFERENCES teams(id),
    manager_id UUID REFERENCES employees(id),
    designation VARCHAR(200),
    employment_status VARCHAR(20) DEFAULT 'active'
        CHECK (employment_status IN ('active', 'on_leave', 'suspended', 'terminated')),
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    tracking_enabled BOOLEAN DEFAULT TRUE,
    screenshot_enabled BOOLEAN DEFAULT TRUE,
    screenshot_interval INTEGER DEFAULT 300,
    app_tracking_enabled BOOLEAN DEFAULT TRUE,
    website_tracking_enabled BOOLEAN DEFAULT TRUE,
    idle_timeout_seconds INTEGER DEFAULT 300,
    expected_hours_per_day FLOAT DEFAULT 8.0,
    timezone VARCHAR(50) DEFAULT 'UTC',
    work_schedule JSONB DEFAULT '{}',
    agent_version VARCHAR(20),
    agent_last_seen TIMESTAMP,
    agent_machine_name VARCHAR(200),
    agent_os VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_employees_code ON employees(employee_code);
CREATE INDEX idx_employees_dept ON employees(department_id);

-- ============================================
-- ACTIVITY LOGS TABLE (Partitioned by month)
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'idle', 'away', 'offline')),
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    duration_seconds INTEGER,
    keyboard_events INTEGER DEFAULT 0,
    mouse_events INTEGER DEFAULT 0,
    mouse_distance_px FLOAT DEFAULT 0.0,
    machine_name VARCHAR(200),
    ip_address INET,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_employee_date ON activity_logs(employee_id, started_at);
CREATE INDEX idx_activity_status ON activity_logs(status);

-- ============================================
-- APP USAGE LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS app_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    app_name VARCHAR(300) NOT NULL,
    app_executable VARCHAR(500),
    window_title TEXT,
    app_category VARCHAR(20) DEFAULT 'uncategorized',
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    duration_seconds INTEGER,
    is_foreground BOOLEAN DEFAULT TRUE,
    app_metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_app_usage_employee_date ON app_usage_logs(employee_id, started_at);
CREATE INDEX idx_app_usage_name ON app_usage_logs(app_name);

-- ============================================
-- WEBSITE VISIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS website_visit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    url TEXT NOT NULL,
    domain VARCHAR(500) NOT NULL,
    page_title TEXT,
    category VARCHAR(20) DEFAULT 'uncategorized',
    visited_at TIMESTAMP NOT NULL,
    left_at TIMESTAMP,
    duration_seconds INTEGER,
    is_active_tab BOOLEAN DEFAULT TRUE,
    browser_name VARCHAR(50),
    tab_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_website_employee_date ON website_visit_logs(employee_id, visited_at);
CREATE INDEX idx_website_domain ON website_visit_logs(domain);

-- ============================================
-- ATTENDANCE RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    work_date DATE NOT NULL,
    clock_in TIMESTAMP,
    clock_out TIMESTAMP,
    clock_type VARCHAR(20) DEFAULT 'automatic',
    break_start TIMESTAMP,
    break_end TIMESTAMP,
    total_break_minutes INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'present',
    total_hours FLOAT,
    active_hours FLOAT,
    idle_hours FLOAT,
    overtime_hours FLOAT DEFAULT 0.0,
    clock_in_ip INET,
    clock_out_ip INET,
    is_remote BOOLEAN DEFAULT FALSE,
    notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(employee_id, work_date)
);

CREATE INDEX idx_attendance_employee_date ON attendance_records(employee_id, work_date);

-- ============================================
-- SCREENSHOTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS screenshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(200) NOT NULL,
    file_size_bytes INTEGER,
    file_hash VARCHAR(64),
    is_encrypted BOOLEAN DEFAULT TRUE,
    encryption_iv VARCHAR(64),
    captured_at TIMESTAMP NOT NULL,
    capture_type VARCHAR(20) DEFAULT 'scheduled',
    screen_width INTEGER,
    screen_height INTEGER,
    active_app VARCHAR(300),
    active_window_title TEXT,
    ai_productivity_score FLOAT,
    ai_labels JSONB,
    is_blurred BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    access_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_screenshot_employee_date ON screenshots(employee_id, captured_at);

-- ============================================
-- PRODUCTIVITY SCORES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS productivity_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    score_date DATE NOT NULL,
    overall_score FLOAT NOT NULL,
    active_time_score FLOAT,
    app_usage_score FLOAT,
    web_usage_score FLOAT,
    attendance_score FLOAT,
    total_active_minutes INTEGER DEFAULT 0,
    total_idle_minutes INTEGER DEFAULT 0,
    productive_app_minutes INTEGER DEFAULT 0,
    unproductive_app_minutes INTEGER DEFAULT 0,
    top_apps JSONB,
    top_websites JSONB,
    ai_insights JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(employee_id, score_date)
);

-- ============================================
-- PRODUCTIVITY REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS productivity_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_type VARCHAR(20) NOT NULL,
    title VARCHAR(300) NOT NULL,
    generated_by UUID NOT NULL REFERENCES users(id),
    department_id UUID REFERENCES departments(id),
    team_id UUID REFERENCES teams(id),
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    report_data JSONB NOT NULL,
    ai_summary TEXT,
    ai_recommendations JSONB,
    file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PRIVACY POLICIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS privacy_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    data_collected JSONB NOT NULL,
    data_retention_days INTEGER DEFAULT 365,
    is_active BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- EMPLOYEE CONSENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS employee_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    policy_id UUID NOT NULL REFERENCES privacy_policies(id),
    consented BOOLEAN NOT NULL,
    consented_at TIMESTAMP,
    revoked_at TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    consent_method VARCHAR(50) DEFAULT 'desktop_agent',
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- SECURITY ALERTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS security_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    alert_type VARCHAR(30) NOT NULL,
    severity VARCHAR(10) DEFAULT 'low',
    title VARCHAR(300) NOT NULL,
    description TEXT,
    details JSONB,
    triggered_at TIMESTAMP NOT NULL DEFAULT NOW(),
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alert_severity ON security_alerts(severity);
CREATE INDEX idx_alert_unack ON security_alerts(acknowledged) WHERE acknowledged = FALSE;

-- ============================================
-- SEED DATA: Default Admin User
-- Password: Admin@123456
-- ============================================
INSERT INTO users (email, username, hashed_password, full_name, role, is_active, is_verified)
VALUES (
    'admin@company.com',
    'admin',
    '$2b$12$LqHmshkNUKYEQxJnXZpO5.eBCyFwBrSVWRPJxyJkGPzVnGl0bPhoe',
    'System Administrator',
    'super_admin',
    TRUE,
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- Seed privacy policy
INSERT INTO privacy_policies (version, title, content, data_collected, is_active, published_at)
VALUES (
    '1.0',
    'Employee Monitoring Privacy Policy',
    'This policy outlines the data collected by the Productivity Tracking system...',
    '{"active_idle_tracking": true, "app_usage": true, "website_tracking": true, "screenshots": true, "attendance": true}'::jsonb,
    TRUE,
    NOW()
) ON CONFLICT (version) DO NOTHING;
