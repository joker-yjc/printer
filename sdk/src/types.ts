// Schema 相关类型定义
export type SchemaFieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'object'
  | 'array';

export interface SchemaField {
  key: string;
  label: string;
  type: SchemaFieldType;
  description?: string;
  children?: SchemaField[];
  enum?: { value: string | number; label: string }[];
  format?: 'date' | 'datetime' | 'money' | 'percent';
}

export interface SchemaDictionary {
  id: string;
  name: string;
  rootType: 'object' | 'array';
  root: SchemaField;
  version?: string;
  description?: string;
}

// 模板相关类型定义
export interface PageConfig {
  size: 'A4' | 'A5' | 'CUSTOM' | 'CONTINUOUS';
  widthMm?: number;
  heightMm?: number;
  minHeightMm?: number; // 连续纸最小高度
  orientation: 'portrait' | 'landscape';
  marginMm: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export type ComponentType = 'text' | 'image' | 'rect' | 'container' | 'table' | 'line' | 'qrcode' | 'barcode';

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

// Mock 数据类型定义
export interface MockData {
  id: string;
  name: string;
  schemaId?: string;
  templateId?: string;
  data: any;
  description?: string;
}
