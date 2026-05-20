/**
 * 表格列管理配置区域
 * 负责表格组件的列配置
 */

import { Checkbox, Button, Space, Input, Typography, Collapse, Select, InputNumber, Radio, Tag, Tooltip } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined, PlusOutlined, CloseOutlined } from '@ant-design/icons';
import styles from './index.module.css';
import type { ComponentNode, TableColumnSummary, SummaryExtraRow, SummaryExtraRowItem } from '../../../../types';
import { getAllPipes, computeColumnMaxWidth } from '@jcyao/print-sdk';
import { getConfigurator } from '../../../../pipes/configurators';
import { useDesignerStore } from '../../../../store/designer';
import { getTableContentWidth } from '../../../../utils/pageSize';

const { Text } = Typography;

interface TableColumnSectionProps {
  component: ComponentNode;
  onPropsChange: (field: string, value: any) => void;
}

const TableColumnSection: React.FC<TableColumnSectionProps> = ({ component, onPropsChange }) => {
  // 从 pageConfig 计算表格可用宽度，与 SDK/Preview 保持一致
  const pageConfig = useDesignerStore(s => s.pageConfig);
  const updateComponent = useDesignerStore(s => s.updateComponent);
  const tableWidthMm = getTableContentWidth(pageConfig, component.layout);

  // 检查列宽总和是否超限（#12），仅统计可见列
  const rowNumberWidth = component.props?.showRowNumber ? (component.props?.rowNumberWidth || 0) : 0;
  const visibleColsForValidation = (component.props?.columns || []).filter((col: any) => !col.hidden);
  const totalAssignedWidth = visibleColsForValidation.reduce(
    (sum: number, col: any) => sum + (col.width || 0), 0
  ) + rowNumberWidth;
  const isWidthOverflow = totalAssignedWidth > tableWidthMm;
  const handleColumnToggle = (index: number, checked: boolean) => {
    const columns = [...(component.props?.columns || [])];
    columns[index] = { ...columns[index], hidden: !checked, width: !checked ? undefined : columns[index].width };
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

  const handleColumnWidthChange = (index: number, width: number | null) => {
    const columns = [...(component.props?.columns || [])];
    columns[index] = { ...columns[index], width: width ?? undefined };
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

  // ========== 合计额外行操作 ==========
  const extraRows: SummaryExtraRow[] = component.props?.summaryExtraRows || [];

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
    return (component.props?.columns || [])
      .filter((col: any) => !col.hidden)
      .map((col: any) => ({ label: `${col.title}（${col.dataIndex}）`, value: col.dataIndex }));
  };

  /** sourceColumn 变更时，自动为该列创建合计配置（如果没有） */
  const handleSourceColumnChange = (rowIndex: number, itemIndex: number, dataIndex: string | undefined) => {
    const newRows = [...extraRows];
    const items = [...newRows[rowIndex].items];
    items[itemIndex] = { ...items[itemIndex], sourceColumn: dataIndex };
    newRows[rowIndex] = { ...newRows[rowIndex], items };

    let columnsUpdated = false;
    const columns = [...(component.props?.columns || [])];

    if (dataIndex) {
      const colIndex = columns.findIndex((col: any) => col.dataIndex === dataIndex);
      if (colIndex >= 0 && !columns[colIndex].summary?.type) {
        columns[colIndex] = {
          ...columns[colIndex],
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
        ...(columnsUpdated ? { columns } : {}),
      },
    });
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
          {component.props?.bordered !== false && (
            <>
              <Select
                size="small"
                style={{ width: 100, marginTop: 8 }}
                value={component.props?.borderStyle ?? 'solid'}
                onChange={(v) => onPropsChange('borderStyle', v)}
                options={[
                  { label: '实线', value: 'solid' },
                  { label: '虚线', value: 'dashed' },
                ]}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <input
                  type="color"
                  value={component.props?.borderColor ?? '#d9d9d9'}
                  onChange={(e) => onPropsChange('borderColor', e.target.value)}
                  style={{ width: 28, height: 28, border: '1px solid #d9d9d9', borderRadius: 4, padding: 2, cursor: 'pointer' }}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>颜色</Text>
                <InputNumber
                  size="small"
                  style={{ width: 72 }}
                  min={1}
                  max={5}
                  step={1}
                  precision={0}
                  value={component.props?.borderWidth ?? 1}
                  onChange={(v) => onPropsChange('borderWidth', v)}
                  suffix="px"
                />
                <Text type="secondary" style={{ fontSize: 12 }}>粗细</Text>
              </div>
            </>
          )}
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
            <div className={styles["property-item"]}>
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
                          <Text type="secondary" style={{ fontSize: 12 }}>对齐方式</Text>
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
                            <Text type="secondary" style={{ fontSize: 12 }}>数据项</Text>
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
                                <div>
                                  <Text type="secondary" style={{ fontSize: 12 }}>管道转换</Text>
                                  {item.pipes?.[0] ? (
                                    <div style={{ marginTop: 4, border: '1px solid #d9d9d9', borderRadius: 4, padding: 8, background: '#fafafa' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <Tag color="blue">{item.pipes[0].type}</Tag>
                                        <Button
                                          type="text"
                                          size="small"
                                          danger
                                          icon={<CloseOutlined />}
                                          onClick={() => handleExtraRowItemChange(rowIndex, itemIndex, 'pipes', undefined)}
                                        />
                                      </div>
                                      {(() => {
                                        const configurator = getConfigurator(item.pipes[0].type);
                                        if (configurator) {
                                          return configurator.renderConfig(
                                            item.pipes[0],
                                            (option: string, value: any) => {
                                              const newRows = [...extraRows];
                                              const items = [...newRows[rowIndex].items];
                                              const currentPipe = items[itemIndex].pipes?.[0];
                                              if (currentPipe) {
                                                items[itemIndex] = {
                                                  ...items[itemIndex],
                                                  pipes: [{
                                                    type: currentPipe.type,
                                                    options: { ...currentPipe.options, [option]: value },
                                                  }],
                                                };
                                                newRows[rowIndex] = { ...newRows[rowIndex], items };
                                                onPropsChange('summaryExtraRows', newRows);
                                              }
                                            },
                                          );
                                        }
                                        return null;
                                      })()}
                                    </div>
                                  ) : (
                                    <Select
                                      size="small"
                                      style={{ width: '100%', marginTop: 4 }}
                                      placeholder="添加管道转换（可选）"
                                      value={null}
                                      onChange={(val: string) => handleExtraRowItemChange(rowIndex, itemIndex, 'pipes', [{ type: val, options: {} }])}
                                      options={getAllPipes().filter((p) => p.value === 'chineseNumber' || p.value === 'money')}
                                    />
                                  )}
                                </div>
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
          </>
        )}
        <div className={styles["property-item"]}>
          <Checkbox
            checked={component.props?.showRowNumber === true}
            onChange={(e) => onPropsChange('showRowNumber', e.target.checked)}
          >
            显示序号列
          </Checkbox>
        </div>
        {component.props?.showRowNumber && (
          <>
            <div className={styles["property-item"]}>
              <Text className={styles["property-label"]}>序号列标题</Text>
              <Input
                size="small"
                placeholder="默认：序号"
                value={component.props?.rowNumberLabel || ''}
                onChange={(e) => onPropsChange('rowNumberLabel', e.target.value)}
              />
            </div>
            <div className={styles["property-item"]}>
              <Text className={styles["property-label"]}>序号列宽度 (mm)</Text>
              <InputNumber
                size="small"
                style={{ width: '100%' }}
                min={1}
                placeholder="自动"
                suffix="mm"
                value={component.props?.rowNumberWidth}
                onChange={(v) => onPropsChange('rowNumberWidth', v ?? undefined)}
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
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>宽度 (mm)</Text>
                    <Tooltip
                      title={isWidthOverflow ? `列宽总和 ${totalAssignedWidth.toFixed(1)}mm 超过表格宽度 ${tableWidthMm.toFixed(1)}mm` : undefined}
                      open={isWidthOverflow ? undefined : false}
                    >
                      <InputNumber
                        size="small"
                        style={{ width: '100%', marginTop: 4 }}
                        min={1}
                        disabled={col.hidden}
                        max={computeColumnMaxWidth(
                          visibleColsForValidation,
                          visibleColsForValidation.findIndex((c: any) => c.dataIndex === col.dataIndex),
                          tableWidthMm,
                          component.props?.showRowNumber ? (component.props?.rowNumberWidth || 0) : 0
                        )}
                        status={isWidthOverflow ? 'error' : undefined}
                        placeholder="自动"
                        suffix="mm"
                        value={col.width}
                        onChange={(v) => handleColumnWidthChange(index, v)}
                      />
                    </Tooltip>
                  </div>
                  {component.props?.showSummary && (
                    <Collapse
                      size="small"
                      ghost
                      style={{ marginTop: 4 }}
                      defaultActiveKey={col.summary?.type ? ['summary'] : []}
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
                                    <Text type="secondary" style={{ fontSize: 12 }}>管道转换</Text>
                                    {col.summary?.pipe ? (
                                      <div style={{ marginTop: 4, border: '1px solid #d9d9d9', borderRadius: 4, padding: 8, background: '#fafafa' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                          <Tag color="blue">{col.summary.pipe.type}</Tag>
                                          <Button
                                            type="text"
                                            size="small"
                                            danger
                                            icon={<CloseOutlined />}
                                            onClick={() => {
                                              handleColumnSummaryChange(index, {
                                                ...col.summary!,
                                                pipe: undefined,
                                              });
                                            }}
                                          />
                                        </div>
                                        {(() => {
                                          const configurator = getConfigurator(col.summary.pipe.type);
                                          if (configurator) {
                                            return configurator.renderConfig(
                                              col.summary.pipe,
                                              (option: string, value: any) => {
                                                handleColumnSummaryChange(index, {
                                                  ...col.summary!,
                                                  pipe: {
                                                    type: col.summary!.pipe!.type,
                                                    options: {
                                                      ...col.summary!.pipe!.options,
                                                      [option]: value,
                                                    },
                                                  },
                                                });
                                              },
                                            );
                                          }
                                          return null;
                                        })()}
                                      </div>
                                    ) : (
                                      <Select
                                        size="small"
                                        style={{ width: '100%', marginTop: 4 }}
                                        placeholder="添加管道转换（可选）"
                                        value={null}
                                        onChange={(value: string) => {
                                          handleColumnSummaryChange(index, {
                                            ...col.summary!,
                                            pipe: { type: value, options: {} },
                                          });
                                        }}
                                        options={getAllPipes().filter((p) => p.value === 'money' || p.value === 'chineseNumber')}
                                      />
                                    )}
                                  </div>
                                  {!col.summary?.pipe && (
                                    <>
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
