/**
 * 布局属性配置区域
 * 负责组件的位置和尺寸配置
 */

import { InputNumber, Typography } from 'antd';
import styles from './index.module.css';
import type { ComponentNode } from '../../../../types';

const { Text } = Typography;

interface LayoutSectionProps {
  component: ComponentNode;
  onChange: (field: string, value: number) => void;
}

const LayoutSection: React.FC<LayoutSectionProps> = ({ component, onChange }) => {
  return (
    <div className={styles["property-section"]}>
      <div className={styles["property-title"]}>📍 布局属性</div>
      <div className={styles["property-list"]}>
        <div className={styles["property-item"]}>
          <Text className={styles["property-label"]}>X 坐标 (mm)</Text>
          <InputNumber
            style={{ width: '100%' }}
            value={component.layout.xMm}
            onChange={(val) => onChange('xMm', val || 0)}
          />
        </div>
        <div className={styles["property-item"]}>
          <Text className={styles["property-label"]}>Y 坐标 (mm)</Text>
          <InputNumber
            style={{ width: '100%' }}
            value={component.layout.yMm}
            onChange={(val) => onChange('yMm', val || 0)}
          />
        </div>
        <div className={styles["property-item"]}>
          <Text className={styles["property-label"]}>宽度 (mm)</Text>
          <InputNumber
            style={{ width: '100%' }}
            value={component.layout.widthMm}
            onChange={(val) => onChange('widthMm', val || 0)}
          />
        </div>
        <div className={styles["property-item"]}>
          <Text className={styles["property-label"]}>高度 (mm)</Text>
          <InputNumber
            style={{ width: '100%' }}
            value={component.layout.heightMm}
            onChange={(val) => onChange('heightMm', val || 0)}
          />
        </div>
      </div>
    </div>
  );
};

export default LayoutSection;
