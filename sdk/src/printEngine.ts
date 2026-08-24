/**
 * 打印引擎核心类（插件化重构版）
 * 负责：插件管理、数据绑定、Pipe 转换、虚拟分页计算
 */

import type { PrintTemplate, ComponentNode, DataBinding, PipeConfig, TableProps } from './types';
import type { ComponentRenderer, RenderContext } from './printEngine/types';
import type { PipeExecutor } from './pipes/types';
import type { AggregatorExecutor } from './aggregators/types';
import { MM_TO_PX, TABLE_DEFAULT, TABLE_STYLE_DEFAULT, COMPONENT_DEFAULT_SIZE } from './printEngine/constants';
import {
  generatePrintPageStyles,
  generatePrintHTML,
} from './printEngine/htmlTemplate';
import { executePipe as executeBuiltInPipe, getRegisteredTypes } from './pipes/registry';
import { executeAggregate as executeBuiltInAggregate, getRegisteredAggregatorTypes } from './aggregators/registry';
import { escapeHtml } from './utils/htmlEscape';
import { groupByField, hasGroupSummary } from './printEngine/utils/groupBy';

// 导入所有渲染器插件
import {
  TextRenderer,
  TableRenderer,
  ImageRenderer,
  RectRenderer,
  LineRenderer,
  QRCodeRenderer,
  BarcodeRenderer,
  resolveSummaryMode,
} from './printEngine/renderers';

// 导出类型和常量
export type { ComponentRenderer, RenderContext } from './printEngine/types';
export { MM_TO_PX, COMPONENT_DEFAULT_SIZE, TABLE_DEFAULT, STYLE_DEFAULT, TABLE_STYLE_DEFAULT, TABLE_DENSITY_PRESETS, BARCODE_CONFIG, QRCODE_CONFIG } from './printEngine/constants';

export class PrintEngine {
  private template: PrintTemplate;
  private data: any;
  private renderers: Map<string, ComponentRenderer>;
  private customPipesMap: Map<string, PipeExecutor>;
  private customAggregatorsMap: Map<string, AggregatorExecutor>;
  private escapeHtmlFlag: boolean;
  private readonly mmToPx = MM_TO_PX; // 使用常量：96 DPI 下 1mm = 3.78px

  constructor(template: PrintTemplate, data: any, customPipes?: PipeExecutor[], escapeHtml: boolean = true, customAggregators?: AggregatorExecutor[]) {
    this.template = template;
    this.data = data;
    this.renderers = new Map();
    this.customPipesMap = new Map();
    this.customAggregatorsMap = new Map();
    this.escapeHtmlFlag = escapeHtml;

    // 注册默认渲染器
    this.registerDefaultRenderers();

    // 注册自定义管道
    if (customPipes && customPipes.length > 0) {
      this.registerCustomPipes(customPipes);
    }
    // 注册自定义聚合器
    if (customAggregators && customAggregators.length > 0) {
      this.registerCustomAggregators(customAggregators);
    }
  }

  /**
   * 注册自定义管道执行器
   */
  private registerCustomPipes(pipes: PipeExecutor[]): void {
    const builtInTypes = getRegisteredTypes();
    for (const executor of pipes) {
      if (!executor || typeof executor !== 'object') {
        throw new Error('[PrintEngine] customPipes 数组中包含无效元素（null 或非对象）');
      }
      if (!executor.type) {
        throw new Error('[PrintEngine] customPipe.type 不能为空');
      }
      if (typeof executor.execute !== 'function') {
        throw new Error(`[PrintEngine] customPipe "${executor.type}" 的 execute 必须是函数`);
      }
      if (this.customPipesMap.has(executor.type)) {
        console.warn(
          `[PrintEngine] customPipes 中存在重复的 type "${executor.type}"，后者将覆盖前者`
        );
      } else if (builtInTypes.has(executor.type)) {
        console.warn(
          `[PrintEngine] 自定义 pipe "${executor.type}" 将覆盖内置同名管道`
        );
      }
      this.customPipesMap.set(executor.type, executor);
    }
  }

  /**
   * 注册自定义聚合器执行器
   */
  private registerCustomAggregators(aggregators: AggregatorExecutor[]): void {
    const builtInTypes = getRegisteredAggregatorTypes();
    for (const executor of aggregators) {
      if (!executor || typeof executor !== 'object') {
        throw new Error('[PrintEngine] customAggregators 数组中包含无效元素（null 或非对象）');
      }
      if (!executor.type) {
        throw new Error('[PrintEngine] customAggregator.type 不能为空');
      }
      if (typeof executor.aggregate !== 'function') {
        throw new Error(`[PrintEngine] customAggregator "${executor.type}" 的 aggregate 必须是函数`);
      }
      if (this.customAggregatorsMap.has(executor.type)) {
        console.warn(
          `[PrintEngine] customAggregators 中存在重复的 type "${executor.type}"，后者将覆盖前者`
        );
      } else if (builtInTypes.has(executor.type)) {
        console.warn(
          `[PrintEngine] 自定义聚合器 "${executor.type}" 将覆盖内置同名聚合器`
        );
      }
      this.customAggregatorsMap.set(executor.type, executor);
    }
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

    return value != null ? value : (fallback || '');
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
   * 优先使用自定义管道，找不到时回退到内置管道
   */
  private executePipe(value: any, pipe: PipeConfig): any {
    const customExecutor = this.customPipesMap.get(pipe.type);
    if (customExecutor) {
      try {
        return customExecutor.execute(value, pipe.options);
      } catch (err) {
        console.error(`[PrintEngine] 自定义 pipe "${pipe.type}" 执行失败:`, err);
        return value;
      }
    }
    // 回退到内置管道
    return executeBuiltInPipe(pipe.type, value, pipe.options);
  }

  /**
   * 执行聚合
   * 优先使用自定义聚合器，找不到时回退到内置聚合器
   */
  private executeAggregate(type: string, values: any[], options?: Record<string, any>): number | string | undefined {
    const customExecutor = this.customAggregatorsMap.get(type);
    if (customExecutor) {
      try {
        return customExecutor.aggregate(values, options);
      } catch (err) {
        console.error(`[PrintEngine] 自定义聚合器 "${type}" 执行失败:`, err);
        return undefined;
      }
    }
    return executeBuiltInAggregate(type, values, options);
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
      executePipe: this.executePipe.bind(this),
      executeAggregate: this.executeAggregate.bind(this),
      getValueByPath: this.getValueByPath.bind(this),
      formatDate: this.formatDate.bind(this),
      mmToPx: this.mmToPx,
      escapeHtml: this.escapeHtmlFlag,
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
    let html = renderer.render(component, context);

    // 页头/页脚组件统一注入 overflow: hidden，防止内容溢出区域边界
    if (component._section === 'header' || component._section === 'footer') {
      html = html.replace('style="', 'style="overflow: hidden; ');
    }

    return html;
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
   * @param currentHeight 当前页面累计高度（绝对坐标，含页头）
   * @param componentHeight 组件高度
   * @param gap 组件间距
   * @param availableHeight 可用高度（内容区高度，不含页头/页脚）
   * @param contentTop 内容区顶部绝对坐标（marginTop + headerHeight）
   */
  private shouldBreakPage(
    currentHeight: number,
    componentHeight: number,
    gap: number,
    availableHeight: number,
    contentTop: number
  ): boolean {
    // currentHeight 是绝对坐标（含页头），availableHeight 是不含页头/页脚的内容区高度
    // 需要将 availableHeight 加上 contentTop 统一到绝对坐标系
    const needHeight = gap + componentHeight;
    return currentHeight + needHeight > availableHeight + contentTop;
  }

  /**
   * 计算表头高度（mm）
   */
  private calculateTableHeaderHeight(comp: ComponentNode): number {
    // 如果用户设置 showHeader: false，则表头高度为 0
    if (comp.props?.showHeader === false) {
      return 0;
    }
    // 根据字体大小等比缩放表头高度（默认字体 12px 对应 8mm）
    const fontSize = comp.style?.fontSize || TABLE_STYLE_DEFAULT.FONT_SIZE;
    const scale = Math.max(1, fontSize / TABLE_STYLE_DEFAULT.FONT_SIZE);
    return TABLE_DEFAULT.HEADER_HEIGHT * scale;
  }

  /**
   * 计算表格行高度（mm）
   */
  private calculateTableRowHeight(comp: ComponentNode): number {
    // 根据字体大小等比缩放行高（默认字体 12px 对应 8mm）
    const fontSize = comp.style?.fontSize || TABLE_STYLE_DEFAULT.FONT_SIZE;
    const scale = Math.max(1, fontSize / TABLE_STYLE_DEFAULT.FONT_SIZE);
    return TABLE_DEFAULT.MIN_ROW_HEIGHT * TABLE_DEFAULT.ROW_HEIGHT_FACTOR * scale;
  }

  /**
   * 计算合计行相关指标（显示模式、额外行数、估算高度）
   * 统一收口 measureTableRowHeights 中的重复逻辑
   */
  private getSummaryMetrics(props: TableProps, baseRowHeight: number) {
    const summaryDisplayMode = resolveSummaryMode(props);
    const extraRowsCount = summaryDisplayMode !== 'none' ? (props.summaryExtraRows?.length || 0) : 0;
    const summaryRowHeight = (summaryDisplayMode !== 'none' && summaryDisplayMode !== 'extra-only') ? baseRowHeight : 0;
    return { summaryDisplayMode, extraRowsCount, summaryRowHeight };
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

    /** 估算页码文本宽度（mm），用于居中/右对齐定位 */
    const estimatePageNumberWidth = (text: string, fs: number): number => {
      return text.length * fs * 0.5 * (25.4 / 96);
    };

    // 根据 position 计算 x, y 坐标
    let xMm = 0;
    let yMm = 0;
    const estimatedWidth = estimatePageNumberWidth(pageText, fontSize);
    const pageNumberHeight = 6;

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
        xMm = (widthMm - estimatedWidth) / 2;
        yMm = marginTop;
        break;
      case 'top-right':
        xMm = widthMm - marginRight - estimatedWidth;
        yMm = marginTop;
        break;
      case 'bottom-left':
        xMm = marginLeft;
        yMm = heightMm - marginBottom - pageNumberHeight;
        break;
      case 'bottom-center':
        xMm = (widthMm - estimatedWidth) / 2;
        yMm = heightMm - marginBottom - pageNumberHeight;
        break;
      case 'custom':
        xMm = pageNumberConfig.customX ?? 0;
        yMm = pageNumberConfig.customY ?? 0;
        break;
      case 'bottom-right':
      default:
        xMm = widthMm - marginRight - estimatedWidth;
        yMm = heightMm - marginBottom - pageNumberHeight;
        break;
    }

    // 应用偏移（仅预设模式）
    if (position !== 'custom') {
      xMm += offsetX;
      yMm += offsetY;
    }

    // 转换为 px
    const xPx = xMm * this.mmToPx;
    const yPx = yMm * this.mmToPx;
    const heightPx = pageNumberHeight * this.mmToPx;

    // 生成 HTML
    const alignStyle = position.includes('left') ? 'left' : position.includes('right') ? 'right' : 'center';
    const justifyContent = alignStyle === 'left' ? 'flex-start' : alignStyle === 'right' ? 'flex-end' : 'center';

    return `<div style="position: absolute; left: ${xPx}px; top: ${yPx}px; white-space: nowrap; height: ${heightPx}px; font-size: ${fontSize}px; color: ${color}; font-weight: ${fontWeight}; display: flex; align-items: center; justify-content: ${justifyContent};">${escapeHtml(pageText, this.escapeHtmlFlag)}</div>`;
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
   * 计算组件列表的最大底部坐标（yMm + heightMm），用于推算页头/页脚实际占用高度。
   * 空列表返回 0。
   * 注意：返回值是"最大底部位置"而非"最大高度"，命名保留为 measureMaxHeight 以兼容。
   */
  private measureMaxBottom(comps: ComponentNode[]): number {
    if (comps.length === 0) return 0;
    return Math.max(...comps.map(c => (c.layout.yMm || 0) + (c.layout.heightMm || 0)));
  }

  /**
   * 虚拟分页：基于相对间距的流式布局
   * 核心逻辑：
   * 1. 计算每个组件与上一个组件的间距 (gap)
   * 2. 按顺序累加高度，遇到表格就拆分
   * 3. 换页时从 marginTop 开始，忽略原 gap
   */
  private async calculatePages(
    components: ComponentNode[],
    headerComponents: ComponentNode[] = [],
    footerComponents: ComponentNode[] = []
  ): Promise<ComponentNode[][]> {
    const { page } = this.template;
    const { heightMm } = this.getPageSize();

    // 连续纸模式不分页
    if (page.size === 'CONTINUOUS' || heightMm === Infinity) {
      return [components];
    }

    const marginTop = page.marginMm?.top || 0;
    const marginBottom = page.marginMm?.bottom || 0;

    // 计算页头/页脚有效高度
    const headerEnabled = page.headerEnabled ?? false;
    const footerEnabled = page.footerEnabled ?? false;
    const headerHeight = headerEnabled
      ? Math.max(page.headerHeight || 0, this.measureMaxBottom(headerComponents))
      : 0;
    const footerHeight = footerEnabled
      ? Math.max(page.footerHeight || 0, this.measureMaxBottom(footerComponents))
      : 0;

    const contentTop = marginTop + headerHeight;
    const availableHeightMm = heightMm - marginTop - marginBottom - headerHeight - footerHeight;

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
    let currentPageHeight = contentTop;  // 当前页的累计高度（含页头）
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
          if (this.shouldBreakPage(currentPageHeight, compHeightMm, actualGap, availableHeightMm, contentTop) && currentPage.length > 0) {
            // 换页
            pages.push(currentPage);
            currentPage = [];
            currentPageHeight = contentTop;
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
        if (this.shouldBreakPage(currentPageHeight, compHeightMm, actualGap, availableHeightMm, contentTop) && currentPage.length > 0) {
          // 换页
          pages.push(currentPage);
          currentPage = [];
          currentPageHeight = contentTop;
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

    // 6. 为每页添加页头/页脚组件
    const finalPages = (pages.length > 0 ? pages : [components]).map((pageComps) => {
      const result: ComponentNode[] = [];

      if (headerEnabled && headerComponents.length > 0) {
        for (const h of headerComponents) {
          result.push({
            ...h,
            layout: { ...h.layout, yMm: (h.layout.yMm || 0) + marginTop },
            _section: 'header' as const,
          });
        }
      }

      for (const c of pageComps) {
        result.push(c);
      }

      if (footerEnabled && footerComponents.length > 0) {
        for (const f of footerComponents) {
          result.push({
            ...f,
            layout: { ...f.layout, yMm: (f.layout.yMm || 0) + heightMm - footerHeight - marginBottom },
            _section: 'footer' as const,
          });
        }
      }

      return result;
    });

    return finalPages;
  }

  /**
   * 测量表格实际行高（渲染后测量方案）
   * 将表格渲染到隐藏容器，测量表头、数据行和合计行的实际高度
   */
  private async measureTableRowHeights(
    tableComponent: ComponentNode,
    tableData: any[]
  ): Promise<{ headerHeight: number; rowHeights: number[]; summaryHeight: number; groupHeaderHeight?: number; groupSummaryHeight?: number }> {
    // 检查是否在浏览器环境
    if (typeof document === 'undefined') {
      // 服务器端：使用估算值（包含额外行）
      const baseRowHeight = this.calculateTableRowHeight(tableComponent);
      const { summaryRowHeight, extraRowsCount } = this.getSummaryMetrics(
        (tableComponent.props || {}) as TableProps, baseRowHeight
      );
      return {
        headerHeight: this.calculateTableHeaderHeight(tableComponent),
        rowHeights: tableData.map(() => baseRowHeight),
        summaryHeight: summaryRowHeight + extraRowsCount * baseRowHeight
      };
    }

    const renderer = this.renderers.get('table');
    if (!renderer) {
      const baseRowHeight = this.calculateTableRowHeight(tableComponent);
      const { summaryRowHeight, extraRowsCount } = this.getSummaryMetrics(
        (tableComponent.props || {}) as TableProps, baseRowHeight
      );
      return {
        headerHeight: this.calculateTableHeaderHeight(tableComponent),
        rowHeights: tableData.map(() => baseRowHeight),
        summaryHeight: summaryRowHeight + extraRowsCount * baseRowHeight
      };
    }

    // 计算与 TableRenderer 一致的表格宽度
    const context = this.createRenderContext();
    const xMm = tableComponent.layout.xMm || 0;
    let tableWidthMm: number;

    if (tableComponent.layout.widthMm) {
      tableWidthMm = tableComponent.layout.widthMm;
      if (context.pageInfo) {
        const maxRightEdge = context.pageInfo.widthMm - context.pageInfo.marginMm.right;
        const tableRightEdge = xMm + tableWidthMm;
        if (tableRightEdge > maxRightEdge) {
          tableWidthMm = maxRightEdge - xMm;
        }
      }
    } else if (context.pageInfo) {
      const maxRightEdge = context.pageInfo.widthMm - context.pageInfo.marginMm.right;
      tableWidthMm = maxRightEdge - xMm;
    } else {
      tableWidthMm = COMPONENT_DEFAULT_SIZE.TABLE_WIDTH;
    }

    // 创建隐藏测量容器（使用与打印输出一致的字体和基础样式，确保测量准确）
    const measureContainer = document.createElement('div');
    measureContainer.style.cssText = `
      position: absolute;
      visibility: hidden;
      left: -9999px;
      top: 0;
      width: ${tableWidthMm}mm;
      pointer-events: none;
      font-family: Arial, sans-serif;
      box-sizing: border-box;
    `;

    // 创建完整的表格组件用于测量（包含合计行）
    const measureComponent: ComponentNode = {
      ...tableComponent,
      props: {
        ...tableComponent.props,
        _pageData: tableData,
        _showHeader: tableComponent.props?.showHeader !== false,
        _isLastPage: true,
      }
    };

    // 渲染表格
    const tableHtml = renderer.render(measureComponent, context);

    measureContainer.innerHTML = `
      <div style="width: ${tableWidthMm}mm; position: relative; font-family: Arial, sans-serif; box-sizing: border-box;">
        ${tableHtml}
      </div>
    `;

    document.body.appendChild(measureContainer);

    try {
      // 测量表头高度（如果存在）
      let headerHeight = 0;
      const headerRow = measureContainer.querySelector('thead tr');
      if (headerRow) {
        headerHeight = (headerRow as HTMLElement).offsetHeight / this.mmToPx;
      }

      // 测量数据行高度
      // 分组表格的 tbody 中混有 .group-header / .group-summary 插入行，需排除，
      // 否则 rowHeights 长度与 tableData 不匹配会触发全量回退估算，导致分页留白/重叠
      const rows = Array.from(measureContainer.querySelectorAll('tbody tr'))
        .filter((r) => !r.classList.contains('group-header') && !r.classList.contains('group-summary'));
      const rowHeights: number[] = [];

      rows.forEach((row) => {
        const heightPx = (row as HTMLElement).offsetHeight;
        const heightMm = heightPx / this.mmToPx;
        rowHeights.push(heightMm);
      });

      // 分别测量分组标题行与分组小计行的实际高度（两者内容/样式可能不同，分开取避免混用导致分页估算偏差）
      let groupHeaderHeight = 0;
      let groupSummaryHeight = 0;
      const groupHeaderRow = measureContainer.querySelector('tbody tr.group-header') as HTMLElement | null;
      const groupSummaryRow = measureContainer.querySelector('tbody tr.group-summary') as HTMLElement | null;
      if (groupHeaderRow) {
        groupHeaderHeight = groupHeaderRow.offsetHeight / this.mmToPx;
      }
      if (groupSummaryRow) {
        groupSummaryHeight = groupSummaryRow.offsetHeight / this.mmToPx;
      }

      // 测量合计行高度（包括额外行）
      let summaryHeight = 0;
      const summaryRows = measureContainer.querySelectorAll('tfoot tr');
      summaryRows.forEach((row) => {
        summaryHeight += (row as HTMLElement).offsetHeight / this.mmToPx;
      });

      // 如果测量失败，使用估算值（包含额外行）
      if (rowHeights.length === 0) {
        const baseRowHeight = this.calculateTableRowHeight(tableComponent);
        const { summaryRowHeight, extraRowsCount } = this.getSummaryMetrics(
          (tableComponent.props || {}) as TableProps, baseRowHeight
        );
        return {
          headerHeight: this.calculateTableHeaderHeight(tableComponent),
          rowHeights: tableData.map(() => baseRowHeight),
          summaryHeight: summaryRowHeight + extraRowsCount * baseRowHeight,
          groupHeaderHeight: 0,
          groupSummaryHeight: 0,
        };
      }

      return { headerHeight, rowHeights, summaryHeight, groupHeaderHeight, groupSummaryHeight };
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
    const repeatHeader = tableComponent.props?.repeatHeader !== false;
    // 读取配置：是否显示表头（默认 true），用于 needHeader 公式
    const showHeader = tableComponent.props?.showHeader !== false;
    const marginTop = this.template.page.marginMm?.top || 0;
    const marginBottom = this.template.page.marginMm?.bottom || 0;
    const { heightMm } = this.getPageSize();

    // 计算页头/页脚高度（页面级别）
    const headerEnabled = this.template.page.headerEnabled ?? false;
    const footerEnabled = this.template.page.footerEnabled ?? false;
    const pageHeaderHeight = headerEnabled
      ? Math.max(this.template.page.headerHeight || 0, this.measureMaxBottom(this.template.headerComponents || []))
      : 0;
    const pageFooterHeight = footerEnabled
      ? Math.max(this.template.page.footerHeight || 0, this.measureMaxBottom(this.template.footerComponents || []))
      : 0;
    const contentTop = marginTop + pageHeaderHeight;
    const contentBottom = heightMm - marginBottom - pageFooterHeight;

    // 记录初始页面数，用于判断表格是否跨页
    const initialPagesLength = pages.length;

    // 空表格检查
    if (tableData.length === 0) {
      console.info('表格无数据，跳过渲染');
      return { currentPage, currentPageHeight, isTableSplitAcrossPages: false, lastTableFragmentBottom: currentPageHeight };
    }

    // ── 分组表格分页（keepTogether 优先） ──
    const groupBy = (tableComponent.props as any)?.groupBy;
    if (groupBy?.field) {
      return this.splitGroupedTableWithGap(
        tableComponent,
        tableData,
        gap,
        isFirstComponentInPage,
        availableHeightMm,
        currentPageHeight,
        pages,
        currentPage,
        repeatHeader,
        showHeader,
        contentTop,
        contentBottom
      );
    }

    // ✅ 渲染后测量：获取表头、数据行和合计行的实际高度
    let { headerHeight: measuredHeaderHeight, rowHeights, summaryHeight: measuredSummaryHeight } = await this.measureTableRowHeights(
      tableComponent,
      tableData
    );

    // 检查测量结果是否有效（长度不匹配时回退到估算值）
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
    let consumedRowCount = 0;
    let remainingRowHeights = [...rowHeights];
    let workingPage = [...currentPage];
    let workingPageHeight = currentPageHeight;
    let isFirstFragment = true;

    // 循环处理：直到所有数据都分配完
    while (remainingData.length > 0) {
      // 计算当前页剩余高度（contentBottom 到 workingPageHeight 之间的距离）
      let remainingHeight = contentBottom - workingPageHeight;

      // 第一个片段需要考虑 gap
      if (isFirstFragment && !isFirstComponentInPage) {
        remainingHeight -= gap;
      }

      // 表头显示矩阵：
      // - showHeader=false：所有页都不显示表头
      // - showHeader=true, repeatHeader=true：所有页都显示
      // - showHeader=true, repeatHeader=false：仅第一页显示
      const needHeader = showHeader && (isFirstFragment || repeatHeader);

      // ✅ 只在 page 模式下预先预留合计行高度
      // total 模式只有最后一页显示合计行，不需要在中间页预留
      const summaryMode = tableComponent.props?.summaryMode || 'total';
      const summaryDisplayMode = resolveSummaryMode((tableComponent.props || {}) as TableProps);
      // 任何非 'none' 模式都需要预留 tfoot 高度（extra-only 的额外行高度在 measuredSummaryHeight 中已计入）
      const shouldReserveSummaryRow = summaryDisplayMode !== 'none';
      const reserveSummaryHeight = (shouldReserveSummaryRow && summaryMode === 'page')
        ? (measuredSummaryHeight || this.calculateTableRowHeight(tableComponent))
        : 0;

      // ⚠️ 减去 1mm 安全边距，防止因浮点精度或行高累加导致末行溢出页底
      let availableForRows = remainingHeight - (needHeader ? measuredHeaderHeight : 0) - reserveSummaryHeight - 1;

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

      // 防御性检查：如果 rowsCanFit 异常小，标记为触发状态
      let defensiveCheckTriggered = false;
      let estimatedRowHeight = 0;
      if (rowsCanFit < Math.max(remainingRowHeights.length * 0.1, 2) && rowsCanFit < 5) {
        console.warn(
          `[splitTableWithGap] rowsCanFit(${rowsCanFit}) 异常小，` +
          `availableForRows=${availableForRows.toFixed(2)}mm，使用估算值重新计算`
        );
        estimatedRowHeight = this.calculateTableRowHeight(tableComponent);
        rowsCanFit = Math.min(remainingRowHeights.length, Math.floor(availableForRows / estimatedRowHeight));
        accumulatedHeight = rowsCanFit * estimatedRowHeight;
        defensiveCheckTriggered = true;
      }

      // 确保至少有 1 行数据（避免只有表头的空页面）
      if (rowsCanFit <= 0) {
        // 当前页放不下，换页
        if (workingPage.length > 0) {
          pages.push(workingPage);
          workingPage = [];
        }
        workingPageHeight = contentTop;
        isFirstFragment = false;
        continue;
      }

      // 取出当前页能放的数据
      let dataForThisPage = remainingData.slice(0, rowsCanFit);
      let rowHeightsForThisPage = remainingRowHeights.slice(0, rowsCanFit);
      // ✅ 防御检查触发时，仅替换当前页的 rowHeightsForThisPage，保留 remainingRowHeights 供后续页使用
      if (defensiveCheckTriggered) {
        rowHeightsForThisPage = rowHeightsForThisPage.map(() => estimatedRowHeight);
      }
      remainingData = remainingData.slice(rowsCanFit);
      remainingRowHeights = remainingRowHeights.slice(rowsCanFit);

      // 判断是否为最后一页（用于合计行）
      let isLastPage = remainingData.length === 0;

      // ✅ total 模式最后一页检查：如果加上合计行/额外行会溢出，减少一行数据
      const willRenderAnyTfoot = summaryDisplayMode !== 'none';
      if (willRenderAnyTfoot && summaryMode === 'total' && isLastPage && rowsCanFit > 0) {
        const extraRowCount = tableComponent.props?.summaryExtraRows?.length || 0;
        const fallbackHeight = summaryDisplayMode === 'extra-only' && extraRowCount > 0
          ? extraRowCount * this.calculateTableRowHeight(tableComponent)
          : this.calculateTableRowHeight(tableComponent);
        const summaryHeight = measuredSummaryHeight || fallbackHeight;
        const usedHeight = (needHeader ? measuredHeaderHeight : 0) + accumulatedHeight + summaryHeight;
        if (usedHeight > remainingHeight) {
          // 减少最后一行，为合计行腾出空间
          rowsCanFit--;
          const removedRow = dataForThisPage.pop()!;
          const removedHeight = rowHeightsForThisPage.pop()!;
          remainingData.unshift(removedRow);
          remainingRowHeights.unshift(removedHeight);
          accumulatedHeight -= removedHeight;
          isLastPage = remainingData.length === 0; // 重新判断
        }
      }

      // ✅ 回退后检查：如果 rowsCanFit 变成 0，强制放 1 行避免死循环
      if (rowsCanFit === 0) {
        if (workingPage.length > 0) {
          pages.push(workingPage);
          workingPage = [];
        }
        workingPageHeight = contentTop;
        isFirstFragment = false;
        // 强制至少放 1 行数据，避免死循环（会溢出，但比无限循环好）
        if (remainingData.length > 0) {
          rowsCanFit = 1;
          dataForThisPage = remainingData.slice(0, 1);
          rowHeightsForThisPage = remainingRowHeights.slice(0, 1);
          remainingData = remainingData.slice(1);
          remainingRowHeights = remainingRowHeights.slice(1);
          isLastPage = remainingData.length === 0;
          accumulatedHeight = rowHeightsForThisPage[0] || this.calculateTableRowHeight(tableComponent);
        } else {
          continue;
        }
      }

      // 创建当前页的表格片段
      const tableFragmentYMm = isFirstFragment
        ? (isFirstComponentInPage ? workingPageHeight : workingPageHeight + gap)
        : contentTop;

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
          _startRowIndex: consumedRowCount
        }
      };

      workingPage.push(tableFragment);
      consumedRowCount += rowsCanFit;

      // 计算合计行高度（如果启用合计功能）
      // ✅ 分别追踪合计行和额外行：两者显隐均遵循 summaryMode（page=每页 / total=仅末页）
      // summaryDisplay='extra-only' 仅隐藏主合计行，不改变额外行的分页行为
      const willRenderSummaryRow = summaryDisplayMode !== 'none' && summaryDisplayMode !== 'extra-only' && (
        summaryMode === 'page' || (summaryMode === 'total' && isLastPage)
      );
      const extraRowsCount = (tableComponent.props?.summaryExtraRows?.length || 0);
      const willRenderExtraRows = summaryDisplayMode !== 'none' && extraRowsCount > 0 && (
        summaryMode === 'page' || (summaryMode === 'total' && isLastPage)
      );
      // ✅ 使用测量的合计行高度，如果没有测量值则使用平均行高
      const avgRowHeight = rowHeightsForThisPage.length > 0
        ? rowHeightsForThisPage.reduce((a, b) => a + b, 0) / rowHeightsForThisPage.length
        : this.calculateTableRowHeight(tableComponent);
      let summaryHeight = 0;
      if (willRenderSummaryRow && willRenderExtraRows) {
        summaryHeight = measuredSummaryHeight || avgRowHeight * (1 + extraRowsCount);
      } else if (willRenderSummaryRow) {
        summaryHeight = measuredSummaryHeight || avgRowHeight;
      } else if (willRenderExtraRows) {
        summaryHeight = measuredSummaryHeight || extraRowsCount * avgRowHeight;
      }

      // 更新当前页高度（使用实际测量的行高累加）
      const tableFragmentHeight = (needHeader ? measuredHeaderHeight : 0) + accumulatedHeight + summaryHeight;
      if (isFirstFragment && !isFirstComponentInPage) {
        workingPageHeight += gap + tableFragmentHeight;
      } else {
        workingPageHeight += tableFragmentHeight;
      }

      // 如果还有剩余数据，换页
      if (remainingData.length > 0) {
        pages.push(workingPage);
        workingPage = [];
        workingPageHeight = contentTop;
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
   * 分组表格跨页拆分（keepTogether 优先，超大组内按行拆分）
   */
  private async splitGroupedTableWithGap(
    tableComponent: ComponentNode,
    tableData: any[],
    gap: number,
    isFirstComponentInPage: boolean,
    availableHeightMm: number,
    currentPageHeight: number,
    pages: ComponentNode[][],
    currentPage: ComponentNode[],
    repeatHeader: boolean,
    showHeader: boolean,
    contentTop: number,
    contentBottom: number
  ): Promise<{ currentPage: ComponentNode[]; currentPageHeight: number; isTableSplitAcrossPages: boolean; lastTableFragmentBottom: number }> {
    const initialPagesLength = pages.length;
    const groupBy = (tableComponent.props as any).groupBy;
    const emptyLabel = groupBy.emptyGroupLabel || '未分组';
    const showGroupHeader = groupBy.showHeader !== false;
    // 复用与渲染端一致的判断：是否有可渲染的分组小计行（考虑 summaryItems/自动推断）
    const needSummary = hasGroupSummary(groupBy);

    const { headerHeight: measuredHeaderHeight, rowHeights, summaryHeight: measuredSummaryHeight, groupHeaderHeight: measuredGroupHeaderHeight, groupSummaryHeight: measuredGroupSummaryHeight } = await this.measureTableRowHeights(tableComponent, tableData);
    const fallbackRowHeight = this.calculateTableRowHeight(tableComponent);
    // 分组表格下测量结果已排除插入行，长度应与数据行一致；不一致时回退估算
    const effectiveRowHeights = rowHeights.length === tableData.length ? rowHeights : tableData.map(() => fallbackRowHeight);
    const headerH = showHeader ? measuredHeaderHeight : 0;
    // 组标题/小计行使用实际测量高度（compact 等密度下明显小于估算值，避免分页高估造成大面积留白）
    const groupHeaderH = showGroupHeader ? (measuredGroupHeaderHeight || fallbackRowHeight) : 0;
    const groupSummaryH = needSummary ? (measuredGroupSummaryHeight || fallbackRowHeight) : 0;

    /** 行高数组求和 */
    const sumHeights = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
    /** 组块高度 = 组标题 + 组内真实行高之和 + 组小计 */
    const groupBlockH = (g: { heights: number[] }) =>
      (showGroupHeader ? groupHeaderH : 0) + sumHeights(g.heights) + (needSummary ? groupSummaryH : 0);

    // 预分组：携带每组的真实测量行高（按 startRowIndex 从全量测量结果切片）
    // 使用真实行高而非均值，避免长文本换行导致估算偏小、后续组件与表格重叠
    let groups = groupByField(tableData, groupBy.field, emptyLabel);
    interface RemainingGroup { key: string; items: any[]; startRowIndex: number; heights: number[] }
    let remainingGroups: RemainingGroup[] = groups.map(g => ({
      ...g,
      heights: effectiveRowHeights.slice(g.startRowIndex, g.startRowIndex + g.items.length),
    }));
    let consumedRowCount = 0;
    let workingPage = [...currentPage];
    let workingPageHeight = currentPageHeight;
    let isFirstFragment = true;

    // 将 groups 按行高展开为便于分页的片段（超大组会被拆，中间块不带小计）
    while (remainingGroups.length > 0) {
      let remainingHeight = contentBottom - workingPageHeight;
      if (isFirstFragment && !isFirstComponentInPage) remainingHeight -= gap;
      const needHeader = showHeader && (isFirstFragment || repeatHeader);
      const summaryMode = tableComponent.props?.summaryMode || 'total';
      const summaryDisplayMode = resolveSummaryMode((tableComponent.props || {}) as TableProps);
      const shouldReserveSummaryRow = summaryDisplayMode !== 'none';
      // page 模式每页都渲染表尾合计，需每页预留；total 模式仅最后一页渲染，
      // 不预判预留，改为放满后若为最后一页再检查表尾合计是否溢出并回退（与非分组表格语义一致）
      const reserveSummaryHeight = (shouldReserveSummaryRow && summaryMode === 'page') ? (measuredSummaryHeight || fallbackRowHeight) : 0;
      let availableForRows = remainingHeight - (needHeader ? headerH : 0) - reserveSummaryHeight - 1;

      // 本页要放的组块：整组优先，放不下时拆组填充剩余空间（中间块不带小计）
      interface PageBlock { key: string; items: any[]; heights: number[]; isEnd: boolean; }
      const pageBlocks: PageBlock[] = [];
      let used = 0;
      let consumedWholeGroups = 0;
      let splitRemainder: RemainingGroup | null = null;

      for (let i = 0; i < remainingGroups.length; i++) {
        const g = remainingGroups[i];
        const blockH = groupBlockH(g);
        if (used + blockH <= availableForRows) {
          // 整组放入
          pageBlocks.push({ key: g.key, items: g.items, heights: g.heights, isEnd: true });
          used += blockH;
          consumedWholeGroups++;
        } else {
          // 整组放不下：拆组填充剩余空间（本页为中间块，不带小计）
          const headerSpace = showGroupHeader ? groupHeaderH : 0;
          const availForRows = availableForRows - used - headerSpace;
          let rowsCanFit = 0;
          let rowsAcc = 0;
          for (const h of g.heights) {
            if (rowsAcc + h <= availForRows) {
              rowsAcc += h;
              rowsCanFit++;
            } else {
              break;
            }
          }
          // 组内行都能放进本页但小计放不下时，退一行，让最后一行 + 小计去下一页
          if (rowsCanFit >= g.items.length && g.items.length > 1) {
            rowsCanFit = g.items.length - 1;
          }
          // 连组头+首行都放不下：本页已有内容则整组移到下一页（避免强制塞入导致超出页面），
          // 仅在本页为空（超大组占满整页）时才至少放一行，避免死循环
          if (rowsCanFit <= 0) {
            if (pageBlocks.length > 0) {
              break;
            }
            rowsCanFit = 1;
          }
          rowsCanFit = Math.min(rowsCanFit, g.items.length);
          rowsAcc = sumHeights(g.heights.slice(0, rowsCanFit));

          const rest = g.items.slice(rowsCanFit);
          // 剩余为空（如单行组放完所有行但小计放不下）时，本块即组尾，小计跟随本页渲染
          const isEnd = rest.length === 0;
          pageBlocks.push({ key: g.key, items: g.items.slice(0, rowsCanFit), heights: g.heights.slice(0, rowsCanFit), isEnd });
          used += headerSpace + rowsAcc + (isEnd && needSummary ? groupSummaryH : 0);

          if (rest.length > 0) {
            splitRemainder = { ...g, items: rest, heights: g.heights.slice(rowsCanFit) };
          }
          break;
        }
      }

      // 组装本页数据与本页应渲染小计的组 key
      const rebuildPageData = () => {
        dataForThisPage = [];
        groupSummaryKeys.length = 0;
        for (const b of pageBlocks) {
          dataForThisPage.push(...b.items);
          if (b.isEnd && needSummary) groupSummaryKeys.push(b.key);
        }
      };
      let dataForThisPage: any[] = [];
      const groupSummaryKeys: string[] = [];
      rebuildPageData();

      // 更新 remainingGroups：整组消费数 + 拆组剩余
      if (splitRemainder) {
        remainingGroups = [splitRemainder, ...remainingGroups.slice(consumedWholeGroups + 1)];
      } else {
        remainingGroups = remainingGroups.slice(consumedWholeGroups);
      }

      let isLastPage = remainingGroups.length === 0;

      // total 模式最后一页：表尾合计若溢出，回退最后一块的最后一行到下一页
      // （不预判预留，放满后按真实溢出情况回退，避免预留导致可用高度无谓变小）
      if (isLastPage && shouldReserveSummaryRow && summaryMode === 'total') {
        const tfootH = measuredSummaryHeight || fallbackRowHeight;
        // 表头 + 组块 + 表尾合计是否超出本页可容纳高度
        if ((needHeader ? headerH : 0) + used + tfootH > remainingHeight && pageBlocks.length > 0) {
          const last = pageBlocks[pageBlocks.length - 1];
          const item = last.items.pop()!;
          const h = last.heights.pop() ?? fallbackRowHeight;
          used -= h;
          if (last.items.length === 0) {
            // 整块被清空：减去组标题/小计高度
            pageBlocks.pop();
            if (showGroupHeader) used -= groupHeaderH;
            if (last.isEnd && needSummary) used -= groupSummaryH;
          } else if (last.isEnd && needSummary) {
            // 块仍有剩余行但不再是组尾：减去小计高度
            last.isEnd = false;
            used -= groupSummaryH;
          }
          // 被回退的这一行作为剩余组，去下一页（保留原 key，重新渲染标题+小计）
          remainingGroups.unshift({ key: last.key, items: [item], heights: [h], startRowIndex: 0 });
          isLastPage = false;
          if (pageBlocks.length === 0) {
            console.warn(
              '[PrintEngine] 分组表格 total 模式：页面内容区高度过小，表头 + 组标题 + 单行 + 组小计 + 表尾合计仍无法放入一页，' +
              '存在分页死循环风险。建议增大页面高度（连续纸 minHeightMm）或减小字号/行高。'
            );
          }
          rebuildPageData();
        }
      }

      const accumulated = used;

      const tableFragmentYMm = isFirstFragment
        ? (isFirstComponentInPage ? workingPageHeight : workingPageHeight + gap)
        : contentTop;
      const tableFragment: ComponentNode = {
        ...tableComponent,
        layout: { ...tableComponent.layout, yMm: tableFragmentYMm },
        props: {
          ...tableComponent.props,
          _pageData: dataForThisPage,
          _showHeader: needHeader,
          _isLastPage: isLastPage,
          _totalData: tableData,
          _startRowIndex: consumedRowCount,
          _groupSummaryKeys: groupSummaryKeys
        }
      };
      workingPage.push(tableFragment);
      consumedRowCount += dataForThisPage.length;
      const fragmentH = (needHeader ? headerH : 0) + accumulated;
      // 累加高度（包含 header 与组块）
      if (isFirstFragment && !isFirstComponentInPage) workingPageHeight += gap + fragmentH;
      else workingPageHeight += fragmentH;

      if (remainingGroups.length > 0) {
        pages.push(workingPage);
        workingPage = [];
        workingPageHeight = contentTop;
        isFirstFragment = false;
      }
    }

    const isTableSplitAcrossPages = pages.length > initialPagesLength;
    return { currentPage: workingPage, currentPageHeight: workingPageHeight, isTableSplitAcrossPages, lastTableFragmentBottom: workingPageHeight };
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
    const pages = await this.calculatePages(
      components,
      this.template.headerComponents || [],
      this.template.footerComponents || []
    );
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
export function createPrintEngine(template: PrintTemplate, data: any, customPipes?: PipeExecutor[], escapeHtml: boolean = true, customAggregators?: AggregatorExecutor[]) {
  const engine = new PrintEngine(template, data, customPipes, escapeHtml, customAggregators);

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
