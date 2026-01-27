/**
 * 组件树面板
 * 显示所有组件的层级结构，支持选中、定位、右键菜单
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

// 组件类型图标映射
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

// 组件类型名称映射
const getComponentTypeName = (type: string) => {
  const nameMap: Record<string, string> = {
    text: '文本',
    image: '图片',
    qrcode: '二维码',
    barcode: '条形码',
    table: '表格',
    rect: '矩形',
    line: '线条',
  };
  return nameMap[type] || type;
};

// 将组件列表转换为树形数据
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
    icon: null, // 已经在 title 中显示了图标
  }));
};

const ComponentTreePanel = () => {
  const { components, selectedComponentIds, selectComponent, removeComponent, duplicateComponent } =
    useDesignerStore();

  // 转换为树形数据
  const treeData = convertComponentsToTree(components);

  // 处理选中节点
  const handleSelect: TreeProps['onSelect'] = (selectedKeys) => {
    if (selectedKeys.length > 0) {
      const componentId = selectedKeys[0] as string;
      selectComponent(componentId);

      // 定位到组件（滚动到可视区域）
      const element = document.getElementById(`component-${componentId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // 右键菜单项
  const getContextMenuItems = (componentId: string): MenuProps['items'] => [
    {
      key: 'copy',
      label: '复制组件',
      icon: <CopyOutlined />,
      onClick: () => {
        duplicateComponent(componentId);
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: '删除组件',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => {
        removeComponent(componentId);
      },
    },
  ];

  // 渲染树节点的标题（支持右键菜单）
  const renderTreeNode = (node: TreeDataNode) => {
    const titleContent = typeof node.title === 'function' ? node.title(node as any) : node.title;
    return (
      <Dropdown
        menu={{ items: getContextMenuItems(node.key as string) }}
        trigger={['contextMenu']}
      >
        <div>{titleContent}</div>
      </Dropdown>
    );
  };

  if (components.length === 0) {
    return (
      <div className={styles['tree-panel']}>
        <div className={styles['tree-header']}>
          <Text strong>组件树</Text>
          <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
            {components.length} 个组件
          </Text>
        </div>
        <div className={styles['tree-empty']}>
          <Empty
            description="暂无组件"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles['tree-panel']}>
      <div className={styles['tree-header']}>
        <Text strong>组件树</Text>
        <Tooltip title="显示所有组件的层级结构">
          <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
            {components.length} 个组件
          </Text>
        </Tooltip>
      </div>
      <div className={styles['tree-content']}>
        <Tree
          treeData={treeData}
          selectedKeys={selectedComponentIds}
          onSelect={handleSelect}
          showIcon={false}
          blockNode
          titleRender={renderTreeNode}
        />
      </div>
    </div>
  );
};

export default ComponentTreePanel;
