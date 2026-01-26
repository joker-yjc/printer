/**
 * 表格列管理配置区域
 * 负责表格组件的列配置
 */

import { Checkbox, Button, Space, Input, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import styles from './index.module.css';
import type { ComponentNode } from '../../../../types';

const { Text } = Typography;

interface TableColumnSectionProps {
  component: ComponentNode;
  onPropsChange: (field: string, value: any) => void;
}

const TableColumnSection: React.FC<TableColumnSectionProps> = ({ component, onPropsChange }) => {
  const handleColumnToggle = (index: number, checked: boolean) => {
    const columns = [...(component.props?.columns || [])];
    columns[index] = { ...columns[index], hidden: !checked };
    onPropsChange('columns', columns);
  };

  const handleColumnMove = (index: number, direction: 'up' | 'down') => {
    const columns = [...(component.props?.columns || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= columns.length) return;
    [columns[index], columns[targetIndex]] = [columns[targetIndex], columns[index]];
    onPropsChange('columns', columns);
  };

  const handleColumnTitleChange = (index: number, title: string) => {
    const columns = [...(component.props?.columns || [])];
    columns[index] = { ...columns[index], title };
    onPropsChange('columns', columns);
  };

  const handleColumnDataIndexChange = (index: number, dataIndex: string) => {
    const columns = [...(component.props?.columns || [])];
    columns[index] = { ...columns[index], dataIndex };
    onPropsChange('columns', columns);
  };

  const handleAddColumn = () => {
    const columns = [...(component.props?.columns || [])];
    const newColumn = {
      title: `列${columns.length + 1}`,
      dataIndex: `col${columns.length + 1}`,
    };
    onPropsChange('columns', [...columns, newColumn]);
  };

  const handleDeleteColumn = (index: number) => {
    const columns = [...(component.props?.columns || [])];
    columns.splice(index, 1);
    onPropsChange('columns', columns);
  };

  // 仅在表格组件且有列配置时显示
  if (component.type !== 'table' || !component.props?.columns) {
    return null;
  }

  return (
    <div className={styles["property-section"]}>
      <div className={styles["property-title"]}>📋 表格列管理</div>
      <div className={styles["property-list"]}>
        <div className={styles["property-item"]}>
          <Checkbox
            checked={component.props?.showHeader !== false}
            onChange={(e) => onPropsChange('showHeader', e.target.checked)}
          >
            显示表头
          </Checkbox>
        </div>
        <div className={styles["property-item"]}>
          <Checkbox
            checked={component.props?.bordered !== false}
            onChange={(e) => onPropsChange('bordered', e.target.checked)}
          >
            显示边框
          </Checkbox>
        </div>
        <div className={styles["property-item"]} style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text className={styles["property-label"]}>列配置</Text>
            <Button
              size="small"
              type="dashed"
              icon={<PlusOutlined />}
              onClick={handleAddColumn}
            >
              添加列
            </Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {component.props.columns.map((col: any, index: number) => (
              <div
                key={index}
                style={{
                  border: '1px solid #d9d9d9',
                  borderRadius: 4,
                  padding: 8,
                  background: col.hidden ? '#f5f5f5' : '#fff',
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Checkbox
                      checked={!col.hidden}
                      onChange={(e) => handleColumnToggle(index, e.target.checked)}
                    >
                      <Text strong>{col.dataIndex}</Text>
                    </Checkbox>
                    <Space size="small">
                      <Button
                        type="text"
                        size="small"
                        icon={<ArrowUpOutlined />}
                        disabled={index === 0}
                        onClick={() => handleColumnMove(index, 'up')}
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={<ArrowDownOutlined />}
                        disabled={index === (component.props?.columns?.length || 0) - 1}
                        onClick={() => handleColumnMove(index, 'down')}
                      />
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteColumn(index)}
                      />
                    </Space>
                  </Space>
                  <Input
                    size="small"
                    placeholder="列标题"
                    value={col.title}
                    disabled={col.hidden}
                    onChange={(e) => handleColumnTitleChange(index, e.target.value)}
                  />
                  <Input
                    size="small"
                    placeholder="数据字段名 (dataIndex)"
                    value={col.dataIndex}
                    disabled={col.hidden}
                    onChange={(e) => handleColumnDataIndexChange(index, e.target.value)}
                  />
                </Space>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableColumnSection;
