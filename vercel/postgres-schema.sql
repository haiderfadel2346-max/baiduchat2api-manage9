-- Vercel Postgres Database Schema
-- baiduchat2api-manage v1.0.0

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- API Request Logs Table
CREATE TABLE IF NOT EXISTS api_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remote_addr VARCHAR(45),
    method VARCHAR(10),
    endpoint VARCHAR(255),
    model VARCHAR(50),
    query_preview TEXT,
    status_code INTEGER,
    error_message TEXT,
    response_time_ms INTEGER,
    stream BOOLEAN DEFAULT false,
    tools_count INTEGER DEFAULT 0
);

-- Create indexes for api_logs
CREATE INDEX IF NOT EXISTS idx_api_logs_timestamp ON api_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_model ON api_logs(model);
CREATE INDEX IF NOT EXISTS idx_api_logs_status ON api_logs(status_code);

-- System Logs Table
CREATE TABLE IF NOT EXISTS system_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    module VARCHAR(100),
    metadata JSONB
);

-- Create indexes for system_logs
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);

-- Cookie Status Table
CREATE TABLE IF NOT EXISTS cookie_status (
    id INTEGER PRIMARY KEY DEFAULT 1,
    token TEXT,
    lid TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    source VARCHAR(20),
    is_valid BOOLEAN DEFAULT true,
    metadata JSONB,
    CONSTRAINT single_row CHECK (id = 1)
);

-- Config Settings Table
CREATE TABLE IF NOT EXISTS config_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    value_type VARCHAR(20) DEFAULT 'string',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50)
);

-- Config History Table
CREATE TABLE IF NOT EXISTS config_history (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by VARCHAR(50),
    config_key VARCHAR(100),
    old_value TEXT,
    new_value TEXT
);

-- Create index for config_history
CREATE INDEX IF NOT EXISTS idx_config_history_timestamp ON config_history(timestamp DESC);

-- Insert default admin user (password: sk-admin)
-- Password hash generated with bcrypt for 'sk-admin'
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2a$10$YourBcryptHashHere')
ON CONFLICT (username) DO NOTHING;

-- Insert default config settings
INSERT INTO config_settings (key, value, value_type) VALUES
    ('cookie_auto_refresh', 'true', 'boolean'),
    ('log_retention_days', '30', 'number'),
    ('user_agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'string')
ON CONFLICT (key) DO NOTHING;

-- Create function to auto-cleanup old logs
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM api_logs WHERE timestamp < NOW() - INTERVAL '30 days';
    DELETE FROM system_logs WHERE timestamp < NOW() - INTERVAL '30 days';
    DELETE FROM config_history WHERE timestamp < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (requires pg_cron extension)
-- Run this manually or setup external cron job:
-- SELECT cleanup_old_logs();
