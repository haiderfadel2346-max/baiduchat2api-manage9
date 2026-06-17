-- Additional tables for multi-cookie support

-- Cookie Pool Table
CREATE TABLE IF NOT EXISTS cookie_pool (
    id SERIAL PRIMARY KEY,
    cookie_string TEXT NOT NULL,
    token TEXT,
    lid TEXT,
    is_active BOOLEAN DEFAULT true,
    is_valid BOOLEAN DEFAULT true,
    current_concurrency INTEGER DEFAULT 0,
    total_requests INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    last_error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Create indexes for cookie_pool
CREATE INDEX IF NOT EXISTS idx_cookie_pool_active ON cookie_pool(is_active, is_valid);
CREATE INDEX IF NOT EXISTS idx_cookie_pool_concurrency ON cookie_pool(current_concurrency);
CREATE INDEX IF NOT EXISTS idx_cookie_pool_last_used ON cookie_pool(last_used_at DESC);

-- Insert additional config settings for new features
INSERT INTO config_settings (key, value, value_type) VALUES
    ('cookie_pool_enabled', 'false', 'boolean'),
    ('fresh_conversation', 'true', 'boolean'),
    ('context_max_chars', '12000', 'number'),
    ('context_max_messages', '16', 'number'),
    ('context_max_message_chars', '2000', 'number'),
    ('docker_enabled', 'false', 'boolean')
ON CONFLICT (key) DO NOTHING;

-- Function to update cookie pool stats
CREATE OR REPLACE FUNCTION update_cookie_stats()
RETURNS void AS $$
BEGIN
    -- Reset concurrency counters periodically
    UPDATE cookie_pool
    SET current_concurrency = 0
    WHERE last_used_at < NOW() - INTERVAL '5 minutes';

    -- Mark stale cookies as inactive
    UPDATE cookie_pool
    SET is_active = false
    WHERE last_used_at < NOW() - INTERVAL '7 days'
    AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Cookie pool statistics view
CREATE OR REPLACE VIEW cookie_pool_stats AS
SELECT
    COUNT(*) as total_cookies,
    COUNT(*) FILTER (WHERE is_active) as active_cookies,
    COUNT(*) FILTER (WHERE is_valid) as valid_cookies,
    SUM(current_concurrency) as total_concurrency,
    SUM(total_requests) as total_requests,
    SUM(success_count) as total_successes,
    SUM(error_count) as total_errors,
    CASE
        WHEN SUM(total_requests) > 0
        THEN ROUND(100.0 * SUM(success_count) / SUM(total_requests), 2)
        ELSE 0
    END as success_rate
FROM cookie_pool;
