/**
 * 样式属性配置区域
 * 使用插件化设计，根据组件类型动态加载对应的样式插件
 */

import styles from './index.module.css';
import type { ComponentNode } from '../../../../types';
import { getPlugin } from './stylePlugins';

interface StyleSectionProps {
  component: ComponentNode;
  onStyleChange: (field: string, value: any) => void;
  onPropsChange: (field: string, value: any) => void;
}

const StyleSection: React.FC<StyleSectionProps> = ({ component, onStyleChange, onPropsChange }) => {
  // 获取对应的样式插件
  const plugin = getPlugin(component.type);

  return (
    <div className={styles["property-section"]}>
      <div className={styles["property-title"]}>🎨 样式属性</div>
      <div className={styles["property-list"]}>
        {plugin.render(component, onStyleChange, onPropsChange)}
      </div>
    </div>
  );
};

export default StyleSection;
