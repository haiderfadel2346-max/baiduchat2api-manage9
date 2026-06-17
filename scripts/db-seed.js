#!/usr/bin/env node

/**
 * Database Seed Script
 * Populates the database with sample data for development/testing
 */

const { sql } = require('@vercel/postgres');

async function seed() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Seed sample API logs
    console.log('Seeding API logs...');
    const models = ['baidu-ernie-4.5', 'baidu-deepseek-r1', 'baidu-deepseek-v4-pro'];
    const endpoints = ['/v1/chat/completions', '/v1/models'];
    const statuses = [200, 200, 200, 200, 400, 500];

    for (let i = 0; i < 50; i++) {
      const model = models[Math.floor(Math.random() * models.length)];
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const responseTime = Math.floor(Math.random() * 3000) + 100;
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);

      await sql`
        INSERT INTO api_logs
        (timestamp, remote_addr, method, endpoint, model, query_preview, status_code, response_time_ms, stream, tools_count)
        VALUES
        (${timestamp}, '127.0.0.1', 'POST', ${endpoint}, ${model}, 'Sample query text...', ${status}, ${responseTime}, ${Math.random() > 0.5}, ${Math.floor(Math.random() * 3)})
      `;
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

    for (let i = 0; i < 100; i++) {
      const level = levels[Math.floor(Math.random() * levels.length)];
      const module = modules[Math.floor(Math.random() * modules.length)];
      const message = messages[Math.floor(Math.random() * messages.length)];
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);

      await sql`
        INSERT INTO system_logs (timestamp, level, message, module)
        VALUES (${timestamp}, ${level}, ${message}, ${module})
      `;
    }

    // Seed cookie status
    console.log('Seeding cookie status...');
    await sql`
      INSERT INTO cookie_status (id, token, lid, updated_at, expires_at, source, is_valid)
      VALUES (1, 'sample_token_abc123xyz789', 'sample_lid_123', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '7 days', 'auto', true)
      ON CONFLICT (id) DO UPDATE SET
        token = EXCLUDED.token,
        lid = EXCLUDED.lid,
        updated_at = EXCLUDED.updated_at,
        expires_at = EXCLUDED.expires_at
    `;

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
