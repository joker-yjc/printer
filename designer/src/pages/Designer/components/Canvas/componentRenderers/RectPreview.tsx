import type { ComponentNode } from '../../../../../types';

interface RectPreviewProps {
  component: ComponentNode;
}

/**
 * 矩形组件预览
 */
export const RectPreview = ({ component }: RectPreviewProps) => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      border: component.style?.border || '1px solid #000',
      background: component.style?.background || 'transparent',
    }} />
  );
};
