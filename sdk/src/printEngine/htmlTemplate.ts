/**
 * 打印HTML模板生成器
 * 统一管理所有打印相关的HTML和样式，避免重复代码
 */

import type { PageConfig } from '../types';

/**
 * 打印样式配置
 */
interface PrintStyleConfig {
  pageWidthMm: number;
  pageHeightMm: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  isContinuous?: boolean;
  minHeightMm?: number;
}

/**
 * 生成组件基础样式
 * 这些样式对所有打印场景都适用
 */
function generateComponentStyles(): string {
  return `
    /* 文本组件样式 */
    .text-component {
      position: absolute;
      white-space: pre-wrap;
      word-wrap: break-word;
      overflow: visible;
    }

    /* 表格组件样式 */
    .table-component {
      position: absolute;
    }
    .table-component table {
      width: 100%;
      border-collapse: collapse;
    }

    /* 图片组件样式 */
    .image-component {
      position: absolute;
    }
    .image-component img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    /* 矩形组件样式 */
    .rect-component {
      position: absolute;
    }

    /* 线条组件样式 */
    .line-component {
      position: absolute;
    }

    /* 二维码组件样式 */
    .qrcode-component {
      position: absolute;
    }

    /* 条形码组件样式 */
    .barcode-component {
      position: absolute;
    }
  `;
}

/**
 * 生成打印页面样式（预览模式）
 * 用于 printEngine 的 generatePrintHTML
 */
export function generatePrintPageStyles(config: PrintStyleConfig): string {
  const {
    pageWidthMm,
    pageHeightMm,
    marginTop = 0,
    marginRight = 0,
    marginBottom = 0,
    marginLeft = 0,
    isContinuous = false,
    minHeightMm,
  } = config;

  if (isContinuous) {
    // 连续纸样式
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: Arial, sans-serif;
        background: white;
      }

      .print-page {
        position: relative;
        width: ${pageWidthMm}mm;
        min-height: auto;
        padding: ${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm;
        margin: 0 auto;
        box-sizing: border-box;
        background: white;
      }

      ${generateComponentStyles()}
    `;
  }

  // 标准分页样式（带预览间隔和阴影）
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Arial, sans-serif;
      background: #f0f0f0;
      padding: 20px;
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }

      @page {
        size: ${pageWidthMm}mm ${pageHeightMm}mm;
        margin: 0;  /* 打印时不使用 @page margin，而是使用 .print-page 的 padding */
      }

      .print-page {
        page-break-after: always;
        margin-bottom: 0 !important;
        box-shadow: none;  /* 移除阴影 */
      }

      .print-page:last-child {
        page-break-after: auto;
      }
    }

    .print-page {
      position: relative;
      width: ${pageWidthMm}mm;
      height: ${pageHeightMm}mm;
      margin: 0 auto 20px; /* 页面间隔 20px */
      box-sizing: border-box;
      background: white;
      padding: ${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1); /* 阴影效果 */
    }

    ${generateComponentStyles()}
  `;
}

/**
 * 生成批量打印样式（直接打印模式）
 * 用于 PrintSDK 的 printMultiple
 */
export function generateBatchPrintStyles(config: PrintStyleConfig): string {
  const {
    pageWidthMm,
    pageHeightMm,
    isContinuous = false,
    minHeightMm = 100,
  } = config;

  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { margin: 0; padding: 0; background: #f5f5f5; }
    
    @page {
      size: ${pageWidthMm}mm ${pageHeightMm}mm;
      margin: 0;
    }
    
    @media print {
      body { margin: 0; padding: 0; background: white; }
      .print-page { margin: 0; page-break-after: always; box-shadow: none !important; }
      .print-page:last-child { page-break-after: auto; }
    }
    
    @media screen {
      body { padding: 20px 0; }
      .print-page {
        margin: 0 auto 20px auto;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }
    
    .print-page {
      width: ${pageWidthMm}mm;
      height: ${isContinuous ? 'auto' : pageHeightMm + 'mm'};
      min-height: ${isContinuous ? minHeightMm + 'mm' : 'auto'};
      background: white;
      position: relative;
      box-sizing: border-box;
    }

    ${generateComponentStyles()}
  `;
}

/**
 * 生成完整的打印HTML文档
 */
export function generatePrintHTML(options: {
  title: string;
  styles: string;
  bodyContent: string;
}): string {
  const { title, styles, bodyContent } = options;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        ${styles}
      </style>
    </head>
    <body>
      ${bodyContent}
    </body>
    </html>
  `;
}

/**
 * 从 PageConfig 提取页面尺寸信息
 */
export function getPageSizeFromConfig(page: PageConfig): {
  widthMm: number;
  heightMm: number;
} {
  let pageWidthMm: number;
  let pageHeightMm: number;

  if (page.size === 'CUSTOM') {
    pageWidthMm = page.widthMm || 210;
    pageHeightMm = page.heightMm || 297;
  } else if (page.size === 'CONTINUOUS') {
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
