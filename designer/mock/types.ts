/**
 * Schema 字段类型
 * 定义数据模型中支持的数据类型
 */
export type SchemaFieldType =
  | 'string'    // 字符串
  | 'number'    // 数字
  | 'boolean'   // 布尔值
  | 'date'      // 日期
  | 'datetime'  // 日期时间
  | 'object'    // 对象
  | 'array';    // 数组

/**
 * Schema 字段定义
 * 描述数据模型中的一个字段
 */
export interface SchemaField {
  /** 字段键名 */
  key: string;
  /** 字段显示名称 */
  label: string;
  /** 字段数据类型 */
  type: SchemaFieldType;
  /** 字段描述说明 */
  description?: string;
  /** 子字段列表（用于 object/array 类型） */
  children?: SchemaField[];
  /** 枚举值选项（用于 string/number 类型） */
  enum?: { value: string | number; label: string }[];
  /** 格式化类型（用于日期、金额等特殊显示） */
  format?: 'date' | 'datetime' | 'money' | 'percent';
}

/**
 * Schema 字典
 * 完整的数据模型定义，用于描述业务数据结构
 */
export interface SchemaDictionary {
  /** 唯一标识 */
  id: string;
  /** Schema 名称 */
  name: string;
  /** 根数据类型 */
  rootType: 'object' | 'array';
  /** 根字段定义 */
  root: SchemaField;
  /** 版本号 */
  version?: string;
  /** 描述说明 */
  description?: string;
}

/**
 * 页码配置（页面级）
 * 控制打印时页码的显示位置、格式和样式
 */
export interface PageNumberConfig {
  /** 是否显示页码 */
  enabled: boolean;
  /** 页码位置：6种预设位置 */
  position: 'bottom-center' | 'bottom-right' | 'bottom-left'
  | 'top-center' | 'top-right' | 'top-left';
  /** 页码格式：simple(1)、text(第1页 共3页)、slash(1/3)，默认 'slash' */
  format?: 'simple' | 'text' | 'slash';
  /** 页码前缀文本 */
  prefix?: string;
  /** 页码后缀文本 */
  suffix?: string;
  /** 分隔符（slash 模式下默认为 "/"） */
  separator?: string;
  /** X 轴偏移量（单位：mm） */
  offsetX?: number;
  /** Y 轴偏移量（单位：mm） */
  offsetY?: number;
  /** 页码样式 */
  style?: {
    /** 字体大小（px） */
    fontSize?: number;
    /** 字体颜色 */
    color?: string;
    /** 字重 */
    fontWeight?: 'normal' | 'bold';
  };
}

/**
 * 页面配置
 * 定义打印页面的尺寸、方向和边距
 */
export interface PageConfig {
  /** 页面尺寸：A4、A5、自定义、连续纸 */
  size: 'A4' | 'A5' | 'CUSTOM' | 'CONTINUOUS';
  /** 页面宽度（单位：mm），CUSTOM 时必填 */
  widthMm?: number;
  /** 页面高度（单位：mm），CUSTOM 时必填 */
  heightMm?: number;
  /** 连续纸最小高度（单位：mm） */
  minHeightMm?: number;
  /** 页面方向：纵向或横向 */
  orientation: 'portrait' | 'landscape';
  /** 页面边距（单位：mm） */
  marginMm: {
    /** 上边距 */
    top: number;
    /** 右边距 */
    right: number;
    /** 下边距 */
    bottom: number;
    /** 左边距 */
    left: number;
  };
  /** 页码配置 */
  pageNumber?: PageNumberConfig;
}

/**
 * 组件类型
 * 支持的打印组件类型
 */
export type ComponentType =
  | 'text'      // 文本组件
  | 'image'     // 图片组件
  | 'rect'      // 矩形组件
  | 'container' // 容器组件
  | 'table'     // 表格组件
  | 'line'      // 线条组件
  | 'qrcode'    // 二维码组件
  | 'barcode';  // 条形码组件

/**
 * 数据管道配置
 * 用于数据格式转换（如日期格式化、金额转换等）
 */
export interface PipeConfig {
  /** 管道类型：date、currency、money 等 */
  type: string;
  /** 管道配置选项 */
  options?: Record<string, any>;
}

/**
 * 数据绑定配置
 * 定义组件与数据的绑定关系
 */
export interface DataBinding {
  /** 数据路径（支持点号路径，如 'user.name'） */
  path: string;
  /** 数据管道列表（用于格式转换） */
  pipes?: PipeConfig[];
  /** 数据缺失时的回退值 */
  fallback?: string;
}

/**
 * 表格分页配置
 * 控制表格跨页时的行为
 */
export interface TablePaginationConfig {
  /** 跨页时是否重复表头，默认 true */
  repeatHeader?: boolean;
}

/**
 * 表格列合计配置
 * 定义表格列的合计计算方式
 */
export interface TableColumnSummary {
  /** 聚合类型：sum(求和)、avg(平均值)、max(最大值)、min(最小值)、count(计数) */
  type: 'sum' | 'avg' | 'max' | 'min' | 'count';
  /** 小数位数，默认 2 */
  precision?: number;
  /** 前缀，如 "￥" */
  prefix?: string;
  /** 后缀，如 "元" */
  suffix?: string;
}

/**
 * 表格列定义
 * 描述表格中的一列
 */
export interface TableColumn {
  /** 数据字段名（对应数据中的 key） */
  dataIndex: string;
  /** 列标题显示文本 */
  title: string;
  /** 列宽度（单位：mm） */
  width?: number;
  /** 文本对齐方式 */
  align?: 'left' | 'center' | 'right';
  /** 是否隐藏该列 */
  hidden?: boolean;
  /** 合计配置 */
  summary?: TableColumnSummary;
}

/**
 * 表格合计行样式
 * 定义合计行的外观样式
 */
export interface TableSummaryStyle {
  /** 背景颜色 */
  backgroundColor?: string;
  /** 字重（如 'bold'） */
  fontWeight?: string;
  /** 字体大小（px） */
  fontSize?: number;
}

/**
 * 表格组件属性
 * 定义表格组件的所有配置选项
 */
export interface TableProps {
  /** 列配置列表 */
  columns: TableColumn[];
  /** 是否显示表头，默认 true */
  showHeader?: boolean;
  /** 是否显示边框，默认 true */
  bordered?: boolean;
  /** 跨页时是否重复表头 */
  repeatHeader?: boolean;
  /** 是否显示合计行 */
  showSummary?: boolean;
  /** 合计模式：page=每页合计，total=仅最后一页合计，默认 'total' */
  summaryMode?: 'page' | 'total';
  /** 合计行首列标签，默认 "合计" */
  summaryLabel?: string;
  /** 合计行样式 */
  summaryStyle?: TableSummaryStyle;
  /** 当前页数据（SDK 内部使用） */
  _pageData?: any[];
  /** 是否显示表头（SDK 内部使用，用于控制跨页表头） */
  _showHeader?: boolean;
  /** 是否为最后一页（SDK 内部使用） */
  _isLastPage?: boolean;
  /** 全量数据（SDK 内部使用，用于总计模式） */
  _totalData?: any[];
}

/**
 * 组件节点
 * 打印模板中的一个组件实例
 */
export interface ComponentNode {
  /** 组件唯一标识 */
  id: string;
  /** 组件类型 */
  type: ComponentType;
  /** 布局配置 */
  layout: {
    /** 布局模式：绝对定位或流式布局 */
    mode: 'absolute' | 'flow';
    /** X 坐标（单位：mm），绝对定位时使用 */
    xMm?: number;
    /** Y 坐标（单位：mm），绝对定位时使用 */
    yMm?: number;
    /** 宽度（单位：mm） */
    widthMm?: number;
    /** 高度（单位：mm） */
    heightMm?: number;
    /** 层级顺序 */
    zIndex?: number;
  };
  /** 样式配置 */
  style?: Record<string, any>;
  /** 数据绑定配置 */
  binding?: DataBinding;
  /** 组件特定属性 */
  props?: Record<string, any>;
  /** 子组件列表（用于容器组件） */
  children?: ComponentNode[];
}

/**
 * 打印模板
 * 完整的打印模板定义，包含页面配置和组件列表
 */
export interface PrintTemplate {
  /** 模板唯一标识 */
  id: string;
  /** 模板名称 */
  name: string;
  /** 模板版本号 */
  version: string;
  /** 模板描述说明 */
  description?: string;
  /** 关联的 Schema ID */
  schemaId: string;
  /** 页面配置 */
  page: PageConfig;
  /** 布局模式：绝对定位或流式布局 */
  layoutMode: 'absolute' | 'flow';
  /** 组件列表 */
  components: ComponentNode[];
}

/**
 * Mock 数据
 * 用于测试的模拟数据
 */
export interface MockData {
  /** 数据唯一标识 */
  id: string;
  /** 数据名称 */
  name: string;
  /** 关联的 Schema ID */
  schemaId?: string;
  /** 关联的模板 ID */
  templateId?: string;
  /** 实际数据对象 */
  data: any;
  /** 数据描述说明 */
  description?: string;
}
