/**
 * 合计额外行配置区域
 * 负责额外行的增删和数据项管理
 */

import { Button, Input, Select, Space, Tag, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined, CloseOutlined } from '@ant-design/icons';
import styles from '../index.module.css';
import type { ComponentNode, TableColumn, SummaryExtraRow, SummaryExtraRowItem } from '../../../../../types';
import PipeConfigPanel from '../../../../../components/PipeConfigPanel';

const { Text } = Typography;

interface SummaryExtraRowsSectionProps {
  extraRows: SummaryExtraRow[];
  columns: TableColumn[];
  onPropsChange: (field: string, value: any) => void;
  updateComponent: (id: string, updates: Partial<ComponentNode>) => void;
  component: ComponentNode;
}

const SummaryExtraRowsSection: React.FC<SummaryExtraRowsSectionProps> = ({
  extraRows,
  columns,
  onPropsChange,
  updateComponent,
  component,
}) => {
  const handleAddExtraRow = () => {
    onPropsChange('summaryExtraRows', [...extraRows, { items: [{ label: '' }] }]);
  };

  const handleDeleteExtraRow = (rowIndex: number) => {
    const newRows = extraRows.filter((_, i) => i !== rowIndex);
    onPropsChange('summaryExtraRows', newRows.length > 0 ? newRows : undefined);
  };

  const handleExtraRowChange = (rowIndex: number, field: string, value: any) => {
    const newRows = [...extraRows];
    newRows[rowIndex] = { ...newRows[rowIndex], [field]: value };
    onPropsChange('summaryExtraRows', newRows);
  };

  const handleAddExtraRowItem = (rowIndex: number) => {
    const newRows = [...extraRows];
    const items = [...(newRows[rowIndex].items || []), { label: '' }];
    newRows[rowIndex] = { ...newRows[rowIndex], items };
    onPropsChange('summaryExtraRows', newRows);
  };

  const handleDeleteExtraRowItem = (rowIndex: number, itemIndex: number) => {
    const newRows = [...extraRows];
    const items = newRows[rowIndex].items.filter((_, i) => i !== itemIndex);
    newRows[rowIndex] = { ...newRows[rowIndex], items: items.length > 0 ? items : [{ label: '' }] };
    onPropsChange('summaryExtraRows', newRows);
  };

  const handleExtraRowItemChange = (rowIndex: number, itemIndex: number, field: string, value: any) => {
    const newRows = [...extraRows];
    const items = [...newRows[rowIndex].items];
    items[itemIndex] = { ...items[itemIndex], [field]: value };
    newRows[rowIndex] = { ...newRows[rowIndex], items };
    onPropsChange('summaryExtraRows', newRows);
  };

  /** 获取所有列，用于 sourceColumn 下拉 */
  const getAllColumns = () => {
    return (columns || [])
      .filter((col) => !col.hidden)
      .map((col) => ({ label: `${col.title}（${col.dataIndex}）`, value: col.dataIndex }));
  };

  /** sourceColumn 变更时，自动为该列创建合计配置（如果没有） */
  const handleSourceColumnChange = (rowIndex: number, itemIndex: number, dataIndex: string | undefined) => {
    const newRows = [...extraRows];
    const items = [...newRows[rowIndex].items];
    items[itemIndex] = { ...items[itemIndex], sourceColumn: dataIndex };
    newRows[rowIndex] = { ...newRows[rowIndex], items };

    let columnsUpdated = false;
    const newColumns = [...(columns || [])];

    if (dataIndex) {
      const colIndex = newColumns.findIndex((col) => col.dataIndex === dataIndex);
      if (colIndex >= 0 && !newColumns[colIndex].summary?.type) {
        newColumns[colIndex] = {
          ...newColumns[colIndex],
          summary: { type: 'sum', precision: 2 },
        };
        columnsUpdated = true;
      }
    }

    // 一次原子提交，避免 stale closure 导致 sourceColumn 写入被覆盖
    updateComponent(component.id, {
      props: {
        ...component.props,
        summaryExtraRows: newRows,
        ...(columnsUpdated ? { columns: newColumns } : {}),
      },
    });
  };

  return (
    <div className={`${styles["property-item"]} ${styles["property-item-full"]}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text className={styles["property-label"]}>合计额外行</Text>
        <Button
          size="small"
          type="dashed"
          icon={<PlusOutlined />}
          onClick={handleAddExtraRow}
        >
          添加额外行
        </Button>
      </div>
      {extraRows.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {extraRows.map((row: SummaryExtraRow, rowIndex: number) => (
            <div
              key={rowIndex}
              style={{ border: '1px solid #d9d9d9', borderRadius: 4, padding: 8, background: '#fafafa' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Tag color="blue">额外行 {rowIndex + 1}</Tag>
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteExtraRow(rowIndex)}
                />
              </div>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div>
                  <Text className={styles["property-label"]}>对齐方式</Text>
                  <Select
                    size="small"
                    style={{ width: '100%', marginTop: 4 }}
                    value={row.align || 'left'}
                    onChange={(val) => handleExtraRowChange(rowIndex, 'align', val)}
                    options={[
                      { label: '左对齐', value: 'left' },
                      { label: '居中', value: 'center' },
                      { label: '右对齐', value: 'right' },
                    ]}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text className={styles["property-label"]}>数据项</Text>
                    <Button
                      size="small"
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={() => handleAddExtraRowItem(rowIndex)}
                    >
                      添加项
                    </Button>
                  </div>
                  {(row.items || []).map((item: SummaryExtraRowItem, itemIndex: number) => (
                    <div
                      key={itemIndex}
                      style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 6, marginBottom: 4, background: '#fff' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <Tag>项 {itemIndex + 1}</Tag>
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<CloseOutlined />}
                          onClick={() => handleDeleteExtraRowItem(rowIndex, itemIndex)}
                        />
                      </div>
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Input
                          size="small"
                          placeholder="前缀文字（如：金额大写：）"
                          value={item.label || ''}
                          onChange={(e) => handleExtraRowItemChange(rowIndex, itemIndex, 'label', e.target.value)}
                        />
                        <Select
                          size="small"
                          style={{ width: '100%' }}
                          placeholder="引用合计列（可选）"
                          allowClear
                          value={item.sourceColumn || undefined}
                          onChange={(val) => handleSourceColumnChange(rowIndex, itemIndex, val)}
                          options={getAllColumns()}
                        />
                        <PipeConfigPanel
                          pipes={item.pipes}
                          onChange={(newPipes) => {
                            const newRows = [...extraRows];
                            const rowItems = [...newRows[rowIndex].items];
                            rowItems[itemIndex] = {
                              ...rowItems[itemIndex],
                              pipes: newPipes.length > 0 ? newPipes : undefined,
                            };
                            newRows[rowIndex] = { ...newRows[rowIndex], items: rowItems };
                            onPropsChange('summaryExtraRows', newRows);
                          }}
                        />
                      </Space>
                    </div>
                  ))}
                </div>
              </Space>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SummaryExtraRowsSection;
