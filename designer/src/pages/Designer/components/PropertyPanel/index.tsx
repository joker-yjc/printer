/**
 * 属性面板主组件
 * 负责组装各个子区域，遵循单一职责原则
 */

import { Typography, Empty } from 'antd';
import styles from './index.module.css';
import { useDesignerStore } from '../../../../store/designer';
import LayoutSection from './LayoutSection';
import DataBindingSection from './DataBindingSection';
import StyleSection from './StyleSection';
import TableColumnSection from './TableColumnSection';

const { Title, Text } = Typography;

const PropertyPanel = () => {
  const { selectedComponentId, components, updateComponent } = useDesignerStore();
  const selectedComponent = components.find((c) => c.id === selectedComponentId);

  if (!selectedComponent) {
    return (
      <div className={styles["property-panel"]}>
        <div className={styles["property-header"]}>
          <Title level={5} style={{ margin: 0 }}>组件属性</Title>
          <Text type="secondary" style={{ fontSize: 12 }}>未选中组件</Text>
        </div>
        <div style={{ padding: 24, textAlign: 'center' }}>
          <Empty description="请在画布中选择一个组件" />
        </div>
      </div>
    );
  }

  // 布局属性变更处理
  const handleLayoutChange = (field: string, value: number) => {
    updateComponent(selectedComponent.id, {
      layout: {
        ...selectedComponent.layout,
        [field]: value,
      },
    });
  };

  // 样式属性变更处理
  const handleStyleChange = (field: string, value: any) => {
    updateComponent(selectedComponent.id, {
      style: {
        ...selectedComponent.style,
        [field]: value,
      },
    });
  };

  // Props 属性变更处理
  const handlePropsChange = (field: string, value: any) => {
    updateComponent(selectedComponent.id, {
      props: {
        ...selectedComponent.props,
        [field]: value,
      },
    });
  };

  // 数据绑定变更处理
  const handleBindingChange = (field: string, value: any) => {
    const currentBinding = selectedComponent.binding || { path: '' };
    updateComponent(selectedComponent.id, {
      binding: {
        ...currentBinding,
        path: currentBinding.path || '',
        [field]: value,
      },
    });
  };

  // 获取组件类型显示名称
  const getComponentTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      text: '文本',
      image: '图片',
      qrcode: '二维码',
      barcode: '条形码',
      table: '表格',
      line: '线条',
      rect: '矩形',
    };
    return typeMap[type] || type;
  };

  return (
    <div className={styles["property-panel"]}>
      <div className={styles["property-header"]}>
        <Title level={5} style={{ margin: 0 }}>组件属性</Title>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {getComponentTypeName(selectedComponent.type)} - {selectedComponent.id}
        </Text>
      </div>

      {/* 布局属性 */}
      <LayoutSection
        component={selectedComponent}
        onChange={handleLayoutChange}
      />

      {/* 数据绑定 */}
      <DataBindingSection
        component={selectedComponent}
        onBindingChange={handleBindingChange}
      />

      {/* 样式属性（插件化） */}
      <StyleSection
        component={selectedComponent}
        onStyleChange={handleStyleChange}
        onPropsChange={handlePropsChange}
        onLayoutChange={handleLayoutChange}
      />

      {/* 表格列管理（仅表格组件显示） */}
      <TableColumnSection
        component={selectedComponent}
        onPropsChange={handlePropsChange}
      />
    </div>
  );
};

export default PropertyPanel;
