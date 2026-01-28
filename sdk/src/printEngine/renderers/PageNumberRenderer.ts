/**
 * 页码组件渲染器
 * 支持三种格式：
 * - simple: 1, 2, 3
 * - text: 第1页 共3页
 * - slash: 1/3
 */

import type { ComponentNode, PageNumberProps } from '../../types';
import type { ComponentRenderer, RenderContext, StyleObject } from '../types';
import { buildStyleString, buildPositionStyle } from '../utils/styleBuilder';
import { COMPONENT_DEFAULT_SIZE, STYLE_DEFAULT } from '../constants';

export class PageNumberRenderer implements ComponentRenderer {
  readonly type = 'pageNumber';

  render(component: ComponentNode, context: RenderContext): string {
    const { layout, style, props = {} } = component;
    const pageNumberProps = props as PageNumberProps;

    // 获取当前页码和总页数（由打印引擎注入）
    const currentPage = pageNumberProps._currentPage || 1;
    const totalPages = pageNumberProps._totalPages || 1;

    console.log(`[PageNumberRenderer] 渲染页码: currentPage=${currentPage}, totalPages=${totalPages}`, pageNumberProps);

    // 根据格式生成页码文本
    const pageText = this.formatPageNumber(currentPage, totalPages, pageNumberProps);
    console.log(`[PageNumberRenderer] 页码文本: ${pageText}`);

    const positionStyles = buildPositionStyle(
      layout.xMm || 0,
      layout.yMm || 0,
      layout.widthMm || COMPONENT_DEFAULT_SIZE.TEXT_WIDTH,
      layout.heightMm || COMPONENT_DEFAULT_SIZE.TEXT_HEIGHT,
      context.mmToPx
    );

    const textStyles: StyleObject = {
      ...positionStyles,
      color: style?.color || STYLE_DEFAULT.TEXT_COLOR,
      fontSize: style?.fontSize ? `${style.fontSize}px` : `${STYLE_DEFAULT.FONT_SIZE}px`,
      fontFamily: style?.fontFamily || 'Arial, sans-serif',
      fontWeight: style?.fontWeight || STYLE_DEFAULT.FONT_WEIGHT,
      textAlign: pageNumberProps.align || 'center',
      lineHeight: STYLE_DEFAULT.LINE_HEIGHT,
      display: 'flex',
      alignItems: 'center',
      justifyContent: pageNumberProps.align === 'left' ? 'flex-start'
        : pageNumberProps.align === 'right' ? 'flex-end'
          : 'center',
    };

    const styleStr = buildStyleString(textStyles);

    return `<div style="${styleStr}">${this.escapeHtml(pageText)}</div>`;
  }

  calculateHeight(component: ComponentNode): number {
    return component.layout.heightMm || COMPONENT_DEFAULT_SIZE.TEXT_HEIGHT;
  }

  /**
   * 格式化页码文本
   */
  private formatPageNumber(
    currentPage: number,
    totalPages: number,
    props: PageNumberProps
  ): string {
    const { format = 'slash', prefix = '', suffix = '', separator = '/' } = props;

    let text = '';

    switch (format) {
      case 'simple':
        // 简单模式：1, 2, 3
        text = `${currentPage}`;
        break;

      case 'text':
        // 文本模式：第1页 共3页
        text = `第${currentPage}页 共${totalPages}页`;
        break;

      case 'slash':
      default:
        // 斜杠模式：1/3
        text = `${currentPage}${separator}${totalPages}`;
        break;
    }

    return `${prefix}${text}${suffix}`;
  }

  /**
   * HTML 转义
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
