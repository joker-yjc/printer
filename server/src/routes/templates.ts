import { Router } from 'express';
import { v4 as uuid } from 'uuid';

const router = Router();

export interface PageConfig {
  size: 'A4' | 'A5' | 'A6' | 'CUSTOM';
  widthMm?: number;
  heightMm?: number;
  orientation: 'portrait' | 'landscape';
  marginMm: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export type ComponentType = 'text' | 'image' | 'rect' | 'container' | 'table' | 'line' | 'qrcode' | 'barcode';

export interface PipeConfig {
  type: string;
  options?: Record<string, any>;
}

export interface DataBinding {
  path?: string;
  pipes?: PipeConfig[];
  fallback?: string;
}

export interface ComponentNode {
  id: string;
  type: ComponentType;
  layout: {
    mode: 'absolute' | 'flow';
    xMm?: number;
    yMm?: number;
    widthMm?: number;
    heightMm?: number;
    zIndex?: number;
  };
  style?: Record<string, any>;
  binding?: DataBinding;
  props?: Record<string, any>;
  children?: ComponentNode[];
}

export interface PrintTemplate {
  id: string;
  name: string;
  version: string;
  description?: string;
  schemaId: string;
  page: PageConfig;
  layoutMode: 'absolute' | 'flow';
  components: ComponentNode[];
}

const templates: PrintTemplate[] = [
  // 示例模板1：订单打印模板
  {
    id: 'template-demo-order',
    name: '订单打印模板',
    version: '1.0',
    description: '电商订单打印示例，包含订单信息、商品明细、收货地址、二维码',
    schemaId: 'schema-demo-sales',
    page: {
      size: 'A4',
      orientation: 'portrait',
      marginMm: { top: 10, right: 10, bottom: 10, left: 10 }
    },
    layoutMode: 'absolute',
    components: [
      // 标题
      {
        id: 'title',
        type: 'text',
        layout: { mode: 'absolute', xMm: 70, yMm: 10, widthMm: 60, heightMm: 10 },
        style: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
        binding: { path: 'title', fallback: '订单打印' },
        props: {}
      },
      // 分隔线
      {
        id: 'line1',
        type: 'line',
        layout: { mode: 'absolute', xMm: 10, yMm: 25, widthMm: 180, heightMm: 2 },
        style: { borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: '#000000' },
        props: { direction: 'horizontal' }
      },
      // 订单编号
      {
        id: 'documentNo',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 30, widthMm: 80, heightMm: 8 },
        style: { fontSize: 12 },
        binding: { path: 'documentNo', fallback: 'ORD-' },
        props: { label: '订单编号：' }
      },
      // 创建日期
      {
        id: 'createdDate',
        type: 'text',
        layout: { mode: 'absolute', xMm: 110, yMm: 30, widthMm: 80, heightMm: 8 },
        style: { fontSize: 12, textAlign: 'right' },
        binding: {
          path: 'createdDate',
          pipes: [{ type: 'date', options: { format: 'YYYY-MM-DD HH:mm' } }],
          fallback: '2024-01-22'
        },
        props: { label: '日期：' }
      },
      // 客户信息标题
      {
        id: 'customerTitle',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 45, widthMm: 40, heightMm: 8 },
        style: { fontSize: 14, fontWeight: 'bold' },
        binding: { fallback: '客户信息' },
        props: {}
      },
      // 客户名称
      {
        id: 'customerName',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 55, widthMm: 80, heightMm: 6 },
        style: { fontSize: 11 },
        binding: { path: 'customer.name', fallback: '客户名称' },
        props: { label: '姓名：' }
      },
      // 联系电话
      {
        id: 'customerPhone',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 63, widthMm: 80, heightMm: 6 },
        style: { fontSize: 11 },
        binding: { path: 'customer.phone', fallback: '138****8888' },
        props: { label: '电话：' }
      },
      // 收货地址
      {
        id: 'customerAddress',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 71, widthMm: 120, heightMm: 10 },
        style: { fontSize: 11 },
        binding: { path: 'customer.address', fallback: '收货地址' },
        props: { label: '地址：' }
      },
      // 二维码
      {
        id: 'qrcode',
        type: 'qrcode',
        layout: { mode: 'absolute', xMm: 155, yMm: 45, widthMm: 35, heightMm: 35 },
        binding: { path: 'qrCodeUrl', fallback: 'https://example.com/order/12345' },
        props: { content: '' }
      },
      // 商品明细表格
      {
        id: 'itemsTable',
        type: 'table',
        layout: { mode: 'absolute', xMm: 10, yMm: 90, widthMm: 180, heightMm: 80 },
        style: { fontSize: 10, textAlign: 'center' },
        binding: { path: 'items' },
        props: {
          bordered: true,
          showHeader: true,
          columns: [
            { dataIndex: 'no', title: '序号', width: 30 },
            { dataIndex: 'name', title: '商品名称', width: 60 },
            { dataIndex: 'spec', title: '规格', width: 40 },
            { dataIndex: 'quantity', title: '数量', width: 30 },
            { dataIndex: 'price', title: '单价', width: 30 },
            { dataIndex: 'amount', title: '金额', width: 30 }
          ]
        }
      },
      // 总金额
      {
        id: 'totalAmount',
        type: 'text',
        layout: { mode: 'absolute', xMm: 130, yMm: 175, widthMm: 60, heightMm: 8 },
        style: { fontSize: 14, fontWeight: 'bold', textAlign: 'right' },
        binding: {
          path: 'summary.finalAmount',
          pipes: [{ type: 'currency', options: {} }],
          fallback: '￥0.00'
        },
        props: { label: '合计：' }
      },
      // 备注
      {
        id: 'remarks',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 190, widthMm: 180, heightMm: 15 },
        style: { fontSize: 10 },
        binding: { path: 'remarks', fallback: '备注信息' },
        props: { label: '备注：' }
      }
    ]
  },
  // 示例模板2：快递面单模板
  {
    id: 'template-demo-express',
    name: '快递面单模板',
    version: '1.0',
    description: '物流快递面单示例，包含寄件人、收件人信息、条形码',
    schemaId: 'schema-demo-sales',
    page: {
      size: 'A4',
      orientation: 'portrait',
      marginMm: { top: 10, right: 10, bottom: 10, left: 10 }
    },
    layoutMode: 'absolute',
    components: [
      // 公司Logo/名称
      {
        id: 'companyName',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 10, widthMm: 100, heightMm: 12 },
        style: { fontSize: 18, fontWeight: 'bold' },
        binding: { path: 'companyName', fallback: '快递公司名称' },
        props: {}
      },
      // 运单号条形码
      {
        id: 'barcode',
        type: 'barcode',
        layout: { mode: 'absolute', xMm: 130, yMm: 5, widthMm: 70, heightMm: 15 },
        binding: { path: 'barcode', fallback: '1234567890123' },
        props: { format: 'CODE128' }
      },
      // 分隔线
      {
        id: 'line1',
        type: 'line',
        layout: { mode: 'absolute', xMm: 10, yMm: 30, widthMm: 180, heightMm: 2 },
        style: { borderTopWidth: 2, borderTopStyle: 'solid', borderTopColor: '#000000' },
        props: { direction: 'horizontal' }
      },
      // 寄件人信息区域
      {
        id: 'senderTitle',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 35, widthMm: 85, heightMm: 8 },
        style: { fontSize: 14, fontWeight: 'bold' },
        binding: { fallback: '寄件人' },
        props: {}
      },
      {
        id: 'senderName',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 45, widthMm: 85, heightMm: 6 },
        style: { fontSize: 11 },
        binding: { path: 'companyName', fallback: '寄件公司' },
        props: { label: '姓名/公司：' }
      },
      {
        id: 'senderPhone',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 53, widthMm: 85, heightMm: 6 },
        style: { fontSize: 11 },
        binding: { path: 'customer.phone', fallback: '021-12345678' },
        props: { label: '电话：' }
      },
      {
        id: 'senderAddress',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 61, widthMm: 85, heightMm: 15 },
        style: { fontSize: 11 },
        binding: { path: 'companyAddress', fallback: '寄件地址' },
        props: { label: '地址：' }
      },
      // 竖线分隔
      {
        id: 'vline1',
        type: 'line',
        layout: { mode: 'absolute', xMm: 100, yMm: 35, widthMm: 2, heightMm: 45 },
        style: { borderTopWidth: 1, borderTopStyle: 'dashed', borderTopColor: '#999999' },
        props: { direction: 'vertical' }
      },
      // 收件人信息区域
      {
        id: 'receiverTitle',
        type: 'text',
        layout: { mode: 'absolute', xMm: 105, yMm: 35, widthMm: 85, heightMm: 8 },
        style: { fontSize: 14, fontWeight: 'bold' },
        binding: { fallback: '收件人' },
        props: {}
      },
      {
        id: 'receiverName',
        type: 'text',
        layout: { mode: 'absolute', xMm: 105, yMm: 45, widthMm: 85, heightMm: 6 },
        style: { fontSize: 11 },
        binding: { path: 'customer.name', fallback: '收件人姓名' },
        props: { label: '姓名：' }
      },
      {
        id: 'receiverPhone',
        type: 'text',
        layout: { mode: 'absolute', xMm: 105, yMm: 53, widthMm: 85, heightMm: 6 },
        style: { fontSize: 11 },
        binding: { path: 'customer.phone', fallback: '138****8888' },
        props: { label: '电话：' }
      },
      {
        id: 'receiverAddress',
        type: 'text',
        layout: { mode: 'absolute', xMm: 105, yMm: 61, widthMm: 85, heightMm: 15 },
        style: { fontSize: 11, fontWeight: 'bold' },
        binding: { path: 'customer.address', fallback: '收货地址' },
        props: { label: '地址：' }
      },
      // 分隔线
      {
        id: 'line2',
        type: 'line',
        layout: { mode: 'absolute', xMm: 10, yMm: 85, widthMm: 180, heightMm: 2 },
        style: { borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: '#000000' },
        props: { direction: 'horizontal' }
      },
      // 物品信息
      {
        id: 'goodsTitle',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 92, widthMm: 40, heightMm: 8 },
        style: { fontSize: 12, fontWeight: 'bold' },
        binding: { fallback: '物品信息' },
        props: {}
      },
      {
        id: 'itemsTable',
        type: 'table',
        layout: { mode: 'absolute', xMm: 10, yMm: 102, widthMm: 180, heightMm: 40 },
        style: { fontSize: 10, textAlign: 'left' },
        binding: { path: 'items' },
        props: {
          bordered: true,
          showHeader: true,
          columns: [
            { dataIndex: 'name', title: '物品名称', width: 80 },
            { dataIndex: 'quantity', title: '数量', width: 50 },
            { dataIndex: 'remarks', title: '备注', width: 50 }
          ]
        }
      },
      // 备注
      {
        id: 'remarks',
        type: 'text',
        layout: { mode: 'absolute', xMm: 10, yMm: 150, widthMm: 180, heightMm: 10 },
        style: { fontSize: 10 },
        binding: { path: 'remarks', fallback: '' },
        props: { label: '备注：' }
      },
      // 二维码
      {
        id: 'qrcode',
        type: 'qrcode',
        layout: { mode: 'absolute', xMm: 155, yMm: 160, widthMm: 30, heightMm: 30 },
        binding: { path: 'qrCodeUrl', fallback: 'https://example.com/tracking/12345' },
        props: { content: '' }
      }
    ]
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
  }
];

router.post('/', (req, res, next) => {
  try {
    const body = req.body as PrintTemplate;
    const id = body.id || uuid();
    const template: PrintTemplate = { ...body, id };
    templates.push(template);
    res.status(201).json(template);
  } catch (err) {
    next(err);
  }
});

router.get('/', (req, res) => {
  const { name, schemaId } = req.query;
  let result = templates;
  if (typeof name === 'string' && name.trim()) {
    result = result.filter((t) => t.name.includes(name.trim()));
  }
  if (typeof schemaId === 'string' && schemaId.trim()) {
    result = result.filter((t) => t.schemaId === schemaId.trim());
  }
  res.json(result);
});

router.get('/:id', (req, res) => {
  const template = templates.find((t) => t.id === req.params.id);
  if (!template) {
    return res.status(404).json({
      code: 'NOT_FOUND',
      message: 'Template not found'
    });
  }
  res.json(template);
});

router.put('/:id', (req, res) => {
  const index = templates.findIndex((t) => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({
      code: 'NOT_FOUND',
      message: 'Template not found'
    });
  }
  const updated: PrintTemplate = { ...(req.body as PrintTemplate), id: req.params.id };
  templates[index] = updated;
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const index = templates.findIndex((t) => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({
      code: 'NOT_FOUND',
      message: 'Template not found'
    });
  }
  templates.splice(index, 1);
  res.status(204).end();
});

export default router;
