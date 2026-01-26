import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  message,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  Tag,
  Tabs,
  Alert,
  Upload,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  DownloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import MonacoEditor from '@monaco-editor/react';
import { mockDataApi, schemaApi } from '../../services/api';
import type { MockData, SchemaDictionary } from '../../types';
import { generateMockData } from '../../utils/mockDataGenerator';

const MockDataManagement = () => {
  const [mockDataList, setMockDataList] = useState<MockData[]>([]);
  const [schemas, setSchemas] = useState<SchemaDictionary[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMockData, setEditingMockData] = useState<MockData | null>(null);
  const [form] = Form.useForm();
  const [jsonValue, setJsonValue] = useState('');
  const [filterSchemaId, setFilterSchemaId] = useState<string>();
  const [fileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    loadSchemas();
    loadMockData();
  }, []);

  useEffect(() => {
    loadMockData();
  }, [filterSchemaId]);

  const loadSchemas = async () => {
    try {
      const data = await schemaApi.list();
      setSchemas(data);
    } catch (error) {
      message.error('加载 Schema 列表失败');
      console.error(error);
    }
  };

  const loadMockData = async () => {
    setLoading(true);
    try {
      const data = await mockDataApi.list(
        filterSchemaId ? { schemaId: filterSchemaId } : undefined
      );
      setMockDataList(data);
    } catch (error) {
      message.error('加载 Mock 数据列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingMockData(null);
    form.resetFields();
    setJsonValue(JSON.stringify({}, null, 2));
    setModalOpen(true);
  };

  const handleEdit = (record: MockData) => {
    setEditingMockData(record);
    form.setFieldsValue({
      name: record.name,
      schemaId: record.schemaId,
      description: record.description,
    });
    setJsonValue(JSON.stringify(record.data, null, 2));
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await mockDataApi.delete(id);
      message.success('删除成功');
      loadMockData();
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  };

  // 智能生成 Mock 数据
  const handleGenerateMockData = () => {
    const schemaId = form.getFieldValue('schemaId');
    if (!schemaId) {
      message.warning('请先选择 Schema');
      return;
    }

    const schema = schemas.find((s) => s.id === schemaId);
    if (!schema) {
      message.error('Schema 不存在');
      return;
    }

    const mockData = generateMockData(schema.root);
    setJsonValue(JSON.stringify(mockData, null, 2));
    message.success('已生成 Mock 数据，请检查并修改');
  };

  // 导出 Mock 数据
  const handleExport = (record: MockData) => {
    const dataStr = JSON.stringify(record, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${record.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('导出成功');
  };

  // 批量导出
  const handleBatchExport = () => {
    if (mockDataList.length === 0) {
      message.warning('暂无数据');
      return;
    }
    const dataStr = JSON.stringify(mockDataList, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mock-data-batch.json';
    a.click();
    URL.revokeObjectURL(url);
    message.success(`已导出 ${mockDataList.length} 条数据`);
  };

  // 导入 Mock 数据
  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const imported = JSON.parse(content);

        if (Array.isArray(imported)) {
          // 批量导入
          message.success(`准备导入 ${imported.length} 条数据`);
          // TODO: 实现批量导入逻辑
        } else if (imported.name && imported.data) {
          // 单条导入（不强制要求 schemaId）
          form.setFieldsValue({
            name: imported.name,
            schemaId: imported.schemaId,
            description: imported.description,
          });
          setJsonValue(JSON.stringify(imported.data, null, 2));
          message.success('已加载数据，请保存');
        } else {
          message.error('文件格式不正确，至少包含 name 和 data 字段');
        }
      } catch (error) {
        message.error('文件解析失败');
      }
    };
    reader.readAsText(file);
    return false; // 阻止自动上传
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = JSON.parse(jsonValue);

      const payload: any = {
        ...values,
        data,
      };

      if (editingMockData) {
        await mockDataApi.update(editingMockData.id, { ...payload, id: editingMockData.id });
        message.success('更新成功');
      } else {
        await mockDataApi.create(payload);
        message.success('创建成功');
      }

      setModalOpen(false);
      loadMockData();
    } catch (error: any) {
      if (error.name === 'SyntaxError') {
        message.error('JSON 格式错误');
      } else {
        message.error('保存失败');
      }
      console.error(error);
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '关联 Schema',
      dataIndex: 'schemaId',
      key: 'schemaId',
      width: 200,
      render: (schemaId: string) => {
        if (!schemaId) {
          return <Tag color="default">未关联</Tag>;
        }
        const schema = schemas.find((s) => s.id === schemaId);
        return schema ? <Tag color="green">{schema.name}</Tag> : <Tag color="warning">已删除</Tag>;
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
      render: (_: any, record: MockData) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleExport(record)}
          >
            导出
          </Button>
          <Popconfirm
            title="确认删除？"
            description="删除后无法恢复"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建 Mock 数据
        </Button>
        <Upload
          accept=".json"
          showUploadList={false}
          beforeUpload={handleImport}
          fileList={fileList}
        >
          <Button icon={<UploadOutlined />}>导入</Button>
        </Upload>
        <Button icon={<DownloadOutlined />} onClick={handleBatchExport}>
          批量导出
        </Button>
        <Select
          style={{ width: 200 }}
          placeholder="筛选 Schema"
          allowClear
          value={filterSchemaId}
          onChange={setFilterSchemaId}
          options={schemas.map((s) => ({ value: s.id, label: s.name }))}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={mockDataList}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingMockData ? '编辑 Mock 数据' : '新建 Mock 数据'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={1200}
        okText="保存"
        cancelText="取消"
        style={{ top: 20 }}
      >
        <Form form={form} layout="vertical">
          <div style={{ display: 'flex', gap: 16 }}>
            {/* 左侧：基本信息 */}
            <div style={{ width: 300 }}>
              <Form.Item
                label="名称"
                name="name"
                rules={[{ required: true, message: '请输入名称' }]}
              >
                <Input placeholder="如：订单数据-示例1" />
              </Form.Item>
              <Form.Item
                label="关联 Schema"
                name="schemaId"
                tooltip="可选。关联 Schema 后可使用智能生成功能，也便于筛选和管理"
              >
                <Select
                  placeholder="选择 Schema（可选）"
                  allowClear
                  options={schemas.map((s) => ({ value: s.id, label: s.name }))}
                />
              </Form.Item>
              <Form.Item label="描述" name="description">
                <Input.TextArea rows={4} placeholder="数据说明" />
              </Form.Item>
            </div>

            {/* 右侧：JSON 编辑器 */}
            <div style={{ flex: 1 }}>
              <Tabs
                items={[
                  {
                    key: 'manual',
                    label: '手动编辑',
                    children: (
                      <div style={{ border: '1px solid #d9d9d9', borderRadius: 4 }}>
                        <MonacoEditor
                          height="500px"
                          language="json"
                          value={jsonValue}
                          onChange={(value: string | undefined) => setJsonValue(value || '')}
                          options={{
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                          }}
                        />
                      </div>
                    ),
                  },
                  {
                    key: 'auto',
                    label: <><ThunderboltOutlined /> 智能生成</>,
                    children: (
                      <div>
                        <Alert
                          message="根据 Schema 自动生成测试数据"
                          description="选择 Schema 后，系统将根据字段类型和名称智能生成测试数据。生成后可在「手动编辑」中调整。"
                          type="info"
                          showIcon
                          style={{ marginBottom: 16 }}
                        />
                        <Button
                          type="primary"
                          icon={<ThunderboltOutlined />}
                          onClick={handleGenerateMockData}
                          size="large"
                          block
                        >
                          生成 Mock 数据
                        </Button>
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default MockDataManagement;
