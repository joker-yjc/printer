import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  message,
  Modal,
  Form,
  Input,
  Popconfirm,
  Tag,
  Alert,
  Collapse,
  Typography,
  Tabs,
  Upload,
  Card,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  ThunderboltOutlined,
  DownloadOutlined,
  UploadOutlined,
  EyeOutlined,
  ReloadOutlined,
  FileOutlined,
  FolderOutlined,
  TableOutlined,
  FontSizeOutlined,
  NumberOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import MonacoEditor from '@monaco-editor/react';
import { schemaApi } from '../../services/api';
import type { SchemaDictionary, SchemaField } from '../../types';

const { Panel } = Collapse;
const { Paragraph, Text, Title } = Typography;

const SchemaManagement = () => {
  const [schemas, setSchemas] = useState<SchemaDictionary[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchema, setEditingSchema] = useState<SchemaDictionary | null>(null);
  const [form] = Form.useForm();
  const [jsonValue, setJsonValue] = useState('');
  const [mockJsonValue, setMockJsonValue] = useState('');
  const [helpVisible, setHelpVisible] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewSchema, setPreviewSchema] = useState<SchemaDictionary | null>(null);

  useEffect(() => {
    loadSchemas();
  }, []);

  // 根据字段类型获取图标
  const getFieldIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      string: <FontSizeOutlined style={{ color: '#52c41a' }} />,
      number: <NumberOutlined style={{ color: '#fa8c16' }} />,
      boolean: <CheckCircleOutlined style={{ color: '#13c2c2' }} />,
      date: <CalendarOutlined style={{ color: '#722ed1' }} />,
      datetime: <CalendarOutlined style={{ color: '#722ed1' }} />,
      array: <TableOutlined style={{ color: '#1890ff' }} />,
      object: <FolderOutlined style={{ color: '#8c8c8c' }} />,
    };
    return iconMap[type] || <FileOutlined style={{ color: '#d9d9d9' }} />;
  };

  // 将 SchemaField 转换为 Tree DataNode
  const convertSchemaToTree = (field: SchemaField, parentPath = ''): any[] => {
    const currentPath = parentPath ? `${parentPath}.${field.key}` : field.key;

    const node: any = {
      title: (
        <span>
          <strong>{field.label}</strong> <Text type="secondary">({field.key})</Text> -{' '}
          <Tag color="blue" style={{ marginLeft: 4 }}>{field.type}</Tag>
          {field.description && <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>{field.description}</Text>}
        </span>
      ),
      key: currentPath,
      icon: getFieldIcon(field.type),
    };

    if (field.type === 'object' && field.children) {
      node.children = field.children.flatMap((child) => convertSchemaToTree(child, currentPath));
    }

    if (field.type === 'array' && field.children) {
      node.children = field.children.flatMap((child) => convertSchemaToTree(child, currentPath));
    }

    return [node];
  };

  // 预览 Schema
  const handlePreview = (record: SchemaDictionary) => {
    setPreviewSchema(record);
    setPreviewModalOpen(true);
  };

  // 统计字段数量
  const countFields = (field: SchemaField): number => {
    let count = 1;
    if (field.children) {
      count += field.children.reduce((sum, child) => sum + countFields(child), 0);
    }
    return count;
  };

  const loadSchemas = async () => {
    setLoading(true);
    try {
      const data = await schemaApi.list();
      setSchemas(data);
    } catch (error) {
      message.error('加载 Schema 列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSchema(null);
    form.resetFields();
    setJsonValue(JSON.stringify({
      key: 'root',
      label: '根节点',
      type: 'object',
      children: []
    }, null, 2));
    setMockJsonValue('');
    setModalOpen(true);
  };

  const handleEdit = (record: SchemaDictionary) => {
    setEditingSchema(record);
    form.setFieldsValue({
      name: record.name,
      version: record.version,
      description: record.description,
    });
    setJsonValue(JSON.stringify(record.root, null, 2));
    setMockJsonValue('');
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await schemaApi.delete(id);
      message.success('删除成功');
      loadSchemas();
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  };

  // 从 Mock 数据生成 Schema
  const generateSchemaFromMock = () => {
    try {
      const mockData = JSON.parse(mockJsonValue);
      const schema = inferSchemaFromData(mockData, 'root', '根节点');
      setJsonValue(JSON.stringify(schema, null, 2));
      message.success('已生成 Schema，请检查并补充完整');
    } catch (error) {
      message.error('Mock 数据格式错误');
      console.error(error);
    }
  };

  // 递归推断数据类型和结构
  const inferSchemaFromData = (data: any, key: string, label: string): SchemaField => {
    if (data === null || data === undefined) {
      return { key, label, type: 'string' };
    }

    if (Array.isArray(data)) {
      if (data.length === 0) {
        return {
          key,
          label,
          type: 'array',
          children: [{ key: 'item', label: '数组项', type: 'string' }],
        };
      }
      // 使用第一个元素推断结构
      const firstItem = data[0];
      const itemSchema = inferSchemaFromData(firstItem, 'item', '数组项');
      return {
        key,
        label,
        type: 'array',
        children: itemSchema.type === 'object' ? itemSchema.children : [itemSchema],
      };
    }

    if (typeof data === 'object') {
      const children: SchemaField[] = Object.keys(data).map((childKey) => {
        const childValue = data[childKey];
        const childLabel = childKey; // 可以让用户后续修改
        return inferSchemaFromData(childValue, childKey, childLabel);
      });
      return { key, label, type: 'object', children };
    }

    // 基础类型推断
    if (typeof data === 'number') {
      return { key, label, type: 'number' };
    }
    if (typeof data === 'boolean') {
      return { key, label, type: 'boolean' };
    }
    // 尝试检测日期格式
    if (typeof data === 'string') {
      const datePattern = /^\d{4}-\d{2}-\d{2}/;
      if (datePattern.test(data)) {
        return { key, label, type: 'date' };
      }
    }

    return { key, label, type: 'string' };
  };

  // 导出 Schema
  const handleExport = (record: SchemaDictionary) => {
    const dataStr = JSON.stringify(record, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${record.name}-schema.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('导出成功');
  };

  // 批量导出
  const handleBatchExport = () => {
    if (schemas.length === 0) {
      message.warning('暂无数据');
      return;
    }
    const dataStr = JSON.stringify(schemas, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schemas-batch.json';
    a.click();
    URL.revokeObjectURL(url);
    message.success(`已导出 ${schemas.length} 个 Schema`);
  };

  // 导入 Schema
  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const imported = JSON.parse(content);

        if (Array.isArray(imported)) {
          // 批量导入
          message.success(`准备导入 ${imported.length} 个 Schema`);
          // TODO: 实现批量导入逻辑
        } else if (imported.name && imported.root) {
          // 单个导入
          form.setFieldsValue({
            name: imported.name,
            version: imported.version,
            description: imported.description,
          });
          setJsonValue(JSON.stringify(imported.root, null, 2));
          setModalOpen(true);
          message.success('已加载 Schema，请检查并保存');
        } else {
          message.error('文件格式不正确');
        }
      } catch (error) {
        message.error('文件解析失败');
      }
    };
    reader.readAsText(file);
    return false;
  };

  // Schema 字段说明
  const schemaHelpContent = (
    <div>
      <Alert
        message="重要提示"
        description="Schema 必须有一个顶层 root 节点，且 key 必须为 'root'，type 必须为 'object'。这是数据绑定的基础约定。"
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <Title level={5}>字段类型说明</Title>
      <Collapse ghost defaultActiveKey={['basic', 'complex', 'example']}>
        <Panel header="基础类型" key="basic">
          <Paragraph>
            <ul>
              <li><Text code>string</Text> - 字符串类型</li>
              <li><Text code>number</Text> - 数字类型</li>
              <li><Text code>boolean</Text> - 布尔类型</li>
              <li><Text code>date</Text> - 日期类型</li>
            </ul>
          </Paragraph>
        </Panel>
        <Panel header="复合类型" key="complex">
          <Paragraph>
            <ul>
              <li><Text code>object</Text> - 对象类型，需要 <Text code>children</Text> 字段</li>
              <li><Text code>array</Text> - 数组类型，需要 <Text code>children</Text> 字段</li>
            </ul>
          </Paragraph>
        </Panel>
        <Panel header="完整示例" key="example">
          <Paragraph>
            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
              {`{
  "key": "root",
  "label": "根节点",
  "type": "object",
  "children": [
    {
      "key": "orderNo",
      "label": "订单号",
      "type": "string"
    },
    {
      "key": "amount",
      "label": "金额",
      "type": "number"
    },
    {
      "key": "items",
      "label": "商品列表",
      "type": "array",
      "children": [
        {
          "key": "name",
          "label": "商品名称",
          "type": "string"
        },
        {
          "key": "price",
          "label": "单价",
          "type": "number"
        }
      ]
    }
  ]
}`}
            </pre>
          </Paragraph>
        </Panel>
      </Collapse>
    </div>
  );

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const root = JSON.parse(jsonValue);

      // 校验：必须有 root 节点
      if (!root || typeof root !== 'object') {
        message.error('Schema 格式错误：必须是一个对象');
        return;
      }

      // 强制校验：root 节点的 key 必须为 'root'
      if (root.key !== 'root') {
        message.error('Schema 校验失败：顶层节点的 key 必须为 "root"');
        return;
      }

      // 校验：root 节点必须是 object 类型
      if (root.type !== 'object') {
        message.error('Schema 校验失败：顶层节点必须是 object 类型');
        return;
      }

      const payload: any = {
        ...values,
        root,
      };

      if (editingSchema) {
        await schemaApi.update(editingSchema.id, { ...payload, id: editingSchema.id });
        message.success('更新成功');
      } else {
        await schemaApi.create(payload);
        message.success('创建成功');
      }

      setModalOpen(false);
      loadSchemas();
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
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 100,
      render: (version: string) => <Tag color="blue">{version}</Tag>,
    },
    {
      title: '字段数',
      key: 'fieldCount',
      width: 100,
      render: (_: any, record: SchemaDictionary) => (
        <Tag>{countFields(record.root)}</Tag>
      ),
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
      width: 150,
      render: (_: any, record: SchemaDictionary) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
          >
            预览
          </Button>
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
      {/* 统计信息 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Schema 总数"
              value={schemas.length}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总字段数"
              value={schemas.reduce((sum, s) => sum + countFields(s.root), 0)}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建 Schema
          </Button>
          <Upload
            accept=".json"
            showUploadList={false}
            beforeUpload={handleImport}
          >
            <Button icon={<UploadOutlined />}>导入</Button>
          </Upload>
          <Button icon={<ReloadOutlined />} onClick={loadSchemas}>
            刷新
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleBatchExport}>
            批量导出
          </Button>
          <Button icon={<QuestionCircleOutlined />} onClick={() => setHelpVisible(true)}>
            字段说明
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={schemas}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingSchema ? '编辑 Schema' : '新建 Schema'}
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
                <Input placeholder="如：订单 Schema" />
              </Form.Item>
              <Form.Item
                label="版本"
                name="version"
                rules={[{ required: true, message: '请输入版本' }]}
              >
                <Input placeholder="如：1.0.0" />
              </Form.Item>
              <Form.Item label="描述" name="description">
                <Input.TextArea rows={4} placeholder="Schema 说明" />
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
                      <div>
                        <Alert
                          message="字段说明"
                          description="key: 字段名 | label: 显示名 | type: 类型 (string/number/boolean/date/object/array) | children: 子字段(仅object/array)"
                          type="info"
                          showIcon
                          style={{ marginBottom: 8 }}
                        />
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
                      </div>
                    ),
                  },
                  {
                    key: 'auto',
                    label: <><ThunderboltOutlined /> 智能生成</>,
                    children: (
                      <div>
                        <Alert
                          message="从 Mock 数据自动推断 Schema"
                          description="粘贴 JSON 格式的样例数据，系统将自动推断字段类型和结构。生成后请检查并补充 label 等信息。"
                          type="warning"
                          showIcon
                          style={{ marginBottom: 8 }}
                        />
                        <div style={{ border: '1px solid #d9d9d9', borderRadius: 4, marginBottom: 12 }}>
                          <MonacoEditor
                            height="400px"
                            language="json"
                            value={mockJsonValue}
                            onChange={(value: string | undefined) => setMockJsonValue(value || '')}
                            options={{
                              minimap: { enabled: false },
                              scrollBeyondLastLine: false,
                            }}
                          />
                        </div>
                        <Button
                          type="primary"
                          icon={<ThunderboltOutlined />}
                          onClick={generateSchemaFromMock}
                          disabled={!mockJsonValue.trim()}
                          size="large"
                          block
                        >
                          生成 Schema
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

      {/* 预览模态框 */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            {previewSchema?.name}
          </Space>
        }
        open={previewModalOpen}
        onCancel={() => setPreviewModalOpen(false)}
        footer={[
          <Button key="export" icon={<DownloadOutlined />} onClick={() => previewSchema && handleExport(previewSchema)}>
            导出
          </Button>,
          <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => {
            if (previewSchema) {
              setPreviewModalOpen(false);
              handleEdit(previewSchema);
            }
          }}>
            编辑
          </Button>,
          <Button key="close" onClick={() => setPreviewModalOpen(false)}>
            关闭
          </Button>,
        ]}
        width={900}
      >
        {previewSchema && (
          <div>
            {/* 基本信息 */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Text type="secondary">名称：</Text>
                  <Text strong>{previewSchema.name}</Text>
                </Col>
                <Col span={8}>
                  <Text type="secondary">版本：</Text>
                  <Tag color="blue">{previewSchema.version}</Tag>
                </Col>
                <Col span={8}>
                  <Text type="secondary">ID：</Text>
                  <Text code>{previewSchema.id}</Text>
                </Col>
              </Row>
              {previewSchema.description && (
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">描述：</Text>
                  <Text>{previewSchema.description}</Text>
                </div>
              )}
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">字段数量：</Text>
                <Tag>{countFields(previewSchema.root)}</Tag>
              </div>
            </Card>

            {/* JSON 预览 */}
            <Collapse ghost>
              <Collapse.Panel header="查看 JSON 原文" key="json">
                <pre style={{
                  background: '#f5f5f5',
                  padding: 12,
                  borderRadius: 4,
                  maxHeight: 400,
                  overflow: 'auto',
                  fontSize: 12,
                }}>
                  {JSON.stringify(previewSchema, null, 2)}
                </pre>
              </Collapse.Panel>
            </Collapse>
          </div>
        )}
      </Modal>

      <Modal
        title="Schema 字段说明"
        open={helpVisible}
        onCancel={() => setHelpVisible(false)}
        footer={null}
        width={700}
      >
        {schemaHelpContent}
      </Modal>
    </div>
  );
};

export default SchemaManagement;
