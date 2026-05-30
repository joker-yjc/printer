import type { SchemaDictionary, PrintTemplate, MockData } from '../types';
import { defaultSchemas, defaultTemplates, defaultMockData } from './mock';

/** 生成 UUID */
function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// 内存数据存储（从默认数据初始化）
export let schemas: SchemaDictionary[] = structuredClone(defaultSchemas);
export let templates: PrintTemplate[] = structuredClone(defaultTemplates);
export let mockDataStore: MockData[] = structuredClone(defaultMockData);

/** 重置所有数据为初始状态 */
export function resetMockStore(): void {
  schemas = structuredClone(defaultSchemas);
  templates = structuredClone(defaultTemplates);
  mockDataStore = structuredClone(defaultMockData);
}

/**
 * 统一 Mock 数据存储与操作
 * 供 Vite 开发服务器中间件和前端内存 Mock 共用
 */
export const mockStore = {
  // ============ Schema CRUD ============
  listSchemas(name?: string): SchemaDictionary[] {
    let result = schemas;
    if (name) {
      result = result.filter((s) => s.name.includes(name));
    }
    return result;
  },

  getSchema(id: string): SchemaDictionary | undefined {
    return schemas.find((s) => s.id === id);
  },

  createSchema(data: Omit<SchemaDictionary, 'id'> & { id?: string }): SchemaDictionary {
    const item: SchemaDictionary = { ...data, id: data.id || uuid() };
    schemas.push(item);
    return item;
  },

  updateSchema(id: string, data: SchemaDictionary): SchemaDictionary {
    const index = schemas.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Schema not found');
    schemas[index] = { ...data, id };
    return schemas[index];
  },

  deleteSchema(id: string): void {
    const index = schemas.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Schema not found');
    schemas.splice(index, 1);
  },

  // ============ Template CRUD ============
  listTemplates(params?: { name?: string; schemaId?: string }): PrintTemplate[] {
    let result = templates;
    if (params?.name) {
      result = result.filter((t) => t.name.includes(params.name!));
    }
    if (params?.schemaId) {
      result = result.filter((t) => t.schemaId === params.schemaId);
    }
    return result;
  },

  getTemplate(id: string): PrintTemplate | undefined {
    return templates.find((t) => t.id === id);
  },

  createTemplate(data: Omit<PrintTemplate, 'id'> & { id?: string }): PrintTemplate {
    const item: PrintTemplate = { ...data, id: data.id || uuid() };
    templates.push(item);
    return item;
  },

  updateTemplate(id: string, data: PrintTemplate): PrintTemplate {
    const index = templates.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Template not found');
    templates[index] = { ...data, id };
    return templates[index];
  },

  deleteTemplate(id: string): void {
    const index = templates.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Template not found');
    templates.splice(index, 1);
  },

  // ============ MockData CRUD ============
  listMockData(params?: { name?: string; schemaId?: string; templateId?: string }): MockData[] {
    let result = mockDataStore;
    if (params?.name) {
      result = result.filter((m) => m.name.includes(params.name!));
    }
    if (params?.schemaId) {
      result = result.filter((m) => m.schemaId === params.schemaId);
    }
    if (params?.templateId) {
      result = result.filter((m) => m.templateId === params.templateId);
    }
    return result;
  },

  getMockData(id: string): MockData | undefined {
    return mockDataStore.find((m) => m.id === id);
  },

  createMockData(data: Omit<MockData, 'id'> & { id?: string }): MockData {
    const item: MockData = { ...data, id: data.id || uuid() };
    mockDataStore.push(item);
    return item;
  },

  updateMockData(id: string, data: MockData): MockData {
    const index = mockDataStore.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Mock data not found');
    mockDataStore[index] = { ...data, id };
    return mockDataStore[index];
  },

  deleteMockData(id: string): void {
    const index = mockDataStore.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Mock data not found');
    mockDataStore.splice(index, 1);
  },
};
