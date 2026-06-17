#!/usr/bin/env node

/**
 * Database Migration Script
 * Initializes the database schema for baiduchat2api-manage
 */

const { sql } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');

async function migrate() {
  console.log('🔄 Starting database migration...\n');

  try {
    // Create admin_users table
    console.log('Creating admin_users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `;

    // Create api_logs table
    console.log('Creating api_logs table...');
    await sql`
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
      )
    `;

    console.log('Creating indexes for api_logs...');
    await sql`CREATE INDEX IF NOT EXISTS idx_api_logs_timestamp ON api_logs(timestamp DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_api_logs_model ON api_logs(model)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_api_logs_status ON api_logs(status_code)`;

    // Create system_logs table
    console.log('Creating system_logs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS system_logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        level VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        module VARCHAR(100),
        metadata JSONB
      )
    `;

    console.log('Creating indexes for system_logs...');
    await sql`CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level)`;

    // Create cookie_status table
    console.log('Creating cookie_status table...');
    await sql`
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
      )
    `;

    // Create config_settings table
    console.log('Creating config_settings table...');
    await sql`
      CREATE TABLE IF NOT EXISTS config_settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT,
        value_type VARCHAR(20) DEFAULT 'string',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by VARCHAR(50)
      )
    `;

    // Create config_history table
    console.log('Creating config_history table...');
    await sql`
      CREATE TABLE IF NOT EXISTS config_history (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        changed_by VARCHAR(50),
        config_key VARCHAR(100),
        old_value TEXT,
        new_value TEXT
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_config_history_timestamp ON config_history(timestamp DESC)`;

    // Insert default admin user
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'sk-admin';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    console.log('Creating default admin user...');
    await sql`
      INSERT INTO admin_users (username, password_hash)
      VALUES ('admin', ${passwordHash})
      ON CONFLICT (username) DO NOTHING
    `;

    // Insert default config settings
    console.log('Inserting default config settings...');
    await sql`
      INSERT INTO config_settings (key, value, value_type) VALUES
        ('cookie_auto_refresh', 'true', 'boolean'),
        ('log_retention_days', '30', 'number'),
        ('user_agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'string')
      ON CONFLICT (key) DO NOTHING
    `;

    console.log('\n✅ Database migration completed successfully!');
    console.log('\nDefault credentials:');
    console.log('  Username: admin');
    console.log('  Password: sk-admin');
    console.log('\n⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { migrate };
