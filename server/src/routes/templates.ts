import { Router } from 'express';
import { v4 as uuid } from 'uuid';

const router = Router();

export interface PageConfig {
  size: 'A4' | 'A5' | 'A6' | 'CUSTOM';
  widthMm?: number;
  heightMm?: number;
  orientation: 'portrait' | 'landscape';
  marginMm: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export type ComponentType = 'text' | 'image' | 'rect' | 'container' | 'table';

export interface PipeConfig {
  type: string;
  options?: Record<string, any>;
}

export interface DataBinding {
  path: string;
  pipes?: PipeConfig[];
  fallback?: string;
}

export interface ComponentNode {
  id: string;
  type: ComponentType;
  layout: {
    mode: 'absolute' | 'flow';
    xMm?: number;
    yMm?: number;
    widthMm?: number;
    heightMm?: number;
    zIndex?: number;
  };
  style?: Record<string, any>;
  binding?: DataBinding;
  props?: Record<string, any>;
  children?: ComponentNode[];
}

export interface PrintTemplate {
  id: string;
  name: string;
  version: string;
  description?: string;
  schemaId: string;
  page: PageConfig;
  layoutMode: 'absolute' | 'flow';
  components: ComponentNode[];
}

const templates: PrintTemplate[] = [];

router.post('/', (req, res, next) => {
  try {
    const body = req.body as PrintTemplate;
    const id = body.id || uuid();
    const template: PrintTemplate = { ...body, id };
    templates.push(template);
    res.status(201).json(template);
  } catch (err) {
    next(err);
  }
});

router.get('/', (req, res) => {
  const { name, schemaId } = req.query;
  let result = templates;
  if (typeof name === 'string' && name.trim()) {
    result = result.filter((t) => t.name.includes(name.trim()));
  }
  if (typeof schemaId === 'string' && schemaId.trim()) {
    result = result.filter((t) => t.schemaId === schemaId.trim());
  }
  res.json(result);
});

router.get('/:id', (req, res) => {
  const template = templates.find((t) => t.id === req.params.id);
  if (!template) {
    return res.status(404).json({
      code: 'NOT_FOUND',
      message: 'Template not found'
    });
  }
  res.json(template);
});

router.put('/:id', (req, res) => {
  const index = templates.findIndex((t) => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({
      code: 'NOT_FOUND',
      message: 'Template not found'
    });
  }
  const updated: PrintTemplate = { ...(req.body as PrintTemplate), id: req.params.id };
  templates[index] = updated;
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const index = templates.findIndex((t) => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({
      code: 'NOT_FOUND',
      message: 'Template not found'
    });
  }
  templates.splice(index, 1);
  res.status(204).end();
});

export default router;
