# SDK 接入

设计器完成模板设计后，通常会拿到一份模板 JSON。你可以使用 **`@jcyao/print-sdk`** 在业务代码中调用打印能力，实现真正的打印输出。

> 📦 SDK 是独立发布的 npm 包，完整 API 文档请参见 [`@jcyao/print-sdk` README](https://www.npmjs.com/package/@jcyao/print-sdk)。

---

## 适用场景

| 场景 | 说明 |
|------|------|
| 浏览器直接打印 | 在 Web 页面中点击按钮后弹出系统打印对话框 |
| 预览后打印 | 先在新窗口打开预览，用户确认后再打印 |
| 批量打印 | 同一模板 + 多份数据，一次性打印 |
| 多模板打印 | 不同模板 + 各自数据，一次性打印 |
| Electron / Node 端 | 生成 HTML 字符串后自行处理打印或转 PDF |

---

## 安装

```bash
npm install @jcyao/print-sdk
```

---

## 获取模板 JSON

在设计器中完成模板设计后，可以通过以下方式拿到模板 JSON：

1. 点击画布工具栏的 **"保存"** 按钮，模板会保存到模板管理列表。
2. 点击右下角 **"调试"** 按钮（`< >` 图标），打开调试面板。
3. 点击 **"复制 JSON"**，将完整模板结构复制到剪贴板。

> 💡 模板 JSON 就是 `sdk.print({ template, data })` 中 `template` 字段的值。

---

## 快速开始

```typescript
import { createPrintSDK } from '@jcyao/print-sdk';

const sdk = createPrintSDK();

// 从设计器复制的模板 JSON
const template = {
  id: 'template-1',
  name: '订单打印单',
  version: '1.0.0',
  schemaId: 'schema-1',
  page: {
    size: 'A4',
    orientation: 'portrait',
    marginMm: { top: 10, right: 10, bottom: 10, left: 10 },
  },
  layoutMode: 'absolute',
  components: [
    // ... 设计器生成的组件
  ],
};

// 实际业务数据
const data = {
  orderNo: 'SR202401',
  customerName: '张三',
  items: [
    { productName: '商品A', quantity: 2, price: 99 },
  ],
};

// 直接打印
await sdk.print({ template, data });
```

---

## 常用方法

### 直接打印

```typescript
await sdk.print({ template, data });
```

### 预览后打印

```typescript
await sdk.print({ template, data, preview: true });

// 或使用快捷方法
await sdk.printWithPreview(template, data);
```

### 仅生成 HTML

适用于 Electron、Node 端或需要自定义打印流程的场景：

```typescript
const html = await sdk.generateHTML(template, data);
// 自行写入窗口或保存为文件
```

### 批量打印（同模板多数据）

```typescript
const orders = [
  { orderNo: 'ORDER001', customerName: '张三' },
  { orderNo: 'ORDER002', customerName: '李四' },
];

await sdk.printMultiple(template, orders, {
  preview: true,
  onProgress: (progress) => {
    console.log(`进度: ${progress.completed}/${progress.total}`);
  },
});
```

### 多模板批量打印

```typescript
await sdk.printMultiTemplate([
  { template: templateA, dataList: [dataA1, dataA2] },
  { template: templateB, dataList: [dataB1] },
], {
  preview: true,
});
```

> ⚠️ 多模板批量打印时，所有模板需使用相同的纸张尺寸和边距。

---

## 自定义数据管道

如果内置管道不能满足业务需求，可以在创建 SDK 实例时注入自定义管道：

```typescript
const sdk = createPrintSDK({
  customPipes: [
    {
      type: 'phoneMask',
      label: '手机号掩码',
      execute: (value: string) => value.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
    },
  ],
});
```

模板中的使用方式与内置管道完全一致：

```json
{
  "binding": {
    "path": "phone",
    "pipes": [{ "type": "phoneMask" }]
  }
}
```

---

## 自定义聚合器

内置聚合类型（`sum/avg/max/min/count`）不满足需求时，可在创建 SDK 实例时注入自定义聚合器，实现加权求和、向上取整、去重计数等自定义聚合逻辑：

```typescript
import { createPrintSDK } from '@jcyao/print-sdk';

const ceilSum = {
  type: 'ceil-sum',
  label: '向上取整求和',
  aggregate(values: any[]) {
    const nums = values.map(Number).filter(v => !isNaN(v));
    if (nums.length === 0) return undefined;
    return Math.ceil(nums.reduce((s, v) => s + v, 0));
  },
};

const sdk = createPrintSDK({ customAggregators: [ceilSum] });
```

模板中列合计 / 分组小计通过 `summary.type` 引用：

```json
{
  "columns": [{ "dataIndex": "amount", "summary": { "type": "ceil-sum", "precision": 0 } }]
}
```

- `aggregate(values, options)` 接收该字段的**原始值数组**，返回 `number`（继续走 precision/前缀后缀/管道）、`string`（直接输出）或 `undefined`（显示 `-`）
- 优先级：实例级 `customAggregators` > 全局级 `configureSDK({ aggregators })` > 内置

---

## HTML 转义控制

SDK 默认对所有组件取值（文本、表格、页码等）进行 HTML 转义，防止 XSS 注入。如果你需要在打印内容中渲染富文本（如 `<b>`、`<span style>` 等 HTML 标签），可以关闭转义：

```typescript
// 实例级关闭（仅当前实例）
const sdk = createPrintSDK({ escapeHtml: false });
```

配置优先级：

```
实例级 createPrintSDK({ escapeHtml }) > 全局级 configureSDK({ escapeHtml }) > 默认值 true
```

---

## 类型导入

SDK 使用 TypeScript 编写，所有公共类型都可以从包入口导入：

```typescript
import type {
  PrintTemplate,
  PageConfig,
  ComponentNode,
  DataBinding,
  PipeConfig,
  TableProps,
  TableColumn,
} from '@jcyao/print-sdk';
```

---

## 完整参考

- npm 包页面：[https://www.npmjs.com/package/@jcyao/print-sdk](https://www.npmjs.com/package/@jcyao/print-sdk)
- 完整 API、组件配置、表格高级功能等说明请参见 SDK 的 `README.md`。
