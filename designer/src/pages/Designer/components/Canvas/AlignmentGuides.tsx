/**
 * 智能对齐参考线组件
 * 在拖拽组件时显示与其他组件的对齐参考线
 */

import React from 'react';
import styles from './AlignmentGuides.module.css';

export interface AlignmentLine {
  type: 'vertical' | 'horizontal';
  position: number; // 像素位置
  label?: string; // 可选的标签（用于显示对齐类型）
}

interface AlignmentGuidesProps {
  lines: AlignmentLine[];
  canvasWidth: number;
  canvasHeight: number;
}

const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({ lines, canvasWidth, canvasHeight }) => {
  return (
    <div className={styles.container}>
      {lines.map((line, index) => {
        if (line.type === 'vertical') {
          return (
            <div
              key={`v-${index}`}
              className={styles['vertical-line']}
              style={{
                left: `${line.position}px`,
                height: `${canvasHeight}px`,
              }}
            >
              {line.label && (
                <div className={styles.label} style={{ top: '10px' }}>
                  {line.label}
                </div>
              )}
            </div>
          );
        } else {
          return (
            <div
              key={`h-${index}`}
              className={styles['horizontal-line']}
              style={{
                top: `${line.position}px`,
                width: `${canvasWidth}px`,
              }}
            >
              {line.label && (
                <div className={styles.label} style={{ left: '10px' }}>
                  {line.label}
                </div>
              )}
            </div>
          );
        }
      })}
    </div>
  );
};

export default AlignmentGuides;
