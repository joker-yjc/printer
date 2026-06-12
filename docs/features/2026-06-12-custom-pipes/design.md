# 方案设计：SDK 自定义 Pipe 适配器

## 1. 改动范围

| 文件 | 改动内容 |
|---|---|
| `sdk/src/PrintSDK.ts` | 新增 `PrintSDKOptions` 接口，`createPrintSDK` 接受 options |
| `sdk/src/printEngine.ts` | `PrintEngine` 构造函数接受 customPipes，`executePipe` 增加自定义优先逻辑 |
| `sdk/src/pipes/executors/index.ts` | 导出 `BUILT_IN_PIPE_TYPES` 常量供校验使用 |
| `sdk/CHANGELOG.md` | 记录新功能及规则 |
| `sdk/src/sdk.ts` | （可选）导出新增类型 |

## 2. API 设计

```ts
// PrintSDK.ts

interface PrintSDKOptions {
  /** 自定义管道执行器列表 */
  customPipes?: PipeExecutor[];
}

// createPrintSDK 签名变更
function createPrintSDK(options?: PrintSDKOptions): PrintSDK
```

## 3. 数据流

```
createPrintSDK({ customPipes })
       │
       ▼
PrintSDK 实例存储 customPipes
       │
       ▼ (调用 print/generateHTML 时)
createPrintEngine(template, data, customPipes)
       │
       ▼
PrintEngine 构造函数:
  - 遍历 customPipes，写入 this.customPipesMap (Map<string, PipeExecutor>)
  - 校验: executor 为 null → 抛错
  - 校验: type 为空 → 抛错
  - 校验: execute 非函数 → 抛错
  - 校验: type 在 customPipes 中重复 → console.warn
  - 校验: type 与内置重名 → console.warn 提示
  - 自定义管道执行时 try-catch 保护，异常回退原值
       │
       ▼
this.executePipe(type, value, options):
  1. 查 this.customPipesMap.get(type) → 有则执行
  2. 查全局内置 registry.getExecutor(type) → 有则执行
  3. 都找不到 → console.warn + 返回原值
```

## 4. 校验规则

| 条件 | 行为 |
|---|---|
| `executor` 为 null/undefined | `throw new Error('[PrintEngine] customPipes 数组中包含无效元素（null 或非对象）')` |
| `type` 为空/未定义 | `throw new Error('[PrintEngine] customPipe.type 不能为空')` |
| `execute` 非函数 | `throw new Error('[PrintEngine] customPipe "${type}" 的 execute 必须是函数')` |
| `type` 在 customPipes 中重复 | `console.warn('[PrintEngine] customPipes 中存在重复的 type "${type}"，后者将覆盖前者')` |
| `type` 与内置管道重名 | `console.warn('[PrintEngine] 自定义 pipe "${type}" 将覆盖内置同名管道')` - 允许继续 |

内置管道类型通过 `getRegisteredTypes()` 从 registry 动态获取，无需硬编码维护。

## 5. 内置管道类型

通过 `registry.getRegisteredTypes()` 动态获取，无需硬编码维护。当前内置管道：`date`、`currency`、`money`、`chineseNumber`、`uppercase`、`lowercase`、`slice`、`default`。

## 6. 向后兼容

- `createPrintSDK()` 不传参数 → 行为与之前完全一致
- 已有的模板、数据绑定、管道配置无需任何修改
- 内置管道注册方式不变，仍为全局单例

## 7. 不做的功能（本次范围外）

- ~~调用级别（`print()` 选项）传入 pipes~~（已确定走实例级别）
- ~~运行时动态注册/注销 pipes~~
- ~~Pipe 的序列化/反序列化~~
- ~~Designer 侧 UI 界面~~
