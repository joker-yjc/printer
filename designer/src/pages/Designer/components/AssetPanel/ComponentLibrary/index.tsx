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
      shortcut: '点击或从数据资产拖拽字段',
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
      description: '表格组件，支持数组数据绑定',
      shortcut: '从数据资产拖拽数组字段生成',
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
      shortcut: '点击插入',
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
      shortcut: '点击插入',
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
      shortcut: '点击插入',
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
