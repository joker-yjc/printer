# 表格列宽度调整 & 边框样式 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 支持表格每列独立设置宽度（mm）和边框虚实线样式，设计器中通过输入框/拖拽两种方式配置并实时预览。

**Architecture:** SDK 侧新增 `computeColWidths()` 替换均分逻辑、`borderStyle` 用于 CSS 生成；设计器侧在 TableColumnSection 增加宽度输入和边框样式下拉，TablePreview 增加列宽渲染、拖拽手柄和边框样式。

**Tech Stack:** TypeScript, React 18, Ant Design 6, Zustand, Vite 5

---

### Task 1: SDK 类型定义 — 新增 `rowNumberWidth` 和 `borderStyle`

**Files:**
- Modify: `sdk/src/types.ts`

- [ ] **Step 1: 在 TableProps 中新增两个字段**

在 `bordered?: boolean` 下方和 `rowNumberLabel?: string` 下方分别新增：

```typescript
// sdk/src/types.ts — 在 bordered?: boolean 之后新增（第 125 行后）
export interface TableProps {
  columns: TableColumn[];
  showHeader?: boolean;
  bordered?: boolean;
  /** 边框样式，默认 'solid'（仅在 bordered 为 true 时生效） */
  borderStyle?: 'solid' | 'dashed';
  repeatHeader?: boolean;
  // ...
  showRowNumber?: boolean;
  rowNumberLabel?: string;
  /** 行号列宽度（mm），不设置时自动分配 */
  rowNumberWidth?: number;
  // ...
}
```

- [ ] **Step 2: 编译验证 SDK**

```bash
cd /Users/joke/webcode/printer/sdk && npx tsc --noEmit
```

Expected: No errors related to types.ts

- [ ] **Step 3: Commit**

```bash
cd /Users/joke/webcode/printer && git add sdk/src/types.ts && git commit -m "feat(sdk): add rowNumberWidth and borderStyle to TableProps"
```

---

### Task 2: SDK TableRenderer — 实现 `computeColWidths` 和 `borderStyle`

**Files:**
- Modify: `sdk/src/printEngine/renderers/TableRenderer.ts`

- [ ] **Step 1: 在文件顶部新增 `computeColWidths` 函数**

在 `CellStyle` 接口定义之后、`assembleTableHTML` 函数之前插入：

```typescript
/**
 * 计算各列的宽度百分比
 * - 全部未设置 width → 均分（向后兼容）
 * - 部分设置 width → 固定列用 width，未设置列均分剩余空间
 * @param columns - 显示列列表
 * @param tableWidthMm - 表格总宽度 mm
 * @returns 每列的 CSS 百分比字符串（如 "25.00%"）
 */
function computeColWidths(
  columns: { width?: number }[],
  tableWidthMm: number
): string[] {
  const totalFixed = columns.reduce((sum, c) => sum + (c.width || 0), 0);
  const totalCols = columns.length;
  const unfixedCount = columns.filter(c => !c.width).length;

  // 全部未设置 → 均分（向后兼容）
  if (unfixedCount === totalCols) {
    return columns.map(() => `${(100 / totalCols).toFixed(2)}%`);
  }

  // 混合模式：固定列用 width，未设置列均分剩余
  const remainingMm = tableWidthMm - totalFixed;
  const unsetWidthMm = unfixedCount > 0
    ? Math.max(0, remainingMm / unfixedCount)
    : 0;

  return columns.map(col => {
    const wMm = col.width || unsetWidthMm;
    return `${((wMm / tableWidthMm) * 100).toFixed(2)}%`;
  });
}
```

- [ ] **Step 2: 修改列宽计算逻辑（替换均分）**

将第 140-142 行：
```typescript
    // ✅ 计算均分列宽（简化方案：按列数均分表格宽度）
    const colCount = displayColumns.length || 1;
    const colWidthPercent = (100 / colCount).toFixed(2);
```

替换为：
```typescript
    // ✅ 计算列宽：有 width 的固定，无 width 的均分剩余
    const colWidths = computeColWidths(displayColumns, tableWidthMm);
```

- [ ] **Step 3: 修改表头单元格渲染（使用各列独立宽度）**

将第 156 行的静态 `width: ${colWidthPercent}%` 改为使用数组索引：

```typescript
// 改前（第 156 行）：
return `<th style="${cellBorder} ${cellPadding} ${cellTextStyle} background: ${TABLE_STYLE_DEFAULT.HEADER_BACKGROUND}; font-weight: 600; text-align: ${textAlign}; width: ${colWidthPercent}%; min-height: ${headerHeightPx}px; box-sizing: border-box;">${title}</th>`;

// 改后：
return `<th style="${cellBorder} ${cellPadding} ${cellTextStyle} background: ${TABLE_STYLE_DEFAULT.HEADER_BACKGROUND}; font-weight: 600; text-align: ${textAlign}; width: ${colWidths[idx]}%; min-height: ${headerHeightPx}px; box-sizing: border-box;">${title}</th>`;
```

需要在 `.map((col, idx) => ...)` 中使用 idx 参数，注意如果当前是 `.map((col: any) => ...)`，改为 `.map((col: any, idx: number) => ...)`。

- [ ] **Step 4: 修改数据行单元格渲染**

同理修改数据行的 `<td>` 中的 `width`（约第 173-176 行，有两处：明细行和占位行），改为 `width: ${colWidths[idx]}%`。

- [ ] **Step 5: 修改合计行单元格渲染**

修改第 251 行左右合计行的 `<td>` width 为对应列的百分比。

- [ ] **Step 6: 修改边框样式**

将第 135 行：
```typescript
    const cellBorder = bordered ? `border: 1px solid ${TABLE_STYLE_DEFAULT.BORDER_COLOR};` : '';
```

改为：
```typescript
    const borderStyle = props?.borderStyle || 'solid';
    const cellBorder = bordered ? `border: 1px ${borderStyle} ${TABLE_STYLE_DEFAULT.BORDER_COLOR};` : '';
```

- [ ] **Step 7: 行号列宽度支持**

在构造 `displayColumns` 时（第 54-60 行），将行号列加上 width：

```typescript
    // 改前：
    const displayColumns = showRowNumber
      ? [rowNumberColumn, ...visibleColumns]
      : visibleColumns;

    // 改后：
    const rowNumberCol = showRowNumber ? [{ ...rowNumberColumn, width: props?.rowNumberWidth }] : [];
    const displayColumns = showRowNumber
      ? [...rowNumberCol, ...visibleColumns]
      : visibleColumns;
```

- [ ] **Step 8: 编译验证**

```bash
cd /Users/joke/webcode/printer/sdk && npx tsc --noEmit
```

Expected: No errors

- [ ] **Step 9: Commit**

```bash
cd /Users/joke/webcode/printer && git add sdk/src/printEngine/renderers/TableRenderer.ts && git commit -m "feat(sdk): implement computeColWidths and borderStyle in TableRenderer"
```

---

### Task 3: 设计器类型同步

**Files:**
- Modify: `designer/src/types/index.ts`

- [ ] **Step 1: 同步 SDK 新增的 TableProps 字段**

在 `designer/src/types/index.ts` 中，TableProps（或 component props）对应的类型中新增 `borderStyle` 和 `rowNumberWidth`。

查找 `TableProps` 或 `ComponentNode` 中的 `props` 类型定义，在 `bordered` 附近新增：

```typescript
  bordered?: boolean;
  /** 边框样式 */
  borderStyle?: 'solid' | 'dashed';
```

在 `showRowNumber`/`rowNumberLabel` 附近新增：

```typescript
  showRowNumber?: boolean;
  rowNumberLabel?: string;
  /** 行号列宽度（mm） */
  rowNumberWidth?: number;
```

- [ ] **Step 2: 编译验证**

```bash
cd /Users/joke/webcode/printer/designer && npm run build 2>&1 | head -20
```

Expected: No type errors related to these fields

- [ ] **Step 3: Commit**

```bash
cd /Users/joke/webcode/printer && git add designer/src/types/index.ts && git commit -m "feat(designer): sync rowNumberWidth and borderStyle types"
```

---

### Task 4: 设计器 TableColumnSection — 列宽度输入、边框样式下拉、校验

**Files:**
- Modify: `designer/src/pages/Designer/components/PropertyPanel/TableColumnSection.tsx`

- [ ] **Step 1: 新增 `handleColumnWidthChange` 处理函数**

在现有的 `handleColumnDataIndexChange` 之后（约第 48 行）新增：

```typescript
  const handleColumnWidthChange = (index: number, width: number | null) => {
    const columns = [...(component.props?.columns || [])];
    columns[index] = { ...columns[index], width: width ?? undefined };
    onPropsChange('columns', columns);
  };
```

- [ ] **Step 2: 新增 `computeColumnMaxWidth` 工具函数**

在同文件顶部（组件函数之前）新增：

```typescript
/**
 * 计算某列的最大允许宽度
 * = 表格宽度 - 其他列固定宽度总和
 */
function computeColumnMaxWidth(
  columns: { width?: number }[],
  index: number,
  tableWidthMm: number
): number {
  const otherFixed = columns.reduce((sum, col, i) =>
    i !== index ? sum + (col.width || 0) : sum, 0
  );
  return Math.max(1, tableWidthMm - otherFixed);
}
```

- [ ] **Step 3: 在列配置面板每列中添加宽度 InputNumber**

在 dataIndex 的 Input（约第 422-428 行）之后，合计配置 Collapse 之前（即 dataIndex Input 的闭合 `/>` 之后，第 428 行后），新增：

```tsx
                   {/* 新增宽度输入 */}
                   <div>
                     <Text type="secondary" style={{ fontSize: 12 }}>宽度 (mm)</Text>
                     <InputNumber
                       size="small"
                       style={{ width: '100%', marginTop: 4 }}
                       min={1}
                       max={computeColumnMaxWidth(
                         component.props?.columns || [],
                         index,
                         component.layout?.widthMm || 200
                       )}
                       placeholder="自动"
                       suffix="mm"
                       value={col.width}
                       onChange={(v) => handleColumnWidthChange(index, v)}
                     />
                   </div>
```

- [ ] **Step 4: 在"显示边框"旁增加边框样式下拉**

在第 156-159 行 `bordered` Checkbox 下方新增：

```tsx
        <div className={styles["property-item"]}>
          <Checkbox
            checked={component.props?.bordered !== false}
            onChange={(e) => onPropsChange('bordered', e.target.checked)}
          >
            显示边框
          </Checkbox>
          {component.props?.bordered !== false && (
            <Select
              size="small"
              style={{ width: 100, marginTop: 8 }}
              value={component.props?.borderStyle || 'solid'}
              onChange={(v) => onPropsChange('borderStyle', v)}
              options={[
                { label: '实线', value: 'solid' },
                { label: '虚线', value: 'dashed' },
              ]}
            />
          )}
        </div>
```

把原有的 `bordered` Checkbox 的样式 `property-item` wrapper 替换为上面的结构（合并边框和样式）。

- [ ] **Step 5: 在"显示序号列"旁增加行号列宽度输入**

在第 349-358 行的 `rowNumberLabel` Input 下方新增：

```tsx
        {component.props?.showRowNumber && (
          <>
            <div className={styles["property-item"]}>
              <Text className={styles["property-label"]}>序号列标题</Text>
              <Input
                size="small"
                placeholder="默认：序号"
                value={component.props?.rowNumberLabel || ''}
                onChange={(e) => onPropsChange('rowNumberLabel', e.target.value)}
              />
            </div>
            {/* 新增行号列宽度 */}
            <div className={styles["property-item"]}>
              <Text className={styles["property-label"]}>序号列宽度 (mm)</Text>
              <InputNumber
                size="small"
                style={{ width: '100%' }}
                min={1}
                placeholder="自动"
                suffix="mm"
                value={component.props?.rowNumberWidth}
                onChange={(v) => onPropsChange('rowNumberWidth', v ?? undefined)}
              />
            </div>
          </>
        )}
```

- [ ] **Step 6: 编译验证**

```bash
cd /Users/joke/webcode/printer/designer && npm run build 2>&1 | tail -5
```

Expected: Build success

- [ ] **Step 7: Commit**

```bash
cd /Users/joke/webcode/printer && git add designer/src/pages/Designer/components/PropertyPanel/TableColumnSection.tsx && git commit -m "feat(designer): add column width, row number width, and border style inputs"
```

---

### Task 5: 设计器 TablePreview — 列宽渲染、边框样式、拖拽调整

**Files:**
- Modify: `designer/src/pages/Designer/components/Canvas/componentRenderers/TablePreview.tsx`

- [ ] **Step 1: 新增 `computeColWidths` 工具函数和导入**

在 TablePreview 组件函数之前，复制 SDK 的 `computeColWidths` 函数（简化版，不需要 SDK 的完整上下文）：

```typescript
import { pxToMm, MM_TO_PX_BASE } from '../../../../../utils/zoom';
import { useDesignerStore } from '../../../../../store/designer';
import { useState, useRef, useCallback, useEffect } from 'react';

function computeColWidths(
  columns: { width?: number }[],
  tableWidthMm: number
): string[] {
  const totalFixed = columns.reduce((sum, c) => sum + (c.width || 0), 0);
  const totalCols = columns.length;
  const unfixedCount = columns.filter(c => !c.width).length;
  if (unfixedCount === totalCols) {
    return columns.map(() => `${(100 / totalCols).toFixed(2)}%`);
  }
  const remainingMm = tableWidthMm - totalFixed;
  const unsetWidthMm = unfixedCount > 0 ? Math.max(0, remainingMm / unfixedCount) : 0;
  return columns.map(col => {
    const wMm = col.width || unsetWidthMm;
    return `${((wMm / tableWidthMm) * 100).toFixed(2)}%`;
  });
}

/**
 * 计算某列的最大允许宽度
 */
function computeColumnMaxWidth(
  columns: { width?: number }[],
  index: number,
  tableWidthMm: number
): number {
  const otherFixed = columns.reduce((sum, col, i) =>
    i !== index ? sum + (col.width || 0) : sum, 0
  );
  return Math.max(1, tableWidthMm - otherFixed);
}
```

- [ ] **Step 2: 使用列宽百分比渲染表头和占位单元格**

修改组件主体，使用计算出的列宽：

```tsx
export const TablePreview = ({ component }: TablePreviewProps) => {
  const columns = component.props?.columns || [];
  const bordered = component.props?.bordered !== false;
  const borderStyle = component.props?.borderStyle || 'solid';
  const showHeader = component.props?.showHeader !== false;
  const visibleColumns = columns.filter((col: any) => !col.hidden);
  const showRowNumber = component.props?.showRowNumber === true;
  const rowNumberLabel = component.props?.rowNumberLabel || '序号';
  const tableTextAlign = component.style?.textAlign || 'left';

  // 计算列宽
  const tableWidthMm = component.layout?.widthMm || 200;
  const displayCols = showRowNumber
    ? [{ dataIndex: '__rowNumber', title: rowNumberLabel, width: component.props?.rowNumberWidth }, ...visibleColumns]
    : visibleColumns;
  const colWidths = computeColWidths(displayCols, tableWidthMm);
```

- [ ] **Step 3: 修改表头渲染——逐列设置宽度**

修改表头 `<th>` 部分，为每列设置 width 和拖拽手柄：

```tsx
      {showHeader && displayCols.length > 0 && (
        <thead>
          <tr>
            {displayCols.map((col: any, idx: number) => {
              const isRowNum = col.dataIndex === '__rowNumber';
              return (
                <th key={idx} style={{
                  width: colWidths[idx],
                  border: bordered ? `1px ${borderStyle} #d9d9d9` : 'none',
                  padding: '8px',
                  background: '#fafafa',
                  fontWeight: 600,
                  textAlign: isRowNum ? 'center' : (tableTextAlign as any),
                }}>
                  {col.title || col.dataIndex}
                </th>
              );
            })}
          </tr>
        </thead>
      )}
```

- [ ] **Step 4: 修改空数据行渲染——逐列设置宽度**

替换 `<td colSpan={...}>` 为空列：

```tsx
      <tbody>
        <tr>
          {displayCols.map((col: any, idx: number) => (
            <td key={idx} style={{
              width: colWidths[idx],
              border: bordered ? `1px ${borderStyle} #d9d9d9` : 'none',
              padding: '8px',
              textAlign: 'center',
              color: '#999',
            }}>
              暂无数据
            </td>
          ))}
        </tr>
      </tbody>
```

> **简化处理**：空数据时每列都显示"暂无数据"，而非跨列合并。这也是合理的（展示列宽效果）。

- [ ] **Step 5: 编译验证**

```bash
cd /Users/joke/webcode/printer/designer && npm run build 2>&1 | tail -5
```

Expected: Build success

- [ ] **Step 6: 实现拖拽手柄 Hook**

在文件顶部新增拖拽逻辑 Hook：

```typescript
/**
 * 列宽拖拽调整 Hook
 */
function useColumnResize(
  onWidthChange: (colIndex: number, widthMm: number) => void
) {
  const zoomLevel = useDesignerStore(s => s.zoomLevel);
  const [resizing, setResizing] = useState<{ index: number; startX: number; originalWidth: number; maxWidth: number } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent, colIndex: number, colWidthMm: number, maxWidth: number) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing({ index: colIndex, startX: e.clientX, originalWidth: colWidthMm, maxWidth });
  }, []);

  useEffect(() => {
    if (!resizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const deltaPx = e.clientX - resizing.startX;
      const deltaMm = pxToMm(deltaPx, zoomLevel);
      const newWidth = Math.max(1, Math.min(resizing.maxWidth, resizing.originalWidth + deltaMm));
      onWidthChange(resizing.index, Math.round(newWidth * 10) / 10);
    };
    const handleMouseUp = () => setResizing(null);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, zoomLevel, onWidthChange]);

  return { resizing, handleMouseDown };
}
```

- [ ] **Step 7: 在 TablePreview 中集成拖拽**

在组件内部接入 `useColumnResize` 和 `updateComponent`：

```tsx
  // 拖拽调整列宽
  const updateComponent = useDesignerStore(s => s.updateComponent);
  const handleColumnWidthChange = useCallback((colIdx: number, widthMm: number) => {
    const realIdx = showRowNumber ? colIdx - 1 : colIdx;
    if (realIdx < 0) {
      // 拖拽的是行号列，更新 rowNumberWidth
      updateComponent(component.id, {
        props: { ...component.props, rowNumberWidth: widthMm },
      });
    } else {
      const cols = [...(component.props?.columns || [])];
      cols[realIdx] = { ...cols[realIdx], width: widthMm };
      updateComponent(component.id, {
        props: { ...component.props, columns: cols },
      });
    }
  }, [component, showRowNumber, updateComponent]);
  const { resizing, handleMouseDown } = useColumnResize(handleColumnWidthChange);
```

- [ ] **Step 8: 在表头每列右边界添加拖拽手柄**

在表头 `<th>` 的每个单元格内，`{col.title || col.dataIndex}` 之后追加：

```tsx
                <div
                  onMouseDown={(e) => {
                    const colMm = parseFloat(colWidths[idx]) / 100 * tableWidthMm;
                    const maxW = computeColumnMaxWidth(displayCols, idx, tableWidthMm);
                    handleMouseDown(e, idx, colMm, maxW);
                  }}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: 6,
                    cursor: 'col-resize',
                    background: resizing?.index === idx ? '#1890ff' : 'transparent',
                    opacity: resizing?.index === idx ? 0.4 : 0,
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '0.3'; }}
                  onMouseLeave={(e) => {
                    if (resizing?.index !== idx) {
                      (e.target as HTMLElement).style.opacity = '0';
                    }
                  }}
                />
```

**注意**：`<th>` 需要设置 `position: 'relative'` 才能让绝对定位手柄生效。

- [ ] **Step 9: 增加拖拽时 tooltip 显示当前宽度**

在组件顶部渲染拖拽提示（在 `<table>` 的外层容器中）：

```tsx
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {resizing && (
        <div style={{
          position: 'fixed',
          top: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1890ff',
          color: '#fff',
          padding: '4px 12px',
          borderRadius: 4,
          fontSize: 12,
          zIndex: 9999,
        }}>
          {Math.round(parseFloat(colWidths[resizing.index]) / 100 * tableWidthMm)} mm
        </div>
      )}
      <table style={{ ... }}>
        {/* ... */}
      </table>
    </div>
  );
```

- [ ] **Step 10: 编译验证**

```bash
cd /Users/joke/webcode/printer/designer && npm run build 2>&1 | tail -5
```

Expected: Build success

- [ ] **Step 11: Commit**

```bash
cd /Users/joke/webcode/printer && git add designer/src/pages/Designer/components/Canvas/componentRenderers/TablePreview.tsx && git commit -m "feat(designer): add column width rendering, border style, and drag resize to table preview"
```

---

### Task 6: 集成测试验证

- [ ] **Step 1: 启动开发环境验证**

```bash
cd /Users/joke/webcode/printer/designer && npm run dev
```

打开 http://localhost:5173，进入设计器，添加表格组件：
1. 勾选"显示序号列"→ 出现序号列宽度输入
2. 在列配置中修改某列的宽度（如输入 60mm）→ 画布预览该列变宽、其他列均分剩余
3. 拖拽表头列右边界 → 列宽实时变化，tooltip 显示当前 mm
4. 修改边框样式为虚线 → 画布预览变为虚线
5. 将表格的 layout.widthMm 改小 → 列宽的 max 约束随之变化

- [ ] **Step 2: 构建 Demo 验证**

```bash
cd /Users/joke/webcode/printer/designer && npm run build:demo
cd dist && python3 -m http.server 4173
```

打开 http://localhost:4173，验证同 Step 1 的功能。

- [ ] **Step 3: SDK 侧验证**

确认现有的示例模板打印输出正确：列宽不再均分、边框样式生效。

- [ ] **Step 4: Commit (if any fixes)**

```bash
cd /Users/joke/webcode/printer && git add -A && git commit -m "test: verify column width and border style integration"
```
