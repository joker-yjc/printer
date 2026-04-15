# @jcyao/print-sdk

[![npm version](https://img.shields.io/npm/v/@jcyao/print-sdk.svg)](https://www.npmjs.com/package/@jcyao/print-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

通用打印 SDK - 客户端打印解决方案

**当前版本**: v1.1.0

## 🆕 v1.1.0 重大改进

- ⭐ **表格分页精度大幅提升**：引入「渲染后测量」方案，彻底解决长文本换行导致的分页截断问题
- ⭐ **组件定位优化**：支持负 gap（组件重叠），表格跨页后后续组件精确定位
- ⭐ **表格渲染改进**：列宽均分、单元格垂直居中、使用 min-height 替代固定高度
- 🔧 **错误处理增强**：iframe 使用 afterprint 事件、DOMParser 替代正则、Decimal.js 错误友好提示

## 📋 历史版本

### v1.0.1
- 页码功能：支持6种位置、3种格式、自定义样式
- 批量打印预览：支持多份文档一次性预览和打印
- PageNumberRenderer：新增页码渲染器插件

## ✨ 特性

- 🎨 **可视化模板设计** - 拖拽式设计打印模板
- 📄 **多组件支持** - 文本、表格、图片、二维码、条形码等
- 🔄 **数据绑定** - Schema 驱动的数据绑定系统
- 📊 **表格高级功能** - 跨页分页、表头重复、表格合计
- 🔌 **插件化架构** - 易于扩展的渲染器和管道系统
- 💯 **TypeScript** - 完整的类型定义
- 🎯 **高精度计算** - 使用 decimal.js 保证数值精度

## 📦 安装

```bash
npm install @jcyao/print-sdk
```

## 🚀 快速开始

```typescript
import { createPrintSDK } from '@jcyao/print-sdk';

// 创建 SDK 实例（无需配置）
const sdk = createPrintSDK();

// 打印
sdk.print({
  template: {
    pageConfig: {
      size: 'A4',
      orientation: 'portrait',
      marginMm: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
      }
    },
    components: [
      {
        id: 'text-1',
        type: 'text',
        layout: {
          mode: 'absolute',
          xMm: 20,
          yMm: 20,
          widthMm: 170,
          heightMm: 10
        },
        binding: {
          path: 'orderNo'
        },
        props: {
          label: '订单号：'
        }
      }
    ]
  },
  data: {
    orderNo: 'SR202401',
    // ... 更多数据
  }
});
```

## 📖 API 文档

### `print(options: PrintOptions)`

执行打印操作。

**参数：**

```typescript
interface PrintOptions {
  template: Template;  // 打印模板
  data: any;           // 数据对象
}
```

### `sdk.generateHTML(template, data)`

生成预览 HTML（不执行打印）。

```typescript
const html = await sdk.generateHTML(myTemplate, myData);
console.log(html);  // 完整的 HTML 字符串
```

### `sdk.printMultiple(template, dataList, options)`

批量打印（同模板多数据）。

```typescript
const dataList = [
  { orderNo: 'ORDER001', ... },
  { orderNo: 'ORDER002', ... },
  { orderNo: 'ORDER003', ... },
];

await sdk.printMultiple(myTemplate, dataList, {
  preview: true,  // 预览所有
  onProgress: (progress) => {
    console.log(`进度: ${progress.completed}/${progress.total}`);
  }
});
```

## 🎨 支持的组件

- **文本组件** - 显示文本内容，支持标签和数据绑定
- **表格组件** - 数组数据表格化展示，支持跨页、表头重复、合计
- **图片组件** - 本地/远程图片、base64 编码
- **二维码组件** - 自动生成二维码
- **条形码组件** - 多种条形码格式
- **线条组件** - 实线/虚线装饰
- **矩形组件** - 边框装饰、背景色块

## 🔄 数据管道

支持 6 种内置管道：

- **date** - 日期格式化 (`YYYY-MM-DD HH:mm:ss`)
- **currency** - 货币格式化 (`¥9999.00`)
- **money** - 金额转换（分↔元、千分位）
- **uppercase/lowercase** - 大小写转换
- **slice** - 字符串截取
- **default** - 默认值处理

**使用示例：**

```typescript
{
  binding: {
    path: 'amount',
    pipes: [
      {
        type: 'money',
        options: {
          mode: 'fenToYuan',  // 分转元
          precision: 2,
          symbol: '¥',
          separator: true     // 千分位分隔
        }
      }
    ]
  }
}
```

## 📊 表格高级功能

### 跨页分页

```typescript
{
  type: 'table',
  props: {
    columns: [...],
    repeatHeader: true  // 跨页重复表头
  }
}
```

### 表格合计

```typescript
{
  type: 'table',
  props: {
    columns: [
      {
        title: '金额',
        dataIndex: 'amount',
        summary: {
          type: 'sum',      // sum, avg, max, min, count
          precision: 2,
          prefix: '¥'
        }
      }
    ],
    showSummary: true,
    summaryMode: 'total',   // total: 仅最后一页, page: 每页合计
    summaryLabel: '合计'
  }
}
```

## 🔢 页码功能配置 ⭐ **v1.0.1 新增**

页码功能通过页面配置实现，而非作为组件添加：

### 基础配置

```typescript
{
  pageConfig: {
    size: 'A4',
    orientation: 'portrait',
    marginMm: { top: 10, right: 10, bottom: 10, left: 10 },
    
    // 页码配置
    pageNumber: {
      enabled: true,
      position: 'bottom-center',  // 6种位置
      format: 'slash',            // 3种格式
      offsetX: 0,                 // 横向偏移 (mm)
      offsetY: 0,                 // 纵向偏移 (mm)
      prefix: '',                 // 前缀
      suffix: '',                 // 后缀
      style: {
        fontSize: 12,
        color: '#666',
        fontWeight: 'normal'
      }
    }
  },
  components: [...]
}
```

### 位置选项 (position)

- `top-left` - 左上角
- `top-center` - 上中
- `top-right` - 右上角
- `bottom-left` - 左下角
- `bottom-center` - 下中 (默认)
- `bottom-right` - 右下角

### 格式选项 (format)

1. **`simple`** - 简单格式
   ```
   显示：1  2  3
   ```

2. **`slash`** - 斜线格式 (默认)
   ```
   显示：1/3  2/3  3/3
   ```

3. **`text`** - 文字格式
   ```
   显示：第1页 共3页  第2页 共3页
   ```

### 完整示例

```typescript
const template = {
  pageConfig: {
    size: 'A4',
    orientation: 'portrait',
    marginMm: { top: 10, right: 10, bottom: 10, left: 10 },
    pageNumber: {
      enabled: true,
      position: 'bottom-right',
      format: 'text',
      offsetX: -5,              // 向左偏移 5mm
      offsetY: -3,              // 向上偏移 3mm
      prefix: '页码：',
      suffix: '',
      style: {
        fontSize: 10,
        color: '#999',
        fontWeight: 'bold'
      }
    }
  },
  components: [...]
};

await sdk.print({ template, data });
// 打印输出：右下角显示 "页码：第1页 共3页"
```

## 🔧 类型定义

完整的 TypeScript 类型定义：

```typescript
import type {
  PrintTemplate,
  ComponentNode,
  TableColumn,
  PipeConfig
} from '@jcyao/print-sdk';
```

## 💻 使用示例

### 示例 1：基本打印

```typescript
import { createPrintSDK } from '@jcyao/print-sdk';

const sdk = createPrintSDK();

// 准备模板和数据
const template = {
  pageConfig: {
    size: 'A4',
    orientation: 'portrait',
    marginMm: { top: 10, right: 10, bottom: 10, left: 10 }
  },
  components: [
    {
      id: 'text-1',
      type: 'text',
      layout: { xMm: 20, yMm: 20, widthMm: 170, heightMm: 10 },
      binding: { path: 'orderNo' },
      props: { label: '订单号：' }
    }
  ]
};

const data = { orderNo: 'SR202401', customerName: '张三' };

// 直接打印
await sdk.printDirect(template, data);
```

### 示例 2：预览后打印

```typescript
import { createPrintSDK } from '@jcyao/print-sdk';

const sdk = createPrintSDK();

// 预览后打印
await sdk.printWithPreview(template, data);
```

### 示例 3：批量打印

```typescript
import { createPrintSDK } from '@jcyao/print-sdk';

const sdk = createPrintSDK();

const orders = [
  { orderNo: 'ORDER001', amount: 1000 },
  { orderNo: 'ORDER002', amount: 2000 },
  { orderNo: 'ORDER003', amount: 3000 },
];

await sdk.printMultiple(template, orders, {
  preview: true,
  onProgress: (progress) => {
    console.log(`打印进度: ${progress.completed}/${progress.total}`);
  }
});
```

## 📝 License

MIT © joke_yao

## 🔗 相关链接

- [GitHub 仓库](https://github.com/joker-yjc/printer)
- [问题反馈](https://github.com/joker-yjc/printer/issues)
- [更新日志](https://github.com/joker-yjc/printer/blob/main/CHANGELOG.md)

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request
