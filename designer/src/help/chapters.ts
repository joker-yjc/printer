export interface Chapter {
  id: string;
  title: string;
  file: string;
}

export const chapters: Chapter[] = [
  {
    id: 'overview',
    title: '平台概述',
    file: new URL('./docs/01-平台概述.md', import.meta.url).href,
  },
  {
    id: 'quick-start',
    title: '快速入门',
    file: new URL('./docs/02-快速入门.md', import.meta.url).href,
  },
  {
    id: 'schema-management',
    title: 'Schema 管理',
    file: new URL('./docs/03-Schema管理.md', import.meta.url).href,
  },
  {
    id: 'template-management',
    title: '模板管理',
    file: new URL('./docs/04-模板管理.md', import.meta.url).href,
  },
  {
    id: 'designer-basics',
    title: '设计器基础',
    file: new URL('./docs/05-设计器基础.md', import.meta.url).href,
  },
  {
    id: 'components-guide',
    title: '组件使用指南',
    file: new URL('./docs/06-组件使用指南.md', import.meta.url).href,
  },
  {
    id: 'data-binding',
    title: '数据绑定与管道',
    file: new URL('./docs/07-数据绑定与管道.md', import.meta.url).href,
  },
  {
    id: 'table-config',
    title: '表格高级配置',
    file: new URL('./docs/08-表格高级配置.md', import.meta.url).href,
  },
  {
    id: 'page-settings',
    title: '页面设置',
    file: new URL('./docs/09-页面设置.md', import.meta.url).href,
  },
  {
    id: 'print-preview',
    title: '打印预览与调试',
    file: new URL('./docs/10-打印预览与调试.md', import.meta.url).href,
  },
  {
    id: 'shortcuts',
    title: '快捷键速查',
    file: new URL('./docs/11-快捷键速查.md', import.meta.url).href,
  },
  {
    id: 'sdk-integration',
    title: 'SDK 接入',
    file: new URL('./docs/12-SDK接入.md', import.meta.url).href,
  },
];
