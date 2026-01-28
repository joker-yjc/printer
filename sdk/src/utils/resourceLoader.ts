/**
 * 资源加载工具
 * 用于等待图片、二维码、条形码等异步资源加载完成
 */

/**
 * 等待文档中所有图片加载完成
 * @param doc 文档对象（可以是 window.document 或 iframe.contentDocument）
 * @param timeout 超时时间（毫秒），默认 10000ms
 * @returns Promise<void>
 */
export async function waitForImagesLoaded(
  doc: Document,
  timeout: number = 10000
): Promise<void> {
  const images = Array.from(doc.querySelectorAll('img'));

  if (images.length === 0) {
    // 没有图片，直接返回
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    let loadedCount = 0;
    let errorCount = 0;
    const totalImages = images.length;

    // 超时处理
    const timeoutId = setTimeout(() => {
      console.warn(`图片加载超时，已加载 ${loadedCount}/${totalImages}，失败 ${errorCount} 张`);
      resolve(); // 超时也算完成，避免无限等待
    }, timeout);

    // 检查是否所有图片都已完成
    const checkComplete = () => {
      if (loadedCount + errorCount >= totalImages) {
        clearTimeout(timeoutId);
        if (errorCount > 0) {
          console.warn(`有 ${errorCount} 张图片加载失败`);
        }
        resolve();
      }
    };

    // 为每个图片添加加载监听
    images.forEach((img) => {
      // 如果图片已经加载完成（cached）
      if (img.complete) {
        if (img.naturalHeight !== 0) {
          loadedCount++;
        } else {
          errorCount++;
        }
        checkComplete();
      } else {
        // 监听 load 和 error 事件
        img.addEventListener('load', () => {
          loadedCount++;
          checkComplete();
        });

        img.addEventListener('error', (e) => {
          errorCount++;
          console.error('图片加载失败:', img.src, e);
          checkComplete();
        });
      }
    });

    // 立即检查一次（可能所有图片都已缓存）
    checkComplete();
  });
}

/**
 * 等待所有打印资源加载完成
 * 包括：图片、二维码（已转base64）、条形码（已转base64）
 * 注意：二维码和条形码在渲染时已同步生成为 base64，所以主要等待外部图片
 * @param doc 文档对象
 * @param timeout 超时时间（毫秒），默认 10000ms
 */
export async function waitForPrintResourcesReady(
  doc: Document,
  timeout: number = 10000
): Promise<void> {
  // 目前只需要等待图片加载
  // 二维码和条形码在 QRCodeRenderer 和 BarcodeRenderer 中已同步生成为 base64
  return waitForImagesLoaded(doc, timeout);
}
