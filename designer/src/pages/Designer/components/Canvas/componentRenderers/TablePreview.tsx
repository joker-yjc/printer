import type { ComponentNode } from '../../../../../types';
import { pxToMm } from '../../../../../utils/zoom';
import { useDesignerStore } from '../../../../../store/designer';
import { useState, useCallback, useEffect } from 'react';

interface TablePreviewProps {
  component: ComponentNode;
}

function computeColWidths(
  columns: { width?: number }[],
  tableWidthMm: number
): string[] {
  const totalFixed = columns.reduce((sum, c) => sum + (c.width || 0), 0);
  const totalCols = columns.length;
  const unfixedCount = columns.filter(c => !c.width).length;
  if (unfixedCount === totalCols) {
    return columns.map(() => `${(100 / totalCols).toFixed(2)}%`);
  }
  const remainingMm = tableWidthMm - totalFixed;
  const unsetWidthMm = unfixedCount > 0 ? Math.max(0, remainingMm / unfixedCount) : 0;
  return columns.map((col, idx) => {
    const wMm = col.width || unsetWidthMm;
    const pct = (wMm / tableWidthMm) * 100;
    // 最后一列吸收舍入误差，确保总和严格等于 100%
    if (idx === columns.length - 1) {
      const sumPrev = columns.slice(0, -1).reduce((s, c) => {
        const prevMm = c.width || unsetWidthMm;
        return s + (prevMm / tableWidthMm) * 100;
      }, 0);
      return `${(100 - sumPrev).toFixed(2)}%`;
    }
    return `${pct.toFixed(2)}%`;
  });
}

function computeColumnMaxWidth(
  columns: { width?: number }[],
  index: number,
  tableWidthMm: number
): number {
  const otherFixed = columns.reduce((sum, col, i) =>
    i !== index ? sum + (col.width || 0) : sum, 0
  );
  return Math.max(1, tableWidthMm - otherFixed);
}

function useColumnResize(
  onWidthChange: (colIndex: number, widthMm: number) => void
) {
  const zoomLevel = useDesignerStore(s => s.zoomLevel);
  const [resizing, setResizing] = useState<{
    index: number;
    startX: number;
    originalWidth: number;
    maxWidth: number;
  } | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, colIndex: number, colWidthMm: number, maxWidth: number) => {
      e.preventDefault();
      e.stopPropagation();
      setResizing({ index: colIndex, startX: e.clientX, originalWidth: colWidthMm, maxWidth });
    },
    []
  );

  useEffect(() => {
    if (!resizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const deltaPx = e.clientX - resizing.startX;
      const deltaMm = pxToMm(deltaPx, zoomLevel);
      const newWidth = Math.max(1, Math.min(resizing.maxWidth, resizing.originalWidth + deltaMm));
      onWidthChange(resizing.index, Math.round(newWidth * 10) / 10);
    };
    const handleMouseUp = () => setResizing(null);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, zoomLevel, onWidthChange]);

  return { resizing, handleMouseDown };
}

/**
 * 表格组件预览
 */
export const TablePreview = ({ component }: TablePreviewProps) => {
  const columns = component.props?.columns || [];
  const bordered = component.props?.bordered !== false;
  const borderStyle = component.props?.borderStyle || 'solid';
  const showHeader = component.props?.showHeader !== false;
  const visibleColumns = columns.filter((col: any) => !col.hidden);
  const showRowNumber = component.props?.showRowNumber === true;
  const rowNumberLabel = component.props?.rowNumberLabel || '序号';
  const tableTextAlign = component.style?.textAlign || 'left';

  const tableWidthMm = component.layout?.widthMm || 200;
  const displayCols = showRowNumber
    ? [{ dataIndex: '__rowNumber', title: rowNumberLabel, width: component.props?.rowNumberWidth }, ...visibleColumns]
    : visibleColumns;
  const colWidths = computeColWidths(displayCols, tableWidthMm);

  // 拖拽调整列宽
  const updateComponent = useDesignerStore(s => s.updateComponent);
  const handleColumnWidthChange = useCallback(
    (colIdx: number, widthMm: number) => {
      const realIdx = showRowNumber ? colIdx - 1 : colIdx;
      if (realIdx < 0) {
        updateComponent(component.id, {
          props: { ...component.props, rowNumberWidth: widthMm },
        });
      } else {
        const cols = [...(component.props?.columns || [])];
        cols[realIdx] = { ...cols[realIdx], width: widthMm };
        updateComponent(component.id, {
          props: { ...component.props, columns: cols },
        });
      }
    },
    [component, showRowNumber, updateComponent]
  );
  const { resizing, handleMouseDown } = useColumnResize(handleColumnWidthChange);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {resizing && (
        <div style={{
          position: 'fixed', top: 40, left: '50%', transform: 'translateX(-50%)',
          background: '#1890ff', color: '#fff', padding: '4px 12px',
          borderRadius: 4, fontSize: 12, zIndex: 9999,
        }}>
          {Math.round(parseFloat(colWidths[resizing.index]) / 100 * tableWidthMm)} mm
        </div>
      )}
      <table style={{
        width: '100%', height: '100%', borderCollapse: 'collapse',
        fontSize: component.style?.fontSize || 12,
      }}>
        {showHeader && displayCols.length > 0 && (
          <thead>
            <tr>
              {displayCols.map((col: any, idx: number) => {
                const isRowNum = col.dataIndex === '__rowNumber';
                const colMm = parseFloat(colWidths[idx]) / 100 * tableWidthMm;
                const maxW = computeColumnMaxWidth(displayCols, idx, tableWidthMm);
                return (
                  <th key={idx} style={{
                    width: colWidths[idx],
                    border: bordered ? `1px ${borderStyle} #d9d9d9` : 'none',
                    padding: '8px', background: '#fafafa', fontWeight: 600,
                    textAlign: isRowNum ? 'center' : (tableTextAlign as any),
                    position: 'relative',
                  }}>
                    {col.title || col.dataIndex}
                    <div
                      onMouseDown={(e) => handleMouseDown(e, idx, colMm, maxW)}
                      style={{
                        position: 'absolute', right: 0, top: 0, bottom: 0, width: 8,
                        cursor: 'col-resize',
                        background: resizing?.index === idx ? '#1890ff' : 'transparent',
                        opacity: resizing?.index === idx ? 0.4 : 0,
                        transition: 'opacity 0.15s',
                      }}
                      onMouseEnter={(e: any) => { e.target.style.opacity = '0.3'; }}
                      onMouseLeave={(e: any) => {
                        if (resizing?.index !== idx) e.target.style.opacity = '0';
                      }}
                    />
                  </th>
                );
              })}
            </tr>
          </thead>
        )}
        <tbody>
          <tr>
            <td colSpan={displayCols.length} style={{
              border: bordered ? `1px ${borderStyle} #d9d9d9` : 'none',
              padding: '8px', textAlign: 'center', color: '#999',
            }}>
              暂无数据
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
