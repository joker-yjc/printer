# 任务执行：HTML 转义控制与全局配置归一化

## 任务列表

### Task 1: 新增全局配置模块
- **文件**: `sdk/src/config/globalConfig.ts`（新建）
- **内容**:
  - 定义 `SDKGlobalConfig` 接口（含 `escapeHtml?: boolean`）
  - 实现 `configureSDK(config: SDKGlobalConfig): void`
  - 实现 `getGlobalConfig(): SDKGlobalConfig`（内部使用）
- **验证**: import 后调用 `configureSDK({ escapeHtml: false })`，`getGlobalConfig().escapeHtml === false`

### Task 2: 新增统一 escapeHtml 工具函数
- **文件**: `sdk/src/utils/htmlEscape.ts`（新建）
- **内容**:
  - 导出 `escapeHtml(text: string, shouldEscape: boolean): string`
  - `shouldEscape=false` 时原样返回 `text`
  - `shouldEscape=true` 时执行正则转义（`& < > " '`）
- **验证**: `escapeHtml('<b>', true)` → `'&lt;b&gt;'`；`escapeHtml('<b>', false)` → `'<b>'`

### Task 3: PrintSDKOptions 扩展 + 优先级解析
- **文件**: `sdk/src/PrintSDK.ts`
- **内容**:
  - `PrintSDKOptions` 增加 `escapeHtml?: boolean` 字段
  - `PrintSDK` 新增私有字段 `escapeHtml: boolean`
  - 构造函数解析优先级：`options?.escapeHtml ?? getGlobalConfig().escapeHtml ?? true`
  - 所有调用 `createPrintEngine` 的地方透传 `this.escapeHtml`
- **验证**: `createPrintSDK({ escapeHtml: false })` → 实例 `escapeHtml === false`；不传 → `true`

### Task 4: PrintEngine 接受 escapeHtml + 注入 RenderContext
- **文件**: `sdk/src/printEngine.ts`、`sdk/src/printEngine/types.ts`
- **内容**:
  - `RenderContext` 增加 `escapeHtml: boolean` 字段
  - `PrintEngine` 构造函数新增 `escapeHtml?: boolean` 参数（第四参数）
  - 存储为 `this.escapeHtmlFlag`（避免与方法名 `escapeHtml` 冲突）
  - `RenderContext` 构建时注入 `escapeHtml: this.escapeHtmlFlag`
  - `renderPageNumber` 改为 `escapeHtml(pageText, this.escapeHtmlFlag)`（引用统一工具函数）
  - 删除类内原有的 `escapeHtml` 方法
  - `createPrintEngine` 函数签名同步更新
- **验证**: 传入 `escapeHtml: false` → `context.escapeHtml === false`；页码文本含 `<` 时不转义

### Task 5: 渲染器改用统一工具函数
- **文件**: 
  - `sdk/src/printEngine/renderers/TableRenderer.ts`
  - `sdk/src/printEngine/renderers/PageNumberRenderer.ts`
- **内容**:
  - **TableRenderer**: 
    - 删除模块内 `escapeHtml` 函数定义
    - import 统一工具函数
    - `title`、`value`、`content` 三处改为 `escapeHtml(xxx, context.escapeHtml)`
  - **PageNumberRenderer**: 
    - 删除类内 `escapeHtml` 方法
    - import 统一工具函数
    - `pageText` 改为 `escapeHtml(pageText, context.escapeHtml)`
- **验证**: `context.escapeHtml = false` 时，含 `<b>` 标签的数据原样输出；`true` 时正常转义

### Task 6: 导出 configureSDK 和类型
- **文件**: `sdk/src/sdk.ts`
- **内容**:
  - 导出 `configureSDK` 函数
  - 导出 `SDKGlobalConfig` 类型
- **验证**: 外部 `import { configureSDK, SDKGlobalConfig } from 'sdk'` 可用

### Task 7: 更新 CHANGELOG
- **文件**: `sdk/CHANGELOG.md`
- **内容**: 记录 `configureSDK`、`escapeHtml` 配置、优先级规则、统一工具函数、使用示例

### Task 8: 构建验证
- **命令**: 在 `sdk/` 目录执行构建，确认无类型错误
