import type { ComponentNode } from '../../../../../types';
import { computeColWidths, computeColumnMaxWidth } from '@jcyao/print-sdk';
import { pxToMm } from '../../../../../utils/zoom';
import { getTableContentWidth } from '../../../../../utils/pageSize';
import { useDesignerStore } from '../../../../../store/designer';
import { useState, useCallback, useEffect, useRef } from 'react';

interface TablePreviewProps {
  component: ComponentNode;
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
  const [currentWidth, setCurrentWidth] = useState<number | null>(null);
  const currentWidthRef = useRef<number | null>(null);
  const onWidthChangeRef = useRef(onWidthChange);
  onWidthChangeRef.current = onWidthChange;

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
      const rounded = Math.round(newWidth * 10) / 10;
      currentWidthRef.current = rounded;
      setCurrentWidth(rounded); // 仅更新本地状态，不触发 store
    };
    const handleMouseUp = () => {
      // mouseup 时一次性提交到 store，避免每次 mousemove 都写历史记录
      if (currentWidthRef.current !== null) {
        onWidthChangeRef.current(resizing.index, currentWidthRef.current);
      }
      setResizing(null);
      setCurrentWidth(null);
      currentWidthRef.current = null;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, zoomLevel]);

  return { resizing, currentWidth, handleMouseDown };
}

/**
 * 表格组件预览
 */
export const TablePreview = ({ component }: TablePreviewProps) => {
  const columns = component.props?.columns || [];
  const bordered = component.props?.bordered !== false;
  const borderStyle = component.props?.borderStyle ?? 'solid';
  const borderColor = component.props?.borderColor ?? '#d9d9d9';
  const borderWidth = component.props?.borderWidth ?? 1;
  const showHeader = component.props?.showHeader !== false;
  const visibleColumns = columns.filter((col: any) => !col.hidden);
  const showRowNumber = component.props?.showRowNumber === true;
  const rowNumberLabel = component.props?.rowNumberLabel || '序号';
  const tableTextAlign = component.style?.textAlign || 'left';

  const tableHeaderStyle = component.props?.headerStyle || {};
  const headerDefaultBg = tableHeaderStyle.backgroundColor ?? '#fafafa';
  const headerDefaultFw = tableHeaderStyle.fontWeight ?? 600;
  const headerDefaultAlign = tableHeaderStyle.textAlign;
  const headerDefaultFontSize = tableHeaderStyle.fontSize;
  const headerDefaultColor = tableHeaderStyle.color;

  // 从 pageConfig 计算表格可用宽度，与 SDK 动态计算保持一致
  const pageConfig = useDesignerStore(s => s.pageConfig);
  const tableWidthMm = getTableContentWidth(pageConfig, component.layout);
  const displayCols = showRowNumber
    ? [{
        dataIndex: '__row_number__',
        title: rowNumberLabel,
        width: component.props?.rowNumberWidth,
        align: 'center',
        style: component.props?.rowNumberStyle,
        headerStyle: component.props?.rowNumberHeaderStyle,
      } as any, ...visibleColumns]
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
  const { resizing, currentWidth, handleMouseDown } = useColumnResize(handleColumnWidthChange);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {resizing && (
        <div style={{
          position: 'fixed', top: 40, left: '50%', transform: 'translateX(-50%)',
          background: '#1890ff', color: '#fff', padding: '4px 12px',
          borderRadius: 4, fontSize: 12, zIndex: 9999,
        }}>
          {currentWidth ? Math.round(currentWidth) : 0} mm
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
                const colMm = Math.round(parseFloat(colWidths[idx]) / 100 * tableWidthMm * 10) / 10;
                const maxW = Math.round(computeColumnMaxWidth(displayCols, idx, tableWidthMm) * 10) / 10;
                const colHeaderStyle = col.headerStyle || {};
                // 对齐优先级：列级 headerStyle.textAlign > col.align > 表格级 headerStyle.textAlign > 表格级 textAlign
                const hAlign = colHeaderStyle.textAlign
                  || col.align
                  || headerDefaultAlign
                  || tableTextAlign;
                return (
                  <th key={idx} style={{
                    width: colWidths[idx],
                    border: bordered ? `${borderWidth}px ${borderStyle} ${borderColor}` : 'none',
                    padding: '8px', background: colHeaderStyle.backgroundColor ?? headerDefaultBg,
                    fontWeight: colHeaderStyle.fontWeight ?? headerDefaultFw,
                    fontSize: colHeaderStyle.fontSize ?? headerDefaultFontSize,
                    color: colHeaderStyle.color ?? headerDefaultColor,
                    textAlign: hAlign as any,
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
            <td colSpan={displayCols.length || 1} style={{
              border: bordered ? `${borderWidth}px ${borderStyle} ${borderColor}` : 'none',
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
