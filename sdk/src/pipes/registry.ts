/**
 * 管道注册器
 * 负责管理管道执行器
 */

import type { PipeExecutor } from './types';
import * as Executors from './executors';

/**
 * 管道执行器注册表
 */
const executorRegistry = new Map<string, PipeExecutor>();

/**
 * 注册管道执行器
 */
export function registerExecutor(executor: PipeExecutor): void {
  executorRegistry.set(executor.type, executor);
}

/**
 * 获取管道执行器
 */
export function getExecutor(type: string): PipeExecutor | undefined {
  return executorRegistry.get(type);
}

/**
 * 获取所有已注册的管道（用于下拉选择）
 */
export function getAllPipes(): Array<{ value: string; label: string }> {
  const pipes: Array<{ value: string; label: string }> = [];
  executorRegistry.forEach((executor) => {
    pipes.push({
      value: executor.type,
      label: executor.label,
    });
  });
  return pipes;
}

/**
 * 执行管道转换
 */
export function executePipe(type: string, value: any, options?: Record<string, any>): any {
  const executor = getExecutor(type);
  if (!executor) {
    console.warn(`Pipe executor not found: ${type}`);
    return value;
  }
  return executor.execute(value, options);
}

// ========== 初始化：注册所有内置管道 ==========

// 注册执行器
registerExecutor(Executors.DatePipe);
registerExecutor(Executors.CurrencyPipe);
registerExecutor(Executors.UppercasePipe);
registerExecutor(Executors.LowercasePipe);
registerExecutor(Executors.SlicePipe);
registerExecutor(Executors.DefaultPipe);
