# 可视化打印模板设计器

基于 React + Vite 的可视化打印模板设计器，配合 `@jcyao/print-sdk` 使用。用户可通过拖拽方式设计打印模板，生成模板 JSON 后交由 SDK 执行打印。

> 私有包，不发布到 npm。线上演示：https://printer-pi-five.vercel.app

## 📦 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 5 |
| 路由 | react-router-dom 7 |
| 状态管理 | Zustand 5 |
| UI 组件库 | Ant Design 6 |
| 代码编辑 | Monaco Editor 0.55 |
| 打印 SDK | `@jcyao/print-sdk`（本地 workspace 别名） |

## 🚀 快速开始

```bash
cd designer
npm install
npm run dev
# 访问 http://localhost:5173
```

可用脚本：

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务（含 Vite mock） |
| `npm run build` | 生产构建 |
| `npm run build:demo` | demo 模式构建 |
| `npm run preview` | 预览构建产物 |
| `npm run lint` | ESLint 检查 |

## 🗂️ 路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/templates` | TemplateManagement | 模板管理（默认首页） |
| `/schemas` | SchemaManagement | Schema 字典管理 |
| `/mock-data` | MockDataManagement | Mock 数据管理 |
| `/designer` | Designer | 可视化设计器（全屏） |

## 📁 目录结构

```
designer/
├── mock/                   # Mock API 数据源（Schema/模板/MockData）
├── src/
│   ├── pages/
│   │   ├── Designer/             # 设计器主页面
│   │   │   └── components/
│   │   │       ├── AssetPanel/       # 左侧资产面板（数据资产 + 组件库）
│   │   │       ├── Canvas/           # 画布编辑器（拖拽、对齐、吸附）
│   │   │       ├── PropertyPanel/    # 右侧属性面板（样式插件）
│   │   │       ├── ComponentTreePanel/  # 组件树
│   │   │       └── DebugPanel/       # 调试面板
│   │   ├── TemplateManagement/   # 模板管理
│   │   ├── SchemaManagement/     # Schema 管理
│   │   └── MockDataManagement/   # Mock 数据管理
│   ├── components/           # 通用组件（PrintPreview、Barcode、QRCode）
│   ├── layouts/              # 主布局（MainLayout）
│   ├── pipes/configurators/  # 管道 UI 配置器
│   ├── services/             # API 层（mockApi + mockStore）
│   ├── store/                # Zustand 全局状态
│   ├── types/                # 设计器内部类型
│   └── utils/                # 工具函数（grid、zoom、pageSize）
└── vite.config.ts            # Vite 配置（含 SDK 别名）
```

## 🔗 关联包

- **SDK**：`../sdk/`（npm: `@jcyao/print-sdk`）
- **SDK CHANGELOG**：`../sdk/CHANGELOG.md`
- **根目录**：`../README.md`（项目整体介绍）

> 本地开发时（`npm run dev`），Vite 会自动将 `@jcyao/print-sdk` 别名指向 `../sdk/src/index.ts` 源码，无需预先 build SDK。生产构建时则使用 npm 安装的版本。
