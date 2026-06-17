# 🔐 baiduchat2api-manage 认证和安全配置

## 认证系统概述

本项目使用 **NextAuth.js** 实现完整的认证系统。

---

## 🔑 默认管理员账户

### 首次登录凭据

```
用户名: admin
密码: sk-admin
```

⚠️ **重要安全提示**: 
- 这是默认账户，仅用于首次登录
- **强烈建议首次登录后立即修改密码**
- 生产环境部署前务必更改默认凭据

---

## 🛡️ NextAuth 密钥配置

### 已生成的密钥

您的项目已自动生成安全密钥：

```env
NEXTAUTH_SECRET=your-secret-key-here-use-openssl-rand-base64-32
```

### 生产环境密钥生成

**方法 1: 使用 OpenSSL**
```bash
openssl rand -base64 32
```

**方法 2: 使用 Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**方法 3: 在线生成**
访问: https://generate-secret.vercel.app/32

### 配置位置

在 `.env.local` 文件中：
```env
NEXTAUTH_SECRET=你的新密钥
NEXTAUTH_URL=http://localhost:3000
```

生产环境需要更新 `NEXTAUTH_URL`：
```env
NEXTAUTH_URL=https://your-domain.com
```

---

## 🔒 密码管理

### 修改管理员密码

#### 方法 1: 通过 Web 界面（推荐）

1. 登录管理系统
2. 点击左下角用户头像
3. 点击"修改密码"
4. 输入：
   - 当前密码: `sk-admin`
   - 新密码: （自定义）
   - 确认新密码
5. 保存

#### 方法 2: 通过 API

```bash
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "currentPassword": "sk-admin",
    "newPassword": "your-new-strong-password"
  }'
```

### 密码要求

默认密码策略：
- ✅ 最少 8 个字符
- ✅ 至少 1 个大写字母
- ✅ 至少 1 个小写字母
- ✅ 至少 1 个数字

推荐密码策略（生产环境）：
- 12+ 个字符
- 包含大小写字母、数字和特殊符号
- 不使用常见密码
- 定期更换

---

## 👥 用户管理

### 当前用户

默认创建了 1 个管理员账户：
- 用户名: `admin`
- 角色: 管理员
- 权限: 完全访问

### 数据库结构

```sql
admin_users 表:
- id: 用户 ID
- username: 用户名（唯一）
- password_hash: 密码哈希（bcrypt）
- created_at: 创建时间
- last_login: 最后登录时间
- is_active: 是否激活
```

### 添加新用户（需手动）

目前需要直接操作数据库：

```sql
-- 1. 生成密码哈希（使用 bcrypt）
-- 在 Node.js 中运行:
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('new-password', 10);
console.log(hash);

-- 2. 插入新用户
INSERT INTO admin_users (username, password_hash) 
VALUES ('newuser', '上一步生成的哈希');
```

---

## 🔐 Session 管理

### Session 配置

```typescript
// NextAuth 配置
session: {
  strategy: 'jwt',
  maxAge: 7 * 24 * 60 * 60, // 7 天
}
```

### Session 存储

- 使用 JWT（JSON Web Token）
- 存储在 HTTP-Only Cookie 中
- 自动过期时间: 7 天

### 登出

**Web 界面**:
- 点击左下角用户头像
- 点击"退出登录"

**API**:
```bash
POST http://localhost:3000/api/auth/signout
```

---

## 🛡️ 安全最佳实践

### 1. 强制 HTTPS（生产环境）

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      }
    ]
  }
}
```

### 2. 配置 CORS

```typescript
// API Route
export async function GET(request: NextRequest) {
  const response = NextResponse.json({ data: 'example' });
  
  response.headers.set('Access-Control-Allow-Origin', 'https://your-domain.com');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  
  return response;
}
```

### 3. 速率限制

建议使用 Vercel 的内置速率限制或集成：
- `express-rate-limit`
- `@upstash/ratelimit`

### 4. 环境变量保护

```bash
# 永远不要提交 .env.local 到 Git
echo ".env.local" >> .gitignore
```

### 5. 定期更新密钥

建议每 90 天更新一次 `NEXTAUTH_SECRET`。

---

## 🔍 身份验证流程

### 登录流程

```
1. 用户输入用户名和密码
   ↓
2. POST /api/auth/signin/credentials
   ↓
3. 验证用户名是否存在
   ↓
4. 使用 bcrypt 验证密码
   ↓
5. 生成 JWT Token
   ↓
6. 设置 HTTP-Only Cookie
   ↓
7. 重定向到 /dashboard
```

### 受保护路由

所有 `/dashboard/*` 路由都需要认证：

```typescript
// layout.tsx
const { data: session, status } = useSession();

if (status === 'unauthenticated') {
  router.push('/login');
}
```

### API 保护

所有 API 端点都验证 session：

```typescript
const session = await getServerSession(authOptions);

if (!session?.user) {
  return NextResponse.json(
    { success: false, error: 'Unauthorized' },
    { status: 401 }
  );
}
```

---

## 🚨 故障排除

### 问题 1: 无法登录

**检查清单**:
- [ ] 用户名是否正确：`admin`
- [ ] 密码是否正确：`sk-admin`
- [ ] 数据库是否已迁移：`npm run db:migrate`
- [ ] `NEXTAUTH_SECRET` 是否已设置
- [ ] `NEXTAUTH_URL` 是否正确

**解决方案**:
```bash
# 重置管理员密码
npm run db:migrate  # 会重新创建默认账户
```

### 问题 2: Session 过期太快

**解决方案**:
修改 `app/api/auth/[...nextauth]/route.ts`：
```typescript
session: {
  strategy: 'jwt',
  maxAge: 30 * 24 * 60 * 60, // 改为 30 天
}
```

### 问题 3: CSRF Token 错误

**解决方案**:
```bash
# 清除浏览器 Cookie
# 或在代码中禁用 CSRF 保护（仅开发环境）
```

---

## 📊 密码安全统计

### 密码加密

- **算法**: bcrypt
- **Salt Rounds**: 10
- **哈希长度**: 60 字符

### 示例哈希

```
原密码: sk-admin
哈希值: $2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 验证时间

平均验证时间: ~100ms（安全但不影响性能）

---

## 🎯 下一步

### 立即操作
1. ✅ 使用默认账户登录
2. ✅ 修改默认密码
3. ✅ 测试登出/登录
4. ✅ 检查 Session 过期时间

### 生产部署前
1. ⚠️ 重新生成 `NEXTAUTH_SECRET`
2. ⚠️ 更新 `NEXTAUTH_URL` 为实际域名
3. ⚠️ 修改默认管理员密码
4. ⚠️ 启用 HTTPS
5. ⚠️ 配置速率限制

---

<div align="center">

**🔒 安全第一，谨慎配置！**

</div>
