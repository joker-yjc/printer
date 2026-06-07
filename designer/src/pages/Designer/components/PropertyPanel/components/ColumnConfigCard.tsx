/**
 * 单列配置卡片
 * 负责表格单列的基础配置、样式、管道和合计配置
 */

import { Checkbox, Button, Space, Input, Typography, Collapse, Select, InputNumber, Tooltip } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from '../index.module.css';
import type { TableColumn, TableColumnSummary, PipeConfig, TableColumnStyle } from '../../../../../types';
import { computeColumnMaxWidth } from '@jcyao/print-sdk';
import { FONT_SIZE_MIN } from '../../../../../constants';
import PipeConfigPanel from '../../../../../components/PipeConfigPanel';

const { Text } = Typography;

const fontWeightOptions = [
  { label: '正常', value: 'normal' },
  { label: '粗体', value: 'bold' },
];

const textAlignOptions = [
  { label: '左对齐', value: 'left' },
  { label: '居中', value: 'center' },
  { label: '右对齐', value: 'right' },
];

const summaryTypeOptions = [
  { label: '求和 (SUM)', value: 'sum' },
  { label: '平均 (AVG)', value: 'avg' },
  { label: '最大 (MAX)', value: 'max' },
  { label: '最小 (MIN)', value: 'min' },
  { label: '计数 (COUNT)', value: 'count' },
];

interface ColumnConfigCardProps {
  col: TableColumn;
  index: number;
  totalColumns: number;
  tableWidthMm: number;
  visibleCols: TableColumn[];
  showRowNumber: boolean;
  rowNumberWidth: number;
  summaryDisplay: 'both' | 'none' | 'extra-only';
  isWidthOverflow: boolean;
  totalAssignedWidth: number;
  onToggle: (index: number, checked: boolean) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  onDelete: (index: number) => void;
  onTitleChange: (index: number, title: string) => void;
  onDataIndexChange: (index: number, dataIndex: string) => void;
  onWidthChange: (index: number, width: number | null) => void;
  onSummaryChange: (index: number, summary: TableColumnSummary | undefined) => void;
  onPipesChange: (index: number, pipes: PipeConfig[]) => void;
  onStyleChange: (index: number, field: keyof TableColumnStyle, value: any) => void;
  onHeaderStyleChange: (index: number, field: keyof TableColumnStyle, value: any) => void;
  clearStyleField: (index: number, field: keyof TableColumnStyle) => void;
  clearHeaderStyleField: (index: number, field: keyof TableColumnStyle) => void;
}

const ColumnConfigCard: React.FC<ColumnConfigCardProps> = ({
  col,
  index,
  totalColumns,
  tableWidthMm,
  visibleCols,
  showRowNumber,
  rowNumberWidth,
  summaryDisplay,
  isWidthOverflow,
  totalAssignedWidth,
  onToggle,
  onMove,
  onDelete,
  onTitleChange,
  onDataIndexChange,
  onWidthChange,
  onSummaryChange,
  onPipesChange,
  onStyleChange,
  onHeaderStyleChange,
  clearStyleField,
  clearHeaderStyleField,
}) => {
  return (
    <div
      style={{
        border: '1px solid #d9d9d9',
        borderRadius: 4,
        padding: 8,
        background: col.hidden ? '#f5f5f5' : '#fff',
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {/* 列头部：显隐 + 排序 + 删除 */}
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Checkbox
            checked={!col.hidden}
            onChange={(e) => onToggle(index, e.target.checked)}
          >
            <Text strong>{col.dataIndex}</Text>
          </Checkbox>
          <Space size="small">
            <Button
              type="text"
              size="small"
              icon={<ArrowUpOutlined />}
              disabled={index === 0}
              onClick={() => onMove(index, 'up')}
            />
            <Button
              type="text"
              size="small"
              icon={<ArrowDownOutlined />}
              disabled={index === totalColumns - 1}
              onClick={() => onMove(index, 'down')}
            />
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(index)}
            />
          </Space>
        </Space>

        {/* 列标题 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Text className={styles["property-label"]}>列标题</Text>
          <Input
            size="small"
            placeholder="例如：商品名称"
            value={col.title}
            disabled={col.hidden}
            onChange={(e) => onTitleChange(index, e.target.value)}
          />
        </div>

        {/* 数据字段名 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Text className={styles["property-label"]}>数据字段名 (dataIndex)</Text>
          <Input
            size="small"
            placeholder="例如：productName"
            value={col.dataIndex}
            disabled={col.hidden}
            onChange={(e) => onDataIndexChange(index, e.target.value)}
          />
        </div>

        {/* 列宽 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Text className={styles["property-label"]}>宽度 (mm)</Text>
          <Tooltip
            title={isWidthOverflow ? `列宽总和 ${totalAssignedWidth.toFixed(1)}mm 超过表格宽度 ${tableWidthMm.toFixed(1)}mm` : undefined}
            open={isWidthOverflow ? undefined : false}
          >
            <InputNumber
              size="small"
              style={{ width: '100%', marginTop: 4 }}
              min={1}
              precision={1}
              step={0.5}
              disabled={col.hidden}
              max={computeColumnMaxWidth(
                visibleCols,
                visibleCols.findIndex((c: any) => c.dataIndex === col.dataIndex),
                tableWidthMm,
                showRowNumber ? rowNumberWidth : 0
              )}
              status={isWidthOverflow ? 'error' : undefined}
              placeholder="自动"
              suffix="mm"
              value={col.width}
              onChange={(v) => onWidthChange(index, v)}
            />
          </Tooltip>
        </div>

        {/* 列样式 */}
        <Collapse
          size="small"
          ghost
          style={{ marginTop: 4 }}
          items={[
            {
              key: 'colStyle',
              label: <Text type="secondary" style={{ fontSize: 12 }}>列样式</Text>,
              children: (
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  {/* 表头样式 */}
                  <Text type="secondary" style={{ fontSize: 11 }}>表头样式</Text>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <Text className={styles["property-label"]}>字重</Text>
                      <Select
                        size="small"
                        style={{ width: '100%', marginTop: 4 }}
                        allowClear
                        placeholder="继承"
                        value={col.headerStyle?.fontWeight}
                        onChange={(v) => onHeaderStyleChange(index, 'fontWeight', v)}
                        options={fontWeightOptions}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text className={styles["property-label"]}>字号</Text>
                      <InputNumber
                        size="small"
                        style={{ width: '100%', marginTop: 4 }}
                        min={FONT_SIZE_MIN}
                        precision={0}
                        step={1}
                        placeholder="继承"
                        value={col.headerStyle?.fontSize}
                        onChange={(v) => onHeaderStyleChange(index, 'fontSize', v)}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <Text className={styles["property-label"]}>颜色</Text>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 4 }}>
                        <input
                          type="color"
                          value={col.headerStyle?.color || '#000000'}
                          disabled={!col.headerStyle?.color}
                          onChange={(e) => onHeaderStyleChange(index, 'color', e.target.value)}
                          style={{ width: 32, height: 32, border: '1px solid #d9d9d9', borderRadius: 4, padding: 2, cursor: 'pointer' }}
                        />
                        <Checkbox
                          checked={!!col.headerStyle?.color}
                          onChange={(e) => e.target.checked
                            ? onHeaderStyleChange(index, 'color', '#000000')
                            : clearHeaderStyleField(index, 'color')
                          }
                        >
                          <Text style={{ fontSize: 11 }}>自定义</Text>
                        </Checkbox>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Text className={styles["property-label"]}>对齐</Text>
                    <Select
                      size="small"
                      style={{ width: '100%', marginTop: 4 }}
                      allowClear
                      placeholder="继承"
                      value={col.headerStyle?.textAlign}
                      onChange={(v) => onHeaderStyleChange(index, 'textAlign', v)}
                      options={textAlignOptions}
                    />
                  </div>

                  {/* 数据样式 */}
                  <div style={{ borderTop: '1px solid #e8e8e8', paddingTop: 8, marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>数据样式</Text>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <Text className={styles["property-label"]}>字重</Text>
                      <Select
                        size="small"
                        style={{ width: '100%', marginTop: 4 }}
                        allowClear
                        placeholder="继承"
                        value={col.style?.fontWeight}
                        onChange={(v) => onStyleChange(index, 'fontWeight', v)}
                        options={fontWeightOptions}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text className={styles["property-label"]}>字号</Text>
                      <InputNumber
                        size="small"
                        style={{ width: '100%', marginTop: 4 }}
                        min={FONT_SIZE_MIN}
                        precision={0}
                        step={1}
                        placeholder="继承"
                        value={col.style?.fontSize}
                        onChange={(v) => onStyleChange(index, 'fontSize', v)}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <Text className={styles["property-label"]}>颜色</Text>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 4 }}>
                        <input
                          type="color"
                          value={col.style?.color || '#000000'}
                          disabled={!col.style?.color}
                          onChange={(e) => onStyleChange(index, 'color', e.target.value)}
                          style={{ width: 32, height: 32, border: '1px solid #d9d9d9', borderRadius: 4, padding: 2, cursor: 'pointer' }}
                        />
                        <Checkbox
                          checked={!!col.style?.color}
                          onChange={(e) => e.target.checked
                            ? onStyleChange(index, 'color', '#000000')
                            : clearStyleField(index, 'color')
                          }
                        >
                          <Text style={{ fontSize: 11 }}>自定义</Text>
                        </Checkbox>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Text className={styles["property-label"]}>对齐</Text>
                    <Select
                      size="small"
                      style={{ width: '100%', marginTop: 4 }}
                      allowClear
                      placeholder="继承"
                      value={col.style?.textAlign}
                      onChange={(v) => onStyleChange(index, 'textAlign', v)}
                      options={textAlignOptions}
                    />
                  </div>
                </Space>
              ),
            },
          ]}
        />

        {/* 列管道配置 */}
        <Collapse
          size="small"
          ghost
          style={{ marginTop: 4 }}
          defaultActiveKey={col.pipes?.length ? ['colPipes'] : []}
          items={[
            {
              key: 'colPipes',
              label: <Text type="secondary" style={{ fontSize: 12 }}>管道转换</Text>,
              children: (
                <PipeConfigPanel
                  pipes={col.pipes}
                  onChange={(newPipes) => onPipesChange(index, newPipes)}
                />
              ),
            },
          ]}
        />

        {/* 合计配置 */}
        {summaryDisplay !== 'none' ? (
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
                      <Text className={styles["property-label"]}>聚合类型</Text>
                      <Select
                        size="small"
                        style={{ width: '100%', marginTop: 4 }}
                        placeholder="选择聚合类型"
                        allowClear
                        value={col.summary?.type}
                        onChange={(value) => {
                          if (!value) {
                            onSummaryChange(index, undefined);
                          } else {
                            onSummaryChange(index, {
                              ...col.summary,
                              type: value,
                            });
                          }
                        }}
                        options={summaryTypeOptions}
                      />
                    </div>
                    {col.summary?.type && (
                      <>
                        <div>
                          <Text className={styles["property-label"]}>小数位数</Text>
                          <InputNumber
                            size="small"
                            style={{ width: '100%', marginTop: 4 }}
                            min={0}
                            max={10}
                            precision={0}
                            step={1}
                            placeholder="默认：2"
                            value={col.summary?.precision ?? 2}
                            onChange={(value) => {
                              onSummaryChange(index, {
                                ...col.summary!,
                                precision: value ?? 2,
                              });
                            }}
                          />
                        </div>
                        <div>
                          <PipeConfigPanel
                            pipes={col.summary?.pipe ? [col.summary.pipe] : []}
                            onChange={(newPipes) => {
                              onSummaryChange(index, {
                                ...col.summary!,
                                pipe: newPipes.length > 0 ? newPipes[0] : undefined,
                              });
                            }}
                            maxPipes={1}
                          />
                        </div>
                        {!col.summary?.pipe && (
                          <div>
                            <Text className={styles["property-label"]}>前缀/后缀</Text>
                            <Space.Compact style={{ width: '100%', marginTop: 4 }}>
                              <Input
                                size="small"
                                placeholder="前缀（如￥）"
                                value={col.summary?.prefix || ''}
                                onChange={(e) => {
                                  onSummaryChange(index, {
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
                                  onSummaryChange(index, {
                                    ...col.summary!,
                                    suffix: e.target.value,
                                  });
                                }}
                              />
                            </Space.Compact>
                          </div>
                        )}
                      </>
                    )}
                  </Space>
                ),
              },
            ]}
          />
        ) : null}
      </Space>
    </div>
  );
};

export default ColumnConfigCard;
