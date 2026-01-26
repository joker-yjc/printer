// 打印相关常量配置

/**
 * 连续纸默认最小高度（mm）
 * 用于在画布编辑时提供一个基础的显示高度
 */
export const CONTINUOUS_PAPER_MIN_HEIGHT = 100;

/**
 * 连续纸默认宽度（mm）
 * 常见热敏打印机宽度为 80mm
 */
export const CONTINUOUS_PAPER_DEFAULT_WIDTH = 80;

/**
 * mm 转 px 换算系数
 * 基于 CSS 标准：96px/inch ÷ 25.4mm/inch
 */
export const MM_TO_PX_RATIO = 3.78;
