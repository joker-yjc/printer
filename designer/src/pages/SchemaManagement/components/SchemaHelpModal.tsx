import { Modal } from 'antd';
import { ReactNode } from 'react';

interface SchemaHelpModalProps {
  open: boolean;
  content: ReactNode;
  onClose: () => void;
}

const SchemaHelpModal = ({ open, content, onClose }: SchemaHelpModalProps) => {
  return (
    <Modal
      title="Schema 字段说明"
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      {content}
    </Modal>
  );
};

export default SchemaHelpModal;
