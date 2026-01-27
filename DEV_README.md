# 打印服务平台 - 开发指南

## 🚀 快速启动

### 一键启动开发环境

```bash
./dev.sh
```

此脚本会自动：
- ✅ 检查并安装依赖
- ✅ 启动后端服务 (http://localhost:3000)
- ✅ 启动前端设计器 (http://localhost:5173)
- ✅ 输出日志到 `logs/` 目录

### 停止服务

```bash
./stop.sh
```

或者在运行 `dev.sh` 的终端按 `Ctrl+C`

---

## 📁 项目结构

```
printer/
├── server/          # 后端服务
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   ├── schemas.ts      # Schema 管理（含默认数据）
│   │   │   ├── mockData.ts     # Mock 数据管理（含默认数据）
│   │   │   └── templates.ts
│   │   └── middlewares/
│   └── package.json
│
├── designer/        # 前端设计器
│   ├── src/
│   └── package.json
│
├── sdk/             # 打印 SDK
│   └── src/
│
│
├── dev.sh           # 一键启动脚本
├── stop.sh          # 停止服务脚本
└── logs/            # 运行日志（自动生成）
```

---

## 📦 系统内置数据

### Schema（数据字典）

启动后自动包含以下 Schema：

1. **销售出库单** (`schema-demo-sales`)
   - 包含标题、公司信息、客户信息、明细列表、汇总等完整字段
   - 支持二维码、条形码、图片等组件

### Mock 数据

启动后自动包含以下 Mock 数据：

1. **销售出库单 - 标准样例** (`mock-sales-001`)
   - 5 个明细项
   - 适合快速测试和演示

2. **月度销售汇总表 - 大数据量** (`mock-sales-002`)
   - 39 个明细项
   - 用于测试大表格分页打印

3. **简单测试单 - 最小数据集** (`mock-sales-003`)
   - 1 个明细项
   - 最小化数据，快速验证功能

---

## 🔧 开发说明

### 手动启动（分步）

如果需要分别启动服务：

```bash
# 启动后端
cd server
npm install
npm run dev

# 启动前端（新终端）
cd designer
npm install
npm run dev
```

### 查看日志

```bash
# 实时查看后端日志
tail -f logs/server.log

# 实时查看前端日志
tail -f logs/designer.log
```

### 重置数据

重启 server 后，系统会自动重置为默认内置数据。

---

## 🌐 服务地址

- **前端设计器**: http://localhost:5173
- **后端 API**: http://localhost:3000
  - GET `/api/schemas` - 获取所有 Schema
  - GET `/api/mock-data` - 获取所有 Mock 数据
  - GET `/api/templates` - 获取所有模板

---

## 💡 常见问题

### Q: 端口被占用怎么办？

如果端口 3000 或 5173 被占用，可以修改：

- **Server**: 设置环境变量 `PORT=3001`
- **Designer**: 修改 `designer/vite.config.ts` 中的 `server.port`

### Q: 如何添加更多默认数据？

编辑以下文件：
- **Schema**: `server/src/routes/schemas.ts` 的 `defaultSchemas` 数组
- **Mock Data**: `server/src/routes/mockData.ts` 的 `defaultMockData` 数组

### Q: 日志文件太大怎么办？

删除日志文件：
```bash
rm -rf logs/*.log
```

---

## 📝 TODO

- [ ] 添加 Windows 启动脚本 (dev.bat)
- [ ] 集成 PM2 用于生产部署
- [ ] 添加数据持久化（数据库）
- [ ] 添加用户认证

---

