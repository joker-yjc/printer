import type { SchemaField } from '../types';

// 根据 Schema 生成 Mock 数据
export const generateMockData = (schema: SchemaField): any => {
  switch (schema.type) {
    case 'string':
      return generateStringValue(schema.key);
    case 'number':
      return generateNumberValue(schema.key);
    case 'boolean':
      return Math.random() > 0.5;
    case 'date':
      return new Date().toISOString().split('T')[0];
    case 'object':
      return generateObjectValue(schema);
    case 'array':
      return generateArrayValue(schema);
    default:
      return '';
  }
};

// 生成字符串值
const generateStringValue = (key: string): string => {
  const lowerKey = key.toLowerCase();

  // 根据字段名推测内容
  if (lowerKey.includes('name') || lowerKey.includes('名')) {
    return '示例名称';
  }
  if (lowerKey.includes('phone') || lowerKey.includes('电话') || lowerKey.includes('手机')) {
    return '13800138000';
  }
  if (lowerKey.includes('email') || lowerKey.includes('邮箱')) {
    return 'example@email.com';
  }
  if (lowerKey.includes('address') || lowerKey.includes('地址')) {
    return '北京市朝阳区示例街道123号';
  }
  if (lowerKey.includes('code') || lowerKey.includes('编号') || lowerKey.includes('no')) {
    return `CODE${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  }
  if (lowerKey.includes('url') || lowerKey.includes('link')) {
    return 'https://example.com';
  }
  if (lowerKey.includes('status') || lowerKey.includes('状态')) {
    return '正常';
  }

  return '示例文本';
};

// 生成数字值
const generateNumberValue = (key: string): number => {
  const lowerKey = key.toLowerCase();

  if (lowerKey.includes('price') || lowerKey.includes('金额') || lowerKey.includes('amount')) {
    return parseFloat((Math.random() * 1000).toFixed(2));
  }
  if (lowerKey.includes('quantity') || lowerKey.includes('数量') || lowerKey.includes('count')) {
    return Math.floor(Math.random() * 100) + 1;
  }
  if (lowerKey.includes('age') || lowerKey.includes('年龄')) {
    return Math.floor(Math.random() * 60) + 18;
  }
  if (lowerKey.includes('percent') || lowerKey.includes('百分比') || lowerKey.includes('rate')) {
    return parseFloat((Math.random() * 100).toFixed(2));
  }

  return Math.floor(Math.random() * 100);
};

// 生成对象值
const generateObjectValue = (schema: SchemaField): any => {
  if (!schema.children || schema.children.length === 0) {
    return {};
  }

  const obj: any = {};
  schema.children.forEach((child) => {
    obj[child.key] = generateMockData(child);
  });

  return obj;
};

// 生成数组值
const generateArrayValue = (schema: SchemaField): any[] => {
  if (!schema.children || schema.children.length === 0) {
    return [];
  }

  // 生成 2-5 条数据
  const count = Math.floor(Math.random() * 4) + 2;
  const arr: any[] = [];

  for (let i = 0; i < count; i++) {
    // 如果 children 是对象结构
    if (schema.children.length > 1 || schema.children[0].type === 'object') {
      const item: any = {};
      schema.children.forEach((child) => {
        item[child.key] = generateMockData(child);
      });
      arr.push(item);
    } else {
      // 如果 children 是单个基础类型
      arr.push(generateMockData(schema.children[0]));
    }
  }

  return arr;
};
