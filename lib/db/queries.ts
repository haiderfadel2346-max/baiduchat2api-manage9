import { query, getOne, paginate, PaginationOptions } from '../db';
import type {
  AdminUser,
  ApiLog,
  SystemLog,
  CookieStatus,
  ConfigSetting,
  ConfigHistory,
  LogStats,
  PaginatedResponse,
} from './schema';

/**
 * Admin Users Queries
 */
export async function getUserByUsername(username: string): Promise<AdminUser | null> {
  return getOne<AdminUser>(
    'SELECT * FROM admin_users WHERE username = $1',
    [username]
  );
}

export async function getUserById(id: number): Promise<AdminUser | null> {
  return getOne<AdminUser>(
    'SELECT * FROM admin_users WHERE id = $1',
    [id]
  );
}

export async function updateUserPassword(
  userId: number,
  passwordHash: string
): Promise<void> {
  await query(
    'UPDATE admin_users SET password_hash = $1 WHERE id = $2',
    [passwordHash, userId]
  );
}

export async function updateUserLastLogin(userId: number): Promise<void> {
  await query(
    'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
    [userId]
  );
}

/**
 * API Logs Queries
 */
export async function getApiLogs(
  options: PaginationOptions & {
    model?: string;
    status?: number;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<PaginatedResponse<ApiLog>> {
  const conditions: string[] = ['1=1'];
  const params: any[] = [];
  let paramIndex = 1;

  if (options.model) {
    conditions.push(`model = $${paramIndex++}`);
    params.push(options.model);
  }

  if (options.status) {
    conditions.push(`status_code = $${paramIndex++}`);
    params.push(options.status);
  }

  if (options.startDate) {
    conditions.push(`timestamp >= $${paramIndex++}`);
    params.push(options.startDate);
  }

  if (options.endDate) {
    conditions.push(`timestamp <= $${paramIndex++}`);
    params.push(options.endDate);
  }

  const whereClause = conditions.join(' AND ');

  return paginate<ApiLog>(
    `SELECT * FROM api_logs WHERE ${whereClause} ORDER BY timestamp DESC`,
    `SELECT COUNT(*)::text as count FROM api_logs WHERE ${whereClause}`,
    params,
    options
  );
}

export async function insertApiLog(log: Omit<ApiLog, 'id' | 'timestamp'>): Promise<void> {
  await query(
    `INSERT INTO api_logs (
      remote_addr, method, endpoint, model, query_preview,
      status_code, error_message, response_time_ms, stream, tools_count
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      log.remote_addr,
      log.method,
      log.endpoint,
      log.model,
      log.query_preview,
      log.status_code,
      log.error_message,
      log.response_time_ms,
      log.stream,
      log.tools_count,
    ]
  );
}

export async function getApiLogStats(
  startDate?: Date,
  endDate?: Date
): Promise<LogStats> {
  const dateCondition = startDate && endDate
    ? `WHERE timestamp BETWEEN $1 AND $2`
    : '';
  const params = startDate && endDate ? [startDate, endDate] : [];

  const [statsResult, modelStatsResult, hourlyStatsResult] = await Promise.all([
    getOne<{
      total: string;
      success_count: string;
      avg_response_time: string;
      error_count: string;
    }>(
      `SELECT
        COUNT(*)::text as total,
        COUNT(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 END)::text as success_count,
        AVG(response_time_ms)::text as avg_response_time,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END)::text as error_count
      FROM api_logs ${dateCondition}`,
      params
    ),
    query<{ model: string; count: string }>(
      `SELECT model, COUNT(*)::text as count
       FROM api_logs ${dateCondition}
       GROUP BY model
       ORDER BY count DESC`,
      params
    ),
    query<{ hour: string; count: string }>(
      `SELECT
        TO_CHAR(timestamp, 'HH24:00') as hour,
        COUNT(*)::text as count
       FROM api_logs
       WHERE timestamp >= NOW() - INTERVAL '24 hours'
       GROUP BY hour
       ORDER BY hour`,
      []
    ),
  ]);

  const total = parseInt(statsResult?.total || '0', 10);
  const successCount = parseInt(statsResult?.success_count || '0', 10);

  return {
    totalRequests: total,
    successRate: total > 0 ? (successCount / total) * 100 : 0,
    avgResponseTime: parseFloat(statsResult?.avg_response_time || '0'),
    errorCount: parseInt(statsResult?.error_count || '0', 10),
    requestsByModel: Object.fromEntries(
      modelStatsResult.map((r) => [r.model, parseInt(r.count, 10)])
    ),
    requestsByHour: hourlyStatsResult.map((r) => ({
      hour: r.hour,
      count: parseInt(r.count, 10),
    })),
  };
}

/**
 * System Logs Queries
 */
export async function getSystemLogs(
  options: PaginationOptions & {
    level?: string;
    module?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<PaginatedResponse<SystemLog>> {
  const conditions: string[] = ['1=1'];
  const params: any[] = [];
  let paramIndex = 1;

  if (options.level) {
    conditions.push(`level = $${paramIndex++}`);
    params.push(options.level);
  }

  if (options.module) {
    conditions.push(`module = $${paramIndex++}`);
    params.push(options.module);
  }

  if (options.startDate) {
    conditions.push(`timestamp >= $${paramIndex++}`);
    params.push(options.startDate);
  }

  if (options.endDate) {
    conditions.push(`timestamp <= $${paramIndex++}`);
    params.push(options.endDate);
  }

  const whereClause = conditions.join(' AND ');

  return paginate<SystemLog>(
    `SELECT * FROM system_logs WHERE ${whereClause} ORDER BY timestamp DESC`,
    `SELECT COUNT(*)::text as count FROM system_logs WHERE ${whereClause}`,
    params,
    options
  );
}

export async function insertSystemLog(
  log: Omit<SystemLog, 'id' | 'timestamp'>
): Promise<void> {
  await query(
    `INSERT INTO system_logs (level, message, module, metadata)
     VALUES ($1, $2, $3, $4)`,
    [log.level, log.message, log.module, log.metadata]
  );
}

/**
 * Cookie Status Queries
 */
export async function getCookieStatus(): Promise<CookieStatus | null> {
  return getOne<CookieStatus>('SELECT * FROM cookie_status WHERE id = 1');
}

export async function updateCookieStatus(
  data: Partial<Omit<CookieStatus, 'id'>>
): Promise<void> {
  await query(
    `INSERT INTO cookie_status (id, token, lid, updated_at, expires_at, source, is_valid, metadata)
     VALUES (1, $1, $2, CURRENT_TIMESTAMP, $3, $4, $5, $6)
     ON CONFLICT (id) DO UPDATE SET
       token = EXCLUDED.token,
       lid = EXCLUDED.lid,
       updated_at = EXCLUDED.updated_at,
       expires_at = EXCLUDED.expires_at,
       source = EXCLUDED.source,
       is_valid = EXCLUDED.is_valid,
       metadata = EXCLUDED.metadata`,
    [
      data.token || null,
      data.lid || null,
      data.expires_at || null,
      data.source || null,
      data.is_valid ?? true,
      data.metadata || null,
    ]
  );
}

/**
 * Config Settings Queries
 */
export async function getAllConfigSettings(): Promise<ConfigSetting[]> {
  return query<ConfigSetting>('SELECT * FROM config_settings ORDER BY key');
}

export async function getConfigSetting(key: string): Promise<ConfigSetting | null> {
  return getOne<ConfigSetting>(
    'SELECT * FROM config_settings WHERE key = $1',
    [key]
  );
}

export async function updateConfigSetting(
  key: string,
  value: string,
  updatedBy: string
): Promise<void> {
  // Get old value for history
  const old = await getConfigSetting(key);

  // Update setting
  await query(
    `INSERT INTO config_settings (key, value, updated_at, updated_by)
     VALUES ($1, $2, CURRENT_TIMESTAMP, $3)
     ON CONFLICT (key) DO UPDATE SET
       value = EXCLUDED.value,
       updated_at = EXCLUDED.updated_at,
       updated_by = EXCLUDED.updated_by`,
    [key, value, updatedBy]
  );

  // Insert history
  await query(
    `INSERT INTO config_history (changed_by, config_key, old_value, new_value)
     VALUES ($1, $2, $3, $4)`,
    [updatedBy, key, old?.value || null, value]
  );
}

export async function getConfigHistory(
  key?: string,
  options?: PaginationOptions
): Promise<PaginatedResponse<ConfigHistory>> {
  const whereClause = key ? 'WHERE config_key = $1' : '';
  const params = key ? [key] : [];

  return paginate<ConfigHistory>(
    `SELECT * FROM config_history ${whereClause} ORDER BY timestamp DESC`,
    `SELECT COUNT(*)::text as count FROM config_history ${whereClause}`,
    params,
    options || {}
  );
}

/**
 * Cleanup old logs
 */
export async function cleanupOldLogs(retentionDays: number = 30): Promise<void> {
  await Promise.all([
    query(
      'DELETE FROM api_logs WHERE timestamp < NOW() - INTERVAL $1',
      [`${retentionDays} days`]
    ),
    query(
      'DELETE FROM system_logs WHERE timestamp < NOW() - INTERVAL $1',
      [`${retentionDays} days`]
    ),
  ]);
}
