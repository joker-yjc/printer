# 方案设计：HTML 转义控制与全局配置归一化

## 1. 改动范围

| 文件 | 改动内容 |
|---|---|
| `sdk/src/config/globalConfig.ts` | **新增**：全局配置模块，`SDKGlobalConfig` 接口 + `configureSDK()` + `getGlobalConfig()` |
| `sdk/src/utils/htmlEscape.ts` | **新增**：统一 `escapeHtml(text, shouldEscape)` 工具函数，`shouldEscape=false` 时原样返回 |
| `sdk/src/PrintSDK.ts` | `PrintSDKOptions` 增加 `escapeHtml?: boolean`；`PrintSDK` 存储并透传 `escapeHtml` |
| `sdk/src/printEngine.ts` | `PrintEngine` 构造函数接受 `escapeHtml`；`RenderContext` 注入 `escapeHtml`；页码渲染改用统一工具函数；删除类内 `escapeHtml` 方法 |
| `sdk/src/printEngine/types.ts` | `RenderContext` 增加 `escapeHtml: boolean` 字段 |
| `sdk/src/printEngine/renderers/TableRenderer.ts` | 改用统一工具函数；删除模块内 `escapeHtml` 函数 |
| `sdk/src/printEngine/renderers/PageNumberRenderer.ts` | 改用统一工具函数；删除类内 `escapeHtml` 方法 |
| `sdk/src/sdk.ts` | 导出 `configureSDK` 和 `SDKGlobalConfig` 类型 |
| `sdk/CHANGELOG.md` | 记录新功能及 API |

## 2. API 设计

### 2.1 全局配置（归一化入口）

```ts
// sdk/src/config/globalConfig.ts

/**
 * SDK 全局配置接口
 * 后续新增的全局级别参数都加到此接口，不新增函数
 */
export interface SDKGlobalConfig {
  /** 是否对输出内容进行 HTML 转义（防止 XSS），默认 true */
  escapeHtml?: boolean;
}

const globalConfig: SDKGlobalConfig = {};

/**
 * 配置 SDK 全局参数
 * 影响所有后续创建的 PrintSDK 实例
 */
export function configureSDK(config: SDKGlobalConfig): void {
  Object.assign(globalConfig, config);
}

/**
 * 获取全局配置（内部使用）
 */
export function getGlobalConfig(): SDKGlobalConfig {
  return globalConfig;
}
```

### 2.2 实例级配置

```ts
// sdk/src/PrintSDK.ts

export interface PrintSDKOptions {
  /** 自定义管道执行器列表 */
  customPipes?: PipeExecutor[];
  /** 是否对输出内容进行 HTML 转义，覆盖全局配置，默认 true */
  escapeHtml?: boolean;
}
```

### 2.3 优先级解析

```ts
// 在 PrintSDK 构造函数中解析最终值
constructor(options?: PrintSDKOptions) {
  this.customPipes = options?.customPipes;
  this.escapeHtml = options?.escapeHtml ?? getGlobalConfig().escapeHtml ?? true;
}
```

## 3. 数据流

```
configureSDK({ escapeHtml: false })  ← 全局配置（可选）
       │
       ▼
createPrintSDK({ escapeHtml: false })  ← 实例配置（可选，覆盖全局）
       │
       ▼  解析优先级：实例级 > 全局级 > 默认 true
       │
PrintSDK 实例存储 this.escapeHtml (boolean)
       │
       ▼  调用 print/generateHTML 时
createPrintEngine(template, data, customPipes, escapeHtml)
       │
       ▼
PrintEngine 构造函数:
  - 存储 this.escapeHtml
  - 注入 RenderContext.escapeHtml
       │
       ▼
渲染器读取 context.escapeHtml:
  - TableRenderer: context.escapeHtml ? escapeHtml(value) : value
  - PageNumberRenderer: context.escapeHtml ? this.escapeHtml(pageText) : pageText
  - PrintEngine.renderPageNumber: this.escapeHtml ? this.escapeHtml(text) : text
```

## 4. RenderContext 变更

```ts
// sdk/src/printEngine/types.ts

export interface RenderContext {
  // ... 现有字段不变

  /** 是否对输出内容进行 HTML 转义 */
  escapeHtml: boolean;
}
```

## 5. 渲染器改动

### 5.1 统一工具函数

```ts
// sdk/src/utils/htmlEscape.ts

/**
 * HTML 转义工具
 * 对文本中的 HTML 特殊字符进行转义，防止 XSS 注入
 * @param text - 原始文本
 * @param shouldEscape - 是否执行转义，false 时原样返回
 * @returns 转义后的文本或原值
 */
export function escapeHtml(text: string, shouldEscape: boolean): string {
  if (!shouldEscape) return text;
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

> 统一采用正则替换方式（原 TableRenderer 和 printEngine 的实现），不依赖 DOM API。原 PageNumberRenderer 的 DOM 方式（`document.createElement` + `textContent`）废弃。

### 5.2 TableRenderer

```ts
// 改动前
return `<td style="${dataStyleStr}">${escapeHtml(String(value))}</td>`;

// 改动后
return `<td style="${dataStyleStr}">${escapeHtml(String(value), context.escapeHtml)}</td>`;
```

对 `title`、`content` 同理处理。删除模块内原有的 `escapeHtml` 函数定义。

### 5.3 PageNumberRenderer

```ts
// 改动前
return `<div style="${styleStr}">${this.escapeHtml(pageText)}</div>`;

// 改动后
return `<div style="${styleStr}">${escapeHtml(pageText, context.escapeHtml)}</div>`;
```

删除类内原有的 `escapeHtml` 方法。

### 5.4 PrintEngine（页码渲染）

```ts
// 改动前
return `...">${this.escapeHtml(pageText)}</div>`;

// 改动后
return `...">${escapeHtml(pageText, this.escapeHtmlFlag)}</div>`;
```

删除类内原有的 `escapeHtml` 方法。

> 注：PrintEngine 类中已有 `escapeHtml` 方法名，新增配置字段命名为 `escapeHtmlFlag` 避免冲突。删除原方法后不再有冲突，但字段名保持 `escapeHtmlFlag` 语义清晰。

## 6. 归一化设计说明

**为什么 `configureSDK` 是归一化入口？**

当前 SDK 的全局级配置只有 `registerExecutor`（管道注册器）。但 `registerExecutor` 的性质是**注册处理器列表**（Map<string, PipeExecutor>），与**设置配置值**（boolean / string / number）不同，保持独立。

`configureSDK` 专门管理**配置值类型**的全局参数。后续新增此类参数只需：

1. 在 `SDKGlobalConfig` 接口加字段
2. 在使用处读取 `getGlobalConfig().xxx`

不需要新增函数，不增加 API 认知成本。

## 7. 向后兼容

- `createPrintSDK()` 不传参数 → `escapeHtml` 默认 `true`，行为与之前完全一致
- `configureSDK()` 未调用 → 全局配置为空对象，fallback 到默认值 `true`
- 已有模板、数据、管道配置无需任何修改
- `registerExecutor` 不受影响

## 8. 不做的功能（本次范围外）

- ~~列级 / 组件级配置（`TableColumn.allowHtml`）~~
- ~~将 escapeHtml 做成管道~~
- ~~Designer 侧 UI 界面~~
- ~~白名单式 HTML 消毒（sanitize）~~
