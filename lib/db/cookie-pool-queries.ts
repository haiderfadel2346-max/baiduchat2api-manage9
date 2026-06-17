/**
 * Cookie Pool Database Queries
 */

import { query, getOne, paginate, PaginationOptions } from '../db';

export interface CookiePoolItem {
  id: number;
  cookie_string: string;
  token: string | null;
  lid: string | null;
  is_active: boolean;
  is_valid: boolean;
  current_concurrency: number;
  total_requests: number;
  success_count: number;
  error_count: number;
  last_used_at: Date | null;
  last_error: string | null;
  created_at: Date;
  updated_at: Date;
  metadata: Record<string, any> | null;
}

export interface CookiePoolStats {
  total_cookies: number;
  active_cookies: number;
  valid_cookies: number;
  total_concurrency: number;
  total_requests: number;
  total_successes: number;
  total_errors: number;
  success_rate: number;
}

/**
 * Get all cookies in pool
 */
export async function getCookiePool(
  options?: PaginationOptions & { activeOnly?: boolean }
): Promise<any> {
  const whereClause = options?.activeOnly ? 'WHERE is_active = true' : '';

  if (options?.page || options?.limit) {
    return paginate<CookiePoolItem>(
      `SELECT * FROM cookie_pool ${whereClause} ORDER BY created_at DESC`,
      `SELECT COUNT(*)::text as count FROM cookie_pool ${whereClause}`,
      [],
      options
    );
  }

  return query<CookiePoolItem>(
    `SELECT * FROM cookie_pool ${whereClause} ORDER BY created_at DESC`
  );
}

/**
 * Get cookie pool item by ID
 */
export async function getCookiePoolItem(id: number): Promise<CookiePoolItem | null> {
  return getOne<CookiePoolItem>(
    'SELECT * FROM cookie_pool WHERE id = $1',
    [id]
  );
}

/**
 * Add new cookie to pool
 */
export async function addCookieToPool(
  cookieString: string,
  token?: string,
  lid?: string
): Promise<CookiePoolItem> {
  const result = await query<CookiePoolItem>(
    `INSERT INTO cookie_pool (cookie_string, token, lid)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [cookieString, token || null, lid || null]
  );
  return result[0];
}

/**
 * Update cookie pool item
 */
export async function updateCookiePoolItem(
  id: number,
  data: Partial<Omit<CookiePoolItem, 'id' | 'created_at'>>
): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.cookie_string !== undefined) {
    fields.push(`cookie_string = $${paramIndex++}`);
    values.push(data.cookie_string);
  }
  if (data.token !== undefined) {
    fields.push(`token = $${paramIndex++}`);
    values.push(data.token);
  }
  if (data.lid !== undefined) {
    fields.push(`lid = $${paramIndex++}`);
    values.push(data.lid);
  }
  if (data.is_active !== undefined) {
    fields.push(`is_active = $${paramIndex++}`);
    values.push(data.is_active);
  }
  if (data.is_valid !== undefined) {
    fields.push(`is_valid = $${paramIndex++}`);
    values.push(data.is_valid);
  }
  if (data.current_concurrency !== undefined) {
    fields.push(`current_concurrency = $${paramIndex++}`);
    values.push(data.current_concurrency);
  }
  if (data.last_error !== undefined) {
    fields.push(`last_error = $${paramIndex++}`);
    values.push(data.last_error);
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);

  if (fields.length === 1) return; // Only updated_at, no actual changes

  values.push(id);

  await query(
    `UPDATE cookie_pool SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
    values
  );
}

/**
 * Delete cookie from pool
 */
export async function deleteCookieFromPool(id: number): Promise<void> {
  await query('DELETE FROM cookie_pool WHERE id = $1', [id]);
}

/**
 * Increment cookie usage stats
 */
export async function incrementCookieUsage(
  id: number,
  success: boolean
): Promise<void> {
  if (success) {
    await query(
      `UPDATE cookie_pool
       SET total_requests = total_requests + 1,
           success_count = success_count + 1,
           current_concurrency = current_concurrency + 1,
           last_used_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );
  } else {
    await query(
      `UPDATE cookie_pool
       SET total_requests = total_requests + 1,
           error_count = error_count + 1,
           current_concurrency = current_concurrency + 1,
           last_used_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );
  }
}

/**
 * Decrement cookie concurrency
 */
export async function decrementCookieConcurrency(id: number): Promise<void> {
  await query(
    `UPDATE cookie_pool
     SET current_concurrency = GREATEST(0, current_concurrency - 1),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [id]
  );
}

/**
 * Get cookie pool statistics
 */
export async function getCookiePoolStats(): Promise<CookiePoolStats> {
  const result = await getOne<CookiePoolStats>(
    'SELECT * FROM cookie_pool_stats'
  );

  return result || {
    total_cookies: 0,
    active_cookies: 0,
    valid_cookies: 0,
    total_concurrency: 0,
    total_requests: 0,
    total_successes: 0,
    total_errors: 0,
    success_rate: 0,
  };
}

/**
 * Get least loaded cookie
 */
export async function getLeastLoadedCookie(): Promise<CookiePoolItem | null> {
  return getOne<CookiePoolItem>(
    `SELECT * FROM cookie_pool
     WHERE is_active = true AND is_valid = true
     ORDER BY current_concurrency ASC, last_used_at ASC NULLS FIRST
     LIMIT 1`
  );
}

/**
 * Mark cookie as invalid
 */
export async function markCookieInvalid(
  id: number,
  errorMessage: string
): Promise<void> {
  await query(
    `UPDATE cookie_pool
     SET is_valid = false,
         last_error = $2,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [id, errorMessage]
  );
}

/**
 * Cleanup stale cookies
 */
export async function cleanupStaleCookies(): Promise<void> {
  await query('SELECT update_cookie_stats()');
}
