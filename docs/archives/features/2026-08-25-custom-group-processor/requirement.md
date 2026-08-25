# 需求文档：自定义分组处理器 groupProcessor

## 1. 需求背景

上一版本实现了表格分组功能（2026-08-22-table-grouping）：按指定字段将扁平数据切分为多组，组间插入标题/小计行。但当前分组算法**硬编码**在 `groupByField()`（`sdk/src/printEngine/utils/groupBy.ts`）中，只有一种行为：

- 按单字段取值 → `String(raw)` 作 key → Map 保序 → **组顺序 = 数据中首次出现顺序**

用户无法定制分组逻辑（如按日期区间分组、按数值区间分组、多字段联合分组），也无法定制组排序（如按组小计金额降序、按自定义比较函数排）。`TableGroupConfig` 类型注释中已预留分组排序扩展位（types.ts:247-257），本需求是该预留的落地，并将扩展面进一步放宽到「整个分组策略」。

## 2. 核心需求

1. **分组策略可自定义**：调用方可注入一个分组处理函数 `groupProcessor`，接收原始数据 + 分组配置，自行完成「分组 + 组排序」，返回分组结果。
2. **一体化设计**：分组与组排序在同一个函数内由调用方全权处理，SDK 不拆分两个扩展点（简化心智模型，分组和排序本质是同一件事：数据怎么组织）。
3. **两级注入**：实例级 `createPrintSDK({ groupProcessor })` 与全局级 `configureSDK({ groupProcessor })`，实例级优先（与 escapeHtml/aggregators 的优先级规则一致）。
4. **回退语义**：未注入处理器，或处理器返回 `null`/`undefined` 时，回退内置 `groupByField`，现有模板行为零变化。
5. **函数不进模板 JSON**：处理器是运行时代码，模板 JSON 保持现有形态，不引入 `strategy` 声明（避免函数序列化问题）。

## 3. 使用场景

```ts
import { createPrintSDK } from '@jcyao/print-sdk';

const sdk = createPrintSDK({
  groupProcessor: (data, groupBy) => {
    // 只对 createdAt 字段的表格做自定义分组，其他表格回退默认
    if (groupBy.field !== 'createdAt') return null;
    // 自定义分组：按月分组
    const groups = groupByMonth(data);
    // 自定义排序：按组内金额合计降序
    groups.sort((a, b) => sumOf(b) - sumOf(a));
    return groups;
  },
});
```

典型诉求：

- **按日期区间分组**：createdAt 按月/季度聚合为组
- **按数值区间分组**：价格 0-100 / 100-500 分箱
- **多字段联合分组**：`category + brand` 组合作为组键
- **自定义组排序**：按组小计值降序、按组大小排、按业务字典序排

## 4. 兼容性要求

- **老模板零影响**：不传 `groupProcessor` 时所有路径走原 `groupByField` 逻辑，输出与现状完全一致。
- **`createPrintEngine` 签名兼容**：本次同步将工厂函数升级为重载兼容——新增 options 对象签名承载 `groupProcessor` 等新能力，旧 5 位置参数签名保留并标记 `@deprecated`，旧调用点（designer 及外部使用方）零改动。
- **函数式与将来注册表式共存**：本需求不堵注册表方案的路。将来若 Designer 需要「策略下拉选择」，可增量叠加 `customGroupStrategies` 注册表 + 模板 `strategy` 声明，优先级为：模板声明 strategy > groupProcessor > 内置默认。

## 5. 验收标准

1. 不注入处理器：分组渲染结果与上一版本逐字节一致（含分页拆分、组标题、组小计）。
2. 注入处理器返回自定义分组（含重排）：分页拆分、组标题、组小计三处使用**同一份**分组结果；行号列跨组连续（startRowIndex 由 SDK 重算，非处理器责任）。
3. 处理器返回 `null`：该表格回退默认分组，无告警。
4. 处理器抛错或返回非法结构（非数组/空数组）：`console.warn` 后回退默认分组，打印不中断。
5. `createPrintEngine` 旧签名调用行为不变；新 options 签名可用。
