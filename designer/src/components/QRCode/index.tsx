import { useState, useEffect, useMemo } from 'react';
import { QrcodeOutlined } from '@ant-design/icons';
import QRCode from 'qrcode';

interface QRCodeComponentProps {
  content: string;
  size: number;
}

const QRCodeComponent = ({ content, size }: QRCodeComponentProps) => {
  const [qrDataURL, setQrDataURL] = useState('');

  // 使用 useMemo 缓存 content 和 size 的组合
  const cacheKey = useMemo(() => `${content}-${size}`, [content, size]);

  useEffect(() => {
    QRCode.toDataURL(content, { width: size, margin: 0 }, (err: any, url: string) => {
      if (!err) setQrDataURL(url);
    });
  }, [cacheKey]); // 使用 cacheKey 而不是 content 和 size

  // 使用 useMemo 缓存渲染结果
  const renderedContent = useMemo(() => {
    return qrDataURL ? (
      <img
        src={qrDataURL}
        style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
        alt="QR Code"
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
        <QrcodeOutlined style={{ fontSize: 24, color: '#999' }} />
      </div>
    );
  }, [qrDataURL]);

  return <>{renderedContent}</>;
};

export default QRCodeComponent;
