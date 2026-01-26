/**
 * 智能对齐检测工具
 * 检测拖拽组件与其他组件的对齐关系
 */

import type { ComponentNode } from '../../../../types';
import type { AlignmentLine } from './AlignmentGuides';

const SNAP_THRESHOLD = 3; // 吸附阈值（像素）

export interface AlignmentResult {
  lines: AlignmentLine[];
  snapX?: number; // 建议吸附的 X 坐标（mm）
  snapY?: number; // 建议吸附的 Y 坐标（mm）
}

/**
 * 检测组件与其他组件的对齐关系
 * @param draggingComp 正在拖拽的组件
 * @param otherComps 其他组件
 * @param mmToPx mm 到像素的转换比例
 * @returns 对齐线和吸附建议
 */
export function detectAlignment(
  draggingComp: ComponentNode,
  otherComps: ComponentNode[],
  mmToPx: number = 3.78
): AlignmentResult {
  const lines: AlignmentLine[] = [];
  let snapX: number | undefined;
  let snapY: number | undefined;

  // 被拖拽组件的关键点（像素）
  const dragLeft = (draggingComp.layout.xMm || 0) * mmToPx;
  const dragRight = dragLeft + (draggingComp.layout.widthMm || 0) * mmToPx;
  const dragCenterX = (dragLeft + dragRight) / 2;
  const dragTop = (draggingComp.layout.yMm || 0) * mmToPx;
  const dragBottom = dragTop + (draggingComp.layout.heightMm || 0) * mmToPx;
  const dragCenterY = (dragTop + dragBottom) / 2;

  // 遍历其他组件，检测对齐
  otherComps.forEach((comp) => {
    // 跳过自己
    if (comp.id === draggingComp.id) return;

    // 其他组件的关键点（像素）
    const otherLeft = (comp.layout.xMm || 0) * mmToPx;
    const otherRight = otherLeft + (comp.layout.widthMm || 0) * mmToPx;
    const otherCenterX = (otherLeft + otherRight) / 2;
    const otherTop = (comp.layout.yMm || 0) * mmToPx;
    const otherBottom = otherTop + (comp.layout.heightMm || 0) * mmToPx;
    const otherCenterY = (otherTop + otherBottom) / 2;

    // ========== 垂直对齐检测 ==========

    // 左边对齐
    if (Math.abs(dragLeft - otherLeft) < SNAP_THRESHOLD) {
      lines.push({ type: 'vertical', position: otherLeft });
      if (snapX === undefined) {
        snapX = comp.layout.xMm || 0;
      }
    }

    // 右边对齐
    if (Math.abs(dragRight - otherRight) < SNAP_THRESHOLD) {
      lines.push({ type: 'vertical', position: otherRight });
      if (snapX === undefined) {
        snapX = (comp.layout.xMm || 0) + (comp.layout.widthMm || 0) - (draggingComp.layout.widthMm || 0);
      }
    }

    // 水平居中对齐
    if (Math.abs(dragCenterX - otherCenterX) < SNAP_THRESHOLD) {
      lines.push({ type: 'vertical', position: otherCenterX });
      if (snapX === undefined) {
        const otherCenterXMm = (comp.layout.xMm || 0) + (comp.layout.widthMm || 0) / 2;
        snapX = otherCenterXMm - (draggingComp.layout.widthMm || 0) / 2;
      }
    }

    // 拖拽组件左边对齐其他组件右边
    if (Math.abs(dragLeft - otherRight) < SNAP_THRESHOLD) {
      lines.push({ type: 'vertical', position: otherRight });
      if (snapX === undefined) {
        snapX = (comp.layout.xMm || 0) + (comp.layout.widthMm || 0);
      }
    }

    // 拖拽组件右边对齐其他组件左边
    if (Math.abs(dragRight - otherLeft) < SNAP_THRESHOLD) {
      lines.push({ type: 'vertical', position: otherLeft });
      if (snapX === undefined) {
        snapX = (comp.layout.xMm || 0) - (draggingComp.layout.widthMm || 0);
      }
    }

    // ========== 水平对齐检测 ==========

    // 顶部对齐
    if (Math.abs(dragTop - otherTop) < SNAP_THRESHOLD) {
      lines.push({ type: 'horizontal', position: otherTop });
      if (snapY === undefined) {
        snapY = comp.layout.yMm || 0;
      }
    }

    // 底部对齐
    if (Math.abs(dragBottom - otherBottom) < SNAP_THRESHOLD) {
      lines.push({ type: 'horizontal', position: otherBottom });
      if (snapY === undefined) {
        snapY = (comp.layout.yMm || 0) + (comp.layout.heightMm || 0) - (draggingComp.layout.heightMm || 0);
      }
    }

    // 垂直居中对齐
    if (Math.abs(dragCenterY - otherCenterY) < SNAP_THRESHOLD) {
      lines.push({ type: 'horizontal', position: otherCenterY });
      if (snapY === undefined) {
        const otherCenterYMm = (comp.layout.yMm || 0) + (comp.layout.heightMm || 0) / 2;
        snapY = otherCenterYMm - (draggingComp.layout.heightMm || 0) / 2;
      }
    }

    // 拖拽组件顶部对齐其他组件底部
    if (Math.abs(dragTop - otherBottom) < SNAP_THRESHOLD) {
      lines.push({ type: 'horizontal', position: otherBottom });
      if (snapY === undefined) {
        snapY = (comp.layout.yMm || 0) + (comp.layout.heightMm || 0);
      }
    }

    // 拖拽组件底部对齐其他组件顶部
    if (Math.abs(dragBottom - otherTop) < SNAP_THRESHOLD) {
      lines.push({ type: 'horizontal', position: otherTop });
      if (snapY === undefined) {
        snapY = (comp.layout.yMm || 0) - (draggingComp.layout.heightMm || 0);
      }
    }
  });

  // 去重参考线（相同位置的线只保留一条）
  const uniqueLines = lines.reduce((acc, line) => {
    const exists = acc.find(
      (l) => l.type === line.type && Math.abs(l.position - line.position) < 1
    );
    if (!exists) {
      acc.push(line);
    }
    return acc;
  }, [] as AlignmentLine[]);

  return {
    lines: uniqueLines,
    snapX,
    snapY,
  };
}
