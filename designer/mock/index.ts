/**
 * Mock 服务模块
 * 提供类型定义、数据和 Vite 中间件插件
 */
export * from './types';
export { defaultSchemas } from './schemas';
export { defaultTemplates } from './templates';
export { defaultMockData } from './mockData';
export { createMockMiddleware, mockServerPlugin } from './server';
