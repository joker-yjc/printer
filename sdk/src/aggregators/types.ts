/**
 * 聚合器系统类型定义
 * @module aggregators
 */

/**
 * 聚合器执行器接口（与 PipeExecutor 对称）
 * 负责对一列/一组的原始值执行聚合计算
 */
export interface AggregatorExecutor {
  /** 聚合类型标识，'sum' | 'avg' | 'max' | 'min' | 'count' | 自定义 */
  type: string;

  /** 显示名称 */
  label: string;

  /**
   * 执行聚合
   * @param values 该 dataIndex 路径上的原始值数组（未 Number 化、未过滤）
   * @param options 聚合选项（来自 TableColumnSummary.options）
   * @returns number 继续走 precision 格式化；string 作为最终文本直接输出；undefined 表示无效（无数值），统一落 '-'
   */
  aggregate(values: any[], options?: Record<string, any>): number | string | undefined;
}
