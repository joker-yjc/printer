import { Select, Tree, message, Tag } from 'antd';
import {
  FileOutlined,
  FolderOutlined,
  TableOutlined,
  FontSizeOutlined,
  NumberOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import type { DataNode } from 'antd/es/tree';
import { schemaApi } from '../../../../../services/api';
import type { SchemaDictionary, SchemaField, ComponentNode } from '../../../../../types';
import { useDesignerStore } from '../../../../../store/designer';
import styles from './index.module.css';


const DataAsset = () => {
  const [schemas, setSchemas] = useState<SchemaDictionary[]>([]);
  const [selectedSchemaId, setSelectedSchemaId] = useState<string>();
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [loading, setLoading] = useState(false);
  const { setTemplateInfo, addComponent, selectComponent, pageConfig } = useDesignerStore();

  // 加载 Schema 列表
  useEffect(() => {
    loadSchemas();
  }, []);

  const loadSchemas = async () => {
    setLoading(true);
    try {
      const data = await schemaApi.list();
      setSchemas(data);
      if (data.length > 0) {
        setSelectedSchemaId(data[0].id);
        setTemplateInfo({ schemaId: data[0].id });
      }
    } catch (error) {
      message.error('加载 Schema 列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 当选中的 Schema 变化时，更新树数据和 store
  useEffect(() => {
    if (selectedSchemaId) {
      const schema = schemas.find((s) => s.id === selectedSchemaId);
      if (schema) {
        setTreeData(convertSchemaToTree(schema.root));
        setTemplateInfo({ schemaId: selectedSchemaId });
      }
    }
  }, [selectedSchemaId, schemas, setTemplateInfo]);

  // 根据字段类型获取图标
  const getFieldIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      string: <FontSizeOutlined style={{ color: '#52c41a' }} />,
      number: <NumberOutlined style={{ color: '#fa8c16' }} />,
      boolean: <CheckCircleOutlined style={{ color: '#13c2c2' }} />,
      date: <CalendarOutlined style={{ color: '#722ed1' }} />,
      array: <TableOutlined style={{ color: '#1890ff' }} />,
      object: <FolderOutlined style={{ color: '#8c8c8c' }} />,
    };
    return iconMap[type] || <FileOutlined style={{ color: '#d9d9d9' }} />;
  };

  // 将 SchemaField 转换为 Ant Design Tree 的 DataNode
  const convertSchemaToTree = (field: SchemaField, parentPath = '', parentIsArray = false): DataNode[] => {
    const currentPath = parentPath ? `${parentPath}.${field.key}` : field.key;
    const isArrayChild = parentIsArray; // 标记是否为数组的子字段

    if (field.type === 'object' && field.children) {
      return [
        {
          title: `${field.label} (${field.key})`,
          key: currentPath,
          icon: getFieldIcon('object'),
          disableCheckbox: true,
          selectable: true,
          children: field.children.flatMap((child) => convertSchemaToTree(child, currentPath, false)),
        },
      ];
    }

    if (field.type === 'array' && field.children) {
      return [
        {
          title: `${field.label} (${field.key})`,
          key: currentPath,
          icon: getFieldIcon('array'),
          children: field.children.flatMap((child) => convertSchemaToTree(child, currentPath, true)), // 标记子节点为数组子字段
        },
      ];
    }

    // 数组子字段：显示灰色 + 标签提示
    if (isArrayChild) {
      return [
        {
          title: (
            <span style={{ color: '#999' }}>
              {field.label} ({field.key})
              <Tag style={{ marginLeft: 4, fontSize: 10, padding: '0 4px', lineHeight: '16px' }}>
                仅表格列
              </Tag>
            </span>
          ),
          key: currentPath,
          icon: getFieldIcon(field.type),
          isLeaf: true,
          disabled: true, // 禁用选择
        },
      ];
    }

    // 普通字段
    return [
      {
        title: `${field.label} (${field.key})`,
        key: currentPath,
        icon: getFieldIcon(field.type),
        isLeaf: true,
      },
    ];
  };

  // 检查是否为数组的子字段
  const isArrayChildField = (path: string): boolean => {
    const schema = schemas.find((s) => s.id === selectedSchemaId);
    if (!schema) return false;

    const keys = path.split('.');
    let current: SchemaField = schema.root;

    // 遍历路径，检查是否有祖先节点是 array
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      if (current.key === key) {
        continue;
      }

      if (current.children) {
        const found = current.children.find((c) => c.key === key);
        if (!found) return false;

        // 如果当前节点是 array，且还有后续路径，说明是数组子字段
        if (current.type === 'array' && i < keys.length - 1) {
          return true;
        }

        current = found;
      } else {
        return false;
      }
    }

    return false;
  };

  // 根据路径查找字段信息
  const findFieldByPath = (path: string): SchemaField | null => {
    const schema = schemas.find((s) => s.id === selectedSchemaId);
    if (!schema) return null;

    const keys = path.split('.');
    let current: SchemaField = schema.root;

    for (const key of keys) {
      if (current.key === key) {
        continue;
      }
      if (current.children) {
        const found = current.children.find((c) => c.key === key);
        if (found) {
          current = found;
        } else {
          return null;
        }
      } else {
        return null;
      }
    }
    return current;
  };

  // 计算画布中心位置
  const getCanvasCenter = (componentWidth: number, componentHeight: number) => {
    const pageWidthMm = pageConfig.size === 'A4' ? 210 : 148;
    const pageHeightMm = pageConfig.size === 'A4' ? 297 : 210;

    const actualWidth = pageConfig.orientation === 'landscape' ? pageHeightMm : pageWidthMm;
    const actualHeight = pageConfig.orientation === 'landscape' ? pageWidthMm : pageHeightMm;

    return {
      xMm: (actualWidth - componentWidth) / 2,
      yMm: (actualHeight - componentHeight) / 2,
    };
  };

  // 双击添加字段到画布中心
  const handleDoubleClick = (fieldPath: string) => {
    const field = findFieldByPath(fieldPath);
    if (!field) return;

    // 禁止 object 类型
    if (field.type === 'object') {
      message.warning('对象类型不可直接添加');
      return;
    }

    // 禁止数组子字段
    if (isArrayChildField(fieldPath)) {
      message.warning('数组子字段请通过拖拽添加到表格');
      return;
    }

    // 计算中心位置
    const centerPos = getCanvasCenter(60, 10);

    // 根据字段类型创建组件（与拖拽逻辑保持完全一致）
    if (field.type === 'array') {
      // 数组类型：创建表格
      const pageWidthMm = pageConfig.size === 'A4' ? 210 : 148;
      const { top, left, right } = pageConfig.marginMm;
      const availableWidth = pageWidthMm - left - right;

      const columns = (field.children || []).map((child) => ({
        title: child.label,
        dataIndex: child.key,
      }));

      const newComponent: ComponentNode = {
        id: `comp-${Date.now()}`,
        type: 'table',
        layout: {
          mode: 'absolute',
          xMm: 0,  // 表格从可用区域最左边开始（与拖拽一致）
          yMm: Math.max(top, centerPos.yMm),  // 使用 top 边距或中心位置的较大值
          widthMm: availableWidth,
          heightMm: 60,
        },
        binding: {
          path: fieldPath,
        },
        style: { fontSize: 12 },
        props: {
          columns: columns,
          bordered: true,
          showHeader: true,
        },
      } as ComponentNode;

      addComponent(newComponent);
      selectComponent(newComponent.id);
      message.success(`已添加表格组件：${field.label}（${columns.length} 列）`);
    } else {
      // 普通字段：创建文本
      const newComponent: ComponentNode = {
        id: `comp-${Date.now()}`,
        type: 'text',
        layout: {
          mode: 'absolute',
          xMm: Math.max(0, centerPos.xMm),
          yMm: Math.max(0, centerPos.yMm),
          widthMm: 60,
          heightMm: 10,
        },
        binding: {
          path: fieldPath,
        },
        style: { fontSize: 14, color: '#262626' },
        props: {
          label: `${field.label}：`,
        },
      } as ComponentNode;

      addComponent(newComponent);
      selectComponent(newComponent.id);
      message.success(`已添加组件：${field.label}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className={styles["asset-header"]}>
        <Select
          value={selectedSchemaId}
          onChange={setSelectedSchemaId}
          style={{ width: '100%', marginBottom: 6 }}
          loading={loading}
          options={schemas.map((s) => ({ value: s.id, label: s.name }))}
          placeholder="选择 Schema"
          size="small"
        />
      </div>
      <div className={styles["asset-tree"]}>
        <Tree
          showIcon
          defaultExpandAll
          blockNode
          treeData={treeData}
          onDoubleClick={(e, node) => {
            if (node.key) {
              handleDoubleClick(node.key as string);
            }
          }}
          draggable={(node) => {
            const field = findFieldByPath(node.key as string);
            if (!field) return false;

            // 禁止 object 类型拖拽
            if (field.type === 'object') return false;

            // 禁止数组子字段拖拽
            if (isArrayChildField(node.key as string)) return false;

            return true;
          }}
          onDragStart={(info) => {
            const event = info.event as any;
            if (event.dataTransfer) {
              const fieldPath = info.node.key as string;
              const field = findFieldByPath(fieldPath);

              event.dataTransfer.setData('fieldPath', fieldPath);
              // 只传递 label，不包含 key
              event.dataTransfer.setData('fieldTitle', field?.label || (info.node.title as string));

              if (field) {
                event.dataTransfer.setData('fieldType', field.type);
                if (field.type === 'array' && field.children) {
                  event.dataTransfer.setData('fieldChildren', JSON.stringify(field.children));
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default DataAsset;
