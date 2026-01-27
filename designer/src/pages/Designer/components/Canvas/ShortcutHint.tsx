/**
 * 快捷键提示组件
 * 显示在画布顶部，提供常用操作的快捷键说明
 */

import { Space, Tag, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';

const ShortcutHint = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return (
      <div
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 10,
        }}
      >
        <Tooltip title="显示快捷键提示">
          <InfoCircleOutlined
            style={{ fontSize: 18, color: '#1890ff', cursor: 'pointer' }}
            onClick={() => setVisible(true)}
          />
        </Tooltip>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 8,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '8px 16px',
        borderRadius: 4,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        border: '1px solid #d9d9d9',
      }}
    >
      <Space size="small" wrap>
        <Tag color="blue">Shift + 拖拽 = 禁用吸附</Tag>
        <Tag color="green">Ctrl + C/V = 复制/粘贴</Tag>
        <Tag color="orange">Ctrl + D = 克隆组件</Tag>
        <Tag color="purple">Ctrl + Z/Shift+Z = 撤销/重做</Tag>
        <Tag color="red">Delete = 删除组件</Tag>
        <Tag
          color="default"
          style={{ cursor: 'pointer' }}
          onClick={() => setVisible(false)}
        >
          ✕ 隐藏
        </Tag>
      </Space>
    </div>
  );
};

export default ShortcutHint;
