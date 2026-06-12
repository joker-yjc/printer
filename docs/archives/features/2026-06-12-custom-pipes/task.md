# 任务执行：SDK 自定义 Pipe 适配器

## 任务列表

### Task 1: 导出内置管道类型集合
- **文件**: `sdk/src/pipes/executors/index.ts`
- **内容**: 导出 `BUILT_IN_PIPE_TYPES` 常量（`Set<string>`）
- **验证**: 确认 import 后包含所有 8 个内置类型

### Task 2: PrintEngine 支持 customPipes
- **文件**: `sdk/src/printEngine.ts`
- **内容**:
  - 构造函数新增 `customPipes?: PipeExecutor[]` 参数
  - 初始化时构建 `this.customPipesMap: Map<string, PipeExecutor>`
  - 校验逻辑（type 空检查、execute 非函数检查、重名警告）
  - 修改私有方法 `executePipe`：优先查 customMap → fallback 内置
- **验证**: 传入自定义 pipe → 模板引用该 type 时生效

### Task 3: PrintSDK 透传 customPipes
- **文件**: `sdk/src/PrintSDK.ts`
- **内容**:
  - 新增 `PrintSDKOptions` 接口
  - `PrintSDK` 存储 `customPipes` 字段
  - 所有调用 `createPrintEngine` 的地方透传 `customPipes`
  - `createPrintSDK` 接受 `options?: PrintSDKOptions`
- **验证**: `createPrintSDK({ customPipes })` → pipe 生效

### Task 4: 更新 CHANGELOG
- **文件**: `sdk/CHANGELOG.md`
- **内容**: 记录 customPipes 功能、API 用法、校验规则

### Task 5: 构建验证
- **命令**: 在 `sdk/` 目录执行构建，确认无类型错误
