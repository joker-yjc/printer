# 表格列宽度调整 & 边框样式 设计文档 v2

> 版本：v2.1 | 日期：2026-05-19
> 上一版：[v2.0](./2026-05-19-table-column-width-design-v2.md)
> 状态：设计完成，待实现

---

## 一、背景与现状

当前表格组件采用**均分列宽策略**（`100 / colCount`%），`TableColumn.width` 字段已定义但未在渲染中使用。边框仅支持开/关（`bordered`），样式固定为实线。客户反馈需要对不同列设置不同宽度，以及支持虚线边框。

### 涉及模块

| 模块 | 当前行为 |
|------|----------|
| `TableRenderer.ts` (SDK) | `colWidthPercent = 100 / colCount`，忽略 `col.width`；边框固定 `solid` |
| `TablePreview.tsx` (设计器) | `width: 100%` 整表均分；边框固定 `solid` |
| `TableColumnSection.tsx` (设计器) | 无宽度输入框；仅 `bordered` 复选框 |
| `types.ts` (SDK + 设计器) | `width?: number`、`bordered?: boolean` 已定义 |

---

## 二、需求决策记录

| 决策点 | 选择 | 原因 |
|--------|------|------|
| 交互方式 | Phase 1 输入框，Phase 2 拖拽（暂不做） | 快速交付，预留扩展 |
| 行号列宽度 | 支持配置 | 用户明确需要 |
| 默认行为（width 为空） | 均分 | 向后兼容，有宽度才固定 |
| 溢出处理 | 设计器严格校验，禁止超出 | SDK 不做校验 |
| 宽度单位 | mm | 与整个坐标系统一 |
| 边框样式 | 新增 `borderStyle: 'solid' \| 'dashed'` | 用户需要虚线选项 |

---

## 三、数据模型变更

### 3.1 SDK 类型 (`sdk/src/types.ts`)

```typescript
export interface TableProps {
  // ... 现有字段 ...
  /** 行号列宽度（mm），不设置时自动分配 */
  rowNumberWidth?: number;
  /** 边框样式，默认 'solid'（仅在 bordered 为 true 时生效） */
  borderStyle?: 'solid' | 'dashed';
}
```

`TableColumn.width?: number` — 语义从"已定义但忽略"变为"固定宽度 mm，空=自动均分"。

### 3.2 设计器类型 (`designer/src/types/index.ts`)

同步新增 `rowNumberWidth`、`borderStyle`。

---

## 四、SDK 渲染逻辑

### 4.1 核心算法 — 列宽 (`TableRenderer.ts`)

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

### 4.2 边框样式

```typescript
// 改前
const cellBorder = bordered
  ? `border: 1px solid ${TABLE_STYLE_DEFAULT.BORDER_COLOR};`
  : '';

// 改后
const borderStyle = props?.borderStyle || 'solid';
const cellBorder = bordered
  ? `border: 1px ${borderStyle} ${TABLE_STYLE_DEFAULT.BORDER_COLOR};`
  : '';
```

### 4.3 行号列

行号列放入 `displayColumns` 前面时，附带 `{ width: props.rowNumberWidth }` 参与计算。

### 4.4 HTML 模板和分页

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

### 5.3 边框样式

在现有 `bordered` 复选框旁增加样式下拉：

```
☑ 显示边框   |   样式: [实线 ▾/虚线]
```

- 当 `bordered` 为 false 时，样式下拉 disabled
- 默认值 `'solid'`

### 5.4 画布预览 (`TablePreview.tsx`)

- 列宽：使用 `computeColWidths()` 计算百分比，逐列设置 `width` style
- 边框：使用 `props.borderStyle` 替换硬编码的 `solid`

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
| `sdk/src/types.ts` | 新增 `rowNumberWidth`、`borderStyle` | 5min |
| `sdk/src/printEngine/renderers/TableRenderer.ts` | 实现 `computeColWidths` + `borderStyle` | 1h |
| `designer/src/types/index.ts` | 同步 `rowNumberWidth`、`borderStyle` | 5min |
| `designer/src/pages/Designer/components/PropertyPanel/TableColumnSection.tsx` | 列宽度 InputNumber + 行号列宽度 + 边框样式下拉 + 校验逻辑 | 2h |
| `designer/src/pages/Designer/components/Canvas/componentRenderers/TablePreview.tsx` | 列宽渲染 + 边框样式渲染 | 30min |
| 测试验证 | 多场景测试 | 30min |
| **合计** | | **≈ 4.5h** |

---

## 八、向后兼容

- 所有旧模板的 `width` 字段为空 → 行为不变，均分
- 所有旧模板的 `borderStyle` 为 undefined → 默认 `'solid'`，外观不变
- 新模板设置部分列宽 → 混合计算
- 行号列 `rowNumberWidth` 为 undefined → 自动分配

---

## 九、未来扩展（Phase 2）

- 画布表头列边框拖拽调整宽度
- 列宽预设方案（如"名称宽/数值窄"一键应用）
- 百分比单位支持（如 `width: "20%"`）
