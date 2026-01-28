import { Modal, Button, Space, message, Select } from 'antd';
import { LeftOutlined, RightOutlined, PrinterOutlined } from '@ant-design/icons';
import { useState, useEffect, useRef } from 'react';
import { createPrintEngine, waitForImagesLoaded } from '@jcyao/print-sdk';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [printMode, setPrintMode] = useState<'single' | 'batch'>('single');
  const [batchCount, setBatchCount] = useState(0); // 批量打印的份数
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 加载 Mock 数据列表
  useEffect(() => {
    if (open) {
      loadMockData();
    }
  }, [open]);

  // 当 previewHtml 变化时，写入 iframe 并计算页数
  useEffect(() => {
    if (previewHtml && iframeRef.current) {
      const iframeDoc = iframeRef.current.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(previewHtml);
        iframeDoc.close();

        // 等待内容加载完成后计算页数
        setTimeout(() => {
          const pages = iframeDoc.querySelectorAll('.print-page');
          setTotalPages(pages.length);
          setCurrentPage(1);
          // 滚动到第一页
          scrollToPage(1);
        }, 100);
      }
    }
  }, [previewHtml]);

  // 滚动到指定页面
  const scrollToPage = (pageNum: number) => {
    if (!iframeRef.current) return;
    const iframeDoc = iframeRef.current.contentWindow?.document;
    if (!iframeDoc) return;

    const targetPage = iframeDoc.querySelector(`.print-page[data-page="${pageNum}"]`);
    if (targetPage) {
      targetPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 上一页
  const handlePrevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      scrollToPage(newPage);
    }
  };

  // 下一页
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      scrollToPage(newPage);
    }
  };

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

      const template = generateTemplate();

      // 判断是单份还是批量打印
      const isBatchData = Array.isArray(mockData.data);

      if (isBatchData) {
        // 批量打印模式：数据是数组
        setPrintMode('batch');
        setBatchCount(mockData.data.length);

        // 为每份数据生成 HTML，然后合并
        const allHtmlPages: string[] = [];

        for (let i = 0; i < mockData.data.length; i++) {
          const singleData = mockData.data[i];
          const engine = createPrintEngine(
            { ...template, id: `preview-${i}` } as any,
            singleData
          );
          const html = engine.generatePrintHTML();
          allHtmlPages.push(html);
        }

        // 合并所有页面的 HTML
        const mergedHtml = mergeBatchPrintHTML(allHtmlPages);
        setPreviewHtml(mergedHtml);

        message.success(`批量预览生成成功（${mockData.data.length} 份文档）`);
      } else {
        // 单份打印模式
        setPrintMode('single');
        setBatchCount(0);

        const engine = createPrintEngine(
          { ...template, id: 'preview' } as any,
          mockData.data
        );
        const html = engine.generatePrintHTML();
        setPreviewHtml(html);

        message.success('预览生成成功');
      }
    } catch (error) {
      message.error('生成预览失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 合并批量打印的 HTML
  const mergeBatchPrintHTML = (htmlPages: string[]): string => {
    if (htmlPages.length === 0) return '';

    // 提取第一个 HTML 的 head 和 body 结构
    const firstHtml = htmlPages[0];
    const headMatch = firstHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    const head = headMatch ? headMatch[0] : '<head></head>';

    // 提取所有页面的 body 内容，并在每份文档间添加分隔
    const allBodiesContent = htmlPages.map((html, index) => {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      const bodyContent = bodyMatch ? bodyMatch[1] : '';

      // 在每份文档前添加分隔线（除了第一份）
      const separator = index > 0 ? `
        <div style="page-break-before: always; height: 20px; background: linear-gradient(to right, #e0e0e0 50%, transparent 50%); background-size: 20px 2px; background-repeat: repeat-x; background-position: center; margin: 20px 0; position: relative;">
          <div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); background: white; padding: 0 10px; color: #999; font-size: 12px;">
            第 ${index + 1} 份文档
          </div>
        </div>
      ` : '';

      return separator + bodyContent;
    }).join('\n');

    // 组装完整的 HTML
    return `<!DOCTYPE html>
<html>
${head}
<body>
${allBodiesContent}
</body>
</html>`;
  };

  // 打印
  const handlePrint = async () => {
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

    // 等待所有图片加载完成后再打印
    try {
      await waitForImagesLoaded(printWindow.document);
      printWindow.print();
    } catch (error) {
      console.error('图片加载失败:', error);
      // 即使图片加载失败，也允许打印
      printWindow.print();
    }
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
          <Space size="middle" wrap>
            <Space>
              <span>选择 Mock 数据：</span>
              <Select
                style={{ width: 300 }}
                value={selectedMockDataId}
                onChange={(value) => {
                  setSelectedMockDataId(value);
                  // 检查是否为批量数据
                  const mock = mockDataList.find(m => m.id === value);
                  if (mock && Array.isArray(mock.data)) {
                    message.info(`已选择批量数据，包含 ${mock.data.length} 份文档`);
                  }
                }}
                options={mockDataList.map(item => ({
                  label: `${item.name} ${Array.isArray(item.data) ? `(批量 ${item.data.length}份)` : ''}`,
                  value: item.id,
                }))}
                placeholder="请选择 Mock 数据"
              />
            </Space>
            <Button type="primary" onClick={handleGeneratePreview} loading={loading}>
              生成预览
            </Button>
            <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint} disabled={!previewHtml}>
              打印
            </Button>
            {printMode === 'batch' && batchCount > 0 && (
              <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                📋 批量模式：{batchCount} 份文档
              </span>
            )}
          </Space>
        </div>

        {/* 页码导航栏 */}
        {previewHtml && totalPages > 0 && (
          <div className={styles['pagination-bar']}>
            <Space size="large">
              <Space>
                <Button
                  icon={<LeftOutlined />}
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  size="small"
                >
                  上一页
                </Button>
                <span className={styles['page-info']}>
                  第 <span className={styles['current-page']}>{currentPage}</span> 页 / 共 {totalPages} 页
                </span>
                <Button
                  icon={<RightOutlined />}
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  size="small"
                  iconPosition="end"
                >
                  下一页
                </Button>
              </Space>
            </Space>
          </div>
        )}

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
