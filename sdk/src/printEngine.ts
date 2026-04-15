/**
 * 打印引擎核心类（插件化重构版）
 * 负责：插件管理、数据绑定、Pipe 转换、虚拟分页计算
 */

import type { PrintTemplate, ComponentNode, DataBinding, PipeConfig } from './types';
import type { ComponentRenderer, RenderContext } from './printEngine/types';
import { MM_TO_PX, TABLE_DEFAULT, COMPONENT_DEFAULT_SIZE } from './printEngine/constants';
import {
  generatePrintPageStyles,
  generatePrintHTML,
  getPageSizeFromConfig,
} from './printEngine/htmlTemplate';
import { executePipe } from './pipes/registry';

// 导入所有渲染器插件
import {
  TextRenderer,
  TableRenderer,
  ImageRenderer,
  RectRenderer,
  LineRenderer,
  QRCodeRenderer,
  BarcodeRenderer,
} from './printEngine/renderers';

// 导出类型和常量
export type { ComponentRenderer, RenderContext } from './printEngine/types';
export { MM_TO_PX, COMPONENT_DEFAULT_SIZE, TABLE_DEFAULT, STYLE_DEFAULT, TABLE_STYLE_DEFAULT, BARCODE_CONFIG, QRCODE_CONFIG } from './printEngine/constants';

export class PrintEngine {
  private template: PrintTemplate;
  private data: any;
  private renderers: Map<string, ComponentRenderer>;
  private readonly mmToPx = MM_TO_PX; // 使用常量：96 DPI 下 1mm = 3.78px

  constructor(template: PrintTemplate, data: any) {
    this.template = template;
    this.data = data;
    this.renderers = new Map();

    // 注册默认渲染器
    this.registerDefaultRenderers();
  }

  /**
   * 注册默认渲染器
   */
  private registerDefaultRenderers() {
    this.registerRenderer(new TextRenderer());
    this.registerRenderer(new TableRenderer());
    this.registerRenderer(new ImageRenderer());
    this.registerRenderer(new RectRenderer());
    this.registerRenderer(new LineRenderer());
    this.registerRenderer(new QRCodeRenderer());
    this.registerRenderer(new BarcodeRenderer());
  }

  /**
   * 注册渲染器插件
   * @param renderer 组件渲染器
   */
  public registerRenderer(renderer: ComponentRenderer): void {
    this.renderers.set(renderer.type, renderer);
  }

  /**
   * 注销渲染器插件
   * @param type 组件类型
   */
  public unregisterRenderer(type: string): void {
    this.renderers.delete(type);
  }

  /**
   * 根据数据路径获取值
   * 支持嵌套路径，如：order.receiver.name
   * 智能匹配：如果路径以 root. 开头但数据中没有 root 层，自动去掉 root. 前缀
   */
  private getValueByPath(path: string, fallback?: string): any {
    if (!path) return fallback || '';

    const keys = path.split('.');
    let value = this.data;

    // 智能匹配：如果第一层是 'root' 但数据中没有 root 属性，跳过 root
    let startIndex = 0;
    if (keys[0] === 'root' && keys.length > 1) {
      // 检查数据是否有 root 属性
      if (this.data && typeof this.data === 'object' && !('root' in this.data)) {
        // 数据中没有 root 层，跳过 root 前缀
        startIndex = 1;
      }
    }

    for (let i = startIndex; i < keys.length; i++) {
      const key = keys[i];
      if (value === null || value === undefined) {
        return fallback || '';
      }
      value = value[key];
    }

    return value !== undefined ? value : (fallback || '');
  }

  /**
   * 应用管道转换
   */
  private applyPipes(value: any, pipes?: PipeConfig[]): any {
    if (!pipes || pipes.length === 0) return value;

    let result = value;
    for (const pipe of pipes) {
      result = this.executePipe(result, pipe);
    }
    return result;
  }

  /**
   * 执行单个管道转换
   */
  private executePipe(value: any, pipe: PipeConfig): any {
    // 使用插件化的管道执行器
    return executePipe(pipe.type, value, pipe.options);
  }

  /**
   * 简单的日期格式化
   */
  private formatDate(value: any, format: string): string {
    if (!value) return '';

    const date = new Date(value);
    if (isNaN(date.getTime())) return String(value);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  /**
   * 解析数据绑定，返回最终渲染的值
   */
  private resolveBinding(binding?: DataBinding): string {
    if (!binding || !binding.path) {
      return '';
    }

    const rawValue = this.getValueByPath(binding.path, binding.fallback);
    const finalValue = this.applyPipes(rawValue, binding.pipes);

    return String(finalValue);
  }

  /**
   * 创建渲染上下文
   */
  private createRenderContext(): RenderContext {
    const { page } = this.template;
    const { widthMm, heightMm } = this.getPageSize();

    return {
      data: this.data,
      resolveBinding: this.resolveBinding.bind(this),
      applyPipes: this.applyPipes.bind(this),
      getValueByPath: this.getValueByPath.bind(this),
      formatDate: this.formatDate.bind(this),
      mmToPx: this.mmToPx,
      pageInfo: {
        widthMm,
        heightMm,
        marginMm: {
          top: page.marginMm?.top || 0,
          right: page.marginMm?.right || 0,
          bottom: page.marginMm?.bottom || 0,
          left: page.marginMm?.left || 0,
        },
      },
    };
  }

  /**
   * 渲染单个组件（通过插件）
   */
  renderComponent(component: ComponentNode): string {
    const renderer = this.renderers.get(component.type);

    if (!renderer) {
      console.warn(`No renderer found for component type: ${component.type}`);
      return '';
    }

    const context = this.createRenderContext();
    return renderer.render(component, context);
  }

  /**
   * 获取页面尺寸（mm）
   */
  private getPageSize(): { widthMm: number; heightMm: number } {
    const { page } = this.template;
    let pageWidthMm: number;
    let pageHeightMm: number;

    if (page.size === 'CUSTOM') {
      pageWidthMm = page.widthMm || 210;
      pageHeightMm = page.heightMm || 297;
    } else if (page.size === 'CONTINUOUS') {
      // 连续纸：宽度固定，高度不限
      pageWidthMm = page.widthMm || 80;
      pageHeightMm = Infinity;
    } else {
      pageWidthMm = page.size === 'A4' ? 210 : 148;
      pageHeightMm = page.size === 'A4' ? 297 : 210;
    }

    if (page.orientation === 'landscape' && page.size !== 'CONTINUOUS') {
      [pageWidthMm, pageHeightMm] = [pageHeightMm, pageWidthMm];
    }

    return { widthMm: pageWidthMm, heightMm: pageHeightMm };
  }

  /**
   * 判断是否需要换页
   * @param currentHeight 当前页面累计高度
   * @param componentHeight 组件高度
   * @param gap 组件间距
   * @param availableHeight 可用高度
   * @param isFirstComponent 是否为页面第一个组件
   */
  private shouldBreakPage(
    currentHeight: number,
    componentHeight: number,
    gap: number,
    availableHeight: number,
    isFirstComponent: boolean
  ): boolean {
    const needHeight = isFirstComponent ? componentHeight : gap + componentHeight;
    return currentHeight + needHeight > availableHeight;
  }

  /**
   * 计算表头高度（mm）
   */
  private calculateTableHeaderHeight(comp: ComponentNode): number {
    // 如果用户设置 showHeader: false，则表头高度为 0
    if (comp.props?.showHeader === false) {
      return 0;
    }
    // 使用 TABLE_DEFAULT.HEADER_HEIGHT 作为表头高度
    return TABLE_DEFAULT.HEADER_HEIGHT;
  }

  /**
   * 计算表格行高度（mm）
   */
  private calculateTableRowHeight(comp: ComponentNode): number {
    // 使用 MIN_ROW_HEIGHT * ROW_HEIGHT_FACTOR 作为行高
    return TABLE_DEFAULT.MIN_ROW_HEIGHT * TABLE_DEFAULT.ROW_HEIGHT_FACTOR;
  }

  /**
   * 渲染页码（根据页面配置）
   */
  private renderPageNumber(pageNumber?: number, totalPages?: number): string {
    const { page } = this.template;
    const pageNumberConfig = page.pageNumber;

    // 如果未启用页码或缺少页码信息，返回空
    if (!pageNumberConfig?.enabled || pageNumber === undefined || totalPages === undefined) {
      return '';
    }

    console.log(`[PrintEngine] 渲染页码: pageNumber=${pageNumber}, totalPages=${totalPages}`, pageNumberConfig);

    // 格式化页码文本
    const format = pageNumberConfig.format || 'slash';
    const prefix = pageNumberConfig.prefix || '';
    const suffix = pageNumberConfig.suffix || '';
    const separator = pageNumberConfig.separator || '/';

    let pageText = '';
    if (format === 'simple') {
      pageText = `${pageNumber}`;
    } else if (format === 'text') {
      pageText = `第${pageNumber}页 共${totalPages}页`;
    } else {
      pageText = `${pageNumber}${separator}${totalPages}`;
    }
    pageText = `${prefix}${pageText}${suffix}`;

    // 计算位置
    const { widthMm, heightMm } = this.getPageSize();
    const { position, offsetX = 0, offsetY = 0, style = {} } = pageNumberConfig;
    const fontSize = style.fontSize || 12;
    const color = style.color || '#666';
    const fontWeight = style.fontWeight || 'normal';

    // 根据 position 计算 x, y 坐标
    let xMm = 0;
    let yMm = 0;
    const pageNumberWidth = 20; // 页码宽度 mm
    const pageNumberHeight = 6; // 页码高度 mm

    const marginTop = page.marginMm?.top || 0;
    const marginRight = page.marginMm?.right || 0;
    const marginBottom = page.marginMm?.bottom || 0;
    const marginLeft = page.marginMm?.left || 0;

    switch (position) {
      case 'top-left':
        xMm = marginLeft;
        yMm = marginTop;
        break;
      case 'top-center':
        xMm = (widthMm - pageNumberWidth) / 2;
        yMm = marginTop;
        break;
      case 'top-right':
        xMm = widthMm - marginRight - pageNumberWidth;
        yMm = marginTop;
        break;
      case 'bottom-left':
        xMm = marginLeft;
        yMm = heightMm - marginBottom - pageNumberHeight;
        break;
      case 'bottom-center':
        xMm = (widthMm - pageNumberWidth) / 2;
        yMm = heightMm - marginBottom - pageNumberHeight;
        break;
      case 'bottom-right':
      default:
        xMm = widthMm - marginRight - pageNumberWidth;
        yMm = heightMm - marginBottom - pageNumberHeight;
        break;
    }

    // 应用偏移
    xMm += offsetX;
    yMm += offsetY;

    // 转换为 px
    const xPx = xMm * this.mmToPx;
    const yPx = yMm * this.mmToPx;
    const widthPx = pageNumberWidth * this.mmToPx;
    const heightPx = pageNumberHeight * this.mmToPx;

    // 生成 HTML
    const alignStyle = position.includes('left') ? 'left' : position.includes('right') ? 'right' : 'center';
    const justifyContent = alignStyle === 'left' ? 'flex-start' : alignStyle === 'right' ? 'flex-end' : 'center';

    return `<div style="position: absolute; left: ${xPx}px; top: ${yPx}px; width: ${widthPx}px; height: ${heightPx}px; font-size: ${fontSize}px; color: ${color}; font-weight: ${fontWeight}; display: flex; align-items: center; justify-content: ${justifyContent};">${this.escapeHtml(pageText)}</div>`;
  }

  /**
   * HTML 转义
   */
  private escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  /**
   * 渲染单个页面（直接渲染，不做智能布局）
   * @param components 组件列表
   * @param pageNumber 当前页码（可选）
   * @param totalPages 总页数（可选）
   */
  private renderSinglePage(components: ComponentNode[], pageNumber?: number, totalPages?: number): string {
    console.log(`[PrintEngine] renderSinglePage: 页码=${pageNumber}, 总页数=${totalPages}, 组件数=${components.length}`);

    // 渲染所有组件
    const componentsHTML = components.map(comp => this.renderComponent(comp)).join('');

    // 如果页面配置启用了页码，在固定位置渲染页码
    const pageNumberHTML = this.renderPageNumber(pageNumber, totalPages);

    return componentsHTML + pageNumberHTML;
  }

  /**
   * 虚拟分页：基于相对间距的流式布局
   * 核心逻辑：
   * 1. 计算每个组件与上一个组件的间距 (gap)
   * 2. 按顺序累加高度，遇到表格就拆分
   * 3. 换页时从 marginTop 开始，忽略原 gap
   */
  private async calculatePages(components: ComponentNode[]): Promise<ComponentNode[][]> {
    const { page } = this.template;
    const { heightMm } = this.getPageSize();

    // 连续纸模式不分页
    if (page.size === 'CONTINUOUS' || heightMm === Infinity) {
      return [components];
    }

    // 可用高度 = 页面高度 - 上下边距
    const marginTop = page.marginMm?.top || 0;
    const marginBottom = page.marginMm?.bottom || 0;
    const availableHeightMm = heightMm - marginTop - marginBottom;

    // 1. 按 yMm 排序（从上到下）
    const sortedComponents = [...components].sort((a, b) =>
      (a.layout.yMm || 0) - (b.layout.yMm || 0)
    );

    // 2. 计算相对间距
    interface ComponentWithGap {
      comp: ComponentNode;
      gap: number;  // 与上一个组件底部的间距 (mm)
    }

    const componentsWithGaps: ComponentWithGap[] = sortedComponents.map((comp, index) => {
      if (index === 0) {
        // 第一个组件：间距 = 距离页面顶部的距离
        return { comp, gap: (comp.layout.yMm || 0) };
      }

      const prevComp = sortedComponents[index - 1];
      // ✅ 使用设计高度计算相对间距（保留负数，表示组件重叠）
      // 注意：表格的实际高度会在 splitTableWithGap 中重新计算
      const prevBottom = (prevComp.layout.yMm || 0) + (prevComp.layout.heightMm || 0);
      const gap = (comp.layout.yMm || 0) - prevBottom; // 保留负数，表示组件重叠

      return { comp, gap };
    });

    // 3. 遍历组件，累加高度

    const context = this.createRenderContext();
    const pages: ComponentNode[][] = [];
    let currentPage: ComponentNode[] = [];
    let currentPageHeight = marginTop;  // 当前页的累计高度
    let isFirstComponentInPage = true;  // 标记当前页是否是第一个组件

    for (let i = 0; i < componentsWithGaps.length; i++) {
      const { comp, gap: designGap } = componentsWithGaps[i];
      const compHeightMm = comp.layout.heightMm || 50;

      // ✅ 使用设计时的相对间距（保留负数，表示组件重叠）
      // designGap 是设计时计算的：组件B.yMm - (组件A.yMm + 组件A.heightMm)
      // 这代表了设计意图中的"组件A底部到组件B顶部的间距"
      // 负数表示组件重叠，这是设计时允许的布局方式
      const actualGap = designGap;

      // 边界检查：组件高度接近页面高度时输出警告
      if (compHeightMm > availableHeightMm * 0.8) {
        console.warn(
          `组件 ${comp.id} (${comp.type}) 高度 ${compHeightMm.toFixed(2)}mm 接近页面可用高度 ${availableHeightMm.toFixed(2)}mm，可能影响分页效果`
        );
      }

      // 4.1 如果是表格，进行跨页拆分
      if (comp.type === 'table' && comp.binding?.path) {
        const tableData = context.getValueByPath(comp.binding.path);
        if (Array.isArray(tableData) && tableData.length > 0) {
          const result = await this.splitTableWithGap(
            comp,
            tableData,
            actualGap,
            isFirstComponentInPage,
            availableHeightMm,
            currentPageHeight,
            pages,
            currentPage
          );
          currentPage = result.currentPage;
          // ✅ 对于紧跟表格的组件，使用表格实际底部位置作为参考
          // 这样可以确保无论表格是否跨页，后续组件与表格的相对间距保持一致
          currentPageHeight = result.lastTableFragmentBottom;
          isFirstComponentInPage = false;  // 表格后的组件不是页面第一个组件
        } else {
          // 空表格：按普通组件处理
          if (this.shouldBreakPage(currentPageHeight, compHeightMm, actualGap, availableHeightMm, isFirstComponentInPage) && currentPage.length > 0) {
            // 换页
            pages.push(currentPage);
            currentPage = [];
            currentPageHeight = marginTop;
            isFirstComponentInPage = true;
          }

          // 创建组件副本，避免修改原数据
          const compCopy = {
            ...comp,
            layout: { ...comp.layout }
          };

          if (isFirstComponentInPage) {
            // 新页面第一个组件：忽略 gap
            compCopy.layout.yMm = currentPageHeight;
            currentPageHeight += compHeightMm;
          } else {
            // 同一页：应用 gap
            currentPageHeight += actualGap;
            compCopy.layout.yMm = currentPageHeight;
            currentPageHeight += compHeightMm;
          }

          currentPage.push(compCopy);
          isFirstComponentInPage = false;
        }
      }
      // 4.2 普通组件：按相对间距累加高度
      else {
        // 使用辅助方法判断是否需要换页
        if (this.shouldBreakPage(currentPageHeight, compHeightMm, actualGap, availableHeightMm, isFirstComponentInPage) && currentPage.length > 0) {
          // 换页
          pages.push(currentPage);
          currentPage = [];
          currentPageHeight = marginTop;
          isFirstComponentInPage = true;
        }

        // 创建组件副本，避免修改原数据
        const compCopy = {
          ...comp,
          layout: { ...comp.layout }
        };

        if (isFirstComponentInPage) {
          // 新页面第一个组件：应用 gap（从页面顶部开始的相对间距）
          // 注意：即使在新页面，也应该保持设计时的相对间距
          currentPageHeight += actualGap;
          compCopy.layout.yMm = currentPageHeight;
          currentPageHeight += compHeightMm;
        } else {
          // 同一页：应用 gap
          currentPageHeight += actualGap;
          compCopy.layout.yMm = currentPageHeight;
          currentPageHeight += compHeightMm;
        }

        currentPage.push(compCopy);
        isFirstComponentInPage = false;
      }
    }

    // 5. 添加最后一页
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    // 6. 返回分页结果
    return pages.length > 0 ? pages : [components];
  }

  /**
   * 测量表格实际行高（渲染后测量方案）
   * 将表格渲染到隐藏容器，测量表头、数据行和合计行的实际高度
   */
  private async measureTableRowHeights(
    tableComponent: ComponentNode,
    tableData: any[]
  ): Promise<{ headerHeight: number; rowHeights: number[]; summaryHeight: number }> {
    // 检查是否在浏览器环境
    if (typeof document === 'undefined') {
      // 服务器端：使用估算值
      const baseRowHeight = this.calculateTableRowHeight(tableComponent);
      return {
        headerHeight: this.calculateTableHeaderHeight(tableComponent),
        rowHeights: tableData.map(() => baseRowHeight),
        summaryHeight: baseRowHeight
      };
    }

    const renderer = this.renderers.get('table');
    if (!renderer) {
      const baseRowHeight = this.calculateTableRowHeight(tableComponent);
      return {
        headerHeight: this.calculateTableHeaderHeight(tableComponent),
        rowHeights: tableData.map(() => baseRowHeight),
        summaryHeight: baseRowHeight
      };
    }

    // 计算与 TableRenderer 一致的表格宽度
    const context = this.createRenderContext();
    const xMm = tableComponent.layout.xMm || 0;
    let tableWidthMm: number;

    if (tableComponent.layout.widthMm) {
      tableWidthMm = tableComponent.layout.widthMm;
      if (context.pageInfo) {
        const availableWidth = context.pageInfo.widthMm - context.pageInfo.marginMm.left - context.pageInfo.marginMm.right;
        const totalOccupied = xMm + tableWidthMm;
        if (totalOccupied > availableWidth) {
          tableWidthMm = availableWidth - xMm;
        }
      }
    } else if (context.pageInfo) {
      const availableWidth = context.pageInfo.widthMm - context.pageInfo.marginMm.left - context.pageInfo.marginMm.right;
      tableWidthMm = availableWidth - xMm;
    } else {
      tableWidthMm = COMPONENT_DEFAULT_SIZE.TABLE_WIDTH;
    }

    // 创建隐藏测量容器
    const measureContainer = document.createElement('div');
    measureContainer.style.cssText = `
      position: absolute;
      visibility: hidden;
      left: -9999px;
      top: 0;
      width: ${tableWidthMm}mm;
      pointer-events: none;
    `;

    // 创建完整的表格组件用于测量（包含合计行）
    // 使用用户实际的 showHeader 和 bordered 设置，确保测量准确
    const measureComponent: ComponentNode = {
      ...tableComponent,
      props: {
        ...tableComponent.props,
        _pageData: tableData,
        _showHeader: tableComponent.props?.showHeader !== false, // 使用用户设置
        _isLastPage: true, // 测量时包含合计行
      }
    };

    // 渲染表格
    const tableHtml = renderer.render(measureComponent, context);

    measureContainer.innerHTML = `
      <div style="width: ${tableWidthMm}mm; position: relative;">
        ${tableHtml}
      </div>
    `;

    document.body.appendChild(measureContainer);

    try {
      // ✅ 测量表头高度（如果存在）
      let headerHeight = 0;
      const headerRow = measureContainer.querySelector('thead tr');
      if (headerRow) {
        headerHeight = (headerRow as HTMLElement).offsetHeight / this.mmToPx;
      }

      // 测量数据行高度
      const rows = measureContainer.querySelectorAll('tbody tr');
      const rowHeights: number[] = [];

      rows.forEach((row) => {
        const heightPx = (row as HTMLElement).offsetHeight;
        const heightMm = heightPx / this.mmToPx;
        rowHeights.push(heightMm);
      });

      // ✅ 测量合计行高度（如果存在）
      let summaryHeight = 0;
      const summaryRow = measureContainer.querySelector('tfoot tr');
      if (summaryRow) {
        summaryHeight = (summaryRow as HTMLElement).offsetHeight / this.mmToPx;
      }

      // 如果测量失败，使用估算值
      if (rowHeights.length === 0) {
        const baseRowHeight = this.calculateTableRowHeight(tableComponent);
        return {
          headerHeight: this.calculateTableHeaderHeight(tableComponent),
          rowHeights: tableData.map(() => baseRowHeight),
          summaryHeight: baseRowHeight
        };
      }

      return { headerHeight, rowHeights, summaryHeight };
    } finally {
      // 确保无论成功或失败，都清理测量容器
      if (measureContainer.parentNode) {
        document.body.removeChild(measureContainer);
      }
    }
  }

  /**
   * 表格跨页拆分（基于相对间距）
   * 支持 repeatHeader 配置、渲染后测量、空表格检查
   */
  private async splitTableWithGap(
    tableComponent: ComponentNode,
    tableData: any[],
    gap: number,
    isFirstComponentInPage: boolean,
    availableHeightMm: number,
    currentPageHeight: number,
    pages: ComponentNode[][],
    currentPage: ComponentNode[]
  ): Promise<{ currentPage: ComponentNode[]; currentPageHeight: number; isTableSplitAcrossPages: boolean; lastTableFragmentBottom: number }> {
    // 读取配置：是否重复表头（默认 true）
    const repeatHeader = tableComponent.props?.pagination?.repeatHeader !== false;
    const marginTop = this.template.page.marginMm?.top || 0;

    // 记录初始页面数，用于判断表格是否跨页
    const initialPagesLength = pages.length;

    // 空表格检查
    if (tableData.length === 0) {
      console.info('表格无数据，跳过渲染');
      return { currentPage, currentPageHeight, isTableSplitAcrossPages: false, lastTableFragmentBottom: currentPageHeight };
    }

    // ✅ 渲染后测量：获取表头、数据行和合计行的实际高度
    let { headerHeight, rowHeights, summaryHeight: measuredSummaryHeight } = await this.measureTableRowHeights(
      tableComponent,
      tableData
    );

    // 检查测量结果是否有效（防止所有列 hidden 等情况导致长度不一致）
    if (rowHeights.length !== tableData.length) {
      console.warn(
        `[PrintEngine] 表格测量结果异常：rowHeights.length (${rowHeights.length}) != tableData.length (${tableData.length})，` +
        `可能所有列均为 hidden，使用估算行高继续分页`
      );
      // 使用估算行高替换测量结果
      const fallbackRowHeight = this.calculateTableRowHeight(tableComponent);
      rowHeights = tableData.map(() => fallbackRowHeight);
    }

    let remainingData = [...tableData];
    let remainingRowHeights = [...rowHeights];
    let workingPage = [...currentPage];
    let workingPageHeight = currentPageHeight;
    let isFirstFragment = true;

    // 循环处理：直到所有数据都分配完
    while (remainingData.length > 0) {
      // 计算当前页剩余高度
      let remainingHeight = availableHeightMm - workingPageHeight;

      // 第一个片段需要考虑 gap
      if (isFirstFragment && !isFirstComponentInPage) {
        remainingHeight -= gap;
      }

      // 如果 repeatHeader = false 且是第一个片段，则表头已经在第一页了，后续页不需要表头
      const needHeader = isFirstFragment || repeatHeader;
      let availableForRows = remainingHeight - (needHeader ? headerHeight : 0);

      // ✅ 使用实际测量的行高计算能放多少行
      let rowsCanFit = 0;
      let accumulatedHeight = 0;
      for (let i = 0; i < remainingRowHeights.length; i++) {
        const rowHeight = remainingRowHeights[i];
        if (accumulatedHeight + rowHeight <= availableForRows) {
          accumulatedHeight += rowHeight;
          rowsCanFit++;
        } else {
          break;
        }
      }

      // 确保至少有 1 行数据（避免只有表头的空页面）
      if (rowsCanFit <= 0) {
        // 当前页放不下，换页
        if (workingPage.length > 0) {
          pages.push(workingPage);
          workingPage = [];
        }
        workingPageHeight = marginTop;
        isFirstFragment = false;
        continue;
      }

      // 取出当前页能放的数据
      const dataForThisPage = remainingData.slice(0, rowsCanFit);
      const rowHeightsForThisPage = remainingRowHeights.slice(0, rowsCanFit);
      remainingData = remainingData.slice(rowsCanFit);
      remainingRowHeights = remainingRowHeights.slice(rowsCanFit);

      // 判断是否为最后一页（用于合计行）
      const isLastPage = remainingData.length === 0;

      // 创建当前页的表格片段
      const tableFragmentYMm = isFirstFragment
        ? (isFirstComponentInPage ? workingPageHeight : workingPageHeight + gap)
        : marginTop;

      const tableFragment: ComponentNode = {
        ...tableComponent,
        layout: {
          ...tableComponent.layout,
          yMm: tableFragmentYMm
        },
        props: {
          ...tableComponent.props,
          _pageData: dataForThisPage,
          _showHeader: needHeader,
          _isLastPage: isLastPage,
          _totalData: tableData,
          _rowHeights: rowHeightsForThisPage // 传递实际行高到渲染器
        }
      };

      workingPage.push(tableFragment);

      // 计算合计行高度（如果启用合计功能）
      const showSummary = tableComponent.props?.showSummary === true;
      const summaryMode = tableComponent.props?.summaryMode || 'total';
      const shouldShowSummaryOnThisPage = showSummary && (
        summaryMode === 'page' ||
        (summaryMode === 'total' && isLastPage)
      );
      // ✅ 使用测量的合计行高度，如果没有测量值则使用平均行高
      const avgRowHeight = rowHeightsForThisPage.reduce((a, b) => a + b, 0) / rowHeightsForThisPage.length;
      const summaryHeight = shouldShowSummaryOnThisPage ? (measuredSummaryHeight || avgRowHeight) : 0;

      // 更新当前页高度（使用实际测量的行高累加）
      const tableFragmentHeight = (needHeader ? headerHeight : 0) + accumulatedHeight + summaryHeight;
      if (isFirstFragment && !isFirstComponentInPage) {
        workingPageHeight += gap + tableFragmentHeight;
      } else {
        workingPageHeight += tableFragmentHeight;
      }

      // 如果还有剩余数据，换页
      if (remainingData.length > 0) {
        pages.push(workingPage);
        workingPage = [];
        workingPageHeight = marginTop;
        isFirstFragment = false;
      }
    }

    // 判断表格是否跨页（即是否产生了多个页面片段）
    const isTableSplitAcrossPages = pages.length > initialPagesLength;

    return {
      currentPage: workingPage,
      currentPageHeight: workingPageHeight,
      isTableSplitAcrossPages,  // ✅ 返回表格是否跨页的信息
      lastTableFragmentBottom: workingPageHeight  // ✅ 返回最后一个表格片段的底部位置
    };
  }

  /**
   * 生成打印 HTML
   */
  async generatePrintHTML(): Promise<string> {
    const { page, components } = this.template;
    const { widthMm, heightMm } = this.getPageSize();

    // 页边距
    const marginTop = page.marginMm?.top || 0;
    const marginRight = page.marginMm?.right || 0;
    const marginBottom = page.marginMm?.bottom || 0;
    const marginLeft = page.marginMm?.left || 0;

    // 连续纸模式：不分页，单页渲染
    if (page.size === 'CONTINUOUS') {
      const pageContent = this.renderSinglePage(components);
      const styles = generatePrintPageStyles({
        pageWidthMm: widthMm,
        pageHeightMm: heightMm,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        isContinuous: true,
        minHeightMm: page.minHeightMm,
      });

      return generatePrintHTML({
        title: '打印预览',
        styles,
        bodyContent: `<div class="print-page">${pageContent}</div>`,
      });
    }

    // 标准页面模式：虚拟分页，生成多个独立的页面
    const pages = await this.calculatePages(components);
    const totalPages = pages.length;

    // 渲染每个页面
    const pagesHTML = pages.map((pageComponents: ComponentNode[], index: number) => {
      const pageNumber = index + 1;
      const pageContent = this.renderSinglePage(pageComponents, pageNumber, totalPages);
      return `<div class="print-page" data-page="${pageNumber}">${pageContent}</div>`;
    }).join('');

    const styles = generatePrintPageStyles({
      pageWidthMm: widthMm,
      pageHeightMm: heightMm,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
      isContinuous: false,
    });

    return generatePrintHTML({
      title: '打印预览',
      styles,
      bodyContent: pagesHTML,
    });
  }
}

/**
 * 工厂函数：创建打印引擎实例
 */
export function createPrintEngine(template: PrintTemplate, data: any) {
  const engine = new PrintEngine(template, data);

  return {
    /**
     * 生成完整打印 HTML
     */
    async generatePrintHTML() {
      return await engine.generatePrintHTML();
    },

    /**
     * 注册自定义渲染器
     */
    registerRenderer(renderer: ComponentRenderer) {
      engine.registerRenderer(renderer);
    },

    /**
     * 注销渲染器
     */
    unregisterRenderer(type: string) {
      engine.unregisterRenderer(type);
    },
  };
}
