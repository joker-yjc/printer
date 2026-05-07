/**
 * 画布缩放工具函数
 * @module zoom
 */

/** 毫米到像素的基础换算比例 */
export const MM_TO_PX_BASE = 3.78;

/** 支持的缩放级别（百分比） */
export const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 200] as const;

/** 默认缩放级别 */
export const DEFAULT_ZOOM = 100;

/** 最小缩放级别 */
export const MIN_ZOOM = 25;

/** 最大缩放级别 */
export const MAX_ZOOM = 200;

/** 缩放步进（百分比） */
export const ZOOM_STEP = 25;

/**
 * 像素转毫米（考虑缩放）
 * @param px - 像素值
 * @param zoomLevel - 缩放级别（百分比，如 100 表示 100%）
 * @returns 毫米值
 */
export const pxToMm = (px: number, zoomLevel: number = DEFAULT_ZOOM): number => {
  return px / (MM_TO_PX_BASE * zoomLevel / 100);
};

/**
 * 毫米转像素（考虑缩放）
 * @param mm - 毫米值
 * @param zoomLevel - 缩放级别（百分比，如 100 表示 100%）
 * @returns 像素值
 */
export const mmToPx = (mm: number, zoomLevel: number = DEFAULT_ZOOM): number => {
  return mm * MM_TO_PX_BASE * zoomLevel / 100;
};

/**
 * 获取最近的合法缩放级别
 * @param zoom - 任意缩放值
 * @returns 合法的缩放级别
 */
export const clampZoom = (zoom: number): number => {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
};

/**
 * 放大一级
 * @param currentZoom - 当前缩放级别
 * @returns 下一个缩放级别
 */
export const zoomInLevel = (currentZoom: number): number => {
  const next = currentZoom + ZOOM_STEP;
  return clampZoom(next);
};

/**
 * 缩小一级
 * @param currentZoom - 当前缩放级别
 * @returns 上一个缩放级别
 */
export const zoomOutLevel = (currentZoom: number): number => {
  const prev = currentZoom - ZOOM_STEP;
  return clampZoom(prev);
};
