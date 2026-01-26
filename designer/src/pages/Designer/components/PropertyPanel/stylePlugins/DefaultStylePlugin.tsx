/**
 * 默认样式插件
 * 用于不需要特殊样式配置的组件（如 image、qrcode、barcode）
 */

import { InputNumber, Typography } from 'antd';
import styles from '../index.module.css';
import type { StylePlugin } from './types';

const { Text } = Typography;

export const DefaultStylePlugin: StylePlugin = {
  name: 'default',

  render: (component, onStyleChange) => {
    return (
      <>
        <div className={styles["property-item"]}>
          <Text className={styles["property-label"]}>字体大小</Text>
          <InputNumber
            style={{ width: '100%' }}
            value={component.style?.fontSize || 14}
            onChange={(val) => onStyleChange('fontSize', val || 14)}
          />
        </div>
      </>
    );
  },
};
