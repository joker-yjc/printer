# 设计器多模板打印支持 — 设计文档

> 日期：2026-05-07
> 状态：设计中

---

## 1. 背景

SDK 已新增 `printMultiTemplate` 方法（支持多模板+各自数据一次打印）。设计器当前仅支持单模板的预览和打印，需扩展 PrintPreview 弹窗以支持多模板组合打印。

## 2. 方案：路径 A — PrintPreview 弹窗扩展

不改动画布编辑逻辑，在 PrintPreview Modal 中新增模式切换。

### 2.1 UI 布局

```
┌─ 打印预览 Modal ────────────────────────────────────┐
│                                                      │
│  模式: [ 单模板 ] [ 多模板 ]          ← 新增         │
│                                                      │
│  ┌─ 模板组列表（多模板模式显示）────────────────┐    │
│  │  #1 模板: [当前画布模板 ▼] 数据: [dataA ▼] [×] │   │
│  │  #2 模板: [模板B ▼]        数据: [dataB ▼] [×] │   │
│  │  [+ 添加模板组]                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                      │
│  [生成预览]  [打印]    📋 2组模板，3份文档            │
│                                                      │
│  ┌─ iframe 预览区 ────────────────────────────┐      │
│  │                                              │      │
│  └──────────────────────────────────────────────┘      │
│                                                      │
│  ◀ 上一页        第 1 页 / 共 N 页        下一页 ▶   │
└──────────────────────────────────────────────────────┘
```

### 2.2 单模板模式

行为与现有完全一致：选择一个 Mock 数据 → 生成预览 → 打印。

### 2.3 多模板模式

- 显示模板组列表，每组 = 模板选择 + 数据选择
- 第一组默认填入当前画布编辑的模板
- 可添加/删除行，最少 1 组
- 模板来源：
  - "当前画布模板" — 调用 `generateTemplate()` 获取
  - 已保存模板 — 调用 `templateApi.get(id)` 加载
- 数据选择复用现有 Mock 数据下拉

## 3. 数据流

### 3.1 预览生成

```
for each group in 模板组列表:
  if group.template == "当前画布模板":
    template = generateTemplate()
  else:
    template = await templateApi.get(id)
  
  for each data in group.dataList:
    engine = createPrintEngine(template, data)
    html = await engine.generatePrintHTML()
    body = extractBodyContent(html)
    allPages.push(body)

合并 allPages → 写入 iframe 预览
```

### 3.2 打印

```
// 改为使用 PrintSDK（当前设计器未使用）
import { createPrintSDK } from '@jcyao/print-sdk'

const sdk = createPrintSDK()
await sdk.printMultiTemplate(groups, { preview: true })
```

## 4. 改动范围

| 文件 | 改动类型 | 说明 |
|------|----------|------|
| `designer/src/components/PrintPreview/index.tsx` | 修改 ~150 行 | 新增模式切换、模板组列表、多模板预览/打印逻辑 |
| `designer/src/components/PrintPreview/index.module.css` | 修改 ~30 行 | 新增模板组列表样式 |

**不改动的文件**：Canvas、CanvasToolbar、Store、PropertyPanel、AssetPanel 等。

## 5. SDK 调用改造

当前设计器直接使用底层 `createPrintEngine`，此处改为使用 `PrintSDK` 封装：

```typescript
// 旧
import { createPrintEngine } from '@jcyao/print-sdk';
const engine = createPrintEngine(template, data);
const html = await engine.generatePrintHTML();

// 新（打印）
import { createPrintSDK } from '@jcyao/print-sdk';
const sdk = createPrintSDK();
await sdk.printMultiTemplate(groups, { preview: true });

// 新（预览仍使用底层 engine，与现有逻辑一致）
// printMultiTemplate 只做打印，不做 HTML 返回
```

## 6. 边界处理

| 场景 | 处理 |
|------|------|
| 当前画布无组件时切换多模板模式 | 提示「当前画布无组件，请先编辑模板」，允许继续（可只用已保存模板） |
| 模板加载失败 | 对应行标红，提示错误，跳过该组 |
| 所有组预览为空 | 禁用「打印」按钮，提示「无可打印内容」 |
| 切换回单模板模式 | 保留多模板模式的组列表状态 |
| 弹窗关闭再打开 | 重置所有状态到初始值 |
| 空数据列表 | 禁用数据选择下拉，提示「无可用数据」 |

## 7. 类型定义

```typescript
// PrintPreview 内部状态
interface TemplateGroup {
  id: string;                    // 唯一标识（用于列表 key）
  templateSource: 'current' | string;  // 'current' 或模板 ID
  templateLabel: string;         // 模板显示名
  dataId: string;                // Mock 数据 ID
}
```

## 8. 约束

- 已保存模板需与当前画布模板使用**相同纸张尺寸**（SDK 限制，已在文档注明）
- 不做模板尺寸一致性校验（SDK 侧也暂不做，统一在文档中说明）
- 本次不改动画布编辑逻辑，不引入多 Tab 编辑器
