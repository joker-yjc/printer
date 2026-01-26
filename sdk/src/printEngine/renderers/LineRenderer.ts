/**
 * 线条组件渲染器
 */

import type { ComponentNode } from '../../types';
import type { ComponentRenderer, RenderContext, StyleObject } from '../types';
import { buildStyleString, buildPositionStyle } from '../utils/styleBuilder';
import { COMPONENT_DEFAULT_SIZE, STYLE_DEFAULT } from '../constants';

export class LineRenderer implements ComponentRenderer {
  readonly type = 'line';

  render(component: ComponentNode, context: RenderContext): string {
    const { layout, style, props } = component;
    const direction = props?.direction || 'horizontal';

    const baseStyles = buildPositionStyle(
      layout.xMm || 0,
      layout.yMm || 0,
      undefined,
      undefined,
      context.mmToPx
    );

    const lineStyles: StyleObject = {
      ...baseStyles,
      width: direction === 'horizontal'
        ? `${(layout.widthMm || COMPONENT_DEFAULT_SIZE.LINE_LENGTH) * context.mmToPx}px`
        : `${style?.borderTopWidth || COMPONENT_DEFAULT_SIZE.LINE_WIDTH}px`,
      height: direction === 'horizontal'
        ? `${style?.borderTopWidth || COMPONENT_DEFAULT_SIZE.LINE_WIDTH}px`
        : `${(layout.heightMm || COMPONENT_DEFAULT_SIZE.LINE_LENGTH) * context.mmToPx}px`,
      background: style?.borderTopColor || STYLE_DEFAULT.TEXT_COLOR,
    };

    const styleStr = buildStyleString(lineStyles);

    return `<div style="${styleStr}"></div>`;
  }

  calculateHeight(component: ComponentNode, context: RenderContext): number {
    const direction = component.props?.direction || 'horizontal';
    if (direction === 'vertical') {
      return component.layout.heightMm || COMPONENT_DEFAULT_SIZE.LINE_LENGTH;
    }
    // 水平线条高度等于线条宽度（粗细）
    return (component.style?.borderTopWidth || COMPONENT_DEFAULT_SIZE.LINE_WIDTH) / context.mmToPx;
  }
}
