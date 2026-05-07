# 多模板打印功能 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 PrintSDK 新增 `printMultiTemplate` 方法，支持一次打印包含多个不同模板及各自数据列表

**Architecture:** 在 `PrintSDK` 类中新增方法，外层遍历模板组、内层遍历数据列表，复用现有 `createPrintEngine` + `generatePrintHTML` + `extractBodyContent` 渲染和拼接逻辑。纯新增代码，不修改任何已有方法

**Tech Stack:** TypeScript, 现有 PrintEngine + HTML 模板生成

**Design Doc:** `docs/plans/2026-05-07-multi-template-print-design.md`

---

### Task 1: 新增类型定义和 printMultiTemplate 方法

**Files:**
- Modify: `sdk/src/PrintSDK.ts`

- [ ] **Step 1: 在 PrintSDK.ts 中添加新类型定义**

在 `PrintSDK.ts` 中，`BatchPrintProgress` 接口下方（第 70 行附近）插入以下类型定义：

```typescript
/**
 * 模板 + 数据组
 */
export interface PrintTemplateGroup {
  template: PrintTemplate;
  dataList: any[];
}

/**
 * 多模板打印选项
 */
export interface MultiTemplatePrintOptions {
  preview?: boolean;
  onProgress?: (progress: MultiTemplatePrintProgress) => void;
}

/**
 * 多模板打印进度
 */
export interface MultiTemplatePrintProgress {
  totalGroups: number;
  completedGroups: number;
  totalDataItems: number;
  completedDataItems: number;
  failed: number;
  currentGroupIndex: number;
  currentDataIndex: number;
}
```

- [ ] **Step 2: 在 PrintSDK 类末尾添加 printMultiTemplate 方法**

在 `printMultiple` 方法之后（第 293 行 `}` 之前）插入以下方法：

```typescript
/**
 * 多模板批量打印
 * 支持多个模板各自绑定数据列表，一次打印确认
 *
 * 注意：所有模板需使用相同纸张尺寸，混合尺寸暂不支持
 * @param groups 模板+数据组列表
 * @param options 打印选项
 */
async printMultiTemplate(
  groups: PrintTemplateGroup[],
  options: MultiTemplatePrintOptions = {}
): Promise<void> {
  const { preview = false, onProgress } = options;

  if (!groups || groups.length === 0) {
    console.warn('[PrintSDK] printMultiTemplate: groups 为空，跳过打印');
    return;
  }

  const totalDataItems = groups.reduce((sum, g) => sum + g.dataList.length, 0);

  const progress: MultiTemplatePrintProgress = {
    totalGroups: groups.length,
    completedGroups: 0,
    totalDataItems,
    completedDataItems: 0,
    failed: 0,
    currentGroupIndex: 0,
    currentDataIndex: -1,
  };

  onProgress?.(progress);

  const allPagesHTML: string[] = [];

  for (let groupIdx = 0; groupIdx < groups.length; groupIdx++) {
    const group = groups[groupIdx];
    progress.currentGroupIndex = groupIdx;
    progress.currentDataIndex = -1;
    onProgress?.(progress);

    for (let dataIdx = 0; dataIdx < group.dataList.length; dataIdx++) {
      const data = group.dataList[dataIdx];
      progress.currentDataIndex = dataIdx;
      onProgress?.(progress);

      try {
        const engine = createPrintEngine(group.template, data);
        const html = await engine.generatePrintHTML();

        const bodyContent = extractBodyContent(html);
        if (bodyContent) {
          allPagesHTML.push(bodyContent);
        }

        progress.completedDataItems++;
        onProgress?.(progress);
      } catch (error) {
        progress.failed++;
        progress.completedDataItems++;
        onProgress?.(progress);
        console.error(
          `[PrintSDK] 处理失败: groupIndex=${groupIdx}, dataIndex=${dataIdx}`,
          error
        );
      }
    }

    progress.completedGroups++;
    onProgress?.(progress);
  }

  progress.currentGroupIndex = -1;
  progress.currentDataIndex = -1;
  onProgress?.(progress);

  const { page } = groups[0].template;

  const { widthMm: pageWidthMm, heightMm: pageHeightMm } = getPageSizeFromConfig(page);

  const styles = generateBatchPrintStyles({
    pageWidthMm,
    pageHeightMm,
    marginTop: page.marginMm?.top ?? 0,
    marginRight: page.marginMm?.right ?? 0,
    marginBottom: page.marginMm?.bottom ?? 0,
    marginLeft: page.marginMm?.left ?? 0,
    isContinuous: page.size === 'CONTINUOUS',
    minHeightMm: page.minHeightMm,
  });

  const fullHTML = generatePrintHTML({
    title: '多模板批量打印',
    styles,
    bodyContent: allPagesHTML.join('\n'),
  });

  if (preview) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Failed to open print window');
    }
    printWindow.document.write(fullHTML);
    printWindow.document.close();

    await waitForImagesLoaded(printWindow.document);
    printWindow.print();
  } else {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error('Failed to access iframe document');
    }

    iframeDoc.write(fullHTML);
    iframeDoc.close();

    await waitForImagesLoaded(iframeDoc);

    const cleanup = () => {
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
    };

    if (iframe.contentWindow) {
      iframe.contentWindow.addEventListener('afterprint', cleanup, { once: true });
    }

    iframe.contentWindow?.print();

    setTimeout(() => {
      if (iframe.parentNode) {
        console.warn('[PrintSDK] afterprint 事件未触发，执行兜底清理');
        cleanup();
      }
    }, 5000);
  }
}
```

- [ ] **Step 3: 运行 TypeScript 编译验证**

```bash
npx tsc --noEmit
```

预期：编译通过，无新增错误

- [ ] **Step 4: 提交**

```bash
git add sdk/src/PrintSDK.ts
git commit -m "feat(sdk): 新增 printMultiTemplate 类型定义"
```

---

### Task 2: 导出新类型

**Files:**
- Modify: `sdk/src/sdk.ts`

- [ ] **Step 1: 在 sdk.ts 导出列表中添加新类型**

在 `export type { PrintOptions, BatchPrintOptions, BatchPrintProgress }` 之后添加：

```typescript
export type {
  PrintTemplateGroup,
  MultiTemplatePrintOptions,
  MultiTemplatePrintProgress,
} from './PrintSDK';
```

修改后的该段代码为：

```typescript
export type {
  PrintOptions,
  BatchPrintOptions,
  BatchPrintProgress,
  PrintTemplateGroup,
  MultiTemplatePrintOptions,
  MultiTemplatePrintProgress,
} from './PrintSDK';
```

- [ ] **Step 2: 运行 TypeScript 编译验证**

```bash
npx tsc --noEmit
```

预期：编译通过，无新增错误

- [ ] **Step 3: 提交**

```bash
git add sdk/src/sdk.ts
git commit -m "feat(sdk): 导出 printMultiTemplate 相关类型"
```

---

### Task 3: 更新 SDK README 文档

**Files:**
- Modify: `sdk/README.md`

- [ ] **Step 1: 在 API 文档区域添加 printMultiTemplate 说明**

在 `sdk/README.md` 中 `printMultiple` 文档之后（第 139 行之后），添加以下内容：

```markdown
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
      `组: ${progress.completedGroups}/${progress.totalGroups}, ` +
      `数据: ${progress.completedDataItems}/${progress.totalDataItems}`
    );
  }
});
```

**参数：**

```typescript
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
```

- [ ] **Step 2: 提交**

```bash
git add sdk/README.md
git commit -m "docs(sdk): 添加 printMultiTemplate API 文档"
```

---

### Task 4: 更新 CHANGELOG

**Files:**
- Modify: `sdk/CHANGELOG.md`

- [ ] **Step 1: 在版本 1.1.2 段落（或新建版本段落）中添加入口**

在 `## [1.1.2] - 2026-05-07` 段落中添加：

```markdown
### ✨ 新增功能

- **多模板批量打印**：`printMultiTemplate` 方法，支持一次打印多个不同模板及各自对应的数据列表
```

- [ ] **Step 2: 提交**

```bash
git add sdk/CHANGELOG.md
git commit -m "docs(sdk): 更新 CHANGELOG 记录 printMultiTemplate"
```

---

### Task 5: 最终验证

- [ ] **Step 1: 完整 TypeScript 编译检查**

```bash
npx tsc --noEmit
```

预期：编译通过，无任何错误

- [ ] **Step 2: 检查改动摘要**

```bash
git diff master...HEAD --stat
```

预期改动文件：
- `sdk/src/PrintSDK.ts` — 新增类型 + 方法
- `sdk/src/sdk.ts` — 导出新类型
- `sdk/README.md` — API 文档
- `sdk/CHANGELOG.md` — 版本记录
