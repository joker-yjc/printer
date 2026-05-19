/**
 * 页面尺寸计算工具
 */

export interface PageSizeInput {
  size: 'A4' | 'A5' | 'CUSTOM' | 'CONTINUOUS';
  orientation: 'portrait' | 'landscape';
  widthMm?: number;
  heightMm?: number;
  marginMm: {
    left: number;
    right: number;
  };
}

export interface TableLayoutInput {
  widthMm?: number;
  xMm?: number;
}

/**
 * 计算表格内容区可用宽度（mm），与 SDK 动态计算保持一致
 * - 用户显式设置 layout.widthMm → 直接使用
 * - 未设置 → 自动占满页面可用宽度（减去左边距、右边距、xMm 偏移）
 * - 结果 > 0 保证，防止 computeColWidths 除零 NaN
 */
export function getTableContentWidth(
  pageConfig: PageSizeInput,
  layout?: TableLayoutInput,
): number {
  // 用户显式设置了宽度，直接使用
  if (layout?.widthMm) return layout.widthMm;

  const { size, orientation, widthMm, heightMm } = pageConfig;
  let pw: number;
  if (size === 'CUSTOM') pw = widthMm || 210;
  else if (size === 'CONTINUOUS') pw = widthMm || 80;
  else pw = size === 'A4' ? 210 : 148;

  if (orientation === 'landscape' && size !== 'CONTINUOUS') {
    const ph =
      size === 'CUSTOM' ? (heightMm || 297) : size === 'A4' ? 297 : 210;
    pw = ph;
  }

  const available = pw - pageConfig.marginMm.left - pageConfig.marginMm.right;
  const raw = available - (layout?.xMm || 0);
  return raw > 0 ? raw : 1;
}
