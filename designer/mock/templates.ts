import type { PrintTemplate } from './types';

/**
 * 默认系统内置模板列表
 */
export const defaultTemplates: PrintTemplate[] = [
  // 示例模板1：订单打印模板
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
          "widthMm": 180,
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
          "widthMm": 180,
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
          "widthMm": 180,
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
              "dataIndex": "no",
              "title": "序号",
              "width": 30
            },
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
          "widthMm": 180,
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
  // 示例模板2：快递面单模板
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
          "widthMm": 180,
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
          "widthMm": 180,
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
          "widthMm": 180,
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
          "widthMm": 180,
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
  // 示例模板3：产品标签模板
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
      // 产品名称
      {
        id: 'productName',
        type: 'text',
        layout: { mode: 'absolute', xMm: 2, yMm: 2, widthMm: 56, heightMm: 6 },
        style: { fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
        binding: { fallback: '产品名称' },
        props: {}
      },
      // 条形码
      {
        id: 'barcode',
        type: 'barcode',
        layout: { mode: 'absolute', xMm: 5, yMm: 10, widthMm: 50, heightMm: 15 },
        binding: { path: 'barcode', fallback: '1234567890123' },
        props: { format: 'CODE128' }
      },
      // 规格
      {
        id: 'spec',
        type: 'text',
        layout: { mode: 'absolute', xMm: 2, yMm: 28, widthMm: 28, heightMm: 5 },
        style: { fontSize: 8 },
        binding: { fallback: '规格' },
        props: { label: '规格：' }
      },
      // 单位
      {
        id: 'unit',
        type: 'text',
        layout: { mode: 'absolute', xMm: 30, yMm: 28, widthMm: 28, heightMm: 5 },
        style: { fontSize: 8 },
        binding: { fallback: '个' },
        props: { label: '单位：' }
      },
      // 日期
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
  // 复现模板：跨页后新页面第一个组件负gap问题
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
      // 组件A：从页面顶部开始，高度100mm
      {
        id: 'component-a',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 10, widthMm: 180, heightMm: 100 },
        style: { fontSize: 14 },
        binding: { fallback: '组件A：高度100mm' },
        props: { text: '组件A：高度100mm' }
      },
      // 组件B：与组件A重叠（负gap）
      // 设计位置：yMm=90，组件A底部=10+100=110
      // gap = 90 - 110 = -20mm（负gap，表示重叠20mm）
      {
        id: 'component-b',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 90, widthMm: 180, heightMm: 30 },
        style: { fontSize: 14, fontWeight: 'bold', color: '#ff0000', backgroundColor: '#ffffcc' },
        binding: { fallback: '组件B（与A重叠20mm）' },
        props: { text: '组件B：与A重叠20mm' }
      },
      // 组件C：设计位置在页面底部附近，会导致换页
      // 设计位置：yMm=240，组件B底部=90+30=120
      // gap = 240 - 120 = 120mm（很大的正gap）
      // 但组件C高度50mm，yMm=240，底部=290mm
      // A4可用高度约277mm，所以组件C会换页
      // 换页后，组件C成为新页面第一个组件
      // 此时组件C的gap=120mm，是正数，不会有问题
      // 
      // 要复现负gap问题，需要让组件C与组件B有负gap
      // 修改：组件C的yMm=110（与B底部平齐，gap=-10mm）
      // 但这样C和B会重叠，且C高度50，底部=160
      // 不会换页...
      //
      // 正确的设计：让组件C在页面外，强制换页，且与B有负gap
      // 组件B底部=120，组件C yMm=100（在B上方20mm，负gap）
      // 但C高度80mm，底部=180，不会换页
      //
      // 再修改：组件C高度200mm，yMm=100
      // 底部=300mm > 277mm，会换页！
      // gap = 100 - 120 = -20mm（负gap）
      // 换页后，组件C成为新页面第一个组件，应用-20mm的gap
      // 位置 = marginTop(10) + (-20) = -10mm（页面顶部之外！）
      {
        id: 'component-c',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 100, widthMm: 180, heightMm: 200 },
        style: { fontSize: 14, color: '#0000ff', backgroundColor: '#ccffcc' },
        binding: { fallback: '组件C（与B负gap，会换页）' },
        props: { text: '组件C：与B有-20mm的gap，换页后会成为新页面第一个组件。如果看到这句话位置异常或消失，说明bug存在。' }
      }
    ]
  }
];
