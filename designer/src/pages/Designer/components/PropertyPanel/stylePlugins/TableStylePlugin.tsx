/**
 * 表格组件样式插件
 */

import { InputNumber, Select, Typography, Tooltip } from 'antd';
import styles from '../index.module.css';
import type { StylePlugin } from './types';

const { Text } = Typography;

export const TableStylePlugin: StylePlugin = {
  name: 'table',

  render: (component, onStyleChange) => {
    return (
      <>
        <div className={styles["property-item"]}>
          <Tooltip title="表格内容的字体大小">
            <Text className={styles["property-label"]}>🔤 字体大小</Text>
          </Tooltip>
          <InputNumber
            style={{ width: '100%' }}
            value={component.style?.fontSize || 12}
            onChange={(val) => onStyleChange('fontSize', val || 12)}
          />
        </div>
        <div className={styles["property-item"]}>
          <Tooltip title="表格单元格内容的对齐方式">
            <Text className={styles["property-label"]}>📏 对齐方式</Text>
          </Tooltip>
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
