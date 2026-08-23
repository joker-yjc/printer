/**
 * 表格分组配置区域
 * 负责表格的分组展示、标题/小计样式等
 * @module TableGroupSection
 */

import { Checkbox, Input, Select, Typography, InputNumber, Tag, Button } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './index.module.css';
import type { ComponentNode, TableColumn, TableGroupConfig, GroupSummaryItem, PipeConfig, TableSummaryStyle } from '../../../../types';
import PipeConfigPanel from '../../../../components/PipeConfigPanel';

const { Text } = Typography;

/** 分组卡片容器样式（与合计额外行卡片保持一致，内部两列排布样式项） */
const groupCardStyle: React.CSSProperties = {
  border: '1px solid #d9d9d9',
  borderRadius: 4,
  padding: 8,
  background: '#fafafa',
  gridColumn: 'span 2',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '8px 12px',
  alignItems: 'start',
};

interface TableGroupSectionProps {
  component: ComponentNode;
  onPropsChange: (field: string, value: any) => void;
  updateComponent: (id: string, updates: Partial<ComponentNode>) => void;
}

/**
 * 表格分组配置面板
 * 按"标题在上、小计在下"分区，首版不含排序
 * @param props - 组件属性
 * @returns 分组配置面板
 */
const TableGroupSection: React.FC<TableGroupSectionProps> = ({ component, onPropsChange, updateComponent }) => {
  if (component.type !== 'table') return null;

  const groupBy: TableGroupConfig | undefined = component.props?.groupBy;
  // 启用状态以 groupBy 对象是否存在为准（初始 field 为空字符串时仍视为已启用）
  const enabled = !!groupBy;

  const handleToggle = (checked: boolean) => {
    if (checked) {
      onPropsChange('groupBy', { field: '', showHeader: true, showSummary: true });
    } else {
      onPropsChange('groupBy', undefined);
    }
  };

  const updateGroupBy = (patch: Partial<TableGroupConfig>) => {
    if (!groupBy) return;
    onPropsChange('groupBy', { ...groupBy, ...patch });
  };

  const handleFieldChange = (val: string) => {
    updateGroupBy({ field: val });
  };

  const handlePipesChange = (pipes: PipeConfig[]) => {
    updateGroupBy({ pipes: pipes.length > 0 ? pipes : undefined });
  };

  const handleStyleChange = (styleKey: 'headerStyle' | 'summaryStyle', field: keyof TableSummaryStyle, value: any) => {
    const current = (groupBy as any)?.[styleKey] || {};
    const shouldRemove = value === undefined || value === null || value === '';
    const next = shouldRemove
      ? (() => { const { [field]: _, ...rest } = current; return Object.keys(rest).length > 0 ? rest : undefined; })()
      : { ...current, [field]: value };
    updateGroupBy({ [styleKey]: next } as any);
  };

  const columns: TableColumn[] = component.props?.columns || [];
  const summaryColumnOptions = columns.map(c => ({ label: `${c.title} (${c.dataIndex})`, value: c.dataIndex }));

  // ── 小计数据项（summaryItems）管理 ──
  const summaryItems: GroupSummaryItem[] = groupBy?.summaryItems || [];

  /** 添加小计数据项：默认引用第一个配置了合计的列 */
  const handleAddSummaryItem = () => {
    const defaultCol = columns.find(c => c.summary) || columns[0];
    // 无列可引用时不添加脏项（sourceColumn 为空字符串会导致渲染端跳过且无法补合计）
    if (!defaultCol?.dataIndex) return;
    updateGroupBy({
      summaryItems: [...summaryItems, { sourceColumn: defaultCol.dataIndex }],
    });
  };

  /** 删除小计数据项 */
  const handleRemoveSummaryItem = (index: number) => {
    const next = summaryItems.filter((_, i) => i !== index);
    updateGroupBy({ summaryItems: next.length > 0 ? next : undefined });
  };

  /** 更新单个数据项字段（sourceColumn / label / pipes） */
  const handleSummaryItemChange = (index: number, patch: Partial<GroupSummaryItem>) => {
    const next = [...summaryItems];
    next[index] = { ...next[index], ...patch };
    updateGroupBy({ summaryItems: next });
  };

  /** 引用列变更时，若该列未配合计则自动补 sum 合计（与额外行行为一致） */
  const handleSummaryItemSourceChange = (index: number, dataIndex: string | undefined) => {
    if (!dataIndex) return;
    const nextItems = [...summaryItems];
    nextItems[index] = { ...nextItems[index], sourceColumn: dataIndex };

    let columnsUpdated = false;
    const newColumns = [...columns];
    const colIdx = newColumns.findIndex(c => c.dataIndex === dataIndex);
    if (colIdx >= 0 && !newColumns[colIdx].summary?.type) {
      newColumns[colIdx] = { ...newColumns[colIdx], summary: { type: 'sum', precision: 2 } };
      columnsUpdated = true;
    }

    // 原子提交：一次 updateComponent 同时写 groupBy 与 columns，避免快照覆盖
    updateComponent(component.id, {
      props: {
        ...component.props,
        groupBy: { ...groupBy, summaryItems: nextItems },
        ...(columnsUpdated ? { columns: newColumns } : {}),
      },
    });
  };

  return (
    <div className={styles["property-section"]}>
      <div className={styles["property-title"]}>表格分组</div>
      <div className={styles["property-list"]}>
        {/* 启用分组 */}
        <div className={`${styles["property-item"]} ${styles["property-item-full"]}`}>
          <Checkbox checked={enabled} onChange={(e) => handleToggle(e.target.checked)}>
            启用分组
          </Checkbox>
        </div>

        {/* 基础：分组字段 */}
        {enabled && (
          <div className={`${styles["property-item"]} ${styles["property-item-full"]}`}>
            <Text className={styles["property-label"]}>分组字段</Text>
            <Input
              size="small"
              placeholder="如 category 或 product.type"
              value={groupBy.field}
              onChange={(e) => handleFieldChange(e.target.value)}
            />
            {columns.length > 0 && (
              <Select
                size="small"
                style={{ width: '100%' }}
                placeholder="快捷选择列字段"
                allowClear
                value={undefined}
                onChange={(val) => val && handleFieldChange(val)}
                options={summaryColumnOptions}
              />
            )}
          </div>
        )}

        {/* 分组标题区 */}
        {enabled && (
          <div style={groupCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gridColumn: 'span 2' }}>
              <Tag color="blue">分组标题</Tag>
              <Checkbox checked={groupBy.showHeader !== false} onChange={(e) => updateGroupBy({ showHeader: e.target.checked })}>
                显示
              </Checkbox>
            </div>
            <div className={`${styles["property-item"]} ${styles["property-item-full"]}`}>
              <Text className={styles["property-label"]}>字段值转换</Text>
              <PipeConfigPanel pipes={groupBy.pipes} onChange={handlePipesChange} />
            </div>
            <div className={`${styles["property-item"]} ${styles["property-item-full"]}`}>
              <Text className={styles["property-label"]}>默认分组标题</Text>
              <Input size="small" placeholder="默认 未分组" value={groupBy.emptyGroupLabel || ''} onChange={(e) => updateGroupBy({ emptyGroupLabel: e.target.value || undefined })} />
            </div>
            <div className={styles["property-item"]}>
              <Text className={styles["property-label"]}>背景色</Text>
              <input type="color" value={groupBy.headerStyle?.backgroundColor || '#f5f5f5'} onChange={(e) => handleStyleChange('headerStyle', 'backgroundColor', e.target.value)} style={{ width: '100%', height: 32, border: '1px solid #d9d9d9', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
            </div>
            <div className={styles["property-item"]}>
              <Text className={styles["property-label"]}>字重</Text>
              <Select size="small" style={{ width: '100%' }} value={groupBy.headerStyle?.fontWeight || 'bold'} onChange={(v) => handleStyleChange('headerStyle', 'fontWeight', v)} options={[{ label: '正常', value: 'normal' }, { label: '加粗', value: 'bold' }]} />
            </div>
            <div className={styles["property-item"]}>
              <Text className={styles["property-label"]}>字号</Text>
              <InputNumber size="small" style={{ width: '100%' }} min={10} max={24} value={groupBy.headerStyle?.fontSize} placeholder="默认" onChange={(v) => handleStyleChange('headerStyle', 'fontSize', v)} />
            </div>
            <div className={styles["property-item"]}>
              <Text className={styles["property-label"]}>对齐</Text>
              <Select size="small" style={{ width: '100%' }} value={groupBy.headerStyle?.textAlign || 'left'} onChange={(v) => handleStyleChange('headerStyle', 'textAlign', v)} options={[{ label: '左对齐', value: 'left' }, { label: '居中', value: 'center' }, { label: '右对齐', value: 'right' }]} />
            </div>
          </div>
        )}

        {/* 分组小计区 */}
        {enabled && (
          <div style={groupCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gridColumn: 'span 2' }}>
              <Tag color="blue">分组小计</Tag>
              <Checkbox checked={groupBy.showSummary !== false} onChange={(e) => updateGroupBy({ showSummary: e.target.checked })}>
                显示
              </Checkbox>
            </div>
            <div className={`${styles["property-item"]} ${styles["property-item-full"]}`}>
              <Text className={styles["property-label"]}>小计标签</Text>
              <Input size="small" placeholder="默认 {group}小计" value={groupBy.summaryLabel || ''} onChange={(e) => updateGroupBy({ summaryLabel: e.target.value || undefined })} />
            </div>
            <div className={styles["property-item"]}>
              <Text className={styles["property-label"]}>背景色</Text>
              <input type="color" value={groupBy.summaryStyle?.backgroundColor || '#f5f5f5'} onChange={(e) => handleStyleChange('summaryStyle', 'backgroundColor', e.target.value)} style={{ width: '100%', height: 32, border: '1px solid #d9d9d9', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
            </div>
            <div className={styles["property-item"]}>
              <Text className={styles["property-label"]}>字重</Text>
              <Select size="small" style={{ width: '100%' }} value={groupBy.summaryStyle?.fontWeight || 'bold'} onChange={(v) => handleStyleChange('summaryStyle', 'fontWeight', v)} options={[{ label: '正常', value: 'normal' }, { label: '加粗', value: 'bold' }]} />
            </div>
            <div className={styles["property-item"]}>
              <Text className={styles["property-label"]}>字号</Text>
              <InputNumber size="small" style={{ width: '100%' }} min={10} max={24} value={groupBy.summaryStyle?.fontSize} placeholder="默认" onChange={(v) => handleStyleChange('summaryStyle', 'fontSize', v)} />
            </div>
            <div className={styles["property-item"]}>
              <Text className={styles["property-label"]}>对齐</Text>
              <Select size="small" style={{ width: '100%' }} value={groupBy.summaryStyle?.textAlign || 'left'} onChange={(v) => handleStyleChange('summaryStyle', 'textAlign', v)} options={[{ label: '左对齐', value: 'left' }, { label: '居中', value: 'center' }, { label: '右对齐', value: 'right' }]} />
            </div>
            <div className={`${styles["property-item"]} ${styles["property-item-full"]}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text className={styles["property-label"]}>小计数据项</Text>
                <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={handleAddSummaryItem}>
                  添加项
                </Button>
              </div>
              {summaryItems.length === 0 && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  未添加数据项时仅显示标签，不做数据汇总
                </Text>
              )}
              {summaryItems.map((item, idx) => (
                <div key={idx} style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 6, marginBottom: 4, background: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Tag>项 {idx + 1}</Tag>
                    <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleRemoveSummaryItem(idx)} />
                  </div>
                  <Select
                    size="small"
                    style={{ width: '100%', marginBottom: 4 }}
                    placeholder="引用合计列"
                    value={item.sourceColumn || undefined}
                    onChange={(val) => handleSummaryItemSourceChange(idx, val)}
                    options={summaryColumnOptions}
                  />
                  <Input
                    size="small"
                    placeholder="前缀文字（如：金额：）"
                    value={item.label || ''}
                    onChange={(e) => handleSummaryItemChange(idx, { label: e.target.value || undefined })}
                    style={{ marginBottom: 4 }}
                  />
                  <PipeConfigPanel
                    pipes={item.pipes}
                    onChange={(newPipes) => handleSummaryItemChange(idx, { pipes: newPipes.length > 0 ? newPipes : undefined })}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableGroupSection;
