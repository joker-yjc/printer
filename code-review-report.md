# 代码审查报告：表格列宽功能（b8881bb → 4747b91）

> **审查范围**：`b8881bbde89163652e2ee4ba4d1f77c01d18379b` → `4747b91`（8 个提交）
> **涉及文件**：`sdk/src/types.ts`、`sdk/src/printEngine/renderers/TableRenderer.ts`、`designer/src/types/index.ts`、`designer/.../TablePreview.tsx`、`designer/.../TableColumnSection.tsx`
> **审查日期**：2026-05-19

---

## Critical Issues (MUST FIX)

### 1. `computeColWidths` 除零错误 — columns 数组为空时返回 `"Infinity%"`

**位置**：[`sdk/src/printEngine/renderers/TableRenderer.ts#L46-L47`](sdk/src/printEngine/renderers/TableRenderer.ts) · [`designer/src/pages/Designer/components/Canvas/componentRenderers/TablePreview.tsx#L17-L18`](designer/src/pages/Designer/components/Canvas/componentRenderers/TablePreview.tsx)

**问题**：当所有列被隐藏且 `showRowNumber` 为 false 时，`columns.length === 0`。快速路径 `unfixedCount === totalCols`（均为 0）计算 `100 / 0` → `"Infinity%"`，生成无效 CSS。同时 TablePreview 中 `colSpan={displayCols.length}` 变成 `colSpan={0}`，浏览器行为不确定。

**修复**：

```typescript
// 在 computeColWidths 函数顶部添加守卫（两处都需要）
function computeColWidths(
  columns: { width?: number }[],
  tableWidthMm: number
): string[] {
  if (columns.length === 0) return [];  // ← 添加这行
  const totalFixed = columns.reduce((sum, c) => sum + (c.width || 0), 0);
  // ...
}
```

```tsx
// TablePreview.tsx L181
<td colSpan={displayCols.length || 1} style={{...}}>
```

---

### 2. PropertyPanel 的 `computeColumnMaxWidth` 未扣除行号列宽度

**位置**：[`designer/src/pages/Designer/components/PropertyPanel/TableColumnSection.tsx#L482-L486`](designer/src/pages/Designer/components/PropertyPanel/TableColumnSection.tsx)

**问题**：属性面板计算列最大宽度时只传入了普通列数组，未包含行号列。当 `rowNumberWidth` 设为 30mm 且表格宽 200mm 时，max 会多算 30mm，导致用户可输入超出实际可用空间的宽度。

**修复**：将行号列纳入计算：

```tsx
// 需要构造包含行号列的完整列数组
const allCols = component.props?.showRowNumber && component.props?.rowNumberWidth
  ? [{ width: component.props.rowNumberWidth }, ...(component.props?.columns || [])]
  : (component.props?.columns || []);
const idxOffset = component.props?.showRowNumber ? 1 : 0;

max={computeColumnMaxWidth(allCols, index + idxOffset, component.layout?.widthMm || 200)}
```

---

### 3. Designer 和 SDK 行号列哨兵值不一致：`__rowNumber` vs `__row_number__`

**位置**：[`designer/.../TablePreview.tsx#L103`](designer/src/pages/Designer/components/Canvas/componentRenderers/TablePreview.tsx) · [`sdk/.../TableRenderer.ts#L93`](sdk/src/printEngine/renderers/TableRenderer.ts)

**问题**：Designer 使用 `dataIndex: '__rowNumber'`，SDK 使用 `dataIndex: '__row_number__'`。SDK 中多处通过 `=== '__row_number__'` 判断来跳过行号列（如 `renderSummary` L277）。若未来 designer 引入合计行预览，会导致错误匹配。

**修复**：将 Designer 中的 `'__rowNumber'` 全部改为 `'__row_number__'`（涉及 L103、L147）。

---

### 4. XSS/HTML 注入 — 用户可控的列标题和数据值未转义

**位置**：[`sdk/src/printEngine/renderers/TableRenderer.ts#L193-L216`](sdk/src/printEngine/renderers/TableRenderer.ts)

**问题**：列标题（`col.title`）、数据值（`getByPath(...)`）、合计标签（`summaryLabel`）直接拼接进 HTML 模板字面量，无任何转义。

**修复**：添加 HTML 转义函数并应用到所有用户输入：

```typescript
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

应用到：L195（title）、L215（value）、L280（summaryLabel）、L298（content）、L484（extra-row text）。

---

### 5. 列宽拖拽导致历史记录污染 — 每个 mousemove 帧都深拷贝并推入历史栈

**位置**：[`designer/.../TablePreview.tsx#L73-L74`](designer/src/pages/Designer/components/Canvas/componentRenderers/TablePreview.tsx) · [`designer/src/store/designer.ts`](designer/src/store/designer.ts)

**问题**：拖拽时每次 `mousemove`（~60fps）调用 `updateComponent` → `saveHistory` → `JSON.parse(JSON.stringify(state.components))`，导致：
1. Ctrl+Z 只撤销单个拖拽帧（中间态），而非跳回拖拽前
2. 20 步历史栈被一次拖拽填满
3. 每次 mousemove 对整个 components 数组深拷贝，大模板下性能压力显著

**修复**：拖拽期间用本地 state 暂存中间值，仅在 `mouseup` 时提交一次到 store：

```tsx
// useColumnResize 改造：
const [localWidths, setLocalWidths] = useState<Record<number, number>>({});

useEffect(() => {
  if (!resizing) return;
  const handleMouseMove = (e: MouseEvent) => {
    // ... 计算 newWidth
    // 仅更新本地状态，不触发 store
    setLocalWidths(prev => ({ ...prev, [resizing.index]: newWidth }));
  };
  const handleMouseUp = () => {
    // mouseup 时一次性提交到 store
    const finalWidth = localWidths[resizing.index];
    if (finalWidth !== undefined) {
      onWidthChange(resizing.index, finalWidth);
    }
    setLocalWidths({});
    setResizing(null);
  };
  // ...
}, [resizing, zoomLevel, onWidthChange]);
```

---

## Warnings (SHOULD FIX)

### 6. 边框样式 Select 被隐藏而非 disabled，违背设计规格

**位置**：[`designer/.../TableColumnSection.tsx#L181-L192`](designer/src/pages/Designer/components/PropertyPanel/TableColumnSection.tsx)

**问题**：设计文档规定 `bordered` 为 false 时 Select 应 `disabled`（灰化），但实现使用条件渲染将其完全隐藏。用户关闭边框后无法看到当前 `borderStyle` 设置。

**修复**：始终渲染 Select，用 `disabled` 属性控制：

```tsx
<Select
  size="small"
  style={{ width: 100, marginTop: 8 }}
  value={component.props?.borderStyle || 'solid'}
  onChange={(v) => onPropsChange('borderStyle', v)}
  disabled={component.props?.bordered === false}
  options={[
    { label: '实线', value: 'solid' },
    { label: '虚线', value: 'dashed' },
  ]}
/>
```

---

### 7. Designer 的 `computeColWidths` 缺少最小表格宽度保护

**位置**：[`designer/.../TablePreview.tsx#L101`](designer/src/pages/Designer/components/Canvas/componentRenderers/TablePreview.tsx)

**问题**：`tableWidthMm = component.layout?.widthMm || 200`，当 `widthMm` 被显式设为极小正数（如 0.5）时，`||` 不触发。若固定列宽之和超过 `tableWidthMm`，最后一列 `100 - sumPrev` 会变为负数。

**修复**：

```tsx
const tableWidthMm = Math.max(10, component.layout?.widthMm || 200);
```

---

### 8. `computeColWidths` 最后一列舍入公式在大量列时仍可能超过 100%

**位置**：[`sdk/.../TableRenderer.ts#L55-L67`](sdk/src/printEngine/renderers/TableRenderer.ts) · 同样存在于 [`designer/.../TablePreview.tsx#L22-L34`](designer/src/pages/Designer/components/Canvas/componentRenderers/TablePreview.tsx)

**问题**：前 N-1 列各自调用 `.toFixed(2)` 独立四舍五入。若多列同时向下舍入（累积误差 > 0.005%），`100 - sumPrev` 会超过 100%。

**修复**：对最后列的值做 clamp：

```typescript
const lastPct = Math.min(100, Math.max(0, 100 - sumPrev));
return `${lastPct.toFixed(2)}%`;
```

---

### 9. `computeColWidths` 在 SDK 和 Designer 中重复定义，存在分裂风险

**位置**：[`sdk/.../TableRenderer.ts#L38-L68`](sdk/src/printEngine/renderers/TableRenderer.ts) · [`designer/.../TablePreview.tsx#L10-L35`](designer/src/pages/Designer/components/Canvas/componentRenderers/TablePreview.tsx)

**问题**：同一函数在两处完全复制。任何一方的算法修改未同步到另一方，将导致预览列宽与打印列宽不一致。

**修复**：从 SDK 导出并让 Designer import 复用：

```typescript
// SDK 侧导出 computeColWidths（放 TableRenderer.ts 或新建 utils/colWidths.ts）
export function computeColWidths(...) { ... }

// Designer 侧引用
import { computeColWidths } from '@jcyao/print-sdk';
```

---

## Suggestions (CONSIDER)

### 10. 所有列都设置了 width 且总和超过表格宽度时无约束或警告

**位置**：[`sdk/.../TableRenderer.ts#L38-L68`](sdk/src/printEngine/renderers/TableRenderer.ts)

**问题**：当所有列都有固定宽度且 `totalFixed > tableWidthMm` 时，百分比之和超过 100%，CSS 表格溢出。Designer 侧 InputNumber.max 只在逐列修改时有效，导入模板时无法防御。

**修复（低优先级）**：在 `computeColWidths` 中添加比例归一化分支：

```typescript
if (totalFixed >= tableWidthMm) {
  return columns.map(col => `${((col.width || 0) / totalFixed * 100).toFixed(2)}%`);
}
```

---

### 11. Designer 硬编码 tableWidthMm = 200 与 SDK 自动计算不一致

**位置**：[`designer/.../TablePreview.tsx#L101`](designer/src/pages/Designer/components/Canvas/componentRenderers/TablePreview.tsx)

**问题**：Preview 使用硬编码 200mm，但 SDK 根据 `pageInfo.widthMm - marginMm.right - xMm` 动态计算。导致预览中的列宽比例与打印输出不一致，破坏所见即所得。

**修复**：从 store 的 `pageConfig` 获取实际页面宽度来计算。

---

### 12. 设计规格中的"总宽度超限 → 标红 + tooltip"验证未实现

**位置**：[`designer/.../TableColumnSection.tsx`](designer/src/pages/Designer/components/PropertyPanel/TableColumnSection.tsx)

**问题**：设计文档规定当所有列宽之和 + rowNumberWidth 超过 tableWidthMm 时应标红并显示 tooltip，但实现中完全缺失。

**修复**：在 `onChange` 中检查总宽度是否超限，超限时设置 InputNumber 的 `status="error"`。

---

## Summary of Changes

1. **SDK 新增** `borderStyle` 和 `rowNumberWidth` 两个可选 TableProps，`computeColWidths` 函数实现列宽百分比计算（支持均分/部分固定/全固定模式），表头/表体/合计行全部使用新列宽
2. **Designer 新增** 列宽拖拽调整功能（`useColumnResize` hook + 拖拽手柄 + 实时宽度提示 tooltip），属性面板新增每列宽度输入、行号列宽度输入、边框样式选择器
3. **Designer 修复** `TablePreview` 全面重构：表头列宽渲染使用 `computeColWidths`，空表格使用 `colSpan` 合并单元格，`borderStyle` 应用于边框
4. **修复提交** 移除了列宽百分比重复 `%` 符号，为 `computeColWidths` 最后一列添加舍入误差吸收逻辑
5. **文档变更** 4 个设计/规划文档在范围内（均为新增，无需审查）
