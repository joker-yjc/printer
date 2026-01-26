/**
 * 样式插件注册器
 * 负责管理和获取不同组件类型的样式插件
 */

import type { StylePlugin } from './types';
import { TextStylePlugin } from './TextStylePlugin';
import { TableStylePlugin } from './TableStylePlugin';
import { DefaultStylePlugin } from './DefaultStylePlugin';

/**
 * 插件注册表
 * 使用 Map 存储，key 为组件类型，value 为对应的样式插件
 */
const pluginRegistry = new Map<string, StylePlugin>();

/**
 * 注册插件
 * @param plugin 样式插件
 */
export function registerPlugin(plugin: StylePlugin): void {
  pluginRegistry.set(plugin.name, plugin);
}

/**
 * 获取插件
 * @param componentType 组件类型
 * @returns 对应的样式插件，如果未找到则返回默认插件
 */
export function getPlugin(componentType: string): StylePlugin {
  return pluginRegistry.get(componentType) || DefaultStylePlugin;
}

/**
 * 获取所有已注册的插件名称
 */
export function getRegisteredPlugins(): string[] {
  return Array.from(pluginRegistry.keys());
}

// 初始化：注册所有插件
registerPlugin(TextStylePlugin);
registerPlugin(TableStylePlugin);
registerPlugin(DefaultStylePlugin);
