/**
 * 表格组件渲染器
 */

import Decimal from 'decimal.js';
import type { ComponentNode, TableColumn, TableProps } from '../../types';
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

    // 支持分页传入的 _showHeader 标记，优先于 props.showHeader
    const explicitShowHeader = props && typeof (props as any)._showHeader === 'boolean'
      ? (props as any)._showHeader
      : undefined;
    const showHeader = explicitShowHeader !== undefined ? explicitShowHeader : props?.showHeader !== false;
    const bordered = props?.bordered !== false;

    // 计算表格宽度
    let tableWidthMm: number;
    const xMm = layout.xMm || 0;

    if (layout.widthMm) {
      // 优先使用用户设置的宽度
      tableWidthMm = layout.widthMm;

      // 检查是否会溢出（xMm + widthMm 不能超过可用宽度）
      if (context.pageInfo) {
        const availableWidth = context.pageInfo.widthMm - context.pageInfo.marginMm.left - context.pageInfo.marginMm.right;
        const totalOccupied = xMm + tableWidthMm;

        if (totalOccupied > availableWidth) {
          console.warn(
            `表格宽度溢出：xMm(${xMm.toFixed(2)}) + widthMm(${tableWidthMm.toFixed(2)}) = ${totalOccupied.toFixed(2)}mm，` +
            `超出可用宽度 ${availableWidth.toFixed(2)}mm，已自动调整宽度`
          );
          // 自动调整宽度避免溢出
          tableWidthMm = availableWidth - xMm;
        }
      }
    } else if (context.pageInfo) {
      // 未设置宽度：自动占满可用宽度（减去 xMm 偏移）
      const availableWidth = context.pageInfo.widthMm - context.pageInfo.marginMm.left - context.pageInfo.marginMm.right;
      tableWidthMm = availableWidth - xMm;
    } else {
      // 备用：使用默认值
      tableWidthMm = COMPONENT_DEFAULT_SIZE.TABLE_WIDTH;
    }

    // ✅ 检查 xMm 是否已超过可用宽度
    const availableWidth = context.pageInfo
      ? context.pageInfo.widthMm - context.pageInfo.marginMm.left - context.pageInfo.marginMm.right
      : COMPONENT_DEFAULT_SIZE.TABLE_WIDTH;

    if (xMm >= availableWidth) {
      console.error(
        `[TableRenderer] 表格位置错误：xMm(${xMm.toFixed(2)}mm) 已超过页面可用宽度(${availableWidth.toFixed(2)}mm)，` +
        `表格将无法正常显示。请调整表格的 x 位置，使其小于 ${availableWidth.toFixed(2)}mm`
      );
    }

    // 最小宽度保护
    if (tableWidthMm < 10) {
      console.warn(`[TableRenderer] 表格宽度过小 (${tableWidthMm.toFixed(2)}mm)，强制设置为最小宽度 10mm`);
      tableWidthMm = 10;
    }
    console.log(tableWidthMm, "tableWidthMm");
    // 表格定位样式（使用 xMm 偏移）
    const positionStyles = buildPositionStyle(
      xMm, // 使用提取的 xMm
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
    const cellTextStyle = `white-space: normal; word-break: break-word; line-height: ${STYLE_DEFAULT.LINE_HEIGHT}; vertical-align: middle;`;
    const textAlign = style?.textAlign || 'left'; // 对齐方式

    // ✅ 计算均分列宽（简化方案：按列数均分表格宽度）
    const colCount = visibleColumns.length || 1;
    const colWidthPercent = (100 / colCount).toFixed(2);

    // ✅ 计算表头和数据行的高度（mm 转 px）
    // 使用全局常量 ROW_HEIGHT_FACTOR，实际高度由内容自然撑开（min-height）
    const headerHeightPx = TABLE_DEFAULT.HEADER_HEIGHT * context.mmToPx;
    const rowHeightPx = TABLE_DEFAULT.MIN_ROW_HEIGHT * TABLE_DEFAULT.ROW_HEIGHT_FACTOR * context.mmToPx;

    // 渲染表头
    let headerHtml = '';
    if (showHeader && visibleColumns.length > 0) {
      const headerCells = visibleColumns
        .map((col: any) => {
          const title = col.title || col.dataIndex;
          // 使用百分比宽度实现均分，min-height 允许自然扩展
          return `<th style="${cellBorder} ${cellPadding} ${cellTextStyle} background: ${TABLE_STYLE_DEFAULT.HEADER_BACKGROUND}; font-weight: 600; text-align: ${textAlign}; width: ${colWidthPercent}%; min-height: ${headerHeightPx}px; box-sizing: border-box;">${title}</th>`;
        })
        .join('');
      // 表头使用固定高度，表体使用 min-height
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
              // 使用百分比宽度，min-height 允许内容换行时自然扩展
              return `<td style="${cellBorder} ${cellPadding} ${cellTextStyle} text-align: ${textAlign}; width: ${colWidthPercent}%; min-height: ${rowHeightPx}px; box-sizing: border-box;">${value}</td>`;
            })
            .join('');
          // 行使用 min-height 而非固定 height
          return `<tr style="min-height: ${rowHeightPx}px;">${cells}</tr>`;
        })
        .join('');
      bodyHtml = `<tbody>${rows}</tbody>`;
    } else {
      const colspan = visibleColumns.length || 1;
      bodyHtml = `<tbody><tr style="min-height: ${rowHeightPx}px;"><td colspan="${colspan}" style="${cellBorder} ${cellPadding} text-align: center; color: #999; min-height: ${rowHeightPx}px; box-sizing: border-box;">暂无数据</td></tr></tbody>`;
    }

    // 渲染合计行（新增）
    const showSummary = props?.showSummary === true;
    const summaryMode = props?.summaryMode || 'total'; // 默认仅最后一页合计
    const isLastPage = props?._isLastPage === true;

    // 根据模式决定是否显示合计行
    const shouldShowSummary = showSummary && tableData.length > 0 && (
      summaryMode === 'page' || // 每页都显示
      (summaryMode === 'total' && isLastPage) // 仅最后一页显示
    );

    // 选择计算数据源：total 模式使用全量数据，page 模式使用当前页数据
    const summaryData = summaryMode === 'total' && props?._totalData
      ? props._totalData
      : tableData;

    const summaryHtml = shouldShowSummary
      ? this.renderSummary(summaryData, visibleColumns, props as TableProps, cellBorder, cellPadding, cellTextStyle, rowHeightPx, textAlign, colWidthPercent)
      : '';

    return `<table class="print-table" style="${tableStyleStr}">${headerHtml}${bodyHtml}${summaryHtml}</table>`;
  }

  /**
   * 渲染合计行
   */
  private renderSummary(
    data: any[],
    columns: TableColumn[],
    props: TableProps,
    cellBorder: string,
    cellPadding: string,
    cellTextStyle: string,
    rowHeightPx: number,
    defaultTextAlign: string,
    colWidthPercent: string = 'auto'
  ): string {
    if (!columns.length) return '';

    const summaryLabel = props.summaryLabel || '合计';
    const summaryStyle = props.summaryStyle || {};
    const bgColor = summaryStyle.backgroundColor || '#f5f5f5';
    const fontWeight = summaryStyle.fontWeight || 'bold';
    const fontSize = summaryStyle.fontSize;

    const cells = columns.map((col, index) => {
      let content = '';

      if (index === 0) {
        // 首列显示合计标签
        content = summaryLabel;
      } else if (col.summary) {
        // 有合计配置的列，计算合计值
        content = this.calculateSummary(data, col);
      }

      const cellStyle = `
        ${cellBorder}
        ${cellPadding}
        ${cellTextStyle}
        text-align: ${col.align || defaultTextAlign};
        width: ${colWidthPercent}%;
        min-height: ${rowHeightPx}px;
        box-sizing: border-box;
        background: ${bgColor};
        font-weight: ${fontWeight};
        ${fontSize ? `font-size: ${fontSize}px;` : ''}
      `.trim().replace(/\s+/g, ' ');

      return `<td style="${cellStyle}">${content}</td>`;
    }).join('');

    return `<tfoot><tr style="min-height: ${rowHeightPx}px;">${cells}</tr></tfoot>`;
  }

  /**
   * 计算单列合计值（使用 Decimal.js 解决精度问题）
   */
  private calculateSummary(data: any[], column: TableColumn): string {
    if (!data.length) return '-';

    const { summary } = column;
    if (!summary) return '';

    const values = data
      .map(row => {
        const val = row[column.dataIndex];
        // 尝试转换为数字，失败则返回 null
        const num = Number(val);
        return isNaN(num) ? null : num;
      })
      .filter(val => val !== null) as number[];

    if (!values.length) return '-';

    let result: Decimal;
    try {
      switch (summary.type) {
        case 'sum':
          result = values.reduce((sum, val) => sum.plus(val), new Decimal(0));
          break;
        case 'avg':
          const sum = values.reduce((s, val) => s.plus(val), new Decimal(0));
          result = sum.dividedBy(values.length);
          break;
        case 'max':
          result = Decimal.max(...values.map(v => new Decimal(v)));
          break;
        case 'min':
          result = Decimal.min(...values.map(v => new Decimal(v)));
          break;
        case 'count':
          result = new Decimal(values.length);
          break;
        default:
          return '-';
      }
    } catch (error) {
      console.error('[TableRenderer] 合计计算错误:', error);
      // ✅ 返回友好的错误提示，而不是静默失败
      return '计算错误';
    }

    // ✅ 格式化前检查结果是否有效
    if (!result || typeof result.toFixed !== 'function') {
      console.warn('[TableRenderer] 合计结果无效:', result);
      return '-';
    }

    // 格式化
    try {
      const precision = summary.precision ?? 2;
      const formatted = result.toFixed(precision);
      const prefix = summary.prefix || '';
      const suffix = summary.suffix || '';

      return `${prefix}${formatted}${suffix}`;
    } catch (formatError) {
      console.error('[TableRenderer] 格式化合计结果失败:', formatError);
      return '-';
    }
  }

  calculateHeight(component: ComponentNode, context: RenderContext): number {
    // 表格高度：简单估算（用于初始布局计算，实际分页使用 measureTableRowHeights）
    if (component.binding?.path) {
      const data = context.getValueByPath(component.binding.path);
      if (Array.isArray(data) && data.length > 0) {
        const headerHeight = component.props?.showHeader !== false ? TABLE_DEFAULT.HEADER_HEIGHT : 0;
        // 使用基础行高（不乘系数），实际高度由渲染后测量决定
        const rowHeight = TABLE_DEFAULT.MIN_ROW_HEIGHT;
        const summaryHeight = component.props?.showSummary === true ? rowHeight : 0;

        return headerHeight + data.length * rowHeight + summaryHeight;
      }
    }

    return component.layout.heightMm || COMPONENT_DEFAULT_SIZE.TABLE_HEIGHT;
  }
}
