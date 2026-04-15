/**
 * 打印 SDK 核心类
 * 提供完整的打印功能封装
 * 解耦设计：直接接收模板数据，不依赖模板服务
 */

import { createPrintEngine } from './printEngine';
import type { PrintTemplate } from './types';
import {
  generateBatchPrintStyles,
  generatePrintHTML,
  getPageSizeFromConfig,
} from './printEngine/htmlTemplate';
import { waitForImagesLoaded } from './utils/resourceLoader';

/**
 * ✅ 使用 DOMParser 提取 HTML body 内容（比正则更健壮）
 * @param html 完整的 HTML 字符串
 * @returns body 内的内容，如果解析失败返回 null
 */
function extractBodyContent(html: string): string | null {
  try {
    // 使用 DOMParser 解析 HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 获取 body 内容
    const bodyContent = doc.body?.innerHTML?.trim();

    if (!bodyContent) {
      console.warn('[PrintSDK] 无法提取 body 内容');
      return null;
    }

    return bodyContent;
  } catch (error) {
    console.error('[PrintSDK] 解析 HTML 失败:', error);
    // 兜底：使用正则提取
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    return bodyMatch?.[1]?.trim() || null;
  }
}

/**
 * 打印选项
 */
export interface PrintOptions {
  template: PrintTemplate;  // 直接传入模板数据
  data: any;                // 打印数据
  preview?: boolean;        // 是否预览（默认 false）
}

/**
 * 批量打印选项（同模板多数据）
 */
export interface BatchPrintOptions {
  preview?: boolean;           // 是否预览（默认 false）
  onProgress?: (progress: BatchPrintProgress) => void;  // 进度回调
}

/**
 * 批量打印进度
 */
export interface BatchPrintProgress {
  total: number;      // 总任务数
  completed: number;  // 已完成数
  failed: number;     // 失败数
  currentIndex: number;  // 当前处理的索引（-1 表示未开始/已结束）
}

export class PrintSDK {
  // 无需配置和缓存，完全解耦

  /**
   * 打印
   * @param options 打印选项
   * @param options.template 模板数据
   * @param options.data 数据对象
   * @param options.preview 是否预览（默认 false）
   */
  async print(options: PrintOptions): Promise<void> {
    const { template, data, preview = false } = options;
    const engine = createPrintEngine(template, data);

    if (preview) {
      // 预览模式：打开新窗口显示
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Failed to open print window. Please check browser settings.');
      }

      const html = await engine.generatePrintHTML();
      printWindow.document.write(html);
      printWindow.document.close();

      // 等待所有图片加载完成后再打印
      await waitForImagesLoaded(printWindow.document);
      printWindow.print();
    } else {
      // 直接打印模式：在隐藏 iframe 中打印
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      document.body.appendChild(iframe);

      const html = await engine.generatePrintHTML();
      const iframeDoc = iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('Failed to access iframe document');
      }

      iframeDoc.write(html);
      iframeDoc.close();

      // 等待所有图片加载完成后再打印
      // 注意：二维码和条形码已同步生成为base64，主要等待外部图片资源
      await waitForImagesLoaded(iframeDoc);

      // ✅ 监听打印完成事件后再移除 iframe
      const cleanup = () => {
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
      };

      // 优先使用 afterprint 事件（现代浏览器支持）
      if (iframe.contentWindow) {
        iframe.contentWindow.addEventListener('afterprint', cleanup, { once: true });
      }

      // 触发打印
      iframe.contentWindow?.print();

      // 兜底：如果 afterprint 事件未触发（如用户取消打印），5秒后清理
      setTimeout(() => {
        if (iframe.parentNode) {
          console.warn('[PrintSDK] afterprint 事件未触发，执行兜底清理');
          cleanup();
        }
      }, 5000);
    }
  }

  /**
   * 快捷打印（不预览）
   * @param template 模板数据
   * @param data 数据对象
   */
  async printDirect(template: PrintTemplate, data: any): Promise<void> {
    return this.print({ template, data, preview: false });
  }

  /**
   * 预览后打印
   * @param template 模板数据
   * @param data 数据对象
   */
  async printWithPreview(template: PrintTemplate, data: any): Promise<void> {
    return this.print({ template, data, preview: true });
  }

  /**
   * 仅生成 HTML（不打印）
   * @param template 模板数据
   * @param data 数据对象
   * @returns HTML 字符串
   */
  async generateHTML(template: PrintTemplate, data: any): Promise<string> {
    const engine = createPrintEngine(template, data);
    return await engine.generatePrintHTML();
  }

  /**
   * 批量打印（同模板多数据）
   * 生成包含所有数据的完整打印文档，只需要用户确认一次打印
   * @param template 模板数据
   * @param dataList 数据列表
   * @param options 批量打印选项
   */
  async printMultiple(
    template: PrintTemplate,
    dataList: any[],
    options: BatchPrintOptions = {}
  ): Promise<void> {
    const {
      preview = false,
      onProgress,
    } = options;

    const { page } = template;

    const progress: BatchPrintProgress = {
      total: dataList.length,
      completed: 0,
      failed: 0,
      currentIndex: -1,
    };

    // 报告初始进度
    onProgress?.(progress);

    // 生成所有页面的HTML片段
    const allPagesHTML: string[] = [];

    for (let i = 0; i < dataList.length; i++) {
      const data = dataList[i];
      progress.currentIndex = i;
      onProgress?.(progress);

      try {
        const engine = createPrintEngine(template, data);
        const html = await engine.generatePrintHTML();

        // ✅ 提取 <body> 标签中的内容（使用 DOMParser 代替正则，更健壮）
        const bodyContent = extractBodyContent(html);
        if (bodyContent) {
          allPagesHTML.push(bodyContent);
        }

        progress.completed++;
        onProgress?.(progress);
      } catch (error) {
        progress.failed++;
        progress.completed++;
        onProgress?.(progress);
        console.error(`处理数据 ${i} 失败:`, error);
      }
    }

    progress.currentIndex = -1;
    onProgress?.(progress);

    // 获取页面尺寸信息
    const { widthMm: pageWidthMm, heightMm: pageHeightMm } = getPageSizeFromConfig(page);

    // 生成批量打印样式
    const styles = generateBatchPrintStyles({
      pageWidthMm,
      pageHeightMm,
      isContinuous: page.size === 'CONTINUOUS',
      minHeightMm: page.minHeightMm,
    });

    // 组装完整的打印HTML
    const fullHTML = generatePrintHTML({
      title: '批量打印',
      styles,
      bodyContent: allPagesHTML.join('\n'),
    });

    // 执行打印（只需要确认一次）
    if (preview) {
      // 预览模式：打开新窗口
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Failed to open print window');
      }
      printWindow.document.write(fullHTML);
      printWindow.document.close();

      // 等待所有图片加载完成后再打印
      await waitForImagesLoaded(printWindow.document);
      printWindow.print();
    } else {
      // 直接打印模式：使用 iframe
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('Failed to access iframe document');
      }

      iframeDoc.write(fullHTML);
      iframeDoc.close();

      // 等待所有图片加载完成后再打印
      await waitForImagesLoaded(iframeDoc);
      iframe.contentWindow?.print();
      // 打印完成后移除 iframe
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }
  }
}

/**
 * 创建 SDK 实例（无需配置）
 * @returns PrintSDK 实例
 */
export function createPrintSDK(): PrintSDK {
  return new PrintSDK();
}
