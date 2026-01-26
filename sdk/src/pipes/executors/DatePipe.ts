/**
 * 日期格式化管道
 */

import type { PipeExecutor } from '../types';

export const DatePipe: PipeExecutor = {
  type: 'date',
  label: '日期格式化',

  execute(value: any, options?: Record<string, any>): any {
    if (!value) return '';

    const format = options?.format || 'YYYY-MM-DD';
    const date = new Date(value);

    if (isNaN(date.getTime())) return String(value);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },
};
