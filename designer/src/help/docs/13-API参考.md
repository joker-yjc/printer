# API 参考

> 适用版本：`@jcyao/print-sdk >= 1.12.0` | 源码：`sdk/src/types.ts`、`sdk/src/PrintSDK.ts` | 完整类型：`sdk/README.md#类型定义`

---

## 目录

1. [安装与初始化](#1-安装与初始化)
2. [SDK 实例方法](#2-sdk-实例方法)
3. [模板结构 PrintTemplate](#3-模板结构-printtemplate)
4. [页面配置 PageConfig](#4-页面配置-pageconfig)
5. [组件 ComponentNode](#5-组件-componentnode)
6. [表格组件 TableProps](#6-表格组件-tableprops)
7. [表格分组 TableGroupConfig](#7-表格分组-tablegroupconfig)
8. [管道 PipeConfig](#8-管道-pipeconfig)
9. [数据绑定 DataBinding](#9-数据绑定-databinding)
10. [工具函数](#10-工具函数)

---

## 1. 安装与初始化

```bash
npm install @jcyao/print-sdk
```

```typescript
import { createPrintSDK, configureSDK } from '@jcyao/print-sdk';

// 实例级
const sdk = createPrintSDK({ escapeHtml: true, customPipes: [...] });

// 全局级（影响后续所有实例）
configureSDK({ escapeHtml: false });

// 优先级：实例级 > 全局级 > 默认值 true
```

### PrintSDKOptions

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `customPipes` | `PipeExecutor[]` | 否 | - | 自定义管道执行器，`{ type, label, execute }` |
| `customAggregators` | `AggregatorExecutor[]` | 否 | - | 自定义聚合器，`{ type, label, aggregate }` |
| `escapeHtml` | `boolean` | 否 | `true` | 是否对输出 HTML 转义，`false` 允许富文本 |

### SDKGlobalConfig

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `aggregators` | `AggregatorExecutor[]` | 否 | - | 全局自定义聚合器 |
| `escapeHtml` | `boolean` | 否 | `true` | 全局 HTML 转义开关 |

---

## 2. SDK 实例方法

### `sdk.print(options)`

```typescript
await sdk.print({ template, data, preview?: boolean });
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `template` | `PrintTemplate` | 是 | 模板 JSON |
| `data` | `any` | 是 | 业务数据 |
| `preview` | `boolean` | 否 | `true` 预览新窗口，`false` 隐藏 iframe 直接打印 |

### `sdk.printDirect(template, data)` / `sdk.printWithPreview(template, data)`

快捷方法，等同 `print({ preview: false/true })`。

### `sdk.generateHTML(template, data): Promise<string>`

仅生成 HTML 字符串，不触发打印。适用于 Electron / Node 端自处理。

### `sdk.printMultiple(template, dataList, options?)` / `sdk.generateHTMLMultiple(template, dataList, options?)`

同模板多数据批量打印。

```typescript
await sdk.printMultiple(template, [data1, data2], {
  preview: true,
  onProgress: ({ total, completed, failed, currentIndex }) => {}
});
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `preview` | `boolean` | 是否预览 |
| `onProgress` | `(BatchPrintProgress) => void` | 进度回调 |

### `sdk.printMultiTemplate(groups, options?)` / `sdk.generateHTMLMultiTemplate(groups, options?)`

多模板批量打印，一次确认。

```typescript
await sdk.printMultiTemplate([
  { template: templateA, dataList: [dataA1] },
  { template: templateB, dataList: [dataB1, dataB2] }
], { preview: true });
```

> 限制：所有模板需相同纸张尺寸与边距。

---

## 3. 模板结构 PrintTemplate

```typescript
interface PrintTemplate {
  id: string;
  name: string;
  version: string;
  description?: string;
  schemaId: string;
  page: PageConfig;
  layoutMode: 'absolute' | 'flow';
  components: ComponentNode[];
  headerComponents?: ComponentNode[]; // 页头区域
  footerComponents?: ComponentNode[]; // 页脚区域
}
```

---

## 4. 页面配置 PageConfig

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `size` | `'A4' \| 'A5' \| 'CUSTOM' \| 'CONTINUOUS'` | 是 | - | 纸张尺寸 |
| `widthMm` | `number` | `CUSTOM` 时必填 | - | 自定义宽度 |
| `heightMm` | `number` | `CUSTOM` 时必填 | - | 自定义高度 |
| `minHeightMm` | `number` | 否 | - | 连续纸最小高度 |
| `orientation` | `'portrait' \| 'landscape'` | 是 | - | 方向 |
| `marginMm` | `{ top, right, bottom, left }` | 是 | - | 边距 (mm) |
| `pageNumber` | `PageNumberConfig` | 否 | - | 页码 |
| `headerEnabled` | `boolean` | 否 | `false` | 启用页头区域 |
| `headerHeight` | `number` | 否 | 自动 | 页头最小高度 |
| `footerEnabled` | `boolean` | 否 | `false` | 启用页脚区域 |
| `footerHeight` | `number` | 否 | 自动 | 页脚最小高度 |

### PageNumberConfig

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | `boolean` | - | 是否显示 |
| `position` | `'bottom-center' \| 'bottom-right' \| ... \| 'custom'` | - | 预设或自定义 |
| `customX`/`customY` | `number` | - | 自定义坐标 (mm) |
| `format` | `'simple' \| 'text' \| 'slash'` | `slash` | `1` / `第1页 共3页` / `1/3` |
| `prefix`/`suffix`/`separator` | `string` | - | 前后缀/分隔符 |
| `offsetX`/`offsetY` | `number` | - | 预设模式偏移 (mm) |
| `style` | `{ fontSize, color, fontWeight }` | - | 样式 |

---

## 5. 组件 ComponentNode

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string` | 是 | 组件唯一标识 |
| `type` | `'text' \| 'image' \| 'table' \| 'line' \| 'rect' \| 'qrcode' \| 'barcode' \| 'container'` | 是 | 组件类型 |
| `layout` | `{ mode, xMm, yMm, widthMm, heightMm, zIndex? }` | 是 | `mode: 'absolute' \| 'flow'`，坐标单位 mm |
| `style` | `Record<string, any>` | 否 | 内联样式 |
| `binding` | `DataBinding` | 否 | 数据绑定 |
| `props` | `Record<string, any>` | 否 | 组件私有属性 |
| `children` | `ComponentNode[]` | 否 | 子组件 |

---

## 6. 表格组件 TableProps

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `columns` | `TableColumn[]` | - | 列配置 |
| `showHeader` | `boolean` | `true` | 显示表头 |
| `bordered` | `boolean` | `true` | 显示边框 |
| `borderStyle` | `'solid' \| 'dashed'` | `solid` | 边框样式 |
| `borderColor` | `string` | `#d9d9d9` | 边框颜色 |
| `borderWidth` | `number` | `1` | 线宽 1-5 px |
| `repeatHeader` | `boolean` | `true` | 跨页重复表头 |
| `density` | `'normal' \| 'compact'` | `normal` | `compact: 1px 4px / 1.2` |
| `summaryDisplay` | `'both' \| 'none' \| 'extra-only'` | `both` | 合计行显示：`both` 合计+额外行，`extra-only` 仅额外行 |
| `summaryMode` | `'page' \| 'total'` | `total` | `page` 每页合计，`total` 仅末页 |
| `summaryLabel` | `string` | `合计` | 合计首列标签 |
| `summaryStyle` | `TableSummaryStyle` | - | 合计行样式 |
| `headerStyle` | `TableHeaderStyle` | - | 表头默认样式 |
| `showRowNumber` | `boolean` | - | 显示序号列 |
| `rowNumberLabel` | `string` | `序号` | 序号标题 |
| `rowNumberWidth` | `number` | 自动 | 序号列宽 (mm) |
| `summaryExtraRows` | `SummaryExtraRow[]` | - | 合计额外行 |
| `groupBy` | `TableGroupConfig` | - | 分组配置 |

> `summaryDisplay: 'extra-only'` 的额外行渲染时机遵循 `summaryMode`（`total` 仅末页，`page` 每页）。

### TableColumn

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `dataIndex` | `string` | 是 | 字段名 |
| `title` | `string` | 是 | 列标题 |
| `width` | `number` | 否 | 列宽 (mm) |
| `align` | `'left' \| 'center' \| 'right'` | 否 | 对齐（兼容，优先级低于 `style.textAlign`） |
| `hidden` | `boolean` | 否 | 隐藏列 |
| `summary` | `TableColumnSummary` | 否 | 合计配置 |
| `style` | `TableColumnStyle` | 否 | 数据单元格样式 |
| `headerStyle` | `TableColumnStyle` | 否 | 表头单元格样式 |
| `pipes` | `PipeConfig[]` | 否 | 列值管道链 |

### TableColumnSummary

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `string` | `'sum'` | 聚合类型，内置 `sum/avg/max/min/count`，可填自定义聚合器 type |
| `precision` | `number` | `2` | 小数位 |
| `prefix` | `string` | - | 前缀如 `¥` |
| `suffix` | `string` | - | 后缀如 `元` |
| `pipe` | `PipeConfig` | - | 合计值管道（如中文大写） |
| `options` | `Record<string, any>` | - | 传给聚合器的选项 |

### AggregatorExecutor（自定义聚合器）

```typescript
interface AggregatorExecutor {
  type: string;    // 聚合类型标识，可与内置同名覆盖
  label: string;   // 显示名称
  // number → 继续走 precision/prefix/suffix/pipe；string → 作为最终文本直接输出；undefined → 显示 '-'
  aggregate(values: any[], options?: Record<string, any>): number | string | undefined;
}
```

通过 `createPrintSDK({ customAggregators: [...] })` 或 `configureSDK({ aggregators: [...] })` 注册，优先级：实例 > 全局 > 内置。

### SummaryExtraRow

| 字段 | 类型 | 说明 |
|------|------|------|
| `items` | `SummaryExtraRowItem[]` | 行内数据项，按序拼接 |
| `backgroundColor` | `string` | 背景色 |
| `fontWeight` | `string` | 字重 |
| `align` | `'left' \| 'center' \| 'right'` | 对齐，默认 `left` |

`SummaryExtraRowItem: { label?: string, sourceColumn?: string, pipes?: PipeConfig[] }`

---

## 7. 表格分组 TableGroupConfig

```typescript
groupBy: {
  field: 'category', // 必填，支持 a.b
  showHeader: true,
  emptyGroupLabel: '未分类',
  headerStyle: { backgroundColor: '#f5f5f5', fontWeight: 'bold', textAlign: 'left' },
  showSummary: true,
  summaryLabel: '{group}小计', // 支持 {group}/{count}/{value}
  summaryStyle: { backgroundColor: '#f5f5f5', textAlign: 'left' },
  summaryItems: [{ label: '金额：', dataIndex: 'amount' }]
}
```

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `field` | `string` | 是 | - | 分组字段，点号路径 |
| `showHeader` | `boolean` | 否 | `true` | 显示组标题行 |
| `emptyGroupLabel` | `string` | 否 | `未分类` | 空值分组标题 |
| `pipes` | `PipeConfig[]` | 否 | - | 标题值转换，空值分组跳过 |
| `headerStyle` | `TableSummaryStyle` | 否 | - | 标题行样式 |
| `showSummary` | `boolean` | 否 | `true` | 显示小计行 |
| `summaryLabel` | `string` | 否 | `{group}小计` | 标签模板 |
| `summaryStyle` | `TableSummaryStyle` | 否 | - | 小计行样式 |
| `summaryItems` | `GroupSummaryItem[]` | 否 | - | 小计数据项，未配置时仅渲染标签行，可作签字行 |

**GroupSummaryItem:** `{ dataIndex?: string, summary?: TableColumnSummary, label?: string, pipes?: PipeConfig[] }`

- `dataIndex`：取数路径（推荐）；`summary`：该小计项的聚合配置，未配置时回退 `dataIndex` 对应列的 `summary`
- `sourceColumn`：已废弃（`@deprecated`），老模板仍兼容，自动映射为 `dataIndex`

**TableSummaryStyle:** `{ backgroundColor?, fontWeight?, fontSize?, textAlign?: 'left'|'center'|'right' }`

> 跨页：整组优先同页，超大组组内拆页并重复标题；小计仅组尾渲染；空 `summaryItems` 仅标签便于签字。

---

## 8. 管道 PipeConfig

```typescript
{ type: 'date', options: { format: 'YYYY-MM-DD' } }
{ type: 'money', options: { mode: 'none', format: 'chineseUppercase' } }
{ type: 'currency', options: { symbol: '¥', precision: 2 } }
{ type: 'chineseNumber', options: { mode: 'both' } }
```

内置：`date`、`currency`、`money`、`chineseNumber`、`uppercase`、`lowercase`、`slice`、`default`。自定义通过 `createPrintSDK({ customPipes: [{ type, label, execute }] })` 注入，模板中 `pipes: [{ type: 'myPipe' }]` 引用。

---

## 9. 数据绑定 DataBinding

```typescript
binding: {
  path: 'customer.name', // 点号路径 a.b.c，支持数组
  fallback: '-',         // 空值兜底
  pipes: [{ type: 'date', options: { format: 'YYYY-MM-DD' } }]
}
```

表格 `binding.path` 指向数组字段（如 `orders`），列 `dataIndex` 为子字段。

---

## 10. 工具函数

```typescript
import { groupByField } from '@jcyao/print-sdk';
groupByField(data, 'category', '未分类'); // => GroupedData[]

import type { GroupedData, TableGroupConfig } from '@jcyao/print-sdk';
```

完整类型见 `sdk/src/types.ts`，方法签名见 `sdk/src/PrintSDK.ts`。
