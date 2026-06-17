/**
 * Database schema types for TypeScript
 */

export interface AdminUser {
  id: number;
  username: string;
  password_hash: string;
  created_at: Date;
  last_login: Date | null;
  is_active: boolean;
}

export interface ApiLog {
  id: number;
  timestamp: Date;
  remote_addr: string | null;
  method: string | null;
  endpoint: string | null;
  model: string | null;
  query_preview: string | null;
  status_code: number | null;
  error_message: string | null;
  response_time_ms: number | null;
  stream: boolean;
  tools_count: number;
}

export interface SystemLog {
  id: number;
  timestamp: Date;
  level: string;
  message: string;
  module: string | null;
  metadata: Record<string, any> | null;
}

export interface CookieStatus {
  id: number;
  token: string | null;
  lid: string | null;
  updated_at: Date;
  expires_at: Date | null;
  source: string | null;
  is_valid: boolean;
  metadata: Record<string, any> | null;
}

export interface ConfigSetting {
  key: string;
  value: string | null;
  value_type: string;
  updated_at: Date;
  updated_by: string | null;
}

export interface ConfigHistory {
  id: number;
  timestamp: Date;
  changed_by: string | null;
  config_key: string | null;
  old_value: string | null;
  new_value: string | null;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Statistics types
export interface LogStats {
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  errorCount: number;
  requestsByModel: Record<string, number>;
  requestsByHour: Array<{ hour: string; count: number }>;
}

export interface SystemStats {
  uptime: number;
  dbSize: number;
  logCount: number;
  cookieStatus: 'valid' | 'expired' | 'missing';
  lastActivity: Date | null;
}
