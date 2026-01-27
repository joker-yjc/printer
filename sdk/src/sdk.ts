/**
 * 打印 SDK 统一导出
 * 这个文件将来可以直接独立为 @jcyao/print-sdk 包
 */

// 导出SDK主类（解耦版本，无需配置）
export { PrintSDK, createPrintSDK } from './PrintSDK';
export type {
  PrintOptions,
  BatchPrintOptions,
  BatchPrintProgress,
} from './PrintSDK';

// 导出打印引擎
export { PrintEngine, createPrintEngine } from './printEngine';
export type { ComponentRenderer, RenderContext } from './printEngine';

// 导出常量
export {
  MM_TO_PX,
  COMPONENT_DEFAULT_SIZE,
  TABLE_DEFAULT,
  STYLE_DEFAULT,
  TABLE_STYLE_DEFAULT,
  BARCODE_CONFIG,
  QRCODE_CONFIG
} from './printEngine/constants';

// 导出HTML模板工具
export {
  generatePrintPageStyles,
  generateBatchPrintStyles,
  generatePrintHTML,
  getPageSizeFromConfig,
} from './printEngine/htmlTemplate';

// 导出所有渲染器（允许用户扩展）
export {
  TextRenderer,
  TableRenderer,
  ImageRenderer,
  RectRenderer,
  LineRenderer,
  QRCodeRenderer,
  BarcodeRenderer,
} from './printEngine/renderers';

// 导出类型定义
export type {
  PrintTemplate,
  ComponentNode,
  DataBinding,
  PipeConfig,
  PageConfig,
  ComponentType,
  SchemaField,
  SchemaDictionary,
  MockData,
} from './types';
