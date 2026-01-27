/**
 * 管道执行器集合
 * 导出所有内置管道执行器
 */

export { DatePipe } from './DatePipe';
export { CurrencyPipe } from './CurrencyPipe';
export { MoneyPipe } from './MoneyPipe';

/**
 * 简单管道执行器（无需配置选项）
 */
import type { PipeExecutor } from '../types';

export const UppercasePipe: PipeExecutor = {
  type: 'uppercase',
  label: '转大写',
  execute: (value: any) => String(value).toUpperCase(),
};

export const LowercasePipe: PipeExecutor = {
  type: 'lowercase',
  label: '转小写',
  execute: (value: any) => String(value).toLowerCase(),
};

export const SlicePipe: PipeExecutor = {
  type: 'slice',
  label: '截取字符串',
  execute: (value: any, options?: Record<string, any>) => {
    const start = options?.start || 0;
    const end = options?.end;
    return String(value).slice(start, end);
  },
};

export const DefaultPipe: PipeExecutor = {
  type: 'default',
  label: '默认值',
  execute: (value: any, options?: Record<string, any>) => {
    return value || options?.defaultValue || '';
  },
};
