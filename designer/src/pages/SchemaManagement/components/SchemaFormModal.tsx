import { Modal, Form, Input, Tabs, Alert, Button, Spin } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd/es/form';
import MonacoEditor from '@monaco-editor/react';
import type { SchemaDictionary } from '../../../types';

interface SchemaFormModalProps {
  open: boolean;
  editingSchema: SchemaDictionary | null;
  form: FormInstance;
  jsonValue: string;
  onJsonValueChange: (value: string) => void;
  mockJsonValue: string;
  onMockJsonValueChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onGenerateFromMock: () => void;
}

const SchemaFormModal = ({
  open,
  editingSchema,
  form,
  jsonValue,
  onJsonValueChange,
  mockJsonValue,
  onMockJsonValueChange,
  onSubmit,
  onCancel,
  onGenerateFromMock,
}: SchemaFormModalProps) => {
  return (
    <Modal
      title={editingSchema ? '编辑 Schema' : '新建 Schema'}
      open={open}
      onOk={onSubmit}
      onCancel={onCancel}
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
                          onChange={(value: string | undefined) => onJsonValueChange(value || '')}
                          loading={
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Spin tip="编辑器加载中..." />
                            </div>
                          }
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
                          onChange={(value: string | undefined) => onMockJsonValueChange(value || '')}
                          loading={
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Spin tip="编辑器加载中..." />
                            </div>
                          }
                          options={{
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                          }}
                        />
                      </div>
                      <Button
                        type="primary"
                        icon={<ThunderboltOutlined />}
                        onClick={onGenerateFromMock}
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
  );
};

export default SchemaFormModal;
