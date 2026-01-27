/**
 * 表格列管理配置区域
 * 负责表格组件的列配置
 */

import { Checkbox, Button, Space, Input, Typography, Collapse, Select, InputNumber, Radio } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import styles from './index.module.css';
import type { ComponentNode, TableColumnSummary } from '../../../../types';

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

  // 处理列合计配置
  const handleColumnSummaryChange = (index: number, summary: TableColumnSummary | undefined) => {
    const columns = [...(component.props?.columns || [])];
    columns[index] = { ...columns[index], summary };
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
        <div className={styles["property-item"]}>
          <Checkbox
            checked={component.props?.showSummary === true}
            onChange={(e) => onPropsChange('showSummary', e.target.checked)}
          >
            显示合计行
          </Checkbox>
        </div>
        {component.props?.showSummary && (
          <>
            <div className={styles["property-item"]}>
              <Text className={styles["property-label"]}>合计模式</Text>
              <Radio.Group
                size="small"
                value={component.props?.summaryMode || 'total'}
                onChange={(e) => onPropsChange('summaryMode', e.target.value)}
              >
                <Radio.Button value="total">总计（最后一页）</Radio.Button>
                <Radio.Button value="page">分页合计</Radio.Button>
              </Radio.Group>
            </div>
            <div className={styles["property-item"]}>
              <Text className={styles["property-label"]}>合计标签</Text>
              <Input
                size="small"
                placeholder="默认：合计"
                value={component.props?.summaryLabel || ''}
                onChange={(e) => onPropsChange('summaryLabel', e.target.value)}
              />
            </div>
          </>
        )}
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
                  {component.props?.showSummary && (
                    <Collapse
                      size="small"
                      ghost
                      style={{ marginTop: 4 }}
                      items={[
                        {
                          key: 'summary',
                          label: <Text type="secondary" style={{ fontSize: 12 }}>合计配置</Text>,
                          children: (
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                              <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>聚合类型</Text>
                                <Select
                                  size="small"
                                  style={{ width: '100%', marginTop: 4 }}
                                  placeholder="选择聚合类型"
                                  allowClear
                                  value={col.summary?.type}
                                  onChange={(value) => {
                                    if (!value) {
                                      handleColumnSummaryChange(index, undefined);
                                    } else {
                                      handleColumnSummaryChange(index, {
                                        ...col.summary,
                                        type: value,
                                      });
                                    }
                                  }}
                                  options={[
                                    { label: '求和 (SUM)', value: 'sum' },
                                    { label: '平均 (AVG)', value: 'avg' },
                                    { label: '最大 (MAX)', value: 'max' },
                                    { label: '最小 (MIN)', value: 'min' },
                                    { label: '计数 (COUNT)', value: 'count' },
                                  ]}
                                />
                              </div>
                              {col.summary?.type && (
                                <>
                                  <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>小数位数</Text>
                                    <InputNumber
                                      size="small"
                                      style={{ width: '100%', marginTop: 4 }}
                                      min={0}
                                      max={10}
                                      placeholder="默认：2"
                                      value={col.summary?.precision ?? 2}
                                      onChange={(value) => {
                                        handleColumnSummaryChange(index, {
                                          ...col.summary!,
                                          precision: value ?? 2,
                                        });
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>前缀/后缀</Text>
                                    <Space.Compact style={{ width: '100%', marginTop: 4 }}>
                                      <Input
                                        size="small"
                                        placeholder="前缀（如￥）"
                                        value={col.summary?.prefix || ''}
                                        onChange={(e) => {
                                          handleColumnSummaryChange(index, {
                                            ...col.summary!,
                                            prefix: e.target.value,
                                          });
                                        }}
                                      />
                                      <Input
                                        size="small"
                                        placeholder="后缀（如元）"
                                        value={col.summary?.suffix || ''}
                                        onChange={(e) => {
                                          handleColumnSummaryChange(index, {
                                            ...col.summary!,
                                            suffix: e.target.value,
                                          });
                                        }}
                                      />
                                    </Space.Compact>
                                  </div>
                                </>
                              )}
                            </Space>
                          ),
                        },
                      ]}
                    />
                  )}
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
