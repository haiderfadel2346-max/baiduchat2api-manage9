'use client';

import { useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils';
import CookieFetchButton from '@/components/cookie/cookie-fetch-button';

interface CookieStatus {
  id: number;
  token: string | null;
  lid: string | null;
  updated_at: Date;
  expires_at: Date | null;
  source: string | null;
  is_valid: boolean;
}

interface CookiePoolItem {
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
  created_at: Date;
}

export default function CookiePage() {
  const [activeTab, setActiveTab] = useState<'single' | 'pool'>('single');
  const [cookieStatus, setCookieStatus] = useState<CookieStatus | null>(null);
  const [cookiePool, setCookiePool] = useState<CookiePoolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    cookieString: '',
    token: '',
    lid: '',
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'single') {
        const response = await fetch('/api/cookie');
        const data = await response.json();
        if (data.success) {
          setCookieStatus(data.data);
        }
      } else {
        const response = await fetch('/api/cookie/pool');
        const data = await response.json();
        if (data.success) {
          setCookiePool(Array.isArray(data.data) ? data.data : data.data.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch cookie data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = activeTab === 'single' ? '/api/cookie' : '/api/cookie/pool';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uploadData),
      });

      const data = await response.json();
      if (data.success) {
        alert('Cookie 上传成功！');
        setShowUploadForm(false);
        setUploadData({ cookieString: '', token: '', lid: '' });
        fetchData();
      } else {
        alert('上传失败: ' + data.error);
      }
    } catch (error) {
      alert('上传失败，请重试');
    }
  };

  const handleDeleteCookie = async (id: number) => {
    if (!confirm('确定要删除这个 Cookie 吗？')) return;

    try {
      const response = await fetch(`/api/cookie/pool?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        alert('删除成功！');
        fetchData();
      } else {
        alert('删除失败: ' + data.error);
      }
    } catch (error) {
      alert('删除失败，请重试');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('single')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'single'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🍪 单个 Cookie
            </button>
            <button
              onClick={() => setActiveTab('pool')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'pool'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🎯 Cookie 池（负载均衡）
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : activeTab === 'single' ? (
            <SingleCookieView
              status={cookieStatus}
              onUpload={() => setShowUploadForm(true)}
            />
          ) : (
            <CookiePoolView
              pool={cookiePool}
              onAddCookie={() => setShowUploadForm(true)}
              onDeleteCookie={handleDeleteCookie}
            />
          )}
        </div>
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {activeTab === 'single' ? '上传 Cookie' : '添加 Cookie 到池'}
            </h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cookie 字符串
                </label>
                <textarea
                  value={uploadData.cookieString}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, cookieString: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                  placeholder="BAIDUID=xxx; BIDUPSID=yyy; ..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Token (可选)
                </label>
                <input
                  type="text"
                  value={uploadData.token}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, token: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="自动提取或手动输入"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LID (可选)
                </label>
                <input
                  type="text"
                  value={uploadData.lid}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, lid: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="自动提取或手动输入"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  上传
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cookie Fetch Guide */}
      <CookieFetchButton onSuccess={fetchData} />
    </div>
  );
}

function SingleCookieView({
  status,
  onUpload,
}: {
  status: CookieStatus | null;
  onUpload: () => void;
}) {
  if (!status) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">暂无 Cookie 数据</p>
        <button
          onClick={onUpload}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          上传 Cookie
        </button>
      </div>
    );
  }

  const isValid = status.is_valid && (!status.expires_at || new Date(status.expires_at) > new Date());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-4 h-4 rounded-full ${isValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isValid ? '✅ Cookie 有效' : '⚠️ Cookie 已过期'}
            </h3>
            <p className="text-sm text-gray-600">
              最后更新: {formatDate(status.updated_at)}
            </p>
          </div>
        </div>
        <button
          onClick={onUpload}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          更新 Cookie
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Token</p>
          <p className="font-mono text-sm text-gray-900">
            {status.token?.substring(0, 20)}...
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">LID</p>
          <p className="font-mono text-sm text-gray-900">{status.lid}</p>
        </div>
        {status.expires_at && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">过期时间</p>
            <p className="text-sm text-gray-900">{formatDate(status.expires_at)}</p>
          </div>
        )}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">来源</p>
          <p className="text-sm text-gray-900">{status.source || '未知'}</p>
        </div>
      </div>
    </div>
  );
}

function CookiePoolView({
  pool,
  onAddCookie,
  onDeleteCookie,
}: {
  pool: CookiePoolItem[];
  onAddCookie: () => void;
  onDeleteCookie: (id: number) => void;
}) {
  if (pool.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Cookie 池为空</p>
        <button
          onClick={onAddCookie}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          添加 Cookie
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">共 {pool.length} 个 Cookie</p>
        <button
          onClick={onAddCookie}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          + 添加 Cookie
        </button>
      </div>

      <div className="space-y-3">
        {pool.map((item) => (
          <div
            key={item.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      item.is_active && item.is_valid ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  ></div>
                  <h4 className="font-semibold text-gray-900">Cookie #{item.id}</h4>
                  <span className="text-sm text-gray-500">
                    并发: {item.current_concurrency}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                  <div>
                    <p className="text-gray-600">总请求</p>
                    <p className="font-semibold text-gray-900">{item.total_requests}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">成功数</p>
                    <p className="font-semibold text-green-600">{item.success_count}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">错误数</p>
                    <p className="font-semibold text-red-600">{item.error_count}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onDeleteCookie(item.id)}
                className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="删除"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
