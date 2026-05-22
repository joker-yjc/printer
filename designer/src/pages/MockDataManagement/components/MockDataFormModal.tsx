import { Modal, Form, Input, Select, Tabs, Alert, Button, Spin } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd/es/form';
import MonacoEditor from '@monaco-editor/react';
import type { MockData, SchemaDictionary } from '../../../types';

interface MockDataFormModalProps {
  open: boolean;
  editingMockData: MockData | null;
  form: FormInstance;
  schemas: SchemaDictionary[];
  jsonValue: string;
  onJsonValueChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onGenerateMockData: () => void;
}

const MockDataFormModal = ({
  open,
  editingMockData,
  form,
  schemas,
  jsonValue,
  onJsonValueChange,
  onSubmit,
  onCancel,
  onGenerateMockData,
}: MockDataFormModalProps) => {
  return (
    <Modal
      title={editingMockData ? '编辑 Mock 数据' : '新建 Mock 数据'}
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
                        onClick={onGenerateMockData}
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
  );
};

export default MockDataFormModal;
