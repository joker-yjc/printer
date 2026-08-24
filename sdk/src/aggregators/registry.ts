/**
 * 聚合器注册表
 * 负责管理聚合器执行器
 * @module registry
 */

import type { AggregatorExecutor } from './types';
import {
  SumAggregator,
  AvgAggregator,
  MaxAggregator,
  MinAggregator,
  CountAggregator,
} from './builtins';

const aggregatorRegistry = new Map<string, AggregatorExecutor>();

/**
 * 注册聚合器执行器
 * @param executor 聚合器执行器
 */
export function registerAggregator(executor: AggregatorExecutor): void {
  aggregatorRegistry.set(executor.type, executor);
}

/**
 * 获取聚合器执行器
 * @param type 聚合类型标识
 * @returns 聚合器执行器，未注册时返回 undefined
 */
export function getAggregator(type: string): AggregatorExecutor | undefined {
  return aggregatorRegistry.get(type);
}

/**
 * 获取所有已注册聚合器类型标识（快照）
 */
export function getRegisteredAggregatorTypes(): Set<string> {
  return new Set(aggregatorRegistry.keys());
}

/**
 * 执行聚合（内置兜底）
 * 找不到执行器时告警并返回 undefined，由上层统一处理为 '-'
 * @param type 聚合类型标识
 * @param values 原始值数组
 * @param options 聚合选项
 * @returns 聚合结果，找不到执行器时返回 undefined
 */
export function executeAggregate(type: string, values: any[], options?: Record<string, any>): number | string | undefined {
  const aggregator = getAggregator(type);
  if (!aggregator) {
    console.warn(`Aggregator not found: ${type}`);
    return undefined;
  }
  return aggregator.aggregate(values, options);
}

// 初始化：注册内置聚合器
registerAggregator(SumAggregator);
registerAggregator(AvgAggregator);
registerAggregator(MaxAggregator);
registerAggregator(MinAggregator);
registerAggregator(CountAggregator);
