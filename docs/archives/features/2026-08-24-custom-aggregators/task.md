# 任务执行：可覆盖聚合器与分组小计聚合类型迁移

> 实现计划，按 Task 顺序执行。每步用 `- [ ]` 勾选跟踪。
> **验证方式说明**：SDK 无测试框架（`package.json` 的 `test` 脚本为空），以 `npx tsc --noEmit -p tsconfig.json` 与 `npm run build`（rollup 含类型检查）作为验证手段；designer 以 `npm run build` + `npm run lint` 验证。

**Goal:** 将表格聚合抽象为可覆盖的 `AggregatorExecutor`（对称 `PipeExecutor`），内置 `sum/avg/max/min/count` 支持实例/全局注册与同名覆盖；分组小计由 `sourceColumn` 迁移为 `dataIndex + summary` 并做向后兼容。

**Architecture:** 新增 `sdk/src/aggregators/` 模块（类型 + 内置 + 注册表），`PrintEngine` 增加聚合器查找与 `executeAggregate`，`RenderContext` 暴露之；`TableRenderer` 收敛两处重复 `switch` 为 `computeSummary` 统一出口。

**Tech Stack:** TypeScript、rollup、decimal.js、react/antd（designer）。

## Global Constraints

- 模板 JSON 不存函数；聚合器运行时注册（实例 `customAggregators` / 全局 `aggregators`），模板只写字符串 `type`。
- 优先级：实例 > 全局 > 内置，同名 `type` 覆盖并 `console.warn`。
- 数值化语义与现状 `calculateSummary` 一致：`Number(val)` + 过滤 `isNaN`（即 `Number('')=0`、`Number(null)=0`、`Number(undefined)=NaN` 被过滤），不在本次修正。
- 老模板 `sourceColumn` 与"小计跟随列 summary"必须继续可用。
- 提交时机由用户统一决定，本计划不包含 `git commit` 步骤。

---

### Task 1: 新增聚合器模块（类型 + 内置 + 注册表）

**文件:**
- Create: `sdk/src/aggregators/types.ts`
- Create: `sdk/src/aggregators/builtins.ts`
- Create: `sdk/src/aggregators/registry.ts`
- Create: `sdk/src/aggregators/index.ts`

**Interfaces:**
- Produces: `AggregatorExecutor`（`type`/`label`/`aggregate`）、`toNumericValues`、`registerAggregator`/`getAggregator`/`getRegisteredAggregatorTypes`/`executeAggregate`（供 Task 3/4 使用）

- [ ] **Step 1: 写 `types.ts`**

```ts
/**
 * 聚合器系统类型定义
 * @module aggregators
 */

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
   * @returns number 继续走 precision 格式化；string 作为最终文本直接输出
   */
  aggregate(values: any[], options?: Record<string, any>): number | string;
}
```

- [ ] **Step 2: 写 `builtins.ts`**

```ts
/**
 * 内置聚合器
 * 数值化语义与既有 calculateSummary 保持一致（Number + 过滤 NaN）
 * @module builtins
 */

import Decimal from 'decimal.js';
import type { AggregatorExecutor } from './types';

/**
 * 数值化：Number(val) + 过滤 NaN
 * 注：Number('')=0、Number(null)=0、Number(undefined)=NaN（被过滤），沿用现状
 */
export function toNumericValues(values: any[]): number[] {
  return values.map(v => Number(v)).filter(v => !isNaN(v));
}

export const SumAggregator: AggregatorExecutor = {
  type: 'sum',
  label: '求和',
  aggregate(values) {
    return toNumericValues(values).reduce((s, v) => s.plus(v), new Decimal(0)).toNumber();
  },
};

export const AvgAggregator: AggregatorExecutor = {
  type: 'avg',
  label: '平均',
  aggregate(values) {
    const nums = toNumericValues(values);
    if (nums.length === 0) return 0;
    return nums.reduce((s, v) => s.plus(v), new Decimal(0)).dividedBy(nums.length).toNumber();
  },
};

export const MaxAggregator: AggregatorExecutor = {
  type: 'max',
  label: '最大',
  aggregate(values) {
    const nums = toNumericValues(values);
    if (nums.length === 0) return 0;
    return Decimal.max(...nums.map(v => new Decimal(v))).toNumber();
  },
};

export const MinAggregator: AggregatorExecutor = {
  type: 'min',
  label: '最小',
  aggregate(values) {
    const nums = toNumericValues(values);
    if (nums.length === 0) return 0;
    return Decimal.min(...nums.map(v => new Decimal(v))).toNumber();
  },
};

export const CountAggregator: AggregatorExecutor = {
  type: 'count',
  label: '计数',
  aggregate(values) {
    return toNumericValues(values).length;
  },
};
```

- [ ] **Step 3: 写 `registry.ts`**

```ts
/**
 * 聚合器注册表
 * 负责管理聚合器执行器
 * @module registry
 */

import type { AggregatorExecutor } from './types';
import {
  SumAggregator,
  AvgAggregator,
  MaxAggregator,
  MinAggregator,
  CountAggregator,
} from './builtins';

const aggregatorRegistry = new Map<string, AggregatorExecutor>();

/**
 * 注册聚合器执行器
 */
export function registerAggregator(executor: AggregatorExecutor): void {
  aggregatorRegistry.set(executor.type, executor);
}

/**
 * 获取聚合器执行器
 */
export function getAggregator(type: string): AggregatorExecutor | undefined {
  return aggregatorRegistry.get(type);
}

/**
 * 获取所有已注册聚合器类型标识（快照）
 */
export function getRegisteredAggregatorTypes(): Set<string> {
  return new Set(aggregatorRegistry.keys());
}

/**
 * 执行聚合（内置兜底）
 * 找不到执行器时告警并返回 undefined，由上层统一处理为 '-'
 */
export function executeAggregate(type: string, values: any[], options?: Record<string, any>): number | string | undefined {
  const aggregator = getAggregator(type);
  if (!aggregator) {
    console.warn(`Aggregator not found: ${type}`);
    return undefined;
  }
  return aggregator.aggregate(values, options);
}

// 初始化：注册内置聚合器
registerAggregator(SumAggregator);
registerAggregator(AvgAggregator);
registerAggregator(MaxAggregator);
registerAggregator(MinAggregator);
registerAggregator(CountAggregator);
```

- [ ] **Step 4: 写 `index.ts`**

```ts
/**
 * 聚合器系统入口文件
 * @module aggregators
 */

export * from './types';
export * from './builtins';
export * from './registry';
```

- [ ] **Step 5: 类型检查**

Run: `npx tsc --noEmit -p tsconfig.json`（在 `sdk/` 目录）
Expected: 无错误

---

### Task 2: 类型定义改动（TableColumnSummary + GroupSummaryItem）

**文件:**
- Modify: `sdk/src/types.ts:99-107`（`TableColumnSummary`）
- Modify: `sdk/src/types.ts:183-188`（`GroupSummaryItem`）

**Interfaces:**
- Consumes: 无
- Produces: `TableColumnSummary.type: string`、`TableColumnSummary.options`、`GroupSummaryItem.dataIndex`/`summary`/`sourceColumn(deprecated)`（供 Task 4 使用）

- [ ] **Step 1: 改 `TableColumnSummary`**

将 `sdk/src/types.ts:99-107` 替换为：

```ts
// 表格列合计配置
export interface TableColumnSummary {
  type: string;                    // 聚合类型，支持内置 sum/avg/max/min/count 或自定义聚合器 type
  precision?: number;              // 小数位数，默认 2
  prefix?: string;                 // 前缀，如 "￥"
  suffix?: string;                 // 后缀，如 "元"
  /** 管道配置，用于对合计值进行转换（如中文大写） */
  pipe?: PipeConfig;
  /** 传给聚合器的选项（自定义聚合器参数） */
  options?: Record<string, any>;
}
```

- [ ] **Step 2: 改 `GroupSummaryItem`**

将 `sdk/src/types.ts:177-188`（含注释）替换为：

```ts
/**
 * 分组小计数据项
 * 通过 dataIndex 指定取数路径、summary 指定聚合配置，两者解耦
 * pipes（继承自 DataField）在聚合后的原始数值上执行（与额外行语义一致），
 * 不经过 summary 的 precision/prefix/suffix 格式化，precision 等由管道自行控制
 */
export interface GroupSummaryItem extends DataField {
  /** 静态前缀文字（如 "金额："），可选 */
  label?: string;
  /** 取数路径（数据字段名，支持点号路径），替代 sourceColumn */
  dataIndex: string;
  /** 自带聚合配置；缺省时回退查该列的 summary（向后兼容老模板） */
  summary?: TableColumnSummary;
  /** @deprecated 使用 dataIndex 替代，向后兼容 */
  sourceColumn?: string;
}
```

- [ ] **Step 3: 类型检查**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: 无错误（`TableColumnSummary.type` 放宽为 `string` 不影响既有 union 字面量）

---

### Task 3: 注册渠道与执行入口（globalConfig + PrintSDK + printEngine + RenderContext）

**文件:**
- Modify: `sdk/src/config/globalConfig.ts:11-14`（`SDKGlobalConfig.aggregators`）
- Modify: `sdk/src/PrintSDK.ts:21-26`（`PrintSDKOptions.customAggregators`）、`PrintSDK.ts:112-119`（构造合并）、`PrintSDK.ts:130/217/258/341`（透传）
- Modify: `sdk/src/printEngine/types.ts:11-65`（`RenderContext.executeAggregate`）
- Modify: `sdk/src/printEngine.ts:8,14,38-56,61-84,147-176,220-244`（字段/构造/注册/执行/上下文）
- Modify: `sdk/src/printEngine.ts:1417-1418`（`createPrintEngine` 工厂）

**Interfaces:**
- Consumes: `AggregatorExecutor`、`getAggregator`、`getRegisteredAggregatorTypes`、`executeAggregate`（内置）（Task 1）
- Produces: `RenderContext.executeAggregate(type, values, options?): number | string | undefined`（Task 4 使用）；`createPrintEngine(template, data, customPipes?, customAggregators?, escapeHtml?)`

- [ ] **Step 1: `globalConfig.ts` 加 `aggregators`**

```ts
import type { AggregatorExecutor } from '../aggregators/types';

export interface SDKGlobalConfig {
  /** 是否对输出内容进行 HTML 转义（防止 XSS），默认 true */
  escapeHtml?: boolean;
  /** 全局聚合器执行器列表（实例级可覆盖） */
  aggregators?: AggregatorExecutor[];
}
```

（`globalConfig.ts` 顶部新增 import 行，`SDKGlobalConfig` 接口内新增 `aggregators` 字段）

- [ ] **Step 2: `PrintSDK.ts` 加 `customAggregators` 与合并**

`PrintSDKOptions`（约 21-26 行）新增字段：

```ts
export interface PrintSDKOptions {
  /** 自定义管道执行器列表 */
  customPipes?: PipeExecutor[];
  /** 自定义聚合器执行器列表，覆盖全局与内置同名聚合器 */
  customAggregators?: AggregatorExecutor[];
  /** 是否对输出内容进行 HTML 转义，覆盖全局配置，默认 true */
  escapeHtml?: boolean;
}
```

类字段与构造（约 112-119 行）：

```ts
export class PrintSDK {
  private customPipes?: PipeExecutor[];
  private customAggregators?: AggregatorExecutor[];
  private escapeHtml: boolean;

  constructor(options?: PrintSDKOptions) {
    this.customPipes = options?.customPipes;
    this.escapeHtml = options?.escapeHtml ?? getGlobalConfig().escapeHtml ?? true;
    // 合并：全局在前、实例在后（实例覆盖全局），最终传给 PrintEngine
    const globalAggregators = getGlobalConfig().aggregators ?? [];
    const instanceAggregators = options?.customAggregators ?? [];
    this.customAggregators = [...globalAggregators, ...instanceAggregators];
  }
```

在 `PrintSDK.ts` 顶部 import 区（约 9 行后）加：

```ts
import type { AggregatorExecutor } from './aggregators/types';
```

- [ ] **Step 3: `PrintSDK.ts` 透传（4 处）**

将 4 处 `createPrintEngine(template, data, this.customPipes, this.escapeHtml)` 全部改为 `createPrintEngine(template, data, this.customPipes, this.customAggregators, this.escapeHtml)`（第 130、217、258、341 行）。

- [ ] **Step 4: `printEngine/types.ts` 加 `executeAggregate`**

在 `RenderContext` 接口（约 30 行 `executePipe` 后）新增：

```ts
  /**
   * 执行聚合（优先自定义聚合器，回退内置聚合器）
   * 找不到执行器时返回 undefined
   */
  executeAggregate(type: string, values: any[], options?: Record<string, any>): number | string | undefined;
```

- [ ] **Step 5: `printEngine.ts` 导入与字段**

import 区（约 8、14 行）新增：

```ts
import type { AggregatorExecutor } from './aggregators/types';
import { executeAggregate as executeBuiltInAggregate, getRegisteredAggregatorTypes } from './aggregators/registry';
```

类字段（约 38 行后）新增：

```ts
  private customAggregatorsMap: Map<string, AggregatorExecutor>;
```

构造函数（约 42-56 行）改为：

```ts
  constructor(template: PrintTemplate, data: any, customPipes?: PipeExecutor[], customAggregators?: AggregatorExecutor[], escapeHtml: boolean = true) {
    this.template = template;
    this.data = data;
    this.renderers = new Map();
    this.customPipesMap = new Map();
    this.customAggregatorsMap = new Map();
    this.escapeHtmlFlag = escapeHtml;

    this.registerDefaultRenderers();

    if (customPipes && customPipes.length > 0) {
      this.registerCustomPipes(customPipes);
    }
    if (customAggregators && customAggregators.length > 0) {
      this.registerCustomAggregators(customAggregators);
    }
  }
```

- [ ] **Step 6: `printEngine.ts` 加 `registerCustomAggregators`（对称 `registerCustomPipes`）**

在 `registerCustomPipes` 方法后新增：

```ts
  /**
   * 注册自定义聚合器执行器
   */
  private registerCustomAggregators(aggregators: AggregatorExecutor[]): void {
    const builtInTypes = getRegisteredAggregatorTypes();
    for (const executor of aggregators) {
      if (!executor || typeof executor !== 'object') {
        throw new Error('[PrintEngine] customAggregators 数组中包含无效元素（null 或非对象）');
      }
      if (!executor.type) {
        throw new Error('[PrintEngine] customAggregator.type 不能为空');
      }
      if (typeof executor.aggregate !== 'function') {
        throw new Error(`[PrintEngine] customAggregator "${executor.type}" 的 aggregate 必须是函数`);
      }
      if (this.customAggregatorsMap.has(executor.type)) {
        console.warn(
          `[PrintEngine] customAggregators 中存在重复的 type "${executor.type}"，后者将覆盖前者`
        );
      } else if (builtInTypes.has(executor.type)) {
        console.warn(
          `[PrintEngine] 自定义聚合器 "${executor.type}" 将覆盖内置同名聚合器`
        );
      }
      this.customAggregatorsMap.set(executor.type, executor);
    }
  }
```

- [ ] **Step 7: `printEngine.ts` 加 `executeAggregate` 方法**

在 `executePipe` 方法（约 164-176 行）后新增：

```ts
  /**
   * 执行聚合
   * 优先使用自定义聚合器，找不到时回退到内置聚合器
   */
  private executeAggregate(type: string, values: any[], options?: Record<string, any>): number | string | undefined {
    const customExecutor = this.customAggregatorsMap.get(type);
    if (customExecutor) {
      try {
        return customExecutor.aggregate(values, options);
      } catch (err) {
        console.error(`[PrintEngine] 自定义聚合器 "${type}" 执行失败:`, err);
        return undefined;
      }
    }
    return executeBuiltInAggregate(type, values, options);
  }
```

- [ ] **Step 8: `printEngine.ts` 注入 `RenderContext`**

在 `createRenderContext` 返回对象（约 224-243 行）中，`executePipe` 后新增：

```ts
      executePipe: this.executePipe.bind(this),
      executeAggregate: this.executeAggregate.bind(this),
```

- [ ] **Step 9: `createPrintEngine` 工厂签名**

将 `printEngine.ts:1417-1418` 改为：

```ts
export function createPrintEngine(template: PrintTemplate, data: any, customPipes?: PipeExecutor[], customAggregators?: AggregatorExecutor[], escapeHtml: boolean = true) {
  const engine = new PrintEngine(template, data, customPipes, customAggregators, escapeHtml);
```

- [ ] **Step 10: 类型检查 + 构建**

Run: `npx tsc --noEmit -p tsconfig.json` 然后 `npm run build`
Expected: 无错误，dist 正常产出

---

### Task 4: TableRenderer 重构（computeSummary + 委托 + buildGroupSummaryText）

**文件:**
- Modify: `sdk/src/printEngine/renderers/TableRenderer.ts:641-759`（`calculateSummary`/`getColumnSummaryRawValue` → `computeSummary`）
- Modify: `sdk/src/printEngine/renderers/TableRenderer.ts:794,864,872`（`getColumnSummaryRawValue` 调用处补 `context`）
- Modify: `sdk/src/printEngine/renderers/TableRenderer.ts:837-898`（`buildGroupSummaryText`）

**Interfaces:**
- Consumes: `context.executeAggregate`（Task 3）
- Produces: 无新增公开接口；`calculateSummary`/`getColumnSummaryRawValue` 行为与现状等价

- [ ] **Step 1: 新增 `computeSummary`，替换 `calculateSummary` 与 `getColumnSummaryRawValue`**

将 `sdk/src/printEngine/renderers/TableRenderer.ts` 中 `calculateSummary`（约 639-714 行）与 `getColumnSummaryRawValue`（约 716-759 行）两个方法整体替换为：

```ts
  /**
   * 统一聚合出口：输入数据 + 取数路径 + 聚合配置
   * 聚合器返回 number → 走 precision/prefix/suffix/pipe 格式化；
   * 返回 string → 作为最终文本直接输出；undefined（找不到/失败）→ '-'
   * @param data 数据数组
   * @param dataIndex 取数路径
   * @param summary 聚合配置
   * @param context 渲染上下文
   * @returns raw 原始数值（供额外行/小计 pipes 使用）；text 格式化文本
   */
  private computeSummary(data: any[], dataIndex: string, summary: TableColumnSummary, context: RenderContext): { raw: number | null; text: string } {
    if (!data.length) return { raw: null, text: '-' };

    const rawValues = data.map(row => getByPath(row, dataIndex));
    // 无数值时返回 '-'（与现状 calculateSummary 的 values 空判断一致）
    const hasNumeric = rawValues.some(v => !isNaN(Number(v)));
    if (!hasNumeric) return { raw: null, text: '-' };

    const agg = context.executeAggregate(summary.type, rawValues, summary.options);
    if (agg === undefined) return { raw: null, text: '-' };

    // string 结果直接输出，不走 precision/pipe
    if (typeof agg === 'string') return { raw: null, text: agg };

    try {
      const result = new Decimal(agg);
      const precision = summary.precision ?? 2;
      const formatted = result.toFixed(precision);
      const prefix = summary.prefix || '';
      const suffix = summary.suffix || '';

      let finalResult = `${prefix}${formatted}${suffix}`;

      if (summary.pipe) {
        const pipedValue = context.executePipe(Number(formatted), summary.pipe);
        if (pipedValue !== Number(formatted)) {
          finalResult = pipedValue ?? '';
        }
      }

      return { raw: agg, text: finalResult };
    } catch (formatError) {
      console.error('[TableRenderer] 格式化合计结果失败:', formatError);
      return { raw: null, text: '-' };
    }
  }

  /**
   * 计算单列合计值（委托 computeSummary）
   */
  private calculateSummary(data: any[], column: TableColumn, context: RenderContext): string {
    if (!column.summary) return '';
    return this.computeSummary(data, column.dataIndex, column.summary, context).text;
  }

  /**
   * 获取列合计的原始数值（委托 computeSummary）
   */
  private getColumnSummaryRawValue(data: any[], column: TableColumn, context: RenderContext): number | null {
    if (!column.summary) return null;
    return this.computeSummary(data, column.dataIndex, column.summary, context).raw;
  }
```

- [ ] **Step 2: 补 `getColumnSummaryRawValue` 调用处的 `context` 参数**

- `TableRenderer.ts:794`：`let value: any = this.getColumnSummaryRawValue(data, col);` → `let value: any = this.getColumnSummaryRawValue(data, col, context);`
- `TableRenderer.ts:864`：`let value: any = this.getColumnSummaryRawValue(group.items, col);` → `let value: any = this.getColumnSummaryRawValue(group.items, col, context);`
- `TableRenderer.ts:872`：`value = this.getColumnSummaryRawValue(group.items, col);` → `value = this.getColumnSummaryRawValue(group.items, col, context);`

- [ ] **Step 3: 重构 `buildGroupSummaryText` 的遍历逻辑**

将 `buildGroupSummaryText` 方法体中 `summaryItems` 遍历段（约 854-882 行）替换为：

```ts
    const summaryItems = groupBy?.summaryItems as GroupSummaryItem[] | undefined;
    const parts: string[] = [];
    if (summaryItems && summaryItems.length > 0) {
      for (const item of summaryItems) {
        // 取数路径：dataIndex 优先，回退 sourceColumn（老模板兼容）
        const ref = item.dataIndex ?? item.sourceColumn;
        if (!ref) continue;
        // 聚合配置：自带 summary 优先，缺省回退查列 summary（老模板兼容）
        let summary: TableColumnSummary | undefined = item.summary;
        if (!summary) {
          const col = displayColumns.find(c => c.dataIndex === ref);
          if (!col || !col.summary) continue;
          summary = col.summary;
        }

        if (item.pipes && item.pipes.length > 0) {
          // 有管道：从原始数值开始逐个执行（与额外行语义一致）
          const { raw } = this.computeSummary(group.items, ref, summary, context);
          if (raw === null || raw === undefined) continue;
          let value: any = raw;
          try {
            for (const pipe of item.pipes) {
              value = context.executePipe(value, pipe);
            }
          } catch (pipeError) {
            console.error('[TableRenderer] 分组小计管道执行失败:', pipeError);
          }
          parts.push(`${item.label ?? ''}${String(value)}`);
        } else {
          // 无管道：使用 computeSummary 的完整格式化（precision/prefix/suffix）
          const text = this.computeSummary(group.items, ref, summary, context).text;
          if (!text || text === '-') continue;
          parts.push(`${item.label ?? ''}${text}`);
        }
      }
    }
```

（`TableRenderer.ts` 顶部 import 需新增 `TableColumnSummary` 类型：`import type { ComponentNode, TableColumn, TableProps, SummaryExtraRow, GroupSummaryItem, TableColumnSummary } from '../../types';`）

- [ ] **Step 4: 类型检查 + 构建**

Run: `npx tsc --noEmit -p tsconfig.json` 然后 `npm run build`
Expected: 无错误

- [ ] **Step 5: 手动验证（老模板兼容 + 新形态）**

在 `designer` 的 mock 模板中：
1. 用老模板（`summaryItems: [{ sourceColumn: 'amount', label: '金额：' }]`）生成 HTML，小计值不变
2. 改为新形态（`summaryItems: [{ dataIndex: 'amount', summary: { type: 'avg', precision: 2 } }]`）生成 HTML，小计按 avg 计算

---

### Task 5: SDK 导出与文档

**文件:**
- Modify: `sdk/src/sdk.ts`（导出 `AggregatorExecutor`）
- Modify: `sdk/CHANGELOG.md`
- Modify: `sdk/README.md`

**Interfaces:**
- Produces: `AggregatorExecutor` 对外可导入

- [ ] **Step 1: `sdk.ts` 导出聚合器类型**

在 `sdk/src/sdk.ts` 管道类型导出（约 87 行）后新增：

```ts
// 导出聚合器类型（供自定义聚合器使用）
export type { AggregatorExecutor } from './aggregators/types';
```

- [ ] **Step 2: `CHANGELOG.md` 记录**

在 `CHANGELOG.md` 顶部（当前未发布版本的条目下）新增：
- 新增 `AggregatorExecutor` 聚合器接口与内置 `sum/avg/max/min/count`，支持 `createPrintSDK({ customAggregators })` / `configureSDK({ aggregators })` 注册与同名覆盖
- `TableColumnSummary.type` 放宽为 `string`，新增 `options` 字段
- `GroupSummaryItem` 由 `sourceColumn` 迁移为 `dataIndex + summary`，`sourceColumn` 标记 deprecated 兼容

- [ ] **Step 3: `README.md` 补充用法**

在 README 的自定义管道章节旁新增"自定义聚合器"示例：

```ts
import { createPrintSDK } from '@jcyao/print-sdk';

const ceilSum = {
  type: 'ceil-sum',
  label: '向上取整求和',
  aggregate(values: any[]) {
    const nums = values.map(Number).filter(v => !isNaN(v));
    return Math.ceil(nums.reduce((s, v) => s + v, 0));
  },
};
const sdk = createPrintSDK({ customAggregators: [ceilSum] });
// 模板列：{ dataIndex: 'amount', summary: { type: 'ceil-sum', precision: 0 } }
```

- [ ] **Step 4: 构建**

Run: `npm run build`
Expected: 无错误

---

### Task 6: 设计器同步（TableGroupSection + 类型）

**文件:**
- Modify: `designer/src/pages/Designer/components/PropertyPanel/TableGroupSection.tsx`
- Modify: `designer/src/types/index.ts`（如重新导出 `AggregatorExecutor` 或更新 `GroupSummaryItem`）

**Interfaces:**
- Consumes: SDK 新类型（需先 `npm run build` 重新构建 SDK 并同步 dist 到 designer 依赖）

**前置说明**：designer 依赖 `@jcyao/print-sdk` npm 包。SDK 改动后需重新构建 dist 并更新 designer 的依赖（本地 `pnpm/npm link` 或临时改版本），使新类型可被 designer 的 `tsc` 识别。若类型同步阻塞，先完成 SDK 侧 Task 1-5 并发布 alpha 版本再继续本任务。

- [ ] **Step 1: `handleAddSummaryItem` 改为 dataIndex + 自带 sum 配置**

`TableGroupSection.tsx:84-91` 替换为：

```tsx
  /** 添加小计数据项：默认取第一个列字段 + 自带 sum 聚合 */
  const handleAddSummaryItem = () => {
    const defaultCol = columns.find(c => c.summary) || columns[0];
    if (!defaultCol?.dataIndex) return;
    updateGroupBy({
      summaryItems: [...summaryItems, { dataIndex: defaultCol.dataIndex, summary: { type: 'sum', precision: 2 } }],
    });
  };
```

- [ ] **Step 2: `handleSummaryItemSourceChange` 改为 dataIndex 变更（去掉自动补列合计逻辑）**

`TableGroupSection.tsx:106-128` 替换为：

```tsx
  /** 取数路径变更：仅更新 dataIndex，不再自动补列合计（聚合配置已自带） */
  const handleSummaryItemDataIndexChange = (index: number, dataIndex: string | undefined) => {
    if (!dataIndex) return;
    const nextItems = [...summaryItems];
    nextItems[index] = { ...nextItems[index], dataIndex };
    updateGroupBy({ summaryItems: nextItems });
  };
```

- [ ] **Step 3: 新增聚合配置更新 handler**

在 `handleSummaryItemDataIndexChange` 后新增：

```tsx
  /** 更新数据项的聚合配置（type / precision） */
  const handleSummaryItemSummaryChange = (index: number, patch: Partial<TableColumnSummary>) => {
    const nextItems = [...summaryItems];
    const cur = nextItems[index].summary || { type: 'sum', precision: 2 };
    nextItems[index] = { ...nextItems[index], summary: { ...cur, ...patch } };
    updateGroupBy({ summaryItems: nextItems });
  };
```

（顶部 import 新增 `TableColumnSummary` 类型：`import type { ComponentNode, TableColumn, TableGroupConfig, GroupSummaryItem, PipeConfig, TableSummaryStyle, TableColumnSummary } from '../../../../types';`）

- [ ] **Step 4: 渲染层替换 sourceColumn 选择器为 dataIndex + 聚合配置**

将 `TableGroupSection.tsx:248-266` 的数据项渲染块替换为：

```tsx
                  <Select
                    size="small"
                    style={{ width: '100%', marginBottom: 4 }}
                    placeholder="取数字段"
                    value={item.dataIndex ?? item.sourceColumn || undefined}
                    onChange={(val) => handleSummaryItemDataIndexChange(idx, val)}
                    options={summaryColumnOptions}
                  />
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    <Select
                      size="small"
                      style={{ flex: 1 }}
                      value={item.summary?.type || 'sum'}
                      onChange={(val) => handleSummaryItemSummaryChange(idx, { type: val })}
                      options={[
                        { label: '求和', value: 'sum' },
                        { label: '平均', value: 'avg' },
                        { label: '最大', value: 'max' },
                        { label: '最小', value: 'min' },
                        { label: '计数', value: 'count' },
                      ]}
                    />
                    <InputNumber
                      size="small"
                      style={{ width: 80 }}
                      min={0}
                      max={8}
                      value={item.summary?.precision ?? 2}
                      placeholder="精度"
                      onChange={(v) => handleSummaryItemSummaryChange(idx, { precision: v ?? undefined })}
                    />
                  </div>
```

- [ ] **Step 5: `designer/src/types/index.ts` 同步**

若该文件从 `@jcyao/print-sdk` 重新导出类型，补充 `AggregatorExecutor`；`GroupSummaryItem` 随 SDK 类型自动更新（确认无旧 `sourceColumn` 必填假设残留）。

- [ ] **Step 6: 构建 + lint**

Run: `npm run build` 然后 `npm run lint`（在 `designer/` 目录）
Expected: 无错误

- [ ] **Step 7: 手动验证**

设计器中开启分组 → 添加小计数据项 → 选择取数字段 + 切换聚合类型（sum/avg）→ 画布预览小计值随之变化；老模板（`sourceColumn`）加载后小计仍正常显示。

---

## Self-Review 记录

- **Spec 覆盖**：requirement 核心需求 1（聚合器可覆盖）→ Task 1/3；2（任意算法，原始值）→ Task 1 builtins + 接口；3（分组小计迁移）→ Task 2/4/6；4（向后兼容）→ Task 4 Step 3 + Task 6 Step 4（`dataIndex ?? sourceColumn`）。
- **类型一致性**：`executeAggregate` 签名在 Task 3（定义）与 Task 4（调用）一致；`AggregatorExecutor.aggregate` 返回 `number | string` 在 Task 1 定义、Task 4 分支处理一致。
- **范围**：单一实现计划，不含额外行迁移、rounding 选项（均明确列为非目标）。
