# 需求文档：可覆盖聚合器（自定义聚合）与分组小计聚合类型迁移

## 1. 需求背景

当前表格合计（`TableColumnSummary`）内置了 `sum/avg/max/min/count` 五种聚合函数，其计算逻辑硬编码在 `TableRenderer` 的 `calculateSummary` 与 `getColumnSummaryRawValue` 两处 `switch` 中，用户无法扩展。但实际业务中，聚合往往有定制诉求，例如：

- 求和结果四舍五入 / 向上取整 / 向下取整
- 加权求和、条件求和、去重计数等内置类型覆盖不到的算法

现有 `customPipes` 已提供"管道可覆盖"范式（运行时传 `PipeExecutor[]`，模板只写字符串 `type` 引用，引擎优先查自定义再回退内置）。聚合函数也应做成**同等的可覆盖式配置**。

同时，分组小计（`GroupSummaryItem`）目前通过 `sourceColumn` 引用列，聚合类型"跟随列"（列配了 `summary` 才参与小计）。用户希望小计能**独立于列配置**指定聚合类型，并同样支持覆盖。

## 2. 核心需求

1. **聚合器可覆盖**：将内置 `sum/avg/max/min/count` 抽象为"聚合器执行器"（对称 `PipeExecutor`），支持运行时注册自定义聚合器，同名 `type` 覆盖内置。
2. **聚合算法任意扩展**：聚合器接收**原始值数组**（未数值化、未过滤），可做去重计数、条件/加权求和等任意算法。
3. **分组小计聚合类型迁移**：`GroupSummaryItem` 去掉对 `sourceColumn` 的依赖，改为 `dataIndex`（取数路径）+ 自带 `summary`（聚合配置），小计可独立于列配置聚合类型。
4. **向后兼容**：老模板的 `sourceColumn` 字段与"小计跟随列 `summary`"行为需继续可用，不破坏已有模板。

## 3. 使用场景

```ts
// 场景一：自定义聚合器（向上取整求和）
import { createPrintSDK } from '@jcyao/print-sdk';

const ceilSum = {
  type: 'ceil-sum',
  label: '向上取整求和',
  aggregate(values) {
    const nums = values.map(Number).filter(v => !isNaN(v));
    return Math.ceil(nums.reduce((s, v) => s + v, 0));
  },
};

const sdk = createPrintSDK({ customAggregators: [ceilSum] });

// 模板中列合计引用自定义聚合类型
// columns: [{ dataIndex: 'amount', summary: { type: 'ceil-sum', precision: 0 } }]
```

```ts
// 场景二：分组小计独立指定聚合类型（列合计 sum，小计 avg）
{
  columns: [
    { dataIndex: 'amount', title: '金额', summary: { type: 'sum', precision: 2 } },
  ],
  groupBy: {
    field: 'category',
    summaryItems: [
      { dataIndex: 'amount', label: '组均：', summary: { type: 'avg', precision: 2 } },
    ],
  },
}
```

```ts
// 场景三：老模板兼容（sourceColumn + 跟随列 summary）
// 老模板：{ sourceColumn: 'amount', label: '金额：' }
// → 读取时 dataIndex ?? sourceColumn，summary 缺省回退查列 amount 的 summary，行为不变
```

## 4. 数据契约

- 聚合器接收该列/该组在 `dataIndex` 路径上的**原始值数组 `any[]`**（未 `Number` 化、未过滤），返回 `number`（继续走 precision 格式化）或 `string`（直接输出）。
- 模板 JSON 不存储函数，聚合器通过运行时注册（实例 `customAggregators` / 全局 `configureSDK({ aggregators })`），模板只写字符串 `type` 引用。
- `TableColumnSummary.type` 由 `'sum'|'avg'|'max'|'min'|'count'` 放宽为 `string`。
- `GroupSummaryItem`：`dataIndex` 取数 + `summary` 聚合配置；`sourceColumn` 保留为 deprecated 兼容字段。
- 优先级：实例聚合器 > 全局聚合器 > 内置聚合器（与 `customPipes` / `escapeHtml` 语义一致）。

## 5. 非功能性需求

- 复用现有 `customPipes` 注册/覆盖范式与 `escapeHtml` 的"实例优先全局"配置模式，不引入新机制。
- 消除 `calculateSummary` / `getColumnSummaryRawValue` 两处重复的聚合 `switch`，收敛为单一聚合出口。
- 内置聚合器继续用 `Decimal.js` 保证数值精度。

## 6. 不做的功能（本次范围外）

- ~~聚合后取整选项 `rounding`~~（本次不新增，取整场景由自定义聚合器覆盖，后续可按需内置）
- ~~合计额外行 `SummaryExtraRowItem` 的 `sourceColumn → dataIndex` 迁移~~（额外行功能稳定，本次不动）
- ~~多级分组 / 分组排序~~（与 table-grouping 既有预留一致）
- ~~服务端预聚合透传覆盖~~
