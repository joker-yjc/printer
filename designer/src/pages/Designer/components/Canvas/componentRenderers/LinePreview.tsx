import type { ComponentNode } from '../../../../../types';

interface LinePreviewProps {
  component: ComponentNode;
}

/**
 * 线条组件预览
 */
export const LinePreview = ({ component }: LinePreviewProps) => {
  const lineHeight = (component.style?.borderTopWidth || 1) / 3.78;
  const lineStyle = component.style?.borderTopStyle || 'solid';
  const lineColor = component.style?.borderTopColor || '#000';

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{
        width: '100%',
        height: '0px',
        borderTop: `${lineHeight}px ${lineStyle} ${lineColor}`,
      }} />
    </div>
  );
};
