import { Layout, Button, Tooltip, Space, message, Tabs } from 'antd';
import { ArrowLeftOutlined, CodeOutlined, MenuFoldOutlined, MenuUnfoldOutlined, SettingOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AssetPanel from './components/AssetPanel';
import Canvas from './components/Canvas';
import PropertyPanel from './components/PropertyPanel';
import ComponentTreePanel from './components/ComponentTreePanel';
import { Drawer, Typography } from 'antd';
import { useDesignerStore } from '../../store/designer';
import { templateApi } from '../../services/api';
import './index.module.css';

const { Sider, Content } = Layout;
const { Text } = Typography;

const Designer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [debugOpen, setDebugOpen] = useState(false);
  const [, setLoading] = useState(false);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const { generateTemplate, components, templateName, schemaId, loadTemplate } = useDesignerStore();

  // 加载 URL 参数中的模板
  useEffect(() => {
    const templateId = searchParams.get('templateId');
    if (templateId) {
      loadTemplateById(templateId);
    }
  }, [searchParams]);

  const loadTemplateById = async (templateId: string) => {
    setLoading(true);
    try {
      const template = await templateApi.get(templateId);
      loadTemplate(template);
      message.success(`模板「${template.name}」加载成功`);
    } catch (error) {
      message.error('加载模板失败');
      console.error('加载模板错误:', error);
    } finally {
      setLoading(false);
    }
  };

  const templateJson = generateTemplate();

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(templateJson, null, 2));
  };

  return (
    <Layout className="designer-container" style={{ height: '100vh' }}>
      {/* 左侧面板折叠按钮 */}
      {!leftPanelCollapsed && (
        <div style={{
          position: 'fixed',
          left: 280,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1000,
        }}>
          <Tooltip title="折叠左侧面板" placement="right">
            <Button
              type="text"
              icon={<MenuFoldOutlined />}
              onClick={() => setLeftPanelCollapsed(true)}
              style={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                background: '#fff',
              }}
            />
          </Tooltip>
        </div>
      )}

      {leftPanelCollapsed && (
        <div style={{
          position: 'fixed',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1000,
        }}>
          <Tooltip title="展开左侧面板" placement="right">
            <Button
              type="primary"
              icon={<MenuUnfoldOutlined />}
              onClick={() => setLeftPanelCollapsed(false)}
              style={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            />
          </Tooltip>
        </div>
      )}

      {/* 右侧面板折叠按钮 */}
      {!rightPanelCollapsed && (
        <div style={{
          position: 'fixed',
          right: 320,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1000,
        }}>
          <Tooltip title="折叠右侧面板" placement="left">
            <Button
              type="text"
              icon={<MenuFoldOutlined style={{ transform: 'rotate(180deg)' }} />}
              onClick={() => setRightPanelCollapsed(true)}
              style={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                background: '#fff',
              }}
            />
          </Tooltip>
        </div>
      )}

      {rightPanelCollapsed && (
        <div style={{
          position: 'fixed',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1000,
        }}>
          <Tooltip title="展开右侧面板" placement="left">
            <Button
              type="primary"
              icon={<MenuUnfoldOutlined style={{ transform: 'rotate(180deg)' }} />}
              onClick={() => setRightPanelCollapsed(false)}
              style={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            />
          </Tooltip>
        </div>
      )}

      {/* 悬浮按钮组 */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: rightPanelCollapsed ? 24 : 350,
        zIndex: 1000,
        transition: 'right 0.3s ease',
      }}>
        <Space direction="vertical">
          <Tooltip title="返回模板管理" placement="left">
            <Button
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/templates')}
              size="large"
              style={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            />
          </Tooltip>
          <Tooltip title="调试面板" placement="left">
            <Button
              type="default"
              icon={<CodeOutlined />}
              onClick={() => setDebugOpen(true)}
              size="large"
              style={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            />
          </Tooltip>
        </Space>
      </div>

      <Sider
        width={280}
        theme="light"
        className="left-panel"
        collapsed={leftPanelCollapsed}
        collapsedWidth={0}
        style={{
          transition: 'all 0.3s ease',
        }}
      >
        <AssetPanel />
      </Sider>
      <Content className="center-panel">
        <Canvas />
      </Content>
      <Sider
        width={320}
        theme="light"
        className="right-panel"
        collapsed={rightPanelCollapsed}
        collapsedWidth={0}
        style={{
          transition: 'all 0.3s ease',
        }}
      >
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Tabs
            defaultActiveKey="properties"
            items={[
              {
                key: 'tree',
                label: (
                  <span>
                    <AppstoreOutlined />
                    组件树
                  </span>
                ),
                children: <ComponentTreePanel />,
              },
              {
                key: 'properties',
                label: (
                  <span>
                    <SettingOutlined />
                    属性配置
                  </span>
                ),
                children: <PropertyPanel />,
              },
            ]}
            style={{ height: '100%' }}
            tabBarStyle={{ padding: '0 16px', margin: 0 }}
          />
        </div>
      </Sider>

      {/* 调试抽屉 */}
      <Drawer
        title="模板 JSON Schema"
        placement="right"
        width={600}
        open={debugOpen}
        onClose={() => setDebugOpen(false)}
        extra={
          <Button type="primary" onClick={handleCopy}>
            复制 JSON
          </Button>
        }
      >
        <div style={{ padding: '0 8px' }}>
          <div style={{ marginBottom: 16 }}>
            <Text strong>模板名称：</Text>
            <Text>{templateName}</Text>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Text strong>Schema ID：</Text>
            <Text>{schemaId || '未绑定'}</Text>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Text strong>组件数量：</Text>
            <Text>{components.length}</Text>
          </div>

          <div style={{ borderTop: '1px solid #f0f0f0', margin: '16px 0' }} />

          <div style={{
            background: '#f5f5f5',
            padding: 12,
            borderRadius: 4,
            maxHeight: 'calc(100vh - 300px)',
            overflow: 'auto',
          }}>
            <pre style={{ margin: 0, fontSize: 12 }}>{JSON.stringify(templateJson, null, 2)}</pre>
          </div>
        </div>
      </Drawer>
    </Layout>
  );
};

export default Designer;
