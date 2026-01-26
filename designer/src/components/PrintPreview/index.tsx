import { Modal, Button, Space, message, Select } from 'antd';
import { useState, useEffect, useRef } from 'react';
import { createPrintEngine } from '@printer/sdk';
import { useDesignerStore } from '../../store/designer';
import { mockDataApi } from '../../services/api';
import type { MockData } from '../../types';
import styles from './index.module.css';

interface PrintPreviewProps {
  open: boolean;
  onClose: () => void;
}

const PrintPreview = ({ open, onClose }: PrintPreviewProps) => {
  const { generateTemplate } = useDesignerStore();
  const [mockDataList, setMockDataList] = useState<MockData[]>([]);
  const [selectedMockDataId, setSelectedMockDataId] = useState<string>();
  const [previewHtml, setPreviewHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 加载 Mock 数据列表
  useEffect(() => {
    if (open) {
      loadMockData();
    }
  }, [open]);

  // 当 previewHtml 变化时，写入 iframe
  useEffect(() => {
    if (previewHtml && iframeRef.current) {
      const iframeDoc = iframeRef.current.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(previewHtml);
        iframeDoc.close();
      }
    }
  }, [previewHtml]);

  const loadMockData = async () => {
    setLoading(true);
    try {
      const data = await mockDataApi.list();
      // Mock 数据不与 Schema 强绑定，显示所有可用数据
      setMockDataList(data);
      if (data.length > 0) {
        setSelectedMockDataId(data[0].id);
      }
    } catch (error) {
      message.error('加载 Mock 数据失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 生成预览
  const handleGeneratePreview = async () => {
    if (!selectedMockDataId) {
      message.error('请选择 Mock 数据');
      return;
    }

    setLoading(true);
    try {
      const mockData = mockDataList.find(item => item.id === selectedMockDataId);
      if (!mockData) {
        message.error('Mock 数据不存在');
        return;
      }
      console.log(mockData, "mockData");
      const template = generateTemplate();

      // ✅ 使用 SDK 的 createPrintEngine
      const engine = createPrintEngine(
        { ...template, id: 'preview' } as any,
        mockData.data
      );

      const html = engine.generatePrintHTML();
      setPreviewHtml(html);

      message.success('预览生成成功');
    } catch (error) {
      message.error('生成预览失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 打印
  const handlePrint = () => {
    if (!previewHtml) {
      message.error('请先生成预览');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      message.error('无法打开打印窗口，请检查浏览器设置');
      return;
    }

    // ✅ 直接使用预览的 HTML，确保预览和打印完全一致
    printWindow.document.write(previewHtml);
    printWindow.document.close();

    // 二维码和条形码已同步生成为base64图片，无需等待，直接打印
    printWindow.print();
  };

  return (
    <Modal
      title="打印预览"
      open={open}
      onCancel={onClose}
      width={1000}
      footer={null}
    >
      <div className={styles['print-preview-container']}>
        <div className={styles['preview-controls']}>
          <Space>
            <span>选择 Mock 数据：</span>
            <Select
              style={{ width: 300 }}
              value={selectedMockDataId}
              onChange={setSelectedMockDataId}
              options={mockDataList.map(item => ({
                label: item.name,
                value: item.id,
              }))}
              placeholder="请选择 Mock 数据"
            />
            <Button type="primary" onClick={handleGeneratePreview} loading={loading}>
              生成预览
            </Button>
            <Button type="primary" onClick={handlePrint} disabled={!previewHtml}>
              打印
            </Button>
          </Space>
        </div>

        <div className={styles['preview-content']}>
          {previewHtml ? (
            <iframe
              ref={iframeRef}
              className={styles['preview-iframe']}
              title="打印预览"
            />
          ) : (
            <div className={styles['preview-empty']}>
              <p>👆 请选择 Mock 数据并点击"生成预览"按钮</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PrintPreview;
