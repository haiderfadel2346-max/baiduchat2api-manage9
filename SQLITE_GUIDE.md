# 🚀 SQLite 版本快速启动指南

## ✨ 无需配置数据库！

本项目已切换为 **SQLite**，无需安装 PostgreSQL 或配置数据库连接。

---

## 📦 快速开始

### 1. 安装依赖

```bash
cd your-project-directory
npm install
```

### 2. 初始化数据库

```bash
npm run db:migrate
```

这将在 `./data/baiduchat2api.db` 创建 SQLite 数据库。

### 3. （可选）填充测试数据

```bash
npm run db:seed
```

### 4. 启动开发服务器

```bash
npm run dev
```

### 5. 访问应用

打开浏览器访问: http://localhost:3000

**默认登录账户**:
- 用户名: `admin`
- 密码: `sk-admin`

---

## 🍪 Cookie 自动获取功能

### 新增功能：一键获取 Cookie

现在您可以直接在管理界面中：

1. 访问 **Cookie 管理** 页面
2. 点击 **🔄 一键获取 Cookie** 按钮
3. 系统自动访问百度文心助手并提取 Cookie
4. 自动保存到数据库

### Cookie 获取教程

如果自动获取失败，可以手动获取：

#### 方法 1: Chrome 开发者工具

1. 访问 https://chat.baidu.com/
2. 按 `F12` 打开开发者工具
3. 切换到 **Application** 标签
4. 左侧选择 **Cookies** → **https://chat.baidu.com**
5. 复制所有 Cookie 值

#### 方法 2: 浏览器控制台

1. 访问 https://chat.baidu.com/
2. 按 `F12` 打开控制台
3. 在 Console 中输入：
   ```javascript
   copy(document.cookie)
   ```
4. Cookie 已复制到剪贴板

#### 方法 3: 使用插件

使用 [Cookie Editor](https://chrome.google.com/webstore/detail/cookie-editor) 等浏览器插件快速导出。

---

## 📁 数据库文件位置

```
your-project-directory/
└── data/
    └── baiduchat2api.db  # SQLite 数据库文件
```

**注意**: 
- 数据库文件会自动创建
- 已添加到 `.gitignore`，不会提交到 Git
- 可以直接复制此文件进行备份

---

## 🆚 SQLite vs PostgreSQL

### 为什么使用 SQLite？

✅ **无需安装** - 不需要安装数据库服务器  
✅ **零配置** - 不需要配置连接字符串  
✅ **轻量级** - 整个数据库就是一个文件  
✅ **易于备份** - 直接复制文件即可  
✅ **完全够用** - 对于单机部署完全足够  

### 何时需要 PostgreSQL？

- 需要部署到 Vercel 等云平台
- 需要多服务器共享数据库
- 需要高并发访问
- 数据库超过 100GB

---

## 🔐 认证配置

### 默认账户

```
用户名: admin
密码: sk-admin
```

### NextAuth 密钥（已配置）

```env
NEXTAUTH_SECRET=your-secret-key-here-use-openssl-rand-base64-32
```

---

## 🎯 完整的功能清单

### ✅ 所有功能都可用

1. **认证系统** - 登录/登出/修改密码
2. **仪表盘** - 统计概览
3. **日志查看** - API 日志 + 系统日志
4. **Cookie 管理** - 单个 Cookie + Cookie 池
5. **Cookie 自动获取** - 🆕 一键获取
6. **配置管理** - 通用配置 + 上下文配置
7. **系统监控** - 实时监控

---

## 🚀 立即运行

```bash
# 一键启动（首次运行）
npm install && npm run db:migrate && npm run dev

# 后续启动
npm run dev
```

就这么简单！无需任何数据库配置！

---

## 📊 数据库管理

### 查看数据库

使用 SQLite 客户端：

```bash
# 安装 sqlite3
npm install -g sqlite3

# 打开数据库
sqlite3 data/baiduchat2api.db

# 查看表
.tables

# 查看数据
SELECT * FROM admin_users;
SELECT * FROM cookie_status;
```

### 备份数据库

```bash
# 简单备份
cp data/baiduchat2api.db data/baiduchat2api.backup.db

# 导出 SQL
sqlite3 data/baiduchat2api.db .dump > backup.sql
```

### 恢复数据库

```bash
# 从备份恢复
cp data/baiduchat2api.backup.db data/baiduchat2api.db

# 从 SQL 恢复
sqlite3 data/baiduchat2api.db < backup.sql
```

---

## 🐛 故障排除

### 问题 1: 提示"无法创建数据库"

**解决方案**:
```bash
# 确保 data 目录存在
mkdir -p data

# 重新运行迁移
npm run db:migrate
```

### 问题 2: Cookie 自动获取失败

**可能原因**:
- 网络问题
- 百度服务器限制
- 需要登录状态

**解决方案**:
使用手动方式获取 Cookie

### 问题 3: 数据库锁定

**解决方案**:
```bash
# 停止开发服务器
# 等待几秒
# 重新启动
npm run dev
```

---

## 📚 相关文档

- [QUICK_START.md](./QUICK_START.md) - 详细启动指南
- [SECURITY.md](./SECURITY.md) - 安全配置说明
- [PROJECT_COMPLETE.md](./PROJECT_COMPLETE.md) - 项目完成报告

---

<div align="center">

## 🎊 现在就可以运行了！

**一行命令启动**:

```bash
npm install && npm run db:migrate && npm run dev
```

**访问**: http://localhost:3000  
**登录**: admin / sk-admin

</div>
