/**
 * 打印引擎常量配置
 */

/**
 * 单位换算系数
 */
export const MM_TO_PX = 3.78; // 96 DPI 下 1mm = 3.78px

/**
 * 组件默认尺寸（单位：mm）
 */
export const COMPONENT_DEFAULT_SIZE = {
  /** 文本组件默认宽度 */
  TEXT_WIDTH: 100,
  /** 文本组件默认高度 */
  TEXT_HEIGHT: 8,

  /** 图片组件默认宽度 */
  IMAGE_WIDTH: 50,
  /** 图片组件默认高度 */
  IMAGE_HEIGHT: 50,

  /** 矩形组件默认宽度 */
  RECT_WIDTH: 50,
  /** 矩形组件默认高度 */
  RECT_HEIGHT: 30,

  /** 线条组件默认长度（水平/垂直） */
  LINE_LENGTH: 100,
  /** 线条组件默认宽度（线条粗细） */
  LINE_WIDTH: 1,

  /** 二维码默认尺寸（正方形） */
  QRCODE_SIZE: 30,

  /** 条形码默认宽度 */
  BARCODE_WIDTH: 60,
  /** 条形码默认高度 */
  BARCODE_HEIGHT: 20,

  /** 表格组件默认宽度 */
  TABLE_WIDTH: 100,
  /** 表格组件默认高度（估算） */
  TABLE_HEIGHT: 60,
} as const;

/**
 * 表格默认尺寸配置
 */
export const TABLE_DEFAULT = {
  /** 表头行高度（mm） */
  HEADER_HEIGHT: 10,
  /** 数据行最小高度（mm） */
  MIN_ROW_HEIGHT: 8,
  /** 行高计算系数（用于 min-height，实际高度由内容撑开） */
  ROW_HEIGHT_FACTOR: 1.0,
} as const;

/**
 * 样式默认值
 */
export const STYLE_DEFAULT = {
  /** 默认字体大小（px） */
  FONT_SIZE: 14,
  /** 默认文本颜色 */
  TEXT_COLOR: '#000',
  /** 默认字体粗细 */
  FONT_WEIGHT: 'normal',
  /** 默认文本对齐 */
  TEXT_ALIGN: 'left',
  /** 默认行高 */
  LINE_HEIGHT: '1.5',
  /** 默认边框 */
  BORDER: '1px solid #000',
  /** 默认背景色 */
  BACKGROUND: 'transparent',
} as const;

/**
 * 表格样式默认值
 */
export const TABLE_STYLE_DEFAULT = {
  /** 表格默认字体大小（px） */
  FONT_SIZE: 12,
  /** 表格边框颜色 */
  BORDER_COLOR: '#d9d9d9',
  /** 表头背景色 */
  HEADER_BACKGROUND: '#fafafa',
  /** 单元格内边距 */
  CELL_PADDING: '4px 8px',
} as const;

/**
 * 条形码渲染配置
 */
export const BARCODE_CONFIG = {
  /** 默认条形码格式 */
  DEFAULT_FORMAT: 'CODE128',
  /** 条形码高度占容器高度的比例 */
  HEIGHT_RATIO: 0.8,
  /** 默认条形码内容 */
  DEFAULT_CONTENT: '1234567890',
} as const;

/**
 * 二维码渲染配置
 */
export const QRCODE_CONFIG = {
  /** 默认二维码内容 */
  DEFAULT_CONTENT: 'https://example.com',
} as const;
