# 需求文档：Designer 接入 Vercel Web Analytics 访问统计

## 1. 需求背景

Designer（打印模板设计器）部署在 Vercel 上，目前无法得知站点的访问情况（访问量、访客数、来源等）。希望获取这些信息用于了解使用情况。

## 2. 核心需求

1. **接入访问统计**：使用 Vercel 官方方案 `@vercel/analytics`，采集页面访问（pageviews）、独立访客（visitors）、访问来源、国家、设备、访问路径等指标。
2. **数据查看入口**：Vercel Dashboard → 项目的 **Analytics** 标签页直接查看，无需自建看板。
3. **（可选）业务事件埋点**：保留 `track()` 自定义事件能力，如后续需要统计「打印按钮点击」「模板保存」等业务行为，可直接调用，本次不强制埋点。

## 3. 技术选型

**选定：`@vercel/analytics`（官方包）**，理由：

- 官方维护，与 Vercel 部署原生集成，Dashboard 自带 Analytics 页面
- 接入成本极低（React 入口 1 行组件），无需改造现有代码结构
- 不依赖 cookie、自动采集 pageviews，隐私友好（对用户无感）
- Hobby（免费）计划即可使用（数据保留时长受计划限制，具体以 Dashboard 展示为准）

**备选（本次不采用）：** Umami / Plausible（开源自托管，维度更细但需另建服务）、Google Analytics（功能重、隐私合规负担大）。诉求仅为「知道访问量」，官方包足够，遵循简洁优先原则。

## 4. 使用场景

```
用户访问 https://xxx.vercel.app
  → @vercel/analytics 自动上报 pageview（含路径、referrer、国家、设备）
  → Vercel Dashboard → Analytics 查看趋势图与明细

（可选）用户点击「打印」按钮
  → track('print_clicked') → Analytics → Events 查看业务事件次数
```

## 5. 验收标准

1. `@vercel/analytics` 安装并在 `designer/src/main.tsx` 挂载 `<Analytics />`。
2. 部署至 Vercel 后，本地/预览访问一次，Dashboard Analytics 出现 pageview 记录（生产环境数据，`vercel dev` 本地不采集）。
3. designer `npm run build` + `npm run lint` 通过，打包体积增量可忽略（脚本按需懒加载）。
4. 不影响现有功能（纯旁路采集，无渲染侵入）。

## 6. 注意事项

- 数据只在**生产域名**采集，本地 `npm run dev` 与 `vercel dev` 不产生数据
- Dashboard 的 Analytics 页若提示需要开启，需在页面手动启用一次
- 免费计划的数据保留期有限（以 Vercel 官方文档为准），长期留存诉求不在本次范围
