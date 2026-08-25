# 方案设计：Designer 接入 Vercel Web Analytics

## 1. 需求解读

Designer 部署在 Vercel，需要获取访问量等使用数据。采用官方 `@vercel/analytics` 包，在 React 应用入口挂载采集组件，数据在 Vercel Dashboard Analytics 页查看。可选保留 `track()` 事件埋点能力供后续业务统计。

## 2. 目标与非目标

### 目标
- 安装 `@vercel/analytics`，在 `designer/src/main.tsx` 挂载 `<Analytics />`
- 生产环境自动采集 pageviews，Dashboard 可查看访问量/访客/来源/国家/设备
- 预留 `track()` 业务事件埋点用法（文档说明，不实际埋点）

### 非目标（本次不做）
- 不自建统计服务（Umami/Plausible 等）
- 不做业务事件实际埋点（打印点击、保存等，后续按需）
- 不做数据导出/告警等高级分析

## 3. 总体架构

```
浏览器访问生产域名
  → React 应用加载 main.tsx
  → <Analytics /> 组件（@vercel/analytics）
      ├─ mode="auto"（默认）：生产环境自动加载 /_vercel/insights/script.js
      └─ SPA 路由变化自动上报 pageview（包内部劫持 history）
  → Vercel 边缘接收并聚合
  → Dashboard → Analytics 展示
```

采集为纯旁路行为：脚本加载失败不影响应用渲染；无 cookie 依赖。

## 4. 改动明细

### 4.1 依赖安装

```bash
# designer 目录
pnpm add @vercel/analytics
```

（以 designer 实际使用的包管理器为准，查看 designer/package.json 确认）

### 4.2 入口挂载（designer/src/main.tsx）

```tsx
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { configureSDK } from "@jcyao/print-sdk"
import { Analytics } from '@vercel/analytics/react'
configureSDK({ escapeHtml: false })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    <App />
    <Analytics />
  </>,
)
```

改动仅两行（import + 组件挂载），现有逻辑零改动。

### 4.3 可选事件埋点（本次仅文档说明，不实施）

```ts
import { track } from '@vercel/analytics';

// 示例：打印按钮点击
track('print_clicked', { templateId: 'xxx' });

// 示例：模板保存
track('template_saved');
```

事件在 Dashboard → Analytics → Events 查看。

## 5. 错误处理

| 场景 | 行为 |
|---|---|
| 脚本加载失败（网络阻断等） | 包内部静默降级，不影响应用 |
| 本地开发（npm run dev / vercel dev） | 不采集、不上报，控制台可能提示开发模式 |
| 未开启 Analytics 功能 | Dashboard 页面会提示开启，按提示操作一次即可 |

## 6. 测试要点

1. designer `npm run build` + `npm run lint` 通过
2. 本地 `npm run dev` 正常运行，控制台无新增报错
3. 部署 Vercel 后访问生产域名 → Dashboard → Analytics 出现 pageview（部署后需先在 Analytics 页开启功能）
4. 切换路由（如模板列表 ↔ 编辑器）产生独立 pageview 记录
5. 应用功能回归：打印、模板编辑不受影响

## 7. 实施约束

- 仅改动 designer，不涉及 SDK
- 精准修改：main.tsx 两行 + package.json 依赖，不动其他文件
- 提交时机由用户统一决定
