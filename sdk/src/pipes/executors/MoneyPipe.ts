/**
 * 金额转换管道
 * 支持分转元、元转分、千分位分隔等常见金额处理
 */

import Decimal from 'decimal.js';
import type { PipeExecutor } from '../types';

export const MoneyPipe: PipeExecutor = {
  type: 'money',
  label: '金额转换',

  execute(value: any, options?: Record<string, any>): any {
    if (value === null || value === undefined || value === '') return '';

    try {
      const num = new Decimal(value);

      // 转换模式：'fenToYuan' | 'yuanToFen' | 'none'
      const mode = options?.mode || 'fenToYuan'; // 默认分转元
      const precision = options?.precision ?? 2; // 默认保留2位小数
      const symbol = options?.symbol || ''; // 货币符号，默认无
      const separator = options?.separator === true; // 是否千分位分隔，默认 false

      let result: Decimal;

      // 执行转换
      switch (mode) {
        case 'fenToYuan':
          // 分转元：除以 100
          result = num.dividedBy(100);
          break;
        case 'yuanToFen':
          // 元转分：乘以 100
          result = num.times(100);
          break;
        case 'none':
        default:
          // 不转换，仅格式化
          result = num;
          break;
      }

      // 格式化精度
      let formatted = result.toFixed(precision);

      // 千分位分隔
      if (separator) {
        const parts = formatted.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        formatted = parts.join('.');
      }

      // 添加货币符号
      return symbol ? `${symbol}${formatted}` : formatted;
    } catch (error) {
      console.error('MoneyPipe execution error:', error);
      return String(value);
    }
  },
};
