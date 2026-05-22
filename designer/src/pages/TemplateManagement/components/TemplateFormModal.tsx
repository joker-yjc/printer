import { Modal, Form, Input, Select } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { PrintTemplate, SchemaDictionary } from '../../../types';

interface TemplateFormModalProps {
  open: boolean;
  editingTemplate: PrintTemplate | null;
  schemas: SchemaDictionary[];
  form: FormInstance;
  onSubmit: () => void;
  onCancel: () => void;
}

const TemplateFormModal = ({
  open,
  editingTemplate,
  schemas,
  form,
  onSubmit,
  onCancel,
}: TemplateFormModalProps) => {
  return (
    <Modal
      title={editingTemplate ? '编辑模板信息' : '新建模板'}
      open={open}
      onOk={onSubmit}
      onCancel={onCancel}
      okText="保存"
      cancelText="取消"
    >
      <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
        <Form.Item
          label="模板名称"
          name="name"
          rules={[{ required: true, message: '请输入模板名称' }]}
        >
          <Input placeholder="如：订单打印模板" />
        </Form.Item>
        <Form.Item
          label="关联 Schema"
          name="schemaId"
          tooltip="可选。关联 Schema 后可便于管理和分类，但不影响模板使用"
        >
          <Select placeholder="选择数据 Schema（可选）" allowClear>
            {schemas.map((schema) => (
              <Select.Option key={schema.id} value={schema.id}>
                {schema.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="描述" name="description">
          <Input.TextArea rows={3} placeholder="模板说明" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TemplateFormModal;
