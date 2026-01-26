import { useState } from 'react';
import { Button, Drawer, Typography } from 'antd';
import { CodeOutlined } from '@ant-design/icons';
import { useDesignerStore } from '../../../../store/designer';
import './index.css';

const { Text } = Typography;

const DebugPanel = () => {
  const [open, setOpen] = useState(false);
  const { generateTemplate, components, templateName, schemaId } = useDesignerStore();

  const templateJson = generateTemplate();

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(templateJson, null, 2));
  };

  return (
    <>
      <Button
        type="default"
        icon={<CodeOutlined />}
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        调试面板
      </Button>

      <Drawer
        title="模板 JSON Schema"
        placement="right"
        width={600}
        open={open}
        onClose={() => setOpen(false)}
        extra={
          <Button type="primary" onClick={handleCopy}>
            复制 JSON
          </Button>
        }
      >
        <div className="debug-panel">
          <div className="debug-info">
            <Text strong>模板名称：</Text>
            <Text>{templateName}</Text>
          </div>
          <div className="debug-info">
            <Text strong>Schema ID：</Text>
            <Text>{schemaId || '未绑定'}</Text>
          </div>
          <div className="debug-info">
            <Text strong>组件数量：</Text>
            <Text>{components.length}</Text>
          </div>

          <div className="debug-divider" />

          <div className="debug-json">
            <pre>{JSON.stringify(templateJson, null, 2)}</pre>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default DebugPanel;
