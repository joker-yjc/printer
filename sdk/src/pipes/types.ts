/**
 * 数据管道系统类型定义
 */

import type { PipeConfig } from '../types';

/**
 * 管道执行器接口
 * 负责执行数据转换逻辑（后端）
 */
export interface PipeExecutor {
  /**
   * 管道类型标识
   */
  type: string;

  /**
   * 管道显示名称
   */
  label: string;

  /**
   * 执行管道转换
   * @param value 输入值
   * @param options 管道配置选项
   * @returns 转换后的值
   */
  execute(value: any, options?: Record<string, any>): any;
}
