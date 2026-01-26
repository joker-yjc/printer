import { Tabs } from 'antd';
import { DatabaseOutlined, FileTextOutlined } from '@ant-design/icons';
import SchemaManagement from './components/SchemaManagement';
import MockDataManagement from './components/MockDataManagement';
import styles from './index.module.css';

const AssetManagement = () => {
  return (
    <div className={styles['asset-management']}>
      <div className={styles['asset-management-header']}>
        <h2>数据资产管理</h2>
      </div>
      <Tabs
        defaultActiveKey="schema"
        items={[
          {
            key: 'schema',
            label: 'Schema 字典',
            icon: <DatabaseOutlined />,
            children: <SchemaManagement />,
          },
          {
            key: 'mockData',
            label: 'Mock 数据',
            icon: <FileTextOutlined />,
            children: <MockDataManagement />,
          },
        ]}
      />
    </div>
  );
};

export default AssetManagement;
