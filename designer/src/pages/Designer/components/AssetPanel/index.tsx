import { Tabs } from 'antd';
import { AppstoreOutlined, FundOutlined } from '@ant-design/icons';
import styles from './index.module.css';
import DataAsset from './DataAsset';
import ComponentLibrary from './ComponentLibrary';

const AssetPanel = () => {
  return (
    <div className={styles['asset-panel']}>
      <Tabs
        defaultActiveKey="data"
        items={[
          {
            key: 'data',
            label: '数据资产',
            icon: <FundOutlined />,
            children: <DataAsset />,
          },
          {
            key: 'components',
            label: '组件库',
            icon: <AppstoreOutlined />,
            children: <ComponentLibrary />,
          },
        ]}
      />
    </div>
  );
};

export default AssetPanel;
