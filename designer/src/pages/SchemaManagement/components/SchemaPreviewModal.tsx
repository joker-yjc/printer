import { Modal, Button, Space, Card, Row, Col, Tag, Collapse } from 'antd';
import { EyeOutlined, EditOutlined, DownloadOutlined } from '@ant-design/icons';
import type { SchemaDictionary } from '../../../types';

interface SchemaPreviewModalProps {
  open: boolean;
  previewSchema: SchemaDictionary | null;
  onExport: (schema: SchemaDictionary) => void;
  onEdit: (schema: SchemaDictionary) => void;
  onClose: () => void;
}

const SchemaPreviewModal = ({
  open,
  previewSchema,
  onExport,
  onEdit,
  onClose,
}: SchemaPreviewModalProps) => {
  return (
    <Modal
      title={
        <Space>
          <EyeOutlined />
          {previewSchema?.name}
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="export" icon={<DownloadOutlined />} onClick={() => previewSchema && onExport(previewSchema)}>
          导出
        </Button>,
        <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => {
          if (previewSchema) {
            onClose();
            onEdit(previewSchema);
          }
        }}>
          编辑
        </Button>,
        <Button key="close" onClick={onClose}>
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
                <span style={{ color: '#999' }}>名称：</span>
                <strong>{previewSchema.name}</strong>
              </Col>
              <Col span={8}>
                <span style={{ color: '#999' }}>版本：</span>
                <Tag color="blue">{previewSchema.version}</Tag>
              </Col>
              <Col span={8}>
                <span style={{ color: '#999' }}>ID：</span>
                <code>{previewSchema.id}</code>
              </Col>
            </Row>
            {previewSchema.description && (
              <div style={{ marginTop: 8 }}>
                <span style={{ color: '#999' }}>描述：</span>
                {previewSchema.description}
              </div>
            )}
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
  );
};

export default SchemaPreviewModal;
