/**
 * 二维码组件渲染器
 * 在浏览器环境同步生成base64图片，直接嵌入img标签
 */

import QRCode from 'qrcode';
import type { ComponentNode } from '../../types';
import type { ComponentRenderer, RenderContext } from '../types';
import { buildStyleString, buildPositionStyle } from '../utils/styleBuilder';
import { COMPONENT_DEFAULT_SIZE, QRCODE_CONFIG } from '../constants';

export class QRCodeRenderer implements ComponentRenderer {
  readonly type = 'qrcode';

  render(component: ComponentNode, context: RenderContext): string {
    const { layout, props, binding } = component;
    const value = context.resolveBinding(binding);
    const content = value || props?.content || QRCODE_CONFIG.DEFAULT_CONTENT;
    const sizeMm = layout.widthMm || COMPONENT_DEFAULT_SIZE.QRCODE_SIZE;
    const sizePx = sizeMm * context.mmToPx;

    const positionStyles = buildPositionStyle(
      layout.xMm || 0,
      layout.yMm || 0,
      sizeMm,
      layout.heightMm || COMPONENT_DEFAULT_SIZE.QRCODE_SIZE,
      context.mmToPx
    );

    const styleStr = buildStyleString(positionStyles);

    try {
      // 创建临时canvas（不插入DOM）
      const canvas = document.createElement('canvas');
      canvas.width = sizePx;
      canvas.height = sizePx;

      // 同步生成二维码到canvas
      QRCode.toCanvas(canvas, content, {
        width: sizePx,
        margin: 0,
        errorCorrectionLevel: 'M'
      }, (error) => {
        if (error) console.error('QRCode generation error:', error);
      });

      // 立即转换为base64（同步操作）
      const dataUrl = canvas.toDataURL('image/png');

      // 返回img标签
      return `<img src="${dataUrl}" alt="QR Code" style="${styleStr} display: block;" />`;
    } catch (error) {
      console.error('QRCode generation error:', error);
      // 生成失败时返回占位图
      return `<div style="${styleStr} border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; color: #999; font-size: 12px;">QR Error</div>`;
    }
  }

  calculateHeight(component: ComponentNode): number {
    return component.layout.heightMm || COMPONENT_DEFAULT_SIZE.QRCODE_SIZE;
  }
}
