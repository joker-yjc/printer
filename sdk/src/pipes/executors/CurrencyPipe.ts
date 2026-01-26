/**
 * 货币格式化管道
 */

import type { PipeExecutor } from '../types';

export const CurrencyPipe: PipeExecutor = {
  type: 'currency',
  label: '货币格式化',

  execute(value: any, options?: Record<string, any>): any {
    const symbol = options?.symbol || '¥';
    const precision = options?.precision ?? 2;
    return `${symbol}${Number(value || 0).toFixed(precision)}`;
  },
};
