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
  onLayoutChange?: (field: string, value: any) => void;
}

const StyleSection: React.FC<StyleSectionProps> = ({ component, onStyleChange, onPropsChange, onLayoutChange }) => {
  // 获取对应的样式插件
  const plugin = getPlugin(component.type);
  const content = plugin.render(component, onStyleChange, onPropsChange, onLayoutChange);

  // 插件无内容时隐藏整个样式区块（如 rect、image、qrcode、barcode 等装饰性组件）
  if (!content) return null;

  return (
    <div className={styles["property-section"]}>
      <div className={styles["property-title"]}>样式属性</div>
      <div className={styles["property-list"]}>
        {content}
      </div>
    </div>
  );
};

export default StyleSection;
