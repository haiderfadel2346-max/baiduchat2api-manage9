'use client';

import { useEffect, useState } from 'react';

interface Stats {
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  errorCount: number;
}

interface CookieStatus {
  status: string;
  lastUpdated: string | null;
  expiresAt: string | null;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [cookieStatus, setCookieStatus] = useState<CookieStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/monitor');
      const data = await response.json();

      if (data.success) {
        setStats(data.data.stats);
        setCookieStatus(data.data.cookie);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="总请求数"
          value={stats?.totalRequests || 0}
          icon="📊"
          color="blue"
        />
        <StatsCard
          title="成功率"
          value={`${(stats?.successRate || 0).toFixed(1)}%`}
          icon="✅"
          color="green"
        />
        <StatsCard
          title="平均响应时间"
          value={`${Math.round(stats?.avgResponseTime || 0)}ms`}
          icon="⚡"
          color="yellow"
        />
        <StatsCard
          title="错误数量"
          value={stats?.errorCount || 0}
          icon="❌"
          color="red"
        />
      </div>

      {/* Cookie Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cookie 状态</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div
              className={`w-3 h-3 rounded-full ${
                cookieStatus?.status === 'valid' ? 'bg-green-500' : 'bg-red-500'
              }`}
            ></div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {cookieStatus?.status === 'valid' ? '✅ Cookie 有效' : '⚠️ Cookie 已过期'}
              </p>
              {cookieStatus?.lastUpdated && (
                <p className="text-xs text-gray-500">
                  最后更新: {new Date(cookieStatus.lastUpdated).toLocaleString('zh-CN')}
                </p>
              )}
            </div>
          </div>
          {cookieStatus?.expiresAt && (
            <div className="text-right">
              <p className="text-xs text-gray-500">过期时间</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(cookieStatus.expiresAt).toLocaleString('zh-CN')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionButton
            href="/dashboard/logs"
            icon="📝"
            title="查看日志"
            description="查看 API 请求和系统日志"
          />
          <ActionButton
            href="/dashboard/cookie"
            icon="🍪"
            title="管理 Cookie"
            description="配置和刷新 Cookie"
          />
          <ActionButton
            href="/dashboard/config"
            icon="⚙️"
            title="系统配置"
            description="修改系统配置"
          />
        </div>
      </div>

      {/* System Info */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">系统信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">版本</p>
            <p className="font-mono font-medium text-gray-900">v1.0.0</p>
          </div>
          <div>
            <p className="text-gray-600">部署平台</p>
            <p className="font-medium text-gray-900">Vercel</p>
          </div>
        </div>
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
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses} rounded-lg flex items-center justify-center`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function ActionButton({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
    >
      <div className="flex items-center space-x-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
          {title}
        </h3>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </a>
  );
}
