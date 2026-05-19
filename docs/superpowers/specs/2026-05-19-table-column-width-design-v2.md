# 表格列宽度调整功能 设计文档 v2

> 版本：v2.0 | 日期：2026-05-19
> 上一版：[v1.0](./2026-05-15-table-column-width-design.md)
> 状态：设计完成，待实现

---

## 一、背景与现状

当前表格组件采用**均分列宽策略**（`100 / colCount`%），`TableColumn.width` 字段已定义但未在渲染中使用。客户反馈需要对不同列设置不同宽度（如"商品名称"需要 60mm，"序号"只需 15mm）。

### 涉及模块

| 模块 | 当前行为 |
|------|----------|
| `TableRenderer.ts` (SDK) | `colWidthPercent = 100 / colCount`，忽略 `col.width` |
| `TablePreview.tsx` (设计器) | `width: 100%` 整表均分，不显示列宽差异 |
| `TableColumnSection.tsx` (设计器) | 无宽度输入框 |
| `types.ts` (SDK + 设计器) | `width?: number` 已定义，未使用 |

---

## 二、需求决策记录

| 决策点 | 选择 | 原因 |
|--------|------|------|
| 交互方式 | Phase 1 输入框，Phase 2 拖拽（暂不做） | 快速交付，预留扩展 |
| 行号列宽度 | 支持配置 | 用户明确需要 |
| 默认行为（width 为空） | 均分 | 向后兼容，有宽度才固定 |
| 溢出处理 | 设计器严格校验，禁止超出 | SDK 不做校验 |
| 宽度单位 | mm | 与整个坐标系统一 |

---

## 三、数据模型变更

### 3.1 SDK 类型 (`sdk/src/types.ts`)

```typescript
export interface TableProps {
  // ... 现有字段 ...
  /** 行号列宽度（mm），不设置时自动分配 */
  rowNumberWidth?: number;
}
```

`TableColumn.width?: number` — 语义从"已定义但忽略"变为"固定宽度 mm，空=自动均分"。

### 3.2 设计器类型 (`designer/src/types/index.ts`)

同步新增 `rowNumberWidth`，`TableColumn.width` 无需改动。

---

## 四、SDK 渲染逻辑

### 4.1 核心算法 (`TableRenderer.ts`)

```typescript
/**
 * 计算各列的宽度百分比
 * @param columns - 显示列列表（含行号列）
 * @param tableWidthMm - 表格总宽度 mm
 * @returns 每列的 CSS 百分比字符串
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

### 4.2 行号列

行号列放入 `displayColumns` 前面时，附带 `{ width: props.rowNumberWidth }` 参与计算。

### 4.3 HTML 模板和分页

无需改动。HTML 模板已使用百分比 width，测量高度和分页自动适配真实列宽。

---

## 五、设计器 UI

### 5.1 列配置面板 (`TableColumnSection.tsx`)

每列配置区新增 `InputNumber`：

```tsx
<Form.Item label="宽度(mm)">
  <InputNumber
    min={1}
    max={computeColumnMaxWidth(index)}
    placeholder="自动"
    suffix="mm"
    value={col.width}
    onChange={v => handleColumnWidthChange(index, v)}
  />
</Form.Item>
```

`computeColumnMaxWidth(index)` 动态计算：
```
maxWidth = tableWidthMm - 其他列固定宽度总和
```

### 5.2 行号列配置

在行号列开关旁增加宽度输入：

```
☑ 显示行号列 | 标题: [序号] | 宽度(mm): [15]
```

存储为 `rowNumberWidth`。

### 5.3 画布预览 (`TablePreview.tsx`)

改为使用 `computeColWidths()` 计算宽度百分比，逐列设置 `width` style：

```tsx
const colWidths = computeColWidths(displayColumns, tableWidthMm);
// <th style={{ width: colWidths[i], ... }}>...</th>
```

替换当前 `width: 100%` 整表等宽。

---

## 六、校验逻辑

| 场景 | 校验规则 | 实施位置 |
|------|---------|---------|
| 单列宽度上限 | ≤ tableWidth - 其他固定列总和 | 设计器 InputNumber.max |
| 总宽度超限 | 最后一列修改导致溢出 → 标红 + tooltip | 设计器 onChange |
| 宽度 ≤ 0 | min={1}，InputNumber 自动拒绝 | 设计器 |
| SDK 渲染 | 不做校验，设计器已拦截 | 无 |

---

## 七、改动范围

| 文件 | 改动 | 工作量 |
|------|------|--------|
| `sdk/src/types.ts` | 新增 `rowNumberWidth` | 5min |
| `sdk/src/printEngine/renderers/TableRenderer.ts` | 实现 `computeColWidths`，替换均分逻辑 | 1h |
| `designer/src/types/index.ts` | 同步 `rowNumberWidth` | 5min |
| `designer/src/pages/Designer/components/PropertyPanel/TableColumnSection.tsx` | 列宽度 InputNumber + 行号列宽度 InputNumber + 校验逻辑 | 1.5h |
| `designer/src/pages/Designer/components/Canvas/componentRenderers/TablePreview.tsx` | 使用 `computeColWidths` 渲染列宽 | 30min |
| 测试验证 | 多场景测试 | 30min |
| **合计** | | **≈ 4h** |

---

## 八、向后兼容

- 所有旧模板的 `width` 字段为空 → 行为不变，均分
- 新模板设置部分列宽 → 混合计算
- 行号列 `rowNumberWidth` 为 undefined → 自动分配

---

## 九、未来扩展（Phase 2）

- 画布表头列边框拖拽调整宽度
- 列宽预设方案（如"名称宽/数值窄"一键应用）
- 百分比单位支持（如 `width: "20%"`）
