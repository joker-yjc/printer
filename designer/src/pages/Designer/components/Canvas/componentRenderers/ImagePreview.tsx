import type { ComponentNode } from '../../../../../types';

interface ImagePreviewProps {
  component: ComponentNode;
}

/**
 * 图片组件预览
 */
export const ImagePreview = ({ component }: ImagePreviewProps) => {
  const imageSrc = component.props?.src || '';

  return imageSrc ? (
    <img src={imageSrc} style={{
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: component.style?.objectFit || 'contain',
    }} alt="" />
  ) : (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
      color: '#999',
      fontSize: 12,
    }}>
      图片
    </div>
  );
};
