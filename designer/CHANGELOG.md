# Changelog

所有版本的变更记录都列在这里，遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/) 规范。

## [1.3.0] - 2026-06-07

### ✨ 新增功能

- **表格列管道配置 UI**
  - 表格列管理面板新增「管道转换」折叠面板，复用 `PipeConfigPanel` 组件
  - 支持为每列数据配置管道链，与 SDK 列级管道渲染严格一致

- **类型单一数据源**
  - `designer/src/types/index.ts` 从 ~400 行本地定义改为从 `@jcyao/print-sdk` 重新导出
  - 消除设计与 SDK 间的类型重复维护，新增 `DataField` 类型导出

### 🔧 内部优化

- 合计额外行项和列合计的管道配置 UI 统一替换为 `PipeConfigPanel`，减少内联代码
- 列管道 Collapse 移除 `key` 强制 remount，改为 `defaultActiveKey` 控制展开状态
- Mock 模板新增列级管道示例（单价列应用 `currency` 管道），便于功能演示

### 📦 依赖升级

- `@jcyao/print-sdk`: `^1.7.0` → `^1.8.0`

---

## [1.2.0] - 2026-06-06

### ✨ 新增功能

- **表格表头显示控制 + 跨页重复表头**
  - 新增"跨页重复表头"复选框，受"显示表头"状态联动控制
  - 取消"显示表头"时自动同步关闭"跨页重复表头"
  - 画布预览中隐藏表头时显示半透明提示，便于识别当前状态

- **表格密度预设选择器**
  - 表格列管理面板新增「表格风格」单选按钮组（标准 / 紧凑）
  - 紧凑模式下单元格 padding 收紧为 `1px 4px`、line-height 为 `1.2`，与 SDK 渲染严格一致

- **合计行显示模式选择器**
  - 表格列管理面板新增「合计行显示风格」单选按钮组（显示 / 隐藏 / 仅额外行）
  - 与 SDK `summaryDisplay` 字段直接对应，向后兼容 `showSummary`
  - `summaryDisplay` 解析逻辑提取复用，消除 3 处重复

### 🐛 问题修复

- 合计行折叠面板在 `summaryDisplay='none'` 时仍展开，改为自动隐藏
- 列级样式面板在 `summaryDisplay='none'` 时仍展开，改为自动隐藏

### 📦 依赖升级

- `@jcyao/print-sdk`: `^1.6.0` → `^1.7.0`

**影响范围**：`designer/src/types/index.ts`、`designer/src/pages/Designer/components/Canvas/componentRenderers/TablePreview.tsx`、`designer/src/pages/Designer/components/PropertyPanel/TableColumnSection.tsx`

---

## [1.1.0] - 2026-06-04

### ✨ 新增功能

- **表格列级样式控制**
  - 每个列卡片新增「列样式」折叠面板，支持分别配置表头样式和数据样式（字重、字号、颜色、对齐）
  - 序号列新增样式配置区域（表头样式和数据样式分别配置）
  - 画布预览实时应用列级样式，与 SDK 打印输出一致
  - 新增 `FONT_SIZE_MIN = 8` 常量，统一所有字号输入框的最小限制

- **类型同步**
  - 新增 `TableColumnStyle`、`TableHeaderStyle` 类型
  - `TableColumn` 新增 `style`、`headerStyle` 字段
  - `TableProps` 新增 `headerStyle`、`rowNumberStyle`、`rowNumberHeaderStyle` 字段

### 🔧 改进

- 字号输入框统一增加 `precision={0}` 和 `min={FONT_SIZE_MIN}` 限制
- 背景色配置暂不开放（类型保留，后续迭代加入）

**影响范围**：`designer/src/types/index.ts`、`designer/src/pages/Designer/components/Canvas/componentRenderers/TablePreview.tsx`、`designer/src/pages/Designer/components/PropertyPanel/TableColumnSection.tsx`、`designer/src/constants/index.ts`、`designer/src/pages/Designer/components/PropertyPanel/stylePlugins/TableStylePlugin.tsx`、`designer/src/pages/Designer/components/PropertyPanel/stylePlugins/TextStylePlugin.tsx`

---

## [1.0.0] - 2026-05-28

### ✨ 初始版本

- 可视化拖拽式打印模板设计器
- 组件库：文本、表格、图片、二维码、条形码、矩形、线条
- 数据绑定与 Schema 管理
- Mock 数据支持
- 打印预览
- 页头/页脚区域支持
- 属性面板与样式配置
