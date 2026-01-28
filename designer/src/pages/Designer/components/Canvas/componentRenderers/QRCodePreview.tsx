import QRCodeComponent from '../../../../../components/QRCode';
import type { ComponentNode } from '../../../../../types';

interface QRCodePreviewProps {
  component: ComponentNode;
}

/**
 * 二维码组件预览
 */
export const QRCodePreview = ({ component }: QRCodePreviewProps) => {
  const qrSize = (component.layout.widthMm || 30) * 3.78;
  const qrContent = component.binding?.fallback || component.props?.content || 'https://example.com';

  return <QRCodeComponent content={qrContent} size={qrSize} />;
};
