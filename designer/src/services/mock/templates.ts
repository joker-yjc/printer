import type { PrintTemplate } from '../../types';

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
      },
      "headerEnabled": true,
      "footerEnabled": false
    },
    "layoutMode": "absolute",
    "components": [
      {
        "id": "line1",
        "type": "line",
        "layout": { "mode": "absolute", "xMm": 10, "yMm": 5, "widthMm": 190, "heightMm": 2 },
        "style": { "borderTopWidth": 1, "borderTopStyle": "solid", "borderTopColor": "#000000" },
        "props": { "direction": "horizontal" }
      },
      {
        "id": "documentNo",
        "type": "text",
        "layout": { "mode": "absolute", "xMm": 10, "yMm": 10, "widthMm": 80, "heightMm": 8 },
        "style": { "fontSize": 12 },
        "binding": { "path": "documentNo", "fallback": "ORD-" },
        "props": { "label": "订单编号：" }
      },
      {
        "id": "createdDate",
        "type": "text",
        "layout": { "mode": "absolute", "xMm": 120, "yMm": 10, "widthMm": 80, "heightMm": 8 },
        "style": { "fontSize": 12, "textAlign": "right" },
        "binding": {
          "path": "createdDate",
          "pipes": [{ "type": "date", "options": { "format": "YYYY-MM-DD HH:mm" } }],
          "fallback": "2024-01-22"
        },
        "props": { "label": "日期：" }
      },
      {
        "id": "orderBarcode",
        "type": "barcode",
        "layout": { "mode": "absolute", "xMm": 10, "yMm": 20, "widthMm": 60, "heightMm": 12 },
        "binding": { "path": "barcode", "fallback": "ORD202401220001" },
        "props": { "format": "CODE128" }
      },
      {
        "id": "customerTitle",
        "type": "text",
        "layout": { "mode": "absolute", "xMm": 10, "yMm": 35, "widthMm": 40, "heightMm": 8 },
        "style": { "fontSize": 14, "fontWeight": "bold" },
        "binding": { "fallback": "客户信息" },
        "props": { "text": "收件人信息" }
      },
      {
        "id": "customerName",
        "type": "text",
        "layout": { "mode": "absolute", "xMm": 10, "yMm": 45, "widthMm": 80, "heightMm": 6 },
        "style": { "fontSize": 11 },
        "binding": { "path": "customer.name", "fallback": "客户名称" },
        "props": { "label": "姓名：" }
      },
      {
        "id": "customerPhone",
        "type": "text",
        "layout": { "mode": "absolute", "xMm": 10, "yMm": 55, "widthMm": 80, "heightMm": 6 },
        "style": { "fontSize": 11 },
        "binding": { "path": "customer.phone", "fallback": "138****8888" },
        "props": { "label": "电话：" }
      },
      {
        "id": "customerAddress",
        "type": "text",
        "layout": { "mode": "absolute", "xMm": 10, "yMm": 65, "widthMm": 100, "heightMm": 10 },
        "style": { "fontSize": 11 },
        "binding": { "path": "customer.address", "fallback": "收货地址" },
        "props": { "label": "地址：" }
      },
      {
        "id": "qrcode",
        "type": "qrcode",
        "layout": { "mode": "absolute", "xMm": 165, "yMm": 25, "widthMm": 35, "heightMm": 35 },
        "binding": { "path": "qrCodeUrl", "fallback": "https://example.com/order/12345" },
        "props": { "content": "" }
      },
      {
        "id": "line2",
        "type": "line",
        "layout": { "mode": "absolute", "xMm": 10, "yMm": 75, "widthMm": 190, "heightMm": 2 },
        "style": { "borderTopWidth": 1, "borderTopStyle": "dashed", "borderTopColor": "#999999" },
        "props": { "direction": "horizontal" }
      },
      {
        "id": "itemsTable",
        "type": "table",
        "layout": { "mode": "absolute", "xMm": 10, "yMm": 80, "widthMm": 190, "heightMm": 80 },
        "style": { "fontSize": 10, "textAlign": "center" },
        "binding": { "path": "items" },
        "props": {
          "bordered": true,
          "showHeader": true,
          "columns": [
            { "dataIndex": "name", "title": "商品名称", "width": 60 },
            { "dataIndex": "spec", "title": "规格", "width": 40 },
            { "dataIndex": "quantity", "title": "数量", "width": 30 },
            { "dataIndex": "price", "title": "单价", "width": 30 },
            { "dataIndex": "amount", "title": "金额", "width": 30 }
          ]
        }
      },
      {
        "id": "totalAmount",
        "type": "text",
        "layout": { "mode": "absolute", "xMm": 140, "yMm": 165, "widthMm": 60, "heightMm": 8 },
        "style": { "fontSize": 14, "fontWeight": "bold", "textAlign": "right" },
        "binding": {
          "path": "summary.finalAmount",
          "pipes": [{ "type": "currency", "options": {} }],
          "fallback": "￥0.00"
        },
        "props": { "label": "合计：" }
      },
      {
        "id": "remarks",
        "type": "text",
        "layout": { "mode": "absolute", "xMm": 10, "yMm": 175, "widthMm": 190, "heightMm": 25 },
        "style": { "fontSize": 10 },
        "binding": { "path": "remarks", "fallback": "备注信息" },
        "props": { "label": "备注：" }
      },
      {
        "id": "comp-signature",
        "type": "text",
        "layout": { "mode": "absolute", "xMm": 10, "yMm": 200, "widthMm": 15, "heightMm": 10 },
        "style": { "fontSize": 14, "color": "#262626" },
        "props": { "text": "签名：" }
      },
      {
        "id": "customerRect",
        "type": "rect",
        "layout": { "mode": "absolute", "xMm": 25, "yMm": 200, "widthMm": 85, "heightMm": 20 },
        "style": { "border": "1px solid #d9d9d9", "borderRadius": "2px", "background": "#fafafa" },
        "props": {}
      },
      {
        "id": "companyLogo",
        "type": "image",
        "layout": { "mode": "absolute", "xMm": 10, "yMm": 225, "widthMm": 35, "heightMm": 15 },
        "binding": { "path": "companyLogo", "fallback": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzE4OTBmZiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TE9HTzwvdGV4dD48L3N2Zz4=" },
        "props": { "fit": "contain" }
      }
    ],
    "headerComponents": [
      {
        "id": "title",
        "type": "text",
        "layout": { "mode": "absolute", "xMm": 75, "yMm": 0, "widthMm": 60, "heightMm": 10 },
        "style": { "fontSize": 20, "fontWeight": "bold", "textAlign": "center" },
        "binding": { "path": "title", "fallback": "订单打印" },
        "props": {}
      }
    ],
    "footerComponents": [],
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
    description: '工业产品标签示例，小尺寸标签（5x6cm），包含产品名称、条形码、规格信息',
    schemaId: 'schema-demo-sales',
    page: {
      size: 'CUSTOM',
      widthMm: 60,
      heightMm: 50,
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
        layout: { mode: 'absolute', xMm: 2, yMm: 32, widthMm: 56, heightMm: 4 },
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
              "headerComponents": [
                {
                  "id": "header-orderNo",
                  "type": "text",
                  "layout": { "mode": "absolute", "xMm": 10, "yMm": 5, "widthMm": 100, "heightMm": 10 },
                  "style": { "fontSize": 12, "fontWeight": "bold" },
                  "binding": { "path": "order.documentNo", "fallback": "订单编号" }
                },
                {
                  "id": "header-date",
                  "type": "text",
                  "layout": { "mode": "absolute", "xMm": 130, "yMm": 5, "widthMm": 60, "heightMm": 10 },
                  "style": { "fontSize": 10, "textAlign": "right" },
                  "binding": { "path": "order.date", "fallback": "日期" }
                }
              ],
              "footerComponents": [
                {
                  "id": "footer-sign",
                  "type": "text",
                  "layout": { "mode": "absolute", "xMm": 10, "yMm": 5, "widthMm": 180, "heightMm": 10 },
                  "style": { "fontSize": 11 },
                  "props": { "text": "签收人：___________  日期：___________" }
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
  },
  {
    id: 'template-continuous-half',
    name: '二分纸模板（连续纸）',
    version: '1.0',
    description: '二分纸打印模板，自定义纸张 241mm × 140mm，方便根据内容拆单打印',
    schemaId: 'schema-demo-sales',
    page: {
      size: 'CUSTOM',
      widthMm: 241,
      heightMm: 140,
      orientation: 'portrait',
      marginMm: { top: 5, right: 16, bottom: 5, left: 16 }
    },
    layoutMode: 'absolute',
    components: [
      {
        id: 'title',
        type: 'text',
        layout: { mode: 'absolute', xMm: 16, yMm: 5, widthMm: 209, heightMm: 10 },
        style: { fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
        binding: { path: 'title', fallback: '销售出库单' },
        props: {}
      },
      {
        id: 'line1',
        type: 'line',
        layout: { mode: 'absolute', xMm: 16, yMm: 17, widthMm: 209, heightMm: 2 },
        style: { borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: '#000000' },
        props: { direction: 'horizontal' }
      },
      {
        id: 'documentNo',
        type: 'text',
        layout: { mode: 'absolute', xMm: 16, yMm: 22, widthMm: 100, heightMm: 6 },
        style: { fontSize: 11 },
        binding: { path: 'documentNo', fallback: 'SO-' },
        props: { label: '单据编号：' }
      },
      {
        id: 'createdDate',
        type: 'text',
        layout: { mode: 'absolute', xMm: 125, yMm: 22, widthMm: 100, heightMm: 6 },
        style: { fontSize: 11, textAlign: 'right' },
        binding: {
          path: 'createdDate',
          pipes: [{ type: 'date', options: { format: 'YYYY-MM-DD' } }],
          fallback: '2024-01-15'
        },
        props: { label: '日期：' }
      },
      {
        id: 'customerName',
        type: 'text',
        layout: { mode: 'absolute', xMm: 16, yMm: 30, widthMm: 100, heightMm: 6 },
        style: { fontSize: 11 },
        binding: { path: 'customer.name', fallback: '客户名称' },
        props: { label: '客户：' }
      },
      {
        id: 'customerPhone',
        type: 'text',
        layout: { mode: 'absolute', xMm: 125, yMm: 30, widthMm: 100, heightMm: 6 },
        style: { fontSize: 11, textAlign: 'right' },
        binding: { path: 'customer.phone', fallback: '138****0000' },
        props: { label: '电话：' }
      },
      {
        id: 'line2',
        type: 'line',
        layout: { mode: 'absolute', xMm: 16, yMm: 38, widthMm: 209, heightMm: 2 },
        style: { borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: '#000000' },
        props: { direction: 'horizontal' }
      },
      {
        id: 'itemsTable',
        type: 'table',
        layout: { mode: 'absolute', xMm: 16, yMm: 42, widthMm: 209, heightMm: 60 },
        style: { fontSize: 10, textAlign: 'center' },
        binding: { path: 'items' },
        props: {
          bordered: true,
          showHeader: true,
          columns: [
            { dataIndex: 'code', title: '编码', width: 30 },
            { dataIndex: 'name', title: '名称', width: 70 },
            { dataIndex: 'spec', title: '规格' },
            { dataIndex: 'unit', title: '单位', width: 20 },
            { dataIndex: 'quantity', title: '数量' },
            { dataIndex: 'price', title: '单价' },
            { dataIndex: 'amount', title: '金额' }
          ]
        }
      },
      {
        id: 'totalAmount',
        type: 'text',
        layout: { mode: 'absolute', xMm: 144, yMm: 105, widthMm: 81, heightMm: 8 },
        style: { fontSize: 12, fontWeight: 'bold', textAlign: 'right' },
        binding: {
          path: 'summary.finalAmount',
          pipes: [{ type: 'currency', options: {} }],
          fallback: '¥0.00'
        },
        props: { label: '合计：' }
      },
      {
        id: 'remarks',
        type: 'text',
        layout: { mode: 'absolute', xMm: 16, yMm: 115, widthMm: 209, heightMm: 10 },
        style: { fontSize: 10 },
        binding: { path: 'remarks', fallback: '' },
        props: { label: '备注：' }
      },
      {
        id: 'operator',
        type: 'text',
        layout: { mode: 'absolute', xMm: 16, yMm: 124, widthMm: 100, heightMm: 6 },
        style: { fontSize: 10 },
        binding: { path: 'operator', fallback: '' },
        props: { label: '操作员：' }
      },
      {
        id: 'reviewer',
        type: 'text',
        layout: { mode: 'absolute', xMm: 125, yMm: 124, widthMm: 100, heightMm: 6 },
        style: { fontSize: 10, textAlign: 'right' },
        binding: { path: 'reviewer', fallback: '' },
        props: { label: '审核人：' }
      }
    ]
  },
  {
    id: 'template-a5-order',
    name: 'A5 订单模板',
    version: '1.0',
    description: 'A5 纸张模板（148mm × 210mm），纵向，包含标题、客户信息、明细表格和合计',
    schemaId: 'schema-demo-sales',
    page: {
      size: 'A5',
      orientation: 'portrait',
      marginMm: { top: 10, right: 10, bottom: 10, left: 10 }
    },
    layoutMode: 'absolute',
    components: [
      {
        id: 'title',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 10, widthMm: 128, heightMm: 10 },
        style: { fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
        binding: { path: 'title', fallback: '销售出库单' },
        props: {}
      },
      {
        id: 'line1',
        type: 'line',
        layout: { mode: 'absolute', xMm: 10, yMm: 23, widthMm: 128, heightMm: 2 },
        style: { borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: '#000000' },
        props: { direction: 'horizontal' }
      },
      {
        id: 'documentNo',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 28, widthMm: 60, heightMm: 6 },
        style: { fontSize: 10 },
        binding: { path: 'documentNo', fallback: 'SO-' },
        props: { label: '单号：' }
      },
      {
        id: 'createdDate',
        type: 'text',
        layout: { mode: 'absolute', xMm: 78, yMm: 28, widthMm: 60, heightMm: 6 },
        style: { fontSize: 10, textAlign: 'right' },
        binding: {
          path: 'createdDate',
          pipes: [{ type: 'date', options: { format: 'YYYY-MM-DD' } }],
          fallback: '2024-01-15'
        },
        props: { label: '日期：' }
      },
      {
        id: 'customerName',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 36, widthMm: 128, heightMm: 5 },
        style: { fontSize: 10 },
        binding: { path: 'customer.name', fallback: '客户名称' },
        props: { label: '客户：' }
      },
      {
        id: 'customerAddress',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 43, widthMm: 128, heightMm: 5 },
        style: { fontSize: 10 },
        binding: { path: 'customer.address', fallback: '地址' },
        props: { label: '地址：' }
      },
      {
        id: 'customerPhone',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 50, widthMm: 60, heightMm: 5 },
        style: { fontSize: 10 },
        binding: { path: 'customer.phone', fallback: '电话' },
        props: { label: '电话：' }
      },
      {
        id: 'line2',
        type: 'line',
        layout: { mode: 'absolute', xMm: 10, yMm: 58, widthMm: 128, heightMm: 2 },
        style: { borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: '#000000' },
        props: { direction: 'horizontal' }
      },
      {
        id: 'itemsTable',
        type: 'table',
        layout: { mode: 'absolute', xMm: 10, yMm: 62, widthMm: 128, heightMm: 100 },
        style: { fontSize: 9, textAlign: 'center' },
        binding: { path: 'items' },
        props: {
          bordered: true,
          showHeader: true,
          columns: [
            { dataIndex: 'no', title: '序号', width: 15 },
            { dataIndex: 'name', title: '名称', width: 40 },
            { dataIndex: 'spec', title: '规格', width: 25 },
            { dataIndex: 'quantity', title: '数量', width: 18 },
            { dataIndex: 'price', title: '单价', width: 20 },
            { dataIndex: 'amount', title: '金额', width: 20 }
          ]
        }
      },
      {
        id: 'totalAmount',
        type: 'text',
        layout: { mode: 'absolute', xMm: 78, yMm: 165, widthMm: 60, heightMm: 7 },
        style: { fontSize: 12, fontWeight: 'bold', textAlign: 'right' },
        binding: {
          path: 'summary.finalAmount',
          pipes: [{ type: 'currency', options: {} }],
          fallback: '¥0.00'
        },
        props: { label: '合计：' }
      },
      {
        id: 'remarks',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 175, widthMm: 128, heightMm: 8 },
        style: { fontSize: 9 },
        binding: { path: 'remarks', fallback: '' },
        props: { label: '备注：' }
      },
      {
        id: 'operator',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 185, widthMm: 60, heightMm: 5 },
        style: { fontSize: 9 },
        binding: { path: 'operator', fallback: '' },
        props: { label: '操作员：' }
      },
      {
        id: 'qrcode',
        type: 'qrcode',
        layout: { mode: 'absolute', xMm: 98, yMm: 175, widthMm: 20, heightMm: 15 },
        binding: { path: 'qrCodeUrl', fallback: 'https://example.com' },
        props: { content: '' }
      }
    ]
  },
  {
    id: 'template-a4-header-footer',
    name: '订单打印模板（页眉页脚）',
    version: '1.0',
    description: 'A4 纸张模板，含完整页眉、页脚、条形码、二维码示例',
    schemaId: 'schema-demo-sales',
    page: {
      size: 'A4',
      orientation: 'portrait',
      marginMm: { top: 10, right: 10, bottom: 10, left: 10 },
      headerEnabled: true,
      footerEnabled: true,
      headerHeight: 75,
      footerHeight: 25
    },
    layoutMode: 'absolute',
    components: [
      {
        id: 'companyLogo',
        type: 'image',
        layout: { mode: 'absolute', xMm: 165, yMm: 115, widthMm: 35, heightMm: 15 },
        binding: { path: 'companyLogo', fallback: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzE4OTBmZiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TE9HTzwvdGV4dD48L3N2Zz4=' },
        props: { fit: 'contain' }
      },
      {
        id: 'totalAmount',
        type: 'text',
        layout: { mode: 'absolute', xMm: 140, yMm: 85, widthMm: 60, heightMm: 8 },
        style: { fontSize: 14, fontWeight: 'bold', textAlign: 'right' },
        binding: { path: 'summary.finalAmount', pipes: [{ type: 'currency', options: {} }], fallback: '￥0.00' },
        props: { label: '合计：' }
      },
      {
        id: 'remarks',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 100, widthMm: 190, heightMm: 15 },
        style: { fontSize: 10 },
        binding: { path: 'remarks', fallback: '备注信息' },
        props: { label: '备注：' }
      },
      {
        id: 'itemsTable',
        type: 'table',
        layout: { mode: 'absolute', xMm: 10, yMm: 5, widthMm: 190, heightMm: 80 },
        style: { fontSize: 10, textAlign: 'center' },
        binding: { path: 'items' },
        props: {
          bordered: true,
          showHeader: true,
          columns: [
            { dataIndex: 'name', title: '商品名称', width: 60 },
            { dataIndex: 'spec', title: '规格', width: 40 },
            { dataIndex: 'quantity', title: '数量', width: 30 },
            { dataIndex: 'price', title: '单价', width: 30 },
            { dataIndex: 'amount', title: '金额', width: 30 }
          ]
        }
      }
    ],
    headerComponents: [
      {
        id: 'title',
        type: 'text',
        layout: { mode: 'absolute', xMm: 70, yMm: 0, widthMm: 60, heightMm: 10 },
        style: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
        binding: { path: 'title', fallback: '订单打印' },
        props: {}
      },
      {
        id: 'documentNo',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 10, widthMm: 80, heightMm: 8 },
        style: { fontSize: 12 },
        binding: { path: 'documentNo', fallback: 'ORD-' },
        props: { label: '订单编号：' }
      },
      {
        id: 'orderBarcode',
        type: 'barcode',
        layout: { mode: 'absolute', xMm: 10, yMm: 20, widthMm: 60, heightMm: 12 },
        binding: { path: 'barcode', fallback: 'ORD202401220001' },
        props: { format: 'CODE128' }
      },
      {
        id: 'customerTitle',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 35, widthMm: 40, heightMm: 8 },
        style: { fontSize: 14, fontWeight: 'bold' },
        binding: { fallback: '客户信息' },
        props: { text: '收件人信息' }
      },
      {
        id: 'createdDate',
        type: 'text',
        layout: { mode: 'absolute', xMm: 120, yMm: 10, widthMm: 80, heightMm: 8 },
        style: { fontSize: 12, textAlign: 'right' },
        binding: { path: 'createdDate', pipes: [{ type: 'date', options: { format: 'YYYY-MM-DD HH:mm' } }], fallback: '2024-01-22' },
        props: { label: '日期：' }
      },
      {
        id: 'qrcode',
        type: 'qrcode',
        layout: { mode: 'absolute', xMm: 165, yMm: 20, widthMm: 35, heightMm: 35 },
        binding: { path: 'qrCodeUrl', fallback: 'https://example.com/order/12345' },
        props: { content: '' }
      },
      {
        id: 'customerName',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 45, widthMm: 80, heightMm: 6 },
        style: { fontSize: 11 },
        binding: { path: 'customer.name', fallback: '客户名称' },
        props: { label: '姓名：' }
      },
      {
        id: 'customerPhone',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 55, widthMm: 80, heightMm: 6 },
        style: { fontSize: 11 },
        binding: { path: 'customer.phone', fallback: '138****8888' },
        props: { label: '电话：' }
      },
      {
        id: 'comp-companyAddress',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 65, widthMm: 190, heightMm: 10 },
        binding: { path: 'root.companyAddress' },
        style: { fontSize: 14, color: '#262626' },
        props: { label: '公司地址：' }
      }
    ],
    footerComponents: [
      {
        id: 'comp-footer-sign',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 5, widthMm: 15, heightMm: 10 },
        style: { fontSize: 14, color: '#262626' },
        props: { text: '签名：' }
      },
      {
        id: 'customerRect',
        type: 'rect',
        layout: { mode: 'absolute', xMm: 25, yMm: 5, widthMm: 85, heightMm: 20 },
        style: { border: '1px solid #d9d9d9', borderRadius: '2px', background: '#fafafa' },
        props: {}
      }
    ]
  },
  {
    "version": "1.0.0",
    "name": "问题查找模板数据",
    "id": "template-real-template",
    schemaId: '',
    "page": {
        "size": "CUSTOM",
        "orientation": "portrait",
        "marginMm": {
            "top": 5,
            "right": 15,
            "bottom": 5,
            "left": 10
        },
        "widthMm": 241,
        "heightMm": 140,
        "pageNumber": {
            "enabled": true,
            "position": "top-right",
            "format": "slash",
            "prefix": "",
            "suffix": "",
            "separator": "/",
            "offsetX": 0,
            "offsetY": 0,
            "style": {
                "fontSize": 12,
                "color": "#666666",
                "fontWeight": "normal"
            }
        },
        "headerEnabled": true,
        "footerEnabled": true,
        "headerHeight": 30,
        "footerHeight": 30
    },
    "layoutMode": "absolute",
    "components": [
        {
            "id": "comp-1778136415446",
            "type": "table",
            "layout": {
                "mode": "absolute",
                "xMm": 10.5,
                "yMm": 0.5,
                "widthMm": 215,
                "heightMm": 60
            },
            "style": {
                "fontSize": 13
            },
            "props": {
                "columns": [
                    {
                        "title": "商品名称",
                        "dataIndex": "materialName",
                        "width": 53
                    },
                    {
                        "title": "单位",
                        "dataIndex": "saleUnitName",
                        "width": 12
                    },
                    {
                        "title": "数量",
                        "dataIndex": "saleCount",
                        "width": 17
                    },
                    {
                        "title": "基准价",
                        "dataIndex": "scmQuotationMaterialBasePrice",
                        "width": 18
                    },
                    {
                        "title": "折扣率",
                        "dataIndex": "scmQuotationMaterialDiscountRate",
                        "width": 15
                    },
                    {
                        "title": "结算单价",
                        "dataIndex": "price"
                    },
                    {
                        "title": "金额",
                        "dataIndex": "amount",
                        "summary": {
                            "type": "sum"
                        },
                        "width": 25
                    },
                    {
                        "title": "备注",
                        "dataIndex": "remark",
                        "width": 42
                    }
                ],
                "bordered": true,
                "showHeader": true,
                "showSummary": true,
                "summaryMode": "page",
                "showRowNumber": true,
                "borderColor": "#000000",
                "rowNumberLabel": "",
                "rowNumberWidth": 12,
                "summaryExtraRows": [
                    {
                        "items": [
                            {
                                "label": "大写合计：",
                                "sourceColumn": "amount",
                                "pipes": [
                                    {
                                        "type": "money",
                                        "options": {
                                            "format": "chineseUppercase",
                                            "mode": "none"
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            "binding": {
                "path": "root.orderItemList"
            }
        }
    ],
    "headerComponents": [
        {
            "id": "comp-1778136201561",
            "type": "text",
            "layout": {
                "mode": "absolute",
                "xMm": 70,
                "yMm": 0,
                "widthMm": 105,
                "heightMm": 10
            },
            "style": {
                "fontSize": 23,
                "color": "#262626"
            },
            "props": {
                "text": "xxxxx送货单"
            }
        },
        {
            "id": "comp-1778308422171-ixumpoceo",
            "type": "text",
            "layout": {
                "mode": "absolute",
                "xMm": 15,
                "yMm": 10,
                "widthMm": 140,
                "heightMm": 10
            },
            "style": {
                "fontSize": 16,
                "color": "#262626"
            },
            "props": {
                "text": "客户：",
                "label": "客户："
            },
            "binding": {
                "path": "settleCustomerName"
            }
        },
        {
            "id": "comp-1778750162493",
            "type": "text",
            "layout": {
                "mode": "absolute",
                "xMm": 15,
                "yMm": 20,
                "widthMm": 45,
                "heightMm": 10
            },
            "binding": {
                "path": "mealName"
            },
            "style": {
                "fontSize": 16,
                "color": "#262626"
            },
            "props": {
                "label": "餐别："
            }
        },
        {
            "id": "comp-1778750227507-7htx37sgl",
            "type": "text",
            "layout": {
                "mode": "absolute",
                "xMm": 80,
                "yMm": 20,
                "widthMm": 95,
                "heightMm": 10
            },
            "binding": {
                "path": "root.orderItemList.0.customNameSuffix"
            },
            "style": {
                "fontSize": 16,
                "color": "#262626"
            },
            "props": {
                "label": "类别：",
                "text": ""
            }
        },
        {
            "id": "comp-1778308845292-p9f7z9wd1",
            "type": "text",
            "layout": {
                "mode": "absolute",
                "xMm": 160,
                "yMm": 10,
                "widthMm": 80,
                "heightMm": 10
            },
            "style": {
                "fontSize": 16,
                "color": "#262626"
            },
            "props": {
                "text": "单据编号：",
                "label": "单据编号："
            },
            "binding": {
                "path": "code"
            }
        },
        {
            "id": "comp-1778750232900-mrx9vnorj",
            "type": "text",
            "layout": {
                "mode": "absolute",
                "xMm": 160,
                "yMm": 20,
                "widthMm": 80,
                "heightMm": 10
            },
            "binding": {
                "path": "reconcileDate"
            },
            "style": {
                "fontSize": 16,
                "color": "#262626"
            },
            "props": {
                "label": "送货日期："
            }
        }
    ],
    "footerComponents": [
        {
            "id": "comp-1778137152816-uv0cr7avo",
            "type": "text",
            "layout": {
                "mode": "absolute",
                "xMm": 20,
                "yMm": 0,
                "widthMm": 200,
                "heightMm": 10
            },
            "style": {
                "fontSize": 16,
                "color": "#262626"
            },
            "props": {
                "text": "第一联（白）：存根  第二联（红）：客户  第三联（蓝）：记账 第四联（绿）：对账 第五联（黄）：仓库"
            }
        },
        {
            "id": "comp-1778295350561-08y6ssdtj",
            "type": "text",
            "layout": {
                "mode": "absolute",
                "xMm": 15,
                "yMm": 10,
                "widthMm": 60,
                "heightMm": 10
            },
            "style": {
                "fontSize": 16,
                "color": "#262626"
            },
            "props": {
                "text": "",
                "label": "送货单位及经手人："
            },
            "binding": {
                "path": ""
            }
        },
        {
            "id": "comp-1778309040277-pi9yqwvev",
            "type": "text",
            "layout": {
                "mode": "absolute",
                "xMm": 105,
                "yMm": 10,
                "widthMm": 60,
                "heightMm": 10
            },
            "style": {
                "fontSize": 16,
                "color": "#262626"
            },
            "props": {
                "text": "",
                "label": "收货单位及经手人："
            }
        }
    ]
}
];
