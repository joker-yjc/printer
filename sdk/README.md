# @jcyao/print-sdk

[![npm version](https://img.shields.io/npm/v/@jcyao/print-sdk.svg)](https://www.npmjs.com/package/@jcyao/print-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

通用打印 SDK - 客户端打印解决方案

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
import { init, print } from '@jcyao/print-sdk';

// 初始化 SDK（全局执行一次）
init();

// 打印
print({
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

### `init()`

初始化打印 SDK，全局执行一次。

```typescript
init();
```

### `print(options: PrintOptions)`

执行打印操作。

**参数：**

```typescript
interface PrintOptions {
  template: Template;  // 打印模板
  data: any;           // 数据对象
}
```

### `preview(options: PrintOptions): string`

生成预览 HTML。

```typescript
const html = preview({
  template: myTemplate,
  data: myData
});
```

## 🎨 支持的组件

- **文本组件** - 显示文本内容，支持标签和数据绑定
- **表格组件** - 数组数据表格化展示，支持跨页、表头重复、合计
- **图片组件** - 本地/远程图片、base64 编码
- **二维码组件** - 自动生成二维码
- **条形码组件** - 多种条形码格式
- **线条组件** - 实线/虚线装饰
- **矩形组件** - 边框装饰
- **页码组件** - 自动分页页码

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

## 🔧 类型定义

完整的 TypeScript 类型定义：

```typescript
import type {
  Template,
  ComponentNode,
  TableColumn,
  PipeConfig
} from '@jcyao/print-sdk';
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
