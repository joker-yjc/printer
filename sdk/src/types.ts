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

// 页码配置（页面级）
export interface PageNumberConfig {
  enabled: boolean;                          // 是否显示页码
  position: 'bottom-center' | 'bottom-right' | 'bottom-left'
  | 'top-center' | 'top-right' | 'top-left'
  | 'custom';                                 // 自定义位置
  customX?: number;                           // 自定义 X 坐标 (mm)，页面左上角为原点
  customY?: number;                           // 自定义 Y 坐标 (mm)，页面左上角为原点
  format?: 'simple' | 'text' | 'slash';     // 格式：默认 'slash'
  prefix?: string;                           // 前缀
  suffix?: string;                           // 后缀
  separator?: string;                        // 分隔符（slash模式下默认为 "/"）
  offsetX?: number;                          // X 偏移 (mm)，仅预设模式
  offsetY?: number;                          // Y 偏移 (mm)，仅预设模式
  style?: {
    fontSize?: number;                       // 字体大小
    color?: string;                          // 颜色
    fontWeight?: 'normal' | 'bold';          // 字重
  };
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
  pageNumber?: PageNumberConfig;  // 页码配置
  /** 是否启用页头区域，默认 false */
  headerEnabled?: boolean;
  /** 页头区域高度（mm），默认自动计算；设置后作为最小高度 */
  headerHeight?: number;
  /** 是否启用页脚区域，默认 false */
  footerEnabled?: boolean;
  /** 页脚区域高度（mm），默认自动计算；设置后作为最小高度 */
  footerHeight?: number;
}

export type ComponentType = 'text' | 'image' | 'rect' | 'container' | 'table' | 'line' | 'qrcode' | 'barcode';

/** 组件所属的页面区域 */
export type PageSection = 'header' | 'content' | 'footer';

export interface PipeConfig {
  type: string;
  options?: Record<string, any>;
}

/**
 * 可应用管道转换的数据字段
 * 表示一个可附加管道链的数据点，用于统一 DataBinding、TableColumn 等场景的管道能力
 */
export interface DataField {
  /** 数据管道列表，按顺序执行，前一个输出作为后一个输入 */
  pipes?: PipeConfig[];
}

export interface DataBinding extends DataField {
  path?: string;
  fallback?: string;
}

// 表格列合计配置
export interface TableColumnSummary {
  type: 'sum' | 'avg' | 'max' | 'min' | 'count';  // 聚合类型
  precision?: number;   // 小数位数，默认 2
  prefix?: string;      // 前缀，如 "￥"
  suffix?: string;      // 后缀，如 "元"
  /** 管道配置，用于对合计值进行转换（如中文大写） */
  pipe?: PipeConfig;
}

// 表格列定义
export interface TableColumn extends DataField {
  dataIndex: string;       // 字段名
  title: string;           // 列标题
  width?: number;          // 列宽度
  /** 对齐方式（保留兼容，优先级低于 style.textAlign） */
  align?: 'left' | 'center' | 'right';  // 对齐方式
  hidden?: boolean;        // 是否隐藏
  summary?: TableColumnSummary;  // 合计配置
  /** 数据单元格样式（覆盖默认值） */
  style?: TableColumnStyle;
  /** 表头单元格样式（优先级高于 tableHeaderStyle） */
  headerStyle?: TableColumnStyle;
}

/**
 * 列级单元格样式配置
 * 用于覆盖表头或数据单元格的默认样式，所有字段可选
 */
export interface TableColumnStyle {
  /** 字体大小（px） */
  fontSize?: number;
  /** 字重，如 'normal'、'bold'、600 */
  fontWeight?: string | number;
  /** 文字颜色 */
  color?: string;
  /** 背景颜色（类型保留，设计器暂不开放 UI） */
  backgroundColor?: string;
  /** 对齐方式 */
  textAlign?: 'left' | 'center' | 'right';
}

/**
 * 表格表头默认样式（表格级配置）
 * 会被列级 headerStyle 覆盖
 */
export interface TableHeaderStyle {
  /** 表头背景色，默认 '#fafafa' */
  backgroundColor?: string;
  /** 表头字重，默认 600 */
  fontWeight?: string | number;
  /** 表头字体大小（px） */
  fontSize?: number;
  /** 表头文字颜色 */
  color?: string;
  /** 表头对齐方式 */
  textAlign?: 'left' | 'center' | 'right';
}

// 表格合计行样式
export interface TableSummaryStyle {
  backgroundColor?: string;  // 背景色
  fontWeight?: string;       // 字重
  fontSize?: number;         // 字号
  textAlign?: 'left' | 'center' | 'right';  // 水平对齐
}

// 页码组件 props 类型
export interface PageNumberProps {
  format?: 'simple' | 'text' | 'slash';  // 页码格式：simple=1 2 3, text=第1页 共3页, slash=1/3
  align?: 'left' | 'center' | 'right';   // 对齐方式
  prefix?: string;                        // 前缀文字
  suffix?: string;                        // 后缀文字
  separator?: string;                     // 分隔符（slash模式下默认为 "/"）
  _currentPage?: number;                  // 当前页码（内部使用）
  _totalPages?: number;                   // 总页数（内部使用）
}

/**
 * 分组小计数据项
 * 类似 SummaryExtraRowItem：每个数据项引用一个合计列，可单独配置前缀与管道
 * pipes（继承自 DataField）在聚合后的原始数值上执行（与额外行语义一致），
 * 不经过列级 summary 的 precision/prefix/suffix 格式化，precision 等由管道自行控制
 */
export interface GroupSummaryItem extends DataField {
  /** 静态前缀文字（如 "金额："），可选 */
  label?: string;
  /** 引用列的 dataIndex，该列需配置 column.summary */
  sourceColumn: string;
}

/**
 * 表格分组配置
 * 单级分组，按指定字段将扁平数据切分为多组，组间插入标题/小计行
 */
export interface TableGroupConfig {
  /** 分组字段，支持点号路径，如 "category" / "product.type"，必填 */
  field: string;

  // ── 分组标题（header）相关：集中在一起 ──

  /** 是否显示分组标题行，默认 true */
  showHeader?: boolean;

  /** 空值分组的标题，默认 "未分组"（归入标题分区，便于与标题样式一起配置） */
  emptyGroupLabel?: string;

  /**
   * 分组键的管道转换，复用现有 Pipe 系统
   * 用于对分组字段原始值做展示层转换（如字典映射、日期格式化、大小写等）
   * 例：field="status" + pipes=[{type:'dict', options:{map:{'01':'蔬果'}}}] → 标题显示"蔬果"
   * 执行时机：TableRenderer 渲染分组标题前 `context.applyPipes(rawGroupKey, pipes)`
   * 失败回退：管道抛错时回退原值，不阻塞渲染（与列级 pipes 一致）
   * 若评估改动过大或不需要，可直接取消本字段，标题即原值
   */
  pipes?: PipeConfig[];

  /** 分组标题行样式，复用 TableSummaryStyle 形态 */
  headerStyle?: TableSummaryStyle;

  // ── 分组小计（summary）相关：集中在一起 ──

  /** 是否显示分组小计行，默认 true */
  showSummary?: boolean;

  /**
   * 分组小计标签，默认 "{group}小计"
   * 支持占位 {group}，最终文本为：标签 + 汇总列拼接（如 "蔬果小计：89.19"）
   */
  summaryLabel?: string;

  /** 分组小计行样式，复用 TableSummaryStyle 形态 */
  summaryStyle?: TableSummaryStyle;

  /**
   * 小计数据项列表
   * 每项引用一个合计列（该列需配置 column.summary），可单独设置 label 与 pipes
   * 未配置时自动取所有配了 column.summary 的列做小计
   * 渲染为单行跨列文本，各项按顺序拼接
   */
  summaryItems?: GroupSummaryItem[];

  /**
   * 预留：分组排序扩展位（本期不实现）
   * 首版组顺序 = 数据中首次出现顺序（稳定，不排序）
   * 后续计划二选一或组合：
   *  1) 模板内声明式：{ sortField: string, sortOrder: 'asc'|'desc' } 按组键或组内聚合值排序
   *  2) 运行时函数式：createPrintSDK({ groupSortComparator: (a,b)=>number }) 传入自定义比较函数（函数不进模板 JSON，避免序列化问题）
   * 本期接口先不暴露，保持可扩展，避免让用户在"按哪个字段排"上做额外选择
   */
  // sort?: 'asc' | 'desc' | 'none'; // 预留，未启用
  // sortField?: string; sortOrder?: 'asc'|'desc'; // 预留
  // groupSortComparator?: (a: GroupedData, b: GroupedData) => number; // 预留（运行时）
}

// 表格组件 props 类型
export interface TableProps {
  columns: TableColumn[];           // 列配置
  showHeader?: boolean;             // 是否显示表头
  bordered?: boolean;               // 是否显示边框
  /** 边框样式，默认 'solid'（仅在 bordered 为 true 时生效） */
  borderStyle?: 'solid' | 'dashed';
  /** 边框颜色，默认 '#d9d9d9'（仅在 bordered 为 true 时生效） */
  borderColor?: string;
  /** 边框线宽（px），默认 1，范围 1-5（仅在 bordered 为 true 时生效） */
  borderWidth?: number;
  repeatHeader?: boolean;           // 跨页重复表头
  showSummary?: boolean;            // 是否显示合计行
  /** 表格密度预设，不传时为 'normal' */
  density?: 'normal' | 'compact';
  /** 合计行显示模式，向后兼容 showSummary */
  summaryDisplay?: 'both' | 'none' | 'extra-only';
  summaryMode?: 'page' | 'total';   // 合计模式：page=每页合计，total=仅最后一页合计（默认）
  summaryLabel?: string;            // 合计行首列标签，默认 "合计"
  summaryStyle?: TableSummaryStyle; // 合计行样式
  /** 是否显示序号列 */
  showRowNumber?: boolean;
  /** 序号列标题，默认"序号" */
  rowNumberLabel?: string;
  /** 行号列宽度（mm），不设置时自动分配 */
  rowNumberWidth?: number;
  /** 表头默认样式（表格级），会被列级 headerStyle 覆盖 */
  headerStyle?: TableHeaderStyle;
  /** 序号列数据单元格样式 */
  rowNumberStyle?: TableColumnStyle;
  /** 序号列表头单元格样式 */
  rowNumberHeaderStyle?: TableColumnStyle;
  _pageData?: any[];                // 分页数据（内部使用）
  _showHeader?: boolean;            // 是否显示表头（内部使用）
  _isLastPage?: boolean;            // 是否为最后一页（内部使用）
  _totalData?: any[];               // 全量数据（内部使用，用于总计模式）
  /** 当前页起始行号（内部使用，由分页引擎注入） */
  _startRowIndex?: number;
  /** 本页应渲染分组小计的组 key 列表（内部使用，中间拆分块不含小计） */
  _groupSummaryKeys?: string[];
  /** 合计额外行配置 */
  summaryExtraRows?: SummaryExtraRow[];
  /** 分组配置，未设置时为普通表格 */
  groupBy?: TableGroupConfig;
}

// 合计额外行数据项
export interface SummaryExtraRowItem extends DataField {
  /** 静态前缀文字 */
  label?: string;
  /** 引用列的合计值（dataIndex） */
  sourceColumn?: string;
}

// 合计额外行配置
export interface SummaryExtraRow {
  /** 行内数据项，内容按顺序拼接 */
  items: SummaryExtraRowItem[];
  /** 背景色 */
  backgroundColor?: string;
  /** 字重 */
  fontWeight?: string;
  /** 对齐方式，默认 left */
  align?: 'left' | 'center' | 'right';
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
  /** 内部使用：组件所属的页面区域 */
  _section?: PageSection;
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
  /** 页头区域组件，可选（老模板无此字段） */
  headerComponents?: ComponentNode[];
  /** 页脚区域组件，可选 */
  footerComponents?: ComponentNode[];
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
