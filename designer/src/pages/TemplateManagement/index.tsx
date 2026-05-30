import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  message,
  Popconfirm,
  Tag,
  Form,
  Input,
  Select,
  Upload,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  UploadOutlined,
  EyeOutlined,
  ReloadOutlined,
  FileTextOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { templateApi, schemaApi } from '../../services/api';
import type { PrintTemplate, SchemaDictionary } from '../../types';
import TemplateFormModal from './components/TemplateFormModal';
import TemplatePreviewModal from './components/TemplatePreviewModal';

const TemplateManagement = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<PrintTemplate[]>([]);
  const [schemas, setSchemas] = useState<SchemaDictionary[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PrintTemplate | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<PrintTemplate | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [selectedSchemaId, setSelectedSchemaId] = useState<string | undefined>();

  useEffect(() => {
    loadTemplates();
    loadSchemas();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await templateApi.list();
      setTemplates(data);
    } catch (error) {
      message.error('加载模板列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadSchemas = async () => {
    try {
      const data = await schemaApi.list();
      setSchemas(data);
    } catch (error) {
      console.error('加载 Schema 失败:', error);
    }
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    form.resetFields();
    setModalOpen(true);
  };

  // const handleEdit = (record: PrintTemplate) => {
  //   setEditingTemplate(record);
  //   form.setFieldsValue({
  //     name: record.name,
  //     schemaId: record.schemaId,
  //     description: record.description,
  //   });
  //   setModalOpen(true);
  // };

  const handleDelete = async (id: string) => {
    try {
      await templateApi.delete(id);
      message.success('删除成功');
      loadTemplates();
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingTemplate) {
        const updated = {
          ...editingTemplate,
          name: values.name,
          schemaId: values.schemaId,
          description: values.description,
        };
        await templateApi.update(editingTemplate.id, updated);
        message.success('更新成功');
      } else {
        const newTemplate: Omit<PrintTemplate, 'id'> = {
          name: values.name,
          version: '1.0.0',
          schemaId: values.schemaId,
          description: values.description,
          components: [],
          layoutMode: 'absolute',
          page: {
            size: 'A4',
            orientation: 'portrait',
            marginMm: { top: 5, right: 5, bottom: 5, left: 5 },
          },
        };
        await templateApi.create(newTemplate);
        message.success('创建成功');
      }

      setModalOpen(false);
      loadTemplates();
    } catch (error: any) {
      message.error('保存失败');
      console.error(error);
    }
  };

  const handleExport = (record: PrintTemplate) => {
    const dataStr = JSON.stringify(record, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${record.name}-template.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('导出成功');
  };

  const handleBatchExport = () => {
    if (templates.length === 0) {
      message.warning('暂无数据');
      return;
    }
    const dataStr = JSON.stringify(templates, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'templates-batch.json';
    a.click();
    URL.revokeObjectURL(url);
    message.success(`已导出 ${templates.length} 个模板`);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const imported = JSON.parse(content);

        if (Array.isArray(imported)) {
          let successCount = 0;
          for (const item of imported) {
            try {
              const { id, ...templateData } = item;
              await templateApi.create(templateData);
              successCount++;
            } catch (error) {
              console.error('导入失败:', error);
            }
          }
          message.success(`成功导入 ${successCount}/${imported.length} 个模板`);
          loadTemplates();
        } else if (imported.name && imported.components) {
          const { id, ...templateData } = imported;
          await templateApi.create(templateData);
          message.success('导入成功');
          loadTemplates();
        } else {
          message.error('文件格式不正确');
        }
      } catch (error) {
        message.error('文件解析失败');
        console.error(error);
      }
    };
    reader.readAsText(file);
    return false;
  };

  const handleCopy = async (record: PrintTemplate) => {
    try {
      const { id, ...templateData } = record;
      const copied = {
        ...templateData,
        name: `${record.name} (副本)`,
      };
      await templateApi.create(copied);
      message.success('复制成功');
      loadTemplates();
    } catch (error) {
      message.error('复制失败');
      console.error(error);
    }
  };

  const handlePreview = (record: PrintTemplate) => {
    setPreviewTemplate(record);
    setPreviewModalOpen(true);
  };

  const handleOpenInDesigner = (templateId: string) => {
    navigate(`/designer?templateId=${templateId}`);
  };

  const filteredTemplates = templates.filter((t) => {
    const matchName = !searchText || t.name.toLowerCase().includes(searchText.toLowerCase());
    const matchSchema = !selectedSchemaId || t.schemaId === selectedSchemaId;
    return matchName && matchSchema;
  });

  const columns = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string) => (
        <Space>
          <FileTextOutlined />
          <span>{name}</span>
        </Space>
      ),
    },
    {
      title: 'Schema',
      dataIndex: 'schemaId',
      key: 'schemaId',
      width: 150,
      render: (schemaId: string) => {
        if (!schemaId) {
          return <Tag color="default">未关联</Tag>;
        }
        const schema = schemas.find((s) => s.id === schemaId);
        return schema ? (
          <Tag color="blue">{schema.name}</Tag>
        ) : (
          <Tag color="warning">已删除</Tag>
        );
      },
    },
    {
      title: '组件数',
      key: 'componentCount',
      width: 100,
      render: (_: any, record: PrintTemplate) => {
        const total =
          (record.headerComponents?.length || 0) +
          record.components.length +
          (record.footerComponents?.length || 0);
        return <Tag>{total}</Tag>;
      },
    },
    {
      title: '纸张尺寸',
      key: 'pageSize',
      width: 120,
      render: (_: any, record: PrintTemplate) => {
        const { size, widthMm, heightMm } = record.page;
        if (size === 'CUSTOM' && widthMm && heightMm) {
          return <span>{widthMm}×{heightMm}mm</span>;
        }
        return <Tag>{size}</Tag>;
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => date ? new Date(date).toLocaleString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right' as const,
      render: (_: any, record: PrintTemplate) => (
        <Space size="small">
          <Tooltip title="预览">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
            />
          </Tooltip>
          <Tooltip title="在设计器中打开">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenInDesigner(record.id)}
            />
          </Tooltip>
          <Tooltip title="复制">
            <Button
              type="link"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(record)}
            />
          </Tooltip>
          <Tooltip title="导出">
            <Button
              type="link"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleExport(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确认删除？"
            description="删除后无法恢复"
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="删除">
              <Button type="link" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Space style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="搜索模板名称"
            allowClear
            style={{ width: 250 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="筛选 Schema"
            allowClear
            style={{ width: 200 }}
            value={selectedSchemaId}
            onChange={setSelectedSchemaId}
          >
            {schemas.map((schema) => (
              <Select.Option key={schema.id} value={schema.id}>
                {schema.name}
              </Select.Option>
            ))}
          </Select>
        </Space>
        <div>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              新建模板
            </Button>
            <Upload
              accept=".json"
              showUploadList={false}
              beforeUpload={handleImport}
            >
              <Button icon={<UploadOutlined />}>导入</Button>
            </Upload>
            <Button icon={<DownloadOutlined />} onClick={handleBatchExport}>
              批量导出
            </Button>
            <Button icon={<ReloadOutlined />} onClick={loadTemplates}>
              刷新
            </Button>
          </Space>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredTemplates}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />

      <TemplateFormModal
        open={modalOpen}
        editingTemplate={editingTemplate}
        schemas={schemas}
        form={form}
        onSubmit={handleSubmit}
        onCancel={() => setModalOpen(false)}
      />

      <TemplatePreviewModal
        open={previewModalOpen}
        previewTemplate={previewTemplate}
        schemas={schemas}
        onExport={handleExport}
        onEdit={handleOpenInDesigner}
        onClose={() => setPreviewModalOpen(false)}
      />
    </div>
  );
};

export default TemplateManagement;
