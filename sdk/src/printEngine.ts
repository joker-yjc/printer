/**
 * 打印引擎核心类（插件化重构版）
 * 负责：插件管理、数据绑定、Pipe 转换、虚拟分页计算
 */

import type { PrintTemplate, ComponentNode, DataBinding, PipeConfig } from './types';
import type { ComponentRenderer, RenderContext } from './printEngine/types';
import { MM_TO_PX, TABLE_DEFAULT } from './printEngine/constants';
import {
  generatePrintPageStyles,
  generatePrintHTML,
  getPageSizeFromConfig,
} from './printEngine/htmlTemplate';

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
    const { executePipe } = require('./pipes/registry');
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
   * 渲染单个页面（直接渲染，不做智能布局）
   */
  private renderSinglePage(components: ComponentNode[]): string {
    const componentsHTML = components.map((comp) => {
      return this.renderComponent(comp);
    }).join('');

    return componentsHTML;
  }

  /**
   * 虚拟分页：基于相对间距的流式布局
   * 核心逻辑：
   * 1. 计算每个组件与上一个组件的间距 (gap)
   * 2. 按顺序累加高度，遇到表格就拆分
   * 3. 换页时从 marginTop 开始，忽略原 gap
   */
  private calculatePages(components: ComponentNode[]): ComponentNode[][] {
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
      const prevBottom = (prevComp.layout.yMm || 0) + (prevComp.layout.heightMm || 0);
      const gap = (comp.layout.yMm || 0) - prevBottom;

      return { comp, gap };
    });

    // 3. 遍历组件，累加高度

    const context = this.createRenderContext();
    const pages: ComponentNode[][] = [];
    let currentPage: ComponentNode[] = [];
    let currentPageHeight = marginTop;  // 当前页的累计高度
    let isFirstComponentInPage = true;  // 标记当前页是否是第一个组件

    for (let i = 0; i < componentsWithGaps.length; i++) {
      const { comp, gap } = componentsWithGaps[i];
      const compHeightMm = comp.layout.heightMm || 50;

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
          const result = this.splitTableWithGap(
            comp,
            tableData,
            gap,
            isFirstComponentInPage,
            availableHeightMm,
            currentPageHeight,
            pages,
            currentPage
          );
          currentPage = result.currentPage;
          currentPageHeight = result.currentPageHeight;
          isFirstComponentInPage = false;  // 表格后不再是第一个
        } else {
          // 空表格：按普通组件处理
          if (this.shouldBreakPage(currentPageHeight, compHeightMm, gap, availableHeightMm, isFirstComponentInPage) && currentPage.length > 0) {
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
            currentPageHeight += gap;
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
        if (this.shouldBreakPage(currentPageHeight, compHeightMm, gap, availableHeightMm, isFirstComponentInPage) && currentPage.length > 0) {
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
          currentPageHeight += gap;
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
   * 表格跨页拆分（基于相对间距）
   * 支持 repeatHeader 配置、精确行高计算、空表格检查
   */
  private splitTableWithGap(
    tableComponent: ComponentNode,
    tableData: any[],
    gap: number,
    isFirstComponentInPage: boolean,
    availableHeightMm: number,
    currentPageHeight: number,
    pages: ComponentNode[][],
    currentPage: ComponentNode[]
  ): { currentPage: ComponentNode[]; currentPageHeight: number } {
    // 读取配置：是否重复表头（默认 true）
    const repeatHeader = tableComponent.props?.pagination?.repeatHeader !== false;

    // 使用精确计算的高度
    const headerHeight = this.calculateTableHeaderHeight(tableComponent);
    const rowHeight = this.calculateTableRowHeight(tableComponent);
    const marginTop = this.template.page.marginMm?.top || 0;

    // 空表格检查
    if (tableData.length === 0) {
      console.info('表格无数据，跳过渲染');
      return { currentPage, currentPageHeight };
    }

    let remainingData = [...tableData];
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

      // 计算能放多少行
      // 如果 repeatHeader = false 且是第一个片段，则表头已经在第一页了，后续页不需要表头
      const needHeader = isFirstFragment || repeatHeader;
      const availableForRows = remainingHeight - (needHeader ? headerHeight : 0);
      const rowsCanFit = Math.floor(availableForRows / rowHeight);

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
      remainingData = remainingData.slice(rowsCanFit);

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
          _showHeader: needHeader  // 控制是否显示表头
        }
      };

      workingPage.push(tableFragment);

      // 更新当前页高度
      const tableFragmentHeight = (needHeader ? headerHeight : 0) + dataForThisPage.length * rowHeight;
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

    return {
      currentPage: workingPage,
      currentPageHeight: workingPageHeight
    };
  }

  /**
   * 生成打印 HTML
   */
  generatePrintHTML(): string {
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
    const pages = this.calculatePages(components);

    // 渲染每个页面
    const pagesHTML = pages.map((pageComponents, index) => {
      const pageContent = this.renderSinglePage(pageComponents);
      return `<div class="print-page" data-page="${index + 1}">${pageContent}</div>`;
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
    generatePrintHTML() {
      return engine.generatePrintHTML();
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
