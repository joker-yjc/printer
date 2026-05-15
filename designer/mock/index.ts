/**
 * Mock 服务模块
 * 提供 Vite 开发服务器中间件插件
 * 数据与逻辑已统一迁移至 src/services/mockStore.ts
 */
export { createMockMiddleware, mockServerPlugin } from './server';
