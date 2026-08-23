# 需求文档：表格分组（GroupBy）与分组小计

## 1. 需求背景

客户当前单据（配送单/对账单）中，表格数据需按商品类别等字段分段展示。每段包含：分组标题（如"蔬果"）、组内明细行、分组小计（如"蔬果小计：89.19"），且整体在一张大表中连续渲染，边框连续、列宽统一，可跨页。

现有表格仅支持扁平列表 + 表尾合计，无法表达"分组标题/分组小计"的层级。需要在不改变现有 `binding.path` 扁平数据契约的前提下，增加分组能力，并与设计器打通以支持可视化配置、预览、测试与发布。

参考图：`docs/features/2026-08-22-table-grouping/design.md:1.1` 的四组 25 行示例（蔬果 1-18 / 鲜货 19 / 肉禽 20-21 / 豆面制品 22-25）。

## 2. 核心需求

1. **按字段自动分组**：`groupBy.field` 指定分组字段（支持 `a.b` 点号路径），SDK 将扁平数组切分为多组，组顺序首版保持数据首次出现顺序
2. **分组标题行**：每组前插入跨列标题行（`colspan=全部列`），支持显隐 `showHeader`、样式 `headerStyle`、空值标题 `emptyGroupLabel`、管道转换 `pipes`
3. **分组小计行**：每组后插入跨列小计行（`colspan`），支持显隐 `showSummary`、标签 `summaryLabel`、样式 `summaryStyle`、小计列指定 `summaryColumns`
4. **小计值复用列级汇总**：小计列不单独配置，自动取所有配了 `column.summary` 的列（或 `summaryColumns` 指定的列），用同一套 `Decimal.js` 聚合（`sum/avg/max/min/count`）+ `precision/prefix/suffix/pipe`
5. **标题管道**：分组键支持 `pipes: PipeConfig[]` 复用现有 Pipe 系统（如字典映射、日期格式化），失败回退原值；若认为改动大可取消
6. **物理结构**：单 `<table>` + 多 `<tbody>`，列宽只算一次，边框连续，`density/border/rowNumber` 自动生效，行号连续 1..N
7. **分页**：组作为 `keepTogether` 块，优先整组换页；超大组可在组内按行拆分，拆分页重复分组标题
8. **设计器同步**：属性面板新增分组配置区，画布预览分组效果，模板 JSON 透传 `props.groupBy`，与 SDK 同步发布

## 3. 使用场景

```ts
// 场景一：最简分组（按 category 分组，标题+小计默认样式）
{
  columns: [
    { title: '商品名', dataIndex: 'name' },
    { title: '应付金额', dataIndex: 'amount', summary: { type: 'sum', precision: 2 } }
  ],
  groupBy: { field: 'category' } // → 自动分组，标题为原值，小计为"xx小计：sum"
}

// 场景二：标题管道 + 自定义样式
{
  groupBy: {
    field: 'status',
    pipes: [{ type: 'dict', options: { map: { '01': '蔬果', '02': '鲜货' } } }],
    headerStyle: { backgroundColor: '#f0f5ff', fontWeight: 'bold' },
    summaryStyle: { backgroundColor: '#fffbe6' },
    emptyGroupLabel: '未分类'
  }
}

// 场景三：仅小计列指定
{
  groupBy: {
    field: 'category',
    summaryColumns: ['amount'], // 只对 amount 列做小计
    summaryLabel: '{group}小计'
  }
}
```

设计器：在表格属性面板开启分组开关 → 选择分组字段（来自 Schema 叶子字段）→ 配置标题/小计显隐、管道、样式、小计列，画布实时预览分组标题与"xx小计：89.19"。

## 4. 数据契约

- 输入：`binding.path` 仍指向扁平 `any[]`，模板 JSON 不存储函数
- 分组键取值：`getByPath(row, field)`，`null/undefined/''` 归入 `emptyGroupLabel`（默认"未分组"）
- 排序：首版不做排序，组顺序 = 首次出现顺序；预留后续 `sortField/sortOrder` 或运行时 `groupSortComparator` 扩展
- 向后兼容：`groupBy` 可选，未配置时为普通表格，行为零变化

## 5. 非功能性需求

- 最大复用现有能力：`TableColumn.summary`、`TableSummaryStyle`、`density`、`Decimal.js`、`summaryExtraRows` 跨列行、`measureTableRowHeights`
- 单表多 tbody，列宽/边框一致性由 SDK 保证
- 设计器与 SDK 同步发布，便于测试与发布（按评论要求）

## 6. 不做的功能（本次范围外）

- ~~多级嵌套分组~~
- ~~分组排序规则~~（首版不做，预留口子，后续可配置自定义排序函数）
- ~~分组折叠/展开交互~~
- ~~服务端预聚合透传覆盖~~
- ~~按组内某字段排序的声明式配置~~（与排序预留一起延后）
