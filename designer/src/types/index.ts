/**
 * 设计器类型定义
 * 统一从 SDK 重新导出，保持单一数据源，避免重复维护
 */
export type {
  // Schema 相关
  SchemaFieldType,
  SchemaField,
  SchemaDictionary,
  // 页面配置
  PageNumberConfig,
  PageConfig,
  // 组件基础
  ComponentType,
  PageSection,
  // 管道相关
  PipeConfig,
  DataField,
  DataBinding,
  // 表格相关
  TableColumnSummary,
  TableColumn,
  TableColumnStyle,
  TableHeaderStyle,
  TableSummaryStyle,
  SummaryExtraRowItem,
  SummaryExtraRow,
  TableProps,
  // 模板相关
  ComponentNode,
  PrintTemplate,
  // Mock 数据
  MockData,
} from '@jcyao/print-sdk';
