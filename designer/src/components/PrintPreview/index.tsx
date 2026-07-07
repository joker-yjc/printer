import { Modal, Button, Space, message, Select, Segmented } from 'antd';
import { LeftOutlined, RightOutlined, PrinterOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState, useEffect, useRef } from 'react';
import { createPrintSDK } from '@jcyao/print-sdk';
import { useDesignerStore } from '../../store/designer';
import { mockDataApi, templateApi } from '../../services/api';
import type { MockData, PrintTemplate } from '../../types';
import styles from './index.module.css';

interface PrintPreviewProps {
  open: boolean;
  onClose: () => void;
}

/** 模板组（内部状态） */
interface TemplateGroup {
  key: string;
  templateSource: 'current' | string;
  templateLabel: string;
  dataId: string;
}

let groupKeyCounter = 0;

/** 共享 SDK 实例（无状态，可安全复用；后续如需自定义管道等配置，统一在此处传入） */
const sdk = createPrintSDK();

const PrintPreview = ({ open, onClose }: PrintPreviewProps) => {
  const { generateTemplate, components, headerComponents, footerComponents } = useDesignerStore();
  const [mockDataList, setMockDataList] = useState<MockData[]>([]);
  const [selectedMockDataId, setSelectedMockDataId] = useState<string>();
  const [previewHtml, setPreviewHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [printMode, setPrintMode] = useState<'single' | 'batch'>('single');
  const [batchCount, setBatchCount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  /** 模板模式：单模板 / 多模板 */
  const [templateMode, setTemplateMode] = useState<'single' | 'multi'>('single');
  /** 已保存的模板列表 */
  const [savedTemplates, setSavedTemplates] = useState<PrintTemplate[]>([]);
  /** 已加载的模板缓存（id → 完整模板数据，用于预览生成） */
  const templateCacheRef = useRef<Map<string, PrintTemplate>>(new Map());
  /** 模板组列表 */
  const [templateGroups, setTemplateGroups] = useState<TemplateGroup[]>([
    { key: `group-${++groupKeyCounter}`, templateSource: 'current', templateLabel: '当前画布模板', dataId: '' },
  ]);

  useEffect(() => {
    if (open) {
      loadMockData();
      loadSavedTemplates();
      resetState();
    }
  }, [open]);

  useEffect(() => {
    if (previewHtml && iframeRef.current) {
      const iframeDoc = iframeRef.current.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(previewHtml);
        iframeDoc.close();

        setTimeout(() => {
          const pages = iframeDoc!.querySelectorAll('.print-page');
          setTotalPages(pages.length);
          setCurrentPage(1);
          scrollToPage(1);
        }, 100);
      }
    }
  }, [previewHtml]);

  const resetState = () => {
    setPreviewHtml('');
    setTotalPages(0);
    setCurrentPage(1);
    setPrintMode('single');
    setBatchCount(0);
    setTemplateMode('single');
    setTemplateGroups([
      { key: `group-${++groupKeyCounter}`, templateSource: 'current', templateLabel: '当前画布模板', dataId: '' },
    ]);
  };

  const scrollToPage = (pageNum: number) => {
    if (!iframeRef.current) return;
    const iframeDoc = iframeRef.current.contentWindow?.document;
    if (!iframeDoc) return;
    const targetPage = iframeDoc.querySelector(`.print-page[data-page="${pageNum}"]`);
    if (targetPage) {
      targetPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      scrollToPage(newPage);
    }
  };

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

  const loadSavedTemplates = async () => {
    try {
      const data = await templateApi.list();
      setSavedTemplates(data);
    } catch (error) {
      console.error('加载模板列表失败:', error);
    }
  };

  /** 获取指定组的模板数据 */
  const getTemplateForGroup = async (group: TemplateGroup): Promise<PrintTemplate | null> => {
    if (group.templateSource === 'current') {
      return generateTemplate() as PrintTemplate;
    }
    if (templateCacheRef.current.has(group.templateSource)) {
      return templateCacheRef.current.get(group.templateSource)!;
    }
    try {
      const tpl = await templateApi.get(group.templateSource);
      templateCacheRef.current.set(group.templateSource, tpl);
      return tpl;
    } catch (error) {
      console.error(`加载模板 ${group.templateLabel} 失败:`, error);
      return null;
    }
  };

  /** 获取指定组的数据 */
  const getDataForGroup = (group: TemplateGroup): any | null => {
    const mockData = mockDataList.find(item => item.id === group.dataId);
    if (!mockData) return null;
    return mockData.data;
  };

  const handleGeneratePreview = async () => {
    if (templateMode === 'single') {
      await generateSinglePreview();
    } else {
      await generateMultiPreview();
    }
  };

  /** 单模板模式预览生成 */
  const generateSinglePreview = async () => {
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

      const template = { ...generateTemplate(), id: 'preview' } as PrintTemplate;
      const isBatchData = Array.isArray(mockData.data);

      if (isBatchData) {
        setPrintMode('batch');
        setBatchCount(mockData.data.length);

        const mergedHtml = await sdk.generateHTMLMultiple(template, mockData.data);
        setPreviewHtml(mergedHtml);
        message.success(`批量预览生成成功（${mockData.data.length} 份文档）`);
      } else {
        setPrintMode('single');
        setBatchCount(0);

        const html = await sdk.generateHTML(template, mockData.data);
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

  /** 多模板模式预览生成 */
  const generateMultiPreview = async () => {
    const validGroups = templateGroups.filter(g => g.dataId);
    if (validGroups.length === 0) {
      message.error('请为至少一个模板组选择数据');
      return;
    }

    if (components.length === 0 && headerComponents.length === 0 && footerComponents.length === 0) {
      message.warning('当前画布无组件，包含"当前画布模板"的组将为空');
    }

    setLoading(true);
    try {
      const groups: { template: PrintTemplate; dataList: any[] }[] = [];
      let totalDocs = 0;
      let failedCount = 0;

      for (const group of templateGroups) {
        const template = await getTemplateForGroup(group);
        if (!template) {
          failedCount++;
          continue;
        }

        const data = getDataForGroup(group);
        if (!data) {
          failedCount++;
          continue;
        }

        const dataItems: any[] = Array.isArray(data) ? data : [data];
        groups.push({
          template: { ...template, id: group.key } as PrintTemplate,
          dataList: dataItems,
        });
        totalDocs += dataItems.length;
      }

      if (groups.length === 0) {
        message.error('无可打印内容，请检查模板和数据配置');
        return;
      }

      const mergedHtml = await sdk.generateHTMLMultiTemplate(groups);
      setPreviewHtml(mergedHtml);
      setPrintMode('batch');
      setBatchCount(totalDocs);

      if (failedCount > 0) {
        message.warning(`预览生成完成（${totalDocs} 份文档，${failedCount} 组失败）`);
      } else {
        message.success(`预览生成完成（${totalDocs} 份文档）`);
      }
    } catch (error) {
      message.error('生成预览失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /** 打印（通过 SDK API，无需依赖 previewHtml） */
  const handlePrint = async () => {
    if (templateMode === 'single') {
      await handlePrintSingle();
    } else {
      await handlePrintMulti();
    }
  };

  const handlePrintSingle = async () => {
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

      const template = { ...generateTemplate(), id: 'preview' } as PrintTemplate;

      if (Array.isArray(mockData.data)) {
        await sdk.printMultiple(template, mockData.data, { preview: true });
        message.success(`批量打印已发起（${mockData.data.length} 份文档）`);
      } else {
        await sdk.print({ template, data: mockData.data, preview: true });
        message.success('打印已发起');
      }
    } catch (error) {
      message.error('打印失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintMulti = async () => {
    const validGroups = templateGroups.filter(g => g.dataId && g.templateSource);
    if (validGroups.length === 0) {
      message.error('请为至少一个模板组选择模板和数据');
      return;
    }

    setLoading(true);
    try {
      const groups: { template: PrintTemplate; dataList: any[] }[] = [];

      for (const group of validGroups) {
        const template = await getTemplateForGroup(group);
        if (!template) continue;

        const data = getDataForGroup(group);
        if (!data) continue;

        groups.push({
          template,
          dataList: Array.isArray(data) ? data : [data],
        });
      }

      if (groups.length === 0) {
        message.error('没有有效模板组可打印');
        return;
      }

      await sdk.printMultiTemplate(groups, { preview: true });
      message.success('打印已发起');
    } catch (error) {
      message.error('打印失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /** 添加模板组 */
  const handleAddGroup = () => {
    setTemplateGroups(prev => [
      ...prev,
      {
        key: `group-${++groupKeyCounter}`,
        templateSource: '',
        templateLabel: '',
        dataId: '',
      },
    ]);
  };

  /** 删除模板组 */
  const handleRemoveGroup = (key: string) => {
    setTemplateGroups(prev => {
      if (prev.length <= 1) {
        message.warning('至少保留一个模板组');
        return prev;
      }
      return prev.filter(g => g.key !== key);
    });
  };

  /** 更新模板组 */
  const updateGroup = (key: string, patch: Partial<TemplateGroup>) => {
    setTemplateGroups(prev =>
      prev.map(g => (g.key === key ? { ...g, ...patch } : g))
    );
  };

  /** 模板选择下拉选项 */
  const templateOptions = [
    { label: '当前画布模板', value: 'current' },
    ...savedTemplates.map(t => ({ label: t.name, value: t.id })),
  ];

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
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Segmented
              value={templateMode}
              onChange={(value) => setTemplateMode(value as 'single' | 'multi')}
              options={[
                { label: '单模板模式', value: 'single' },
                { label: '多模板模式', value: 'multi' },
              ]}
            />

            {templateMode === 'single' && (
              <Space size="middle" wrap>
                <Space>
                  <span>选择 Mock 数据：</span>
                  <Select
                    style={{ width: 300 }}
                    value={selectedMockDataId}
                    onChange={(value) => {
                      setSelectedMockDataId(value);
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
                <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint} loading={loading}>
                  打印
                </Button>
                {printMode === 'batch' && batchCount > 0 && (
                  <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                    📋 批量模式：{batchCount} 份文档
                  </span>
                )}
              </Space>
            )}

            {templateMode === 'multi' && (
              <>
                <div className={styles['template-group-list']}>
                  {templateGroups.map((group, index) => (
                    <div key={group.key} className={styles['template-group-row']}>
                      <span className={styles['group-index']}>#{index + 1}</span>
                      <Select
                        className={styles['group-template-select']}
                        value={group.templateSource || undefined}
                        onChange={(value) => {
                          const label = value === 'current'
                            ? '当前画布模板'
                            : savedTemplates.find(t => t.id === value)?.name || '';
                          updateGroup(group.key, { templateSource: value, templateLabel: label });
                        }}
                        options={templateOptions}
                        placeholder="选择模板"
                      />
                      <Select
                        className={styles['group-data-select']}
                        value={group.dataId || undefined}
                        onChange={(value) => updateGroup(group.key, { dataId: value })}
                        options={mockDataList.map(item => ({
                          label: `${item.name} ${Array.isArray(item.data) ? `(批量 ${item.data.length}份)` : ''}`,
                          value: item.id,
                        }))}
                        placeholder="选择数据"
                      />
                      <Button
                        icon={<DeleteOutlined />}
                        size="small"
                        danger
                        onClick={() => handleRemoveGroup(group.key)}
                        disabled={templateGroups.length <= 1}
                      />
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={handleAddGroup}
                    block
                  >
                    添加模板组
                  </Button>
                </div>
                <Space size="middle" wrap>
                  <Button type="primary" onClick={handleGeneratePreview} loading={loading}>
                    生成预览
                  </Button>
                  <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint} loading={loading}>
                    打印
                  </Button>
                  {previewHtml && batchCount > 0 && (
                    <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                      📋 {templateGroups.length} 组模板，{batchCount} 份文档
                    </span>
                  )}
                </Space>
              </>
            )}
          </Space>
        </div>

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
