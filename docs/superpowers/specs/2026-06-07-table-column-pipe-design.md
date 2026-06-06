# 表格列管道功能 & DataField 通用化设计

## 概述

将管道(Pipe)功能从普通组件的 `DataBinding` 扩展到表格列(`TableColumn`)，同时抽象出通用的 `DataField` 接口，使管道能力可被多种组件/字段复用。

## 需求决策

| 决策项 | 结论 |
|--------|------|
| 管道类型限制 | 全部开放，不做限制 |
| 通用化范围 | 数据模型统一 + UI 组件复用 |
| 列级 Fallback | 不需要，用 `default` 管道代替 |
| 画布预览 | 保持现状，不展示管道效果（仅打印预览可见） |
| 方案选择 | 方案 A：DataField 接口抽取 |

## 1. 数据模型

### 1.1 新增 `DataField` 接口

位置：`sdk/src/types.ts`

```typescript
/**
 * 可应用管道转换的数据字段
 * 表示一个可附加管道链的数据点，用于统一 DataBinding、TableColumn 等场景的管道能力
 */
export interface DataField {
  /** 数据管道列表，按顺序执行，前一个输出作为后一个输入 */
  pipes?: PipeConfig[];
}
```

### 1.2 现有类型调整

```typescript
// DataBinding 扩展 DataField
export interface DataBinding extends DataField {
  path?: string;
  fallback?: string;
}

// TableColumn 扩展 DataField
export interface TableColumn extends DataField {
  dataIndex: string;
  title: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  hidden?: boolean;
  summary?: TableColumnSummary;
  style?: TableColumnStyle;
  headerStyle?: TableColumnStyle;
}

// SummaryExtraRowItem 实现 DataField（仅类型标注，已有 pipes 字段）
export interface SummaryExtraRowItem extends DataField {
  label?: string;
  sourceColumn?: string;
}
```

### 1.3 特殊说明：`TableColumnSummary.pipe`

`TableColumnSummary` 现有 `pipe?: PipeConfig`（单个管道），与 `DataField.pipes`（数组）语义不同：

- **保留** `pipe` 字段不变，向后兼容
- `TableColumnSummary` 不继承 `DataField`（避免字段冲突）
- 新场景中统一使用 `DataField.pipes`（数组）

## 2. SDK 渲染层

### 2.1 TableRenderer 数据行渲染

文件：`sdk/src/printEngine/renderers/TableRenderer.ts`

在数据单元格取值后应用列级管道：

```typescript
// 当前逻辑
const value = getByPath(row, col.dataIndex) ?? '';

// 改为
let value = getByPath(row, col.dataIndex) ?? '';
if (col.pipes && col.pipes.length > 0) {
  try {
    for (const pipe of col.pipes) {
      const executor = getExecutor(pipe.type);
      if (executor) {
        value = executor.execute(value, pipe.options);
      }
    }
  } catch (pipeError) {
    console.error('[TableRenderer] 列管道执行失败:', pipeError);
    // 降级：保留原始值
    value = getByPath(row, col.dataIndex) ?? '';
  }
}
```

### 2.2 错误处理策略

- 管道执行失败时保留原始值，降级输出
- 与 `renderSummaryExtraRows` 中的 try-catch 策略保持一致
- 不因单个单元格管道错误中断整行/整表渲染

### 2.3 渲染链路

```
getByPath(row, col.dataIndex)
  → applyPipes(value, col.pipes)   // 新增：列级管道链
  → escapeHtml(String(value))
  → 输出到 <td>
```

### 2.4 不需要改动的部分

- `estimateHeight()` — 管道不影响高度计算
- `pipes/registry.ts` — 管道注册和执行器无需改动
- `printEngine.ts` — `applyPipes`/`executePipe` 已存在，TableRenderer 可直接通过 `getExecutor` 调用

## 3. 设计器 UI 层

### 3.1 新建通用 `PipeConfigPanel` 组件

位置：`designer/src/components/PipeConfigPanel/index.tsx`

```typescript
interface PipeConfigPanelProps {
  /** 当前管道配置列表 */
  pipes?: PipeConfig[];
  /** 管道配置变更回调 */
  onChange: (pipes: PipeConfig[]) => void;
  /** 可选：限制可用的管道类型（不传则全部开放） */
  availablePipes?: string[];
}
```

功能：
- 顶部 Select 下拉添加管道（使用 `getAllPipes()`，可通过 `availablePipes` 过滤）
- 已添加管道列表，每个管道卡片包含：
  - 类型标签（Tag）
  - 删除按钮
  - 配置器 UI（通过 `getConfigurator()` 渲染）
- 无管道时不显示列表区域

### 3.2 DataBindingSection 改造

文件：`designer/src/pages/Designer/components/PropertyPanel/DataBindingSection.tsx`

移除内联的管道配置代码（Select + 管道列表渲染），替换为：

```tsx
<PipeConfigPanel
  pipes={component.binding?.pipes}
  onChange={(pipes) => onBindingChange('pipes', pipes.length > 0 ? pipes : undefined)}
/>
```

### 3.3 TableColumnSection 列配置

文件：`designer/src/pages/Designer/components/PropertyPanel/TableColumnSection.tsx`

在每列的折叠面板中，在 `width`、`align` 等基础配置之后、`summary` 配置之前，新增管道配置区块：

```tsx
{/* 管道转换 */}
<div className={`${styles["property-item"]} ${styles["property-item-full"]}`}>
  <Text className={styles["property-label"]}>管道转换</Text>
  <PipeConfigPanel
    pipes={col.pipes}
    onChange={(newPipes) => handleColumnPipesChange(colIndex, newPipes)}
  />
</div>
```

新增事件处理函数：

```typescript
const handleColumnPipesChange = (index: number, pipes: PipeConfig[]) => {
  const columns = [...(component.props?.columns || [])];
  columns[index] = { ...columns[index], pipes: pipes.length > 0 ? pipes : undefined };
  onPropsChange('columns', columns);
};
```

### 3.4 合计额外行管道配置

现有 `TableColumnSection` 中合计额外行的内联管道配置，改用 `<PipeConfigPanel />`，通过 `availablePipes` 限制只允许 `chineseNumber` 和 `money`：

```tsx
<PipeConfigPanel
  pipes={item.pipes}
  onChange={(newPipes) => handleExtraRowItemChange(rowIndex, itemIndex, 'pipes', newPipes.length > 0 ? newPipes : undefined)}
  availablePipes={['chineseNumber', 'money']}
/>
```

## 4. 影响范围

### 4.1 文件改动清单

| 层级 | 文件 | 改动类型 |
|------|------|----------|
| SDK 类型 | `sdk/src/types.ts` | 新增 `DataField`；`DataBinding`/`TableColumn`/`SummaryExtraRowItem` 继承 |
| SDK 导出 | `sdk/src/index.ts` | 导出 `DataField` 类型 |
| SDK 渲染 | `sdk/src/printEngine/renderers/TableRenderer.ts` | 数据行取值后应用列级管道 |
| Designer 类型 | `designer/src/types/index.ts` | 同步 SDK 类型变更 |
| Designer 新组件 | `designer/src/components/PipeConfigPanel/index.tsx` | **新建**通用管道配置面板 |
| Designer 属性面板 | `DataBindingSection.tsx` | 替换内联管道 UI 为 `PipeConfigPanel` |
| Designer 属性面板 | `TableColumnSection.tsx` | 列配置加入 `PipeConfigPanel`；合计额外行改用 `PipeConfigPanel` |

### 4.2 不需要改动

- `TablePreview.tsx` — 画布预览保持现状
- `printEngine.ts` — 已有 `applyPipes`，TableRenderer 直接用 `getExecutor`
- `estimateHeight` — 管道不影响高度
- `pipes/registry.ts` — 管道注册机制无需改动
- 各管道执行器 — 无需改动
- `pipes/configurators/` — 现有配置器全部复用

### 4.3 向后兼容性

- `DataField.pipes` 为可选字段，旧模板无此字段时行为不变
- `DataBinding` 改为 `extends DataField` 是纯类型层面变更，序列化数据格式不变
- SDK 版本可通过 minor 发布（新增功能，无破坏性变更）
