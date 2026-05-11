/**
 * 中文大写数字管道
 * 将数字转换为会计大写中文形式（支持到亿级）
 */

import type { PipeExecutor } from '../types';

/**
 * 将数字转换为中文大写形式
 * @param n - 待转换的数字
 * @returns 中文大写数字字符串
 */
function toChineseUppercase(n: number): string {
  if (n === 0) return '零';

  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const units = ['', '拾', '佰', '仟'];
  const bigUnits = ['', '万', '亿'];

  const str = String(Math.floor(n));
  const len = str.length;

  if (len > 9) return String(n);

  let result = '';
  let needZero = false;

  for (let i = 0; i < len; i++) {
    const digit = parseInt(str[i], 10);
    const pos = len - i - 1;

    const bigUnitIndex = Math.floor(pos / 4);
    const smallUnitIndex = pos % 4;

    if (digit === 0) {
      needZero = true;
    } else {
      if (needZero) {
        result += '零';
        needZero = false;
      }
      result += digits[digit] + units[smallUnitIndex];
    }

    if (smallUnitIndex === 0 && digit === 0) {
      const groupStart = i - (pos % 4);
      const groupEnd = i;
      const group = str.slice(groupStart, groupEnd + 1);
      if (group.split('').some((c: string) => c !== '0')) {
        result += bigUnits[bigUnitIndex];
        needZero = false;
      }
    }
  }

  return result;
}

export const ChineseNumberPipe: PipeExecutor = {
  type: 'chineseNumber',
  label: '中文大写数字',

  execute(value: any, options?: Record<string, any>): any {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const num = Number(value);

    if (isNaN(num) || !isFinite(num)) {
      if (typeof value === 'string' && value.trim() !== '') {
        return value;
      }
      return '';
    }

    try {
      const mode = options?.mode || 'uppercase';
      const unit = options?.unit || '';

      const formatted = toChineseUppercase(num) + unit;

      if (mode === 'both') {
        return `${value}（${formatted}）`;
      }

      return formatted;
    } catch (error) {
      console.warn('ChineseNumberPipe execution error:', error);
      return String(value);
    }
  },
};
