# 设计文档：表格列级样式控制

> **版本**: v1.3
> **创建日期**: 2026-06-04
> **对应需求**: docs/features/table-column-style-requirements.md

---

## 一、架构概览

### 1.1 改动范围一览

| 层 | 文件 | 改动量 | 说明 |
|---|------|--------|------|
| SDK 类型 | `sdk/src/types.ts` | 小 | 新增 `TableColumnStyle`、`TableHeaderStyle`；`TableColumn` +2 字段；`TableProps` +3 字段 |
| SDK 导出 | `sdk/src/sdk.ts` | 小 | 导出新增类型和常量 |
| SDK 常量 | `sdk/src/printEngine/constants.ts` | 小 | 新增 `TABLE_HEADER_STYLE_DEFAULT` |
| SDK 渲染 | `sdk/src/printEngine/renderers/TableRenderer.ts` | 中 | 表头/数据单元格样式合并逻辑 |
| 设计器类型 | `designer/src/types/index.ts` | 小 | 镜像 SDK 类型 |
| 设计器预览 | `designer/src/pages/Designer/components/Canvas/componentRenderers/TablePreview.tsx` | 中 | 预览渲染应用列级样式 |
| 设计器面板 | `designer/src/pages/Designer/components/PropertyPanel/TableColumnSection.tsx` | 中 | 表格级 + 列级样式配置 UI |

### 1.2 样式优先级链

```
表头单元格:
  全局常量默认值 < tableProps.headerStyle < col.headerStyle

数据单元格:
  全局常量默认值 < component.style < col.style
```

### 1.3 数据流

```
设计器面板 ──(修改 props)──> 组件 props ──> TablePreview 画布预览
                                          ──> SDK TableRenderer 渲染输出
```

设计器面板修改 `columns[i].style` / `columns[i].headerStyle` / `props.headerStyle` 后，预览实时响应，最终 SDK 渲染产出一致的样式。

---

## 二、类型设计

### 2.1 新增类型（`sdk/src/types.ts`）

```typescript
/**
 * 列级单元格样式配置
 * 用于覆盖表头或数据单元格的默认样式，所有字段可选
 */
export interface TableColumnStyle {
  /** 字体大小（px） */
  fontSize?: number;
  /** 字重，如 'normal'、'bold'、600 */
  fontWeight?: string | number;
  /** 文字颜色 */
  color?: string;
  /** 背景颜色（类型保留，设计器暂不开放 UI） */
  backgroundColor?: string;
  /**
   * 对齐方式
   */
  textAlign?: 'left' | 'center' | 'right';
}

/**
 * 表格表头默认样式（表格级配置）
 * 会被列级 headerStyle 覆盖
 */
export interface TableHeaderStyle {
  /** 表头背景色，默认 '#fafafa' */
  backgroundColor?: string;
  /** 表头字重，默认 600 */
  fontWeight?: string | number;
  /** 表头字体大小（px） */
  fontSize?: number;
  /** 表头文字颜色 */
  color?: string;
  /** 表头对齐方式 */
  textAlign?: 'left' | 'center' | 'right';
}
```

### 2.2 修改现有类型

```typescript
export interface TableColumn {
  dataIndex: string;
  title: string;
  width?: number;
  /** 对齐方式（保留兼容，优先级低于 style.textAlign） */
  align?: 'left' | 'center' | 'right';
  hidden?: boolean;
  summary?: TableColumnSummary;
  /** 数据单元格样式（覆盖默认值） */
  style?: TableColumnStyle;
  /** 表头单元格样式（优先级高于 tableHeaderStyle） */
  headerStyle?: TableColumnStyle;
}

export interface TableProps {
  // ... 现有字段不变
  /** 表头默认样式（表格级），会被列级 headerStyle 覆盖。
   *  类型保留供 SDK 直接调用使用，设计器 UI 暂不暴露此配置（改用列级 headerStyle）。 */
  headerStyle?: TableHeaderStyle;
  /** 序号列数据单元格样式 */
  rowNumberStyle?: TableColumnStyle;
  /** 序号列表头单元格样式 */
  rowNumberHeaderStyle?: TableColumnStyle;
}
```

---

## 三、SDK 渲染实现

### 3.1 `buildCellStyle` 辅助函数（新增到 TableRenderer.ts）

为避免在表头和数据单元格两处重复样式构建逻辑，抽取一个纯函数：

```typescript
/**
 * 构建单元格内联样式字符串
 * @param colStyle - 列级样式（dataStyle 或 headerStyle）
 * @param base - 基础样式（边框、内边距等固定值）
 * @returns CSS 内联样式字符串
 */
function buildCellStyle(
  colStyle: TableColumnStyle | undefined,
  base: Record<string, string | number>
): string {
  const styles: Record<string, string | number> = { ...base };

  if (colStyle?.fontSize) {
    styles['font-size'] = `${colStyle.fontSize}px`;
  }
  if (colStyle?.fontWeight !== undefined) {
    styles['font-weight'] = colStyle.fontWeight;
  }
  if (colStyle?.color) {
    styles['color'] = colStyle.color;
  }
  if (colStyle?.backgroundColor) {
    styles['background'] = colStyle.backgroundColor;
  }
  if (colStyle?.textAlign) {
    styles['text-align'] = colStyle.textAlign;
  }

  return buildStyleString(styles);
}
```

### 3.2 表头渲染改动（`render()` 方法）

**现有逻辑**（简化）：

```typescript
const headerBg = '#fafafa';
const headerFontWeight = '600';
const textAlign = style?.textAlign || 'left';
// ...
<th style="... background: {headerBg}; font-weight: {headerFontWeight}; text-align: {textAlign}; ...">
```

**改动后**：

```typescript
const tableHeaderStyle = props?.headerStyle;

for (const col of displayCols) {
  // 对齐优先级：col.headerStyle.textAlign > col.align > tableHeaderStyle.textAlign > 'left'
  const hTextAlign = col.headerStyle?.textAlign
    || col.align
    || tableHeaderStyle?.textAlign
    || style?.textAlign
    || 'left';

  const baseHeaderStyle = {
    border: cellBorder,
    padding: '4px 8px',
    'white-space': 'normal',
    'word-break': 'break-word',
    'line-height': STYLE_DEFAULT.LINE_HEIGHT,
    'vertical-align': 'middle',
    'text-align': hTextAlign,
    background: tableHeaderStyle?.backgroundColor ?? '#fafafa',
    'font-weight': tableHeaderStyle?.fontWeight ?? 600,
    width: colWidths[idx],
    'min-height': `${headerHeightPx}px`,
    'box-sizing': 'border-box',
  };

  // 列级 headerStyle 覆盖
  const headerCellStyle = buildCellStyle(col.headerStyle, baseHeaderStyle);
  html += `<th style="${headerCellStyle}">${escapeHtml(col.title)}</th>`;
}
```

### 3.3 数据单元格渲染改动

```typescript
for (const row of pageData) {
  html += '<tr>';
  for (const col of displayCols) {
    const value = row[col.dataIndex];

    // 对齐优先级：col.style.textAlign > col.align > style.textAlign > 'left'
    const dTextAlign = col.style?.textAlign
      || col.align
      || style?.textAlign
      || 'left';

    const baseDataStyle = {
      border: cellBorder,
      padding: '4px 8px',
      'white-space': 'normal',
      'word-break': 'break-word',
      'line-height': STYLE_DEFAULT.LINE_HEIGHT,
      'vertical-align': 'middle',
      'text-align': dTextAlign,
      width: colWidths[idx],
      'min-height': `${rowHeightPx}px`,
      'box-sizing': 'border-box',
    };

    const dataCellStyle = buildCellStyle(col.style, baseDataStyle);
    html += `<td style="${dataCellStyle}">${escapeHtml(String(value))}</td>`;
  }
  html += '</tr>';
}
```

### 3.4 序号列样式

序号列的 `dataIndex` 虚拟为 `'__row_number__'`。需要支持序号列配置 `style`/`headerStyle`，通过 `TableProps` 中独立的 `rowNumberStyle` / `rowNumberHeaderStyle` 字段传入：

```typescript
// 序号列对象（虚拟）
const rowNumCol: TableColumn = {
  dataIndex: '__row_number__',
  title: props.rowNumberLabel || '#',
  width: props.rowNumberWidth,
  align: 'center',
  style: props.rowNumberStyle,              // 从 TableProps 传入
  headerStyle: props.rowNumberHeaderStyle,  // 从 TableProps 传入
};
```

序号列的默认对齐为 `'center'`，表格级 `headerStyle` 对序号列表头同样生效。

### 3.5 合计行（不变）

合计行继续使用 `TableSummaryStyle`，不受列级 `style`/`headerStyle` 影响。

### 3.6 `measureTableRowHeights` 影响链

`measureTableRowHeights`（`sdk/src/printEngine.ts#L630-L762`）通过调用 `TableRenderer.render()` 渲染到隐藏 DOM 中测量实际行高。该函数**不需要修改代码**，因为：

> 列级 `fontSize` → `TableRenderer.render()` 输出变更 → `measureTableRowHeights` 自动感知新高度 → 分页计算正确

但实现时必须确保 Renderer 输出的 HTML 带上了正确的列级样式（通过 `buildCellStyle` 合并），否则测量容器中的行高与实际打印输出不一致。

---

## 四、常量定义（`sdk/src/printEngine/constants.ts`）

```typescript
export const TABLE_HEADER_STYLE_DEFAULT = {
  BACKGROUND: '#fafafa',
  FONT_WEIGHT: 600,
} as const;
```

原硬编码 `'#fafafa'` 和 `600` 替换为引用此常量 + `tableProps.headerStyle` 覆盖。

---

## 五、设计器预览实现（TablePreview.tsx）

在 `TablePreview.tsx` 中同步应用列级样式。当前使用 React 内联 `style` 对象，改动方式类似 SDK：

```typescript
// 序号列虚拟对象需要带上样式（新增）
const displayCols = showRowNumber
  ? [{
      dataIndex: '__row_number__',
      title: rowNumberLabel || '#',
      width: component.props?.rowNumberWidth,
      align: 'center',
      style: component.props?.rowNumberStyle,       // 新增
      headerStyle: component.props?.rowNumberHeaderStyle,  // 新增
    } as TableColumn, ...visibleColumns]
  : visibleColumns;

// 获取表头默认样式
const headerBg = component.props?.headerStyle?.backgroundColor ?? '#fafafa';
const headerFw = component.props?.headerStyle?.fontWeight ?? 600;
const headerTextAlignDefault = component.props?.headerStyle?.textAlign;

// 表头渲染
{displayCols.map((col, idx) => {
  const hAlign = col.headerStyle?.textAlign
    || col.align
    || headerTextAlignDefault
    || tableTextAlign;

  const thStyle: React.CSSProperties = {
    // ... 基础样式
    background: col.headerStyle?.backgroundColor ?? headerBg,
    fontWeight: col.headerStyle?.fontWeight ?? headerFw,
    fontSize: col.headerStyle?.fontSize ?? component.style?.fontSize ?? 12,
    color: col.headerStyle?.color,
    textAlign: hAlign as any,
  };
  // ...
})}

// 数据单元格同理，使用 col.style
```

---

## 六、设计器面板 UI 设计（TableColumnSection.tsx）

### 6.1 表格级表头样式（本期不做）

> `TableProps.headerStyle` 类型保留，但设计器 UI 暂不暴露表格级表头样式配置。
> 用户通过每个列的 `headerStyle` 逐列设置表头样式。

### 6.2 序号列样式（新增区域）

在序号列相关选项区域（showRowNumber / rowNumberLabel / rowNumberWidth 下方）直接展示，不折叠：

```
  序号列表头样式 ──────────────────
  表头字重: [正常 ▼]
  表头字号: [___]
  表头颜色: [🎨 ]
  表头对齐: [left ▼]

  序号列数据样式 ──────────────────
  数据字重: [正常 ▼]
  数据字号: [___]
  数据颜色: [🎨 ]
  数据对齐: [left ▼]
```

- 两个小标题用底部分隔线区分
- 背景色本期不开放
- 字号限制最小 8，精度为整数

### 6.3 列级样式（每个列卡片新增区域）

每个列卡片底部新增一个折叠面板，默认收起：

```
▼ 列样式
  表头样式 ────────────
  字重: [正常 ▼]  字号: [___]
  颜色: [🎨 ]      对齐: [left ▼]

  数据样式 ────────────
  字重: [正常 ▼]  字号: [___]
  颜色: [🎨 ]      对齐: [left ▼]
```

- 折叠面板使用 antd `Collapse.Panel`
- 字重选项：正常(normal) / 粗体(bold)
- 背景色本期不开放
- 字号限制最小 8（通过 `FONT_SIZE_MIN` 常量控制），精度为整数
- 所有控件使用 `size="small"`

**状态管理**：通过 `onUpdateProps` 更新对应的 `columns[i].style` / `columns[i].headerStyle`。

---

## 七、风险与边界情况

### 7.1 面板 UI 复杂度

列卡片已经包含较多控件（标题、字段名、宽度、合计配置），再增加样式配置会让面板变长。**缓解**：样式区域默认收起，折叠面板。

### 7.2 颜色选择器频繁触发 onChange

`input[type=color]` 每次拖动颜色选择器都会触发 onChange，可能导致大量历史记录。**缓解**：通过 `onBlur` 事件提交，而非 `onChange`。

### 7.3 序号列样式

序号列使用虚拟的 `dataIndex: '__row_number__'`，非标准 `TableColumn` 对象。需要确保其 `style`/`headerStyle` 配置也能正确应用到渲染中。

### 7.4 向后兼容

所有新字段均为可选，不传时行为与当前版本一致。现有模板无需修改。

### 7.5 字体大小单位

列级 `fontSize` 单位使用 **px**，与表格级 `component.style.fontSize` 保持一致。

---

## 八、实施步骤

| 步骤 | 内容 | 验证方式 |
|------|------|----------|
| 1 | SDK 类型定义（TableColumnStyle、TableHeaderStyle）+ TableColumn/TableProps 扩展 | TypeScript 编译通过 |
| 2 | SDK 导出清单更新（`sdk/src/sdk.ts`） | 消费者可引用新类型 |
| 3 | SDK 常量（TABLE_HEADER_STYLE_DEFAULT） | 编译通过 |
| 4 | SDK TableRenderer 样式合并逻辑 | 单元测试/模板验证 |
| 5 | 设计器类型镜像 | 编译通过 |
| 6 | TablePreview 预览应用列级样式（含序号列样式传递） | 画布预览正确显示 |
| 7 | TableColumnSection UI（表格级 + 列级） | 面板操作正常、样式实时更新 |
| 8 | 集成构建验证 | `npm run build` 通过 |

---

## 九、参考资料

- `sdk/src/types.ts` — 现有 TableColumn、TableProps 定义
- `sdk/src/printEngine/renderers/TableRenderer.ts` — 表头/数据单元格渲染代码
- `sdk/src/printEngine/constants.ts` — TABLE_STYLE_DEFAULT、STYLE_DEFAULT
- `designer/.../TableColumnSection.tsx` — 列配置面板 UI
- `designer/.../TablePreview.tsx` — 画布预览渲染

---

## 变更记录

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.3 | 2026-06-04 | 设计器实现反馈：`headerStyle`(表格级) 类型保留但不暴露 UI；`backgroundColor` 类型保留但不暴露 UI；字号增加 `FONT_SIZE_MIN` 统一常量；更新面板 UI 描述与实际一致 |
| v1.2 | 2026-06-04 | 移除 `justify` 对齐选项（表格单元格场景无实际需求）；补充 6.2 序号列样式面板 UI 设计 |
| v1.1 | 2026-06-04 | 补全遗漏：`TableProps` 增加 `rowNumberStyle`/`rowNumberHeaderStyle`；新增 `sdk/src/sdk.ts` 导出；补充 `measureTableRowHeights` 影响链分析；`TablePreview` 序号列样式传递代码示例；移除本期不做的 `fontStyle`；`col.align` 改为不标记 `@deprecated`；补充 `justify` 仅限 `style.textAlign` 的说明 |
| v1.0 | 2026-06-04 | 初版 |
