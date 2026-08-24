/**
 * 内置聚合器
 * 数值化语义与既有 calculateSummary 保持一致（Number + 过滤 NaN）
 * @module builtins
 */

import Decimal from 'decimal.js';
import type { AggregatorExecutor } from './types';

/**
 * 数值化：Number(val) + 过滤 NaN
 * 注：Number('')=0、Number(null)=0、Number(undefined)=NaN（被过滤），沿用现状
 * @param values 原始值数组
 * @returns 过滤后的数值数组
 */
export function toNumericValues(values: any[]): number[] {
  return values.map(v => Number(v)).filter(v => !isNaN(v));
}

export const SumAggregator: AggregatorExecutor = {
  type: 'sum',
  label: '求和',
  aggregate(values) {
    const nums = toNumericValues(values);
    if (nums.length === 0) return undefined;
    return nums.reduce((s, v) => s.plus(v), new Decimal(0)).toNumber();
  },
};

export const AvgAggregator: AggregatorExecutor = {
  type: 'avg',
  label: '平均',
  aggregate(values) {
    const nums = toNumericValues(values);
    if (nums.length === 0) return undefined;
    return nums.reduce((s, v) => s.plus(v), new Decimal(0)).dividedBy(nums.length).toNumber();
  },
};

export const MaxAggregator: AggregatorExecutor = {
  type: 'max',
  label: '最大',
  aggregate(values) {
    const nums = toNumericValues(values);
    if (nums.length === 0) return undefined;
    return Decimal.max(...nums.map(v => new Decimal(v))).toNumber();
  },
};

export const MinAggregator: AggregatorExecutor = {
  type: 'min',
  label: '最小',
  aggregate(values) {
    const nums = toNumericValues(values);
    if (nums.length === 0) return undefined;
    return Decimal.min(...nums.map(v => new Decimal(v))).toNumber();
  },
};

export const CountAggregator: AggregatorExecutor = {
  type: 'count',
  label: '计数',
  aggregate(values) {
    const nums = toNumericValues(values);
    if (nums.length === 0) return undefined;
    return nums.length;
  },
};
