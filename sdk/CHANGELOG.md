# Changelog

所有版本的变更记录都列在这里，遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/) 规范。

## [1.3.0] - 2026-05-16

### ✨ 新增功能

- **表格合计额外行（Summary Extra Rows）**
  - 支持在表格合计行下方添加自定义额外行（如金额大写、备注说明等）
  - 额外行支持数据绑定到指定列的合计值（`sourceColumn`）
  - 额外行支持管道系统格式化（`ChineseNumberPipe`、`MoneyPipe` 等）
  - 设计器提供完整的额外行配置 UI（增删改、列选择、管道配置器）
  - 选择 `sourceColumn` 时自动创建对应列的 `sum` 汇总配置

- **表格行号列**
  - 新增 `showRowNumber` 属性，支持显示行号列
  - 支持自定义行号列标题（`rowNumberLabel`）
  - 设计器表格预览支持行号列显示

### 🐛 问题修复

| 问题 | 修复内容 |
|------|----------|
| 表格宽度计算公式不一致 | `measureTableRowHeights` 与 `TableRenderer.render()` 统一使用 `maxRightEdge = pageWidth - marginRight`，修复旧公式多扣一次 `marginLeft` 导致的行高测量不准 |
| `shouldBreakPage` 坐标系不一致 | 统一使用绝对坐标系比较（`availableHeight + marginTop`），修复提前换页问题 |
| total 模式产生空表格片段 | 回退后 `rowsCanFit === 0` 时强制放入 1 行数据，避免生成只有表头的空页面 |
| 防御检查精度混合 | 防御检查仅替换当前页 `rowHeightsForThisPage`，不再覆盖后续页的测量值 |
| 防御检查阈值宽松 | 增加 `Math.max(..., 2)` floor，避免剩余行数少时误触发 |
| `getValueByPath` null 处理 | `!== undefined` 改为 `!= null`，确保 `null` 值走 fallback 而非渲染为 `"null"` |
| SSR 回退缺少额外行 | `measureTableRowHeights` 的 SSR/无 renderer 回退路径计入 `summaryExtraRows` 高度 |
| `calculateHeight` 回退缺少额外行 | 无 `binding.path` 的回退路径计入 `summaryExtraRows` 高度 |
| 额外行管道缺少异常保护 | 增加 try-catch，异常时回退到原始值而非 `null` |

### 🔧 类型变更

- **`DataBinding.path` 改为可选**（`path?: string`），与 Designer 端保持一致

### 🧹 清理

- 移除 `_rowHeights` 死代码（无 reader 只有 writer）

**影响范围**：`sdk/src/printEngine.ts`、`sdk/src/printEngine/renderers/TableRenderer.ts`、`sdk/src/types.ts`、`designer/src/pages/Designer/components/PropertyPanel/TableColumnSection.tsx`、`designer/src/pipes/configurators/`

---

## [1.2.0] - 2026-05-11

### ✨ 新增功能

- **ChineseNumberPipe 增强**
  - 支持小数转换（如 `3.14` → `叁点壹肆`）
  - 支持负数（如 `-5` → `负伍`）
  - `both` 模式支持自定义连接符（如 `separator: ' 大写：'` 输出 `1000 大写：壹仟`）
- **MoneyPipe 中文大写金额**
  - 新增 `format: 'chineseUppercase'`，遵循会计规范输出金额大写（如 `壹佰贰拾叁元肆角伍分`）
  - 正确处理元、角、分、整，零位补位
  - 支持 `uppercaseMode: 'both'` 同时显示数字和中文大写
  - 支持自定义连接符
- **表格合计字段接入管道系统**
  - `TableColumnSummary.pipe` 字段，可挂接任意管道对合计值做格式化
  - 合计行支持 `ChineseNumberPipe`（中文数字大写）、`MoneyPipe`（中文金额大写）等
  - 设计器合计配置面板增加管道选择器和配置 UI

### 🔧 破坏性变更

- **移除 `ChineseNumberOptions` 接口**：原 `chineseFormat` 字段被 `TableColumnSummary.pipe` 替代，已有模板需将 `chineseFormat` 改为 `pipe` 配置
- **表格合计中文大写迁移**：不再通过 `summary.chineseFormat` 配置，改用 `summary.pipe: { type: 'chineseNumber', options: {...} }` 或 `summary.pipe: { type: 'money', options: { format: 'chineseUppercase', ...} }`

### 🧹 清理

- 移除 `TableRenderer` 中残留的调试日志

**影响范围**：`sdk/src/pipes/executors/ChineseNumberPipe.ts`、`sdk/src/pipes/executors/MoneyPipe.ts`、`sdk/src/printEngine/renderers/TableRenderer.ts`、`sdk/src/types.ts`、`designer/src/types/index.ts`、`designer/src/pages/Designer/components/PropertyPanel/TableColumnSection.tsx`、`designer/src/pipes/configurators/`

---

## [1.1.3] - 2026-05-07

### ✨ 新增功能

- **多模板批量打印**：新增 `printMultiTemplate` 方法，支持一次打印操作中组合多个不同模板及各自对应的数据列表（一客一模板场景）。接受 `PrintTemplateGroup[]` 参数，每个 group 包含一个 `template` 和 `dataList`，内部复用现有引擎渲染和拼接逻辑。
- **设计器多模板模式**：打印预览弹窗新增「多模板模式」切换，可自由组合已保存模板和当前画布模板，为每个模板选择对应的 Mock 数据进行混合打印预览和打印。

**影响范围**：`sdk/src/PrintSDK.ts`（新增方法）、`sdk/src/sdk.ts`（导出新类型）、`designer/src/components/PrintPreview/`（新增多模板 UI）

### ⚠️ 已知限制

- 多模板打印要求所有模板使用相同纸张尺寸，混合纸张尺寸暂不支持

---

## [1.1.2] - 2026-05-07

### 🐛 问题修复

| 问题 | 修复内容 |
|------|----------|
| 打印内容偏左 | `@media print` 中 `.print-page` 的 `margin` 未完全覆盖，导致 `auto` margin 在打印时产生偏移 |
| 批量打印无边距 | `generateBatchPrintStyles` 未设置 `.print-page` 的 `padding`，导致边距功能失效 |

### ✨ 新增功能

- **多模板批量打印**：新增 `printMultiTemplate` 方法，支持一次打印操作中组合多个不同模板及各自对应的数据列表（一客一模板场景）

### 🔧 修复详情

#### 1. 打印样式 `@media print` 增强

- `body` 样式增加 `!important` 标记，确保打印时完全重置 `margin`、`padding`、`background`
- `.print-page` 的 `margin-bottom: 0 !important` 改为 `margin: 0 !important`，完全覆盖所有方向的 `auto` margin
- `.print-page` 的 `box-shadow` 增加 `!important` 标记

**影响范围**：`generatePrintPageStyles`、`generateBatchPrintStyles`

#### 2. 批量打印边距修复

- `generateBatchPrintStyles` 的 `.print-page` 基础样式增加 `padding: ${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm`
- 确保批量打印时页面边距功能正常生效

---

## [1.1.1] - 2026-01-22

### ✨ 新增功能

- **表格嵌套对象数据支持**：表格打印支持嵌套对象格式的数据源（如 `{ a: { b: 1 } }`），数据绑定时可通过路径（如 `a.b`）正确解析
- **服务架构简化**：移除独立 server 服务，改用 Vite mock 集成，降低开发和部署复杂度

---

## [1.1.0] - 2026-04-15

### 🎯 重大改进

#### 表格分页精度革命性提升
- **渲染后测量方案**：将表格真实渲染到隐藏 DOM 中，测量每行实际高度
- **彻底解决长文本换行问题**：不再依赖估算行高，避免分页截断
- **表头高度真实测量**：支持表头换行场景
- **合计行高度真实测量**：避免合计行间距不一致

#### 组件定位逻辑优化
- **支持负 gap（组件重叠）**：完全保留设计时的相对位置关系
- **表格跨页后精确定位**：后续组件定位到表格实际底部
- **新页面组件间距处理**：正确处理与页面顶部的间距

#### 表格渲染改进
- **列宽均分方案**：按列数百分比均分，避免宽度溢出
- **单元格垂直居中**：文字垂直居中对齐
- **min-height 替代固定高度**：允许内容自然撑开

### 🔧 工程改进

- **iframe 生命周期优化**：使用 `afterprint` 事件 + 5秒兜底，确保可靠清理
- **DOMParser 替代正则**：批量打印时更健壮地提取 body 内容
- **Decimal.js 错误处理**：添加友好的"计算错误"提示
- **表格宽度溢出检测**：`xMm` 越界时输出明确错误提示
- **异步架构改造**：核心方法改为 `async/await`，支持渲染后测量

### 🐛 问题修复

| 问题 | 修复内容 |
|------|----------|
| 分页计算精度丢失 | 使用真实渲染高度代替估算高度 |
| 表格高度计算不一致 | 渲染后测量 + min-height |
| 组件间距为负数 | 保留设计意图，支持组件重叠 |
| iframe 移除时机 | afterprint 事件 + 兜底定时器 |
| 表格宽度溢出 | 添加 xMm 越界检测 |
| 正则提取 body | 使用 DOMParser |
| Decimal.js 错误 | 添加错误处理和友好提示 |

### ⚠️ 已知限制

- 页码宽高固定（20mm x 6mm），大字体时可能溢出
- 连续纸模式高度为 Infinity（设计如此，适配连续纸打印）

---

## [1.0.1] - 2026-01-22

### ✨ 新增功能

- **页码功能**：支持6种位置、3种格式、自定义样式
  - 位置：上左/上中/上右/下左/下中/下右
  - 格式：simple、slash、text
  - 支持偏移量、前后缀、样式自定义
  
- **批量打印预览**：支持多份文档一次性预览和打印
  - 自动合并 HTML
  - 显示文档分割线和序号
  - 支持进度回调

- **PageNumberRenderer**：新增页码渲染器插件

### 🎨 体验优化

- 组件库和数据资产支持双击快速添加
- 组件库和数据资产支持拖拽精确定位
- 智能计算画布中心位置

### 🔧 架构优化

- 页码功能从组件模式重构为页面配置模式
- SDK 增加 PageNumberRenderer 支持

---

## [1.0.0] - 2026-01-20

### 🎉 初始发布

**核心功能**
- 可视化模板设计器（拖拽 + 对齐 + 网格吸附）
- 7种基础组件：文本、图片、表格、二维码、条形码、矩形、线条
- Schema 字典管理 + Mock 数据管理
- 数据绑定 + Pipes 格式化
- SDK 打印引擎 + 表格分页渲染

**技术特性**
- 插件化架构（渲染器、管道）
- TypeScript 完整类型定义
- 客户端渲染，零服务端压力
- 使用 decimal.js 保证数值精度

---

## 版本号说明

遵循 [语义化版本 2.0.0](https://semver.org/lang/zh-CN/)：

- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能新增
- **修订号**：向下兼容的问题修复
