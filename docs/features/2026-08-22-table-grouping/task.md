# 任务执行：表格分组（GroupBy）与分组小计

## 任务列表

### Task 1: 新增 TableGroupConfig 类型与 TableProps 扩展
- **文件**: `sdk/src/types.ts`
- **内容**:
  - 新增 `TableGroupConfig` 接口，按"标题在上、小计在下"分区：
    - `field: string`（必填，支持 `a.b`）
    - `showHeader?: boolean`（默认 true）
    - `emptyGroupLabel?: string`（归入标题分区，默认"未分组"）
    - `pipes?: PipeConfig[]`（标题键管道，复用 `PipeConfig`，失败回退原值；可取消）
    - `headerStyle?: TableSummaryStyle`
    - `showSummary?: boolean`（默认 true）
    - `summaryLabel?: string`（默认"{group}小计"）
    - `summaryStyle?: TableSummaryStyle`
    - `summaryColumns?: string[]`
    - `sort` 等排序字段预留注释，不暴露（首版不排序，组顺序=首次出现顺序）
  - `TableProps` 增加 `groupBy?: TableGroupConfig`
- **验证**: `tsc --noEmit` 通过；`groupBy` 未传时旧模板类型检查不变

### Task 2: 抽离/新增 groupBy 纯函数
- **文件**: `sdk/src/printEngine/utils/groupBy.ts`（新建，可选）或 `sdk/src/printEngine/renderers/TableRenderer.ts` 内
- **内容**:
  - 导出 `function groupByField(data: any[], field: string, emptyLabel?: string): GroupedData[]`
  - 内部复用 `getByPath(row, field)`，`null/undefined/''` 归入 `emptyLabel`
  - 返回 `GroupedData[]`：`{ key, label, items, startRowIndex }`，`label` 为 pipes 转换前的原键（管道在渲染层执行）
  - 首版不做排序，保持首次出现顺序与稳定
- **验证**: 单测覆盖：扁平→分组、空值归组、点号路径、`emptyGroupLabel`、单组、空数组；`groupByField([], 'a') → []`

### Task 3: TableRenderer 支持分组渲染
- **文件**: `sdk/src/printEngine/renderers/TableRenderer.ts`
- **内容**:
  - `render` 增加分支：无 `groupBy.field` 走原单 `tbody` 逻辑；有则：
    1. `groups = groupByField(tableData, field, emptyGroupLabel)`
    2. 单 `<table>` 下循环 `groups` 渲染 `<tbody data-group>`：
       - 标题行：`if (showHeader) renderGroupHeader(rawKey, pipes, headerStyle)` → `colspan` 跨列，`applyPipes(rawKey, pipes)` → `escapeHtml` → `headerStyle` 回退 `summaryStyle` → 默认；复用 `cellBorder/cellPadding/cellTextStyle/rowHeightPx`
       - 明细行：循环 `group.items` 渲染 `<tr>`，`rowNumber = group.startRowIndex + idx +1`（连续），列级 `pipes/style` 保持
       - 小计行：`if (showSummary) renderGroupSummary(group.items, columns, summaryLabel, summaryStyle)` → 取 `summaryColumns` 或所有 `col.summary` 列，`getColumnSummaryRawValue` + `Decimal` 格式化 + `col.summary.pipe`，拼接为"xx小计：..."；`colspan` 跨列
  - 新增 `renderGroupHeader` / `renderGroupSummary` 私有方法（形态参考 `renderSummaryExtraRows` / `calculateSummary`）
  - `calculateHeight`：有 `groupBy` 时 `headerHeight + N*rowHeight + groups.length*(headerRow+summaryRow)` 估算，兼容 `density` 缩放
  - 保持 `computeColWidths` 单次计算，`mergeColumnStyle` 不变
- **验证**: 无分组快照不变；有分组快照：`tbody` 数量=组数、`colspan`、管道转换生效、行号连续；`escapeHtml=false` 时标题不转义

### Task 4: 分页支持按组块 keepTogether
- **文件**: `sdk/src/printEngine.ts`
- **内容**:
  - `splitTableWithGap`：当 `component.props.groupBy?.field` 存在时，按组块高度 `groupBlockHeight = header + sum(rowHeights) + summary` 做分页单元：
    - `groupBlockHeight <= availableForRows` 整组放入当前页
    - 超页且组内>1 行时组内按行拆分，拆分页首行重复分组标题（避免半组无头），仍尊重 `repeatHeader`
    - 兼容 `measureTableRowHeights`：首版用估算高度预估，浏览器环境可用隐藏容器测量整表后按组切分；计入 `summaryHeight` 与分组标题/小计行高
  - 不影响无分组表格的原 `rowsCanFit` 逻辑
- **验证**: 集成用例：4 组 25 行 + 小可用高度 → 组不被拦腰截断、超大组拆分页标题重复；`splitTableWithGap` 单测

### Task 5: 常量与工具
- **文件**: `sdk/src/printEngine/constants.ts`（可选）
- **内容**: 新增 `TABLE_GROUP_DEFAULT.EMPTY_LABEL = '未分组'` 等默认值收敛（如需要）
- **验证**: `groupByField` 未传 `emptyLabel` 时回退默认值

### Task 6: 设计器类型与面板
- **文件**:
  - `designer/src/types/index.ts`（重新导出 `TableGroupConfig`）
  - `designer/src/pages/Designer/components/PropertyPanel/TableGroupSection.tsx`（新建）
  - `designer/src/pages/Designer/components/PropertyPanel/TableColumnSection.tsx`（引入 `TableGroupSection`）
- **内容**:
  - `TableGroupSection` 按"标题在上、小计在下"分区：
    - 【基础】分组开关 `Switch`、`Select` 字段（Schema 叶子字段）、
    - 【分组标题】`showHeader` Checkbox、`emptyGroupLabel` Input、`pipes` PipeConfigPanel、`headerStyle` TableStylePlugin
    - 【分组小计】`showSummary` Checkbox、`summaryLabel` Input、`summaryStyle` TableStylePlugin、`summaryColumns` 多选（`columns[].dataIndex`）
    - 【预留】排序不展示，仅注释
  - 交互：关闭开关清空 `props.groupBy`；字段未选时禁用标题/小计子项
- **验证**: 设计器 `tsc --noEmit`；面板显隐与 `props.groupBy` 透传；`generateTemplate` 含 `groupBy`

### Task 7: 设计器画布预览
- **文件**: `designer/src/pages/Designer/components/Canvas/componentRenderers/TablePreview.tsx`
- **内容**: 增加分组预览分支：复用 `groupByField`（从 `sdk/src/printEngine/utils/groupBy.ts` 共享或轻量实现），对 mock 数据分组渲染标题/小计行，样式与 SDK 一致（`density/border/headerStyle`），空数据退化为普通表
- **验证**: 设计器中开启分组 + mock 数据 25 行，预览出现 4 个标题与 4 个小计，小计值与 SDK 生成 HTML 一致

### Task 8: 文档与构建验证
- **文件**: `sdk/CHANGELOG.md`、`sdk/README.md`
- **内容**: 记录 `groupBy` 新增、兼容说明、用法示例（含 `pipes`）
- **验证**:
  - `sdk` 目录 `npm run build` 通过
  - `designer` 目录 `npm run build` 通过
  - 用参考图数据在设计器中 `createPrintSDK` 生成 HTML，目视 89.19/15.60/55.85 小计正确，分页 keepTogether 符合预期
