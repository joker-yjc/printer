# 方案设计：可覆盖聚合器与分组小计聚合类型迁移

## 1. 需求解读

表格合计的聚合算法（`sum/avg/max/min/count`）目前硬编码在 `TableRenderer.calculateSummary` 与 `getColumnSummaryRawValue` 两处重复的 `switch` 中，不可扩展。分组小计通过 `GroupSummaryItem.sourceColumn` 引用列、聚合类型"跟随列"，无法独立配置。

本次目标是把聚合抽象为与 `PipeExecutor` 对称的"聚合器执行器"，支持运行时注册 + 同名覆盖；同时让分组小计脱离列依赖、自带聚合配置，并做 `sourceColumn` 向后兼容。

## 2. 目标与非目标

### 目标
- 新增 `AggregatorExecutor`（对称 `PipeExecutor`），内置 `sum/avg/max/min/count`，支持实例/全局两级注册、同名覆盖
- 聚合器接收**原始值数组**（未数值化、未过滤），支持任意算法（去重计数、加权/条件求和、取整等）
- 消除两处重复 `switch`，收敛为单一聚合出口
- `GroupSummaryItem` 由 `sourceColumn` 迁移为 `dataIndex + summary`，小计独立配置聚合类型
- 向后兼容老模板（`sourceColumn` 字段 + 小计跟随列 `summary`）

### 非目标（本次不做）
- 聚合后取整选项 `rounding`（round/floor/ceil）—— 取整场景由自定义聚合器覆盖，后续按需内置
- 合计额外行 `SummaryExtraRowItem` 的 `sourceColumn → dataIndex` 迁移 —— 额外行功能稳定，本次不动
- 多级分组、分组排序（沿用 table-grouping 既有预留）

## 3. 总体架构

```
内置聚合器（模块加载时注册）
  sdk/src/aggregators/builtins.ts → registerAggregator(sum/avg/max/min/count)

全局聚合器
  configureSDK({ aggregators }) → SDKGlobalConfig.aggregators

实例聚合器
  createPrintSDK({ customAggregators }) → PrintSDKOptions.customAggregators
        │
        ▼
PrintEngine 构造时合并：customAggregatorsMap（实例）+ 全局查表 + 内置 registry
        │
        ▼
RenderContext.executeAggregate(type, values, options)
  查找优先级：实例 > 全局 > 内置
        │
        ▼
TableRenderer.computeSummary(data, dataIndex, summary, context)
  取原始值数组 → executeAggregate → 结果格式化（number 走 precision/prefix/suffix/pipe，string 直接输出）
        ▲
        ├── calculateSummary（列合计，保留签名，内部走 computeSummary）
        ├── getColumnSummaryRawValue（额外行/小计原始值，保留签名）
        └── buildGroupSummaryText（分组小计：dataIndex ?? sourceColumn + item.summary 回退列 summary）
```

## 4. 数据模型

### 4.1 聚合器执行器

```ts
// sdk/src/aggregators/types.ts

/**
 * 聚合器执行器接口（与 PipeExecutor 对称）
 * 负责对一列/一组的原始值执行聚合计算
 */
export interface AggregatorExecutor {
  /** 聚合类型标识，'sum' | 'avg' | 'max' | 'min' | 'count' | 自定义 */
  type: string;
  /** 显示名称 */
  label: string;
  /**
   * 执行聚合
   * @param values 该 dataIndex 路径上的原始值数组（未 Number 化、未过滤）
   * @param options 聚合选项（来自 TableColumnSummary.options）
   * @returns number 继续走 precision 格式化；string 作为最终文本直接输出；undefined 表示无效（无数值），统一落 '-'
   */
  aggregate(values: any[], options?: Record<string, any>): number | string | undefined;
}
```

### 4.2 内置聚合器（sdk/src/aggregators/builtins.ts）

```ts
/**
 * 数值化：Number(val) + 过滤 NaN，与现有 calculateSummary 语义完全一致
 * 注：Number(null)=0、Number('')=0、Number(undefined)=NaN（被过滤）
 * 该行为沿用现状，若视为缺陷另开 bug 单，不在本次修正
 */
function toNumericValues(values: any[]): number[] {
  return values.map(v => Number(v)).filter(v => !isNaN(v));
}

export const SumAggregator: AggregatorExecutor = {
  type: 'sum', label: '求和',
  aggregate(values) {
    return toNumericValues(values).reduce((s, v) => s.plus(v), new Decimal(0)).toNumber();
  },
};
// avg / max / min / count 同理，内部用 Decimal 保精度
```

- `sum`：Decimal 累加后 `toNumber()`
- `avg`：Decimal 累加 `/ length`
- `max` / `min`：`Decimal.max/min`
- `count`：非空数值个数 `toNumericValues(values).length`

### 4.3 TableColumnSummary 改动

```ts
export interface TableColumnSummary {
  type: string;                          // 原 'sum'|'avg'|'max'|'min'|'count' 放宽为 string
  precision?: number;                    // 小数位数，默认 2
  prefix?: string;
  suffix?: string;
  pipe?: PipeConfig;                     // 聚合结果格式化后的单管道（语义不变）
  options?: Record<string, any>;         // 新增：传给聚合器的选项
}
```

### 4.4 GroupSummaryItem 改动

```ts
export interface GroupSummaryItem extends DataField {
  label?: string;
  dataIndex?: string;              // 新增：取数路径（替代 sourceColumn，可选以兼容老模板）
  summary?: TableColumnSummary;    // 新增：自带聚合配置；缺省回退查列 summary
  /** @deprecated 使用 dataIndex 替代，向后兼容 */
  sourceColumn?: string;
}
```

- `dataIndex` 负责"取哪一列/字段的数据"，`summary` 负责"怎么聚合"，两者解耦
- `pipes`（继承自 `DataField`）语义不变：在聚合后的原始数值上执行（现状行为）

## 5. 注册与查找

### 5.1 注册渠道

```ts
// 全局：sdk/src/config/globalConfig.ts
export interface SDKGlobalConfig {
  escapeHtml?: boolean;
  aggregators?: AggregatorExecutor[];   // 新增
}

// 实例：sdk/src/PrintSDK.ts
export interface PrintSDKOptions {
  customPipes?: PipeExecutor[];
  escapeHtml?: boolean;
  customAggregators?: AggregatorExecutor[];   // 新增
}
```

### 5.2 查找优先级

实例 `customAggregators` > 全局 `aggregators` > 内置 registry（与 `customPipes`/`escapeHtml` 语义一致）。同名 `type` 覆盖，覆盖时 `console.warn`。

### 5.3 执行入口（printEngine.ts）

```ts
// RenderContext 新增方法
executeAggregate(type: string, values: any[], options?: Record<string, any>): number | string | undefined;
```

- 找不到执行器时 `console.warn` 并返回 `undefined`，上层统一按现状处理为 `'-'`
- 自定义聚合器执行抛错时 `console.error` 并回退 `undefined`（隔离故障，不阻塞渲染）

## 6. TableRenderer 重构

### 6.1 收敛为单一聚合出口

```ts
/**
 * 统一聚合出口：输入数据 + 取数路径 + 聚合配置
 * @returns raw 聚合器原始返回（number 或 string，供额外行/小计 pipes 消费）；text 格式化文本
 */
private computeSummary(
  data: any[],
  dataIndex: string,
  summary: TableColumnSummary,
  context: RenderContext
): { raw: number | string | null; text: string }
```

逻辑：
1. 取原始值数组：`data.map(row => getByPath(row, dataIndex))`
2. 聚合：`const agg = context.executeAggregate(summary.type, rawValues, summary.options)`
3. `typeof agg === 'number'` → `raw = agg`，`text` 走 precision/prefix/suffix/pipe（复用现状格式化逻辑）
4. `typeof agg === 'string'` → `raw = agg`、`text = agg`（直接输出，不套 precision/pipe；`raw` 承载该字符串供额外行/带管道小计消费）
5. `agg === undefined`（找不到/执行失败）→ `text = '-'`，`raw = null`

### 6.2 保留的两个签名

- `calculateSummary(data, column, context)`：改为 `return this.computeSummary(data, column.dataIndex, column.summary!, context).text`（列合计出口）
- `getColumnSummaryRawValue(data, column, context)`：**签名新增 `context` 参数**（现状为 `(data, column)`），改为 `return this.computeSummary(data, column.dataIndex, column.summary!, context).raw`（额外行/小计原始值出口）。该方法是 `private`，仅内部调用方（`renderSummaryExtraRows`、`buildGroupSummaryText`）需同步传入 `context`，不影响外部 API

### 6.3 分组小计 buildGroupSummaryText 重构

```ts
for (const item of summaryItems) {
  const ref = item.dataIndex ?? item.sourceColumn;   // 兼容老字段
  let summary = item.summary;
  if (!summary) {                                     // 老模板：回退查列
    const col = displayColumns.find(c => c.dataIndex === ref);
    if (!col || !col.summary) continue;               // 保持现状「列须配 summary」跳过语义
    summary = col.summary;
  }
  // 有 pipes：原始值 + 逐管道（现状语义不变）
  // 无 pipes：computeSummary(group.items, ref, summary, context).text
}
```

## 7. 改动范围

| 文件 | 改动内容 |
|---|---|
| `sdk/src/aggregators/types.ts` | **新增** `AggregatorExecutor` 接口 |
| `sdk/src/aggregators/builtins.ts` | **新增** `toNumericValues` + 内置 5 个聚合器 |
| `sdk/src/aggregators/registry.ts` | **新增** `registerAggregator` / `getAggregator` / `getRegisteredAggregatorTypes`，模块加载时注册内置 |
| `sdk/src/aggregators/index.ts` | **新增** 统一导出 |
| `sdk/src/types.ts` | `TableColumnSummary.type` 放宽为 `string`、新增 `options`；`GroupSummaryItem` 新增 `dataIndex`/`summary`、`sourceColumn` 标 deprecated |
| `sdk/src/config/globalConfig.ts` | `SDKGlobalConfig` 新增 `aggregators` |
| `sdk/src/PrintSDK.ts` | `PrintSDKOptions` 新增 `customAggregators`，构造时透传 `createPrintEngine` |
| `sdk/src/printEngine.ts` | `PrintEngine` 新增 `customAggregatorsMap` + `executeAggregate`，构造接收自定义聚合器；`RenderContext` 暴露 `executeAggregate` |
| `sdk/src/printEngine/types.ts` | `RenderContext` 接口新增 `executeAggregate` |
| `sdk/src/printEngine/renderers/TableRenderer.ts` | 新增 `computeSummary`；`calculateSummary`/`getColumnSummaryRawValue` 改为委托；`buildGroupSummaryText` 迁移 `dataIndex`+`summary` 并兼容 `sourceColumn` |
| `sdk/src/sdk.ts` | 导出 `AggregatorExecutor` 及相关类型 |
| `designer/src/pages/Designer/components/PropertyPanel/TableGroupSection.tsx` | 小计数据项由 `sourceColumn` 下拉改为 `dataIndex` 下拉 + 聚合类型/精度配置 |
| `designer/src/types/index.ts` | 重新导出 `AggregatorExecutor`（如需） |
| `sdk/README.md` / `sdk/CHANGELOG.md` | 补充自定义聚合器用法与兼容说明 |

## 8. 向后兼容与迁移

- 老模板 `summaryItems: [{ sourceColumn: 'amount', label: '金额：' }]` → `ref = sourceColumn`，`summary` 缺省回退查列，行为零变化
- 老模板列合计 `summary: { type: 'sum', precision: 2 }` → 内置 `sum` 聚合器，格式化一致
- `TableColumnSummary.type` 放宽为 `string` 不破坏现有 union 值
- 未配置 `customAggregators` / `aggregators` 时，行为与现状完全一致
- 额外行 `SummaryExtraRowItem.sourceColumn` 保持原样，不受影响

## 9. 边界与异常

| 场景 | 处理 |
|---|---|
| 聚合器 `type` 找不到 | `console.warn`，返回 `'-'`（同现状 default 分支） |
| 自定义聚合器抛错 | `console.error`，回退 `'-'`，不阻塞渲染 |
| 聚合器返回 `string` | 主合计/无管道小计直接输出；额外行/带管道小计经 `raw` 承载同样可展示 |
| `dataIndex` 路径不存在或列无数值 | 内置聚合器数值化后为空 → 返回 `undefined` → 统一落 `'-'`（沿用现状「无数值 → '-'」语义） |
| 老模板 `sourceColumn` 指向的列被删 | `ref` 找不到列且无 `summary` → 跳过（同现状 `continue`） |
| `summaryItems` 未配置 | 仅渲染标签，不做汇总（现状行为不变） |

## 10. 验证方案

### 单测（vitest）
- 内置聚合器：`sum/avg/max/min/count` 的 `toNumericValues` 过滤语义（null/''/undefined/字符串数字）
- 自定义聚合器：同名覆盖内置、实例优先全局、找不到回退
- `computeSummary`：number 走 precision、string 直接输出、undefined 返回 '-'
- `buildGroupSummaryText`：新 `dataIndex+summary` 与老 `sourceColumn` 两条路径输出一致

### 集成验证
- 用 table-grouping 参考数据（4 组 25 行）跑通列合计与分组小计，核对金额与 `sum` 一致
- 注入自定义聚合器（如向上取整求和），验证列合计与小计均生效
- 加载老模板（`sourceColumn`）验证行为不变

## 11. 不做的替代方案说明

- **管道实现聚合**：pipe 是 1:1 单值转换，聚合是 n:1 多值归约，语义不匹配，放弃
- **`number[]` 输入**：过滤/数值化后传入，做不了去重计数等需要原始值的聚合，放弃
- **聚合器返回 `Decimal`**：需向外部暴露 `decimal.js` 类型，增加使用者负担，改为 `number | string` 更友好
- **额外行一起迁移**：额外行功能稳定且已上线，扩大改动面、引入无谓迁移风险，本次不动
