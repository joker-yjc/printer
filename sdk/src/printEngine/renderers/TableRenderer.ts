/**
 * 表格组件渲染器
 */

import type { ComponentNode } from '../../types';
import type { ComponentRenderer, RenderContext, StyleObject } from '../types';
import { buildStyleString, buildPositionStyle } from '../utils/styleBuilder';
import { COMPONENT_DEFAULT_SIZE, TABLE_DEFAULT, TABLE_STYLE_DEFAULT, STYLE_DEFAULT } from '../constants';

export class TableRenderer implements ComponentRenderer {
  readonly type = 'table';

  render(component: ComponentNode, context: RenderContext): string {
    const { layout, style, binding, props } = component;

    // 获取表格数据（优先使用 _pageData，用于跨页拆分）
    let tableData: any[] = [];
    if (props?._pageData) {
      // 使用分页数据（由 calculatePages 传入）
      tableData = props._pageData;
    } else if (binding?.path) {
      // 使用完整数据
      const rawData = context.getValueByPath(binding.path, binding.fallback);
      tableData = Array.isArray(rawData) ? rawData : [];
    }

    // 表头配置，过滤隐藏列
    const allColumns = props?.columns || [];
    const visibleColumns = allColumns.filter((col: any) => !col.hidden);
    const showHeader = props?.showHeader !== false;
    const bordered = props?.bordered !== false;

    // 计算表格宽度：自动占满可用宽度
    let tableWidthMm: number;
    if (context.pageInfo) {
      // 可用宽度 = 页面宽度 - 左右边距
      const availableWidth = context.pageInfo.widthMm - context.pageInfo.marginMm.left - context.pageInfo.marginMm.right;
      tableWidthMm = availableWidth;
    } else {
      // 备用：使用组件设定的宽度或默认值
      tableWidthMm = layout.widthMm || COMPONENT_DEFAULT_SIZE.TABLE_WIDTH;
    }

    // 表格定位样式（使用原始 xMm）
    const positionStyles = buildPositionStyle(
      layout.xMm || 0, // 使用原始 x 位置
      layout.yMm || 0,
      tableWidthMm,
      undefined,
      context.mmToPx
    );

    const tableStyles: StyleObject = {
      ...positionStyles,
      borderCollapse: 'collapse',
      fontSize: `${style?.fontSize || TABLE_STYLE_DEFAULT.FONT_SIZE}px`,
    };

    const tableStyleStr = buildStyleString(tableStyles);

    // 单元格样式
    const cellBorder = bordered ? `border: 1px solid ${TABLE_STYLE_DEFAULT.BORDER_COLOR};` : '';
    const cellPadding = `padding: ${TABLE_STYLE_DEFAULT.CELL_PADDING};`;
    const cellTextStyle = `white-space: normal; word-break: break-word; line-height: ${STYLE_DEFAULT.LINE_HEIGHT}; vertical-align: top;`;
    const textAlign = style?.textAlign || 'left'; // 对齐方式

    // ✅ 计算表头和数据行的高度（mm 转 px）
    const headerHeightPx = TABLE_DEFAULT.HEADER_HEIGHT * context.mmToPx;  // 10mm * 3.78 = 37.8px
    const rowHeightPx = TABLE_DEFAULT.MIN_ROW_HEIGHT * TABLE_DEFAULT.ROW_HEIGHT_FACTOR * context.mmToPx;  // 10.4mm * 3.78 = 39.3px

    // 渲染表头
    let headerHtml = '';
    if (showHeader && visibleColumns.length > 0) {
      const headerCells = visibleColumns
        .map((col: any) => {
          const title = col.title || col.dataIndex;
          return `<th style="${cellBorder} ${cellPadding} ${cellTextStyle} background: ${TABLE_STYLE_DEFAULT.HEADER_BACKGROUND}; font-weight: 600; text-align: ${textAlign}; height: ${headerHeightPx}px; box-sizing: border-box;">${title}</th>`;
        })
        .join('');
      headerHtml = `<thead class="table-header-repeat"><tr style="height: ${headerHeightPx}px;">${headerCells}</tr></thead>`;
    }

    // 渲染表体
    let bodyHtml = '';
    if (tableData.length > 0 && visibleColumns.length > 0) {
      const rows = tableData
        .map((row: any) => {
          const cells = visibleColumns
            .map((col: any) => {
              const value = row[col.dataIndex] || '';
              return `<td style="${cellBorder} ${cellPadding} ${cellTextStyle} text-align: ${textAlign}; height: ${rowHeightPx}px; box-sizing: border-box;">${value}</td>`;
            })
            .join('');
          return `<tr style="height: ${rowHeightPx}px;">${cells}</tr>`;
        })
        .join('');
      bodyHtml = `<tbody>${rows}</tbody>`;
    } else {
      const colspan = visibleColumns.length || 1;
      bodyHtml = `<tbody><tr style="height: ${rowHeightPx}px;"><td colspan="${colspan}" style="${cellBorder} ${cellPadding} text-align: center; color: #999; height: ${rowHeightPx}px; box-sizing: border-box;">暂无数据</td></tr></tbody>`;
    }

    return `<table class="print-table" style="${tableStyleStr}">${headerHtml}${bodyHtml}</table>`;
  }

  calculateHeight(component: ComponentNode, context: RenderContext): number {
    // 表格高度：根据数据行数估算
    if (component.binding?.path) {
      const data = context.getValueByPath(component.binding.path);
      if (Array.isArray(data) && data.length > 0) {
        const headerHeight = component.props?.showHeader !== false ? TABLE_DEFAULT.HEADER_HEIGHT : 0;
        const rowHeight = TABLE_DEFAULT.MIN_ROW_HEIGHT * TABLE_DEFAULT.ROW_HEIGHT_FACTOR;

        return headerHeight + data.length * rowHeight;
      }
    }

    return component.layout.heightMm || COMPONENT_DEFAULT_SIZE.TABLE_HEIGHT;
  }
}
