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

// 表格分页配置
export interface TablePaginationConfig {
  repeatHeader?: boolean;  // 跨页是否重复表头（默认 true）
}

// 表格列合计配置
export interface TableColumnSummary {
  type: 'sum' | 'avg' | 'max' | 'min' | 'count';  // 聚合类型
  precision?: number;   // 小数位数，默认 2
  prefix?: string;      // 前缀，如 "￥"
  suffix?: string;      // 后缀，如 "元"
}

// 表格列定义
export interface TableColumn {
  dataIndex: string;       // 字段名
  title: string;           // 列标题
  width?: number;          // 列宽度
  align?: 'left' | 'center' | 'right';  // 对齐方式
  hidden?: boolean;        // 是否隐藏
  summary?: TableColumnSummary;  // 合计配置
}

// 表格合计行样式
export interface TableSummaryStyle {
  backgroundColor?: string;  // 背景色
  fontWeight?: string;       // 字重
  fontSize?: number;         // 字号
}

// 表格组件 props 类型
export interface TableProps {
  columns: TableColumn[];           // 列配置
  showHeader?: boolean;             // 是否显示表头
  bordered?: boolean;               // 是否显示边框
  repeatHeader?: boolean;           // 跨页重复表头
  showSummary?: boolean;            // 是否显示合计行
  summaryMode?: 'page' | 'total';   // 合计模式：page=每页合计，total=仅最后一页合计（默认）
  summaryLabel?: string;            // 合计行首列标签，默认 "合计"
  summaryStyle?: TableSummaryStyle; // 合计行样式
  _pageData?: any[];                // 分页数据（内部使用）
  _showHeader?: boolean;            // 是否显示表头（内部使用）
  _isLastPage?: boolean;            // 是否为最后一页（内部使用）
  _totalData?: any[];               // 全量数据（内部使用，用于总计模式）
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
