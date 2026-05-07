# 多模板打印功能设计文档

> 日期：2026-05-07
> 状态：设计中

---

## 1. 背景与目标

SDK 当前支持两种打印模式：
- **单模板 + 单数据**：`print({ template, data })`
- **单模板 + 多数据**：`printMultiple(template, dataList)` — 同模板批量打印

需要新增 **多模板 + 多数据** 的能力，支持一次打印操作中混合使用多个不同模板，每个模板绑定各自的数据列表。典型场景：「一客一模板」——为每位客户使用专属模板打印。

---

## 2. 需求数据结构

```
[
  { template: 模板A, dataList: [数据A1, 数据A2] },
  { template: 模板B, dataList: [数据B1]       },
]
```

### 2.1 约束条件

- **所有模板必须使用相同纸张尺寸**（同为 A4 / 同为 A5 等）。混合纸张尺寸暂不支持，需在文档中注明。
- 每个「模板 + 数据」对独立分页、独立页码编号。例如模板 A+数据 A1 生成 3 页（1/3, 2/3, 3/3），模板 B+数据 B1 生成 2 页（1/2, 2/2）。

---

## 3. 方案选择

| 方案 | 描述 | 结论 |
|------|------|------|
| A：新增 `printMultiTemplate` | 独立方法，接收模板组数组 | **选用** |
| B：纯手动组合 | 用户自行多次调用 `printMultiple` | 不选（多次打印确认，不符合诉求） |

---

## 4. API 设计

### 4.1 新增类型

```typescript
/** 模板 + 数据组 */
interface PrintTemplateGroup {
  template: PrintTemplate;
  dataList: any[];
}

/** 多模板打印选项 */
interface MultiTemplatePrintOptions {
  preview?: boolean;
  onProgress?: (progress: MultiTemplatePrintProgress) => void;
}

/** 多模板打印进度 */
interface MultiTemplatePrintProgress {
  totalGroups: number;          // 模板组总数
  completedGroups: number;      // 已完成组数
  totalDataItems: number;       // 总数据条目
  completedDataItems: number;   // 已完成数据条目
  failed: number;               // 失败条目数
  currentGroupIndex: number;    // 当前模板组索引 (-1 表示未开始)
  currentDataIndex: number;     // 当前数据索引 (-1 表示未开始)
}
```

### 4.2 新增方法

```typescript
class PrintSDK {
  /**
   * 多模板批量打印
   * @param groups 模板+数据组列表
   * @param options 打印选项
   */
  async printMultiTemplate(
    groups: PrintTemplateGroup[],
    options?: MultiTemplatePrintOptions
  ): Promise<void>;
}
```

### 4.3 调用示例

```typescript
const sdk = createPrintSDK();

await sdk.printMultiTemplate([
  { template: templateA, dataList: [dataA1, dataA2] },
  { template: templateB, dataList: [dataB1] },
], {
  preview: true,
  onProgress: (p) => console.log(p),
});
```

---

## 5. 实现逻辑

### 5.1 核心流程

```
printMultiTemplate(groups)
  │
  ├─ 初始化进度
  │
  ├─ for each group in groups:
  │   └─ for each data in group.dataList:
  │       ├─ createPrintEngine(group.template, data)
  │       ├─ engine.generatePrintHTML()
  │       ├─ extractBodyContent(html)
  │       └─ push to allPagesHTML[]
  │
  ├─ generateBatchPrintStyles(groups[0].template.page)  // 取第一组配置
  │
  ├─ generatePrintHTML({ styles, bodyContent })
  │
  └─ 执行打印（preview 模式打开新窗口 / 直接模式走 iframe）
```

### 5.2 与 printMultiple 的关系

`printMultiTemplate` 本质是 `printMultiple` 的泛化版本：
- `printMultiple`：同模板 × 多数据 → 内层循环
- `printMultiTemplate`：多模板 × 各自数据 → 外层循环 + 内层循环

核心的 `createPrintEngine`、`generatePrintHTML`、`extractBodyContent` 完全复用。

### 5.3 样式策略

使用 **第一个模板组** 的 `page` 配置调用 `generateBatchPrintStyles()`。已确认所有模板纸张尺寸一致，第一组配置可代表全局样式。

### 5.4 页码编号

每个 `createPrintEngine(template, data)` 独立分页，各自的 `renderSinglePage(pageNo, totalPages)` 天然按需编号。拼接不同 engine 的 body 内容时页码互不干扰——无需额外处理。

---

## 6. 错误处理

策略与现有 `printMultiple` 保持一致：**单条失败不影响整体**。

- 对每个 `data` 的处理包裹 try/catch
- 失败时递增 `progress.failed`，记录 `console.error`，继续下一条
- 极端情况（全部失败）生成空文档打印

不引入 `onError` 回调，保持 API 简洁。

---

## 7. 改动范围

| 文件 | 改动类型 | 说明 |
|------|----------|------|
| `sdk/src/PrintSDK.ts` | 新增 ~60 行 | 类型定义 + printMultiTemplate 方法 |
| `sdk/src/sdk.ts` | 新增 ~10 行 | 导出新类型和接口 |
| `sdk/README.md` | 更新 | 新 API 文档 + 限制说明 |
| `sdk/CHANGELOG.md` | 更新 | 版本记录 |

### 不改动的文件

- `sdk/src/printEngine.ts` — 引擎、分页、渲染完全复用
- `sdk/src/printEngine/htmlTemplate.ts` — 复用 `generateBatchPrintStyles`
- `sdk/src/printEngine/renderers/` — 渲染器无变化
- `sdk/src/types.ts` — 核心类型不变
- `designer/` — 本次不改设计器

---

## 8. 约束与风险

| 约束 | 应对 |
|------|------|
| 所有模板需同纸张尺寸 | 文档注明限制，v2 可支持 CSS named pages |
| 混合纸张尺寸暂不支持 | 发行说明中注明，如有需求后续扩展 |
| 大数量打印性能 | 串行生成 HTML，与 printMultiple 行为一致；如遇瓶颈可异步并行优化 |

---

## 9. 后续扩展方向（不在本次范围）

- 支持混合纸张尺寸（CSS named pages）
- 并行渲染多个 engine 提升大批量性能
- 设计器支持多模板预览和编辑
