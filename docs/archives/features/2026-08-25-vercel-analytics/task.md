# 任务执行：Designer 接入 Vercel Web Analytics

> 实现计划，按 Task 顺序执行。每步用 `- [ ]` 勾选跟踪。
> **验证方式说明**：designer 以 `npm run build`（tsc + vite build）+ `npm run lint` 为验证手段；线上数据以 Vercel Dashboard Analytics 页为准。

**Goal:** Designer 接入 `@vercel/analytics`，生产环境自动采集 pageviews，访问量等数据在 Vercel Dashboard → Analytics 查看。

**Architecture:** 纯 designer 侧改动：安装官方包 + `main.tsx` 入口挂载 `<Analytics />` 组件，旁路采集，零业务侵入。

**Tech Stack:** React 18、Vite、@vercel/analytics（官方包）。

## Global Constraints

- 仅改动 designer，不涉及 SDK
- 精准修改：`package.json` + `pnpm-lock.yaml`（安装产物）+ `main.tsx` 两行，不动其他文件
- 本次不实际埋点 `track()` 业务事件（仅保留能力）
- 提交时机由用户统一决定，本计划不包含 `git commit` 步骤

---

### Task 1: 安装依赖 + 入口挂载

**文件:**
- Modify: `designer/package.json`、`designer/pnpm-lock.yaml`（安装产物）
- Modify: `designer/src/main.tsx`

**Interfaces:**
- Produces: `<Analytics />` 组件挂载（import 自 `@vercel/analytics/react`）

- [x] **Step 1: designer 目录执行 `pnpm add @vercel/analytics`**
- [x] **Step 2: main.tsx 挂载组件**：新增 `import { Analytics } from '@vercel/analytics/react'`；render 根节点改为 `<> <App /> <Analytics /> </>`（现有 `configureSDK` 调用等逻辑零改动）

**Verify:** `npm run build`（designer 目录）+ `npm run lint` 通过；本地 `npm run dev` 启动正常、控制台无新增报错。

---

### Task 2: 部署验证（线上数据）

**文件:**
- (无代码改动，部署与 Dashboard 操作)

- [ ] **Step 1: 推送部署至 Vercel（按既有发布流程）**
- [ ] **Step 2: Dashboard → 项目 → Analytics 页**：若提示开启则启用一次；确认功能状态为 Active**
- [ ] **Step 3: 访问生产域名并切换路由（模板列表 ↔ 编辑器）若干次，稍候在 Analytics 页确认出现 pageview 记录与路径明细**
- [ ] **Step 4: 回归确认**：线上打印、模板编辑功能不受影响**

**Verify:** Analytics 页可见访问数据；功能回归通过后，等待用户指示统一提交（不自行 git commit）。
