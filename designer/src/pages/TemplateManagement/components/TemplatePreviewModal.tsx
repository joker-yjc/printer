import { Modal, Button, Space, Card, Row, Col, Tag } from 'antd';
import { EyeOutlined, EditOutlined, DownloadOutlined } from '@ant-design/icons';
import type { PrintTemplate, SchemaDictionary } from '../../../types';

interface TemplatePreviewModalProps {
  open: boolean;
  previewTemplate: PrintTemplate | null;
  schemas: SchemaDictionary[];
  onExport: (template: PrintTemplate) => void;
  onEdit: (templateId: string) => void;
  onClose: () => void;
}

const TemplatePreviewModal = ({
  open,
  previewTemplate,
  schemas,
  onExport,
  onEdit,
  onClose,
}: TemplatePreviewModalProps) => {
  return (
    <Modal
      title={
        <Space>
          <EyeOutlined />
          {previewTemplate?.name}
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="export" icon={<DownloadOutlined />} onClick={() => previewTemplate && onExport(previewTemplate)}>
          导出
        </Button>,
        <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => {
          if (previewTemplate) {
            onClose();
            onEdit(previewTemplate.id);
          }
        }}>
          在设计器中打开
        </Button>,
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
      ]}
      width={900}
    >
      {previewTemplate && (
        <div>
          <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <div><strong>模板名称：</strong>{previewTemplate.name}</div>
              </Col>
              <Col span={8}>
                <div>
                  <strong>Schema：</strong>
                  {previewTemplate.schemaId
                    ? (schemas.find((s) => s.id === previewTemplate.schemaId)?.name || '已删除')
                    : '未关联'}
                </div>
              </Col>
              <Col span={8}>
                <div><strong>组件数：</strong>{previewTemplate.components.length}</div>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 12 }}>
              <Col span={8}>
                <div>
                  <strong>纸张尺寸：</strong>
                  {previewTemplate.page.size === 'CUSTOM' && previewTemplate.page.widthMm && previewTemplate.page.heightMm
                    ? `${previewTemplate.page.widthMm}×${previewTemplate.page.heightMm}mm`
                    : previewTemplate.page.size}
                </div>
              </Col>
              <Col span={8}>
                <div>
                  <strong>方向：</strong>
                  {previewTemplate.page.orientation === 'portrait' ? '纵向' : '横向'}
                </div>
              </Col>
              <Col span={8}>
                <div><strong>ID：</strong><Tag>{previewTemplate.id}</Tag></div>
              </Col>
            </Row>
            {previewTemplate.description && (
              <div style={{ marginTop: 12 }}>
                <strong>描述：</strong>{previewTemplate.description}
              </div>
            )}
          </Card>

          <Card size="small" title="组件列表">
            {previewTemplate.components.length > 0 ? (
              <div style={{ maxHeight: 300, overflow: 'auto' }}>
                {previewTemplate.components.map((comp) => (
                  <div key={comp.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Tag color="blue">{comp.type}</Tag>
                    <span style={{ marginLeft: 8 }}>
                      位置: ({comp.layout.xMm || 0}, {comp.layout.yMm || 0})
                      尺寸: {comp.layout.widthMm || 0}×{comp.layout.heightMm || 0}mm
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>
                暂无组件
              </div>
            )}
          </Card>
        </div>
      )}
    </Modal>
  );
};

export default TemplatePreviewModal;
