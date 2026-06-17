# 🚀 baiduchat2api-manage 快速启动指南

## 📋 前置要求

### 必需
- ✅ Node.js 18+ 
- ✅ npm 9+
- ✅ PostgreSQL 数据库（或 Vercel Postgres）

### 可选
- Docker（用于容器化部署）
- Vercel CLI（用于部署）

---

## 🎯 方案 1: 完整功能运行（需要数据库）

### Step 1: 安装依赖

```bash
cd your-project-directory
npm install
```

### Step 2: 配置数据库

#### 选项 A: 使用 Vercel Postgres（推荐）

1. 访问 https://vercel.com/
2. 创建新项目
3. 添加 Storage → Postgres Database
4. 复制连接字符串

#### 选项 B: 使用本地 PostgreSQL

```bash
# 安装 PostgreSQL
# Windows: https://www.postgresql.org/download/windows/

# 创建数据库
psql -U postgres
CREATE DATABASE baiduchat2api_manage;
```

### Step 3: 配置环境变量

编辑 `.env.local`:

```env
# 数据库连接（从 Vercel 或本地 PostgreSQL 获取）
DATABASE_URL=postgres://user:password@host:5432/baiduchat2api_manage

# NextAuth 密钥（已生成）
NEXTAUTH_SECRET=your-secret-key-here-use-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# 默认管理员账户
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=sk-admin
```

### Step 4: 初始化数据库

```bash
# 运行数据库迁移
npm run db:migrate

# （可选）填充测试数据
npm run db:seed
```

### Step 5: 启动开发服务器

```bash
npm run dev
```

### Step 6: 访问应用

打开浏览器访问: http://localhost:3000

**默认登录账户**:
- 用户名: `admin`
- 密码: `sk-admin`

---

## 🎨 方案 2: 仅查看前端 UI（无需数据库）

如果您只想查看前端界面设计，可以直接查看源代码：

### 页面文件位置

```
your-project-directory/app/
├── (auth)/login/page.tsx          # 登录页面
├── (dashboard)/page.tsx           # 仪表盘首页
├── (dashboard)/logs/page.tsx      # 日志查看
├── (dashboard)/cookie/page.tsx    # Cookie 管理
├── (dashboard)/config/page.tsx    # 配置管理
└── (dashboard)/monitor/page.tsx   # 系统监控
```

### 使用 VS Code 预览

```bash
# 用 VS Code 打开项目
code your-project-directory
```

然后查看 `app/(dashboard)` 目录下的各个页面文件。

---

## 🔐 认证系统说明

### 默认管理员账户

**首次登录**:
- 用户名: `admin`
- 密码: `sk-admin`

**⚠️ 重要**: 首次登录后请立即修改密码！

### 修改密码

登录后:
1. 点击左下角用户头像
2. 选择"修改密码"
3. 输入当前密码和新密码
4. 保存

### NextAuth 密钥

项目已为您生成了安全的密钥：
```
NEXTAUTH_SECRET=your-secret-key-here-use-openssl-rand-base64-32
```

**生产环境请重新生成**:
```bash
openssl rand -base64 32
```

---

## 📊 功能说明

### 1. 仪表盘首页 (`/dashboard`)

显示：
- 总请求数统计
- 成功率
- 平均响应时间
- 错误数量
- Cookie 状态
- 快速操作面板

### 2. 日志查看 (`/dashboard/logs`)

功能：
- **API 日志**: 查看所有 API 请求记录
  - 时间戳
  - 端点
  - 模型
  - 状态码
  - 响应时间
  - 查询预览
  
- **系统日志**: 查看系统运行日志
  - 日志级别（INFO, WARN, ERROR）
  - 日志消息
  - 模块名称
  - 时间戳

- 支持分页查询
- 自动刷新

### 3. Cookie 管理 (`/dashboard/cookie`)

#### 单个 Cookie 模式
- 查看当前 Cookie 状态
- 上传新 Cookie
- Token 和 LID 显示
- 过期时间提醒

#### Cookie 池模式（负载均衡）
- 管理多个 Cookie
- 查看每个 Cookie 的：
  - 并发数
  - 总请求数
  - 成功数
  - 错误数
  - 健康状态
- 添加/删除 Cookie
- 自动负载均衡

### 4. 配置管理 (`/dashboard/config`)

#### 通用配置
- Cookie 自动刷新（开关）
- 日志保留天数（1-365 天）
- User-Agent 自定义

#### 上下文配置
- 启用 Cookie 池（开关）
- 使用新对话窗口（开关）
- 最大字符数（1000-50000）
- 最大消息数（1-100）
- 单条消息最大字符数（100-10000）

### 5. 系统监控 (`/dashboard/monitor`)

实时显示：
- 系统统计（总请求、成功率、响应时间、错误数）
- Cookie 状态
- 运行时间
- 内存使用情况
- 健康状态

自动刷新间隔: 10 秒

---

## 🔌 API 端点列表

### 认证相关
```
POST /api/auth/[...nextauth]      # NextAuth 登录
POST /api/auth/change-password    # 修改密码
```

### 日志相关
```
GET  /api/logs                    # API 日志查询
GET  /api/logs/stats              # 日志统计
GET  /api/logs/system             # 系统日志查询
```

### Cookie 相关
```
GET  /api/cookie                  # 获取 Cookie 状态
POST /api/cookie                  # 更新 Cookie
GET  /api/cookie/pool             # Cookie 池列表
POST /api/cookie/pool             # 添加 Cookie
DELETE /api/cookie/pool?id=xxx    # 删除 Cookie
```

### 配置相关
```
GET  /api/config                  # 获取配置
PUT  /api/config                  # 更新配置
GET  /api/config/context          # 上下文配置
PUT  /api/config/context          # 更新上下文配置
```

### 监控相关
```
GET  /api/monitor                 # 系统监控数据
```

---

## 🐳 Docker 部署

### 使用 Docker Compose

```bash
# 1. 创建 docker-compose.yml（如果还没有）
cd your-project-directory

# 2. 启动服务
docker-compose up -d

# 3. 查看日志
docker-compose logs -f

# 4. 停止服务
docker-compose down
```

### 单独使用 Docker

```bash
# 构建镜像
docker build -t baiduchat2api-manage .

# 运行容器
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="postgres://..." \
  -e NEXTAUTH_SECRET="your-secret" \
  --name baiduchat2api-manage \
  baiduchat2api-manage
```

---

## ☁️ Vercel 部署

### 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/t479842598/baiduchat2api-manage)

### 手动部署

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署
cd your-project-directory
vercel --prod

# 4. 在 Vercel 控制台配置环境变量
# - 创建 Postgres 数据库
# - 设置 NEXTAUTH_SECRET
# - 设置 NEXTAUTH_URL
```

---

## 🔍 常见问题

### Q1: 提示"数据库连接失败"

**解决方案**:
1. 检查 `DATABASE_URL` 格式是否正确
2. 确认数据库服务已启动
3. 检查网络连接
4. 验证数据库用户名和密码

### Q2: 登录后显示"401 Unauthorized"

**解决方案**:
1. 检查 `NEXTAUTH_SECRET` 是否设置
2. 清除浏览器 Cookie
3. 重新登录

### Q3: 页面显示空白

**解决方案**:
1. 打开浏览器控制台查看错误
2. 确认所有依赖已安装 (`npm install`)
3. 检查环境变量是否正确配置

### Q4: npm install 失败

**解决方案**:
```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### Q5: 想要修改默认端口

**解决方案**:
```bash
# 方法 1: 使用环境变量
PORT=3001 npm run dev

# 方法 2: 修改 package.json
"scripts": {
  "dev": "next dev -p 3001"
}
```

---

## 📁 项目文件说明

### 核心配置文件
```
.env.local              # 环境变量配置（已生成）
package.json            # 项目依赖
tsconfig.json           # TypeScript 配置
next.config.js          # Next.js 配置
tailwind.config.js      # Tailwind CSS 配置
```

### 数据库脚本
```
scripts/db-migrate.js   # 数据库迁移（创建表）
scripts/db-seed.js      # 测试数据生成
```

### 部署配置
```
vercel.json             # Vercel 部署配置
Dockerfile              # Docker 镜像配置
docker-compose.yml      # Docker Compose 配置
```

---

## 🎯 下一步

### 立即可做
- [ ] 安装 Node.js 依赖
- [ ] 配置数据库连接
- [ ] 运行数据库迁移
- [ ] 启动开发服务器
- [ ] 登录并测试功能

### 可选配置
- [ ] 修改默认管理员密码
- [ ] 配置 Cookie 自动刷新
- [ ] 设置日志保留策略
- [ ] 启用 Cookie 池负载均衡
- [ ] 部署到生产环境

---

## 📞 获取帮助

如有问题，请查看：
- [项目完成报告](./PROJECT_COMPLETE.md)
- [功能同步文档](./SYNC_UPDATE.md)
- [README 中文](./README.md)

---

<div align="center">

**🎊 祝您使用愉快！**

如有任何问题或建议，欢迎反馈！

</div>
