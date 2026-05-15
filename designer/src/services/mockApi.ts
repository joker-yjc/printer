import type { SchemaDictionary, PrintTemplate, MockData } from '../types';
import { mockStore } from './mockStore';

/** 模拟异步延迟 */
function delay<T>(value: T, ms = 80): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** 模拟 404 错误（保持与真实 HTTP 一致的错误结构） */
function notFound(resource: string): never {
  throw Object.assign(new Error(`${resource} not found`), {
    response: { status: 404, data: { code: 'NOT_FOUND', message: `${resource} not found` } }
  });
}

/**
 * Schema 字典管理 API（前端 Mock 实现）
 */
export const schemaApi = {
  list: async (name?: string): Promise<SchemaDictionary[]> => {
    return delay(mockStore.listSchemas(name));
  },

  get: async (id: string): Promise<SchemaDictionary> => {
    const item = mockStore.getSchema(id);
    if (!item) notFound('Schema');
    return delay(item!);
  },

  create: async (schema: Omit<SchemaDictionary, 'id'> & { id?: string }): Promise<SchemaDictionary> => {
    return delay(mockStore.createSchema(schema), 150);
  },

  update: async (id: string, schema: SchemaDictionary): Promise<SchemaDictionary> => {
    return delay(mockStore.updateSchema(id, schema));
  },

  delete: async (id: string): Promise<void> => {
    mockStore.deleteSchema(id);
    return delay(undefined);
  },
};

/**
 * 打印模板管理 API（前端 Mock 实现）
 */
export const templateApi = {
  list: async (params?: { name?: string; schemaId?: string }): Promise<PrintTemplate[]> => {
    return delay(mockStore.listTemplates(params));
  },

  get: async (id: string): Promise<PrintTemplate> => {
    const item = mockStore.getTemplate(id);
    if (!item) notFound('Template');
    return delay(item!);
  },

  create: async (template: Omit<PrintTemplate, 'id'> & { id?: string }): Promise<PrintTemplate> => {
    return delay(mockStore.createTemplate(template), 150);
  },

  update: async (id: string, template: PrintTemplate): Promise<PrintTemplate> => {
    return delay(mockStore.updateTemplate(id, template));
  },

  delete: async (id: string): Promise<void> => {
    mockStore.deleteTemplate(id);
    return delay(undefined);
  },
};

/**
 * Mock 数据管理 API（前端 Mock 实现）
 */
export const mockDataApi = {
  list: async (params?: {
    name?: string;
    schemaId?: string;
    templateId?: string;
  }): Promise<MockData[]> => {
    return delay(mockStore.listMockData(params));
  },

  get: async (id: string): Promise<MockData> => {
    const item = mockStore.getMockData(id);
    if (!item) notFound('Mock data');
    return delay(item!);
  },

  create: async (mockData: Omit<MockData, 'id'> & { id?: string }): Promise<MockData> => {
    return delay(mockStore.createMockData(mockData), 150);
  },

  update: async (id: string, mockData: MockData): Promise<MockData> => {
    return delay(mockStore.updateMockData(id, mockData));
  },

  delete: async (id: string): Promise<void> => {
    mockStore.deleteMockData(id);
    return delay(undefined);
  },
};
