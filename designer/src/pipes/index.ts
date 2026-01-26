/**
 * 管道系统入口文件
 * Designer 只保留 UI 配置器，执行器从 SDK 中导入
 */

// 从 SDK 导入类型和执行器
export * from '@printer/sdk';

// 导出本地配置器（UI 组件）
export * from './configurators';
