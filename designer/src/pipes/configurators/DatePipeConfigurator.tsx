/**
 * 日期管道配置器
 */

import { Input } from 'antd';
import type { PipeConfig } from '@printer/sdk';
import type { PipeConfigurator } from './index';

export const DatePipeConfigurator: PipeConfigurator = {
  type: 'date',

  renderConfig(config: PipeConfig, onChange: (option: string, value: any) => void) {
    return (
      <Input
        size="small"
        placeholder="格式（如：YYYY-MM-DD HH:mm:ss）"
        value={config.options?.format || ''}
        onChange={(e) => onChange('format', e.target.value)}
      />
    );
  },
};
