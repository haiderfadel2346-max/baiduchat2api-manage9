#!/usr/bin/env node

/**
 * SQLite Database Seed Script
 * Populates the database with sample data for development/testing
 */

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'baiduchat2api.db');

async function seed() {
  console.log('🌱 Starting database seeding...\n');

  try {
    const db = new Database(DB_PATH);

    // Seed sample API logs
    console.log('Seeding API logs...');
    const models = ['baidu-ernie-4.5', 'baidu-deepseek-r1', 'baidu-deepseek-v4-pro'];
    const endpoints = ['/v1/chat/completions', '/v1/models'];
    const statuses = [200, 200, 200, 200, 400, 500];

    const insertApiLog = db.prepare(`
      INSERT INTO api_logs
      (timestamp, remote_addr, method, endpoint, model, query_preview, status_code, response_time_ms, stream, tools_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let i = 0; i < 50; i++) {
      const model = models[Math.floor(Math.random() * models.length)];
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const responseTime = Math.floor(Math.random() * 3000) + 100;
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();

      insertApiLog.run(
        timestamp,
        '127.0.0.1',
        'POST',
        endpoint,
        model,
        'Sample query text...',
        status,
        responseTime,
        Math.random() > 0.5 ? 1 : 0,
        Math.floor(Math.random() * 3)
      );
    }

    // Seed sample system logs
    console.log('Seeding system logs...');
    const levels = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
    const modules = ['baidu_chat', 'main', 'auth', 'database'];
    const messages = [
      'Server started successfully',
      'Cookie refreshed',
      'Database connection established',
      'Authentication successful',
      'Configuration updated',
      'API request processed',
    ];

    const insertSystemLog = db.prepare(`
      INSERT INTO system_logs (timestamp, level, message, module)
      VALUES (?, ?, ?, ?)
    `);

    for (let i = 0; i < 100; i++) {
      const level = levels[Math.floor(Math.random() * levels.length)];
      const module = modules[Math.floor(Math.random() * modules.length)];
      const message = messages[Math.floor(Math.random() * messages.length)];
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();

      insertSystemLog.run(timestamp, level, message, module);
    }

    // Seed cookie status
    console.log('Seeding cookie status...');
    const insertCookie = db.prepare(`
      INSERT OR REPLACE INTO cookie_status (id, token, lid, updated_at, expires_at, source, is_valid)
      VALUES (1, ?, ?, datetime('now'), datetime('now', '+7 days'), ?, 1)
    `);
    insertCookie.run('sample_token_abc123xyz789', 'sample_lid_123', 'auto');

    db.close();

    console.log('\n✅ Database seeding completed successfully!');
    console.log('  - 50 API log entries');
    console.log('  - 100 system log entries');
    console.log('  - 1 cookie status entry');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  }
}

// Run seed
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seed };
