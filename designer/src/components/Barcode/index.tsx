import { useState, useEffect, useMemo } from 'react';
import { BarcodeOutlined } from '@ant-design/icons';
import JsBarcode from 'jsbarcode';

interface BarcodeComponentProps {
  content: string;
  format: string;
  width: number;
  height: number;
}

const BarcodeComponent = ({ content, format, width, height }: BarcodeComponentProps) => {
  const [barcodeDataURL, setBarcodeDataURL] = useState('');

  // 使用 useMemo 缓存 content、format、width 和 height 的组合
  const cacheKey = useMemo(
    () => `${content}-${format}-${width}-${height}`,
    [content, format, width, height]
  );

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, content, {
        format,
        width: 2,
        height: height * 0.8,
        displayValue: false,
      });
      setBarcodeDataURL(canvas.toDataURL());
    } catch (e) {
      console.error('Barcode generation failed:', e);
    }
  }, [cacheKey]); // 使用 cacheKey 而不是单独的依赖项

  // 使用 useMemo 缓存渲染结果
  const renderedContent = useMemo(() => {
    return barcodeDataURL ? (
      <img
        src={barcodeDataURL}
        style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
        alt="Barcode"
        draggable={false}
      />
    ) : (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed #d9d9d9',
          background: '#fafafa',
        }}
      >
        <BarcodeOutlined style={{ fontSize: 24, color: '#999' }} />
      </div>
    );
  }, [barcodeDataURL]);

  return <>{renderedContent}</>;
};

export default BarcodeComponent;
