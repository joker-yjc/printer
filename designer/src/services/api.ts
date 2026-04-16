import axios from 'axios';
import type { SchemaDictionary, PrintTemplate, MockData } from '../types';

/**
 * 后端 API 基础地址
 * 开发环境：使用 Vite 集成的 Mock API（同源，无需指定域名）
 * 生产环境：可通过环境变量 VITE_API_BASE_URL 配置
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Axios 实例配置
 * 统一设置 baseURL 和请求头
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Schema 字典管理 API
 * 用于管理数据模型的字段定义，包括字段名称、类型、枚举值等元数据
 */
export const schemaApi = {
  list: async (name?: string): Promise<SchemaDictionary[]> => {
    const response = await apiClient.get('/schemas', { params: { name } });
    return response.data;
  },

  get: async (id: string): Promise<SchemaDictionary> => {
    const response = await apiClient.get(`/schemas/${id}`);
    return response.data;
  },

  create: async (schema: Omit<SchemaDictionary, 'id'>): Promise<SchemaDictionary> => {
    const response = await apiClient.post('/schemas', schema);
    return response.data;
  },

  update: async (id: string, schema: SchemaDictionary): Promise<SchemaDictionary> => {
    const response = await apiClient.put(`/schemas/${id}`, schema);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/schemas/${id}`);
  },
};

/**
 * 打印模板管理 API
 * 用于管理打印模板（包含页面配置、组件列表、布局信息等）
 */
export const templateApi = {
  list: async (params?: { name?: string; schemaId?: string }): Promise<PrintTemplate[]> => {
    const response = await apiClient.get('/templates', { params });
    return response.data;
  },

  get: async (id: string): Promise<PrintTemplate> => {
    const response = await apiClient.get(`/templates/${id}`);
    return response.data;
  },

  create: async (template: Omit<PrintTemplate, 'id'>): Promise<PrintTemplate> => {
    const response = await apiClient.post('/templates', template);
    return response.data;
  },

  update: async (id: string, template: PrintTemplate): Promise<PrintTemplate> => {
    const response = await apiClient.put(`/templates/${id}`, template);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/templates/${id}`);
  },
};

/**
 * Mock 数据管理 API
 * 用于管理测试数据，支持按 Schema 或模板关联数据
 */
export const mockDataApi = {
  list: async (params?: {
    name?: string;
    schemaId?: string;
    templateId?: string;
  }): Promise<MockData[]> => {
    const response = await apiClient.get('/mock-data', { params });
    return response.data;
  },

  get: async (id: string): Promise<MockData> => {
    const response = await apiClient.get(`/mock-data/${id}`);
    return response.data;
  },

  create: async (mockData: Omit<MockData, 'id'>): Promise<MockData> => {
    const response = await apiClient.post('/mock-data', mockData);
    return response.data;
  },

  update: async (id: string, mockData: MockData): Promise<MockData> => {
    const response = await apiClient.put(`/mock-data/${id}`, mockData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/mock-data/${id}`);
  },
};
