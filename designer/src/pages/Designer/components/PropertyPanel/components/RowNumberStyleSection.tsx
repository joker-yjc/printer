/**
 * 序号列样式配置区域
 * 负责序号列的基础配置和表头/数据样式
 */

import { Checkbox, Input, InputNumber, Select, Typography } from 'antd';
import styles from '../index.module.css';
import { FONT_SIZE_MIN } from '../../../../../constants';
import type { TableColumnStyle } from '../../../../../types';

const { Text } = Typography;

interface RowNumberStyleSectionProps {
  showRowNumber: boolean;
  rowNumberLabel?: string;
  rowNumberWidth?: number;
  rowNumberHeaderStyle?: TableColumnStyle;
  rowNumberStyle?: TableColumnStyle;
  onPropsChange: (field: string, value: any) => void;
  onTableStyleChange: (propKey: string, field: string, value: any) => void;
  clearTableStyleField: (propKey: string, field: string) => void;
}

const fontWeightOptions = [
  { label: '正常', value: 'normal' },
  { label: '粗体', value: 'bold' },
];

const textAlignOptions = [
  { label: '左对齐', value: 'left' },
  { label: '居中', value: 'center' },
  { label: '右对齐', value: 'right' },
];

const RowNumberStyleSection: React.FC<RowNumberStyleSectionProps> = ({
  showRowNumber,
  rowNumberLabel,
  rowNumberWidth,
  rowNumberHeaderStyle,
  rowNumberStyle,
  onPropsChange,
  onTableStyleChange,
  clearTableStyleField,
}) => {
  return (
    <div className={`${styles["property-item"]} ${styles["property-item-full"]}`}>
      <Checkbox
        checked={showRowNumber}
        onChange={(e) => onPropsChange('showRowNumber', e.target.checked)}
      >
        显示序号列
      </Checkbox>
      {showRowNumber && (
        <div className={styles["property-list"]} style={{ padding: 0, marginTop: 8 }}>
          <div className={styles["property-item"]}>
            <Text className={styles["property-label"]}>序号列标题</Text>
            <Input
              size="small"
              placeholder="默认：序号"
              value={rowNumberLabel || ''}
              onChange={(e) => onPropsChange('rowNumberLabel', e.target.value)}
            />
          </div>
          <div className={styles["property-item"]}>
            <Text className={styles["property-label"]}>序号列宽度 (mm)</Text>
            <InputNumber
              size="small"
              style={{ width: '100%' }}
              min={1}
              precision={1}
              step={0.5}
              placeholder="自动"
              suffix="mm"
              value={rowNumberWidth}
              onChange={(v) => onPropsChange('rowNumberWidth', v ?? undefined)}
            />
          </div>
          {/* 表头样式 */}
          <div className={styles["property-item-full"]}>
            <Text strong className={styles["property-label"]}>序号列表头样式</Text>
          </div>
          <div className={styles["property-item"]}>
            <Text className={styles["property-label"]}>表头字重</Text>
            <Select
              size="small"
              style={{ width: '100%' }}
              allowClear
              placeholder="继承"
              value={rowNumberHeaderStyle?.fontWeight}
              onChange={(v) => onTableStyleChange('rowNumberHeaderStyle', 'fontWeight', v)}
              options={fontWeightOptions}
            />
          </div>
          <div className={styles["property-item"]}>
            <Text className={styles["property-label"]}>表头字号</Text>
            <InputNumber
              size="small"
              style={{ width: '100%' }}
              min={FONT_SIZE_MIN}
              precision={0}
              step={1}
              placeholder="继承"
              value={rowNumberHeaderStyle?.fontSize}
              onChange={(v) => onTableStyleChange('rowNumberHeaderStyle', 'fontSize', v)}
            />
          </div>
          <div className={styles["property-item"]}>
            <Text className={styles["property-label"]}>表头颜色</Text>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <input
                type="color"
                value={rowNumberHeaderStyle?.color || '#000000'}
                disabled={!rowNumberHeaderStyle?.color}
                onChange={(e) => onTableStyleChange('rowNumberHeaderStyle', 'color', e.target.value)}
                style={{ width: 32, height: 32, border: '1px solid #d9d9d9', borderRadius: 4, padding: 2, cursor: 'pointer' }}
              />
              <Checkbox
                checked={!!rowNumberHeaderStyle?.color}
                onChange={(e) => e.target.checked
                  ? onTableStyleChange('rowNumberHeaderStyle', 'color', '#000000')
                  : clearTableStyleField('rowNumberHeaderStyle', 'color')
                }
              >
                <Text style={{ fontSize: 11 }}>自定义</Text>
              </Checkbox>
            </div>
          </div>
          <div className={styles["property-item"]}>
            <Text className={styles["property-label"]}>表头对齐</Text>
            <Select
              size="small"
              style={{ width: '100%' }}
              allowClear
              placeholder="默认：居中"
              value={rowNumberHeaderStyle?.textAlign}
              onChange={(v) => onTableStyleChange('rowNumberHeaderStyle', 'textAlign', v)}
              options={textAlignOptions}
            />
          </div>
          {/* 数据样式 */}
          <div className={styles["property-item-full"]}>
            <Text strong className={styles["property-label"]}>序号列数据样式</Text>
          </div>
          <div className={styles["property-item"]}>
            <Text className={styles["property-label"]}>数据字重</Text>
            <Select
              size="small"
              style={{ width: '100%' }}
              allowClear
              placeholder="继承"
              value={rowNumberStyle?.fontWeight}
              onChange={(v) => onTableStyleChange('rowNumberStyle', 'fontWeight', v)}
              options={fontWeightOptions}
            />
          </div>
          <div className={styles["property-item"]}>
            <Text className={styles["property-label"]}>数据字号</Text>
            <InputNumber
              size="small"
              style={{ width: '100%' }}
              min={FONT_SIZE_MIN}
              precision={0}
              step={1}
              placeholder="继承"
              value={rowNumberStyle?.fontSize}
              onChange={(v) => onTableStyleChange('rowNumberStyle', 'fontSize', v)}
            />
          </div>
          <div className={styles["property-item"]}>
            <Text className={styles["property-label"]}>数据颜色</Text>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <input
                type="color"
                value={rowNumberStyle?.color || '#000000'}
                disabled={!rowNumberStyle?.color}
                onChange={(e) => onTableStyleChange('rowNumberStyle', 'color', e.target.value)}
                style={{ width: 32, height: 32, border: '1px solid #d9d9d9', borderRadius: 4, padding: 2, cursor: 'pointer' }}
              />
              <Checkbox
                checked={!!rowNumberStyle?.color}
                onChange={(e) => e.target.checked
                  ? onTableStyleChange('rowNumberStyle', 'color', '#000000')
                  : clearTableStyleField('rowNumberStyle', 'color')
                }
              >
                <Text style={{ fontSize: 11 }}>自定义</Text>
              </Checkbox>
            </div>
          </div>
          <div className={styles["property-item"]}>
            <Text className={styles["property-label"]}>数据对齐</Text>
            <Select
              size="small"
              style={{ width: '100%' }}
              allowClear
              placeholder="默认：居中"
              value={rowNumberStyle?.textAlign}
              onChange={(v) => onTableStyleChange('rowNumberStyle', 'textAlign', v)}
              options={textAlignOptions}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RowNumberStyleSection;
