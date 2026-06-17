'use client';

import { useEffect, useState } from 'react';
import { formatDate, getStatusColor, getLogLevelColor } from '@/lib/utils';

interface ApiLog {
  id: number;
  timestamp: Date;
  remote_addr: string | null;
  method: string | null;
  endpoint: string | null;
  model: string | null;
  query_preview: string | null;
  status_code: number | null;
  response_time_ms: number | null;
  stream: boolean;
}

interface SystemLog {
  id: number;
  timestamp: Date;
  level: string;
  message: string;
  module: string | null;
}

export default function LogsPage() {
  const [activeTab, setActiveTab] = useState<'api' | 'system'>('api');
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [activeTab, page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'api' ? '/api/logs' : '/api/logs/system';
      const response = await fetch(`${endpoint}?page=${page}&limit=20`);
      const data = await response.json();

      if (data.success) {
        if (activeTab === 'api') {
          setApiLogs(data.data.data);
        } else {
          setSystemLogs(data.data.data);
        }
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => {
                setActiveTab('api');
                setPage(1);
              }}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'api'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📝 API 日志
            </button>
            <button
              onClick={() => {
                setActiveTab('system');
                setPage(1);
              }}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'system'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🖥️ 系统日志
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : activeTab === 'api' ? (
            <ApiLogsTable logs={apiLogs} />
          ) : (
            <SystemLogsTable logs={systemLogs} />
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <span className="text-sm text-gray-700">
                第 {page} 页，共 {totalPages} 页
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ApiLogsTable({ logs }: { logs: ApiLog[] }) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        暂无日志记录
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              时间
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              端点
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              模型
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              状态码
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              响应时间
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              查询预览
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {formatDate(log.timestamp)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {log.method} {log.endpoint}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {log.model}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                <span className={`font-semibold ${getStatusColor(log.status_code || 0)}`}>
                  {log.status_code}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {log.response_time_ms}ms
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                {log.query_preview}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SystemLogsTable({ logs }: { logs: SystemLog[] }) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        暂无日志记录
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
        >
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {formatDate(log.timestamp)}
          </span>
          <span className={`px-2 py-1 text-xs font-semibold rounded ${getLogLevelColor(log.level)}`}>
            {log.level}
          </span>
          <span className="flex-1 text-sm text-gray-900">{log.message}</span>
          {log.module && (
            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
              {log.module}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
