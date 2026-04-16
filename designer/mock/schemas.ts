import type { SchemaDictionary } from './types';

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
  }
];
