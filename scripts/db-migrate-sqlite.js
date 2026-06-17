#!/usr/bin/env node

/**
 * SQLite Database Migration Script
 * Initializes the database schema for baiduchat2api-manage
 */

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'baiduchat2api.db');

async function migrate() {
  console.log('🔄 Starting SQLite database migration...\n');

  try {
    // Ensure data directory exists
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Connect to database
    const db = new Database(DB_PATH);
    console.log('✅ Connected to SQLite database\n');

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Create admin_users table
    console.log('Creating admin_users table...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        is_active INTEGER DEFAULT 1
      )
    `);

    // Create api_logs table
    console.log('Creating api_logs table...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS api_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        remote_addr TEXT,
        method TEXT,
        endpoint TEXT,
        model TEXT,
        query_preview TEXT,
        status_code INTEGER,
        error_message TEXT,
        response_time_ms INTEGER,
        stream INTEGER DEFAULT 0,
        tools_count INTEGER DEFAULT 0
      )
    `);

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_api_logs_timestamp ON api_logs(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_api_logs_model ON api_logs(model);
      CREATE INDEX IF NOT EXISTS idx_api_logs_status ON api_logs(status_code);
    `);

    // Create system_logs table
    console.log('Creating system_logs table...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        module TEXT,
        metadata TEXT
      )
    `);

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
    `);

    // Create cookie_status table
    console.log('Creating cookie_status table...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS cookie_status (
        id INTEGER PRIMARY KEY DEFAULT 1,
        token TEXT,
        lid TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        source TEXT,
        is_valid INTEGER DEFAULT 1,
        metadata TEXT,
        CHECK (id = 1)
      )
    `);

    // Create cookie_pool table
    console.log('Creating cookie_pool table...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS cookie_pool (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cookie_string TEXT NOT NULL,
        token TEXT,
        lid TEXT,
        is_active INTEGER DEFAULT 1,
        is_valid INTEGER DEFAULT 1,
        current_concurrency INTEGER DEFAULT 0,
        total_requests INTEGER DEFAULT 0,
        success_count INTEGER DEFAULT 0,
        error_count INTEGER DEFAULT 0,
        last_used_at DATETIME,
        last_error TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT
      )
    `);

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_cookie_pool_active ON cookie_pool(is_active, is_valid);
      CREATE INDEX IF NOT EXISTS idx_cookie_pool_concurrency ON cookie_pool(current_concurrency);
      CREATE INDEX IF NOT EXISTS idx_cookie_pool_last_used ON cookie_pool(last_used_at DESC);
    `);

    // Create config_settings table
    console.log('Creating config_settings table...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS config_settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        value_type TEXT DEFAULT 'string',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_by TEXT
      )
    `);

    // Create config_history table
    console.log('Creating config_history table...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS config_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        changed_by TEXT,
        config_key TEXT,
        old_value TEXT,
        new_value TEXT
      )
    `);

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_config_history_timestamp ON config_history(timestamp DESC);
    `);

    // Insert default admin user
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'sk-admin';
    const passwordHash = bcrypt.hashSync(defaultPassword, 10);

    console.log('Creating default admin user...');
    const insertAdmin = db.prepare(`
      INSERT OR IGNORE INTO admin_users (username, password_hash)
      VALUES (?, ?)
    `);
    insertAdmin.run('admin', passwordHash);

    // Insert default config settings
    console.log('Inserting default config settings...');
    const insertConfig = db.prepare(`
      INSERT OR IGNORE INTO config_settings (key, value, value_type) VALUES (?, ?, ?)
    `);

    insertConfig.run('cookie_auto_refresh', 'true', 'boolean');
    insertConfig.run('log_retention_days', '30', 'number');
    insertConfig.run('user_agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'string');
    insertConfig.run('cookie_pool_enabled', 'false', 'boolean');
    insertConfig.run('fresh_conversation', 'true', 'boolean');
    insertConfig.run('context_max_chars', '12000', 'number');
    insertConfig.run('context_max_messages', '16', 'number');
    insertConfig.run('context_max_message_chars', '2000', 'number');

    db.close();

    console.log('\n✅ SQLite database migration completed successfully!');
    console.log(`\nDatabase location: ${DB_PATH}`);
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
