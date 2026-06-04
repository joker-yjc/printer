import { Layout, Menu } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DatabaseOutlined,
  FileTextOutlined,
  TableOutlined,
  BookOutlined,
} from '@ant-design/icons';
import styles from './MainLayout.module.css';

const { Sider, Content } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/templates',
      icon: <FileTextOutlined />,
      label: '模板管理',
    },
    {
      key: '/schemas',
      icon: <DatabaseOutlined />,
      label: 'Schema 字典',
    },
    {
      key: '/mock-data',
      icon: <TableOutlined />,
      label: 'Mock 数据',
    },
    {
      key: '/help',
      icon: <BookOutlined />,
      label: '用户手册',
    },
  ];

  return (
    <Layout className={styles['main-layout']}>
      <Sider width={200} theme="light">
        <div className={styles['logo-section']}>
          打印模板平台
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ height: 'calc(100% - 64px)', borderRight: 0 }}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Content>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default MainLayout;
