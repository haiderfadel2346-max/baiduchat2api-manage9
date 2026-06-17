'use client';

import { useEffect, useState } from 'react';
import { formatBytes, formatNumber } from '@/lib/utils';

interface MonitorData {
  stats: {
    totalRequests: number;
    successRate: number;
    avgResponseTime: number;
    errorCount: number;
  };
  cookie: {
    status: string;
    lastUpdated: string | null;
    expiresAt: string | null;
  };
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
}

export default function MonitorPage() {
  const [data, setData] = useState<MonitorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // 每10秒刷新
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/monitor');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch monitor data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-gray-500">无法加载监控数据</div>;
  }

  const uptimeHours = Math.floor(data.uptime / 3600);
  const uptimeMinutes = Math.floor((data.uptime % 3600) / 60);

  return (
    <div className="space-y-6">
      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="总请求数"
          value={formatNumber(data.stats.totalRequests)}
          icon="📊"
          color="blue"
        />
        <StatsCard
          title="成功率"
          value={`${data.stats.successRate.toFixed(1)}%`}
          icon="✅"
          color="green"
        />
        <StatsCard
          title="平均响应时间"
          value={`${Math.round(data.stats.avgResponseTime)}ms`}
          icon="⚡"
          color="yellow"
        />
        <StatsCard
          title="错误数量"
          value={formatNumber(data.stats.errorCount)}
          icon="❌"
          color="red"
        />
      </div>

      {/* Cookie Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cookie 状态</h2>
        <div className="flex items-center space-x-4">
          <div
            className={`w-4 h-4 rounded-full ${
              data.cookie.status === 'valid' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}
          ></div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {data.cookie.status === 'valid' ? 'Cookie 有效' : 'Cookie 已过期'}
            </p>
            {data.cookie.lastUpdated && (
              <p className="text-xs text-gray-500">
                最后更新: {new Date(data.cookie.lastUpdated).toLocaleString('zh-CN')}
              </p>
            )}
          </div>
          {data.cookie.expiresAt && (
            <div className="text-right">
              <p className="text-xs text-gray-500">过期时间</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(data.cookie.expiresAt).toLocaleString('zh-CN')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* System Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Uptime */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">运行时间</h2>
          <div className="flex items-center space-x-2">
            <span className="text-3xl font-bold text-blue-600">{uptimeHours}</span>
            <span className="text-sm text-gray-600">小时</span>
            <span className="text-3xl font-bold text-blue-600">{uptimeMinutes}</span>
            <span className="text-sm text-gray-600">分钟</span>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">内存使用</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">RSS</span>
              <span className="font-semibold text-gray-900">
                {formatBytes(data.memory.rss)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Heap Total</span>
              <span className="font-semibold text-gray-900">
                {formatBytes(data.memory.heapTotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Heap Used</span>
              <span className="font-semibold text-gray-900">
                {formatBytes(data.memory.heapUsed)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{
                  width: `${(data.memory.heapUsed / data.memory.heapTotal) * 100}%`,
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              {((data.memory.heapUsed / data.memory.heapTotal) * 100).toFixed(1)}% 使用中
            </p>
          </div>
        </div>
      </div>

      {/* Health Check */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">系统健康状态</h2>
            <p className="text-sm text-gray-600">所有系统正常运行</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700">运行正常</span>
          </div>
        </div>
      </div>

      {/* Auto Refresh Notice */}
      <div className="text-center text-sm text-gray-500">
        <p>⏱️ 页面每 10 秒自动刷新</p>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
  }[color];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 bg-gradient-to-br ${colorClasses} rounded-lg flex items-center justify-center`}
        >
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
