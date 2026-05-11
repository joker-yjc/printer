/**
 * 金额转换管道
 * 支持分转元、元转分、千分位分隔、中文大写等常见金额处理
 */

import Decimal from 'decimal.js';
import type { PipeExecutor } from '../types';
import { toChineseUppercaseInteger } from './ChineseNumberPipe';

const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];

/**
 * 将金额（元）转换为中文大写金额
 * 遵循会计规范：元、角、分、整
 * @param amount - 金额（单位：元）
 * @returns 中文大写金额字符串
 */
function toChineseMoneyUppercase(amount: number): string {
  if (amount < 0) return '负' + toChineseMoneyUppercase(-amount);

  const yuan = Math.floor(amount);
  const fen = Math.round((amount - yuan) * 100);
  const jiao = Math.floor(fen / 10);
  const remainderFen = fen % 10;

  let result = '';

  // 元部分
  if (yuan > 0) {
    result = toChineseUppercaseInteger(yuan) + '元';
  }

  // 角
  if (jiao > 0) {
    result += digits[jiao] + '角';
  }

  // 分
  if (remainderFen > 0) {
    // 元 > 0 且角 = 0 时，分前需补"零"
    if (yuan > 0 && jiao === 0) {
      result += '零';
    }
    result += digits[remainderFen] + '分';
  }

  // 无角分时
  if (fen === 0) {
    if (yuan > 0) {
      result += '整';
    } else {
      result = '零元整';
    }
  }

  return result;
}

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
      const format = options?.format || 'number'; // 输出格式：'number' | 'chineseUppercase'

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

      // 中文大写金额
      if (format === 'chineseUppercase') {
        const uppercaseMode = options?.uppercaseMode || 'uppercase';
        const formatted = toChineseMoneyUppercase(result.toNumber());

        if (uppercaseMode === 'both') {
          const numberStr = result.toFixed(precision, Decimal.ROUND_DOWN);
          const connector = typeof options?.separator === 'string' ? options.separator : '';
          if (connector) {
            return `${numberStr}${connector}${formatted}`;
          }
          return `${numberStr}（${formatted}）`;
        }

        return formatted;
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
