/**
 * 智能对齐检测工具
 * 检测拖拽组件与其他组件的对齐关系
 * 所有计算在毫米层面进行，不受缩放影响
 * @module alignmentDetector
 */

import type { ComponentNode } from '../../../../types';
import type { AlignmentLine } from './AlignmentGuides';

/** 吸附阈值（毫米） */
const SNAP_THRESHOLD_MM = 0.8; // 约 3px / 3.78

/** 基础 mm 到 px 换算比例（仅用于将参考线位置转为像素给 AlignmentGuides 渲染） */
const MM_TO_PX = 3.78;

export interface AlignmentResult {
  lines: AlignmentLine[];
  snapX?: number;
  snapY?: number;
}

/**
 * 检测组件与其他组件的对齐关系
 * @param draggingComp 正在拖拽的组件
 * @param otherComps 其他组件
 * @param _mmToPx - mm 到像素的换算比例（保留兼容，内部不再使用）
 * @param zoomLevel - 缩放级别（百分比），用于将参考线位置转为缩放后像素
 * @returns 对齐线和吸附建议
 */
export function detectAlignment(
  draggingComp: ComponentNode,
  otherComps: ComponentNode[],
  _mmToPx: number = MM_TO_PX,
  zoomLevel: number = 100
): AlignmentResult {
  const lines: AlignmentLine[] = [];
  let snapX: number | undefined;
  let snapY: number | undefined;

  /** 将毫米转为缩放后的像素（供 AlignmentGuides 渲染用） */
  const toScaledPx = (mm: number) => mm * MM_TO_PX * zoomLevel / 100;

  // 被拖拽组件的关键点（毫米）
  const dragLeftMm = draggingComp.layout.xMm || 0;
  const dragRightMm = dragLeftMm + (draggingComp.layout.widthMm || 0);
  const dragCenterXMm = (dragLeftMm + dragRightMm) / 2;
  const dragTopMm = draggingComp.layout.yMm || 0;
  const dragBottomMm = dragTopMm + (draggingComp.layout.heightMm || 0);
  const dragCenterYMm = (dragTopMm + dragBottomMm) / 2;

  otherComps.forEach((comp) => {
    if (comp.id === draggingComp.id) return;

    const otherLeftMm = comp.layout.xMm || 0;
    const otherRightMm = otherLeftMm + (comp.layout.widthMm || 0);
    const otherCenterXMm = (otherLeftMm + otherRightMm) / 2;
    const otherTopMm = comp.layout.yMm || 0;
    const otherBottomMm = otherTopMm + (comp.layout.heightMm || 0);
    const otherCenterYMm = (otherTopMm + otherBottomMm) / 2;

    // ========== 垂直对齐检测 ==========

    if (Math.abs(dragLeftMm - otherLeftMm) < SNAP_THRESHOLD_MM) {
      lines.push({ type: 'vertical', position: toScaledPx(otherLeftMm) });
      if (snapX === undefined) snapX = otherLeftMm;
    }

    if (Math.abs(dragRightMm - otherRightMm) < SNAP_THRESHOLD_MM) {
      lines.push({ type: 'vertical', position: toScaledPx(otherRightMm) });
      if (snapX === undefined) snapX = otherRightMm - (draggingComp.layout.widthMm || 0);
    }

    if (Math.abs(dragCenterXMm - otherCenterXMm) < SNAP_THRESHOLD_MM) {
      lines.push({ type: 'vertical', position: toScaledPx(otherCenterXMm) });
      if (snapX === undefined) snapX = otherCenterXMm - (draggingComp.layout.widthMm || 0) / 2;
    }

    if (Math.abs(dragLeftMm - otherRightMm) < SNAP_THRESHOLD_MM) {
      lines.push({ type: 'vertical', position: toScaledPx(otherRightMm) });
      if (snapX === undefined) snapX = otherRightMm;
    }

    if (Math.abs(dragRightMm - otherLeftMm) < SNAP_THRESHOLD_MM) {
      lines.push({ type: 'vertical', position: toScaledPx(otherLeftMm) });
      if (snapX === undefined) snapX = otherLeftMm - (draggingComp.layout.widthMm || 0);
    }

    // ========== 水平对齐检测 ==========

    if (Math.abs(dragTopMm - otherTopMm) < SNAP_THRESHOLD_MM) {
      lines.push({ type: 'horizontal', position: toScaledPx(otherTopMm) });
      if (snapY === undefined) snapY = otherTopMm;
    }

    if (Math.abs(dragBottomMm - otherBottomMm) < SNAP_THRESHOLD_MM) {
      lines.push({ type: 'horizontal', position: toScaledPx(otherBottomMm) });
      if (snapY === undefined) snapY = otherBottomMm - (draggingComp.layout.heightMm || 0);
    }

    if (Math.abs(dragCenterYMm - otherCenterYMm) < SNAP_THRESHOLD_MM) {
      lines.push({ type: 'horizontal', position: toScaledPx(otherCenterYMm) });
      if (snapY === undefined) snapY = otherCenterYMm - (draggingComp.layout.heightMm || 0) / 2;
    }

    if (Math.abs(dragTopMm - otherBottomMm) < SNAP_THRESHOLD_MM) {
      lines.push({ type: 'horizontal', position: toScaledPx(otherBottomMm) });
      if (snapY === undefined) snapY = otherBottomMm;
    }

    if (Math.abs(dragBottomMm - otherTopMm) < SNAP_THRESHOLD_MM) {
      lines.push({ type: 'horizontal', position: toScaledPx(otherTopMm) });
      if (snapY === undefined) snapY = otherTopMm - (draggingComp.layout.heightMm || 0);
    }
  });

  const uniqueLines = lines.reduce((acc, line) => {
    const exists = acc.find(
      (l) => l.type === line.type && Math.abs(l.position - line.position) < 1
    );
    if (!exists) acc.push(line);
    return acc;
  }, [] as AlignmentLine[]);

  return { lines: uniqueLines, snapX, snapY };
}
