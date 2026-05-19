# 代码审查报告：表格列宽功能（b8881bb → 54d3df8）

> **审查范围**：`b8881bbde89163652e2ee4ba1d4f77c01d18379b` → `54d3df8`（9 个提交）
> **涉及文件**：`sdk/src/types.ts`、`sdk/src/printEngine/renderers/TableRenderer.ts`、`designer/src/types/index.ts`、`designer/.../TablePreview.tsx`、`designer/.../TableColumnSection.tsx`
> **审查日期**：2026-05-19（首轮） → 2026-05-19（qoder + opencode 交叉审查） → 2026-05-15（opencode 修复 + qoder 补充修复）
> **状态**：✅ 全部修复（21/21）

---

## 修复状态追踪

| # | 问题 | 级别 | 状态 | 修复方式 |
|---|------|------|------|----------|
| 1 | `computeColWidths` 除零错误 | Critical | ✅ 已修复 | 空数组守卫 + colSpan 守卫（#20） |
| 2 | `computeColumnMaxWidth` 未扣行号列宽 | Critical | ✅ 已修复 | `reservedWidth` 参数 |
| 3 | 行号列哨兵值不一致 | Critical | ✅ 已修复 | 统一为 `__row_number__` |
| 4 | XSS/HTML 注入 | Critical | ✅ 已修复 | `escapeHtml` 覆盖所有输出点 (opencode) |
| 5 | 列宽拖拽历史记录污染 | Critical | ✅ 已修复 | `useColumnResize` 使用 ref + local state，mouseup 一次性提交 (qoder) |
| 6 | 边框控件条件渲染隐藏 | Warning | ✅ By Design | 不勾选边框时隐藏控件是合理的 UX |
| 7 | Designer 缺少最小表格宽度保护 | Warning | ✅ 已修复 | `\|\|` → `??`，显式值原样传入 `computeColWidths`，SDK 内部有 `< 10` 守卫 (qoder) |
| 8 | 最后一列舍入可能超 100% | Warning | ✅ 已修复 | `Math.min/max` clamp |
| 9 | `computeColWidths` + `computeColumnMaxWidth` 重复定义 | Warning | ✅ 已修复 | 两者均提取到 SDK 导出 |
| 10 | 全固定列超限无归一化 | Critical | ✅ 已修复 | SDK 同步溢出缩放分支 → #13 |
| 11 | Designer hardcode 200mm 不一致 | Suggestion | ✅ 已修复 | 从 `pageConfig` 计算 availableWidth，`??` 兜底 (qoder) |
| 12 | 总宽度超限标红 tooltip 未实现 | Suggestion | ✅ 已修复 | `Tooltip` + `status="error"` 提示 (qoder) |
| 13 | SDK 溢出缩放分支缺失 | Critical | ✅ 已修复 | 全固定 + 部分固定溢出处理 |
| 14 | partial-fixed 溢出未固定列塌缩 0% | Critical | ✅ 已修复 | 未固定列分配 1% |
| 15 | `borderWidth \|\| 1` 拒绝显式 0 | Warning | ✅ 已修复 | 三处改为 `??` (opencode) |
| 16 | `borderColor \|\|` 拒绝空字符串 | Warning | ✅ 已修复 | 改为 `??` (opencode) |
| 17 | SDK/Designer 最后一列舍入路径不一致 | Warning | ✅ 已修复 | Designer 复用 SDK 版本 |
| 18 | TablePreview `computeColumnMaxWidth` 双重扣除 | Warning | ✅ 已修复 | 移除多余 `reservedWidth` |
| 19 | `computeColumnMaxWidth` 函数重复定义 | Warning | ✅ 已修复 | 提取到 SDK 导出 (opencode) |
| 20 | TablePreview `colSpan` 缺少 `\|\| 1` | Suggestion | ✅ 已修复 | 添加守卫 (opencode) |

---

## qoder-agent 本轮补充修复（2026-05-15）

| # | 问题 | 文件 | 改动 |
|---|------|------|------|
| **#5** | 列宽拖拽历史记录污染 | `TablePreview.tsx` | `useColumnResize` 增加 `currentWidthRef` + `currentWidth` local state，mousemove 仅更新本地状态，mouseup 一次性调用 `onWidthChange` 提交到 store。tooltip 改用 local state 显示实时宽度。 |
| **#7** | `widthMm \|\| 200` 拒绝极小值 | `TablePreview.tsx` | `\|\| 200` → `??`，与 #11 合并实施 |
| **#11** | Designer hardcode 200mm | `TablePreview.tsx` + `TableColumnSection.tsx` | 从 `pageConfig` 计算 `availableWidth`（支持 A4/A5/CUSTOM/CONTINUOUS + landscape），`tableWidthMm = widthMm ?? (availableWidth - xMm)` |
| **#12** | 总宽度超限标红 + tooltip | `TableColumnSection.tsx` | 计算 `totalAssignedWidth`，超限时 InputNumber 设 `status="error"` + Tooltip 显示具体数值 |

### #6 说明

边框控件（borderStyle/borderColor/borderWidth）在 `bordered=false` 时隐藏是合理的 UX 设计——用户取消勾选"显示边框"后不需要看到边框相关配置。标记为 **By Design**。

---

## opencode-agent 修复验证（2026-05-15）

> 对 opencode-agent 实施的 5 项修复逐一审查，全部正确：

| 修复项 | 审查结论 |
|--------|----------|
| **#4 XSS** | ✅ `escapeHtml` 正确处理 `&<>"'` 五个字符，`&` 优先替换避免双重转义 |
| **#15 `borderWidth ??`** | ✅ 三处全部正确使用 `?? 1` |
| **#16 `borderColor ??`** | ✅ 三处全部正确使用 `??` |
| **#19 函数统合** | ✅ `computeColumnMaxWidth` 从 SDK 导出，Designer 统一引用 |
| **#20 colSpan 守卫** | ✅ `colSpan={displayCols.length \|\| 1}` |

---

## Summary of Changes

1. **SDK 新增** `borderStyle`、`borderColor`、`borderWidth`、`rowNumberWidth` 四个可选 TableProps，`computeColWidths` 和 `computeColumnMaxWidth` 函数导出供 Designer 复用
2. **Designer 新增** 列宽拖拽调整功能（`useColumnResize` hook，mouseup 一次性提交避免历史污染）、边框颜色选择器、边框粗细输入、总宽度超限验证（标红 + tooltip）、从 `pageConfig` 动态计算表格可用宽度
3. **SDK 表格渲染** 增加列宽溢出缩放处理（全固定 + 部分固定两种场景）、XSS 防护（`escapeHtml`）、falsy 值守卫（`??` 替代 `||`）
4. **修复** 行号列哨兵值统一、`computeColumnMaxWidth` 双重扣除行号列宽度、最后一列舍入误差、列宽拖拽历史记录污染
5. **文档** 4 个设计/规划文档 + 本审查报告
