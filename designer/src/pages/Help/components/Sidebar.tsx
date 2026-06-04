import React from 'react';
import { Menu } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { chapters } from '../../../help/chapters';

interface SidebarProps {
  activeChapterId: string;
  onSelect: (chapterId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeChapterId, onSelect }) => {
  const menuItems = chapters.map((chapter) => ({
    key: chapter.id,
    icon: <BookOutlined />,
    label: chapter.title,
  }));

  return (
    <div style={{
      width: 220,
      flexShrink: 0,
      borderRight: '1px solid #f0f0f0',
      background: '#fafafa',
      overflow: 'auto',
    }}>
      <div style={{
        padding: '16px 16px 8px',
        fontWeight: 600,
        fontSize: 15,
        color: '#1f1f1f',
      }}>
        用户手册
      </div>
      <Menu
        mode="inline"
        selectedKeys={[activeChapterId]}
        items={menuItems}
        style={{ background: 'transparent', borderRight: 'none' }}
        onClick={({ key }) => onSelect(key)}
      />
    </div>
  );
};

export default Sidebar;
