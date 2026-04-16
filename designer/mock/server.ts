/**
 * Vite Mock 中间件插件
 * 从 Express server 迁移，提供完整的 CRUD API 支持
 */
import type { Connect } from 'vite';
import type { SchemaDictionary, PrintTemplate, MockData } from './types';
import { defaultSchemas } from './schemas';
import { defaultTemplates } from './templates';
import { defaultMockData } from './mockData';

/** 生成 UUID */
function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** 解析 JSON 请求体 */
function parseBody<T>(req: any): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

/** 发送 JSON 响应 */
function sendJson(res: any, data: any, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(data));
}

/** 创建 Mock 中间件 */
export function createMockMiddleware(): Connect.NextHandleFunction {
  // 内存数据存储（从默认数据初始化）
  let schemas: SchemaDictionary[] = [...defaultSchemas];
  let templates: PrintTemplate[] = [...defaultTemplates];
  let mockDataStore: MockData[] = [...defaultMockData];

  return async (req, res, next) => {
    const url = req.url || '';
    const method = req.method || 'GET';

    // 处理 CORS 预检请求
    if (method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.statusCode = 204;
      res.end();
      return;
    }

    // 解析 URL 路径（中间件已挂载在 /api，所以 url 可能是 /schemas 或 /schemas/xxx）
    const pathMatch = url.match(/^\/([^/?]+)(?:\/([^/?]+))?(?:\?.*)?$/);
    if (!pathMatch) {
      return next();
    }

    const [, resource, id] = pathMatch;
    const query = url.includes('?') ? Object.fromEntries(new URLSearchParams(url.split('?')[1])) : {};

    try {
      // ==================== Schemas API ====================
      if (resource === 'schemas') {
        // GET /api/schemas - 列表查询
        if (method === 'GET' && !id) {
          let result = schemas;
          if (query.name) {
            result = result.filter((s) => s.name.includes(query.name as string));
          }
          return sendJson(res, result);
        }

        // GET /api/schemas/:id - 获取单个
        if (method === 'GET' && id) {
          const schema = schemas.find((s) => s.id === id);
          if (!schema) {
            return sendJson(res, { code: 'NOT_FOUND', message: 'Schema not found' }, 404);
          }
          return sendJson(res, schema);
        }

        // POST /api/schemas - 创建
        if (method === 'POST' && !id) {
          const body = await parseBody<SchemaDictionary>(req);
          const newId = body.id || uuid();
          const schema: SchemaDictionary = { ...body, id: newId };
          schemas.push(schema);
          return sendJson(res, schema, 201);
        }

        // PUT /api/schemas/:id - 更新
        if (method === 'PUT' && id) {
          const index = schemas.findIndex((s) => s.id === id);
          if (index === -1) {
            return sendJson(res, { code: 'NOT_FOUND', message: 'Schema not found' }, 404);
          }
          const body = await parseBody<SchemaDictionary>(req);
          schemas[index] = { ...body, id };
          return sendJson(res, schemas[index]);
        }

        // DELETE /api/schemas/:id - 删除
        if (method === 'DELETE' && id) {
          const index = schemas.findIndex((s) => s.id === id);
          if (index === -1) {
            return sendJson(res, { code: 'NOT_FOUND', message: 'Schema not found' }, 404);
          }
          schemas.splice(index, 1);
          res.statusCode = 204;
          res.end();
          return;
        }
      }

      // ==================== Templates API ====================
      if (resource === 'templates') {
        // GET /api/templates - 列表查询
        if (method === 'GET' && !id) {
          let result = templates;
          if (query.name) {
            result = result.filter((t) => t.name.includes(query.name as string));
          }
          if (query.schemaId) {
            result = result.filter((t) => t.schemaId === query.schemaId);
          }
          return sendJson(res, result);
        }

        // GET /api/templates/:id - 获取单个
        if (method === 'GET' && id) {
          const template = templates.find((t) => t.id === id);
          if (!template) {
            return sendJson(res, { code: 'NOT_FOUND', message: 'Template not found' }, 404);
          }
          return sendJson(res, template);
        }

        // POST /api/templates - 创建
        if (method === 'POST' && !id) {
          const body = await parseBody<PrintTemplate>(req);
          const newId = body.id || uuid();
          const template: PrintTemplate = { ...body, id: newId };
          templates.push(template);
          return sendJson(res, template, 201);
        }

        // PUT /api/templates/:id - 更新
        if (method === 'PUT' && id) {
          const index = templates.findIndex((t) => t.id === id);
          if (index === -1) {
            return sendJson(res, { code: 'NOT_FOUND', message: 'Template not found' }, 404);
          }
          const body = await parseBody<PrintTemplate>(req);
          templates[index] = { ...body, id };
          return sendJson(res, templates[index]);
        }

        // DELETE /api/templates/:id - 删除
        if (method === 'DELETE' && id) {
          const index = templates.findIndex((t) => t.id === id);
          if (index === -1) {
            return sendJson(res, { code: 'NOT_FOUND', message: 'Template not found' }, 404);
          }
          templates.splice(index, 1);
          res.statusCode = 204;
          res.end();
          return;
        }
      }

      // ==================== Mock Data API ====================
      if (resource === 'mock-data') {
        // GET /api/mock-data - 列表查询
        if (method === 'GET' && !id) {
          let result = mockDataStore;
          if (query.name) {
            result = result.filter((m) => m.name.includes(query.name as string));
          }
          if (query.schemaId) {
            result = result.filter((m) => m.schemaId === query.schemaId);
          }
          if (query.templateId) {
            result = result.filter((m) => m.templateId === query.templateId);
          }
          return sendJson(res, result);
        }

        // GET /api/mock-data/:id - 获取单个
        if (method === 'GET' && id) {
          const mock = mockDataStore.find((m) => m.id === id);
          if (!mock) {
            return sendJson(res, { code: 'NOT_FOUND', message: 'Mock data not found' }, 404);
          }
          return sendJson(res, mock);
        }

        // POST /api/mock-data - 创建
        if (method === 'POST' && !id) {
          const body = await parseBody<MockData>(req);
          const newId = body.id || uuid();
          const mock: MockData = { ...body, id: newId };
          mockDataStore.push(mock);
          return sendJson(res, mock, 201);
        }

        // PUT /api/mock-data/:id - 更新
        if (method === 'PUT' && id) {
          const index = mockDataStore.findIndex((m) => m.id === id);
          if (index === -1) {
            return sendJson(res, { code: 'NOT_FOUND', message: 'Mock data not found' }, 404);
          }
          const body = await parseBody<MockData>(req);
          mockDataStore[index] = { ...body, id };
          return sendJson(res, mockDataStore[index]);
        }

        // DELETE /api/mock-data/:id - 删除
        if (method === 'DELETE' && id) {
          const index = mockDataStore.findIndex((m) => m.id === id);
          if (index === -1) {
            return sendJson(res, { code: 'NOT_FOUND', message: 'Mock data not found' }, 404);
          }
          mockDataStore.splice(index, 1);
          res.statusCode = 204;
          res.end();
          return;
        }
      }

      // 未匹配的 API 路由
      return next();
    } catch (error) {
      console.error('[Mock Server] Error:', error);
      sendJson(res, { code: 'INTERNAL_ERROR', message: 'Internal server error' }, 500);
    }
  };
}

/**
 * Vite 插件：集成 Mock 服务
 */
export function mockServerPlugin() {
  return {
    name: 'vite-plugin-mock-server',
    configureServer(server: any) {
      server.middlewares.use('/api', createMockMiddleware());
      console.log('[Mock Server] Mock API 已启动，监听 /api/* 路由');
    },
  };
}
