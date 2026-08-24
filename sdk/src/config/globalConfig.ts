/**
 * SDK 全局配置模块
 * 提供归一化的全局配置入口，后续新增的全局级别参数都加到 SDKGlobalConfig 接口
 * @module globalConfig
 */

import type { AggregatorExecutor } from '../aggregators/types';

/**
 * SDK 全局配置接口
 * 后续新增的全局级别参数都加到此接口，不新增函数
 */
export interface SDKGlobalConfig {
  /** 是否对输出内容进行 HTML 转义（防止 XSS），默认 true */
  escapeHtml?: boolean;
  /** 全局聚合器执行器列表（实例级可覆盖） */
  aggregators?: AggregatorExecutor[];
}

/** 全局配置存储（模块级单例） */
const globalConfig: SDKGlobalConfig = {};

/**
 * 配置 SDK 全局参数
 * 影响所有后续创建的 PrintSDK 实例
 * @param config - 配置项，支持部分覆盖
 */
export function configureSDK(config: SDKGlobalConfig): void {
  Object.assign(globalConfig, config);
}

/**
 * 获取全局配置（内部使用）
 * @returns 当前全局配置对象
 */
export function getGlobalConfig(): SDKGlobalConfig {
  return globalConfig;
}
