# Bug 分析：第一个表格组件 Y 坐标偏移

> **问题编号**: BUG-001
> **发现日期**: 2026-05-19
> **严重度**: 高
> **状态**: 待修复

---

## 现象描述

当表格是页面上的第一个组件时，Designer 画布中表格距离上边距的空白很大，但实际打印预览中表格位置更靠上，空白明显变小，两者位置不一致。

## 影响范围

| 组件类型 | 是否受影响 | 偏移方向 | 偏移量 |
|---------|-----------|---------|--------|
| 有数据表格（第一个组件） | ✅ | 上移 | `marginTop` mm |
| 无数据表格（第一个组件） | ✅ | 上移 | `marginTop` mm |
| 普通组件（第一个组件） | ✅ | 下移 | `marginTop` mm |
| 非第一个组件 |  | 无 | 0 |

## 根因分析

### 坐标系差异

| 环境 | 坐标原点 | yMm=0 的含义 |
|------|---------|-------------|
| **Designer 画布** | 页面左上角（含边距区域） | 页面最顶部 |
| **SDK 渲染** | `.print-page` 的 border-top | 页面最顶部 |

两者坐标原点表面上都是"页面顶部"，但分页引擎 `calculatePages` 在计算组件位置时引入了偏移，导致实际行为不一致。

### 关键代码

**`sdk/src/printEngine.ts` 两处逻辑：**

**1. 普通组件（含空表格）L533-538：**
```ts
if (isFirstComponentInPage) {
  currentPageHeight += actualGap;        // marginTop + (comp.layout.yMm || 0)
  compCopy.layout.yMm = currentPageHeight; // yMm = marginTop + 原始yMm
  currentPageHeight += compHeightMm;
}
```
第一个普通组件的 `yMm` 被设为 `marginTop + 原始yMm`，比原始值多了 `marginTop` mm。

**2. 有数据表格（`splitTableWithGap` L862-864）：**
```ts
const tableFragmentYMm = isFirstFragment
  ? (isFirstComponentInPage ? workingPageHeight : workingPageHeight + gap)
  : marginTop;
```
- `workingPageHeight` 初始值 = `marginTop`（L446）
- 如果表格是页面上第一个组件：`tableFragmentYMm = marginTop`（强制覆盖原始 yMm，忽略 gap）
- 如果表格不是第一个组件：`tableFragmentYMm = marginTop + gap`

### 实际影响示例

假设表格 `yMm = 50mm`，页面上边距 `marginTop = 10mm`：

| 场景 | Designer 画布 | SDK 预览 | 差异 |
|------|--------------|----------|------|
| 有数据表格（第一个组件） | `top = 50 * 3.78 = 189px` | `top = 10 * 3.78 = 37.8px` | **SDK 上移 40mm** |
| 无数据表格（第一个组件） | `top = 189px` | `top = 37.8px` | 同上 |
| 普通组件（第一个） | `top = 189px` | `top = 60 * 3.78 = 226.8px` | SDK 下移 10mm |

## 修复方案

### 方案 A：保留原始 yMm，仅做边界保护（推荐）

**改动位置**: `sdk/src/printEngine.ts`

**普通组件（L533-538）：**
```ts
if (isFirstComponentInPage) {
  // 保留原始 yMm，但确保不小于 marginTop（防止组件在边距区域内被裁切）
  const originalYMm = comp.layout.yMm || 0;
  compCopy.layout.yMm = Math.max(marginTop, originalYMm);
  currentPageHeight = compCopy.layout.yMm + compHeightMm;
}
```

**有数据表格（L862-864）：**
```ts
const tableFragmentYMm = isFirstFragment
  ? (isFirstComponentInPage 
      ? Math.max(marginTop, tableComponent.layout.yMm || 0) 
      : workingPageHeight + gap)
  : marginTop;
```

**优点**:
- 改动最小，仅修改两处坐标计算
- 保留用户设置的原始 yMm 意图
- 兼容现有模板（yMm=0 时自动对齐到 marginTop）

**缺点**:
- 需要更新 `currentPageHeight` 的累加逻辑，确保后续组件间距正确

### 方案 B：Designer 画布坐标系改为内容区域顶部

将 Designer 画布的坐标原点从"页面顶部"改为"内容区域顶部"（yMm=0 表示 marginTop 处），与 SDK 统一。

**优点**:
- 从根本上统一坐标系

**缺点**:
- 需要修改画布放置、拖拽、对齐等全部逻辑
- 影响所有现有模板的 yMm 值
- 改动范围大，风险高

## 验证方法

1. 创建一个新模板，仅包含一个表格组件，设置 `yMm = 50`
2. 在 Designer 画布中观察表格位置
3. 生成预览，对比表格位置是否一致
4. 测试 yMm = 0 的边界场景（应自动对齐到 marginTop）

## 相关文件

- `sdk/src/printEngine.ts` — 分页引擎，`calculatePages` 和 `splitTableWithGap` 方法
- `sdk/src/printEngine/renderers/TableRenderer.ts` — 表格渲染器
- `designer/src/pages/Designer/components/Canvas/index.tsx` — Designer 画布组件定位
