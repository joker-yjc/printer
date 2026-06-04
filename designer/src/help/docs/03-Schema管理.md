# Schema 管理

Schema（数据模型）定义了打印模板的数据结构。在创建模板之前，需要先定义对应的 Schema。

---

## Schema 列表页

进入 **侧边栏 → Schema 字典**，可以看到所有已创建的 Schema 列表。

列表展示以下信息：

| 列名 | 说明 |
|------|------|
| 名称 | Schema 名称 |
| 版本 | 版本号 |
| 字段数 | 根节点下的字段总数 |
| 创建时间 | Schema 创建时间 |

每行提供以下操作按钮：

- 👁️ **预览** — 查看 Schema 完整结构
- ✏️ **编辑** — 修改 Schema
- ⬇️ **导出** — 下载 JSON 文件
- 🗑️ **删除** — 删除 Schema（需确认）

![Schema 列表页](/images/schema-list.png)

---

## 新建 Schema

点击 **"新建 Schema"** 按钮，弹出创建表单：

### 基本信息

- **名称**（必填）：Schema 的名称，如 `订单打印单`
- **版本**（必填）：版本号，如 `1.0.0`
- **描述**：可选的说明文字

### 字段结构

在 JSON 编辑器中编写根节点结构。**必须遵循以下规则**：

> ⚠️ 顶层节点 key 必须为 `root`，且 type 必须为 `object`。

### 字段类型说明

| 类型 | 说明 | 是否可包含子字段 |
|------|------|-----------------|
| `string` | 字符串 | ❌ |
| `number` | 数字 | ❌ |
| `boolean` | 布尔值 | ❌ |
| `date` | 日期 | ❌ |
| `datetime` | 日期时间 | ❌ |
| `object` | 对象 | ✅ 有 `children` |
| `array` | 数组（表格数据源） | ✅ 有 `children` |

### 字段结构示例

```json
{
  "root": {
    "type": "object",
    "children": {
      "title": { "type": "string", "label": "标题" },
      "amount": { "type": "number", "label": "金额" },
      "isPaid": { "type": "boolean", "label": "是否已付款" },
      "orderDate": { "type": "date", "label": "订单日期" },
      "address": {
        "type": "object",
        "label": "收货地址",
        "children": {
          "city": { "type": "string", "label": "城市" },
          "detail": { "type": "string", "label": "详细地址" }
        }
      },
      "items": {
        "type": "array",
        "label": "商品列表",
        "children": {
          "name": { "type": "string", "label": "商品名" },
          "qty": { "type": "number", "label": "数量" }
        }
      }
    }
  }
}
```

![Schema 编辑表单](/images/schema-form.png)

---

## 从 Mock 数据生成 Schema

如果已有 JSON 格式的示例数据，可以使用自动推断功能：

1. 在 Schema 列表页点击 **"从 Mock 数据生成"**
2. 粘贴示例 JSON 数据
3. 系统会自动推断字段类型和结构
4. 确认生成的 Schema 并保存

> 💡 自动推断规则：数字推断为 `number`，日期格式字符串推断为 `date`，数组推断为 `array`，其他字符串推断为 `string`。

---

## 导入与导出

- **导出单个 Schema**：点击列表行的导出按钮，下载 JSON 文件
- **批量导出**：点击顶部"批量导出"按钮，一次导出所有 Schema
- **导入 Schema**：点击"导入"按钮，上传 JSON 文件，支持批量导入

---

## 字段说明帮助

点击列表页的 **"字段说明"** 按钮，可以查看完整的字段类型说明和使用示例。
