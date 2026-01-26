/**
 * 表格组件样式插件
 */

import { InputNumber, Typography } from 'antd';
import styles from '../index.module.css';
import type { StylePlugin } from './types';

const { Text } = Typography;

export const TableStylePlugin: StylePlugin = {
  name: 'table',

  render: (component, onStyleChange) => {
    return (
      <>
        <div className={styles["property-item"]}>
          <Text className={styles["property-label"]}>字体大小</Text>
          <InputNumber
            style={{ width: '100%' }}
            value={component.style?.fontSize || 12}
            onChange={(val) => onStyleChange('fontSize', val || 12)}
          />
        </div>
      </>
    );
  },
};
