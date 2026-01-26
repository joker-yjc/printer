/**
 * 打印引擎插件化架构 - 类型定义
 */

import type { ComponentNode, DataBinding, PipeConfig } from '../types';

/**
 * 渲染上下文
 * 提供给渲染器插件使用的公共方法和数据
 */
export interface RenderContext {
  /**
   * 业务数据
   */
  data: any;

  /**
   * 解析数据绑定，返回最终值
   */
  resolveBinding(binding?: DataBinding): string;

  /**
   * 应用管道转换
   */
  applyPipes(value: any, pipes?: PipeConfig[]): any;

  /**
   * 根据路径获取数据值
   */
  getValueByPath(path: string, fallback?: string): any;

  /**
   * 格式化日期
   */
  formatDate(value: any, format: string): string;

  /**
   * mm 转 px 系数（3.78）
   */
  mmToPx: number;

  /**
   * 页面信息（用于计算可用宽度）
   */
  pageInfo?: {
    widthMm: number;   // 页面总宽度
    heightMm: number;  // 页面总高度
    marginMm: {        // 页边距
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
}

/**
 * 组件渲染器接口
 * 所有组件渲染器必须实现此接口
 */
export interface ComponentRenderer {
  /**
   * 组件类型标识
   */
  readonly type: string;

  /**
   * 渲染组件为 HTML 字符串
   * @param component 组件配置
   * @param context 渲染上下文
   * @returns HTML 字符串
   */
  render(component: ComponentNode, context: RenderContext): string;

  /**
   * 计算组件高度（可选，用于分页）
   * @param component 组件配置
   * @param context 渲染上下文
   * @returns 高度（mm）
   */
  calculateHeight?(component: ComponentNode, context: RenderContext): number;
}

/**
 * 样式对象类型
 */
export type StyleObject = Record<string, string | number>;

/**
 * 样式构建辅助函数类型
 */
export type StyleBuilder = (styles: StyleObject) => string;

/**
 * 分页项（单个组件在某页的信息）
 */
export interface PageItem {
  type: ComponentNode['type'];  // 组件类型
  index: number;                 // 组件在 components 中的索引
  begin?: number;                // 表格专用：起始行索引
  end?: number;                  // 表格专用：结束行索引
}

/**
 * 页面层级（流式层 + 覆盖层）
 */
export interface PageLayers {
  flowLayer: ComponentNode[];    // 流式层组件（zIndex = 0）
  overlayLayer: ComponentNode[]; // 覆盖层组件（zIndex ≠ 0）
}

/**
 * 分页结果（多页，每页包含流式层和覆盖层）
 */
export type Pages = PageLayers[];
