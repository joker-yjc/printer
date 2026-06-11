# 页码自定义位置实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为页码功能新增"自定义"位置模式，允许用户在画布上拖拽定位页码，并通过右侧属性面板编辑坐标、格式和样式。

**Architecture:** 在现有 `PageNumberConfig` 页面级配置模式下新增 `position: 'custom'` + `customX/customY` 字段，SDK 渲染新增 custom 分支并改为宽度自适应；Designer 侧新增页码选中/拖拽状态管理、画布拖拽交互、右侧页码属性面板。

**Tech Stack:** TypeScript, React (Zustand store), Ant Design, SDK 打印引擎

---

## 文件结构

| 操作 | 文件路径 | 职责 |
|---|---|---|
| 修改 | `sdk/src/types.ts` | `PageNumberConfig` 新增 `custom`/`customX`/`customY` |
| 修改 | `sdk/src/printEngine.ts` | `renderPageNumber()` 新增 custom 分支 + 宽度自适应 |
| 修改 | `designer/src/pages/Designer/components/Canvas/PageSettingModal.tsx` | 位置下拉新增"自定义"选项，精简配置 |
| 修改 | `designer/src/store/designer.ts` | 新增 `selectedPageNumber` 状态 + `selectPageNumber`/`updatePageNumberConfig` action |
| 修改 | `designer/src/pages/Designer/components/Canvas/index.tsx` | 页码选中/拖拽逻辑 + custom 模式预览 |
| 修改 | `designer/src/pages/Designer/components/PropertyPanel/index.tsx` | 选中页码时切换为页码属性面板 |
| 新增 | `designer/src/pages/Designer/components/PropertyPanel/PageNumberPropertyPanel.tsx` | 页码属性面板组件 |

---

### Task 1: SDK 类型定义 — PageNumberConfig 扩展

**Files:**
- 修改: `sdk/src/types.ts:31-46`

- [ ] **Step 1: 修改 PageNumberConfig 类型**

在 `sdk/src/types.ts` 中修改 `PageNumberConfig` 接口，position 联合类型新增 `'custom'`，新增 `customX?` 和 `customY?` 可选字段：

```typescript
export interface PageNumberConfig {
  enabled: boolean;
  position: 'bottom-center' | 'bottom-right' | 'bottom-left'
           | 'top-center' | 'top-right' | 'top-left'
           | 'custom';
  customX?: number;
  customY?: number;
  format?: 'simple' | 'text' | 'slash';
  prefix?: string;
  suffix?: string;
  separator?: string;
  offsetX?: number;
  offsetY?: number;
  style?: {
    fontSize?: number;
    color?: string;
    fontWeight?: 'normal' | 'bold';
  };
}
```

- [ ] **Step 2: 构建验证**

Run: `cd /Users/joke/webcode/printer/sdk && npm run build`
Expected: 编译通过，无类型错误

- [ ] **Step 3: Commit**

```bash
git add sdk/src/types.ts
git commit -m "feat(sdk): PageNumberConfig 新增 custom 位置模式及 customX/customY 字段"
```

---

### Task 2: SDK 渲染引擎 — custom 分支 + 宽度自适应

**Files:**
- 修改: `sdk/src/printEngine.ts:302-390`

- [ ] **Step 1: 新增 custom 分支 + 宽度自适应**

在 `sdk/src/printEngine.ts` 的 `renderPageNumber()` 方法中做以下修改：

1. 新增页面宽度估算函数（在 switch 之前）：

```typescript
const estimatePageNumberWidth = (text: string, fontSize: number): number => {
  return text.length * fontSize * 0.5 * (25.4 / 96);
};
```

2. 替换固定 `pageNumberWidth = 20` 为动态计算：

```typescript
const pageNumberHeight = 6;
const estimatedWidth = estimatePageNumberWidth(pageText, fontSize);
```

3. switch 新增 custom 分支（在 default 之前）：

```typescript
case 'custom':
  xMm = config.customX ?? 0;
  yMm = config.customY ?? 0;
  break;
```

4. 修改 offsetX/Y 叠加逻辑，仅在非 custom 模式下叠加：

```typescript
if (position !== 'custom') {
  xMm += offsetX;
  yMm += offsetY;
}
```

5. 修改预设模式中的 `pageNumberWidth` 引用为 `estimatedWidth`（top-center、top-right、bottom-center、bottom-right 四个分支）

6. 修改 HTML 生成：去掉固定 width，改用 `white-space: nowrap`。去掉 `widthPx` 变量的计算，将 HTML 中的 `width: ${widthPx}px` 替换为 `white-space: nowrap`

- [ ] **Step 2: 构建验证**

Run: `cd /Users/joke/webcode/printer/sdk && npm run build`
Expected: 编译通过

- [ ] **Step 3: Commit**

```bash
git add sdk/src/printEngine.ts
git commit -m "feat(sdk): renderPageNumber 新增 custom 分支，宽度改为自适应"
```

---

### Task 3: Designer Store — 页码选中状态管理

**Files:**
- 修改: `designer/src/store/designer.ts`

- [ ] **Step 1: 新增状态和 action**

1. 在 `DesignerStore` 接口中新增：

```typescript
selectedPageNumber: boolean;
selectPageNumber: () => void;
deselectPageNumber: () => void;
updatePageNumberConfig: (updates: Partial<PageNumberConfig>) => void;
```

2. 在 store 实现中新增：

```typescript
selectedPageNumber: false,
selectPageNumber: () => set({ selectedPageNumber: true, selectedComponentId: null, selectedComponentIds: [] }),
deselectPageNumber: () => set({ selectedPageNumber: false }),
updatePageNumberConfig: (updates) => set((state) => {
  const current = state.pageConfig.pageNumber || { enabled: true, position: 'custom' as const };
  return {
    pageConfig: {
      ...state.pageConfig,
      pageNumber: { ...current, ...updates },
    },
  };
}),
```

3. 修改 `selectComponent` action，选中组件时取消页码选中：

```typescript
selectComponent: (id) => set({ selectedComponentId: id, selectedComponentIds: id ? [id] : [], selectedPageNumber: false }),
```

4. 修改 `clearSelection` action，同步清除页码选中：

```typescript
clearSelection: () => set({ selectedComponentId: null, selectedComponentIds: [], selectedPageNumber: false }),
```

- [ ] **Step 2: 构建验证**

Run: `cd /Users/joke/webcode/printer/designer && npm run build`
Expected: 编译通过

- [ ] **Step 3: Commit**

```bash
git add designer/src/store/designer.ts
git commit -m "feat(designer): 新增页码选中状态管理 selectedPageNumber/updatePageNumberConfig"
```

---

### Task 4: PageSettingModal — 新增自定义选项 + 精简

**Files:**
- 修改: `designer/src/pages/Designer/components/Canvas/PageSettingModal.tsx`

- [ ] **Step 1: 位置下拉新增"自定义"选项**

在 Select options 数组末尾新增：

```typescript
{ label: '自定义', value: 'custom' },
```

- [ ] **Step 2: 切换到自定义时重置坐标**

在 `handleOk` 中，当 `values.pageNumberEnabled && values.pageNumberPosition === 'custom'` 时，计算底部居中的绝对坐标追加到 `newConfig.pageNumber`：

```typescript
if (values.pageNumberEnabled && values.pageNumberPosition === 'custom') {
  let pageW = 210, pageH = 297;
  if (values.size === 'CUSTOM') { pageW = values.customWidth; pageH = values.customHeight; }
  else if (values.size === 'A5') { pageW = 148; pageH = 210; }
  if (values.orientation === 'landscape' && values.size !== 'CONTINUOUS') { [pageW, pageH] = [pageH, pageW]; }
  newConfig.pageNumber = {
    ...newConfig.pageNumber!,
    customX: Math.round((pageW / 2) * 10) / 10,
    customY: Math.round((pageH - (values.marginBottom || 10) - 6) * 10) / 10,
  };
}
```

注意：仅当 `newConfig.pageNumber` 已存在时才执行此逻辑。

- [ ] **Step 3: 移除弹窗中的页码格式和样式配置**

删除 `PageSettingModal.tsx` 中的：
- 页码格式 Radio.Group（约 314-325 行）
- 页码样式组（字号、颜色、字重，约 327-345 行）

同时移除 `handleOk` 中对应的 `format`/`style` 字段赋值。这些配置移到右侧属性面板。

- [ ] **Step 4: 构建验证**

Run: `cd /Users/joke/webcode/printer/designer && npm run build`
Expected: 编译通过

- [ ] **Step 5: Commit**

```bash
git add designer/src/pages/Designer/components/Canvas/PageSettingModal.tsx
git commit -m "feat(designer): PageSettingModal 新增自定义位置选项，精简格式/样式配置"
```

---

### Task 5: Canvas — 页码选中/拖拽交互

**Files:**
- 修改: `designer/src/pages/Designer/components/Canvas/index.tsx`

- [ ] **Step 1: 从 store 解构新增状态**

在 Canvas 组件的 store 解构中新增：

```typescript
selectedPageNumber,
selectPageNumber,
deselectPageNumber,
updatePageNumberConfig,
```

- [ ] **Step 2: 新增页码拖拽状态**

```typescript
const [draggingPageNumber, setDraggingPageNumber] = useState(false);
const [pageNumberDragStart, setPageNumberDragStart] = useState({ x: 0, y: 0, customX: 0, customY: 0 });
```

- [ ] **Step 3: 页码鼠标按下处理**

新增 `handlePageNumberMouseDown` 函数：

```typescript
const handlePageNumberMouseDown = (e: React.MouseEvent) => {
  e.stopPropagation();
  if (pageConfig.pageNumber?.position !== 'custom') return;
  selectPageNumber();
  setDraggingPageNumber(true);
  setPageNumberDragStart({
    x: e.clientX,
    y: e.clientY,
    customX: pageConfig.pageNumber.customX ?? 0,
    customY: pageConfig.pageNumber.customY ?? 0,
  });
};
```

- [ ] **Step 4: 页码拖拽移动处理**

新建一个 useEffect 处理页码拖拽：

```typescript
useEffect(() => {
  if (!draggingPageNumber) return;
  const handleMouseMove = (e: MouseEvent) => {
    const zoom = zoomLevelRef.current;
    const dx = pxToMm(e.clientX - pageNumberDragStart.x, zoom);
    const dy = pxToMm(e.clientY - pageNumberDragStart.y, zoom);
    let newX = pageNumberDragStart.customX + dx;
    let newY = pageNumberDragStart.customY + dy;
    newX = snapToGrid(newX);
    newY = snapToGrid(newY);
    const { width: pageW, height: pageH } = getPageSize();
    newX = Math.max(0, Math.min(newX, pageW - 20));
    newY = Math.max(0, Math.min(newY, pageH - 6));
    updatePageNumberConfig({ customX: Math.round(newX * 10) / 10, customY: Math.round(newY * 10) / 10 });
  };
  const handleMouseUp = () => { setDraggingPageNumber(false); };
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };
}, [draggingPageNumber, pageNumberDragStart]);
```

- [ ] **Step 5: 修改页码预览渲染**

将现有页码预览代码替换为支持 custom 模式和选中态的版本。关键改动：

1. custom 模式：使用 `customX * 3.78` / `customY * 3.78` 计算 left/top
2. 预设模式：保持原有逻辑不变
3. custom 模式下：`pointerEvents: 'auto'`, `cursor: 'move'`，绑定 `onMouseDown={handlePageNumberMouseDown}`
4. 选中态：`border: '2px solid #1890ff'`，`backgroundColor: 'rgba(24, 144, 255, 0.15)'`
5. 非选中态：保持原有 `border: '1px dashed ...'`
6. custom 模式不用 `translateX(-50%)`（居中由坐标精确控制）
7. 点击画布空白处时取消页码选中（在 page-content 的 onMouseDown 中调用 deselectPageNumber）

- [ ] **Step 6: 构建验证**

Run: `cd /Users/joke/webcode/printer/designer && npm run build`
Expected: 编译通过

- [ ] **Step 7: Commit**

```bash
git add designer/src/pages/Designer/components/Canvas/index.tsx
git commit -m "feat(designer): Canvas 页码选中/拖拽交互，支持 custom 模式"
```

---

### Task 6: 右侧页码属性面板

**Files:**
- 新增: `designer/src/pages/Designer/components/PropertyPanel/PageNumberPropertyPanel.tsx`
- 修改: `designer/src/pages/Designer/components/PropertyPanel/index.tsx`

- [ ] **Step 1: 创建 PageNumberPropertyPanel 组件**

新建 `designer/src/pages/Designer/components/PropertyPanel/PageNumberPropertyPanel.tsx`：

包含三个区块：
- **布局属性**：customX（X坐标 mm）、customY（Y坐标 mm），InputNumber，precision=1，step=0.5
- **格式属性**：format（Radio.Group: slash/text/simple）、prefix（Input）、suffix（Input）、separator（Input，slash 模式下显示）
- **样式属性**：fontSize（InputNumber 8-24）、color（input type=color）、fontWeight（Select normal/bold）

使用 `useDesignerStore` 获取 `pageConfig.pageNumber` 和 `updatePageNumberConfig`，修改时直接调用 `updatePageNumberConfig({ field: value })`。

复用 `index.module.css` 中的 `property-panel`/`property-section`/`property-title`/`property-list`/`property-item`/`property-label` 样式类，和组件属性面板保持一致的视觉风格。

- [ ] **Step 2: 修改 PropertyPanel 主组件**

在 `designer/src/pages/Designer/components/PropertyPanel/index.tsx` 中：

1. 从 store 解构新增 `selectedPageNumber` 和 `deselectPageNumber`
2. 在组件顶部，优先判断 `selectedPageNumber`：如果为 true，渲染 `PageNumberPropertyPanel` 并 return
3. 原有的组件属性面板逻辑不变

```typescript
const PropertyPanel = () => {
  const { selectedComponentId, components, updateComponent,
    headerComponents, footerComponents, pageConfig,
    selectedPageNumber, deselectPageNumber } = useDesignerStore();

  // 页码选中时显示页码属性面板
  if (selectedPageNumber && pageConfig.pageNumber?.enabled) {
    return <PageNumberPropertyPanel />;
  }

  // ... 原有组件属性面板逻辑
};
```

- [ ] **Step 3: 构建验证**

Run: `cd /Users/joke/webcode/printer/designer && npm run build`
Expected: 编译通过

- [ ] **Step 4: Commit**

```bash
git add designer/src/pages/Designer/components/PropertyPanel/PageNumberPropertyPanel.tsx designer/src/pages/Designer/components/PropertyPanel/index.tsx
git commit -m "feat(designer): 新增页码属性面板，选中页码时右侧显示坐标/格式/样式配置"
```

---

### Task 7: 集成验证

- [ ] **Step 1: 全量构建**

Run: `cd /Users/joke/webcode/printer/sdk && npm run build && cd ../designer && npm run build`
Expected: 全部通过

- [ ] **Step 2: 功能验证**

1. 打开设计器，页面设置 → 启用页码 → 位置选择"自定义"
2. 画布上页码框可拖拽，拖拽后坐标实时更新
3. 点击页码框，右侧面板显示页码属性，可编辑 X/Y/格式/样式
4. 预设模式下页码框不可拖拽，右侧面板不显示页码属性
5. 切换预设↔自定义，坐标正确重置/保持

- [ ] **Step 3: SDK 渲染验证**

使用包含 `position: 'custom'` 的模板数据调用 SDK 渲染，确认页码出现在指定坐标位置。

