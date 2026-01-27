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
    const borderWidth = style?.borderTopWidth || COMPONENT_DEFAULT_SIZE.LINE_WIDTH;
    const borderColor = style?.borderTopColor || STYLE_DEFAULT.TEXT_COLOR;
    const borderStyle = style?.borderTopStyle || 'solid';

    // 外层容器：占据实际布局空间，使用 flex 居中
    const containerStyles = buildPositionStyle(
      layout.xMm || 0,
      layout.yMm || 0,
      layout.widthMm || COMPONENT_DEFAULT_SIZE.LINE_LENGTH,
      layout.heightMm || COMPONENT_DEFAULT_SIZE.LINE_LENGTH,
      context.mmToPx
    );

    const containerStyleWithFlex: StyleObject = {
      ...containerStyles,
      display: 'flex',
      alignItems: 'center',  // 垂直居中
      justifyContent: 'center',  // 水平居中
    };

    // 内层线条：统一使用 border 实现
    const lineStyles: StyleObject = direction === 'horizontal' ? {
      width: '100%',
      height: '0px',
      borderTop: `${borderWidth}px ${borderStyle} ${borderColor}`,
    } : {
      width: '0px',
      height: '100%',
      borderLeft: `${borderWidth}px ${borderStyle} ${borderColor}`,
    };

    const containerStyleStr = buildStyleString(containerStyleWithFlex);
    const lineStyleStr = buildStyleString(lineStyles);

    return `<div style="${containerStyleStr}"><div style="${lineStyleStr}"></div></div>`;
  }

  calculateHeight(component: ComponentNode, context: RenderContext): number {
    // 线条组件现在使用双层结构（外层容器 + 内层线条）
    // 应该返回外层容器的高度，即 layout.heightMm
    return component.layout.heightMm || COMPONENT_DEFAULT_SIZE.LINE_LENGTH;
  }
}
