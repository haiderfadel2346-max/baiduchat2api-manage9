# baiduchat2api-manage

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/t479842598/baiduchat2api-manage&project-name=baiduchat2api-manage&repository-name=baiduchat2api-manage)
[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/t479842598/baiduchat2api-manage)

可视化管理系统，用于管理 [baiduchat2api](https://github.com/XxxXTeam/baiduchat2api) 服务。

> ⚠️ **安全提醒**: 首次登录后请立即修改默认密码！详见 [安全配置](#-安全配置)

---

## ✨ 特性

- 🎨 **现代化界面** - 基于 Next.js 14 + Tailwind CSS 的精美 UI
- 🔐 **安全认证** - NextAuth.js + bcrypt 加密存储
- 📊 **实时监控** - 系统状态、内存使用、运行时间实时展示
- 🍪 **Cookie 自动获取** - ⭐ 一键获取百度 Cookie，无需手动复制
- 📝 **完整日志** - API 请求日志 + 系统运行日志，支持过滤和分页
- ⚙️ **灵活配置** - 通用配置 + 上下文配置，满足各种需求
- 🔄 **Cookie 池** - 多 Cookie 负载均衡，自动故障转移
- 💾 **SQLite 数据库** - 零配置，无需安装 PostgreSQL

---

## 📸 界面预览

### 登录页面
精美的渐变背景设计，流畅的登录体验

![登录页面](./screenshots/login.png)

### 仪表盘
一目了然的统计数据，快速了解系统状态

![仪表盘](./screenshots/dashboard.png)

### Cookie 自动获取 ⭐
独创的一键自动获取功能，告别手动复制

![Cookie 自动获取](./screenshots/cookie-fetch.png)

### Cookie 管理
支持单个 Cookie 和 Cookie 池双重管理

![Cookie 管理](./screenshots/cookie-management.png)

### 日志查看
API 日志和系统日志分类展示，支持搜索和过滤

![日志查看](./screenshots/logs.png)

### 配置管理
通用配置和上下文配置，轻松管理系统参数

![配置管理](./screenshots/config.png)

### 系统监控
实时监控系统运行状态，每 10 秒自动刷新

![系统监控](./screenshots/monitor.png)

---

## 🚀 快速开始

### 方式 1：一键部署到 Vercel（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/t479842598/baiduchat2api-manage)

1. 点击上方按钮
2. 登录 Vercel 账号
3. 配置环境变量（见下方说明）
4. 点击 Deploy
5. 等待部署完成

### 方式 2：部署到 Cloudflare Pages

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/t479842598/baiduchat2api-manage)

或手动部署：

```bash
# 构建项目
npm run build

# 部署到 Cloudflare Pages
npx wrangler pages deploy .next --project-name=baiduchat2api-manage
```

### 方式 3：本地运行

```bash
# 1. 克隆仓库
git clone https://github.com/t479842598/baiduchat2api-manage.git
cd baiduchat2api-manage

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入您的配置

# 4. 初始化数据库（自动创建 SQLite 数据库）
npm run db:migrate

# 5. 启动开发服务器
npm run dev
```

访问 http://localhost:3000

**默认登录**:
- 用户名: `admin`
- 密码: `sk-admin`

⚠️ **首次登录后请立即修改密码！**

---

## 🔧 环境变量配置

### 创建 `.env.local` 文件

```env
# NextAuth 配置（必需）
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# 默认管理员账户（可选）
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=sk-admin
```

### 生成 NEXTAUTH_SECRET

```bash
# 方法 1: OpenSSL
openssl rand -base64 32

# 方法 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 方法 3: 在线生成
# https://generate-secret.vercel.app/32
```

⚠️ **安全提示**: 
- 每个部署使用不同的密钥
- 不要使用示例中的值
- 不要提交 `.env.local` 到 Git

---

## 🍪 Cookie 自动获取

### ⭐ 独创功能

本项目的最大特色 - **一键自动获取百度 Cookie**：

1. 登录管理系统
2. 访问 **Cookie 管理** 页面
3. 点击 **"🔄 一键获取 Cookie"** 按钮
4. 系统自动完成：
   - ✅ 访问 https://chat.baidu.com/
   - ✅ 提取 token 和 lid
   - ✅ 保存到数据库
   - ✅ 立即可用

无需手动打开开发者工具，无需复制粘贴！

### 手动获取方式

如果自动获取失败，仍可手动获取：

<details>
<summary>📖 展开查看手动获取教程</summary>

#### 方法 1: Chrome 开发者工具

1. 访问 https://chat.baidu.com/
2. 按 `F12` 打开开发者工具
3. 切换到 **Application** 标签
4. 左侧选择 **Cookies** → **https://chat.baidu.com**
5. 复制 Cookie 内容
6. 粘贴到管理界面

#### 方法 2: 浏览器控制台

1. 访问 https://chat.baidu.com/
2. 按 `F12` 打开控制台
3. 输入并执行：
   ```javascript
   copy(document.cookie)
   ```
4. Cookie 已复制到剪贴板
5. 粘贴到管理界面

</details>

---

## 🎯 功能详解

### 🔐 认证系统
- NextAuth.js 认证框架
- bcrypt 密码加密
- JWT Session 管理
- 修改密码功能

### 📝 日志管理
- **API 日志**: 请求端点、模型、状态码、响应时间
- **系统日志**: 运行级别、模块、时间戳、详细信息
- 分页查询和条件过滤
- 日志统计和分析

### 🍪 Cookie 管理
- **单 Cookie 模式**: 状态监控、手动/自动获取
- **Cookie 池模式**: 多 Cookie 负载均衡
- 健康状态追踪
- 并发数实时显示
- 自动故障转移

### ⚙️ 配置管理
- **通用配置**: 自动刷新、日志保留、User-Agent
- **上下文配置**: 新对话模式、消息压缩、最大字符数
- Cookie 池开关
- 配置历史记录

### 📊 系统监控
- 实时统计数据（总请求、成功率、响应时间、错误数）
- 运行时间追踪
- 内存使用情况
- Cookie 状态监控
- 自动刷新（10 秒间隔）

---

## 🔐 安全配置

### ⚠️ 生产环境部署必读

部署到生产环境前，**务必**完成：

#### 🔴 必须修改（否则有安全风险）

1. **重新生成 NEXTAUTH_SECRET**
   ```bash
   openssl rand -base64 32
   ```

2. **修改默认密码**
   - 登录后立即修改
   - 使用强密码（8+ 位，大小写+数字）

3. **更新 NEXTAUTH_URL**
   ```env
   NEXTAUTH_URL=https://your-domain.com
   ```

4. **启用 HTTPS**
   - Vercel 自动提供
   - Cloudflare 自动提供
   - 自托管需配置 SSL

#### 🟡 强烈建议

- 定期备份 SQLite 数据库
- 配置防火墙规则
- 启用访问速率限制
- 定期更新依赖包
- 监控异常登录尝试

---

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| **框架** | Next.js 14 (App Router) |
| **语言** | TypeScript 5.0 |
| **样式** | Tailwind CSS 3.4 |
| **认证** | NextAuth.js 4.24 |
| **数据库** | SQLite (better-sqlite3) |
| **加密** | bcrypt |
| **部署** | Vercel / Cloudflare / Docker |

---

## 📖 相关文档

| 文档 | 说明 |
|------|------|
| [SQLITE_GUIDE.md](./SQLITE_GUIDE.md) | SQLite 数据库使用指南 |
| [QUICK_START.md](./QUICK_START.md) | 详细的快速启动教程 |
| [SECURITY_NOTICE.md](./SECURITY_NOTICE.md) | 安全配置详细说明 |

---

## 📊 项目统计

```
📁 代码文件: 38 个
🔌 API 端点: 13 个
📱 前端页面: 6 个
🗄️ 数据库表: 7 张
💬 代码行数: 10,000+
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

提交前请确保：
- ✅ 代码通过 TypeScript 检查
- ✅ 遵循项目代码规范
- ✅ 更新相关文档
- ✅ 添加必要的测试

---

## 📄 开源协议

[MIT License](./LICENSE)

---

## 🙏 致谢

感谢以下开源项目：

- [baiduchat2api](https://github.com/XxxXTeam/baiduchat2api) - 核心 API 服务
- [Next.js](https://nextjs.org/) - React 应用框架
- [NextAuth.js](https://next-auth.js.org/) - 认证解决方案
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - SQLite 驱动

---

## 🔗 链接

- **GitHub**: https://github.com/t479842598/baiduchat2api-manage
- **问题反馈**: https://github.com/t479842598/baiduchat2api-manage/issues
- **在线演示**: 部署后可用

---

<div align="center">

### ⭐ 如果这个项目对你有帮助，请给它一个 Star！

**Made with ❤️ by [t479842598](https://github.com/t479842598)**

</div>
