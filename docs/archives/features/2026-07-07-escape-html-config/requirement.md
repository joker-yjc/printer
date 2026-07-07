# 需求文档：HTML 转义控制与全局配置归一化

## 1. 需求背景

SDK 在表格渲染器、页码渲染器、打印引擎中内置了 `escapeHtml` 函数，对所有输出内容进行 HTML 转义以防止 XSS 注入。但部分用户希望在打印内容中嵌入富文本（如加粗、颜色等 HTML 标签）并渲染显示，当前 `escapeHtml` 会将这些标签转义为字面文本。

用户希望增加配置来控制是否进行 HTML 转义。同时，为了避免后续每新增一个全局参数就增加一个新函数（增加认知成本），希望提供一个**归一化的全局配置入口**，后续新增的全局级别参数都通过同一个方法注册。

## 2. 核心需求

1. **提供 HTML 转义开关**，允许用户关闭转义以支持富文本渲染
2. **两种配置渠道**：
   - 实例级：`createPrintSDK({ escapeHtml: false })`，只影响该实例
   - 全局级：`configureSDK({ escapeHtml: false })`，影响所有实例
3. **归一化全局配置入口**：新增 `SDKGlobalConfig` 接口 + `configureSDK()` 方法，后续新增的全局参数都加到此接口，不新增函数
4. **安全优先**：默认值为 `true`（转义），需显式关闭
5. **向后兼容**：不传任何配置时行为不变

## 3. 优先级规则

```
实例级 createPrintSDK({ escapeHtml })  >  全局级 configureSDK({ escapeHtml })  >  默认值 true
```

- 实例级显式传值 → 使用实例级值
- 实例级未传 → 查全局级配置
- 全局级未配置 → 使用默认值 `true`

## 4. 使用场景

```ts
import { createPrintSDK, configureSDK } from '@jcyao/print-sdk';

// 场景一：实例级关闭转义（仅影响该实例）
const sdk = createPrintSDK({ escapeHtml: false });

// 场景二：全局级关闭转义（影响所有后续创建的实例）
configureSDK({ escapeHtml: false });
const sdk = createPrintSDK(); // 转义已关闭

// 场景三：全局关闭 + 实例开启（实例级覆盖全局级）
configureSDK({ escapeHtml: false });
const sdk = createPrintSDK({ escapeHtml: true }); // 该实例转义开启

// 场景四：默认行为（不传任何配置）
const sdk = createPrintSDK(); // 转义开启（默认 true）
```

## 5. 作用范围

| 渲染器 | 转义内容 | 受控 |
|--------|---------|------|
| `TableRenderer` | 列标题 `title`、单元格数据 `value`、合计行 `content` | 是 |
| `PageNumberRenderer` | 页码文本 `pageText`（含 prefix/suffix） | 是 |
| `printEngine.ts` | 页码文本 `pageText` | 是 |

关闭转义后，所有渲染器的输出内容均不进行 HTML 转义。

## 6. 非功能性需求

- `configureSDK` 方法可扩展：后续新增全局参数只需在 `SDKGlobalConfig` 接口加字段
- 现有 `registerExecutor`（管道注册器）性质不同（注册处理器列表 vs 设置配置值），保持独立不纳入
- 规则需在 CHANGELOG 中记录

## 7. 不做的功能（本次范围外）

- ~~列级 / 组件级配置（`TableColumn.allowHtml`）~~ — 只做全局开关
- ~~将 escapeHtml 做成管道~~ — 安全机制不应混入可选管道体系
- ~~Designer 侧 UI 界面~~
- ~~白名单式 HTML 消毒（sanitize）~~ — 仅提供开关，不做标签过滤
