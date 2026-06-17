'use client';

import { useState } from 'react';

export default function CookieFetchButton({ onSuccess }: { onSuccess?: (data: any) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  const handleFetch = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/cookie/fetch', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Cookie 自动获取成功！');
        onSuccess?.(data.data);
      } else {
        setError(data.error || '获取失败');
      }
    } catch (err) {
      setError('网络请求失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Auto Fetch Button */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🚀 自动获取 Cookie
            </h3>
            <p className="text-sm text-gray-600">
              自动访问百度文心助手并提取 Cookie 信息
            </p>
          </div>
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            {showInstructions ? '隐藏说明' : '查看说明'}
          </button>
        </div>

        <button
          onClick={handleFetch}
          disabled={loading}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              正在获取...
            </span>
          ) : (
            '🔄 一键获取 Cookie'
          )}
        </button>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Instructions */}
        {showInstructions && (
          <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="font-semibold text-gray-900 mb-3">工作原理：</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>系统自动访问 https://chat.baidu.com/</li>
              <li>提取页面中的 token 和 lid</li>
              <li>自动保存到数据库</li>
              <li>立即可用，无需手动操作</li>
            </ol>

            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>注意</strong>: 自动获取的 Cookie 可能需要登录状态才能正常使用。如果获取失败，请使用手动方式。
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Manual Method */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📖 手动获取 Cookie
        </h3>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">方法 1: Chrome 开发者工具</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 ml-4">
              <li>访问 <a href="https://chat.baidu.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://chat.baidu.com/</a></li>
              <li>按 <kbd className="px-2 py-1 bg-white border rounded text-xs">F12</kbd> 打开开发者工具</li>
              <li>切换到 <strong>Application</strong> 标签</li>
              <li>左侧选择 <strong>Cookies</strong> → <strong>https://chat.baidu.com</strong></li>
              <li>复制 Cookie 值（<code className="bg-gray-200 px-1 rounded text-xs">BAIDUID</code>、<code className="bg-gray-200 px-1 rounded text-xs">BIDUPSID</code> 等）</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">方法 2: 浏览器控制台</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 ml-4">
              <li>访问 <a href="https://chat.baidu.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://chat.baidu.com/</a></li>
              <li>按 <kbd className="px-2 py-1 bg-white border rounded text-xs">F12</kbd> 打开控制台</li>
              <li>在 Console 中输入并执行：
                <div className="mt-2 bg-gray-900 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
                  copy(document.cookie)
                </div>
              </li>
              <li>Cookie 已复制到剪贴板，粘贴到上方表单即可</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">方法 3: 浏览器插件</h4>
            <p className="text-sm text-gray-700 ml-4">
              使用 <a href="https://chrome.google.com/webstore/detail/cookie-editor" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Cookie Editor</a> 等插件快速导出 Cookie
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
