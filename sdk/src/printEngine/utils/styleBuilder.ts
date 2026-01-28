/**
 * 样式构建工具函数
 */

import type { StyleObject } from '../types';

/**
 * 将样式对象转换为 CSS 字符串
 * @example
 * buildStyleString({ fontSize: '14px', color: '#000' })
 * // => "font-size: 14px; color: #000"
 */
export function buildStyleString(styles: StyleObject): string {
  return Object.entries(styles)
    .map(([key, val]) => {
      // 将驼峰命名转为短横线命名
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${val}`;
    })
    .join('; ');
}

/**
 * 构建绝对定位样式
 * @param xMm X坐标（mm）
 * @param yMm Y坐标（mm）
 * @param widthMm 宽度（mm）
 * @param heightMm 高度（mm）
 * @param mmToPx mm转px系数（默认3.78）
 */
export function buildPositionStyle(
  xMm: number,
  yMm: number,
  widthMm?: number,
  heightMm?: number,
  mmToPx = 3.78
): StyleObject {
  const styles: StyleObject = {
    position: 'absolute',
    left: `${xMm * mmToPx}px`,
    top: `${yMm * mmToPx}px`,
  };

  if (widthMm !== undefined) {
    styles.width = `${widthMm * mmToPx}px`;
  }

  if (heightMm !== undefined) {
    styles.height = `${heightMm * mmToPx}px`;
  }

  return styles;
}
