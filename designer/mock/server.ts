/**
 * Vite Mock 中间件插件
 * 从 Express server 迁移，提供完整的 CRUD API 支持
 */
import type { Connect } from 'vite';
import { mockStore } from '../src/services/mockStore';

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
  // 禁用浏览器缓存，避免开发时 Mock 数据更新后页面拿到旧列表
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(data));
}

/** 创建 Mock 中间件 */
export function createMockMiddleware(): Connect.NextHandleFunction {
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
        if (method === 'GET' && !id) {
          return sendJson(res, mockStore.listSchemas(query.name as string | undefined));
        }

        if (method === 'GET' && id) {
          const schema = mockStore.getSchema(id);
          if (!schema) {
            return sendJson(res, { code: 'NOT_FOUND', message: 'Schema not found' }, 404);
          }
          return sendJson(res, schema);
        }

        if (method === 'POST' && !id) {
          const body = await parseBody(req);
          const schema = mockStore.createSchema(body);
          return sendJson(res, schema, 201);
        }

        if (method === 'PUT' && id) {
          const body = await parseBody(req);
          const schema = mockStore.updateSchema(id, body);
          return sendJson(res, schema);
        }

        if (method === 'DELETE' && id) {
          mockStore.deleteSchema(id);
          res.statusCode = 204;
          res.end();
          return;
        }
      }

      // ==================== Templates API ====================
      if (resource === 'templates') {
        if (method === 'GET' && !id) {
          return sendJson(res, mockStore.listTemplates({
            name: query.name as string | undefined,
            schemaId: query.schemaId as string | undefined,
          }));
        }

        if (method === 'GET' && id) {
          const template = mockStore.getTemplate(id);
          if (!template) {
            return sendJson(res, { code: 'NOT_FOUND', message: 'Template not found' }, 404);
          }
          return sendJson(res, template);
        }

        if (method === 'POST' && !id) {
          const body = await parseBody(req);
          const template = mockStore.createTemplate(body);
          return sendJson(res, template, 201);
        }

        if (method === 'PUT' && id) {
          const body = await parseBody(req);
          const template = mockStore.updateTemplate(id, body);
          return sendJson(res, template);
        }

        if (method === 'DELETE' && id) {
          mockStore.deleteTemplate(id);
          res.statusCode = 204;
          res.end();
          return;
        }
      }

      // ==================== Mock Data API ====================
      if (resource === 'mock-data') {
        if (method === 'GET' && !id) {
          return sendJson(res, mockStore.listMockData({
            name: query.name as string | undefined,
            schemaId: query.schemaId as string | undefined,
            templateId: query.templateId as string | undefined,
          }));
        }

        if (method === 'GET' && id) {
          const mock = mockStore.getMockData(id);
          if (!mock) {
            return sendJson(res, { code: 'NOT_FOUND', message: 'Mock data not found' }, 404);
          }
          return sendJson(res, mock);
        }

        if (method === 'POST' && !id) {
          const body = await parseBody(req);
          const mock = mockStore.createMockData(body);
          return sendJson(res, mock, 201);
        }

        if (method === 'PUT' && id) {
          const body = await parseBody(req);
          const mock = mockStore.updateMockData(id, body);
          return sendJson(res, mock);
        }

        if (method === 'DELETE' && id) {
          mockStore.deleteMockData(id);
          res.statusCode = 204;
          res.end();
          return;
        }
      }

      // 未匹配的 API 路由
      return next();
    } catch (error) {
      console.error('[Mock Server] Error:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      sendJson(res, { code: 'INTERNAL_ERROR', message }, 500);
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
