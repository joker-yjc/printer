# 需求澄清：更新用户手册并新建 SDK API 参考文档

## 背景

项目近期完成了多项功能迭代（表格密度、合计显示模式、列级样式、自定义页码位置、页头页脚高度调整、HTML 转义控制、自定义管道等），但嵌入设计器的用户手册（`designer/src/help/docs/`）未能及时同步，存在内容缺失和描述过时的问题。

同时，SDK（`@jcyao/print-sdk`）的 `README.md` 目前同时承担快速入门、API 参考和配置示例三重角色，篇幅过长（约 870 行），不利于开发者快速查找类型和方法。

## 目标

1. 将设计器用户手册与当前产品功能对齐，补充近期新增功能的使用说明。
2. 在设计器用户手册中新增「SDK 接入」章节，指导用户如何在业务代码中使用 `@jcyao/print-sdk`。
3. 保持 `sdk/README.md` 不变，继续作为 npm 包的完整 API 参考入口。

## 范围

### 包含

- 更新 `designer/src/help/docs/` 下的以下章节：
  - `05-设计器基础.md`：页头/页脚高度调整机制
  - `06-组件使用指南.md`：表格列级样式
  - `08-表格高级配置.md`：`summaryDisplay` 显示模式、`density` 密度预设
  - `09-页面设置.md`：页码自定义位置（`custom` + `customX/customY`）
- 在 `designer/src/help/docs/` 下新增 `12-SDK接入.md`，并在 `designer/src/help/chapters.ts` 中注册该章节。
- 按需补充截图到 `designer/public/images/`（或沿用现有图片路径）。

### 不包含

- 不改动 SDK 源码和 Designer 源码逻辑。
- 不新增业务功能。
- 不修改 `sdk/README.md`。

## 验收标准

- [ ] 用户手册中所有近期新增功能均有对应说明。
- [ ] 新增的「SDK 接入」章节覆盖安装、获取模板 JSON、快速开始、常用方法、自定义管道、HTML 转义控制、类型导入等核心内容。
- [ ] `sdk/README.md` 保持原状，不被修改。
- [ ] 文档中的代码示例字段与实际类型定义一致（如 `page` 而非 `pageConfig`）。
- [ ] 新增章节已在 `chapters.ts` 中注册，帮助弹窗可正常展示。
- [ ] 若新增截图，图片能在设计器帮助弹窗中正常加载。

## 参考资料

- `designer/src/help/docs/`：现有用户手册
- `sdk/README.md`：现有 SDK 文档
- `sdk/src/PrintSDK.ts`：SDK 实例方法
- `sdk/src/types.ts`：SDK 类型定义
- `sdk/src/index.ts`：SDK 公共导出
