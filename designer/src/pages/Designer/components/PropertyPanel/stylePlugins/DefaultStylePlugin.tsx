/**
 * 默认样式插件
 * 用于不需要特殊样式配置的组件（如 image、qrcode、barcode、rect）
 * 这些装饰性/媒体组件目前无需样式属性配置
 */

import type { StylePlugin } from './types';

export const DefaultStylePlugin: StylePlugin = {
  name: 'default',

  render: () => {
    return null;
  },
};
