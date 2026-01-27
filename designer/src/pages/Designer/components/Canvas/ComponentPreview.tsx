import QRCodeComponent from '../../../../components/QRCode';
import BarcodeComponent from '../../../../components/Barcode';
import type { ComponentNode } from '../../../../types';

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
      const textAlign = component.style?.textAlign || 'left';
      // 将 textAlign 转换为 justifyContent（因为使用了 flex 布局）
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

    case 'line':
      // 线条统一使用 border 实现，通过绝对定位让线条在容器中垂直居中
      const lineHeight = (component.style?.borderTopWidth || 1) / 3.78;
      const lineStyle = component.style?.borderTopStyle || 'solid';
      const lineColor = component.style?.borderTopColor || '#000';

      return (
        <div style={{
          width: '100%',
          height: '100%',  // 容器占满高度
          position: 'relative',  // 相对定位
          display: 'flex',
          alignItems: 'center',  // 垂直居中
        }}>
          <div style={{
            width: '100%',
            height: '0px',  // 线条容器高度为0
            borderTop: `${lineHeight}px ${lineStyle} ${lineColor}`,  // 统一使用 borderTop
          }} />
        </div>
      );

    case 'qrcode':
      const qrSize = (component.layout.widthMm || 30) * 3.78;
      // 优先使用 fallback，其次是 props.content，最后是默认值
      const qrContent = component.binding?.fallback || component.props?.content || 'https://example.com';
      return <QRCodeComponent content={qrContent} size={qrSize} />;

    case 'barcode':
      const barcodeWidth = (component.layout.widthMm || 60) * 3.78;
      const barcodeHeight = (component.layout.heightMm || 20) * 3.78;
      // 优先使用 fallback，其次是 props.content，最后是默认值
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

    case 'table':
      const columns = component.props?.columns || [];
      const bordered = component.props?.bordered !== false;
      const showHeader = component.props?.showHeader !== false;
      const visibleColumns = columns.filter((col: any) => !col.hidden);
      const tableTextAlign = component.style?.textAlign || 'left';

      return (
        <table style={{
          width: '100%',
          height: '100%',
          borderCollapse: 'collapse',
          fontSize: component.style?.fontSize || 12,
        }}>
          {showHeader && visibleColumns.length > 0 && (
            <thead>
              <tr>
                {visibleColumns.map((col: any, idx: number) => (
                  <th key={idx} style={{
                    border: bordered ? '1px solid #d9d9d9' : 'none',
                    padding: '8px',
                    background: '#fafafa',
                    fontWeight: 600,
                    textAlign: tableTextAlign as any,
                  }}>
                    {col.title || col.dataIndex}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            <tr>
              <td colSpan={visibleColumns.length || 1} style={{
                border: bordered ? '1px solid #d9d9d9' : 'none',
                padding: '8px',
                textAlign: 'center',
                color: '#999',
              }}>
                暂无数据
              </td>
            </tr>
          </tbody>
        </table>
      );

    case 'rect':
      return (
        <div style={{
          width: '100%',
          height: '100%',
          border: component.style?.border || '1px solid #000',
          background: component.style?.background || 'transparent',
        }} />
      );

    case 'image':
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

    default:
      return (
        <div style={{ padding: '4px', fontSize: 12, color: '#999' }}>
          {component.type}
        </div>
      );
  }
};

export default ComponentPreview;
