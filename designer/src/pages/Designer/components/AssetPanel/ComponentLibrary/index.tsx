import { Button, Space, Tooltip, message } from 'antd';
import {
  FontSizeOutlined,
  TableOutlined,
  LineOutlined,
  QrcodeOutlined,
  BarcodeOutlined,
  BorderOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { useDesignerStore } from '../../../../../store/designer';
import type { ComponentNode } from '../../../../../types';
import React from 'react';

// 组件配置
interface ComponentConfig {
  type: ComponentNode['type'];
  name: string;
  icon: React.ReactNode;
  category: 'basic' | 'decoration' | 'encoding';
  description: string; // 组件描述
  shortcut?: string;   // 快捷键提示
  getDefaultProps: (pageConfig: any) => Partial<ComponentNode>;
}

const ComponentLibrary = () => {
  const { addComponent, selectComponent, pageConfig } = useDesignerStore();

  // 组件配置列表
  const componentConfigs: ComponentConfig[] = [
    {
      type: 'text',
      name: '文本',
      icon: <FontSizeOutlined />,
      category: 'basic',
      description: '文本组件，支持数据绑定和格式化',
      shortcut: '双击快速添加 | 拖拽精确放置',
      getDefaultProps: () => ({
        layout: { mode: 'absolute', xMm: 50, yMm: 50, widthMm: 60, heightMm: 10 },
        style: { fontSize: 14, color: '#262626' },
        props: { text: '文本内容' },
      }),
    },
    {
      type: 'image',
      name: '图片',
      icon: <PictureOutlined />,
      category: 'basic',
      description: '图片组件，支持本地和远程图片',
      shortcut: '双击快速添加 | 拖拽精确放置',
      getDefaultProps: () => ({
        layout: { mode: 'absolute', xMm: 50, yMm: 50, widthMm: 60, heightMm: 40 },
        props: { src: '' },
      }),
    },
    {
      type: 'table',
      name: '表格',
      icon: <TableOutlined />,
      category: 'basic',
      description: '表格组件，支持数组数据绑定',
      shortcut: '双击快速添加 | 拖拽精确放置',
      getDefaultProps: (config) => {
        const pageWidthMm = config.size === 'A4' ? 210 : 148;
        const { top, left, right } = config.marginMm;
        const availableWidth = pageWidthMm - left - right;
        return {
          layout: { mode: 'absolute', xMm: left, yMm: top, widthMm: availableWidth, heightMm: 60 },
          style: { fontSize: 12 },
          props: { columns: [], bordered: true, showHeader: true },
        };
      },
    },
    {
      type: 'line',
      name: '线条',
      icon: <LineOutlined />,
      category: 'decoration',
      description: '水平或垂直线条，用于装饰和分割',
      shortcut: '双击快速添加 | 拖拽精确放置',
      getDefaultProps: (config) => {
        const pageWidthMm = config.size === 'A4' ? 210 : 148;
        const { left, right } = config.marginMm;
        const availableWidth = pageWidthMm - left - right;
        return {
          layout: { mode: 'absolute', xMm: left, yMm: 50, widthMm: availableWidth, heightMm: 5 },
          style: { borderTopWidth: 1, borderTopColor: '#000', borderTopStyle: 'solid' },
          props: { direction: 'horizontal' },
        };
      },
    },
    {
      type: 'qrcode',
      name: '二维码',
      icon: <QrcodeOutlined />,
      category: 'encoding',
      description: '二维码组件，支持URL和文本编码',
      shortcut: '双击快速添加 | 拖拽精确放置',
      getDefaultProps: () => ({
        layout: { mode: 'absolute', xMm: 50, yMm: 50, widthMm: 30, heightMm: 30 },
        props: { content: 'https://example.com', size: 30 },
      }),
    },
    {
      type: 'barcode',
      name: '条形码',
      icon: <BarcodeOutlined />,
      category: 'encoding',
      description: '条形码组件，支持多种编码格式',
      shortcut: '双击快速添加 | 拖拽精确放置',
      getDefaultProps: () => ({
        layout: { mode: 'absolute', xMm: 50, yMm: 50, widthMm: 60, heightMm: 20 },
        props: { content: '1234567890', format: 'CODE128' },
      }),
    },
    {
      type: 'rect',
      name: '矩形',
      icon: <BorderOutlined />,
      category: 'decoration',
      description: '矩形边框，用于装饰和突出显示',
      shortcut: '双击快速添加 | 拖拽精确放置',
      getDefaultProps: () => ({
        layout: { mode: 'absolute', xMm: 50, yMm: 50, widthMm: 60, heightMm: 15 },
        style: { border: '1px solid #000', background: 'transparent' },
      }),
    },
  ];

  // 分类配置
  const categories = [
    { key: 'basic', label: '基础组件' },
    { key: 'decoration', label: '装饰组件' },
    { key: 'encoding', label: '编码组件' },
  ];

  // 计算画布中心位置
  const getCanvasCenter = (componentWidth: number, componentHeight: number) => {
    const pageWidthMm = pageConfig.size === 'A4' ? 210 : 148;
    const pageHeightMm = pageConfig.size === 'A4' ? 297 : 210;

    // 考虑纸张方向
    const actualWidth = pageConfig.orientation === 'landscape' ? pageHeightMm : pageWidthMm;
    const actualHeight = pageConfig.orientation === 'landscape' ? pageWidthMm : pageHeightMm;

    return {
      xMm: (actualWidth - componentWidth) / 2,
      yMm: (actualHeight - componentHeight) / 2,
    };
  };

  // 插入组件（双击或拖拽）
  const handleInsertComponent = (config: ComponentConfig, position?: { xMm: number; yMm: number }) => {
    const defaultProps = config.getDefaultProps(pageConfig);

    // 如果指定了位置（拖拽），使用拖拽位置；否则使用画布中心
    let finalLayout = { ...defaultProps.layout };
    if (!position) {
      const centerPos = getCanvasCenter(
        defaultProps.layout?.widthMm || 60,
        defaultProps.layout?.heightMm || 10
      );
      finalLayout.xMm = centerPos.xMm;
      finalLayout.yMm = centerPos.yMm;
    } else {
      finalLayout.xMm = position.xMm;
      finalLayout.yMm = position.yMm;
    }

    const newComponent: ComponentNode = {
      id: `comp-${Date.now()}`,
      type: config.type,
      ...defaultProps,
      layout: finalLayout,
    } as ComponentNode;

    addComponent(newComponent);
    selectComponent(newComponent.id);
    message.success(`已添加${config.name}组件`);
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '16px' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {categories.map((category) => {
          const items = componentConfigs.filter((c) => c.category === category.key);
          if (items.length === 0) return null;

          return (
            <div key={category.key}>
              <div style={{ marginBottom: 8, fontSize: 12, color: '#8c8c8c' }}>
                {category.label}
              </div>
              <Space wrap>
                {items.map((item) => (
                  <Tooltip
                    key={item.type}
                    title={
                      <div>
                        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{item.name}</div>
                        <div style={{ fontSize: 12 }}>{item.description}</div>
                        {item.shortcut && (
                          <div style={{ fontSize: 11, color: '#bfbfbf', marginTop: 4 }}>
                            {item.shortcut}
                          </div>
                        )}
                      </div>
                    }
                  >
                    <Button
                      icon={item.icon}
                      draggable
                      onClick={(e) => {
                        // 双击检测
                        if (e.detail === 2) {
                          handleInsertComponent(item);
                        }
                      }}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('componentType', item.type);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      size="large"
                      style={{ cursor: 'grab' }}
                    />
                  </Tooltip>
                ))}
              </Space>
            </div>
          );
        })}
      </Space>
    </div>
  );
};

export default ComponentLibrary;
