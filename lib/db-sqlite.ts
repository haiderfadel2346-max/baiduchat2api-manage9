/**
 * SQLite Database Connection
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'baiduchat2api.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create database connection
let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

/**
 * Execute a SQL query
 */
export function query<T = any>(text: string, params: any[] = []): T[] {
  try {
    const db = getDb();
    const stmt = db.prepare(text);
    const rows = stmt.all(...params) as T[];
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Get a single row
 */
export function getOne<T = any>(text: string, params: any[] = []): T | null {
  const rows = query<T>(text, params);
  return rows[0] || null;
}

/**
 * Execute an INSERT/UPDATE/DELETE query
 */
export function exec(text: string, params: any[] = []): { changes: number; lastInsertRowid: number } {
  try {
    const db = getDb();
    const stmt = db.prepare(text);
    const info = stmt.run(...params);
    return { changes: info.changes, lastInsertRowid: Number(info.lastInsertRowid) };
  } catch (error) {
    console.error('Database exec error:', error);
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

export function paginate<T>(
  baseQuery: string,
  countQuery: string,
  params: any[],
  options: PaginationOptions = {}
): PaginatedResult<T> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 50));
  const offset = (page - 1) * limit;

  const data = query<T>(`${baseQuery} LIMIT ${limit} OFFSET ${offset}`, params);
  const countResult = query<{ count: number }>(countQuery, params);

  const total = countResult[0]?.count || 0;
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
  exec,
  paginate,
  getDb,
};
