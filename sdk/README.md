# @jcyao/print-sdk

[![npm version](https://img.shields.io/npm/v/@jcyao/print-sdk.svg)](https://www.npmjs.com/package/@jcyao/print-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

通用打印 SDK - 客户端打印解决方案

**当前版本**: v1.5.0

## 🎨 在线演示

**可视化模板设计器**: https://printer-pi-five.vercel.app

拖拽式设计打印模板，生成模板 JSON 后直接配合 SDK 使用。内置示例数据，无需搭建环境即可体验。

## 🆕 v1.5.0 新增功能

- ✨ **页头/页脚支持**：`PageConfig` 新增 `headerEnabled`/`headerHeight`/`footerEnabled`/`footerHeight` 配置，每页自动注入页头/页脚组件并转换坐标
- ✨ **`ComponentNode._section`**：新增运行时属性，标识组件所属区域（header/content/footer）
- ✨ **`PrintTemplate.headerComponents/footerComponents`**：模板支持三区域组件列表
- 🐛 **分页精度提升**：`shouldBreakPage` 参数统一为 `contentTop` 绝对坐标系，header/footer 高度变化后分页计算正确
- 🐛 **overflow 溢出控制**：页头/页脚组件统一包裹 `overflow: hidden`
- ✨ **SDK 类型扩展**：`ComponentNode` 新增 `_section?: PageSection`

## 🆕 v1.4.0 新增功能

- ✨ **表格列宽自定义**：新增 `TableColumn.width` 字段支持为每列指定固定宽度，`computeColWidths` 智能列宽计算（均分/固定+均分混合/超出缩放），设计器表格预览支持拖拽调整列宽
- ✨ **行号列宽度自定义**：新增 `rowNumberWidth` 属性，支持自定义行号列宽度
- ✨ **表格边框自定义**：新增 `borderStyle`（solid/dashed）、`borderColor`、`borderWidth` 属性
- 🐛 **修复列宽精度**：修复百分比重复计算、舍入误差、溢出边缘情况等多项列宽问题

## 🆕 v1.3.0 新增功能

- ✨ **表格合计额外行**：支持在合计行下方添加自定义额外行（如金额大写、备注说明），支持绑定列合计值并通过管道格式化
- ✨ **表格行号列**：支持显示行号列，可自定义标题
- 🐛 **分页精度提升**：修复宽度计算公式不一致、`shouldBreakPage` 坐标系统一，优化分页计算精度
- 🐛 **稳定性增强**：修复 total 模式空片段、防御检查精度混合、SSR 回退缺少额外行等多项问题

## 🆕 v1.2.0 新增功能

- ✨ **ChineseNumberPipe 增强**：支持小数转换（`3.14` → `叁点壹肆`）、负数、自定义连接符
- ✨ **MoneyPipe 中文大写金额**：新增 `chineseUppercase` 格式，支持会计规范金额大写（`壹佰贰拾叁元肆角伍分`）
- ✨ **表格合计管道化**：合计字段通过 `summary.pipe` 接入管道系统

## 🆕 v1.1.3 新增功能

- ✨ **多模板批量打印**：新增 `printMultiTemplate` 方法，支持一次打印操作组合多个不同模板及各自对应的数据列表（一客一模板场景）
- ✨ **设计器多模板模式**：打印预览弹窗新增「多模板模式」，可自由组合已保存模板和当前画布模板进行混合打印

## 🆕 v1.1.2 问题修复

- 🐛 **打印内容偏移修复**：`@media print` 中 `.print-page` 的 `margin` 完全覆盖，解决打印内容偏左问题
- 🐛 **批量打印边距修复**：`generateBatchPrintStyles` 增加 `padding` 设置，批量打印边距功能正常生效

## 🆕 v1.1.1 新增功能

- ✨ **表格嵌套对象数据支持**：表格打印支持嵌套对象格式的数据源
- 🔧 **服务架构简化**：移除独立 server 服务，改用 Vite mock 集成

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

- 🎨 **可视化模板设计** - 拖拽式设计打印模板，支持页头/页脚区域
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

### `sdk.printMultiTemplate(groups, options)`

多模板批量打印（多模板 + 各自对应的数据列表）。

```typescript
await sdk.printMultiTemplate([
  { template: templateA, dataList: [dataA1, dataA2] },
  { template: templateB, dataList: [dataB1] },
], {
  preview: true,
  onProgress: (progress) => {
    console.log(
      `组: ${progress.completedGroups}/${progress.totalGroups}, 数据: ${progress.completedDataItems}/${progress.totalDataItems}`
    );
  }
});
```

**参数：**

```typescript
interface PrintTemplateGroup {
  template: PrintTemplate;
  dataList: any[];
}

interface MultiTemplatePrintOptions {
  preview?: boolean;
  onProgress?: (progress: MultiTemplatePrintProgress) => void;
}

interface MultiTemplatePrintProgress {
  totalGroups: number;          // 模板组总数
  completedGroups: number;      // 已完成组数
  totalDataItems: number;       // 总数据条目
  completedDataItems: number;   // 已完成数据条目
  failed: number;               // 失败条目数
  currentGroupIndex: number;    // 当前处理组索引
  currentDataIndex: number;     // 当前处理数据索引
}
```

> ⚠️ **已知限制**：所有模板必须使用相同的纸张尺寸和边距设置。混合纸张尺寸暂不支持。

## 🎨 支持的组件

- **文本组件** - 显示文本内容，支持标签和数据绑定
- **表格组件** - 数组数据表格化展示，支持跨页、表头重复、合计
- **图片组件** - 本地/远程图片、base64 编码
- **二维码组件** - 自动生成二维码
- **条形码组件** - 多种条形码格式
- **线条组件** - 实线/虚线装饰
- **矩形组件** - 边框装饰、背景色块

## 🔄 数据管道

支持 8 种内置管道：

- **date** - 日期格式化 (`YYYY-MM-DD HH:mm:ss`)
- **currency** - 货币格式化 (`¥9999.00`)
- **money** - 金额转换（分↔元、千分位、中文大写金额）
- **chineseNumber** - 中文大写数字（`壹仟`、`叁点壹肆`，支持小数）
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
      },
      {
        type: 'chineseNumber',
        options: {
          mode: 'both',       // 同时显示数字和大写
          separator: ' 大写：',
          unit: '元'
        }
      }
    ]
  }
}
```

### MoneyPipe 中文大写金额

```typescript
{
  type: 'money',
  options: {
    mode: 'fenToYuan',
    format: 'chineseUppercase',     // 中文大写金额
    uppercaseMode: 'both',          // 同时显示数字和大写
    separator: '  大写：'           // 自定义连接符
  }
}
// 输出：123.45  大写：壹佰贰拾叁元肆角伍分
```

### ChineseNumberPipe 通用大写

```typescript
{
  type: 'chineseNumber',
  options: {
    mode: 'both',
    separator: ' 大写：',
    unit: ''
  }
}
// 输入 3.14 → 输出 3.14 大写：叁点壹肆
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
          prefix: '¥',
          // 通过管道格式化合计值
          pipe: {
            type: 'money',
            options: {
              mode: 'none',
              format: 'chineseUppercase',
            }
          }
        }
      }
    ],
    showSummary: true,
    summaryMode: 'total',   // total: 仅最后一页, page: 每页合计
    summaryLabel: '合计'
  }
}
```

> ⭐ **v1.4.0 新增**：`rowNumberWidth`、`borderStyle`、`borderColor`、`borderWidth`

### 表格合计额外行

在合计行下方添加自定义额外行，常用于显示金额大写、备注说明等：

```typescript
{
  type: 'table',
  props: {
    columns: [
      {
        title: '金额',
        dataIndex: 'amount',
        summary: {
          type: 'sum',
          precision: 2
        }
      }
    ],
    showSummary: true,
    summaryMode: 'total',
    summaryLabel: '合计',
    // 额外行配置
    summaryExtraRows: [
      {
        label: '金额大写：',
        sourceColumn: 'amount',     // 绑定到 amount 列的合计值
        pipes: [                    // 通过管道格式化
          {
            type: 'money',
            options: {
              mode: 'none',
              format: 'chineseUppercase'  // 输出：壹佰贰拾叁元肆角伍分
            }
          }
        ]
      }
    ]
  }
}
```

### 表格行号列 ⭐ **v1.4.0 新增：行号列宽度自定义**

```typescript
{
  type: 'table',
  props: {
    showRowNumber: true,      // 显示行号列
    rowNumberLabel: '序号',   // 自定义行号列标题（默认"序号"）
    rowNumberWidth: 15,       // v1.4.0：行号列宽度（mm）
    columns: [...]
  }
}
```

### 表格列宽自定义 ⭐ **v1.4.0 新增**

```typescript
{
  type: 'table',
  props: {
    columns: [
      {
        title: '商品名称',
        dataIndex: 'name',
        width: 60    // 固定宽度（mm），不设置则均分剩余空间
      },
      {
        title: '数量',
        dataIndex: 'qty',
        width: 20
      },
      {
        title: '金额',
        dataIndex: 'amount'
        // 未设置 width → 均分剩余空间
      }
    ]
  }
}
```

#### 列宽计算规则

1. **全部未设置** → 均分（向后兼容）
2. **部分设置** → 固定列用指定宽度，未设置列均分剩余空间
3. **固定列总和超表格宽度** → 全部固定则按比例缩放，部分固定则固定列缩放 + 未固定列最小 1% 份额

### 表格边框自定义 ⭐ **v1.4.0 新增**

```typescript
{
  type: 'table',
  props: {
    bordered: true,
    borderStyle: 'dashed',     // solid | dashed
    borderColor: '#1890ff',    // 自定义颜色
    borderWidth: 2,            // 线宽 1-5px
    columns: [...]
  }
}
```

**合计管道配置示例：**

| 效果 | pipe 配置 |
|------|-----------|
| 中文数字大写 + 原值 | `{ type: 'chineseNumber', options: { mode: 'both', separator: ' 大写：', unit: '元' } }` |
| 中文金额大写 | `{ type: 'money', options: { mode: 'none', format: 'chineseUppercase' } }` |
| 金额大写 + 原值 | `{ type: 'money', options: { mode: 'none', format: 'chineseUppercase', uppercaseMode: 'both', separator: '  大写：' } }` |

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
- [在线演示](https://printer-pi-five.vercel.app) - 可视化模板设计器，拖拽生成模板 JSON
- [问题反馈](https://github.com/joker-yjc/printer/issues)
- [更新日志](https://github.com/joker-yjc/printer/blob/master/CHANGELOG.md)

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request
