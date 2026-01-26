/**
 * 图片组件渲染器
 */

import type { ComponentNode } from '../../types';
import type { ComponentRenderer, RenderContext, StyleObject } from '../types';
import { buildStyleString, buildPositionStyle } from '../utils/styleBuilder';
import { COMPONENT_DEFAULT_SIZE } from '../constants';

export class ImageRenderer implements ComponentRenderer {
  readonly type = 'image';

  render(component: ComponentNode, context: RenderContext): string {
    const { layout, style, props, binding } = component;
    const value = context.resolveBinding(binding);

    // 图片源：优先级 binding > props.src
    const imageSrc = value || props?.src || '';

    // 容器定位样式
    const positionStyles = buildPositionStyle(
      layout.xMm || 0,
      layout.yMm || 0,
      layout.widthMm || COMPONENT_DEFAULT_SIZE.IMAGE_WIDTH,
      layout.heightMm || COMPONENT_DEFAULT_SIZE.IMAGE_HEIGHT,
      context.mmToPx
    );

    const containerStyles: StyleObject = {
      ...positionStyles,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    };

    const containerStyleStr = buildStyleString(containerStyles);

    // 图片样式
    const imageStyle = `
      max-width: 100%;
      max-height: 100%;
      object-fit: ${style?.objectFit || 'contain'};
    `;

    if (imageSrc) {
      return `<div style="${containerStyleStr}"><img src="${imageSrc}" style="${imageStyle}" alt="" /></div>`;
    } else {
      // 无图片时显示占位符
      return `<div style="${containerStyleStr}"><div style="color: #999; font-size: 12px;">暂无图片</div></div>`;
    }
  }

  calculateHeight(component: ComponentNode): number {
    return component.layout.heightMm || COMPONENT_DEFAULT_SIZE.IMAGE_HEIGHT;
  }
}
