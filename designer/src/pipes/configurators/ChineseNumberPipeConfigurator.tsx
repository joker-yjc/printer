/**
 * 中文大写数字管道配置器
 */

import { Select, Input, Space, Typography } from 'antd';
import type { PipeConfig } from '@jcyao/print-sdk';
import type { PipeConfigurator } from './index';

const { Text } = Typography;

export const ChineseNumberPipeConfigurator: PipeConfigurator = {
  type: 'chineseNumber',

  renderConfig(config: PipeConfig, onChange: (option: string, value: any) => void) {
    return (
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>输出模式</Text>
          <Select
            size="small"
            style={{ width: '100%', marginTop: 4 }}
            value={config.options?.mode || 'uppercase'}
            onChange={(value) => onChange('mode', value)}
            options={[
              { label: '仅大写（壹仟元）', value: 'uppercase' },
              { label: '原值+大写（1000（壹仟元））', value: 'both' },
            ]}
          />
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>后缀单位</Text>
          <Input
            size="small"
            style={{ marginTop: 4 }}
            placeholder="如：元"
            value={config.options?.unit || ''}
            onChange={(e) => onChange('unit', e.target.value)}
          />
        </div>
      </Space>
    );
  },
};
