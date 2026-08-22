# 方案设计：表格分组（GroupBy）与分组小计

## 1. 需求解读

### 1.1 参考图抽象

参考图为配送/对账单据，表格结构可抽象为三段式重复单元：

```
[分组标题行]  蔬果                          ← 跨所有列合并（colspan），单独背景/字重
  ├─ 1  【普通】白萝卜#     6.3斤  0.92  5.80
  ├─ 2  【普通】胡萝卜      1.07斤 1.60  1.71
  ├─ ... 18 行明细
[分组小计行]  蔬果小计：89.19               ← 跨所有列合并，文本拼接“组名+小计+数值”

[分组标题行]  鲜货/水发发私房菜
  └─ 19  N1 鲜猪脑花       5个  3.12  15.60
[分组小计行]  鲜货/水发发私房菜小计：15.60

[分组标题行]  肉禽蛋产私房菜
  ├─ 20 白壳鸡蛋 ... / 21 龙骨 ...
[分组小计行]  肉禽蛋产私房菜小计：55.85
...
```

核心特征：
- **单级分组**：按某字段（如 `category`）将扁平列表切分为 N 组，组内顺序保持原序或按组名排序。
- **两类插入行**：分组标题行（组头）和分组小计行（组尾），均为 `colspan=全部列` 的跨列行。
- **小计列可配**：小计值来源于列级 `TableColumn.summary`（如 `应付金额 sum`），不是硬编码某列。
- **连续渲染**：视觉上是一张大表，边框连续、列宽统一，不是多个独立表格拼接。

### 1.2 约束（用户明确）

- 数据结构不做大的变动，沿用 `binding.path` 指向扁平数组的现有契约
- 新增 `groupConfig` 配置驱动分组，按配置属性完成分组
- 分组标题渲染复用/借鉴现有 `summaryExtraRows` 跨列行逻辑
- 分组小计/额外行逻辑复用现有 `summary` / `calculateSummary` 体系，数据被拆成多个小表数据集再合在一起渲染

## 2. 目标与非目标

### 目标
- SDK 层支持 `groupBy` 分组展示，默认关闭，开启后按字段自动分组 + 标题 + 小计
- 最大复用现有能力：`TableColumn.summary`、`TableSummaryStyle`、`density`、`border`、`rowNumber`、`Decimal.js` 聚合、`summaryExtraRows` 渲染、`measureTableRowHeights` 测量
- 分页友好：组尽可能 `keepTogether`，跨页时行为可预期
- 单表多 `<tbody>` 的物理结构，列宽只算一次，边框连续

### 非目标（本次不做）
- 多级嵌套分组（`category → subCategory` 两级）—— 接口预留，不实现
- 分组折叠/展开交互（前端交互状态）
- 组内再排序（组内保持原序）
- 设计器 UI（第一版 SDK 先上，设计器预留配置透传）
- 分组聚合类型超出 `sum/avg/max/min/count` 的扩展
- 服务端预聚合数据的透传覆盖（`summary: 89.19` 这种后端算好直接用的模式，预留 `groupSummary` 覆盖字段，不在首版实现）

## 3. 总体架构

```
扁平 data: any[]  (binding.path → context.getValueByPath)
        │
        ▼
groupByField(data, groupConfig.field)  ← 复用 getByPath，支持 "a.b" 路径
        │
        ▼
Map<string, any[]>  groups + order[]
        │
        ▼
TableRenderer.render：
  single <table>
    <thead>  (一次)
    <tbody group="蔬果">
      <tr.group-header colspan>  ← 复用 renderSummaryExtraRows 样式
      <tr> ... 18 行明细（含 pipes、列样式）
      <tr.group-summary colspan> ← 复用 calculateSummary(groupItems, col)
    </tbody>
    <tbody group="鲜货..."> ...
        │
        ▼
PrintEngine.splitTableWithGap：
  按“组块”而非“单行”做分页单元，尽量整组换页
```

## 4. 数据模型

### 4.1 TableProps 新增字段

```ts
// sdk/src/types.ts

/**
 * 表格分组配置
 * 单级分组，按指定字段将扁平数据切分为多组，组间插入标题/小计行
 */
export interface TableGroupConfig {
  /** 分组字段，支持点号路径，如 "category" / "product.type"，必填 */
  field: string;

  /** 分组标题排序：'asc' | 'desc' | 'none'，默认 'none'（保持首次出现顺序） */
  sort?: 'asc' | 'desc' | 'none';

  /** 是否显示分组标题行，默认 true */
  showHeader?: boolean;

  /** 是否显示分组小计行，默认 true */
  showSummary?: boolean;

  /**
   * 分组标题模板，支持占位符 {value} / {group} / {count}
   * 默认 "{value}"，示例 "【{value}】" / "{value}（{count}项）"
   */
  headerFormatter?: string;

  /**
   * 分组小计标签模板，支持占位符 {group} / {value} / {count}
   * 默认 "{group}小计"
   * 最终文本为：模板 + 汇总列拼接（如 "蔬果小计：89.19"）
   * 若模板已包含数值占位，可不拼接
   */
  summaryLabel?: string;

  /** 分组标题行样式，复用 TableSummaryStyle 形态 */
  headerStyle?: TableSummaryStyle;

  /** 分组小计行样式，复用 TableSummaryStyle 形态 */
  summaryStyle?: TableSummaryStyle;

  /** 空值分组的标题，默认 "未分组" */
  emptyGroupLabel?: string;

  /**
   * 小计列指定（可选）
   * 不传时自动取所有配了 column.summary 的列做小计
   * 传了则只对指定 dataIndex 的列做小计
   */
  summaryColumns?: string[];
}

export interface TableProps {
  // ... 现有字段不变

  /** 分组配置，未设置时为普通表格 */
  groupBy?: TableGroupConfig;
}
```

### 4.2 分组后内部结构

```ts
interface GroupedData {
  key: string;        // 分组键，已 escapeHtml 前的原始值
  label: string;      // 展示用标题（经 headerFormatter 格式化）
  items: any[];       // 组内明细
  startRowIndex: number; // 组在原扁平数组中的起始序号（用于 rowNumber 连续）
}
```

`groupByField` 为纯函数，无副作用，便于单测：

```ts
function groupByField(data: any[], field: string, sort: 'asc'|'desc'|'none'): GroupedData[]
```

- 取值：`getByPath(row, field)`，`null/undefined/''` 归入 `emptyGroupLabel`
- 顺序：`none` 时按首次出现顺序；`asc/desc` 按 `key` 字符串 `localeCompare('zh-CN')`
- 保持稳定：同 key 的 items 保持原序

## 5. 渲染设计

### 5.1 物理结构：单表多 tbody

```html
<table class="print-table" style="...">
  <thead>...</thead>

  <!-- 无分组时：原有单 tbody -->
  <!-- 有分组时：每组一个 tbody -->
  <tbody data-group="蔬果">
    <tr class="group-header"><td colspan="8" style="...">蔬果</td></tr>
    <tr><td>1</td><td>【普通】白萝卜#</td>...</tr>
    ...
    <tr class="group-summary"><td colspan="8" style="...">蔬果小计：89.19</td></tr>
  </tbody>

  <tbody data-group="鲜货/水发发私房菜">
    <tr class="group-header"><td colspan="8">鲜货/水发发私房菜</td></tr>
    ...
    <tr class="group-summary"><td colspan="8">鲜货/水发发私房菜小计：15.60</td></tr>
  </tbody>
</table>
```

选择单表多 tbody 而非多表拼接的理由：
- 列宽 `computeColWidths` 只需对 `displayColumns` 计算一次，各组列对齐天然一致
- `borderCollapse: collapse` 边框连续，无需处理小表间双边框
- 语义上仍是一张表，利于打印样式和无障碍

### 5.2 分组标题行：复用 summaryExtraRows

标题行与现有额外行同构，复用点：
- 样式：`headerStyle` → `backgroundColor / fontWeight / fontSize / textAlign`，缺省回退 `TableSummaryStyle` 默认值（`#f5f5f5 / bold`），与 `renderSummaryExtraRows` 一致
- 结构：`<tr><td colspan="${colCount}" style="${cellBorder} ${cellPadding} ${cellTextStyle} background...">text</td></tr>`
- 高度：`rowHeightPx`（与数据行同高，受 `density` 影响），计入分页测量
- 转义：`escapeHtml(label, context.escapeHtml)` 复用现有转义开关

### 5.3 分组小计行：复用 calculateSummary

小计行不是硬编码某列，而是复用列级汇总配置：

```ts
// 每组的小计文本生成
const summaryCols = groupConfig.summaryColumns
  ? columns.filter(c => groupConfig.summaryColumns.includes(c.dataIndex))
  : columns.filter(c => !!c.summary);

const parts = summaryCols.map(col => {
  const raw = getColumnSummaryRawValue(groupItems, col); // 复用现有
  if (raw == null) return null;
  // 复用 calculateSummary 的格式化：precision / prefix / suffix / pipe
  const formatted = formatSummaryValue(raw, col.summary, context);
  return `${col.title}：${formatted}`; // 或根据 summaryLabel 模板决定
}).filter(Boolean);

const text = `${label}${summaryLabel}: ${parts.join('  ')}`;
// 例："蔬果小计：应付金额 89.19  数量 12.5"
```

- 单列小计时：`parts` 只有一个，效果即 "蔬果小计：89.19"（与参考图一致）
- 多列小计时：自动拼接多列，用户无需为分组单独配一套规则
- `col.summary.type` 支持 `sum/avg/max/min/count`，`precision/prefix/suffix/pipe` 全部复用
- 空组或组内无数值：返回 "-"，与表尾合计行为一致

### 5.4 行号连续

`showRowNumber` 开启时，分组不重置序号：

```
蔬果  1..18
鲜货  19
肉禽  20..21
...
```

实现：`startRowIndex` 按分组累加，数据行 `rowNumber = group.startRowIndex + rowIndexInGroup + 1`，复用现有 `_startRowIndex` 注入逻辑。

### 5.5 密度/边框/列样式

- `density`：标题/小计行的 `cellPadding / lineHeight` 与数据行一致，自动紧凑
- `border`：标题/小计行同样走 `cellBorder`，保证与数据行边框风格统一
- `headerStyle / column.style / rowNumberStyle` 不受分组影响

## 6. 分页设计

### 6.1 分页单元从“行”提升为“组块”

现有 `splitTableWithGap` 按行高累加计算 `rowsCanFit`。分组后引入"组块高度"概念：

```
groupBlockHeight = headerHeight(若 showHeader) + sum(rowHeights of groupItems) + summaryHeight(若 showSummary)
```

- 若 `groupBlockHeight <= availableForRows`：整组放入当前页，不拆分
- 若 `groupBlockHeight > availableForRows` 且组内行数 > 1：组内按行拆分，但需满足：
  - 拆分页的首行必须带分组标题（重复标题，避免"半组无头"）
  - 拆分后每页若 `repeatHeader=true`，仍按现有逻辑重复 `<thead>`
- 若组只有 1 行且仍放不下：按现有"至少放 1 行避免死循环"兜底，允许溢出警告

### 6.2 测量

复用 `measureTableRowHeights`，但需扩展为"按组测量"：

- 首版简化：用同一套估算高度（`headerHeight + rowHeight * count + summaryHeight`）做分页预估，浏览器环境下仍可用隐藏容器测量整表后按组切分，确保与现有测量器兼容
- 精确测量（可选增强）：对每组单独渲染隐藏容器测量，取 `headerHeight/groupRows/summaryHeight` 精确值

### 6.3 兼容现有分页

- `repeatHeader`、`showHeader`、`summaryMode`（`page/total`）保持原语义
- 分组表格的表尾合计（`summaryDisplay !== 'none'` 的 `tfoot`）仍按 `summaryMode` 在最后一页渲染
- 分组小计不受 `summaryMode` 影响，始终跟组走

## 7. 样式与设计器

### 7.1 样式优先级

```
分组标题：groupConfig.headerStyle > TableProps.summaryStyle > 默认 (#f5f5f5 / bold)
分组小计：groupConfig.summaryStyle > TableProps.summaryStyle > 默认
```

与现有 `summaryStyle` 回退链一致，避免引入新常量。

### 7.2 设计器（本期不做，预留）

- 属性面板新增"分组"折叠区：字段下拉（来自 `SchemaDictionary` 的叶子字段）、排序、标题/小计开关、模板输入、样式拾色器
- 模板 JSON 中 `props.groupBy` 透传，`loadTemplate`/`generateTemplate` 无需改动
- 预留 `table-group` 预览：设计器画布对表格组件按 mock 数据做分组预览（复用同一 `groupByField`）

## 8. 改动范围

| 文件 | 改动内容 |
|---|---|
| `sdk/src/types.ts` | **新增** `TableGroupConfig` 接口，`TableProps` 增加 `groupBy?: TableGroupConfig` |
| `sdk/src/printEngine/renderers/TableRenderer.ts` | 新增 `groupByField` 纯函数；`render` 中分支：无 `groupBy` 走原逻辑，有则按组循环渲染；新增 `renderGroupHeader` / `renderGroupSummary`（复用 `renderSummaryExtraRows` / `calculateSummary` 形态）；`calculateHeight` 增加分组行高度估算 |
| `sdk/src/printEngine.ts` | `splitTableWithGap` 支持按组块分页（`keepTogether` 优先，组内可拆）；`measureTableRowHeights` 注释扩展；`calculateTableHeaderHeight/RowHeight` 保持不变 |
| `sdk/src/printEngine/constants.ts` | （可选）新增 `TABLE_GROUP_DEFAULT` 常量，收敛空组标签等默认值 |
| `sdk/CHANGELOG.md` | 记录新增 `groupBy` 功能及兼容说明 |
| `sdk/README.md` | 补充分组用法示例 |

## 9. 向后兼容与迁移

- `TableProps.groupBy` 为可选，未配置时 `TableRenderer.render` 完全走原分支，分页、样式、小计行为零变化
- 新增文件/函数均为内部复用，不暴露破坏性 API
- Mock 数据、已有模板无需迁移
- 若用户传入 `groupBy.field` 但数据中该字段不存在，所有行归入"未分组"组，不抛错，仅 `console.warn`

## 10. 边界与异常

| 场景 | 处理 |
|---|---|
| `groupBy.field` 为空或不存在 | 视为未分组，退化为普通表格；`console.warn` |
| 字段值为 `null/undefined/''` | 归入 `emptyGroupLabel`（默认"未分组"） |
| 单组数据量过大（超一页） | 组内按行拆分，拆分页重复分组标题 |
| 组数过多（>100 组） | 不限制，分页按组块依次处理；性能与行数线性相关 |
| 只有一个分组 | 退化为标题+明细+小计，等价于"带标题的普通表" |
| `summaryColumns` 指定的列无 `summary` | 该列跳过，不计入小计文本 |
| 所有列 `hidden` 或 `columns=[]` | 按现有空表格逻辑渲染"暂无数据"，分组不生效 |
| `escapeHtml=false` | 标题/小计文本同样尊重开关，不转义 |

## 11. 验证方案

### 单测（vitest）
- `groupByField`：扁平→分组、空值归组、`asc/desc/none` 排序、点号路径、`emptyGroupLabel`
- `computeColWidths` / `mergeColumnStyle` 保持原有单测通过
- 渲染快照：无分组 vs 有分组的 HTML 结构（`tbody` 数量、`colspan`、`group-header/summary` 类名）

### 集成验证
- 用参考图数据（4 组 25 行）在 `designer` 中通过 `createPrintSDK` 生成 HTML，目视校验标题/小计位置、金额 89.19/15.60/55.85 是否与 `sum` 计算一致
- 分页用例：把可用高度调小，验证组不被"拦腰截断"，超大组拆分页是否重复标题

## 12. 不做的替代方案说明

- **真拆多表**：已评估，列宽与边框成本高，放弃
- **数据层预分组**：要求 `data: {group, items}[]` 的方案，破坏 `binding.path` 契约且无法复用 `column.summary`，放弃
- **新组件 `group-table`**：复用率为 0，维护双份 `TableRenderer`，放弃
