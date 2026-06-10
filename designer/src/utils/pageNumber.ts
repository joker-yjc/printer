/**
 * 页码相关工具函数
 * @module pageNumber
 */

import { CONTINUOUS_PAPER_DEFAULT_WIDTH } from '../constants';
import type { PageConfig } from '../types';

/**
 * 判断页码位置是否超出页面边界
 * 计算页码的预估渲染尺寸，与组件越界检查逻辑一致：
 * - 左边缘 < 0 → 越界
 * - 右边缘（x + width）> pageW → 越界
 * - 上边缘 < 0 → 越界
 * - 下边缘（y + height）> pageH → 越界
 * @param pageConfig - 页面配置
 * @returns 是否超出边界
 */
export const isPageNumberOutOfBounds = (pageConfig: PageConfig): boolean => {
  const pn = pageConfig.pageNumber;
  if (!pn?.enabled) return false;

  let pageW: number, pageH: number;
  if (pageConfig.size === 'CONTINUOUS') {
    pageW = pageConfig.widthMm ?? CONTINUOUS_PAPER_DEFAULT_WIDTH;
    pageH = 10000;
  } else if (pageConfig.size === 'CUSTOM') {
    pageW = pageConfig.widthMm ?? 210;
    pageH = pageConfig.heightMm ?? 297;
  } else {
    pageW = pageConfig.size === 'A4' ? 210 : 148;
    pageH = pageConfig.size === 'A4' ? 297 : 210;
  }
  if (pageConfig.orientation === 'landscape' && pageConfig.size !== 'CONTINUOUS') {
    [pageW, pageH] = [pageH, pageW];
  }

  let x: number, y: number;

  if (pn.position === 'custom') {
    x = pn.customX ?? 0;
    y = pn.customY ?? 0;
  } else {
    const margin = 10;
    const offsetX = pn.offsetX ?? 0;
    const offsetY = pn.offsetY ?? 0;
    switch (pn.position) {
      case 'top-left':
        x = pageConfig.marginMm.left + margin + offsetX;
        y = pageConfig.marginMm.top + margin + offsetY;
        break;
      case 'top-center':
        x = pageW / 2 + offsetX;
        y = pageConfig.marginMm.top + margin + offsetY;
        break;
      case 'top-right':
        x = pageW - pageConfig.marginMm.right - margin + offsetX;
        y = pageConfig.marginMm.top + margin + offsetY;
        break;
      case 'bottom-left':
        x = pageConfig.marginMm.left + margin + offsetX;
        y = pageH - pageConfig.marginMm.bottom - margin + offsetY;
        break;
      case 'bottom-center':
        x = pageW / 2 + offsetX;
        y = pageH - pageConfig.marginMm.bottom - margin + offsetY;
        break;
      case 'bottom-right':
        x = pageW - pageConfig.marginMm.right - margin + offsetX;
        y = pageH - pageConfig.marginMm.bottom - margin + offsetY;
        break;
      default:
        return false;
    }
  }

  const format = pn.format ?? 'slash';
  const separator = pn.separator ?? '/';
  let exampleText = '';
  if (format === 'simple') exampleText = '1';
  else if (format === 'text') exampleText = '第1页 共3页';
  else exampleText = `1${separator}3`;
  exampleText = `${pn.prefix ?? ''}${exampleText}${pn.suffix ?? ''}`;

  const fontSize = pn.style?.fontSize ?? 12;
  const displayFontSize = fontSize * 0.8;
  let cjkCount = 0, latinCount = 0;
  for (const ch of exampleText) {
    if (/[\u3000-\u303F\u3400-\u4DBF\u4E00-\u9FFF\uFF00-\uFFEF]/.test(ch)) {
      cjkCount++;
    } else {
      latinCount++;
    }
  }
  const estimatedWidthMm = (cjkCount * displayFontSize + latinCount * displayFontSize * 0.55) / 3.78 + 8 / 3.78;
  const estimatedHeightMm = displayFontSize * 1.3 / 3.78 + 4 / 3.78;

  if (pn.position !== 'custom' && pn.position.includes('center')) {
    x -= estimatedWidthMm / 2;
  }

  return x < 0 || x + estimatedWidthMm > pageW || y < 0 || y + estimatedHeightMm > pageH;
};
