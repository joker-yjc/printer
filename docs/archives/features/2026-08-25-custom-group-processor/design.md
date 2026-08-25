# 方案设计：自定义分组处理器 groupProcessor

## 1. 需求解读

分组算法硬编码在 `groupByField()`，组顺序固定为首次出现顺序。需求是把「分组 + 组排序」整体开放给调用方：注入一个运行时函数 `groupProcessor`，全权决定数据如何组织成组；返回 null 时回退内置实现。同时将 `createPrintEngine` 工厂签名升级为 options 对象形态（重载兼容旧签名）。

## 2. 目标与非目标

### 目标
- 新增 `GroupProcessor` 类型：`(data, groupBy) => GroupedData[] | null | undefined`
- 实例级（`createPrintSDK`）与全局级（`configureSDK`）两级注入，实例级优先
- 4 个 `groupByField` 调用点统一收口，保证分页拆分/渲染/小计分组一致
- `startRowIndex` 由 SDK 统一重算，处理器无需感知行号
- `createPrintEngine` 重载：新 options 签名 + 旧 5 参数签名兼容

### 非目标（本次不做）
- 模板 JSON 不引入 `strategy` 声明（注册表方案将来增量叠加，不堵路）
- 多级分组（沿用 table-grouping 既有预留）
- 不修改 `groupByField` 内置算法本身（默认行为保持不变）
- 不动 `SummaryExtraRowItem` 等无关模块

## 3. 总体架构

```
全局处理器
  configureSDK({ groupProcessor }) → SDKGlobalConfig.groupProcessor

实例处理器
  createPrintSDK({ groupProcessor }) → PrintSDKOptions.groupProcessor
        │
        ▼
PrintSDK 构造时合并：实例 groupProcessor ?? 全局 groupProcessor（函数是单值，非数组，实例直接覆盖）
        │
        ▼
PrintEngine 构造（工厂归一化后的 PrintEngineOptions）→ this.groupProcessor
        │
        ▼
RenderContext 新增 groupData(data, groupBy) 方法（统一收口）
  ├─ 未配置处理器 → groupByField(data, groupBy.field, emptyGroupLabel)
  ├─ 处理器返回非空 → normalizeGroups（校验 + 重算 startRowIndex）→ 返回
  └─ 处理器返回 null/undefined → 回退 groupByField
  └─ 处理器抛错/返回非法 → console.warn → 回退 groupByField
        │
        ▼
调用点改造（4 处全部改走 groupData）
  ├─ printEngine.ts:1228（分页拆分 splitGroupedTableWithGap）
  ├─ TableRenderer.ts:364（分组渲染）
  ├─ TableRenderer.ts:368（总计回算：全量数据分组）
  └─ TableRenderer.ts:872（calculateHeight 分组高度测算）
```

**注意**：printEngine.ts:1228 在 `PrintEngine` 内部，可直接调私有 `groupData`；TableRenderer 三处通过 `context.groupData()` 调用。四处最终汇聚到同一实现，这是本次改造的核心——若任何一处仍直连 `groupByField`，会出现「分页按默认分组、渲染按自定义分组」的不一致 bug。

## 4. 数据模型

### 4.1 处理器类型（sdk/src/types.ts）

```ts
import type { GroupedData } from './printEngine/utils/groupBy';

/**
 * 自定义分组处理器
 * 接收原始数据与分组配置，由调用方自行完成分组与组排序
 *
 * 契约：
 * 1. key 唯一（重复 key 时 SDK 将后者合并进前者）
 * 2. items 引用原始行对象（不要克隆/改造行数据，分页与行号依赖原始引用）
 * 3. 返回数组的顺序即最终组的顺序
 *
 * @param data 当前表格的扁平数据（已过滤，与默认分组输入一致）
 * @param groupBy 模板中的分组配置（TableGroupConfig 原样透传）
 * @returns 分组结果；返回 null/undefined 表示回退内置按字段分组
 */
export type GroupProcessor = (
  data: any[],
  groupBy: TableGroupConfig
) => GroupedData[] | null | undefined;
```

### 4.2 配置入口

```ts
// PrintSDKOptions（PrintSDK.ts）追加
/** 自定义分组处理器，覆盖全局配置；返回 null/undefined 时回退内置分组 */
groupProcessor?: GroupProcessor;

// SDKGlobalConfig（config/globalConfig.ts）追加
/** 全局自定义分组处理器（实例级可覆盖） */
groupProcessor?: GroupProcessor;
```

合并规则与 escapeHtml 一致（单值覆盖，非数组拼接）：

```ts
this.groupProcessor = options?.groupProcessor ?? getGlobalConfig().groupProcessor;
```

### 4.3 createPrintEngine 重载（printEngine.ts）

```ts
/**
 * 引擎选项（新签名专用）
 */
export interface PrintEngineOptions {
  /** 自定义管道执行器列表 */
  customPipes?: PipeExecutor[];
  /** 自定义聚合器执行器列表 */
  customAggregators?: AggregatorExecutor[];
  /** 是否对输出内容进行 HTML 转义，默认 true */
  escapeHtml?: boolean;
  /** 自定义分组处理器 */
  groupProcessor?: GroupProcessor;
}

// 重载声明
export function createPrintEngine(template: PrintTemplate, data: any, options?: PrintEngineOptions): PrintEngine;
/** @deprecated 旧签名，请改用 options 对象签名 */
export function createPrintEngine(template: PrintTemplate, data: any, customPipes?: PipeExecutor[], escapeHtml?: boolean, customAggregators?: AggregatorExecutor[]): PrintEngine;

// 实现签名（内部归一化）
export function createPrintEngine(
  template: PrintTemplate,
  data: any,
  optionsOrPipes?: PrintEngineOptions | PipeExecutor[],
  escapeHtml: boolean = true,
  customAggregators?: AggregatorExecutor[]
): PrintEngine {
  const options: PrintEngineOptions = Array.isArray(optionsOrPipes)
    ? { customPipes: optionsOrPipes, escapeHtml, customAggregators }  // 旧路径
    : (optionsOrPipes ?? {});
  return new PrintEngine(template, data, options);
}
```

`PrintEngine` 构造函数同步改为接收 `PrintEngineOptions`（内部私有，非公开 API，直接改签名即可，调用方只有工厂函数）。

**归一化判断依据**：`Array.isArray(optionsOrPipes)`——管道列表必然是数组，options 对象必然不是，无歧义。

## 5. 核心实现：groupData 与 normalizeGroups

```ts
// printEngine.ts（PrintEngine 私有方法，同时绑定到 RenderContext）

/**
 * 统一分组入口：自定义处理器优先，回退内置 groupByField
 */
private groupData(data: any[], groupBy: TableGroupConfig): GroupedData[] {
  const emptyLabel = groupBy.emptyGroupLabel || '未分组';

  if (this.groupProcessor) {
    try {
      const result = this.groupProcessor(data, groupBy);
      if (result !== null && result !== undefined) {
        const normalized = normalizeGroups(result);
        if (normalized) return normalized;
        // 非法结构（非数组/空数组）→ warn + 回退
        console.warn('[PrintEngine] groupProcessor 返回了非法的分组结构，回退默认分组');
      }
      // null/undefined → 调用方主动放弃，静默回退
    } catch (err) {
      console.warn('[PrintEngine] groupProcessor 执行失败，回退默认分组:', err);
    }
  }
  return groupByField(data, groupBy.field, emptyLabel);
}
```

```ts
// printEngine/utils/groupBy.ts 新增导出

/**
 * 归一化处理器返回的分组结果
 * 1. 结构校验：非数组/空数组 → 返回 null（由调用方回退默认分组）
 * 2. 逐组校验：key 缺失归 '未分组'，items 非数组归 []
 * 3. key 去重：重复 key 的组，items 合并进先出现的组
 * 4. 重算 startRowIndex：按组顺序累计（组被重排后行号仍连续）
 */
export function normalizeGroups(groups: any[]): GroupedData[] | null;
```

**startRowIndex 重算逻辑**：遍历归一化后的组，`group.startRowIndex = 累计行数`。默认路径下首次出现顺序即此结果，重算等于空操作，因此两条路径可共用，不产生行为差异。

**容错语义**（与 pipes「抛错回退原值」一致）：
- 处理器抛错：`console.warn` + 回退默认分组，打印不中断
- 返回非数组/空数组：视为非法，`console.warn` + 回退
- 返回的组结构不完整：能修则修（key/items 补默认值），不因单个组废掉整次打印

## 6. RenderContext 扩展

```ts
// printEngine/types.ts RenderContext 追加

/**
 * 统一分组入口（自定义处理器优先，回退内置分组）
 * TableRenderer 所有分组调用点必须走此方法，禁止直连 groupByField
 */
groupData(data: any[], groupBy: TableGroupConfig): GroupedData[];
```

`createRenderContext()` 中绑定 `groupData: this.groupData.bind(this)`。

## 7. 调用点改造明细

| 位置 | 现状 | 改造 |
|---|---|---|
| printEngine.ts:1228（splitGroupedTableWithGap） | `groupByField(tableData, groupBy.field, emptyLabel)` | `this.groupData(tableData, groupBy)` |
| TableRenderer.ts:364（分组渲染） | `groupByField(tableData, groupBy.field, emptyLabel)` | `context.groupData(tableData, groupBy)` |
| TableRenderer.ts:368（总计回算） | `groupByField(totalSource, groupBy.field, emptyLabel)` | `context.groupData(totalSource, groupBy)` |
| TableRenderer.ts:872（calculateHeight 测算） | `groupByField(data, groupBy.field, ...)` | `context.groupData(data, groupBy)` |

改造后 `TableRenderer.ts` 不再 import `groupByField`（仅保留 `hasGroupSummary` 引用），`groupByField` 仍从 `sdk/src/index.ts` 导出（公开 API，外部可用，不删）。

## 8. 数据流示例

以「按月分组 + 按组小计降序」为例：

```
模板：groupBy: { field: 'createdAt', showSummary: true, summaryItems: [...] }
代码：createPrintSDK({ groupProcessor: fn })

1. TableRenderer.render → context.groupData(tableData, groupBy)
2. groupData → this.groupProcessor(tableData, groupBy)
   → fn 内部按月切组 + 按金额合计排序 → 返回 4 组
3. normalizeGroups → 校验结构 + 重算 startRowIndex = [0, 8, 15, 20]
4. 渲染组标题/明细/小计（顺序即 fn 返回顺序）
5. 分页引擎 splitGroupedTableWithGap → this.groupData(tableData, groupBy)
   → 同一 fn → 同一结果 → 分页块与渲染块完全对齐
```

## 9. 错误处理汇总

| 场景 | 行为 |
|---|---|
| 未注入处理器 | 走 `groupByField`，行为与上一版本一致 |
| 处理器返回 null/undefined | 静默回退默认分组（调用方主动放弃） |
| 处理器抛错 | `console.warn` + 回退默认分组 |
| 返回非数组/空数组 | `console.warn` + 回退默认分组 |
| 组 key 重复 | 后者 items 合并进先出现的组，不告警（容忍合理用法） |
| 组 key 缺失 | 归入 '未分组' 组 |
| 组 items 非数组 | 置为空数组 |

## 10. 测试要点

SDK 无测试框架（沿用上一需求结论），以 `npx tsc --noEmit` + `npm run build` 为基线验证，另在 designer 预览环境人工验证以下场景：

1. **回归**：不注入处理器，分组表格渲染 + 分页结果与改造前一致
2. **自定义分组**：注入按月分组处理器，组标题显示月份、跨组行号连续
3. **自定义排序**：注入重排逻辑，组顺序符合预期，分页拆分与渲染一致（重点验证大分组跨页时中间块无小计、末块有小计的行为）
4. **回退**：处理器对特定 field 返回 null，该表默认分组，其他表自定义分组
5. **容错**：处理器抛错/返回非法结构，回退默认且控制台有 warn
6. **工厂签名**：旧 5 参数调用与新 options 调用各创建一次引擎，行为一致
7. **designer 联动**：designer 改动（`createPrintEngine` 调用点如有）以 `npm run build` + `npm run lint` 验证；SDK 侧改动需 rsync dist 或升版本后 designer 类型检查才能通过（既有约束）

## 11. 实施约束

- 模板 JSON 不存函数，`groupProcessor` 只在运行时注入
- 优先级：实例 groupProcessor > 全局 groupProcessor > 内置 groupByField
- 老模板、旧工厂签名调用零影响
- 提交时机由用户统一决定，实现计划不含 git commit 步骤
