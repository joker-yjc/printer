# 页码自定义位置设计文档

> 日期：2026-06-10
> 状态：设计中

## 1. 背景与问题

当前页码功能仅支持 6 个固定位置（top-left/center/right + bottom-left/center/right），由 `PageNumberConfig.position` 枚举控制，坐标在 `PrintEngine.renderPageNumber()` 中硬编码计算。客户需要更灵活的页码定位能力。

### 现状问题

- 位置完全硬编码，6 个 switch-case 分支
- 宽高固定 20mm × 6mm，大字体或带 prefix/suffix 时溢出
- 已有 `offsetX`/`offsetY` 字段但 UI 未暴露
- `prefix`/`suffix` 字段 UI 未暴露
- 存在两套渲染逻辑：`PageNumberRenderer`（旧版组件模式，未使用）和 `PrintEngine.renderPageNumber()`（页面配置模式）

## 2. 设计决策

| 决策项 | 选项 | 结论 | 理由 |
|---|---|---|---|
| 数据模型 | 仍为页面级配置 vs 变成普通组件 | 页面级配置 | 页码有自动递增逻辑，不适合走组件管线 |
| 位置自由度 | 扩展预设 vs 坐标自由定位 vs 画布拖拽组件 | 预设 + 自定义拖拽 | 保留简单性，给进阶用户自由度 |
| 自定义坐标字段 | 复用 offsetX/Y vs 新增 customX/customY | 新增 customX/customY | 避免同一字段两种语义 |
| 尺寸配置 | 用户自定义 vs 固定 vs 自适应 | 宽度自适应，高度固定 6mm | 用户难预判文字所需空间，自适应更优 |
| label 配置 | 新增 label 字段 vs 暴露 prefix/suffix | 暴露 prefix/suffix | 已有字段可覆盖需求 |
| 坐标原点 | 页面左上角 vs 内容区域左上角 | 页面左上角 | 和组件坐标系统一致 |
| 切换模式初始位置 | 保持当前预设坐标 vs 重置默认 | 重置为底部居中 | 简单明确 |
| 属性编辑入口 | 仅 PageSettingModal vs 右侧面板 | 点击页码框→右侧面板 | 和组件交互统一，效率高 |

## 3. SDK 类型变更

```typescript
export interface PageNumberConfig {
  enabled: boolean;
  position: 'bottom-center' | 'bottom-right' | 'bottom-left'
           | 'top-center' | 'top-right' | 'top-left'
           | 'custom';                    // 新增：自定义位置
  customX?: number;                        // 新增：自定义 X 坐标 (mm)，页面左上角为原点
  customY?: number;                        // 新增：自定义 Y 坐标 (mm)，页面左上角为原点
  format?: 'simple' | 'text' | 'slash';
  prefix?: string;
  suffix?: string;
  separator?: string;
  offsetX?: number;                        // 保留：仅预设模式下作为偏移量
  offsetY?: number;                        // 保留：仅预设模式下作为偏移量
  style?: {
    fontSize?: number;
    color?: string;
    fontWeight?: 'normal' | 'bold';
  };
}
```

- `customX`/`customY` 仅在 `position === 'custom'` 时生效，为绝对坐标（mm）
- `offsetX`/`offsetY` 仅在预设模式下生效，语义不变

## 4. SDK 渲染逻辑变更

### 4.1 `PrintEngine.renderPageNumber()`

**新增 custom 分支：**

```typescript
case 'custom':
  xMm = config.customX ?? 0;
  yMm = config.customY ?? 0;
  // 不叠加 offsetX/Y
  break;
```

### 4.2 宽度自适应

- 去掉固定 `width: 20mm`，改用 `white-space: nowrap` 让文本自然撑开
- 预设模式的居中/右对齐计算：用 `(字符数 × fontSize × 0.5)` 近似估算文本宽度，用于定位计算
- 实际渲染以浏览器排版为准，估算仅影响定位
- 高度保持固定 6mm

### 4.3 涉及文件

| 文件 | 改动 |
|---|---|
| `sdk/src/types.ts` | `PageNumberConfig` 新增 `custom`/`customX`/`customY` |
| `sdk/src/printEngine.ts` | `renderPageNumber()` 新增 custom 分支 + 宽度自适应 |

## 5. Designer UI 变更

### 5.1 PageSettingModal（精简）

仅保留：
- 启用页码开关
- 位置模式下拉（7 个选项含"自定义"）
- 切换到"自定义"时坐标重置为底部居中绝对坐标

prefix/suffix/样式/坐标等细节配置移到右侧面板。

### 5.2 Canvas 画布

**选中机制（仅 custom 模式）：**
- 点击页码框可选中，右侧面板自动切换为页码属性面板
- 点击空白处或其他组件时取消选中
- 预设模式下页码框不可选中、不可拖拽

**拖拽行为（仅 custom 模式）：**
- 页码框可拖拽，实时更新 `customX`/`customY`（px 转 mm，考虑 zoom）
- 网格吸附：复用 `snapToGrid(value, gridEnabled, gridSize)`，和组件一致
- 不对齐检测：不调用 `detectAlignment`，页码与组件不在同一层级
- 纸张边界约束：clamp 到 `[0, pageWidth - pageNumberWidth]` × `[0, pageHeight - 6]`（高度固定 6mm）
- Shift 键临时禁用网格吸附，和组件一致

**页码层级：**
- 页码是页面级配置，不属于 header/content/footer 任何区域
- 页码渲染在组件之上，可覆盖任何区域
- 无区域限制，无区域切换

### 5.3 右侧属性面板

选中页码时显示**页码属性面板**，包含：

| 分类 | 字段 |
|---|---|
| 布局 | X 坐标（customX）、Y 坐标（customY），InputNumber，mm |
| 格式 | 页码格式（simple/text/slash）、prefix、suffix、separator |
| 样式 | 字号、颜色、字重 |

与组件属性面板互斥——选中页码时显示页码面板，选中组件时显示组件面板。

### 5.4 涉及文件

| 文件 | 改动 |
|---|---|
| `designer/src/types/index.ts` | 类型同步 |
| `designer/src/pages/Designer/components/Canvas/PageSettingModal.tsx` | 精简 + 新增 custom 选项 |
| `designer/src/pages/Designer/components/Canvas/index.tsx` | 页码选中/拖拽逻辑 + 网格吸附 + 边界约束 |
| `designer/src/pages/Designer/components/PropertyPanel/` | 新增页码属性面板组件 |
| `designer/src/pages/Designer/components/PropertyPanel/index.tsx` | 选中页码时切换面板 |

## 6. 向后兼容

- `position` 新增 `'custom'` 值，旧数据不受影响（默认仍是 `'bottom-right'`）
- `customX`/`customY` 为可选字段，旧模板无这两个字段时默认为 0
- `offsetX`/`offsetY` 语义不变，仅预设模式下生效
- `prefix`/`suffix` 为可选字段，默认空字符串

## 7. 不在范围内

- 页码手动尺寸配置（宽高）
- 页码组件化（走组件渲染管线）
- 页码跨区域对齐检测
- `PageNumberRenderer`（旧版组件模式渲染器）的清理
