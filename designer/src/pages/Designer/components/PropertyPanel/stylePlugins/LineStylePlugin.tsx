/**
 * 线条组件样式插件
 */

import { InputNumber, Select, Typography, Tooltip } from 'antd';
import styles from '../index.module.css';
import type { StylePlugin } from './types';

const { Text } = Typography;

export const LineStylePlugin: StylePlugin = {
  name: 'line',

  render: (component, onStyleChange, _onPropsChange, onLayoutChange) => {
    // 处理线条高度变化：同时更新 borderTopWidth 和 heightMm
    const handleLineHeightChange = (val: number | null) => {
      const height = val || 1;
      // 更新样式中的线条宽度
      onStyleChange('borderTopWidth', height);
      // 同时更新组件布局高度（像素转毫米：1px ≈ 0.265mm）
      if (onLayoutChange) {
        onLayoutChange('heightMm', height / 3.78);
      }
    };

    return (
      <>
        <div className={styles["property-item"]}>
          <Tooltip title="线条的粗细（像素）">
            <Text className={styles["property-label"]}>📏 线条高度</Text>
          </Tooltip>
          <InputNumber
            style={{ width: '100%' }}
            min={1}
            max={20}
            value={component.style?.borderTopWidth || 1}
            onChange={handleLineHeightChange}
          />
        </div>
        <div className={styles["property-item"]}>
          <Tooltip title="选择线条样式">
            <Text className={styles["property-label"]}>🎨 线条样式</Text>
          </Tooltip>
          <Select
            style={{ width: '100%' }}
            value={component.style?.borderTopStyle || 'solid'}
            onChange={(val) => onStyleChange('borderTopStyle', val)}
            options={[
              { value: 'solid', label: '实线' },
              { value: 'dashed', label: '虚线' },
              { value: 'dotted', label: '点线' },
            ]}
          />
        </div>
        <div className={styles["property-item"]}>
          <Tooltip title="线条的颜色">
            <Text className={styles["property-label"]}>🎨 线条颜色</Text>
          </Tooltip>
          <input
            type="color"
            value={component.style?.borderTopColor || '#000000'}
            onChange={(e) => onStyleChange('borderTopColor', e.target.value)}
            style={{ width: '100%', height: 32, cursor: 'pointer' }}
          />
        </div>
      </>
    );
  },
};
