/**
 * 表格列管理配置区域
 * 负责表格组件的列配置，拆分为子组件保持可维护性
 */

import { Checkbox, Button, Typography, Select, InputNumber, Radio, Tooltip, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import styles from './index.module.css';
import type { ComponentNode, TableColumn, TableColumnSummary, TableColumnStyle, PipeConfig } from '../../../../types';
import { useDesignerStore } from '../../../../store/designer';
import { getTableContentWidth } from '../../../../utils/pageSize';
import ColumnConfigCard from './components/ColumnConfigCard';
import SummaryExtraRowsSection from './components/SummaryExtraRowsSection';
import RowNumberStyleSection from './components/RowNumberStyleSection';

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
  const visibleColsForValidation = (component.props?.columns || []).filter((col: TableColumn) => !col.hidden);
  const totalAssignedWidth = visibleColsForValidation.reduce(
    (sum: number, col: TableColumn) => sum + (col.width || 0), 0
  ) + rowNumberWidth;
  const isWidthOverflow = totalAssignedWidth > tableWidthMm;

  const handleColumnToggle = (index: number, checked: boolean) => {
    const columns = [...(component.props?.columns || [])] as TableColumn[];
    columns[index] = { ...columns[index], hidden: !checked, width: !checked ? undefined : columns[index].width };
    onPropsChange('columns', columns);
  };

  const handleColumnMove = (index: number, direction: 'up' | 'down') => {
    const columns = [...(component.props?.columns || [])] as TableColumn[];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= columns.length) return;
    [columns[index], columns[targetIndex]] = [columns[targetIndex], columns[index]];
    onPropsChange('columns', columns);
  };

  const handleColumnTitleChange = (index: number, title: string) => {
    const columns = [...(component.props?.columns || [])] as TableColumn[];
    columns[index] = { ...columns[index], title };
    onPropsChange('columns', columns);
  };

  const handleColumnDataIndexChange = (index: number, dataIndex: string) => {
    const columns = [...(component.props?.columns || [])] as TableColumn[];
    columns[index] = { ...columns[index], dataIndex };
    onPropsChange('columns', columns);
  };

  const handleColumnWidthChange = (index: number, width: number | null) => {
    const columns = [...(component.props?.columns || [])] as TableColumn[];
    columns[index] = { ...columns[index], width: width ?? undefined };
    onPropsChange('columns', columns);
  };

  // 处理列合计配置
  const handleColumnSummaryChange = (index: number, summary: TableColumnSummary | undefined) => {
    const columns = [...(component.props?.columns || [])] as TableColumn[];
    columns[index] = { ...columns[index], summary };
    onPropsChange('columns', columns);
  };

  // 处理列管道配置
  const handleColumnPipesChange = (index: number, pipes: PipeConfig[]) => {
    const columns = [...(component.props?.columns || [])] as TableColumn[];
    columns[index] = { ...columns[index], pipes: pipes.length > 0 ? pipes : undefined };
    onPropsChange('columns', columns);
  };

  const handleAddColumn = () => {
    const columns = [...(component.props?.columns || [])] as TableColumn[];
    const newColumn = {
      title: `列${columns.length + 1}`,
      dataIndex: `col${columns.length + 1}`,
    };
    onPropsChange('columns', [...columns, newColumn]);
  };

  const handleDeleteColumn = (index: number) => {
    const columns = [...(component.props?.columns || [])] as TableColumn[];
    columns.splice(index, 1);
    onPropsChange('columns', columns);
  };

  /** 更新列的 style 属性 */
  const handleColumnStyleChange = (index: number, field: keyof TableColumnStyle, value: any) => {
    const columns = [...(component.props?.columns || [])] as TableColumn[];
    const shouldRemove = value === undefined || value === null || value === '';
    columns[index] = {
      ...columns[index],
      style: shouldRemove
        ? (() => { const { [field]: _, ...rest } = (columns[index].style || {}); return Object.keys(rest).length > 0 ? rest : undefined; })()
        : { ...columns[index].style, [field]: value },
    };
    onPropsChange('columns', columns);
  };

  /** 更新列的 headerStyle 属性 */
  const handleColumnHeaderStyleChange = (index: number, field: keyof TableColumnStyle, value: any) => {
    const columns = [...(component.props?.columns || [])] as TableColumn[];
    const shouldRemove = value === undefined || value === null || value === '';
    columns[index] = {
      ...columns[index],
      headerStyle: shouldRemove
        ? (() => { const { [field]: _, ...rest } = (columns[index].headerStyle || {}); return Object.keys(rest).length > 0 ? rest : undefined; })()
        : { ...columns[index].headerStyle, [field]: value },
    };
    onPropsChange('columns', columns);
  };

  /** 更新 TableProps 中的样式对象 */
  const handleTableStyleChange = (propKey: string, field: string, value: any) => {
    const currentStyle = component.props?.[propKey] || {};
    const shouldRemove = value === undefined || value === null || value === '';
    const newStyle = shouldRemove
      ? (() => { const { [field]: _, ...rest } = currentStyle; return Object.keys(rest).length > 0 ? rest : undefined; })()
      : { ...currentStyle, [field]: value };
    onPropsChange(propKey, newStyle);
  };

  /** 清除列 style 中的某个字段（恢复继承） */
  const clearColumnStyleField = (index: number, field: keyof TableColumnStyle) => {
    const columns = [...(component.props?.columns || [])] as TableColumn[];
    const { [field]: _, ...rest } = (columns[index].style || {});
    columns[index] = { ...columns[index], style: Object.keys(rest).length > 0 ? rest : undefined };
    onPropsChange('columns', columns);
  };

  /** 清除列 headerStyle 中的某个字段（恢复继承） */
  const clearColumnHeaderStyleField = (index: number, field: keyof TableColumnStyle) => {
    const columns = [...(component.props?.columns || [])] as TableColumn[];
    const { [field]: _, ...rest } = (columns[index].headerStyle || {});
    columns[index] = { ...columns[index], headerStyle: Object.keys(rest).length > 0 ? rest : undefined };
    onPropsChange('columns', columns);
  };

  /** 清除 TableProps 样式对象中的某个字段（恢复继承） */
  const clearTableStyleField = (propKey: string, field: string) => {
    const currentStyle = component.props?.[propKey] || {};
    const { [field]: _, ...rest } = currentStyle;
    onPropsChange(propKey, Object.keys(rest).length > 0 ? rest : undefined);
  };

  // 仅在表格组件且有列配置时显示
  if (component.type !== 'table' || !component.props?.columns) {
    return null;
  }

  // 解析合计行显示模式（向后兼容 showSummary）
  const summaryDisplay = component.props?.summaryDisplay ?? (component.props?.showSummary ? 'both' : 'none');
  const extraRows = component.props?.summaryExtraRows || [];

  return (
    <div className={styles["property-section"]}>
      <div className={styles["property-title"]}>📋 表格列管理</div>
      <div className={styles["property-list"]}>
        {/* 表格风格 */}
        <div className={`${styles["property-item"]} ${styles["property-item-full"]}`}>
          <Text className={styles["property-label"]}>表格风格</Text>
          <Radio.Group
            size="small"
            value={component.props?.density || 'normal'}
            onChange={(e) => onPropsChange('density', e.target.value)}
          >
            <Radio.Button value="normal">标准</Radio.Button>
            <Radio.Button value="compact">紧凑</Radio.Button>
          </Radio.Group>
        </div>

        {/* 显示表头 */}
        <div className={`${styles["property-item"]} ${styles["property-item-full"]}`}>
          <Checkbox
            checked={component.props?.showHeader !== false}
            onChange={(e) => {
              const checked = e.target.checked;
              // 联动：取消"显示表头"时同步取消"跨页重复表头"
              // 必须一次性 updateComponent 写入，避免 props 快照覆盖问题
              if (!checked) {
                updateComponent(component.id, {
                  props: {
                    ...component.props,
                    showHeader: false,
                    repeatHeader: false,
                  },
                });
              } else {
                onPropsChange('showHeader', true);
              }
            }}
          >
            显示表头
          </Checkbox>
        </div>

        {/* 跨页重复表头 */}
        <div className={`${styles["property-item"]} ${styles["property-item-full"]}`}>
          <Tooltip
            title={component.props?.showHeader === false ? '未启用表头时此项无效' : ''}
            placement="top"
          >
            <Checkbox
              checked={component.props?.showHeader !== false && component.props?.repeatHeader !== false}
              onChange={(e) => onPropsChange('repeatHeader', e.target.checked)}
              disabled={component.props?.showHeader === false}
            >
              跨页重复表头
            </Checkbox>
          </Tooltip>
        </div>

        {/* 显示边框 */}
        <div className={`${styles["property-item"]} ${styles["property-item-full"]}`}>
          <Checkbox
            checked={component.props?.bordered !== false}
            onChange={(e) => onPropsChange('bordered', e.target.checked)}
          >
            显示边框
          </Checkbox>
          {component.props?.bordered !== false && (
            <div className={styles["property-list"]} style={{ padding: 0, marginTop: 8 }}>
              <div className={styles["property-item"]}>
                <Text className={styles["property-label"]}>线条样式</Text>
                <Select
                  size="small"
                  style={{ width: '100%' }}
                  value={component.props?.borderStyle ?? 'solid'}
                  onChange={(v) => onPropsChange('borderStyle', v)}
                  options={[
                    { label: '实线', value: 'solid' },
                    { label: '虚线', value: 'dashed' },
                  ]}
                />
              </div>
              <div className={styles["property-item"]}>
                <Text className={styles["property-label"]}>线条粗细 (px)</Text>
                <InputNumber
                  size="small"
                  style={{ width: '100%' }}
                  min={1}
                  max={5}
                  step={1}
                  precision={0}
                  value={component.props?.borderWidth ?? 1}
                  onChange={(v) => onPropsChange('borderWidth', v)}
                  suffix="px"
                />
              </div>
              <div className={styles["property-item"]}>
                <Text className={styles["property-label"]}>线条颜色</Text>
                <input
                  type="color"
                  value={component.props?.borderColor ?? '#d9d9d9'}
                  onChange={(e) => onPropsChange('borderColor', e.target.value)}
                  style={{ width: '100%', height: 32, border: '1px solid #d9d9d9', borderRadius: 4, padding: 2, cursor: 'pointer' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 合计行显示风格 */}
        <div className={`${styles["property-item"]} ${styles["property-item-full"]}`}>
          <Text className={styles["property-label"]}>合计行显示风格</Text>
          <Radio.Group
            size="small"
            value={summaryDisplay}
            onChange={(e) => onPropsChange('summaryDisplay', e.target.value)}
          >
            <Radio.Button value="both">显示</Radio.Button>
            <Radio.Button value="none">隐藏</Radio.Button>
            <Radio.Button value="extra-only">仅额外行</Radio.Button>
          </Radio.Group>
        </div>

        {/* 合计模式/标签/额外行 */}
        {summaryDisplay !== 'none' ? (
          <div className={`${styles["property-item"]} ${styles["property-item-full"]}`}>
            <div className={styles["property-list"]} style={{ padding: 0 }}>
              <div className={`${styles["property-item"]} ${styles["property-item-full"]}`}>
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
              <div className={`${styles["property-item"]} ${styles["property-item-full"]}`}>
                <Text className={styles["property-label"]}>合计标签</Text>
                <Input
                  className="ant-input ant-input-sm"
                  placeholder="默认：合计"
                  value={component.props?.summaryLabel || ''}
                  onChange={(e) => onPropsChange('summaryLabel', e.target.value)}
                />
              </div>
              <SummaryExtraRowsSection
                extraRows={extraRows}
                columns={component.props?.columns || []}
                onPropsChange={onPropsChange}
                updateComponent={updateComponent}
                component={component}
              />
            </div>
          </div>
        ) : null}

        {/* 序号列配置 */}
        <RowNumberStyleSection
          showRowNumber={component.props?.showRowNumber === true}
          rowNumberLabel={component.props?.rowNumberLabel}
          rowNumberWidth={component.props?.rowNumberWidth}
          rowNumberHeaderStyle={component.props?.rowNumberHeaderStyle}
          rowNumberStyle={component.props?.rowNumberStyle}
          onPropsChange={onPropsChange}
          onTableStyleChange={handleTableStyleChange}
          clearTableStyleField={clearTableStyleField}
        />

        {/* 列配置列表 */}
        <div className={`${styles["property-item"]} ${styles["property-item-full"]}`} style={{ marginTop: 12 }}>
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
              <ColumnConfigCard
                key={index}
                col={col}
                index={index}
                totalColumns={component.props?.columns?.length || 0}
                tableWidthMm={tableWidthMm}
                visibleCols={visibleColsForValidation}
                showRowNumber={component.props?.showRowNumber === true}
                rowNumberWidth={rowNumberWidth}
                summaryDisplay={summaryDisplay}
                isWidthOverflow={isWidthOverflow}
                totalAssignedWidth={totalAssignedWidth}
                onToggle={handleColumnToggle}
                onMove={handleColumnMove}
                onDelete={handleDeleteColumn}
                onTitleChange={handleColumnTitleChange}
                onDataIndexChange={handleColumnDataIndexChange}
                onWidthChange={handleColumnWidthChange}
                onSummaryChange={handleColumnSummaryChange}
                onPipesChange={handleColumnPipesChange}
                onStyleChange={handleColumnStyleChange}
                onHeaderStyleChange={handleColumnHeaderStyleChange}
                clearStyleField={clearColumnStyleField}
                clearHeaderStyleField={clearColumnHeaderStyleField}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableColumnSection;
