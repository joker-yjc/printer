/**
 * 样式插件系统类型定义
 */

import type { ComponentNode } from '../../../../../types';

/**
 * 样式插件接口
 * 每个组件类型可以实现自己的样式配置插件
 */
export interface StylePlugin {
  /**
   * 插件名称（应与组件类型匹配）
   */
  name: string;

  /**
   * 渲染样式配置UI
   * @param component 当前组件
   * @param onStyleChange 样式变更回调
   * @param onPropsChange Props变更回调
   * @param onLayoutChange 布局变更回调（可选）
   */
  render: (
    component: ComponentNode,
    onStyleChange: (field: string, value: any) => void,
    onPropsChange: (field: string, value: any) => void,
    onLayoutChange?: (field: string, value: any) => void
  ) => React.ReactNode;
}
