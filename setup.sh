#!/bin/bash

# baiduchat2api-manage 快速启动脚本
# 此脚本帮助您快速设置和启动项目

set -e

echo "🚀 baiduchat2api-manage 快速启动脚本"
echo "===================================="
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到 npm"
    exit 1
fi

echo "✅ npm 版本: $(npm --version)"
echo ""

# 安装依赖
echo "📦 安装依赖..."
npm install

# 检查环境变量文件
if [ ! -f .env.local ]; then
    echo ""
    echo "⚠️  未找到 .env.local 文件"
    echo "正在从 .env.example 创建..."
    cp .env.example .env.local

    echo ""
    echo "📝 请编辑 .env.local 文件，配置以下变量："
    echo "   - DATABASE_URL: 数据库连接字符串"
    echo "   - NEXTAUTH_SECRET: 随机密钥 (使用 openssl rand -base64 32 生成)"
    echo "   - NEXTAUTH_URL: 应用 URL (开发环境: http://localhost:3000)"
    echo ""
    read -p "按回车键继续..."
fi

# 运行数据库迁移
echo ""
echo "🗄️  运行数据库迁移..."
if npm run db:migrate; then
    echo "✅ 数据库迁移成功"
else
    echo "❌ 数据库迁移失败"
    echo "请检查 DATABASE_URL 是否正确配置"
    exit 1
fi

# 询问是否填充测试数据
echo ""
read -p "是否填充测试数据？(y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 填充测试数据..."
    npm run db:seed
    echo "✅ 测试数据填充成功"
fi

# 启动开发服务器
echo ""
echo "✨ 启动开发服务器..."
echo ""
echo "🌐 访问: http://localhost:3000"
echo "👤 默认账户: admin / sk-admin"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

npm run dev
