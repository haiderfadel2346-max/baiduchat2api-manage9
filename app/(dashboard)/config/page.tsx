'use client';

import { useEffect, useState } from 'react';

interface Config {
  cookie_auto_refresh: boolean;
  log_retention_days: number;
  user_agent: string;
  cookie_pool_enabled: boolean;
  fresh_conversation: boolean;
  context_max_chars: number;
  context_max_messages: number;
  context_max_message_chars: number;
}

export default function ConfigPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'context'>('general');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/config');
      const data = await response.json();
      if (data.success) {
        setConfig(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string, value: any) => {
    setSaving(true);
    try {
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });

      const data = await response.json();
      if (data.success) {
        alert('配置保存成功！');
        fetchConfig();
      } else {
        alert('保存失败: ' + data.error);
      }
    } catch (error) {
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleContextSave = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const response = await fetch('/api/config/context', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fresh_conversation: config.fresh_conversation,
          context_max_chars: config.context_max_chars,
          context_max_messages: config.context_max_messages,
          context_max_message_chars: config.context_max_message_chars,
          cookie_pool_enabled: config.cookie_pool_enabled,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('配置保存成功！');
      } else {
        alert('保存失败: ' + data.error);
      }
    } catch (error) {
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!config) {
    return <div className="text-center text-gray-500">无法加载配置</div>;
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('general')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'general'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              ⚙️ 通用配置
            </button>
            <button
              onClick={() => setActiveTab('context')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'context'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🔄 上下文配置
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'general' ? (
            <GeneralConfig config={config} onSave={handleSave} saving={saving} />
          ) : (
            <ContextConfig
              config={config}
              setConfig={setConfig}
              onSave={handleContextSave}
              saving={saving}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function GeneralConfig({
  config,
  onSave,
  saving,
}: {
  config: Config;
  onSave: (key: string, value: any) => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Cookie Auto Refresh */}
      <div className="flex items-center justify-between py-4 border-b border-gray-200">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Cookie 自动刷新</h3>
          <p className="text-sm text-gray-500">Cookie 失效时自动重新获取</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.cookie_auto_refresh}
            onChange={(e) => onSave('cookie_auto_refresh', e.target.checked)}
            className="sr-only peer"
            disabled={saving}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Log Retention Days */}
      <div className="py-4 border-b border-gray-200">
        <div className="mb-2">
          <h3 className="text-sm font-medium text-gray-900">日志保留天数</h3>
          <p className="text-sm text-gray-500">超过此天数的日志将被自动清理</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            value={config.log_retention_days}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (value >= 1 && value <= 365) {
                onSave('log_retention_days', value);
              }
            }}
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            max="365"
            disabled={saving}
          />
          <span className="text-sm text-gray-600">天</span>
        </div>
      </div>

      {/* User Agent */}
      <div className="py-4">
        <div className="mb-2">
          <h3 className="text-sm font-medium text-gray-900">User-Agent</h3>
          <p className="text-sm text-gray-500">自定义请求头 User-Agent</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={config.user_agent}
            onChange={(e) => onSave('user_agent', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            disabled={saving}
          />
        </div>
      </div>
    </div>
  );
}

function ContextConfig({
  config,
  setConfig,
  onSave,
  saving,
}: {
  config: Config;
  setConfig: (config: Config) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Cookie Pool Enabled */}
      <div className="flex items-center justify-between py-4 border-b border-gray-200">
        <div>
          <h3 className="text-sm font-medium text-gray-900">启用 Cookie 池</h3>
          <p className="text-sm text-gray-500">使用多个 Cookie 进行负载均衡</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.cookie_pool_enabled}
            onChange={(e) =>
              setConfig({ ...config, cookie_pool_enabled: e.target.checked })
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Fresh Conversation */}
      <div className="flex items-center justify-between py-4 border-b border-gray-200">
        <div>
          <h3 className="text-sm font-medium text-gray-900">使用新对话窗口</h3>
          <p className="text-sm text-gray-500">每次请求使用新的百度对话窗口，避免上下文串线</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.fresh_conversation}
            onChange={(e) =>
              setConfig({ ...config, fresh_conversation: e.target.checked })
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Max Chars */}
      <div className="py-4 border-b border-gray-200">
        <div className="mb-2">
          <h3 className="text-sm font-medium text-gray-900">最大字符数</h3>
          <p className="text-sm text-gray-500">上下文压缩后的最大字符数</p>
        </div>
        <input
          type="number"
          value={config.context_max_chars}
          onChange={(e) =>
            setConfig({ ...config, context_max_chars: parseInt(e.target.value, 10) })
          }
          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="1000"
          max="50000"
        />
      </div>

      {/* Max Messages */}
      <div className="py-4 border-b border-gray-200">
        <div className="mb-2">
          <h3 className="text-sm font-medium text-gray-900">最大消息数</h3>
          <p className="text-sm text-gray-500">保留的最大消息条数</p>
        </div>
        <input
          type="number"
          value={config.context_max_messages}
          onChange={(e) =>
            setConfig({ ...config, context_max_messages: parseInt(e.target.value, 10) })
          }
          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="1"
          max="100"
        />
      </div>

      {/* Max Message Chars */}
      <div className="py-4 border-b border-gray-200">
        <div className="mb-2">
          <h3 className="text-sm font-medium text-gray-900">单条消息最大字符数</h3>
          <p className="text-sm text-gray-500">每条消息的最大字符数限制</p>
        </div>
        <input
          type="number"
          value={config.context_max_message_chars}
          onChange={(e) =>
            setConfig({
              ...config,
              context_max_message_chars: parseInt(e.target.value, 10),
            })
          }
          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="100"
          max="10000"
        />
      </div>

      {/* Save Button */}
      <div className="pt-4">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? '保存中...' : '保存配置'}
        </button>
      </div>
    </div>
  );
}
