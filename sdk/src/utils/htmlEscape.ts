/**
 * HTML 转义工具
 * 对文本中的 HTML 特殊字符进行转义，防止 XSS 注入
 * @module htmlEscape
 */

/**
 * HTML 转义函数
 * 根据 shouldEscape 参数决定是否执行转义
 * @param text - 原始文本
 * @param shouldEscape - 是否执行转义，false 时原样返回
 * @returns 转义后的文本或原值
 * @example
 * escapeHtml('<b>text</b>', true)  // '&lt;b&gt;text&lt;/b&gt;'
 * escapeHtml('<b>text</b>', false) // '<b>text</b>'
 */
export function escapeHtml(text: string, shouldEscape: boolean): string {
  if (!shouldEscape) return text;
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
