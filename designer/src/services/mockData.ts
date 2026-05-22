import type { SchemaDictionary, PrintTemplate, MockData } from '../types';

/**
 * 默认系统内置 Schema 列表
 */
export const defaultSchemas: SchemaDictionary[] = [
  {
    id: 'schema-demo-sales',
    name: '销售出库单',
    rootType: 'object',
    version: '1.0',
    description: '系统内置示例 Schema',
    root: {
      key: 'root',
      label: '演示数据',
      type: 'object',
      children: [
        { key: 'title', label: '标题', type: 'string', description: '文档标题' },
        { key: 'subtitle', label: '副标题', type: 'string' },
        { key: 'companyName', label: '公司名称', type: 'string' },
        { key: 'companyAddress', label: '公司地址', type: 'string' },
        { key: 'documentNo', label: '单据编号', type: 'string' },
        { key: 'createdDate', label: '创建日期', type: 'date', format: 'date' },
        { key: 'createdTime', label: '创建时间', type: 'datetime', format: 'datetime' },
        { key: 'amount', label: '金额', type: 'number' },
        {
          key: 'status',
          label: '状态',
          type: 'string',
          enum: [
            { value: 'pending', label: '待处理' },
            { value: 'processing', label: '处理中' },
            { value: 'completed', label: '已完成' },
            { value: 'cancelled', label: '已取消' }
          ]
        },
        { key: 'qrCodeUrl', label: '二维码内容', type: 'string', description: '用于生成二维码的URL或文本' },
        { key: 'barcode', label: '条形码', type: 'string', description: '条形码数据' },
        { key: 'logoUrl', label: 'Logo图片', type: 'string', description: '公司Logo的URL' },
        { key: 'signatureUrl', label: '签名图片', type: 'string' },
        {
          key: 'customer',
          label: '客户信息',
          type: 'object',
          children: [
            { key: 'name', label: '客户名称', type: 'string' },
            { key: 'contact', label: '联系人', type: 'string' },
            { key: 'phone', label: '联系电话', type: 'string' },
            { key: 'email', label: '电子邮箱', type: 'string' },
            { key: 'address', label: '联系地址', type: 'string' }
          ]
        },
        {
          key: 'items',
          label: '明细列表',
          type: 'array',
          description: '商品或服务明细',
          children: [
            { key: 'no', label: '序号', type: 'number' },
            { key: 'code', label: '编码', type: 'string' },
            { key: 'name', label: '名称', type: 'string' },
            { key: 'spec', label: '规格', type: 'string' },
            { key: 'unit', label: '单位', type: 'string' },
            { key: 'quantity', label: '数量', type: 'number' },
            { key: 'price', label: '单价', type: 'number' },
            { key: 'amount', label: '金额', type: 'number' }
          ]
        },
        {
          key: 'summary',
          label: '汇总信息',
          type: 'object',
          children: [
            { key: 'totalQuantity', label: '总数量', type: 'number' },
            { key: 'totalAmount', label: '总金额', type: 'number' },
            { key: 'discount', label: '优惠金额', type: 'number' },
            { key: 'tax', label: '税额', type: 'number' },
            { key: 'finalAmount', label: '实付金额', type: 'number' }
          ]
        },
        { key: 'remarks', label: '备注说明', type: 'string' },
        { key: 'operator', label: '操作员', type: 'string' },
        { key: 'reviewer', label: '审核人', type: 'string' }
      ]
    }
  },
  {
    id: 'schema-demo-order-nested',
    name: '采购订单（嵌套对象）',
    rootType: 'object',
    version: '1.0',
    description: '演示表格列使用嵌套路径（如 product.name）的 Schema',
    root: {
      key: 'root',
      label: '采购订单',
      type: 'object',
      children: [
        { key: 'title', label: '标题', type: 'string' },
        { key: 'orderNo', label: '订单编号', type: 'string' },
        { key: 'orderDate', label: '订单日期', type: 'date', format: 'date' },
        {
          key: 'supplier',
          label: '供应商信息',
          type: 'object',
          children: [
            { key: 'name', label: '供应商名称', type: 'string' },
            { key: 'contact', label: '联系人', type: 'string' },
            { key: 'phone', label: '联系电话', type: 'string' }
          ]
        },
        {
          key: 'items',
          label: '采购明细',
          type: 'array',
          description: '每行包含嵌套的商品对象，测试 dataIndex 为 product.name 的场景',
          children: [
            { key: 'no', label: '序号', type: 'number' },
            {
              key: 'product',
              label: '商品信息',
              type: 'object',
              children: [
                { key: 'name', label: '商品名称', type: 'string' },
                { key: 'code', label: '商品编码', type: 'string' },
                { key: 'category', label: '分类', type: 'string' }
              ]
            },
            { key: 'quantity', label: '数量', type: 'number' },
            { key: 'price', label: '单价', type: 'number' },
            { key: 'amount', label: '金额', type: 'number' }
          ]
        },
        {
          key: 'summary',
          label: '汇总',
          type: 'object',
          children: [
            { key: 'totalAmount', label: '总金额', type: 'number' },
            { key: 'finalAmount', label: '实付金额', type: 'number' }
          ]
        },
        { key: 'remarks', label: '备注', type: 'string' }
      ]
    }
  }
];

/**
 * 默认系统内置模板列表
 */
export const defaultTemplates: PrintTemplate[] = [
  {
    "name": "订单打印模板",
    "version": "1.0.0",
    "schemaId": "schema-demo-sales",
    "page": {
      "size": "A4",
      "orientation": "portrait",
      "marginMm": {
        "top": 10,
        "right": 10,
        "bottom": 10,
        "left": 10
      }
    },
    "layoutMode": "absolute",
    "components": [
      {
        "id": "title",
        "type": "text",
        "layout": {
          "mode": "absolute",
          "xMm": 70,
          "yMm": 10,
          "widthMm": 60,
          "heightMm": 10
        },
        "style": {
          "fontSize": 20,
          "fontWeight": "bold",
          "textAlign": "center"
        },
        "binding": {
          "path": "title",
          "fallback": "订单打印"
        },
        "props": {}
      },
      {
        "id": "line1",
        "type": "line",
        "layout": {
          "mode": "absolute",
          "xMm": 10,
          "yMm": 25,
          "widthMm": 190,
          "heightMm": 2
        },
        "style": {
          "borderTopWidth": 1,
          "borderTopStyle": "solid",
          "borderTopColor": "#000000"
        },
        "props": {
          "direction": "horizontal"
        }
      },
      {
        "id": "documentNo",
        "type": "text",
        "layout": {
          "mode": "absolute",
          "xMm": 10,
          "yMm": 30,
          "widthMm": 80,
          "heightMm": 8
        },
        "style": {
          "fontSize": 12
        },
        "binding": {
          "path": "documentNo",
          "fallback": "ORD-"
        },
        "props": {
          "label": "订单编号："
        }
      },
      {
        "id": "createdDate",
        "type": "text",
        "layout": {
          "mode": "absolute",
          "xMm": 110,
          "yMm": 30,
          "widthMm": 80,
          "heightMm": 8
        },
        "style": {
          "fontSize": 12,
          "textAlign": "right"
        },
        "binding": {
          "path": "createdDate",
          "pipes": [
            {
              "type": "date",
              "options": {
                "format": "YYYY-MM-DD HH:mm"
              }
            }
          ],
          "fallback": "2024-01-22"
        },
        "props": {
          "label": "日期："
        }
      },
      {
        "id": "orderBarcode",
        "type": "barcode",
        "layout": {
          "mode": "absolute",
          "xMm": 10,
          "yMm": 38,
          "widthMm": 60,
          "heightMm": 12
        },
        "binding": {
          "path": "barcode",
          "fallback": "ORD202401220001"
        },
        "props": {
          "format": "CODE128"
        }
      },
      {
        "id": "customerTitle",
        "type": "text",
        "layout": {
          "mode": "absolute",
          "xMm": 10,
          "yMm": 50,
          "widthMm": 40,
          "heightMm": 8
        },
        "style": {
          "fontSize": 14,
          "fontWeight": "bold"
        },
        "binding": {
          "fallback": "客户信息"
        },
        "props": {
          "text": "收件人信息"
        }
      },
      {
        "id": "customerRect",
        "type": "rect",
        "layout": {
          "mode": "absolute",
          "xMm": 25,
          "yMm": 210,
          "widthMm": 85,
          "heightMm": 20
        },
        "style": {
          "border": "1px solid #d9d9d9",
          "borderRadius": "2px",
          "background": "#fafafa"
        },
        "props": {}
      },
      {
        "id": "customerName",
        "type": "text",
        "layout": {
          "mode": "absolute",
          "xMm": 10,
          "yMm": 60,
          "widthMm": 80,
          "heightMm": 6
        },
        "style": {
          "fontSize": 11
        },
        "binding": {
          "path": "customer.name",
          "fallback": "客户名称"
        },
        "props": {
          "label": "姓名："
        }
      },
      {
        "id": "customerPhone",
        "type": "text",
        "layout": {
          "mode": "absolute",
          "xMm": 10,
          "yMm": 70,
          "widthMm": 80,
          "heightMm": 6
        },
        "style": {
          "fontSize": 11
        },
        "binding": {
          "path": "customer.phone",
          "fallback": "138****8888"
        },
        "props": {
          "label": "电话："
        }
      },
      {
        "id": "customerAddress",
        "type": "text",
        "layout": {
          "mode": "absolute",
          "xMm": 10,
          "yMm": 80,
          "widthMm": 100,
          "heightMm": 10
        },
        "style": {
          "fontSize": 11
        },
        "binding": {
          "path": "customer.address",
          "fallback": "收货地址"
        },
        "props": {
          "label": "地址："
        }
      },
      {
        "id": "qrcode",
        "type": "qrcode",
        "layout": {
          "mode": "absolute",
          "xMm": 145,
          "yMm": 48,
          "widthMm": 35,
          "heightMm": 35
        },
        "binding": {
          "path": "qrCodeUrl",
          "fallback": "https://example.com/order/12345"
        },
        "props": {
          "content": ""
        }
      },
      {
        "id": "companyLogo",
        "type": "image",
        "layout": {
          "mode": "absolute",
          "xMm": 10,
          "yMm": 240,
          "widthMm": 35,
          "heightMm": 15
        },
        "binding": {
          "path": "companyLogo",
          "fallback": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzE4OTBmZiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TE9HTzwvdGV4dD48L3N2Zz4="
        },
        "props": {
          "fit": "contain"
        }
      },
      {
        "id": "line2",
        "type": "line",
        "layout": {
          "mode": "absolute",
          "xMm": 10,
          "yMm": 95,
          "widthMm": 190,
          "heightMm": 2
        },
        "style": {
          "borderTopWidth": 1,
          "borderTopStyle": "dashed",
          "borderTopColor": "#999999"
        },
        "props": {
          "direction": "horizontal"
        }
      },
      {
        "id": "itemsTable",
        "type": "table",
        "layout": {
          "mode": "absolute",
          "xMm": 10,
          "yMm": 100,
          "widthMm": 190,
          "heightMm": 80
        },
        "style": {
          "fontSize": 10,
          "textAlign": "center"
        },
        "binding": {
          "path": "items"
        },
        "props": {
          "bordered": true,
          "showHeader": true,
          "columns": [
            {
              "dataIndex": "name",
              "title": "商品名称",
              "width": 60
            },
            {
              "dataIndex": "spec",
              "title": "规格",
              "width": 40
            },
            {
              "dataIndex": "quantity",
              "title": "数量",
              "width": 30
            },
            {
              "dataIndex": "price",
              "title": "单价",
              "width": 30
            },
            {
              "dataIndex": "amount",
              "title": "金额",
              "width": 30
            }
          ]
        }
      },
      {
        "id": "totalAmount",
        "type": "text",
        "layout": {
          "mode": "absolute",
          "xMm": 130,
          "yMm": 180,
          "widthMm": 60,
          "heightMm": 8
        },
        "style": {
          "fontSize": 14,
          "fontWeight": "bold",
          "textAlign": "right"
        },
        "binding": {
          "path": "summary.finalAmount",
          "pipes": [
            {
              "type": "currency",
              "options": {}
            }
          ],
          "fallback": "￥0.00"
        },
        "props": {
          "label": "合计："
        }
      },
      {
        "id": "remarks",
        "type": "text",
        "layout": {
          "mode": "absolute",
          "xMm": 10,
          "yMm": 192,
          "widthMm": 190,
          "heightMm": 15
        },
        "style": {
          "fontSize": 10
        },
        "binding": {
          "path": "remarks",
          "fallback": "备注信息"
        },
        "props": {
          "label": "备注："
        }
      },
      {
        "id": "comp-1769574955052",
        "type": "text",
        "layout": {
          "mode": "absolute",
          "xMm": 10,
          "yMm": 215,
          "widthMm": 15,
          "heightMm": 10
        },
        "style": {
          "fontSize": 14,
          "color": "#262626"
        },
        "props": {
          "text": "签名："
        }
      }
    ],
    "id": "template-demo-order"
  },
  {
    "name": "快递面单模板",
    "version": "1.0.0",
    "schemaId": "schema-demo-sales",
    "page": {
      "size": "A4",
      "orientation": "portrait",
      "marginMm": {
        "top": 10,
        "right": 10,
        "bottom": 10,
        "left": 10
      }
    },
    "layoutMode": "absolute",
    "components": [
      {
        "id": "companyName",
        "type": "text",
        "layout": {
          "mode": "absolute",
          "xMm": 10,
          "yMm": 12,
          "widthMm": 100,
          "heightMm": 12
        },
        "style": {
          "fontSize": 18,
          "fontWeight": "bold"
        },
        "binding": {
          "path": "companyName",
          "fallback": "快递公司名称"
        },
        "props": {}
      },
      {
        "id": "companyLogo",
        "type": "image",
        "layout": {
          "mode": "absolute",
          "xMm": 115,
          "yMm": 10.5,
          "widthMm": 35,
          "heightMm": 15
        },
        "binding": {
          "path": "companyLogo",
          "fallback": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmNTcyMiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RVhQPC90ZXh0Pjwvc3ZnPg=="
        },
        "props": {
          "fit": "contain"
        }
      },
      {
        "id": "barcode",
        "type": "barcode",
        "layout": {
          "mode": "absolute",
          "xMm": 155,
          "yMm": 10,
          "widthMm": 35,
          "heightMm": 15
        },
        "binding": {
          "path": "barcode",
          "fallback": "1234567890123"
        },
        "props": {
          "format": "CODE128"
        }
      },
      {
        "id": "line1",
        "type": "line",
        "layout": {
          "mode": "absolute",
          "xMm": 10,
          "yMm": 30,
          "widthMm": 190,
          "heightMm": 2
        },
        "style": {
          "borderTopWidth": 2,
          "borderTopStyle": "solid",
          "borderTopColor": "#000000"
        },
        "props": {
          "direction": "horizontal"
        }
      },
      {
        "id": "senderRect",
        "type": "rect",
        "layout": {
          "mode": "absolute",
          "xMm": 8,
          "yMm": 33,
          "widthMm": 89,
          "heightMm": 49
        },
        "style": {
          "border": "1px solid #d9d9d9",
          "borderRadius": "2px",
          "background": "#f0f9ff"
        },
        "props": {}
      },
      {
        "id": "senderTitle",
        "type": "text",
        "layout": {
          "mode": "absolute",
          "xMm": 10,
          "yMm": 35,
          "widthMm": 85,
          "heightMm": 8
        },
        "style": {
          "fontSize": 14,
          "fontWeight": "bold"
        },
        "binding": {
          "fallback": "寄件人"
        },
        "props": {}
      },
      {
        "id": "senderName",
        "type": "text",
        "layout": {
          "mode": "absolute",
          "xMm": 10,
          "yMm": 45,
          "widthMm": 85,
          "heightMm": 6
        },
        "style": {
          "fontSize": 11
        },
        "binding": {
          "path": "companyName",
          "fallback": "寄件公司"
        },
        "props": {
          "label": "姓名/公司："
        }
      },
      {
        "id": "senderPhone",
        "type": "text",
        "layout": {
          "mode": "absolute",
          "xMm": 10,
          "yMm": 53,
          "widthMm": 85,
          "heightMm": 6
        },
        "style": {
          "fontSize": 11
        },
        "binding": {
          "path": "customer.phone",
          "fallback": "021-12345678"
        },
        "props": {
          "label": "电话："
        }
      },
      {
        "id": "senderAddress",
        "type": "text",
        "layout": {
          "mode": "absolute",
          "xMm": 10,
          "yMm": 61,
          "widthMm": 85,
          "heightMm": 18
        },
        "style": {
          "fontSize": 11
        },
        "binding": {
          "path": "companyAddress",
          "fallback": "寄件地址"
        },
        "props": {
          "label": "地址："
        }
      },
      {
        "id": "vline1",
        "type": "line",
        "layout": {
          "mode": "absolute",
          "xMm": 100,
          "yMm": 35,
          "widthMm": 2,
          "heightMm": 45
        },
        "style": {
          "borderTopWidth": 2,
          "borderTopStyle": "dashed",
          "borderTopColor": "#999999"
        },
        "props": {
          "direction": "vertical"
        }
      },
      {
        "id": "receiverRect",
        "type": "rect",
        "layout": {
          "mode": "absolute",
          "xMm": 103,
          "yMm": 33,
          "widthMm": 89,
          "heightMm": 49
        },
        "style": {
          "border": "1px solid #d9d9d9",
          "borderRadius": "2px",
          "background": "#fff7e6"
        },
        "props": {}
      },
      {
        "id": "receiverTitle",
        "type": "text",
        "layout": {
          "mode": "absolute",
          "xMm": 105,
          "yMm": 35,
          "widthMm": 85,
          "heightMm": 8
        },
        "style": {
          "fontSize": 14,
          "fontWeight": "bold"
        },
        "binding": {
          "fallback": "收件人"
        },
        "props": {}
      },
      {
        "id": "receiverName",
        "type": "text",
        "layout": {
          "mode": "absolute",
          "xMm": 105,
          "yMm": 45,
          "widthMm": 85,
          "heightMm": 6
        },
        "style": {
          "fontSize": 11
        },
        "binding": {
          "path": "customer.name",
          "fallback": "收件人姓名"
        },
        "props": {
          "label": "姓名："
        }
      },
      {
        "id": "receiverPhone",
        "type": "text",
        "layout": {
          "mode": "absolute",
          "xMm": 105,
          "yMm": 53,
          "widthMm": 85,
          "heightMm": 6
        },
        "style": {
          "fontSize": 11
        },
        "binding": {
          "path": "customer.phone",
          "fallback": "138****8888"
        },
        "props": {
          "label": "电话："
        }
      },
      {
        "id": "receiverAddress",
        "type": "text",
        "layout": {
          "mode": "absolute",
          "xMm": 105,
          "yMm": 61,
          "widthMm": 85,
          "heightMm": 18
        },
        "style": {
          "fontSize": 11,
          "fontWeight": "bold"
        },
        "binding": {
          "path": "customer.address",
          "fallback": "收货地址"
        },
        "props": {
          "label": "地址："
        }
      },
      {
        "id": "line2",
        "type": "line",
        "layout": {
          "mode": "absolute",
          "xMm": 10,
          "yMm": 85,
          "widthMm": 190,
          "heightMm": 2
        },
        "style": {
          "borderTopWidth": 1,
          "borderTopStyle": "solid",
          "borderTopColor": "#000000"
        },
        "props": {
          "direction": "horizontal"
        }
      },
      {
        "id": "goodsTitle",
        "type": "text",
        "layout": {
          "mode": "absolute",
          "xMm": 10,
          "yMm": 92,
          "widthMm": 40,
          "heightMm": 8
        },
        "style": {
          "fontSize": 12,
          "fontWeight": "bold"
        },
        "binding": {
          "fallback": "物品信息"
        },
        "props": {}
      },
      {
        "id": "itemsTable",
        "type": "table",
        "layout": {
          "mode": "absolute",
          "xMm": 10,
          "yMm": 100,
          "widthMm": 190,
          "heightMm": 40
        },
        "style": {
          "fontSize": 10,
          "textAlign": "left"
        },
        "binding": {
          "path": "items"
        },
        "props": {
          "bordered": true,
          "showHeader": true,
          "columns": [
            {
              "dataIndex": "name",
              "title": "物品名称",
              "width": 80
            },
            {
              "dataIndex": "quantity",
              "title": "数量",
              "width": 50
            },
            {
              "dataIndex": "remarks",
              "title": "备注",
              "width": 50
            }
          ]
        }
      },
      {
        "id": "line3",
        "type": "line",
        "layout": {
          "mode": "absolute",
          "xMm": 10,
          "yMm": 148,
          "widthMm": 190,
          "heightMm": 2
        },
        "style": {
          "borderTopWidth": 1,
          "borderTopStyle": "dotted",
          "borderTopColor": "#999999"
        },
        "props": {
          "direction": "horizontal"
        }
      },
      {
        "id": "remarks",
        "type": "text",
        "layout": {
          "mode": "absolute",
          "xMm": 10,
          "yMm": 155,
          "widthMm": 140,
          "heightMm": 10
        },
        "style": {
          "fontSize": 10
        },
        "binding": {
          "path": "remarks",
          "fallback": "122"
        },
        "props": {
          "label": "备注："
        }
      },
      {
        "id": "qrcode",
        "type": "qrcode",
        "layout": {
          "mode": "absolute",
          "xMm": 160,
          "yMm": 155,
          "widthMm": 30,
          "heightMm": 30
        },
        "binding": {
          "path": "qrCodeUrl",
          "fallback": "https://example.com/tracking/12345"
        },
        "props": {
          "content": ""
        }
      },
      {
        "id": "signatureRect",
        "type": "rect",
        "layout": {
          "mode": "absolute",
          "xMm": 10,
          "yMm": 165,
          "widthMm": 60,
          "heightMm": 30
        },
        "style": {
          "border": "1px solid #d9d9d9",
          "borderRadius": "2px",
          "background": "transparent"
        },
        "props": {}
      },
      {
        "id": "signatureLabel",
        "type": "text",
        "layout": {
          "mode": "absolute",
          "xMm": 12,
          "yMm": 172,
          "widthMm": 56,
          "heightMm": 6
        },
        "style": {
          "fontSize": 10,
          "color": "#999"
        },
        "binding": {
          "fallback": "签收人签名："
        },
        "props": {}
      }
    ],
    "id": "template-demo-express"
  },
  {
    id: 'template-demo-label',
    name: '产品标签模板',
    version: '1.0',
    description: '工业产品标签示例，小尺寸标签（4x6cm），包含产品名称、条形码、规格信息',
    schemaId: 'schema-demo-sales',
    page: {
      size: 'CUSTOM',
      widthMm: 60,
      heightMm: 40,
      orientation: 'portrait',
      marginMm: { top: 2, right: 2, bottom: 2, left: 2 }
    },
    layoutMode: 'absolute',
    components: [
      {
        id: 'productName',
        type: 'text',
        layout: { mode: 'absolute', xMm: 2, yMm: 2, widthMm: 56, heightMm: 6 },
        style: { fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
        binding: { fallback: '产品名称' },
        props: {}
      },
      {
        id: 'barcode',
        type: 'barcode',
        layout: { mode: 'absolute', xMm: 5, yMm: 10, widthMm: 50, heightMm: 15 },
        binding: { path: 'barcode', fallback: '1234567890123' },
        props: { format: 'CODE128' }
      },
      {
        id: 'spec',
        type: 'text',
        layout: { mode: 'absolute', xMm: 2, yMm: 28, widthMm: 28, heightMm: 5 },
        style: { fontSize: 8 },
        binding: { fallback: '规格' },
        props: { label: '规格：' }
      },
      {
        id: 'unit',
        type: 'text',
        layout: { mode: 'absolute', xMm: 30, yMm: 28, widthMm: 28, heightMm: 5 },
        style: { fontSize: 8 },
        binding: { fallback: '个' },
        props: { label: '单位：' }
      },
      {
        id: 'date',
        type: 'text',
        layout: { mode: 'absolute', xMm: 2, yMm: 34, widthMm: 56, heightMm: 4 },
        style: { fontSize: 7, textAlign: 'center' },
        binding: {
          path: 'createdDate',
          pipes: [{ type: 'date', options: { format: 'YYYY-MM-DD' } }],
          fallback: '2024-01-22'
        },
        props: {}
      }
    ]
  },
  {
    id: 'template-bug-negative-gap',
    name: '负gap复现模板',
    version: '1.0',
    description: '用于复现跨页后新页面第一个组件负gap导致位置异常的问题',
    schemaId: 'schema-demo-sales',
    page: {
      size: 'A4',
      orientation: 'portrait',
      marginMm: { top: 10, right: 10, bottom: 10, left: 10 }
    },
    layoutMode: 'absolute',
    components: [
      {
        id: 'component-a',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 10, widthMm: 190, heightMm: 100 },
        style: { fontSize: 14 },
        binding: { fallback: '组件A：高度100mm' },
        props: { text: '组件A：高度100mm' }
      },
      {
        id: 'component-b',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 90, widthMm: 190, heightMm: 30 },
        style: { fontSize: 14, fontWeight: 'bold', color: '#ff0000', backgroundColor: '#ffffcc' },
        binding: { fallback: '组件B（与A重叠20mm）' },
        props: { text: '组件B：与A重叠20mm' }
      },
      {
        id: 'component-c',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 100, widthMm: 190, heightMm: 200 },
        style: { fontSize: 14, color: '#0000ff', backgroundColor: '#ccffcc' },
        binding: { fallback: '组件C（与B负gap，会换页）' },
        props: { text: '组件C：与B有-20mm的gap，换页后会成为新页面第一个组件。如果看到这句话位置异常或消失，说明bug存在。' }
      }
    ]
  },
  {
    "name": "采购订单模板（嵌套路径）",
    "version": "1.0.0",
    "schemaId": "schema-demo-order-nested",
    "page": {
      "size": "A4",
      "orientation": "portrait",
      "marginMm": {
        "top": 10,
        "right": 10,
        "bottom": 10,
        "left": 10
      }
    },
    "layoutMode": "absolute",
    "components": [
      {
        "id": "title",
        "type": "text",
        "layout": { "mode": "absolute", "xMm": 60, "yMm": 10, "widthMm": 80, "heightMm": 10 },
        "style": { "fontSize": 18, "fontWeight": "bold", "textAlign": "center" },
        "binding": { "path": "title", "fallback": "采购订单" },
        "props": {}
      },
      {
        "id": "orderNo",
        "type": "text",
        "layout": { "mode": "absolute", "xMm": 10, "yMm": 25, "widthMm": 80, "heightMm": 6 },
        "style": { "fontSize": 11 },
        "binding": { "path": "orderNo", "fallback": "PO-" },
        "props": { "label": "订单编号：" }
      },
      {
        "id": "orderDate",
        "type": "text",
        "layout": { "mode": "absolute", "xMm": 110, "yMm": 25, "widthMm": 80, "heightMm": 6 },
        "style": { "fontSize": 11, "textAlign": "right" },
        "binding": {
          "path": "orderDate",
          "pipes": [{ "type": "date", "options": { "format": "YYYY-MM-DD" } }],
          "fallback": "2024-01-15"
        },
        "props": { "label": "日期：" }
      },
      {
        "id": "supplierTitle",
        "type": "text",
        "layout": { "mode": "absolute", "xMm": 10, "yMm": 35, "widthMm": 40, "heightMm": 6 },
        "style": { "fontSize": 12, "fontWeight": "bold" },
        "binding": { "fallback": "供应商信息" },
        "props": { "text": "供应商信息" }
      },
      {
        "id": "supplierName",
        "type": "text",
        "layout": { "mode": "absolute", "xMm": 10, "yMm": 42, "widthMm": 80, "heightMm": 6 },
        "style": { "fontSize": 11 },
        "binding": { "path": "supplier.name", "fallback": "供应商名称" },
        "props": { "label": "名称：" }
      },
      {
        "id": "supplierPhone",
        "type": "text",
        "layout": { "mode": "absolute", "xMm": 100, "yMm": 42, "widthMm": 80, "heightMm": 6 },
        "style": { "fontSize": 11 },
        "binding": { "path": "supplier.phone", "fallback": "138****0000" },
        "props": { "label": "电话：" }
      },
      {
        "id": "line1",
        "type": "line",
        "layout": { "mode": "absolute", "xMm": 10, "yMm": 50, "widthMm": 190, "heightMm": 2 },
        "style": { "borderTopWidth": 1, "borderTopStyle": "solid", "borderTopColor": "#000000" },
        "props": { "direction": "horizontal" }
      },
      {
        "id": "itemsTable",
        "type": "table",
        "layout": { "mode": "absolute", "xMm": 10, "yMm": 55, "widthMm": 190, "heightMm": 80 },
        "style": { "fontSize": 10, "textAlign": "center" },
        "binding": { "path": "items" },
        "props": {
          "bordered": true,
          "showHeader": true,
          "columns": [
            { "dataIndex": "no", "title": "序号", "width": 30 },
            { "dataIndex": "product.code", "title": "商品编码", "width": 40 },
            { "dataIndex": "product.name", "title": "商品名称", "width": 60 },
            { "dataIndex": "product.category", "title": "分类", "width": 30 },
            { "dataIndex": "quantity", "title": "数量", "width": 30 },
            { "dataIndex": "price", "title": "单价", "width": 30 },
            { "dataIndex": "amount", "title": "金额", "width": 30, "summary": { "type": "sum", "precision": 2, "prefix": "\uFFE5" } }
          ],
          "showSummary": true,
          "summaryMode": "total",
          "summaryLabel": "合计",
          "summaryExtraRows": [
            {
              "items": [
                {
                  "label": "金额大写：",
                  "sourceColumn": "amount",
                  "pipes": [
                    { "type": "chineseNumber", "options": { "mode": "uppercase", "unit": "元整" } }
                  ]
                }
              ],
              "align": "left"
            }
          ]
        }
      },
      {
        "id": "remarks",
        "type": "text",
        "layout": { "mode": "absolute", "xMm": 10, "yMm": 140, "widthMm": 190, "heightMm": 10 },
        "style": { "fontSize": 10 },
        "binding": { "path": "remarks", "fallback": "" },
        "props": { "label": "备注：" }
      }
    ],
    "id": "template-demo-nested-order"
  }
];

/**
 * 默认系统内置 Mock 数据列表
 */
export const defaultMockData: MockData[] = [
  {
    id: 'mock-sales-001',
    name: '销售出库单 - 标准样例',
    schemaId: 'schema-demo-sales',
    description: '系统内置示例数据 - 包含5个明细项',
    data: {
      title: '销售出库单',
      subtitle: 'SALES DELIVERY NOTE',
      companyName: '深圳市示例科技有限公司',
      companyAddress: '广东省深圳市南山区科技园南区深南大道10000号',
      documentNo: 'SO202401150001',
      createdDate: '2024-01-15',
      createdTime: '2024-01-15T14:30:00',
      amount: 15800.5,
      status: 'completed',
      qrCodeUrl: 'https://www.example.com/delivery/SO202401150001',
      barcode: 'SO202401150001',
      logoUrl: 'https://via.placeholder.com/150x50/4A90E2/FFFFFF?text=LOGO',
      signatureUrl: 'https://via.placeholder.com/120x60/E2E2E2/666666?text=Signature',
      customer: {
        name: '北京天河商贸有限公司',
        contact: '张经理',
        phone: '13800138000',
        email: 'zhang@tianhe.com',
        address: '北京市朝阳区建国门外大街1号国贸大厦A座2001室'
      },
      items: [
        { no: 1, code: 'PRD-001', name: 'iPhone 15 Pro Max', spec: '256GB 深空黑色', unit: '台', quantity: 5, price: 9999.0, amount: 49995.0 },
        { no: 2, code: 'PRD-002', name: 'MacBook Pro 14英寸', spec: 'M3 芯片/16GB/512GB', unit: '台', quantity: 3, price: 15999.0, amount: 47997.0 },
        { no: 3, code: 'PRD-003', name: 'AirPods Pro 2', spec: 'USB-C 充电盒', unit: '个', quantity: 10, price: 1899.0, amount: 18990.0 },
        { no: 4, code: 'PRD-004', name: 'Magic Keyboard', spec: '妙控键盘 含触控板', unit: '个', quantity: 8, price: 899.0, amount: 7192.0 },
        { no: 5, code: 'PRD-005', name: 'Magic Mouse', spec: '妙控鼠标 黑色', unit: '个', quantity: 8, price: 649.0, amount: 5192.0 }
      ],
      summary: {
        totalQuantity: 34,
        totalAmount: 129366.0,
        discount: 5000.0,
        tax: 15732.79,
        finalAmount: 140098.79
      },
      remarks: '1. 请核对商品数量和规格\n2. 签收时请检查包装是否完好\n3. 如有问题请在24小时内联系客服\n4. 本单据一式三份，请妥善保管',
      operator: '李明',
      reviewer: '王芳'
    }
  },
  {
    id: 'mock-sales-002',
    name: '月度销售汇总表 - 大数据量',
    schemaId: 'schema-demo-sales',
    description: '系统内置示例数据 - 包含39个明细项，用于测试大表格',
    data: {
      title: '月度销售汇总表',
      subtitle: 'MONTHLY SALES SUMMARY REPORT',
      companyName: '深圳市示例科技有限公司',
      companyAddress: '广东省深圳市南山区科技园南区深南大道10000号',
      documentNo: 'SR202401',
      orderDate: null,
      createdDate: '2024-01-31',
      createdTime: '2024-01-31T17:00:00',
      amount: 2856780.5,
      status: 'completed',
      qrCodeUrl: 'https://www.example.com/report/SR202401',
      barcode: 'SR202401',
      logoUrl: 'https://via.placeholder.com/150x50/4A90E2/FFFFFF?text=LOGO',
      signatureUrl: 'https://via.placeholder.com/120x60/E2E2E2/666666?text=Signature',
      customer: { name: '全国各区域销售统计', contact: '销售部', phone: '400-123-4567', email: 'sales@example.com', address: '全国' },
      items: [
        { no: 1, code: 'PRD-001', name: 'iPhone 15 Pro Max 256GB', spec: '深空黑', unit: '台', quantity: 120, price: 9999.0, amount: 1199880.0 },
        { no: 2, code: 'PRD-002', name: 'iPhone 15 Pro 256GB', spec: '原色钛金属', unit: '台', quantity: 85, price: 8999.0, amount: 764915.0 },
        { no: 3, code: 'PRD-003', name: 'iPhone 15 Plus 256GB', spec: '黑色', unit: '台', quantity: 95, price: 6999.0, amount: 664905.0 },
        { no: 4, code: 'PRD-004', name: 'iPhone 15 128GB', spec: '粉色', unit: '台', quantity: 150, price: 5999.0, amount: 899850.0 },
        { no: 5, code: 'PRD-005', name: 'MacBook Pro 14 M3', spec: '16GB/512GB', unit: '台', quantity: 45, price: 15999.0, amount: 719955.0 },
        { no: 6, code: 'PRD-006', name: 'MacBook Pro 16 M3 Max', spec: '32GB/1TB', unit: '台', quantity: 28, price: 25999.0, amount: 727972.0 },
        { no: 7, code: 'PRD-007', name: 'MacBook Air 15 M2', spec: '16GB/512GB', unit: '台', quantity: 67, price: 10999.0, amount: 736933.0 },
        { no: 8, code: 'PRD-008', name: 'MacBook Air 13 M2', spec: '8GB/256GB', unit: '台', quantity: 92, price: 7999.0, amount: 735908.0 },
        { no: 9, code: 'PRD-009', name: 'iPad Pro 12.9 M2', spec: '256GB WiFi', unit: '台', quantity: 55, price: 8799.0, amount: 483945.0 },
        { no: 10, code: 'PRD-010', name: 'iPad Air 10.9 M1', spec: '256GB WiFi', unit: '台', quantity: 78, price: 4799.0, amount: 374322.0 },
        { no: 11, code: 'PRD-011', name: 'iPad 10.9 第10代', spec: '64GB WiFi', unit: '台', quantity: 110, price: 2999.0, amount: 329890.0 },
        { no: 12, code: 'PRD-012', name: 'AirPods Pro 2', spec: 'USB-C', unit: '个', quantity: 200, price: 1899.0, amount: 379800.0 },
        { no: 13, code: 'PRD-013', name: 'AirPods 3', spec: '闪电接口', unit: '个', quantity: 156, price: 1399.0, amount: 218244.0 },
        { no: 14, code: 'PRD-014', name: 'AirPods 2', spec: '有线充电盒', unit: '个', quantity: 134, price: 899.0, amount: 120466.0 },
        { no: 15, code: 'PRD-015', name: 'Apple Watch Series 9', spec: '45mm GPS', unit: '个', quantity: 88, price: 3199.0, amount: 281512.0 },
        { no: 16, code: 'PRD-016', name: 'Apple Watch SE 2', spec: '44mm GPS', unit: '个', quantity: 102, price: 1999.0, amount: 203898.0 },
        { no: 17, code: 'PRD-017', name: 'Apple Pencil 2', spec: '第二代', unit: '支', quantity: 145, price: 969.0, amount: 140505.0 },
        { no: 18, code: 'PRD-018', name: 'Magic Keyboard', spec: '含触控板', unit: '个', quantity: 68, price: 899.0, amount: 61132.0 },
        { no: 19, code: 'PRD-019', name: 'Magic Mouse', spec: '黑色', unit: '个', quantity: 92, price: 649.0, amount: 59708.0 },
        { no: 20, code: 'PRD-020', name: 'Magic Trackpad', spec: '白色', unit: '个', quantity: 54, price: 849.0, amount: 45846.0 },
        { no: 21, code: 'PRD-021', name: 'HomePod mini', spec: '深空灰', unit: '台', quantity: 76, price: 749.0, amount: 56924.0 },
        { no: 22, code: 'PRD-022', name: 'AirTag', spec: '4个装', unit: '盒', quantity: 95, price: 769.0, amount: 73055.0 },
        { no: 23, code: 'PRD-023', name: 'Apple TV 4K', spec: '128GB WiFi', unit: '台', quantity: 42, price: 1449.0, amount: 60858.0 },
        { no: 24, code: 'PRD-024', name: 'MagSafe 充电器', spec: '官方认证', unit: '个', quantity: 188, price: 329.0, amount: 61852.0 },
        { no: 25, code: 'PRD-025', name: '20W USB-C 电源适配器', spec: '官方原装', unit: '个', quantity: 245, price: 149.0, amount: 36505.0 },
        { no: 26, code: 'PRD-026', name: '雷4 Pro 连接线', spec: '1.8米', unit: '根', quantity: 67, price: 949.0, amount: 63583.0 },
        { no: 27, code: 'PRD-027', name: 'USB-C 转闪电连接线', spec: '1米', unit: '根', quantity: 156, price: 145.0, amount: 22620.0 },
        { no: 28, code: 'PRD-028', name: 'iPhone 硅胶保护壳', spec: '多色可选', unit: '个', quantity: 234, price: 399.0, amount: 93366.0 },
        { no: 29, code: 'PRD-029', name: 'iPad 智能双面夹', spec: '深海蓝', unit: '个', quantity: 87, price: 569.0, amount: 49503.0 },
        { no: 30, code: 'PRD-030', name: 'Mac Studio M2 Ultra', spec: '64GB/1TB', unit: '台', quantity: 12, price: 33999.0, amount: 407988.0 },
        { no: 31, code: 'PRD-001', name: 'iPhone 15 Pro Max 256GB', spec: '深空黑', unit: '台', quantity: 120, price: 9999.0, amount: 1199880.0 },
        { no: 32, code: 'PRD-002', name: 'iPhone 15 Pro 256GB', spec: '原色钛金属', unit: '台', quantity: 85, price: 8999.0, amount: 764915.0 },
        { no: 33, code: 'PRD-003', name: 'iPhone 15 Plus 256GB', spec: '黑色', unit: '台', quantity: 95, price: 6999.0, amount: 664905.0 },
        { no: 34, code: 'PRD-004', name: 'iPhone 15 128GB', spec: '粉色', unit: '台', quantity: 150, price: 5999.0, amount: 899850.0 },
        { no: 35, code: 'PRD-005', name: 'MacBook Pro 14 M3', spec: '16GB/512GB', unit: '台', quantity: 45, price: 15999.0, amount: 719955.0 },
        { no: 36, code: 'PRD-006', name: 'MacBook Pro 16 M3 Max', spec: '32GB/1TB', unit: '台', quantity: 28, price: 25999.0, amount: 727972.0 },
        { no: 37, code: 'PRD-007', name: 'MacBook Air 15 M2', spec: '16GB/512GB', unit: '台', quantity: 67, price: 10999.0, amount: 736933.0 },
        { no: 38, code: 'PRD-008', name: 'MacBook Air 13 M2', spec: '8GB/256GB', unit: '台', quantity: 92, price: 7999.0, amount: 735908.0 },
        { no: 39, code: 'PRD-009', name: 'iPad Pro 12.9 M2', spec: '256GB WiFi', unit: '台', quantity: 55, price: 8799.0, amount: 483945.0 },
        { no: 40, code: 'PRD-010', name: 'iPad Air 10.9 M1', spec: '256GB WiFi', unit: '台', quantity: 78, price: 4799.0, amount: 374322.0 },
        { no: 41, code: 'PRD-011', name: 'iPad 10.9 第10代', spec: '64GB WiFi', unit: '台', quantity: 110, price: 2999.0, amount: 329890.0 },
        { no: 42, code: 'PRD-012', name: 'AirPods Pro 2', spec: 'USB-C', unit: '个', quantity: 200, price: 1899.0, amount: 379800.0 },
        { no: 43, code: 'PRD-013', name: 'AirPods 3', spec: '闪电接口', unit: '个', quantity: 156, price: 1399.0, amount: 218244.0 },
        { no: 44, code: 'PRD-014', name: 'AirPods 2', spec: '有线充电盒', unit: '个', quantity: 134, price: 899.0, amount: 120466.0 },
        { no: 45, code: 'PRD-015', name: 'Apple Watch Series 9', spec: '45mm GPS', unit: '个', quantity: 88, price: 3199.0, amount: 281512.0 },
        { no: 46, code: 'PRD-016', name: 'Apple Watch SE 2', spec: '44mm GPS', unit: '个', quantity: 102, price: 1999.0, amount: 203898.0 },
        { no: 47, code: 'PRD-017', name: 'Apple Pencil 2', spec: '第二代', unit: '支', quantity: 145, price: 969.0, amount: 140505.0 },
        { no: 48, code: 'PRD-018', name: 'Magic Keyboard', spec: '含触控板', unit: '个', quantity: 68, price: 899.0, amount: 61132.0 },
        { no: 49, code: 'PRD-019', name: 'Magic Mouse', spec: '黑色', unit: '个', quantity: 92, price: 649.0, amount: 59708.0 },
        { no: 50, code: 'PRD-020', name: 'Magic Trackpad', spec: '白色', unit: '个', quantity: 54, price: 849.0, amount: 45846.0 },
        { no: 51, code: 'PRD-021', name: 'HomePod mini', spec: '深空灰', unit: '台', quantity: 76, price: 749.0, amount: 56924.0 },
        { no: 52, code: 'PRD-022', name: 'AirTag', spec: '4个装', unit: '盒', quantity: 95, price: 769.0, amount: 73055.0 },
        { no: 53, code: 'PRD-023', name: 'Apple TV 4K', spec: '128GB WiFi', unit: '台', quantity: 42, price: 1449.0, amount: 60858.0 },
        { no: 54, code: 'PRD-024', name: 'MagSafe 充电器', spec: '官方认证', unit: '个', quantity: 188, price: 329.0, amount: 61852.0 },
        { no: 55, code: 'PRD-025', name: '20W USB-C 电源适配器', spec: '官方原装', unit: '个', quantity: 245, price: 149.0, amount: 36505.0 },
        { no: 56, code: 'PRD-026', name: '雷4 Pro 连接线', spec: '1.8米', unit: '根', quantity: 67, price: 949.0, amount: 63583.0 },
        { no: 57, code: 'PRD-027', name: 'USB-C 转闪电连接线', spec: '1米', unit: '根', quantity: 156, price: 145.0, amount: 22620.0 },
        { no: 58, code: 'PRD-028', name: 'iPhone 硅胶保护壳', spec: '多色可选', unit: '个', quantity: 234, price: 399.0, amount: 93366.0 },
        { no: 59, code: 'PRD-029', name: 'iPad 智能双面夹', spec: '深海蓝', unit: '个', quantity: 87, price: 569.0, amount: 49503.0 },
        { no: 60, code: 'PRD-030', name: 'Mac Studio M2 Ultra', spec: '64GB/1TB', unit: '台', quantity: 12, price: 33999.0, amount: 407988.0 },
        { no: 61, code: 'PRD-001', name: 'iPhone 15 Pro Max 256GB', spec: '深空黑', unit: '台', quantity: 120, price: 9999.0, amount: 1199880.0 }
      ],
      summary: { totalQuantity: 3090, totalAmount: 12856780.5, discount: 500000.0, tax: 1542813.66, finalAmount: 13899594.16 },
      remarks: '本月销售业绩创历史新高，感谢全体销售人员的辛勤付出！',
      operator: '系统自动生成',
      reviewer: '财务部'
    }
  },
  {
    id: 'mock-sales-003',
    name: '简单测试单 - 最小数据集',
    schemaId: 'schema-demo-sales',
    description: '系统内置示例数据 - 最小化数据集，用于快速测试',
    data: {
      title: '简单测试单',
      subtitle: 'Simple Test',
      companyName: '测试公司',
      companyAddress: '测试地址',
      documentNo: 'T001',
      createdDate: '2024-01-15',
      createdTime: '2024-01-15T10:00:00',
      amount: 100.0,
      status: 'pending',
      qrCodeUrl: 'https://test.com',
      barcode: '123456',
      logoUrl: '',
      signatureUrl: '',
      customer: { name: '客户A', contact: '张三', phone: '12345678901', email: 'test@test.com', address: '北京' },
      items: [{ no: 1, code: 'A1', name: '商品1', spec: '默认', unit: '个', quantity: 1, price: 100.0, amount: 100.0 }],
      summary: { totalQuantity: 1, totalAmount: 100.0, discount: 0.0, tax: 0.0, finalAmount: 100.0 },
      remarks: '无',
      operator: '测试员',
      reviewer: ''
    }
  },
  {
    id: 'mock-batch-001',
    name: '批量打印测试数据 - 5份订单',
    schemaId: 'schema-demo-sales',
    description: '系统内置示例数据 - 用于测试批量打印功能，包含5份不同的订单',
    data: [
      {
        title: '销售出库单',
        subtitle: 'SALES DELIVERY NOTE',
        companyName: '深圳市示例科技有限公司',
        companyAddress: '广东省深圳市南山区科技园南区深南大道10000号',
        documentNo: 'SO202401150001',
        createdDate: '2024-01-15',
        createdTime: '2024-01-15T14:30:00',
        amount: 15800.5,
        status: 'completed',
        qrCodeUrl: 'https://www.example.com/delivery/SO202401150001',
        barcode: 'SO202401150001',
        customer: {
          name: '北京天河商贸有限公司',
          contact: '张经理',
          phone: '13800138000',
          email: 'zhang@tianhe.com',
          address: '北京市朝阳区建国门外大街1号国贸大厦A座2001室'
        },
        items: [
          { no: 1, code: 'PRD-001', name: 'iPhone 15 Pro Max 256GB', spec: '深空黑', unit: '台', quantity: 120, price: 9999.0, amount: 1199880.0 },
          { no: 2, code: 'PRD-002', name: 'iPhone 15 Pro 256GB', spec: '原色钛金属', unit: '台', quantity: 85, price: 8999.0, amount: 764915.0 },
          { no: 3, code: 'PRD-003', name: 'iPhone 15 Plus 256GB', spec: '黑色', unit: '台', quantity: 95, price: 6999.0, amount: 664905.0 },
          { no: 4, code: 'PRD-004', name: 'iPhone 15 128GB', spec: '粉色', unit: '台', quantity: 150, price: 5999.0, amount: 899850.0 },
          { no: 5, code: 'PRD-005', name: 'MacBook Pro 14 M3', spec: '16GB/512GB', unit: '台', quantity: 45, price: 15999.0, amount: 719955.0 },
          { no: 6, code: 'PRD-006', name: 'MacBook Pro 16 M3 Max', spec: '32GB/1TB', unit: '台', quantity: 28, price: 25999.0, amount: 727972.0 },
          { no: 7, code: 'PRD-007', name: 'MacBook Air 15 M2', spec: '16GB/512GB', unit: '台', quantity: 67, price: 10999.0, amount: 736933.0 },
          { no: 8, code: 'PRD-008', name: 'MacBook Air 13 M2', spec: '8GB/256GB', unit: '台', quantity: 92, price: 7999.0, amount: 735908.0 },
          { no: 9, code: 'PRD-009', name: 'iPad Pro 12.9 M2', spec: '256GB WiFi', unit: '台', quantity: 55, price: 8799.0, amount: 483945.0 },
          { no: 10, code: 'PRD-010', name: 'iPad Air 10.9 M1', spec: '256GB WiFi', unit: '台', quantity: 78, price: 4799.0, amount: 374322.0 },
          { no: 11, code: 'PRD-011', name: 'iPad 10.9 第10代', spec: '64GB WiFi', unit: '台', quantity: 110, price: 2999.0, amount: 329890.0 },
          { no: 12, code: 'PRD-012', name: 'AirPods Pro 2', spec: 'USB-C', unit: '个', quantity: 200, price: 1899.0, amount: 379800.0 },
          { no: 13, code: 'PRD-013', name: 'AirPods 3', spec: '闪电接口', unit: '个', quantity: 156, price: 1399.0, amount: 218244.0 },
          { no: 14, code: 'PRD-014', name: 'AirPods 2', spec: '有线充电盒', unit: '个', quantity: 134, price: 899.0, amount: 120466.0 },
          { no: 15, code: 'PRD-015', name: 'Apple Watch Series 9', spec: '45mm GPS', unit: '个', quantity: 88, price: 3199.0, amount: 281512.0 },
          { no: 16, code: 'PRD-016', name: 'Apple Watch SE 2', spec: '44mm GPS', unit: '个', quantity: 102, price: 1999.0, amount: 203898.0 },
          { no: 17, code: 'PRD-017', name: 'Apple Pencil 2', spec: '第二代', unit: '支', quantity: 145, price: 969.0, amount: 140505.0 },
          { no: 18, code: 'PRD-018', name: 'Magic Keyboard', spec: '含触控板', unit: '个', quantity: 68, price: 899.0, amount: 61132.0 },
          { no: 19, code: 'PRD-019', name: 'Magic Mouse', spec: '黑色', unit: '个', quantity: 92, price: 649.0, amount: 59708.0 },
          { no: 20, code: 'PRD-020', name: 'Magic Trackpad', spec: '白色', unit: '个', quantity: 54, price: 849.0, amount: 45846.0 },
          { no: 21, code: 'PRD-021', name: 'HomePod mini', spec: '深空灰', unit: '台', quantity: 76, price: 749.0, amount: 56924.0 },
          { no: 22, code: 'PRD-022', name: 'AirTag', spec: '4个装', unit: '盒', quantity: 95, price: 769.0, amount: 73055.0 },
          { no: 23, code: 'PRD-023', name: 'Apple TV 4K', spec: '128GB WiFi', unit: '台', quantity: 42, price: 1449.0, amount: 60858.0 },
          { no: 24, code: 'PRD-024', name: 'MagSafe 充电器', spec: '官方认证', unit: '个', quantity: 188, price: 329.0, amount: 61852.0 },
          { no: 25, code: 'PRD-025', name: '20W USB-C 电源适配器', spec: '官方原装', unit: '个', quantity: 245, price: 149.0, amount: 36505.0 },
          { no: 26, code: 'PRD-026', name: '雷4 Pro 连接线', spec: '1.8米', unit: '根', quantity: 67, price: 949.0, amount: 63583.0 },
          { no: 27, code: 'PRD-027', name: 'USB-C 转闪电连接线', spec: '1米', unit: '根', quantity: 156, price: 145.0, amount: 22620.0 },
          { no: 28, code: 'PRD-028', name: 'iPhone 硅胶保护壳', spec: '多色可选', unit: '个', quantity: 234, price: 399.0, amount: 93366.0 },
          { no: 29, code: 'PRD-029', name: 'iPad 智能双面夹', spec: '深海蓝', unit: '个', quantity: 87, price: 569.0, amount: 49503.0 },
          { no: 30, code: 'PRD-030', name: 'Mac Studio M2 Ultra', spec: '64GB/1TB', unit: '台', quantity: 12, price: 33999.0, amount: 407988.0 },
          { no: 31, code: 'PRD-001', name: 'iPhone 15 Pro Max 256GB', spec: '深空黑', unit: '台', quantity: 120, price: 9999.0, amount: 1199880.0 },
          { no: 32, code: 'PRD-002', name: 'iPhone 15 Pro 256GB', spec: '原色钛金属', unit: '台', quantity: 85, price: 8999.0, amount: 764915.0 },
          { no: 33, code: 'PRD-003', name: 'iPhone 15 Plus 256GB', spec: '黑色', unit: '台', quantity: 95, price: 6999.0, amount: 664905.0 },
          { no: 34, code: 'PRD-004', name: 'iPhone 15 128GB', spec: '粉色', unit: '台', quantity: 150, price: 5999.0, amount: 899850.0 },
          { no: 35, code: 'PRD-005', name: 'MacBook Pro 14 M3', spec: '16GB/512GB', unit: '台', quantity: 45, price: 15999.0, amount: 719955.0 },
          { no: 36, code: 'PRD-006', name: 'MacBook Pro 16 M3 Max', spec: '32GB/1TB', unit: '台', quantity: 28, price: 25999.0, amount: 727972.0 },
          { no: 37, code: 'PRD-007', name: 'MacBook Air 15 M2', spec: '16GB/512GB', unit: '台', quantity: 67, price: 10999.0, amount: 736933.0 },
          { no: 38, code: 'PRD-008', name: 'MacBook Air 13 M2', spec: '8GB/256GB', unit: '台', quantity: 92, price: 7999.0, amount: 735908.0 },
          { no: 39, code: 'PRD-009', name: 'iPad Pro 12.9 M2', spec: '256GB WiFi', unit: '台', quantity: 55, price: 8799.0, amount: 483945.0 },
          { no: 40, code: 'PRD-010', name: 'iPad Air 10.9 M1', spec: '256GB WiFi', unit: '台', quantity: 78, price: 4799.0, amount: 374322.0 },
          { no: 41, code: 'PRD-011', name: 'iPad 10.9 第10代', spec: '64GB WiFi', unit: '台', quantity: 110, price: 2999.0, amount: 329890.0 },
          { no: 42, code: 'PRD-012', name: 'AirPods Pro 2', spec: 'USB-C', unit: '个', quantity: 200, price: 1899.0, amount: 379800.0 },
          { no: 43, code: 'PRD-013', name: 'AirPods 3', spec: '闪电接口', unit: '个', quantity: 156, price: 1399.0, amount: 218244.0 },
          { no: 44, code: 'PRD-014', name: 'AirPods 2', spec: '有线充电盒', unit: '个', quantity: 134, price: 899.0, amount: 120466.0 },
          { no: 45, code: 'PRD-015', name: 'Apple Watch Series 9', spec: '45mm GPS', unit: '个', quantity: 88, price: 3199.0, amount: 281512.0 },
          { no: 46, code: 'PRD-016', name: 'Apple Watch SE 2', spec: '44mm GPS', unit: '个', quantity: 102, price: 1999.0, amount: 203898.0 },
          { no: 47, code: 'PRD-017', name: 'Apple Pencil 2', spec: '第二代', unit: '支', quantity: 145, price: 969.0, amount: 140505.0 },
          { no: 48, code: 'PRD-018', name: 'Magic Keyboard', spec: '含触控板', unit: '个', quantity: 68, price: 899.0, amount: 61132.0 },
          { no: 49, code: 'PRD-019', name: 'Magic Mouse', spec: '黑色', unit: '个', quantity: 92, price: 649.0, amount: 59708.0 },
          { no: 50, code: 'PRD-020', name: 'Magic Trackpad', spec: '白色', unit: '个', quantity: 54, price: 849.0, amount: 45846.0 },
          { no: 51, code: 'PRD-021', name: 'HomePod mini', spec: '深空灰', unit: '台', quantity: 76, price: 749.0, amount: 56924.0 },
          { no: 52, code: 'PRD-022', name: 'AirTag', spec: '4个装', unit: '盒', quantity: 95, price: 769.0, amount: 73055.0 },
          { no: 53, code: 'PRD-023', name: 'Apple TV 4K', spec: '128GB WiFi', unit: '台', quantity: 42, price: 1449.0, amount: 60858.0 },
          { no: 54, code: 'PRD-024', name: 'MagSafe 充电器', spec: '官方认证', unit: '个', quantity: 188, price: 329.0, amount: 61852.0 },
          { no: 55, code: 'PRD-025', name: '20W USB-C 电源适配器', spec: '官方原装', unit: '个', quantity: 245, price: 149.0, amount: 36505.0 },
          { no: 56, code: 'PRD-026', name: '雷4 Pro 连接线', spec: '1.8米', unit: '根', quantity: 67, price: 949.0, amount: 63583.0 },
        ],
        summary: { totalQuantity: 8, totalAmount: 97992.0, discount: 1000.0, tax: 11639.04, finalAmount: 108631.04 },
        remarks: '请核对商品数量和规格',
        operator: '李明',
        reviewer: '王芳'
      },
      {
        title: '销售出库单',
        subtitle: 'SALES DELIVERY NOTE',
        companyName: '深圳市示例科技有限公司',
        companyAddress: '广东省深圳市南山区科技园南区深南大道10000号',
        documentNo: 'SO202401150002',
        createdDate: '2024-01-15',
        createdTime: '2024-01-15T15:00:00',
        amount: 28990.0,
        status: 'completed',
        qrCodeUrl: 'https://www.example.com/delivery/SO202401150002',
        barcode: 'SO202401150002',
        customer: {
          name: '上海华盛贸易有限公司',
          contact: '李总',
          phone: '13900139000',
          email: 'li@huasheng.com',
          address: '上海市浦东新区世纪大道8号'
        },
        items: [
          { no: 1, code: 'PRD-003', name: 'AirPods Pro 2', spec: 'USB-C 充电盒', unit: '个', quantity: 10, price: 1899.0, amount: 18990.0 },
          { no: 2, code: 'PRD-004', name: 'Magic Keyboard', spec: '妙控键盘 含触控板', unit: '个', quantity: 8, price: 899.0, amount: 7192.0 },
          { no: 3, code: 'PRD-005', name: 'Magic Mouse', spec: '妙控鼠标 黑色', unit: '个', quantity: 4, price: 649.0, amount: 2596.0 }
        ],
        summary: { totalQuantity: 22, totalAmount: 28778.0, discount: 500.0, tax: 3393.36, finalAmount: 31671.36 },
        remarks: '紧急订单，请优先处理',
        operator: '张伟',
        reviewer: '赵敏'
      },
      {
        title: '销售出库单',
        subtitle: 'SALES DELIVERY NOTE',
        companyName: '深圳市示例科技有限公司',
        companyAddress: '广东省深圳市南山区科技园南区深南大道10000号',
        documentNo: 'SO202401150003',
        createdDate: '2024-01-15',
        createdTime: '2024-01-15T16:00:00',
        amount: 52995.0,
        status: 'pending',
        qrCodeUrl: 'https://www.example.com/delivery/SO202401150003',
        barcode: 'SO202401150003',
        customer: {
          name: '广州博瑞科技有限公司',
          contact: '陈总',
          phone: '13700137000',
          email: 'chen@borui.com',
          address: '广东省广州市天河区珠江新城科技园'
        },
        items: [
          { no: 1, code: 'PRD-006', name: 'iPad Pro 12.9', spec: 'M2 256GB', unit: '台', quantity: 6, price: 8799.0, amount: 52794.0 }
        ],
        summary: { totalQuantity: 6, totalAmount: 52794.0, discount: 800.0, tax: 6239.28, finalAmount: 58233.28 },
        remarks: '大客户订单',
        operator: '吴明',
        reviewer: '周芳'
      },
      {
        title: '销售出库单',
        subtitle: 'SALES DELIVERY NOTE',
        companyName: '深圳市示例科技有限公司',
        companyAddress: '广东省深圳市南山区科技园南区深南大道10000号',
        documentNo: 'SO202401150004',
        createdDate: '2024-01-15',
        createdTime: '2024-01-15T17:00:00',
        amount: 16495.0,
        status: 'completed',
        qrCodeUrl: 'https://www.example.com/delivery/SO202401150004',
        barcode: 'SO202401150004',
        customer: {
          name: '杭州云达网络有限公司',
          contact: '郑经理',
          phone: '13600136000',
          email: 'zheng@yunda.com',
          address: '浙江省杭州市滨江区网商路599号'
        },
        items: [
          { no: 1, code: 'PRD-007', name: 'Apple Watch Series 9', spec: '45mm GPS', unit: '个', quantity: 5, price: 3199.0, amount: 15995.0 }
        ],
        summary: { totalQuantity: 5, totalAmount: 15995.0, discount: 500.0, tax: 1859.4, finalAmount: 17354.4 },
        remarks: '常规订单',
        operator: '黄娜',
        reviewer: '张强'
      },
      {
        title: '销售出库单',
        subtitle: 'SALES DELIVERY NOTE',
        companyName: '深圳市示例科技有限公司',
        companyAddress: '广东省深圳市南山区科技园南区深南大道10000号',
        documentNo: 'SO202401150005',
        createdDate: '2024-01-15',
        createdTime: '2024-01-15T18:00:00',
        amount: 9597.0,
        status: 'completed',
        qrCodeUrl: 'https://www.example.com/delivery/SO202401150005',
        barcode: 'SO202401150005',
        customer: {
          name: '成都智慧信息有限公司',
          contact: '刘总',
          phone: '13500135000',
          email: 'liu@zhihui.com',
          address: '四川省成都市高新区天府软件园'
        },
        items: [
          { no: 1, code: 'PRD-008', name: 'HomePod mini', spec: '智能音箱', unit: '台', quantity: 12, price: 749.0, amount: 8988.0 }
        ],
        summary: { totalQuantity: 12, totalAmount: 8988.0, discount: 100.0, tax: 1066.56, finalAmount: 9954.56 },
        remarks: '小额订单',
        operator: '孙丽',
        reviewer: '马军'
      }
    ]
  },
  {
    id: 'mock-nested-order-001',
    name: '采购订单 - 嵌套对象演示',
    schemaId: 'schema-demo-order-nested',
    description: '演示表格列使用嵌套路径（如 product.name）的数据，每行 items 中包含嵌套的 product 对象',
    data: {
      title: '采购订单',
      orderNo: 'PO202401150001',
      orderDate: '2024-01-15',
      supplier: {
        name: '深圳华芯电子科技有限公司',
        contact: '李工',
        phone: '0755-86001234'
      },
      items: [
        {
          no: 1,
          product: { name: 'STM32F407 微控制器', code: 'MCU-001', category: '芯片' },
          quantity: 500,
          price: 28.50,
          amount: 14250.00
        },
        {
          no: 2,
          product: { name: '0.96寸 OLED 显示屏', code: 'DSP-012', category: '显示屏' },
          quantity: 200,
          price: 15.80,
          amount: 3160.00
        },
        {
          no: 3,
          product: { name: 'ESP32-WROOM-32D 模组', code: 'MOD-007', category: '模组' },
          quantity: 300,
          price: 22.00,
          amount: 6600.00
        },
        {
          no: 4,
          product: { name: 'Type-C USB 连接器', code: 'CON-033', category: '连接器' },
          quantity: 1000,
          price: 1.20,
          amount: 1200.00
        },
        {
          no: 5,
          product: { name: 'LM2596 降压模块', code: 'MOD-021', category: '模组' },
          quantity: 150,
          price: 6.50,
          amount: 975.00
        }
      ],
      summary: { totalAmount: 26185.00, finalAmount: 26185.00 },
      remarks: '嵌套对象路径测试：表格列使用 product.name、product.code、product.category 等 dataIndex'
    }
  }
];
