import { Router } from 'express';
import { v4 as uuid } from 'uuid';

const router = Router();

export type SchemaFieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'object'
  | 'array';

export interface SchemaField {
  key: string;
  label: string;
  type: SchemaFieldType;
  description?: string;
  children?: SchemaField[];
  enum?: { value: string | number; label: string }[];
  format?: 'date' | 'datetime' | 'money' | 'percent';
}

export interface SchemaDictionary {
  id: string;
  name: string;
  rootType: 'object' | 'array';
  root: SchemaField;
  version?: string;
  description?: string;
}

// 默认系统内置 Schema
const defaultSchemas: SchemaDictionary[] = [
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
  }
];

const schemas: SchemaDictionary[] = [...defaultSchemas];

router.post('/', (req, res, next) => {
  try {
    const body = req.body as SchemaDictionary;
    const id = body.id || uuid();
    const schema: SchemaDictionary = { ...body, id };
    schemas.push(schema);
    res.status(201).json(schema);
  } catch (err) {
    next(err);
  }
});

router.get('/', (req, res) => {
  const { name } = req.query;
  let result = schemas;
  if (typeof name === 'string' && name.trim()) {
    result = result.filter((s) => s.name.includes(name.trim()));
  }
  res.json(result);
});

router.get('/:id', (req, res) => {
  const schema = schemas.find((s) => s.id === req.params.id);
  if (!schema) {
    return res.status(404).json({
      code: 'NOT_FOUND',
      message: 'Schema not found'
    });
  }
  res.json(schema);
});

router.put('/:id', (req, res) => {
  const index = schemas.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({
      code: 'NOT_FOUND',
      message: 'Schema not found'
    });
  }
  const updated: SchemaDictionary = { ...(req.body as SchemaDictionary), id: req.params.id };
  schemas[index] = updated;
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const index = schemas.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({
      code: 'NOT_FOUND',
      message: 'Schema not found'
    });
  }
  schemas.splice(index, 1);
  res.status(204).end();
});

export default router;
