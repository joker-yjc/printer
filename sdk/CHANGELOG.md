# Changelog

所有版本的变更记录都列在这里，遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/) 规范。

## [1.12.0-alpha.1] - 2026-08-23

> ⚠️ 灰度测试版本（Alpha）：表格分组功能首发，API 已定型但可能随反馈微调，不建议生产环境直接使用。

### ✨ 新增功能

- **表格分组渲染（Group By）**
  - 新增 `TableProps.groupBy` 配置，按指定字段自动分组渲染表格，支持组标题行、组小计行、跨页拆分
  - 小计行未配置数据项时仅显示标签，不做数据汇总，便于签字/签收等用途
  - 分组结构为单 `<table>` 多 `<tbody data-group>`，保证跨页边框连续
  - 组标题行、小计行通过 `colspan` 合并整行展示
  - 组标题行、小计行支持背景色、字重、字号、水平对齐（`textAlign`）配置
  - 新增导出：`TableGroupConfig`、`GroupSummaryItem` 类型与 `groupByField` 工具函数（字段说明见 API 文档 / 用户手册）

- **表格分组分页（keepTogether）**
  - 整组优先保持在同一页，放不下时整组跳到下一页
  - 超过一页高度的超大组自动在组内拆页，拆分页自动重复组标题行
  - 分页高度采用逐行真实测量，减少页面底部留白

### 🐛 问题修复

- **修复表格合计每页重复显示**：`summaryDisplay: 'extra-only'` 搭配 `summaryMode: 'total'` 时，表尾合计行此前会在每个分页重复出现，现仅在最后一页显示一次
- **修复分组表格分页留白过大**：分页测量时误将插入的组标题/小计行计入数据行高集合，导致长度不匹配而整体回退到保守估算行高（约高估 56%）；现已排除插入行并单独测量其高度
- **修复分组表格拆页溢出**：本页剩余空间连「组标题 + 首行」都放不下时，原实现会强制塞入一行导致表格超出页面底部被截断；现改为整组移到下一页（仅本页完全为空时才兜底放一行）。同时为 total 末页回退增加死循环风险日志

### ⚠️ 行为变更（破坏性）

- **`extra-only` 模式的额外行（summaryExtraRows）渲染时机变更**：此前在 `summaryDisplay: 'extra-only'` 下，额外行**每页渲染**（无视 `summaryMode`）；现改为**遵循 `summaryMode`**（默认 `total`，即仅末页渲染）。影响存量模板：仅配置 `summaryDisplay: 'extra-only'` 而未显式设置 `summaryMode` 时，额外行会从「每页显示」变为「仅末页显示」。如需保持每页渲染，请显式设置 `summaryMode: 'page'`。

### 🎨 设计器同步更新

- 属性面板新增「表格分组」配置区（启用开关、标题/小计分区编辑）
- 画布占位预览支持分组效果示意
- 列配置卡片中「管道转换」由折叠面板改为平铺展示
- 新增分组示例 Schema、模板与 Mock 数据（含 8 组 × 80 行的大数据量压测数据）

## [1.11.0] - 2026-07-07

### ✨ 新增功能

- **HTML 转义控制**
  - 新增 `escapeHtml` 配置项，允许用户关闭 HTML 转义以支持富文本渲染
  - 默认值 `true`（安全优先），需显式关闭
- **全局配置归一化入口 `configureSDK()`**
  - 新增 `configureSDK(config: SDKGlobalConfig)` 方法，统一管理全局级别配置参数
  - 后续新增的全局参数只需在 `SDKGlobalConfig` 接口加字段，不新增函数
  - `SDKGlobalConfig` 接口当前包含：`escapeHtml?: boolean`
- **统一 `escapeHtml` 工具函数**
  - 将原先分散在 `TableRenderer`、`PageNumberRenderer`、`PrintEngine` 中的三份 `escapeHtml` 实现统一为 `utils/htmlEscape.ts` 中的一份
  - 新签名：`escapeHtml(text: string, shouldEscape: boolean): string`，`shouldEscape=false` 时原样返回

### 📖 使用示例

```ts
import { createPrintSDK, configureSDK } from '@jcyao/print-sdk';

// 实例级关闭转义（仅影响该实例）
const sdk = createPrintSDK({ escapeHtml: false });

// 全局级关闭转义（影响所有后续创建的实例）
configureSDK({ escapeHtml: false });

// 全局关闭 + 实例开启（实例级覆盖全局级）
configureSDK({ escapeHtml: false });
const sdk = createPrintSDK({ escapeHtml: true }); // 该实例转义开启
```

### ⚙️ 优先级规则

```
实例级 createPrintSDK({ escapeHtml })  >  全局级 configureSDK({ escapeHtml })  >  默认值 true
```

### 📝 补充说明

- `configureSDK` 与 `registerExecutor` 的区别：
  - `configureSDK`：管理配置值类型的全局参数（boolean / string / number）
  - `registerExecutor`：注册处理器列表（Map<string, PipeExecutor>），性质不同，保持独立
- 关闭转义后，所有渲染器（表格、页码等）的输出内容均不进行 HTML 转义
- 向后兼容：不传任何配置时行为不变，默认转义

## [1.10.0] - 2026-06-12

### ✨ 新增功能

- **自定义 Pipe 适配器（Custom Pipes）**
  - `createPrintSDK({ customPipes })` 支持传入自定义管道执行器，无需修改 SDK 源码即可扩展或覆盖管道行为
  - 实例级别隔离：不同 SDK 实例可配置不同的自定义管道，互不干扰
  - 自定义管道优先级高于内置管道，同名时自动覆盖
- **补充说明：`customPipes` 与 `registerExecutor` 的区别**
  - `customPipes`：实例级注入，仅影响当前 SDK 实例，不同实例互不干扰（推荐）
  - `registerExecutor`：全局注册，写入全局注册表，影响所有 SDK 实例（适用于单例应用或确认全局生效的场景）
  - 两者均能覆盖内置管道，`customPipes` 优先级最高

### 📖 使用示例

```ts
const sdk = createPrintSDK({
  customPipes: [
    {
      type: 'phoneMask',
      label: '手机号掩码',
      execute: (value) => String(value).replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
    },
  ],
});
```

### ⚠️ 自定义管道校验规则

| 条件 | 行为 |
|---|---|
| `type` 为空 | 抛错提示 |
| `execute` 非函数 | 抛错提示 |
| `type` 与内置管道重名 | `console.warn` 警告，允许继续 |
| `type` 在 customPipes 中重复 | 后面的覆盖前面的 |

**影响范围**：`sdk/src/PrintSDK.ts`、`sdk/src/printEngine.ts`、`sdk/src/pipes/executors/index.ts`、`sdk/src/sdk.ts`

---

## [1.9.0] - 2026-06-10

### ✨ 新增功能

- **页码自定义位置**
  - `PageNumberConfig.position` 新增 `'custom'` 选项，支持自由定位
  - 新增 `customX`/`customY` 字段，支持页码绝对坐标定位（页面左上角为原点）

---

## [1.8.0] - 2026-06-07

### ✨ 新增功能

- **列级管道支持（TableColumn Pipes）**
  - `TableColumn` 新增 `pipes` 字段，支持对表格列数据应用管道链转换
  - `TableRenderer` 在渲染单元格时对 `col.pipes` 依次执行，前一个输出作为后一个输入
  - 管道执行异常时自动回退至原始值，不影响表格渲染

- **DataField 基础接口**
  - 新增 `DataField` 接口，仅包含 `pipes?: PipeConfig[]`，统一管道能力抽象
  - `DataBinding extends DataField`，保持向后兼容
  - `TableColumn extends DataField`，继承管道能力
  - `SummaryExtraRowItem extends DataField`，替代原有显式 `pipes` 字段

### 🔧 内部重构

- SDK `sdk.ts` 新增导出 `DataField`、`PageSection`、`SchemaFieldType`、`TableColumnSummary`
- `DataField` 作为可复用基础接口，为后续更多场景的管道能力统一铺路

---

## [1.7.0] - 2026-06-06

### ✨ 新增功能

- **表格表头显示控制 + 跨页重复表头**
  - 新增"跨页重复表头"配置（`repeatHeader`），与"显示表头"（`showHeader`）联动控制
  - 取消"显示表头"时自动同步关闭"跨页重复表头"
  - SDK 支持 `showHeader + repeatHeader` 组合逻辑矩阵：
    - `showHeader=false` → 任何页都不渲染表头
    - `showHeader=true + repeatHeader=false` → 仅首页渲染表头
    - `showHeader=true + repeatHeader=true` → 每页重复渲染表头
  - 设计器预览中隐藏表头时显示半透明提示，便于识别当前状态

- **表格密度预设**
  - 新增 `TABLE_DENSITY_PRESETS` 常量，提供 `normal` 和 `compact` 两种密度预设
  - `TableProps` 新增 `density` 字段（`'normal' | 'compact'`），控制单元格 padding 和 line-height
  - `compact` 模式：`cellPadding: '1px 4px'`, `lineHeight: '1.2'`，减少行高约 30%
  - Designer WYSIWYG 画布预览与 SDK 渲染严格对齐

- **合计行显示模式**
  - `TableProps` 新增 `summaryDisplay` 字段（`'both' | 'none' | 'extra-only'`），替代旧的 `showSummary` 布尔值
  - `extra-only` 模式：仅显示额外行（如大写金额），隐藏普通合计
  - 旧 `showSummary` 字段向后兼容，内部自动转为 `summaryDisplay`
  - 新增 `resolveSummaryMode()` 工具函数，统一 SDK 各决策点的显示模式解析

- **批量打印 API**
  - 新增 `generateHTMLMultiple()` 批量生成 HTML（同模板多数据），供 Electron 等需要自行处理打印的环境使用
  - 新增 `generateHTMLMultiTemplate()` 多模板批量生成 HTML
  - 新增 `printMultiple()` / `printMultiTemplate()` 批量打印方法（内部已重构：先调用 `generateHTML*` 再走统一 `executePrint`，消除 ~130 行重复代码，统一 `afterprint` + 5s 兜底清理）

### 🐛 问题修复

- **首个表格组件 y 坐标偏移**：SDK 分页引擎中第一个组件的 `yMm` 被强制设为 `marginTop`，丢失了原始值（Designer 画布以页面顶部为原点，SDK 渲染以内容区域顶部为原点，坐标系不一致）
- **旧代码 `showHeader=false` 时首页仍显示表头**：`splitTableWithGap` 分页时未联动 `showHeader` 状态
- **`extra-only` 模式 fallback 错误**：Renderer 在 `extra-only` 模式下错误地使用 `summaryMode` 作为是否渲染合计行的依据，导致全空数据时仍走合计渲染路径

### 🧹 清理

- `printMultiple` / `printMultiTemplate` 内部重构：先调用 `generateHTML*` 生成 HTML，再走统一 `executePrint` 入口，消除 ~130 行重复代码
- 移除 `TABLE_STYLE_DEFAULT.CELL_PADDING` 死代码（已迁移到 `TABLE_DENSITY_PRESETS`）
- 移除 `STYLE_DEFAULT` 残余引用

### ⚠️ 行为变更

- `TABLE_DEFAULT.HEADER_HEIGHT` 从 10mm 调整为 **8mm**，与 `MIN_ROW_HEIGHT` 统一
  - 浏览器端 DOM 实测表头高度不受影响，SSR 路径和 fallback 计算直接使用此常量

### 🔧 类型变更

- **`TableProps` 新增可选属性**：`density`、`summaryDisplay`
- **移除 `TablePaginationConfig` 接口**（孤立死代码），`repeatHeader` 已在更早版本提升至 `TableProps` 顶层

**影响范围**：`sdk/src/types.ts`、`sdk/src/printEngine/constants.ts`、`sdk/src/printEngine/renderers/TableRenderer.ts`、`sdk/src/printEngine/renderers/index.ts`、`sdk/src/printEngine.ts`、`sdk/src/PrintSDK.ts`、`sdk/src/sdk.ts`、`designer/src/types/index.ts`、`designer/src/pages/Designer/components/Canvas/componentRenderers/TablePreview.tsx`、`designer/src/pages/Designer/components/PropertyPanel/TableColumnSection.tsx`

---

## [1.6.0] - 2026-06-04

### ✨ 新增功能

- **表格列级样式控制**
  - 新增 `TableColumnStyle` 类型，支持每列数据单元格独立设置 fontSize、fontWeight、color、textAlign
  - 新增 `TableHeaderStyle` 类型，支持表头逐列样式覆盖
  - `TableColumn` 新增 `style`（数据单元格）和 `headerStyle`（表头单元格）可选字段
  - `TableProps` 新增 `headerStyle`（表格级表头默认样式）、`rowNumberStyle`（序号列数据样式）、`rowNumberHeaderStyle`（序号列表头样式）
  - `TableRenderer` 新增 `mergeColumnStyle` 样式合并逻辑，优先级：列级 > 表格级 > 常量默认值
  - 序号列也支持 style/headerStyle 配置

- **表头样式默认值常量化**
  - 新增 `TABLE_HEADER_STYLE_DEFAULT` 常量，统一控制表头默认背景色和字重
  - `TABLE_STYLE_DEFAULT.HEADER_BACKGROUND` 已废弃，由 `TABLE_HEADER_STYLE_DEFAULT.BACKGROUND` 替代

### ⚠️ 行为变更

- `TableColumn.align` 字段此前未在表头和数据单元格中生效，现已纳入对齐优先级链（低于 `style.textAlign` / `headerStyle.textAlign`）

**影响范围**：`sdk/src/types.ts`、`sdk/src/sdk.ts`、`sdk/src/printEngine/constants.ts`、`sdk/src/printEngine/renderers/TableRenderer.ts`

---

## [1.5.1] - 2026-05-30

### 🐛 问题修复

| 问题 | 修复内容 |
|------|----------|
| 表格末行溢出页底边距 | `availableForRows` 减去 1mm 安全边距，防止浮点精度或行高累加导致末行超出内容区底边 |
| 打印时表格内容溢出页面 | `@media print` 中 `.print-page` 高度设为 `calc(pageHeight - 1mm) !important`，与分页算法配合防止内容溢出物理页面底边 |

**影响范围**：`sdk/src/printEngine.ts`（`splitTableWithGap` 分页计算）、`sdk/src/printEngine/htmlTemplate.ts`（`generatePrintPageStyles`、`generateBatchPrintStyles`）

---

## [1.5.0] - 2026-05-30

### ✨ 新增功能

- **页头/页脚（Header/Footer）**
  - 支持配置页头/页脚区域，可独立添加组件、设置高度、控制显示
  - 每页自动注入页头/页脚组件，坐标转换为页面绝对坐标
  - 页头组件：`yMm + marginTop`；页脚组件：`yMm + pageH - footerH - marginBottom`
  - 设计器三区域独立渲染（header/content/footer），支持组件跨区域拖拽
  - 页头/页脚区域高度可通过拖拽手柄实时调整（前后端一致 15mm 最小高度保护）
  - 连续纸模式下自动禁用页头/页脚
  - 表格组件禁止放入页头/页脚（含组件库拖拽、数据资产拖拽、跨区域拖拽）
  - 层级管理（置顶/置底/上移/下移）覆盖三区域
  - 对齐工具支持区域感知约束（header/footer 使用区域相对坐标，content 使用内容区相对坐标）
  - 空画布检查覆盖三区域

### 🐛 问题修复

| 问题 | 修复内容 |
|------|----------|
| 分页引擎坐标系不一致 | `shouldBreakPage` 参数 `marginTop` → `contentTop`，表格分页使用 `contentTop`/`contentBottom` 边界统一到绝对坐标系 |
| `constrainYFor` content 分支坐标系错误 | content 组件 yMm 是区域相对坐标，min Y 使用 0 而非 `marginMm.top`，max Y 扣减 headerH/footerH |
| `constrainYFor` 缺少最小高度保护 | header/footer 约束中 `headerHeight \|\| 0` → `Math.max(15, headerHeight \|\| 15)` |
| `getPageSize()` useEffect 闭包过期 | 拖拽/resize 闭包内改用 `pageConfigRef.current` 内联计算页面尺寸 |
| `getCanvasSize` 连续纸未遍历三区域 | 改为 `[...headerComponents, ...components, ...footerComponents]` |
| `handleDrop` 表格/线条宽度硬编码 | 提取 `pageWidthMmForDrop`/`effectivePageWForDrop` 支持 CUSTOM/CONTINUOUS/landscape |
| `alignComponents` 跨区域坐标系 | 新增 `constrainYFor(section, h)` 和 `getSection(id)`，垂直对齐使用区域感知约束 |
| `distributeComponents` 缺失排序 | 恢复 `.sort()` |
| `handleDrop` 丢失 section 参数 | 组件库拖拽 `addComponent(newComponent, section)` 传入正确 section |
| 层级管理不覆盖页头/页脚 | `bringToFront/sendToBack/bringForward/sendBackward` 扩展为三区域感知 |
| 对齐工具跨区域未拦截 | 垂直方向对齐（top/bottom/centerV）跨区域时 return state |
| 连续纸显示页头/页脚手柄 | 渲染条件添加 `pageConfig.size !== 'CONTINUOUS'` |
| Ctrl+V 粘贴区域错误 | 根据选中组件推断目标 section |
| 拖拽 useEffect 闭包过期 | 全改用 useRef 缓存状态值 |
| 空画布检查遗漏页头/页脚 | 三区域联合判断 |
| array 字段缺少表格区域拦截 | 数据资产拖拽分支添加 `section !== 'content'` 拦截 |
| `isComponentOutOfBounds` 旧模板回归 | header/footer 区域独立判断高度越界，content 区域扣减 headerH/footerH |
| 页头/页脚宽度越界未检测 | 宽度越界在区域判断前统一检测 |
| `lastMousePosRef` 初始值跳变 | `handleComponentMouseDown` 中初始化 `lastMousePosRef.current = {x, y}` |
| resize useEffect 依赖过重 | resize 手柄 useEffect 仅依赖 `[resizingSection, setPageConfig]` |
| `distributeComponents` 跨区域分配 | 垂直方向添加跨区域检测 |
| `measureMaxHeight` 命名歧义 | 重命名为 `measureMaxBottom` |
| `inferHeight` 禁用区域返回 15 | 禁用时返回 0 |
| `moveComponentToSection` 缺少表格拦截 | 添加 `found.type === 'table'` 拦截 |
| `(component as any)._section` 多余断言 | 移除 `as any` |
| TemplatePreviewModal 中文值存入 `_section` | 改用独立 `_displaySection` 字段 |
| `overflow: hidden` 仅在 TextRenderer 处理 | printEngine `renderSinglePage` 统一为 header/footer 组件注入 |
| `page-content` 缺少 `onDrop` 兜底 | 添加 `onDrop={(e) => handleDrop(e, 'content')}` |
| PageSettingModal `min={5}` → `min={15}` | 与最小高度保护一致 |

### 🔧 类型变更

- **`PageConfig` 新增可选属性**：`headerEnabled`、`headerHeight`、`footerEnabled`、`footerHeight`
- **`PrintTemplate` 新增可选属性**：`headerComponents`、`footerComponents`
- **`ComponentNode` 新增可选属性**：`_section?: PageSection`

**影响范围**：`sdk/src/printEngine.ts`（分页 + header/footer 注入）、`sdk/src/types.ts`（类型扩展）、`designer/src/store/designer.ts`（三区域状态管理）、`designer/src/types/index.ts`（Designer 类型）、`designer/src/pages/Designer/components/Canvas/`（拖放、对齐、层级、越界检测）、`designer/src/pages/Designer/PageSettingModal.tsx`（页头/页脚配置）、`designer/src/components/PrintPreview/`（打印预览 + 空画布检查）

---

## [1.4.0] - 2026-05-19

### ✨ 新增功能

- **表格列宽自定义**
  - 新增 `TableColumn.width` 字段，支持为每列指定固定宽度（mm）
  - `computeColWidths` 智能列宽计算：全部未设置→均分、部分设置→固定列+均分剩余、超出时→按比例缩放 + 未固定列最小份额保护
  - 最后一列自动吸收舍入误差，确保百分比总和严格等于 100%
  - `computeColumnMaxWidth` 导出函数，提供列最大宽度计算
  - 设计器列配置面板支持 `width` 输入框
  - 设计器表格预览支持拖拽调整列宽（实时同步到配置）

- **行号列宽度自定义**
  - 新增 `rowNumberWidth` 属性，支持自定义行号列宽度（mm）

- **表格边框自定义**
  - 新增 `borderStyle` 属性，支持 `solid` / `dashed` 两种边框样式
  - 新增 `borderColor` 属性，支持自定义边框颜色（默认 `#d9d9d9`）
  - 新增 `borderWidth` 属性，支持自定义边框线宽（1-5px，默认 1px）
  - 所有边框属性仅当 `bordered: true` 时生效，向下兼容

### 🔧 类型变更

- **`TableProps` 新增可选属性**：`rowNumberWidth`、`borderStyle`、`borderColor`、`borderWidth`

**影响范围**：`sdk/src/printEngine/renderers/TableRenderer.ts`、`sdk/src/types.ts`、`sdk/src/index.ts`、`designer/src/pages/Designer/components/PropertyPanel/TableColumnSection.tsx`、`designer/src/pages/Designer/components/Canvas/componentRenderers/TablePreviewRenderer.tsx`

---

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
