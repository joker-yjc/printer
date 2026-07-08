# 任务清单：更新用户手册并新建 SDK API 参考文档

## 任务拆分

### 阶段一：文档变更记录

- [x] 创建 `docs/features/2026-07-08-update-help-manual-and-sdk-api-doc/`
- [x] 编写 `requirement.md`
- [x] 编写 `design.md`
- [x] 编写 `task.md`（本文件）

### 阶段二：更新设计器用户手册

- [x] 更新 `05-设计器基础.md`：页头/页脚高度调整机制
- [x] 更新 `06-组件使用指南.md`：表格列级样式
- [x] 更新 `08-表格高级配置.md`：`summaryDisplay` 和 `density`
- [x] 更新 `09-页面设置.md`：页码自定义位置
- [ ] 按需截取并补充配图（本次未新增截图，以文字描述为主）

### 阶段三：在设计器用户手册新增 SDK 接入章节

- [x] 在 `designer/src/help/chapters.ts` 注册 `sdk-integration` 章节
- [x] 新建 `designer/src/help/docs/12-SDK接入.md`
- [x] 写入安装、获取模板 JSON、快速开始、常用方法
- [x] 写入自定义管道和 HTML 转义控制说明
- [x] 写入类型导入和完整参考链接

### 阶段四：保持 SDK README 不变

- [x] 恢复 `sdk/README.md` 到原始版本
- [x] 删除 `sdk/API.md`

### 阶段五：验证

- [x] 检查 Markdown 渲染和相对链接
- [x] 检查帮助手册章节引用
- [x] 汇总变更给用户 review

## 风险与备注

- `sdk/README.md` 和 `sdk/API.md` 需要同步维护，后续新增公共 API 时应同时更新 `API.md`。
- 设计器帮助弹窗通过 `new URL('./docs/...', import.meta.url).href` 加载图片，新增图片需放入 `designer/src/help/docs/images/` 或沿用现有路径约定。
