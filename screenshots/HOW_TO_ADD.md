# 添加截图说明

## 如何添加真实截图

由于 Claude Code 无法直接运行浏览器截图，请您按以下步骤添加截图：

### 步骤 1: 运行项目

```bash
cd E:/AI/baiduchat2api-manage
npm install
npm run db:migrate
npm run dev
```

### 步骤 2: 访问并截图

访问以下页面并截图（推荐使用 1920x1080 分辨率）：

1. **login.png** - http://localhost:3000/login
   - 展示登录界面

2. **dashboard.png** - http://localhost:3000/dashboard
   - 展示仪表盘统计

3. **cookie-fetch.png** - http://localhost:3000/dashboard/cookie
   - 点击"一键获取 Cookie"按钮，展示这个特色功能

4. **cookie-management.png** - http://localhost:3000/dashboard/cookie
   - 展示 Cookie 管理界面和 Cookie 池

5. **logs.png** - http://localhost:3000/dashboard/logs
   - 展示日志查看界面

6. **config.png** - http://localhost:3000/dashboard/config
   - 展示配置管理界面

7. **monitor.png** - http://localhost:3000/dashboard/monitor
   - 展示系统监控界面

### 步骤 3: 保存截图

将截图保存到 `screenshots/` 目录，文件名如上所示。

### 步骤 4: 提交到 GitHub

```bash
git add screenshots/
git commit -m "docs: Add application screenshots"
git push origin main
```

## 截图建议

- 分辨率: 1920x1080 或 1440x900
- 格式: PNG（推荐）
- 大小: 每张 < 500KB（可使用 https://tinypng.com/ 压缩）
- 重点展示 Cookie 自动获取功能（这是最大特色）
