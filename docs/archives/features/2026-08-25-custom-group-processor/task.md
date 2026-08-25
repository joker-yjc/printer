# 任务执行：自定义分组处理器 groupProcessor

> 实现计划，按 Task 顺序执行。每步用 `- [ ]` 勾选跟踪。
> **验证方式说明**：SDK 无测试框架，以 `npx tsc --noEmit -p tsconfig.json` 与 `npm run build`（rollup 含类型检查）作为验证手段；designer 以 `npm run build` + `npm run lint` 验证。

**Goal:** 将表格分组算法开放为运行时可注入的 `groupProcessor`（分组 + 组排序一体化），4 个 `groupByField` 调用点统一收口到 `RenderContext.groupData`；`createPrintEngine` 升级为 options 对象签名（重载兼容旧 5 参数签名）。

**Architecture:** `GroupProcessor` 类型 + `SDKGlobalConfig`/`PrintSDKOptions` 两级注入 → `PrintEngine` 持有处理器并提供 `groupData` 私有方法 → `RenderContext.groupData` 暴露给渲染器 → 4 调用点改造。`normalizeGroups` 负责结构校验与 `startRowIndex` 重算。

**Tech Stack:** TypeScript、rollup、react/antd（designer）。

## Global Constraints

- 模板 JSON 不存函数；`groupProcessor` 仅运行时注入（实例 > 全局 > 内置）。
- 处理器契约：key 唯一、items 引用原始行对象、数组顺序即组顺序；返回 null/undefined 回退默认。
- 所有分组调用点必须收口 `groupData`，禁止渲染器直连 `groupByField`。
- `groupByField` 保持从 `sdk/src/index.ts` 公开导出（外部 API，不删）。
- 老模板、旧 `createPrintEngine` 签名零影响。
- 提交时机由用户统一决定，本计划不包含 `git commit` 步骤。

---

### Task 1: 类型与配置入口

**文件:**
- Modify: `sdk/src/types.ts`
- Modify: `sdk/src/config/globalConfig.ts`
- Modify: `sdk/src/PrintSDK.ts`
- Modify: `sdk/src/index.ts`（如 `GroupProcessor` 需要导出）

**Interfaces:**
- Produces: `GroupProcessor` 类型（`(data, groupBy) => GroupedData[] | null | undefined`）
- Produces: `PrintSDKOptions.groupProcessor`、`SDKGlobalConfig.groupProcessor`

- [x] **Step 1: types.ts 新增 `GroupProcessor` 类型**（含完整 JSDoc 契约注释：key 唯一 / items 引用原始行 / 顺序即组顺序 / null 回退）
- [x] **Step 2: globalConfig.ts 的 `SDKGlobalConfig` 追加 `groupProcessor?: GroupProcessor`**（import 类型）
- [x] **Step 3: PrintSDK.ts 的 `PrintSDKOptions` 追加 `groupProcessor?: GroupProcessor`**；构造函数中 `this.groupProcessor = options?.groupProcessor ?? getGlobalConfig().groupProcessor`（单值覆盖，同 escapeHtml 规则）
- [x] **Step 4: index.ts 导出 `GroupProcessor` 类型**（经 `export * from './sdk'` 透传）

**Verify:** `npx tsc --noEmit -p sdk/tsconfig.json` 通过；不传 groupProcessor 时 PrintSDK 行为不变。

---

### Task 2: createPrintEngine 重载改造

**文件:**
- Modify: `sdk/src/printEngine.ts`（PrintEngine 构造函数 + 工厂函数）

**Interfaces:**
- Produces: `PrintEngineOptions` 接口（customPipes / customAggregators / escapeHtml / groupProcessor）
- Preserves: 旧 5 参数签名（`@deprecated` 标记）

- [x] **Step 1: 定义并导出 `PrintEngineOptions`**（含 customPipes / customAggregators / escapeHtml / groupProcessor）
- [x] **Step 2: `PrintEngine` 构造函数签名改为 `(template, data, options: PrintEngineOptions = {})`**，内部解构赋值（customPipesMap / customAggregatorsMap / escapeHtmlFlag / groupProcessor 逻辑保持等价迁移；registerCustomPipes/registerCustomAggregators 校验逻辑不动）
- [x] **Step 3: 工厂函数加两个重载声明**：options 签名 + 旧签名（`@deprecated`）；实现签名 `(template, data, optionsOrPipes?, escapeHtml?, customAggregators?)`，`Array.isArray(optionsOrPipes)` 归一化后统一 `new PrintEngine(template, data, options)`
- [x] **Step 4: PrintSDK.ts 内 4 处 `createPrintEngine(...)` 调用点改为 options 签名**（print / preview 相关 138、225、266、349 行附近），传 `{ customPipes, escapeHtml, customAggregators, groupProcessor: this.groupProcessor }`

**Verify:** `npx tsc --noEmit` + `npm run build` 通过；旧签名调用（外部场景）与新签名调用均可编译。

---

### Task 3: groupData 收口 + normalizeGroups

**文件:**
- Modify: `sdk/src/printEngine/utils/groupBy.ts`（新增 `normalizeGroups`）
- Modify: `sdk/src/printEngine/types.ts`（RenderContext 追加 `groupData`）
- Modify: `sdk/src/printEngine.ts`（私有 `groupData` 方法 + createRenderContext 绑定 + export type）

**Interfaces:**
- Produces: `normalizeGroups(groups: any[]): GroupedData[] | null`
- Produces: `RenderContext.groupData(data, groupBy): GroupedData[]`

- [x] **Step 1: groupBy.ts 实现 `normalizeGroups`**：非数组/空数组返回 null；逐组校验（key 缺失归 '未分组'、items 非数组置 []）；重复 key 合并进先出现的组；按顺序重算 startRowIndex（累计行数）
- [x] **Step 2: printEngine.ts 实现私有 `groupData`**：有处理器 → try 执行 → 非 null 返回 normalizeGroups 结果（normalize 返回 null 时 warn + 回退）；null/undefined 静默回退；抛错 warn + 回退；无处理器 → `groupByField(data, groupBy.field, groupBy.emptyGroupLabel || '未分组')`
- [x] **Step 3: RenderContext 接口追加 `groupData` 声明（含 JSDoc：禁止渲染器直连 groupByField）**；`createRenderContext` 绑定 `groupData: this.groupData.bind(this)`

**Verify:** `npx tsc --noEmit` + `npm run build` 通过；normalizeGroups 针对空数组/重复 key/缺 key 各场景人工 review 边界。

---

### Task 4: 4 个调用点改造

**文件:**
- Modify: `sdk/src/printEngine.ts`（splitGroupedTableWithGap，约 1228 行）
- Modify: `sdk/src/printEngine/renderers/TableRenderer.ts`（364 / 368 / 872 行三处）

- [x] **Step 1: printEngine.ts:1228 改为 `this.groupData(tableData, groupBy)`**（emptyLabel 变量如仅此使用则一并清理；calculateHeight 分组测算如也在此文件出现需一并收口）
- [x] **Step 2: TableRenderer.ts:364 改为 `context.groupData(tableData, groupBy)`**
- [x] **Step 3: TableRenderer.ts:368 改为 `context.groupData(totalSource, groupBy)`**
- [x] **Step 4: TableRenderer.ts:872 改为 `context.groupData(data, groupBy)`**（calculateHeight 内的分组测算）
- [x] **Step 5: 清理 TableRenderer 对 `groupByField` 的 import**（保留 `hasGroupSummary`）

**Verify:** `grep -rn "groupByField(" sdk/src/` 仅剩 groupBy.ts 定义处 + printEngine.ts groupData 回退处 + index.ts 导出处，业务调用点为零。

---

### Task 5: 构建验证 + designer 联动 + 人工场景验证

**文件:**
- Build: `sdk/`（dist 产物）

- [x] **Step 1: `npm run build`**（sdk 根目录），确认 rollup 类型检查通过、产物体积无异常增长**
- [x] **Step 2: rsync dist 到 designer 依赖**（designer 引用 npm 包 @jcyao/print-sdk，已同步到 pnpm store 缓存）
- [x] **Step 3: designer `npm run build` + `npm run lint` 验证通过（确认 createPrintEngine 调用点未受重载影响）**（注：designer 存在项目既有 lint 基线错误 115 个，全部位于 `src/pipes`、`src/services/mock`、`src/utils` 等未改动文件，本次改动文件 `main.tsx` lint 干净；`npm run build` 中 tsc + vite 均通过）
- [ ] **Step 4: designer 预览环境人工验证 5 场景：**
  1. 回归：不注入处理器，分组渲染 + 分页与改造前一致
  2. 自定义分组：注入按月分组，组标题正确、跨组行号连续
  3. 自定义排序：组重排后分页拆分与渲染一致（重点：大组跨页中间块无小计）
  4. 回退：特定 field 返回 null，混合默认/自定义分组
  5. 容错：抛错/非法返回回退默认，控制台有 warn

**Verify:** 全部场景通过后，等待用户指示统一提交（不自行 git commit）。
