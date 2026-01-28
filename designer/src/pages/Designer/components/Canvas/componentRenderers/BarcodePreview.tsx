import BarcodeComponent from '../../../../../components/Barcode';
import type { ComponentNode } from '../../../../../types';

interface BarcodePreviewProps {
  component: ComponentNode;
}

/**
 * 条形码组件预览
 */
export const BarcodePreview = ({ component }: BarcodePreviewProps) => {
  const barcodeWidth = (component.layout.widthMm || 60) * 3.78;
  const barcodeHeight = (component.layout.heightMm || 20) * 3.78;
  const barcodeContent = component.binding?.fallback || component.props?.content || '1234567890';
  const barcodeFormat = component.props?.format || 'CODE128';

  return (
    <BarcodeComponent
      content={barcodeContent}
      format={barcodeFormat}
      width={barcodeWidth}
      height={barcodeHeight}
    />
  );
};
