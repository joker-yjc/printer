/**
 * 组件树面板
 * 支持页头/内容/页脚三区域分组显示
 */

import { Tree, Dropdown, Typography, Empty, Tooltip } from 'antd';
import type { MenuProps, TreeDataNode, TreeProps } from 'antd';
import {
  FileTextOutlined,
  PictureOutlined,
  QrcodeOutlined,
  BarcodeOutlined,
  TableOutlined,
  BorderOutlined,
  LineOutlined,
  CopyOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useDesignerStore } from '../../../../store/designer';
import type { ComponentNode } from '../../../../types';
import styles from './index.module.css';

const { Text } = Typography;

const getComponentIcon = (type: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    text: <FileTextOutlined style={{ color: '#1890ff' }} />,
    image: <PictureOutlined style={{ color: '#52c41a' }} />,
    qrcode: <QrcodeOutlined style={{ color: '#722ed1' }} />,
    barcode: <BarcodeOutlined style={{ color: '#eb2f96' }} />,
    table: <TableOutlined style={{ color: '#fa8c16' }} />,
    rect: <BorderOutlined style={{ color: '#13c2c2' }} />,
    line: <LineOutlined style={{ color: '#faad14' }} />,
  };
  return iconMap[type] || <FileTextOutlined />;
};

const getComponentTypeName = (type: string) => {
  const nameMap: Record<string, string> = {
    text: '文本', image: '图片', qrcode: '二维码',
    barcode: '条形码', table: '表格', rect: '矩形', line: '线条',
  };
  return nameMap[type] || type;
};

const convertComponentsToTree = (components: ComponentNode[]): TreeDataNode[] => {
  return components.map((comp, index) => ({
    key: comp.id,
    title: (
      <span>
        {getComponentIcon(comp.type)}
        <Text style={{ marginLeft: 8 }}>
          {getComponentTypeName(comp.type)} {index + 1}
        </Text>
        {comp.binding?.path && (
          <Text type="secondary" style={{ marginLeft: 4, fontSize: 11 }}>
            ({comp.binding.path})
          </Text>
        )}
      </span>
    ),
    icon: null,
  }));
};

const ComponentTreePanel = () => {
  const {
    components, headerComponents, footerComponents,
    selectedComponentIds, selectComponent,
    removeComponent, duplicateComponent,
    pageConfig,
  } = useDesignerStore();

  const headerEnabled = pageConfig.headerEnabled ?? false;
  const footerEnabled = pageConfig.footerEnabled ?? false;

  const handleSelect: TreeProps['onSelect'] = (selectedKeys) => {
    if (selectedKeys.length > 0) {
      selectComponent(selectedKeys[0] as string);
      const element = document.getElementById(`component-${selectedKeys[0]}`);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const getContextMenuItems = (componentId: string): MenuProps['items'] => [
    { key: 'copy', label: '复制组件', icon: <CopyOutlined />, onClick: () => duplicateComponent(componentId) },
    { type: 'divider' },
    { key: 'delete', label: '删除组件', icon: <DeleteOutlined />, danger: true, onClick: () => removeComponent(componentId) },
  ];

  const renderTreeNode = (node: TreeDataNode) => {
    const titleContent = typeof node.title === 'function' ? node.title(node as any) : node.title;
    return (
      <Dropdown menu={{ items: getContextMenuItems(node.key as string) }} trigger={['contextMenu']}>
        <div>{titleContent}</div>
      </Dropdown>
    );
  };

  const renderSection = (label: string, comps: ComponentNode[], key: string) => {
    const treeData = convertComponentsToTree(comps);
    return (
      <div key={key} style={{ marginBottom: 8 }}>
        <div style={{
          padding: '6px 12px', background: '#fafafa', borderBottom: '1px solid #f0f0f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Text strong style={{ fontSize: 12 }}>{label}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{comps.length} 个</Text>
        </div>
        {comps.length > 0 ? (
          <Tree
            treeData={treeData}
            selectedKeys={selectedComponentIds}
            onSelect={handleSelect}
            showIcon={false}
            blockNode
            titleRender={renderTreeNode}
          />
        ) : (
          <div style={{ padding: '12px 16px', textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 11 }}>拖入组件到{label}</Text>
          </div>
        )}
      </div>
    );
  };

  const totalCount = (headerEnabled ? headerComponents.length : 0) + components.length + (footerEnabled ? footerComponents.length : 0);

  return (
    <div className={styles['tree-panel']}>
      <div className={styles['tree-header']}>
        <Text strong>组件树</Text>
        <Tooltip title="显示所有组件的层级结构">
          <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
            {totalCount} 个组件
          </Text>
        </Tooltip>
      </div>
      <div className={styles['tree-content']}>
        {totalCount === 0 ? (
          <div className={styles['tree-empty']}>
            <Empty description="暂无组件" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        ) : (
          <>
            {headerEnabled && renderSection('页头区域', headerComponents, 'header')}
            {renderSection('内容区域', components, 'content')}
            {footerEnabled && renderSection('页脚区域', footerComponents, 'footer')}
          </>
        )}
      </div>
    </div>
  );
};

export default ComponentTreePanel;
