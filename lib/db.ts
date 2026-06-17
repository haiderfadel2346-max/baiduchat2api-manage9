import { sql } from '@vercel/postgres';

/**
 * Database utility functions for baiduchat2api-manage
 */

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

/**
 * Execute a SQL query
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  try {
    const result = await sql.query(text, params);
    return result.rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Get a single row
 */
export async function getOne<T = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}

/**
 * Execute multiple queries in a transaction
 */
export async function transaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  // Note: Vercel Postgres doesn't support transactions natively
  // This is a simplified implementation
  try {
    return await callback(sql);
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
}

/**
 * Pagination helper
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function paginate<T>(
  baseQuery: string,
  countQuery: string,
  params: any[],
  options: PaginationOptions = {}
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 50));
  const offset = (page - 1) * limit;

  const [data, countResult] = await Promise.all([
    query<T>(
      `${baseQuery} LIMIT ${limit} OFFSET ${offset}`,
      params
    ),
    query<{ count: string }>(countQuery, params),
  ]);

  const total = parseInt(countResult[0]?.count || '0', 10);
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export default {
  query,
  getOne,
  transaction,
  paginate,
};
