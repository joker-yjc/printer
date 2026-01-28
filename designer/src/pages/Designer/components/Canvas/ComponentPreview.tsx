import type { ComponentNode } from '../../../../types';
import {
  TextPreview,
  LinePreview,
  QRCodePreview,
  BarcodePreview,
  TablePreview,
  RectPreview,
  ImagePreview,
} from './componentRenderers';

interface ComponentPreviewProps {
  component: ComponentNode;
}

/**
 * 组件预览内容渲染
 * 根据组件类型渲染画布上的预览效果
 */
const ComponentPreview = ({ component }: ComponentPreviewProps) => {
  switch (component.type) {
    case 'text':
      return <TextPreview component={component} />;

    case 'line':
      return <LinePreview component={component} />;

    case 'qrcode':
      return <QRCodePreview component={component} />;

    case 'barcode':
      return <BarcodePreview component={component} />;

    case 'table':
      return <TablePreview component={component} />;

    case 'rect':
      return <RectPreview component={component} />;

    case 'image':
      return <ImagePreview component={component} />;

    default:
      return (
        <div style={{ padding: '4px', fontSize: 12, color: '#999' }}>
          {component.type}
        </div>
      );
  }
};

export default ComponentPreview;
