import { Button, Space, Tooltip, message } from 'antd';
import {
  FontSizeOutlined,
  TableOutlined,
  LineOutlined,
  QrcodeOutlined,
  BarcodeOutlined,
} from '@ant-design/icons';
import { useDesignerStore } from '../../../../../store/designer';
import type { ComponentNode } from '../../../../../types';

// 组件配置
interface ComponentConfig {
  type: ComponentNode['type'];
  name: string;
  icon: React.ReactNode;
  category: 'basic' | 'decoration' | 'encoding';
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
      getDefaultProps: () => ({
        layout: { mode: 'absolute', xMm: 50, yMm: 50, widthMm: 60, heightMm: 10 },
        style: { fontSize: 14, color: '#262626' },
        props: { text: '文本内容' },
      }),
    },
    {
      type: 'table',
      name: '表格',
      icon: <TableOutlined />,
      category: 'basic',
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
      getDefaultProps: (config) => {
        const pageWidthMm = config.size === 'A4' ? 210 : 148;
        const { left, right } = config.marginMm;
        const availableWidth = pageWidthMm - left - right;
        return {
          layout: { mode: 'absolute', xMm: left, yMm: 50, widthMm: availableWidth, heightMm: 0 },
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
      getDefaultProps: () => ({
        layout: { mode: 'absolute', xMm: 50, yMm: 50, widthMm: 60, heightMm: 20 },
        props: { content: '1234567890', format: 'CODE128' },
      }),
    },
  ];

  // 分类配置
  const categories = [
    { key: 'basic', label: '基础组件' },
    { key: 'decoration', label: '装饰组件' },
    { key: 'encoding', label: '编码组件' },
  ];

  // 插入组件
  const handleInsertComponent = (config: ComponentConfig) => {
    const defaultProps = config.getDefaultProps(pageConfig);
    const newComponent: ComponentNode = {
      id: `comp-${Date.now()}`,
      type: config.type,
      ...defaultProps,
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
                  <Tooltip key={item.type} title={item.name}>
                    <Button
                      icon={item.icon}
                      onClick={() => handleInsertComponent(item)}
                      size="large"
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
