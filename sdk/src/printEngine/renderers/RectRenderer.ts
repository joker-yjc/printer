/**
 * 矩形组件渲染器
 */

import type { ComponentNode } from '../../types';
import type { ComponentRenderer, RenderContext, StyleObject } from '../types';
import { buildStyleString, buildPositionStyle } from '../utils/styleBuilder';
import { COMPONENT_DEFAULT_SIZE, STYLE_DEFAULT } from '../constants';

export class RectRenderer implements ComponentRenderer {
  readonly type = 'rect';

  render(component: ComponentNode, context: RenderContext): string {
    const { layout, style } = component;

    const positionStyles = buildPositionStyle(
      layout.xMm || 0,
      layout.yMm || 0,
      layout.widthMm || COMPONENT_DEFAULT_SIZE.RECT_WIDTH,
      layout.heightMm || COMPONENT_DEFAULT_SIZE.RECT_HEIGHT,
      context.mmToPx
    );

    const rectStyles: StyleObject = {
      ...positionStyles,
      border: style?.border || STYLE_DEFAULT.BORDER,
      background: style?.background || STYLE_DEFAULT.BACKGROUND,
    };

    const styleStr = buildStyleString(rectStyles);

    return `<div style="${styleStr}"></div>`;
  }

  calculateHeight(component: ComponentNode): number {
    return component.layout.heightMm || COMPONENT_DEFAULT_SIZE.RECT_HEIGHT;
  }
}
