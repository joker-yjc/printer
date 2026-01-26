/**
 * 网格工具函数
 */

/**
 * 将值吸附到网格
 * @param value 原始值（mm）
 * @param gridEnabled 是否启用网格
 * @param gridSize 网格大小（mm）
 * @returns 吸附后的值（mm）
 */
export function snapToGrid(value: number, gridEnabled: boolean, gridSize: number): number {
  if (!gridEnabled) return value;
  return Math.round(value / gridSize) * gridSize;
}

/**
 * 批量吸附坐标到网格
 * @param x X 坐标（mm）
 * @param y Y 坐标（mm）
 * @param gridEnabled 是否启用网格
 * @param gridSize 网格大小（mm）
 * @returns 吸附后的坐标
 */
export function snapPointToGrid(
  x: number,
  y: number,
  gridEnabled: boolean,
  gridSize: number
): { x: number; y: number } {
  return {
    x: snapToGrid(x, gridEnabled, gridSize),
    y: snapToGrid(y, gridEnabled, gridSize),
  };
}
