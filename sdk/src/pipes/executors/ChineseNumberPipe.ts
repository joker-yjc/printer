/**
 * 中文大写数字管道
 * 将数字转换为会计大写中文形式（支持到亿级）
 */

import type { PipeExecutor } from '../types';

const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
const units = ['', '拾', '佰', '仟'];
const bigUnits = ['', '万', '亿'];

/**
 * 将整数转换为中文大写形式
 * @param n - 待转换的整数（非负）
 * @returns 中文大写数字字符串
 */
export function toChineseUppercaseInteger(n: number): string {
  if (n === 0) return '零';

  const str = String(n);
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

    if (smallUnitIndex === 0 && bigUnitIndex > 0) {
      const groupStart = Math.max(0, i - 3);
      let hasNonZero = false;
      for (let j = groupStart; j <= i; j++) {
        if (str[j] !== '0') {
          hasNonZero = true;
          break;
        }
      }
      if (hasNonZero) {
        result += bigUnits[bigUnitIndex];
        needZero = false;
      }
    }
  }

  return result;
}

/**
 * 将数字（含小数）转换为中文大写形式
 * 小数部分逐位读出，例如 3.14 → 叁点壹肆
 * @param n - 待转换的数字
 * @returns 中文大写数字字符串
 */
function toChineseUppercase(n: number): string {
  if (n === 0) return '零';
  if (n < 0) return '负' + toChineseUppercase(-n);

  const str = String(n);
  const dotIndex = str.indexOf('.');

  let intPart: number;
  let decPart = '';

  if (dotIndex >= 0) {
    intPart = parseInt(str.slice(0, dotIndex), 10);
    decPart = str.slice(dotIndex + 1);
  } else {
    intPart = n;
  }

  let result = toChineseUppercaseInteger(intPart);

  if (decPart) {
    result += '点';
    for (const ch of decPart) {
      result += digits[parseInt(ch, 10)];
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
        const separator = options?.separator;
        if (separator !== undefined) {
          return `${value}${separator}${formatted}`;
        }
        return `${value}（${formatted}）`;
      }

      return formatted;
    } catch (error) {
      console.warn('ChineseNumberPipe execution error:', error);
      return String(value);
    }
  },
};
