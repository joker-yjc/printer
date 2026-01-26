/**
 * 条形码组件渲染器
 * 在浏览器环境同步生成base64图片，直接嵌入img标签
 */

import JsBarcode from 'jsbarcode';
import type { ComponentNode } from '../../../types';
import type { ComponentRenderer, RenderContext } from '../types';
import { buildStyleString, buildPositionStyle } from '../utils/styleBuilder';
import { COMPONENT_DEFAULT_SIZE, BARCODE_CONFIG } from '../constants';

export class BarcodeRenderer implements ComponentRenderer {
  readonly type = 'barcode';

  render(component: ComponentNode, context: RenderContext): string {
    const { layout, props, binding } = component;
    const value = context.resolveBinding(binding);
    const content = value || props?.content || BARCODE_CONFIG.DEFAULT_CONTENT;
    const format = props?.format || BARCODE_CONFIG.DEFAULT_FORMAT;
    const widthMm = layout.widthMm || COMPONENT_DEFAULT_SIZE.BARCODE_WIDTH;
    const heightMm = layout.heightMm || COMPONENT_DEFAULT_SIZE.BARCODE_HEIGHT;
    const heightPx = heightMm * context.mmToPx;

    const positionStyles = buildPositionStyle(
      layout.xMm || 0,
      layout.yMm || 0,
      widthMm,
      heightMm,
      context.mmToPx
    );

    const styleStr = buildStyleString(positionStyles);

    try {
      // 创建临时canvas（不插入DOM）
      const canvas = document.createElement('canvas');

      // 使用JsBarcode生成条形码（同步）
      JsBarcode(canvas, content, {
        format: format,
        width: 2,
        height: heightPx * BARCODE_CONFIG.HEIGHT_RATIO,
        displayValue: false,
        margin: 0,
      });

      // 立即转换为base64（同步操作）
      const dataUrl = canvas.toDataURL('image/png');

      // 返回img标签
      return `<img src="${dataUrl}" alt="Barcode" style="${styleStr} display: block;" />`;
    } catch (error) {
      console.error('Barcode generation error:', error);
      // 生成失败时返回占位图
      return `<div style="${styleStr} border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; color: #999; font-size: 12px;">Barcode Error</div>`;
    }
  }

  calculateHeight(component: ComponentNode): number {
    return component.layout.heightMm || COMPONENT_DEFAULT_SIZE.BARCODE_HEIGHT;
  }
}
