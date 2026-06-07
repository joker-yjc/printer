/**
 * 表格组件渲染器
 */

import Decimal from 'decimal.js';
import type { ComponentNode, TableColumn, TableProps, SummaryExtraRow } from '../../types';
import type { ComponentRenderer, RenderContext, StyleObject } from '../types';
import { buildStyleString, buildPositionStyle } from '../utils/styleBuilder';
import { COMPONENT_DEFAULT_SIZE, TABLE_DEFAULT, TABLE_STYLE_DEFAULT, TABLE_HEADER_STYLE_DEFAULT, TABLE_DENSITY_PRESETS } from '../constants';
import { getExecutor } from '../../pipes/registry';

/**
 * HTML 转义，防止 XSS 注入
 */
function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 根据数据路径从对象中取值
 * 支持嵌套路径，如：'product.name' => obj.product.name
 * @param obj 数据对象
 * @param path 属性路径，支持点号分隔的嵌套路径
 * @returns 属性值，路径不存在时返回 undefined
 */
function getByPath(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  const keys = path.split('.');
  let value = obj;
  for (const key of keys) {
    if (value === null || value === undefined) return undefined;
    value = value[key];
  }
  return value;
}

/** 列级单元格样式字段名与 CSS 属性的映射 */
const COL_STYLE_MAP: Record<string, string> = {
  fontSize: 'font-size',
  fontWeight: 'font-weight',
  color: 'color',
  backgroundColor: 'background-color',
  textAlign: 'text-align',
};

/**
 * 将列级样式合并到基础样式对象中
 * @param colStyle - 列级样式
 * @param base - 基础样式对象
 * @returns 合并后的样式对象
 */
function mergeColumnStyle(
  colStyle: Record<string, any> | undefined,
  base: Record<string, string | number>
): Record<string, string | number> {
  if (!colStyle) return base;
  const merged = { ...base };
  for (const [key, cssKey] of Object.entries(COL_STYLE_MAP)) {
    const val = colStyle[key];
    if (val === undefined || val === null || val === '') continue;
    if (key === 'fontSize') {
      merged[cssKey] = `${val}px`;
    } else {
      merged[cssKey] = val;
    }
  }
  return merged;
}

/**
 * 解析合计行显示模式
 * 优先级：summaryDisplay > showSummary（向后兼容）
 * - summaryDisplay 已设置时直接返回
 * - 否则根据 showSummary 映射：true → 'both'，false/未设置 → 'none'
 */
export function resolveSummaryMode(props: TableProps): 'both' | 'none' | 'extra-only' {
  if (props.summaryDisplay) return props.summaryDisplay;
  return props.showSummary ? 'both' : 'none';
}

/**
 * 计算各列的宽度百分比
 * - 全部未设置 width → 均分（向后兼容）
 * - 部分设置 width → 固定列用 width，未设置列均分剩余空间
 * - 固定列总和超表格宽度 → 按比例缩放（全固定）或给未固定列最小份额（部分固定）
 * @param columns - 显示列列表
 * @param tableWidthMm - 表格总宽度 mm
 * @returns 每列的 CSS 百分比字符串（如 "25.00%"）
 */
export function computeColWidths(
  columns: { width?: number }[],
  tableWidthMm: number
): string[] {
  // 空数组守卫（#1）
  if (columns.length === 0) return [];

  const totalCols = columns.length;
  const totalFixed = columns.reduce((sum, c) => sum + (c.width || 0), 0);
  const unfixedCount = columns.filter(c => !c.width).length;

  // 全部未设置 width → 均分
  if (unfixedCount === totalCols) {
    return columns.map(() => `${(100 / totalCols).toFixed(2)}%`);
  }

  // 固定列宽总和超过表格宽度（#13 + #14）
  if (totalFixed > tableWidthMm) {
    if (unfixedCount === 0) {
      // 全部固定：按比例缩放（#13）
      const scale = tableWidthMm / totalFixed;
      const pcts = columns.map(col =>
        parseFloat(((col.width! * scale / tableWidthMm) * 100).toFixed(2))
      );
      return columns.map((_, idx) => {
        if (idx === totalCols - 1) {
          const sumPrev = pcts.slice(0, -1).reduce((s, p) => s + p, 0);
          const lastPct = Math.min(100, Math.max(0, 100 - sumPrev));
          return `${lastPct.toFixed(2)}%`;
        }
        return `${pcts[idx].toFixed(2)}%`;
      });
    } else {
      // 部分固定：固定列按比例缩放，未固定列分配最小份额（#14）
      const minPct = 1;
      const fixedAvailable = 100 - minPct * unfixedCount;
      const pcts = columns.map(col => {
        if (col.width) {
          return parseFloat(((col.width / totalFixed) * fixedAvailable).toFixed(2));
        }
        return minPct;
      });
      return columns.map((_, idx) => {
        if (idx === totalCols - 1) {
          const sumPrev = pcts.slice(0, -1).reduce((s, p) => s + p, 0);
          const lastPct = Math.min(100, Math.max(0, 100 - sumPrev));
          return `${lastPct.toFixed(2)}%`;
        }
        return `${pcts[idx].toFixed(2)}%`;
      });
    }
  }

  // 正常情况：固定列 + 未固定列均分剩余
  const remainingMm = tableWidthMm - totalFixed;
  const unsetWidthMm = unfixedCount > 0
    ? Math.max(0, remainingMm / unfixedCount)
    : 0;

  const pcts = columns.map(col => {
    const wMm = col.width || unsetWidthMm;
    return (wMm / tableWidthMm) * 100;
  });

  // 最后一列吸收舍入误差，确保总和严格等于 100%（#8 clamp）
  return columns.map((_, idx) => {
    if (idx === totalCols - 1) {
      const sumPrev = pcts.slice(0, -1).reduce((s, p) =>
        s + parseFloat(p.toFixed(2)), 0);
      const lastPct = Math.min(100, Math.max(0, 100 - sumPrev));
      return `${lastPct.toFixed(2)}%`;
    }
    return `${pcts[idx].toFixed(2)}%`;
  });
}

/**
 * 计算某列的最大允许宽度（mm）
 * @param columns - 显示列列表
 * @param index - 目标列索引
 * @param tableWidthMm - 表格总宽度 mm
 * @param reservedWidth - 预留宽度（如行号列宽度），默认 0
 * @returns 最大允许宽度 mm
 */
export function computeColumnMaxWidth(
  columns: { width?: number }[],
  index: number,
  tableWidthMm: number,
  reservedWidth: number = 0
): number {
  const otherFixed = columns.reduce((sum, col, i) =>
    i !== index ? sum + (col.width || 0) : sum, 0
  );
  return Math.max(1, tableWidthMm - otherFixed - reservedWidth);
}

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

    const showRowNumber = props?.showRowNumber === true;
    const rowNumberColumn: TableColumn = {
      dataIndex: '__row_number__',
      title: props?.rowNumberLabel || '序号',
      align: 'center',
      style: props?.rowNumberStyle,
      headerStyle: props?.rowNumberHeaderStyle,
    };

    const rowNumberCol = showRowNumber ? [{ ...rowNumberColumn, width: props?.rowNumberWidth }] : [];
    const displayColumns = showRowNumber
      ? [...rowNumberCol, ...visibleColumns]
      : visibleColumns;

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

      // 检查是否会溢出（xMm + widthMm 不能超过右页边距）
      if (context.pageInfo) {
        const maxRightEdge = context.pageInfo.widthMm - context.pageInfo.marginMm.right;
        const tableRightEdge = xMm + tableWidthMm;

        if (tableRightEdge > maxRightEdge) {
          console.warn(
            `表格宽度溢出：xMm(${xMm.toFixed(2)}) + widthMm(${tableWidthMm.toFixed(2)}) = ${tableRightEdge.toFixed(2)}mm，` +
            `超出右页边距 ${maxRightEdge.toFixed(2)}mm，已自动调整宽度`
          );
          // 自动调整宽度避免溢出
          tableWidthMm = maxRightEdge - xMm;
        }
      }
    } else if (context.pageInfo) {
      // 未设置宽度：自动占满可用宽度（减去 xMm 偏移）
      const maxRightEdge = context.pageInfo.widthMm - context.pageInfo.marginMm.right;
      tableWidthMm = maxRightEdge - xMm;
    } else {
      // 备用：使用默认值
      tableWidthMm = COMPONENT_DEFAULT_SIZE.TABLE_WIDTH;
    }

    // ✅ 检查 xMm 是否已超过右页边距
    const maxRightEdge = context.pageInfo
      ? context.pageInfo.widthMm - context.pageInfo.marginMm.right
      : COMPONENT_DEFAULT_SIZE.TABLE_WIDTH;

    if (xMm >= maxRightEdge) {
      console.error(
        `[TableRenderer] 表格位置错误：xMm(${xMm.toFixed(2)}mm) 已超过右页边距(${maxRightEdge.toFixed(2)}mm)，` +
        `表格将无法正常显示。请调整表格的 x 位置，使其小于 ${maxRightEdge.toFixed(2)}mm`
      );
    }

    // 最小宽度保护
    if (tableWidthMm < 10) {
      console.warn(`[TableRenderer] 表格宽度过小 (${tableWidthMm.toFixed(2)}mm)，强制设置为最小宽度 10mm`);
      tableWidthMm = 10;
    }
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
    const borderStyle = props?.borderStyle ?? 'solid';
    const borderColor = props?.borderColor ?? TABLE_STYLE_DEFAULT.BORDER_COLOR;
    const borderWidth = props?.borderWidth ?? 1;
    const cellBorder = bordered ? `border: ${borderWidth}px ${borderStyle} ${borderColor};` : '';
    // 根据 density 预设计算单元格内边距和行高
    const densityPreset = TABLE_DENSITY_PRESETS[(props?.density || 'normal') as keyof typeof TABLE_DENSITY_PRESETS]
      ?? TABLE_DENSITY_PRESETS.normal;
    const cellPadding = `padding: ${densityPreset.cellPadding};`;
    const cellLineHeight = densityPreset.lineHeight;
    const cellTextStyle = `white-space: normal; word-break: break-word; line-height: ${cellLineHeight}; vertical-align: middle;`;
    const textAlign = style?.textAlign || 'left'; // 对齐方式

    const colWidths = computeColWidths(displayColumns, tableWidthMm);

    // ✅ 计算表头和数据行的高度（mm 转 px）
    // 根据字体大小等比缩放（默认 12px 对应基准高度），实际高度由内容自然撑开（min-height）
    const fontSize = style?.fontSize || TABLE_STYLE_DEFAULT.FONT_SIZE;
    const fontScale = Math.max(1, fontSize / TABLE_STYLE_DEFAULT.FONT_SIZE);
    const headerHeightPx = TABLE_DEFAULT.HEADER_HEIGHT * fontScale * context.mmToPx;
    const rowHeightPx = TABLE_DEFAULT.MIN_ROW_HEIGHT * TABLE_DEFAULT.ROW_HEIGHT_FACTOR * fontScale * context.mmToPx;

    // 表头默认样式（表格级 → 常量回退）
    const tableHeaderStyle = props?.headerStyle;
    const headerDefaultBg = tableHeaderStyle?.backgroundColor ?? TABLE_HEADER_STYLE_DEFAULT.BACKGROUND;
    const headerDefaultFw = tableHeaderStyle?.fontWeight ?? TABLE_HEADER_STYLE_DEFAULT.FONT_WEIGHT;
    const headerDefaultFontSize = tableHeaderStyle?.fontSize;
    const headerDefaultColor = tableHeaderStyle?.color;

    // 渲染表头
    let headerHtml = '';
    if (showHeader && displayColumns.length > 0) {
      const headerCells = displayColumns
        .map((col: any, idx: number) => {
          const title = col.title || col.dataIndex;
          // 对齐优先级：列级 headerStyle.textAlign > col.align > 表格级 headerStyle > 表格级 textAlign
          const hAlign = col.headerStyle?.textAlign
            || col.align
            || tableHeaderStyle?.textAlign
            || textAlign;
          const baseHeaderStyle: Record<string, string | number> = {
            border: bordered ? `${borderWidth}px ${borderStyle} ${borderColor}` : 'none',
            padding: densityPreset.cellPadding,
            'white-space': 'normal',
            'word-break': 'break-word',
            'line-height': cellLineHeight,
            'vertical-align': 'middle',
            'text-align': hAlign,
            background: headerDefaultBg,
            'font-weight': headerDefaultFw,
            width: colWidths[idx],
            'min-height': `${headerHeightPx}px`,
            'box-sizing': 'border-box',
          };
          if (headerDefaultFontSize !== undefined) {
            baseHeaderStyle['font-size'] = `${headerDefaultFontSize}px`;
          }
          if (headerDefaultColor !== undefined) {
            baseHeaderStyle['color'] = headerDefaultColor;
          }
          const mergedStyle = mergeColumnStyle(col.headerStyle, baseHeaderStyle);
          const styleStr = buildStyleString(mergedStyle);
          return `<th style="${styleStr}">${escapeHtml(title)}</th>`;
        })
        .join('');
      // 表头使用固定高度，表体使用 min-height
      headerHtml = `<thead class="table-header-repeat"><tr style="height: ${headerHeightPx}px;">${headerCells}</tr></thead>`;
    }

    // 渲染表体
    let bodyHtml = '';
    if (tableData.length > 0 && displayColumns.length > 0) {
      const startRowIndex = props?._startRowIndex ?? 0;
      const rows = tableData
        .map((row: any, rowIndex: number) => {
          const cells = displayColumns
            .map((col: any, idx: number) => {
              if (col.dataIndex === '__row_number__') {
                const rowNumber = startRowIndex + rowIndex + 1;
                const baseRowNumStyle: Record<string, string | number> = {
                  border: bordered ? `${borderWidth}px ${borderStyle} ${borderColor}` : 'none',
                  padding: densityPreset.cellPadding,
                  'white-space': 'normal',
                  'word-break': 'break-word',
                  'line-height': cellLineHeight,
                  'vertical-align': 'middle',
                  'text-align': col.style?.textAlign || col.align || 'center',
                  width: colWidths[idx],
                  'min-height': `${rowHeightPx}px`,
                  'box-sizing': 'border-box',
                };
                const rowNumStyle = mergeColumnStyle(col.style, baseRowNumStyle);
                const rowNumStyleStr = buildStyleString(rowNumStyle);
                return `<td style="${rowNumStyleStr}">${rowNumber}</td>`;
              }
              let value = getByPath(row, col.dataIndex) ?? '';
              // 应用列级管道转换
              if (col.pipes && col.pipes.length > 0) {
                const rawValue = value;
                try {
                  value = context.applyPipes(value, col.pipes);
                } catch (pipeError) {
                  console.error('[TableRenderer] 列管道执行失败:', pipeError);
                  value = rawValue;
                }
              }
              // 对齐优先级：列级 style.textAlign > col.align > 表格级 textAlign
              const dAlign = col.style?.textAlign || col.align || textAlign;
              const baseDataStyle: Record<string, string | number> = {
                border: bordered ? `${borderWidth}px ${borderStyle} ${borderColor}` : 'none',
                padding: densityPreset.cellPadding,
                'white-space': 'normal',
                'word-break': 'break-word',
                'line-height': cellLineHeight,
                'vertical-align': 'middle',
                'text-align': dAlign,
                width: colWidths[idx],
                'min-height': `${rowHeightPx}px`,
                'box-sizing': 'border-box',
              };
              const dataStyle = mergeColumnStyle(col.style, baseDataStyle);
              const dataStyleStr = buildStyleString(dataStyle);
              return `<td style="${dataStyleStr}">${escapeHtml(String(value))}</td>`;
            })
            .join('');
          return `<tr style="min-height: ${rowHeightPx}px;">${cells}</tr>`;
        })
        .join('');
      bodyHtml = `<tbody>${rows}</tbody>`;
    } else {
      const colspan = displayColumns.length || 1;
      bodyHtml = `<tbody><tr style="min-height: ${rowHeightPx}px;"><td colspan="${colspan}" style="${cellBorder} ${cellPadding} line-height: ${cellLineHeight}; text-align: center; color: #999; min-height: ${rowHeightPx}px; box-sizing: border-box;">暂无数据</td></tr></tbody>`;
    }

    // 渲染合计行
    const tableProps = props as TableProps;
    const summaryModeResolved = resolveSummaryMode(tableProps);
    const legacySummaryMode = props?.summaryMode || 'total'; // 默认仅最后一页合计
    const isLastPage = props?._isLastPage === true;

    // 根据 resolveSummaryMode 决定是否渲染 tfoot（统一收口）
    const hasSummaryRow = tableData.length > 0 && (
      legacySummaryMode === 'page' || // 每页都显示
      (legacySummaryMode === 'total' && isLastPage) // 仅最后一页显示
    );
    const hasExtraRows = (tableProps.summaryExtraRows?.length ?? 0) > 0;
    const extraRowsShouldRender = hasExtraRows && (
      summaryModeResolved === 'extra-only' || // extra-only 模式每页渲染额外行
      legacySummaryMode === 'page' ||
      (legacySummaryMode === 'total' && isLastPage)
    );
    const shouldRenderTfoot = summaryModeResolved !== 'none' && (hasSummaryRow || extraRowsShouldRender);

    // 选择计算数据源：total 模式使用全量数据，page 模式使用当前页数据
    const summaryData = legacySummaryMode === 'total' && props?._totalData
      ? props._totalData
      : tableData;

    let summaryHtml = '';
    if (shouldRenderTfoot) {
      // renderSummary 内部根据 summaryModeResolved 决定渲染哪些行：
      // 'both' → 合计行 + 额外行（如有）；'extra-only' → 仅额外行
      summaryHtml = this.renderSummary(
        summaryData, displayColumns, tableProps, cellBorder, cellPadding, cellTextStyle,
        rowHeightPx, textAlign, colWidths, summaryModeResolved, hasSummaryRow
      );
    }

    return `<table class="print-table" style="${tableStyleStr}">${headerHtml}${bodyHtml}${summaryHtml}</table>`;
  }

  /**
   * 渲染合计行（统一出口：根据 summaryMode 决定渲染合计行和/或额外行）
   * @param summaryMode 合计行显示模式，'extra-only' 时跳过合计行只渲染额外行
   * @param hasSummaryRow 是否满足合计行渲染条件（有数据且符合 page/total 模式）
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
    colWidths: string[],
    summaryMode: 'both' | 'none' | 'extra-only' = 'both',
    hasSummaryRow: boolean = true
  ): string {
    if (!columns.length) return '';

    const summaryLabel = props.summaryLabel || '合计';
    const summaryStyle = props.summaryStyle || {};
    const bgColor = summaryStyle.backgroundColor || '#f5f5f5';
    const fontWeight = summaryStyle.fontWeight || 'bold';
    const fontSize = summaryStyle.fontSize;

    const firstDataColumn = columns.find((col) => col.dataIndex !== '__row_number__');

    // extra-only 模式或不满足合计行条件时，跳过合计行
    let summaryRowHtml = '';
    if (summaryMode !== 'extra-only' && hasSummaryRow) {
      const cells = columns.map((col, idx) => {
        let content = '';

        if (col.dataIndex === '__row_number__') {
          content = '';
        } else if (col === firstDataColumn) {
          content = summaryLabel;
        } else if (col.summary) {
          content = this.calculateSummary(data, col);
        }

        const cellStyle = `
          ${cellBorder}
          ${cellPadding}
          ${cellTextStyle}
          text-align: ${col.align || defaultTextAlign};
          width: ${colWidths[idx]};
          min-height: ${rowHeightPx}px;
          box-sizing: border-box;
          background: ${bgColor};
          font-weight: ${fontWeight};
          ${fontSize ? `font-size: ${fontSize}px;` : ''}
        `.trim().replace(/\s+/g, ' ');

        return `<td style="${cellStyle}">${escapeHtml(content)}</td>`;
      }).join('');

      summaryRowHtml = `<tr style="min-height: ${rowHeightPx}px;">${cells}</tr>`;
    }

    const extraRowsHtml = this.renderSummaryExtraRows(
      data, columns, props, cellBorder, cellPadding, cellTextStyle, rowHeightPx, columns.length
    );

    return `<tfoot>${summaryRowHtml}${extraRowsHtml}</tfoot>`;
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
        const val = getByPath(row, column.dataIndex);
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

      let finalResult = `${prefix}${formatted}${suffix}`;

      if (summary.pipe) {
        const executor = getExecutor(summary.pipe.type);

        if (executor) {
          finalResult = executor.execute(Number(formatted), summary.pipe.options) || '';
        }
      }

      return finalResult;
    } catch (formatError) {
      console.error('[TableRenderer] 格式化合计结果失败:', formatError);
      return '-';
    }
  }

  /**
   * 获取列合计的原始数值（用于额外行管道处理）
   */
  private getColumnSummaryRawValue(data: any[], column: TableColumn): number | null {
    if (!data.length || !column.summary) return null;

    const values = data
      .map(row => {
        const val = getByPath(row, column.dataIndex);
        const num = Number(val);
        return isNaN(num) ? null : num;
      })
      .filter(val => val !== null) as number[];

    if (!values.length) return null;

    const { summary } = column;
    let result: Decimal;

    try {
      switch (summary.type) {
        case 'sum':
          result = values.reduce((sum, val) => sum.plus(val), new Decimal(0));
          break;
        case 'avg':
          result = values.reduce((sum, val) => sum.plus(val), new Decimal(0)).dividedBy(values.length);
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
          return null;
      }
      return result.toNumber();
    } catch {
      return null;
    }
  }

  /**
   * 渲染合计额外行
   */
  private renderSummaryExtraRows(
    data: any[],
    columns: TableColumn[],
    props: TableProps,
    cellBorder: string,
    cellPadding: string,
    cellTextStyle: string,
    rowHeightPx: number,
    colCount: number
  ): string {
    const extraRows = props.summaryExtraRows;
    if (!extraRows || extraRows.length === 0) return '';
    if (resolveSummaryMode(props) === 'none') return '';

    const summaryStyle = props.summaryStyle || {};
    const defaultBgColor = summaryStyle.backgroundColor || '#f5f5f5';
    const defaultFontWeight = summaryStyle.fontWeight || 'bold';

    return extraRows.map((row: SummaryExtraRow) => {
      const bgColor = row.backgroundColor || defaultBgColor;
      const fontWeight = row.fontWeight || defaultFontWeight;
      const align = row.align || 'left';

      const content = (row.items || []).map(item => {
        let text = item.label || '';

        if (item.sourceColumn) {
          const col = columns.find(c => c.dataIndex === item.sourceColumn);
          if (col) {
            let value: any = this.getColumnSummaryRawValue(data, col);
            if (item.pipes && value !== null) {
              const originalValue = value;
              try {
                for (const pipe of item.pipes) {
                  const executor = getExecutor(pipe.type);
                  if (executor) {
                    value = executor.execute(value, pipe.options);
                  }
                }
              } catch (pipeError) {
                console.error('[TableRenderer] 额外行管道执行失败:', pipeError);
                value = originalValue; // 保留原始值，不置 null
              }
            }
            if (value !== null && value !== undefined) {
              text += String(value);
            }
          }
        }

        return text;
      }).join('');

      const cellStyle = `
        ${cellBorder}
        ${cellPadding}
        ${cellTextStyle}
        text-align: ${align};
        min-height: ${rowHeightPx}px;
        box-sizing: border-box;
        background: ${bgColor};
        font-weight: ${fontWeight};
      `.trim().replace(/\s+/g, ' ');

      return `<tr style="min-height: ${rowHeightPx}px;"><td colspan="${colCount}" style="${cellStyle}">${escapeHtml(content)}</td></tr>`;
    }).join('');
  }

  calculateHeight(component: ComponentNode, context: RenderContext): number {
    // 表格高度：简单估算（用于初始布局计算，实际分页使用 measureTableRowHeights）
    const summaryMode = resolveSummaryMode((component.props || {}) as TableProps);
    const extraRowsCount = summaryMode !== 'none'
      ? (component.props?.summaryExtraRows?.length || 0)
      : 0;

    // 与 calculateTableRowHeight / calculateTableHeaderHeight 保持一致：按字体等比缩放
    const fontSize = component.style?.fontSize || TABLE_STYLE_DEFAULT.FONT_SIZE;
    const scale = Math.max(1, fontSize / TABLE_STYLE_DEFAULT.FONT_SIZE);

    if (component.binding?.path) {
      const data = context.getValueByPath(component.binding.path);
      if (Array.isArray(data) && data.length > 0) {
        const headerHeight = component.props?.showHeader !== false
          ? TABLE_DEFAULT.HEADER_HEIGHT * scale
          : 0;
        const rowHeight = TABLE_DEFAULT.MIN_ROW_HEIGHT * TABLE_DEFAULT.ROW_HEIGHT_FACTOR * scale;
        // 'extra-only' 时不渲染合计行，summaryHeight 为 0
        const summaryHeight = (summaryMode !== 'none' && summaryMode !== 'extra-only') ? rowHeight : 0;

        return headerHeight + data.length * rowHeight + summaryHeight + extraRowsCount * rowHeight;
      }
    }

    // 无 binding 回退：使用布局高度 + 额外行估算（按字体缩放）
    const baseHeight = component.layout.heightMm || COMPONENT_DEFAULT_SIZE.TABLE_HEIGHT;
    return baseHeight * scale + extraRowsCount * TABLE_DEFAULT.MIN_ROW_HEIGHT * scale;
  }
}
