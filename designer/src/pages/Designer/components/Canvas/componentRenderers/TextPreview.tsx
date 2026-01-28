import type { ComponentNode } from '../../../../../types';

interface TextPreviewProps {
  component: ComponentNode;
}

/**
 * 文本组件预览
 */
export const TextPreview = ({ component }: TextPreviewProps) => {
  const textAlign = component.style?.textAlign || 'left';
  const justifyContent = textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start';

  return (
    <div style={{
      fontSize: component.style?.fontSize || 14,
      color: component.style?.color || '#262626',
      fontWeight: component.style?.fontWeight || 'normal',
      display: 'flex',
      alignItems: 'center',
      justifyContent,
      height: '100%',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    }}>
      {component.props?.label || component.props?.text || component.binding?.path || '文本内容'}
    </div>
  );
};
