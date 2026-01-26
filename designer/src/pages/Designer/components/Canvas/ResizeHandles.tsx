/**
 * 组件尺寸调整手柄
 * 提供8个拖拽点来调整组件尺寸
 */

import { useEffect, useState } from 'react';
import type { ComponentNode } from '../../../../types';
import styles from './ResizeHandles.module.css';

interface ResizeHandlesProps {
  component: ComponentNode;
  onResize: (id: string, layout: { xMm?: number; yMm?: number; widthMm?: number; heightMm?: number }) => void;
  pageWidth: number;  // 页面宽度（mm）
  pageHeight: number; // 页面高度（mm）
  snapToGrid?: (value: number) => number; // 网格吸附函数
}

type ResizeDirection =
  | 'n' | 's' | 'e' | 'w'       // 上下左右
  | 'nw' | 'ne' | 'sw' | 'se';  // 四个角

const ResizeHandles = ({ component, onResize, pageWidth, pageHeight, snapToGrid }: ResizeHandlesProps) => {
  const [resizing, setResizing] = useState<ResizeDirection | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startLayout, setStartLayout] = useState({
    xMm: 0,
    yMm: 0,
    widthMm: 0,
    heightMm: 0,
  });

  const MIN_SIZE_MM = 5; // 最小尺寸5mm

  const handleMouseDown = (direction: ResizeDirection, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    setResizing(direction);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartLayout({
      xMm: component.layout.xMm || 0,
      yMm: component.layout.yMm || 0,
      widthMm: component.layout.widthMm || 60,
      heightMm: component.layout.heightMm || 10,
    });
  };

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaXPx = e.clientX - startPos.x;
      const deltaYPx = e.clientY - startPos.y;
      const deltaXMm = deltaXPx / 3.78;
      const deltaYMm = deltaYPx / 3.78;

      let newLayout = { ...startLayout };

      // 根据拖拽方向计算新尺寸和位置
      switch (resizing) {
        // 四个角：同时调整宽高
        case 'nw': // 左上角
          newLayout.widthMm = startLayout.widthMm - deltaXMm;
          newLayout.heightMm = startLayout.heightMm - deltaYMm;
          newLayout.xMm = startLayout.xMm + deltaXMm;
          newLayout.yMm = startLayout.yMm + deltaYMm;
          break;
        case 'ne': // 右上角
          newLayout.widthMm = startLayout.widthMm + deltaXMm;
          newLayout.heightMm = startLayout.heightMm - deltaYMm;
          newLayout.yMm = startLayout.yMm + deltaYMm;
          break;
        case 'sw': // 左下角
          newLayout.widthMm = startLayout.widthMm - deltaXMm;
          newLayout.heightMm = startLayout.heightMm + deltaYMm;
          newLayout.xMm = startLayout.xMm + deltaXMm;
          break;
        case 'se': // 右下角
          newLayout.widthMm = startLayout.widthMm + deltaXMm;
          newLayout.heightMm = startLayout.heightMm + deltaYMm;
          break;

        // 四条边：单向调整
        case 'n': // 上边
          newLayout.heightMm = startLayout.heightMm - deltaYMm;
          newLayout.yMm = startLayout.yMm + deltaYMm;
          break;
        case 's': // 下边
          newLayout.heightMm = startLayout.heightMm + deltaYMm;
          break;
        case 'w': // 左边
          newLayout.widthMm = startLayout.widthMm - deltaXMm;
          newLayout.xMm = startLayout.xMm + deltaXMm;
          break;
        case 'e': // 右边
          newLayout.widthMm = startLayout.widthMm + deltaXMm;
          break;
      }

      // 应用最小尺寸限制
      if (newLayout.widthMm < MIN_SIZE_MM) {
        newLayout.widthMm = MIN_SIZE_MM;
        // 如果是从左边调整，需要恢复x位置
        if (resizing.includes('w')) {
          newLayout.xMm = startLayout.xMm + startLayout.widthMm - MIN_SIZE_MM;
        }
      }
      if (newLayout.heightMm < MIN_SIZE_MM) {
        newLayout.heightMm = MIN_SIZE_MM;
        // 如果是从上边调整，需要恢复y位置
        if (resizing.includes('n')) {
          newLayout.yMm = startLayout.yMm + startLayout.heightMm - MIN_SIZE_MM;
        }
      }

      // 应用网格吸附（按住 Shift 键可以禁用）
      if (snapToGrid && !e.shiftKey) {
        newLayout.xMm = snapToGrid(newLayout.xMm);
        newLayout.yMm = snapToGrid(newLayout.yMm);
        newLayout.widthMm = snapToGrid(newLayout.widthMm);
        newLayout.heightMm = snapToGrid(newLayout.heightMm);
      }

      // 限制在页面范围内
      newLayout.xMm = Math.max(0, Math.min(newLayout.xMm, pageWidth - newLayout.widthMm));
      newLayout.yMm = Math.max(0, Math.min(newLayout.yMm, pageHeight - newLayout.heightMm));

      // 确保不超出页面右边和底部
      if (newLayout.xMm + newLayout.widthMm > pageWidth) {
        newLayout.widthMm = pageWidth - newLayout.xMm;
      }
      if (newLayout.yMm + newLayout.heightMm > pageHeight) {
        newLayout.heightMm = pageHeight - newLayout.yMm;
      }

      onResize(component.id, newLayout);
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, startPos, startLayout, component.id, onResize, pageWidth, pageHeight, snapToGrid]);

  return (
    <div className={styles['resize-handles']}>
      {/* 四个角 */}
      <div
        className={`${styles.handle} ${styles['handle-nw']}`}
        onMouseDown={(e) => handleMouseDown('nw', e)}
      />
      <div
        className={`${styles.handle} ${styles['handle-ne']}`}
        onMouseDown={(e) => handleMouseDown('ne', e)}
      />
      <div
        className={`${styles.handle} ${styles['handle-sw']}`}
        onMouseDown={(e) => handleMouseDown('sw', e)}
      />
      <div
        className={`${styles.handle} ${styles['handle-se']}`}
        onMouseDown={(e) => handleMouseDown('se', e)}
      />

      {/* 四条边 */}
      <div
        className={`${styles.handle} ${styles['handle-n']}`}
        onMouseDown={(e) => handleMouseDown('n', e)}
      />
      <div
        className={`${styles.handle} ${styles['handle-s']}`}
        onMouseDown={(e) => handleMouseDown('s', e)}
      />
      <div
        className={`${styles.handle} ${styles['handle-w']}`}
        onMouseDown={(e) => handleMouseDown('w', e)}
      />
      <div
        className={`${styles.handle} ${styles['handle-e']}`}
        onMouseDown={(e) => handleMouseDown('e', e)}
      />

      {/* 尺寸提示 */}
      {resizing && (
        <div className={styles['size-tip']}>
          {Math.round(component.layout.widthMm || 0)}mm × {Math.round(component.layout.heightMm || 0)}mm
        </div>
      )}
    </div>
  );
};

export default ResizeHandles;
