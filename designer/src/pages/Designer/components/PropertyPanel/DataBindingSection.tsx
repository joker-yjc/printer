/**
 * 数据绑定配置区域
 * 负责组件的数据绑定和管道配置
 */

import { Input, Typography, Tooltip } from 'antd';
import styles from './index.module.css';
import type { ComponentNode } from '../../../../types';
import PipeConfigPanel from '../../../../components/PipeConfigPanel';

const { Text } = Typography;

interface DataBindingSectionProps {
  component: ComponentNode;
  onBindingChange: (field: string, value: any) => void;
}

const DataBindingSection: React.FC<DataBindingSectionProps> = ({ component, onBindingChange }) => {
  return (
    <div className={styles["property-section"]}>
      <div className={styles["property-title"]}>🔗 数据绑定</div>
      <div className={styles["property-list"]}>
        <div className={`${styles["property-item"]} ${styles["property-item-full"]}`}>
          <Tooltip title="数据的JSON路径，如 'user.name'、'items.0.title'，也可从左侧数据资产拖拽">
            <Text className={styles["property-label"]}>绑定路径</Text>
          </Tooltip>
          <Input
            value={component.binding?.path || ''}
            placeholder="例如：user.name"
            onChange={(e) => onBindingChange('path', e.target.value)}
            allowClear
          />
        </div>
        <div className={`${styles["property-item"]} ${styles["property-item-full"]}`}>
          <Tooltip title="当数据为空、null或undefined时的默认显示值">
            <Text className={styles["property-label"]}>默认值 (Fallback)</Text>
          </Tooltip>
          <Input
            value={component.binding?.fallback || ''}
            placeholder="数据为空时显示"
            onChange={(e) => onBindingChange('fallback', e.target.value)}
            allowClear
          />
        </div>
        <div className={`${styles["property-item"]} ${styles["property-item-full"]}`}>
          <Tooltip title="数据管道用于格式化数据，如日期格式化、大小写转换等，按顺序执行">
            <div style={{ marginBottom: 8 }}>
              <Text className={styles["property-label"]}>数据管道 (Pipes)</Text>
            </div>
          </Tooltip>
          <PipeConfigPanel
            pipes={component.binding?.pipes}
            onChange={(pipes) => onBindingChange('pipes', pipes.length > 0 ? pipes : undefined)}
          />
        </div>
      </div>
    </div>
  );
};

export default DataBindingSection;
