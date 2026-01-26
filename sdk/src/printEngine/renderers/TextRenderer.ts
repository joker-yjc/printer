/**
 * 文本组件渲染器
 */

import type { ComponentNode } from '../../types';
import type { ComponentRenderer, RenderContext, StyleObject } from '../types';
import { buildStyleString, buildPositionStyle } from '../utils/styleBuilder';
import { COMPONENT_DEFAULT_SIZE, STYLE_DEFAULT } from '../constants';

export class TextRenderer implements ComponentRenderer {
  readonly type = 'text';

  render(component: ComponentNode, context: RenderContext): string {
    const { layout, style, props, binding } = component;
    const value = context.resolveBinding(binding);

    // 支持 label 前缀
    const label = props?.label || '';
    const displayValue = value || props?.text || '';
    const fullText = label ? `${label}${displayValue}` : displayValue;

    // 基础定位样式
    const positionStyles = buildPositionStyle(
      layout.xMm || 0,
      layout.yMm || 0,
      layout.widthMm,
      layout.heightMm,
      context.mmToPx
    );

    // 文本样式
    const textStyles: StyleObject = {
      ...positionStyles,
      fontSize: `${style?.fontSize || STYLE_DEFAULT.FONT_SIZE}px`,
      color: style?.color || STYLE_DEFAULT.TEXT_COLOR,
      fontWeight: style?.fontWeight || STYLE_DEFAULT.FONT_WEIGHT,
      textAlign: style?.textAlign || STYLE_DEFAULT.TEXT_ALIGN,
      display: 'flex',
      alignItems: 'center',
      overflow: 'visible',
      whiteSpace: 'normal',
      wordBreak: 'break-word',
      lineHeight: STYLE_DEFAULT.LINE_HEIGHT,
    };

    const styleStr = buildStyleString(textStyles);

    return `<div style="${styleStr}">${fullText}</div>`;
  }

  calculateHeight(component: ComponentNode): number {
    // 文本组件高度：使用布局高度或默认值
    return component.layout.heightMm || COMPONENT_DEFAULT_SIZE.TEXT_HEIGHT;
  }
}
