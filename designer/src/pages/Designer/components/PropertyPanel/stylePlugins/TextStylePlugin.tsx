/**
 * 文本组件样式插件
 */

import { Input, InputNumber, Select, Space, Typography } from 'antd';
import styles from '../index.module.css';
import type { StylePlugin } from './types';

const { Text } = Typography;

export const TextStylePlugin: StylePlugin = {
  name: 'text',

  render: (component, onStyleChange, onPropsChange) => {
    return (
      <>
        {/* 文本组件特有属性 */}
        <div className={styles["property-item"]}>
          <Text className={styles["property-label"]}>标签 (Label)</Text>
          <Input
            placeholder="例如：订单号："
            value={component.props?.label || ''}
            onChange={(e) => onPropsChange('label', e.target.value)}
            allowClear
          />
        </div>
        <div className={styles["property-item"]}>
          <Text className={styles["property-label"]}>静态文本</Text>
          <Input
            placeholder="不绑定数据时显示的文本"
            value={component.props?.text || ''}
            onChange={(e) => onPropsChange('text', e.target.value)}
            allowClear
          />
        </div>

        {/* 通用样式 */}
        <div className={styles["property-item"]}>
          <Text className={styles["property-label"]}>字体大小</Text>
          <InputNumber
            style={{ width: '100%' }}
            value={component.style?.fontSize || 14}
            onChange={(val) => onStyleChange('fontSize', val || 14)}
          />
        </div>
        <div className={styles["property-item"]}>
          <Text className={styles["property-label"]}>字体颜色</Text>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              type="color"
              value={component.style?.color || '#262626'}
              onChange={(e) => onStyleChange('color', e.target.value)}
              style={{ width: 60 }}
            />
            <Input
              value={component.style?.color || '#262626'}
              onChange={(e) => onStyleChange('color', e.target.value)}
            />
          </Space.Compact>
        </div>
        <div className={styles["property-item"]}>
          <Text className={styles["property-label"]}>对齐方式</Text>
          <Select
            style={{ width: '100%' }}
            value={component.style?.textAlign || 'left'}
            onChange={(val) => onStyleChange('textAlign', val)}
            options={[
              { value: 'left', label: '左对齐' },
              { value: 'center', label: '居中' },
              { value: 'right', label: '右对齐' },
            ]}
          />
        </div>
      </>
    );
  },
};
