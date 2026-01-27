/**
 * 货币管道配置器
 */

import { Input } from 'antd';
import type { PipeConfig } from '@jcyao/print-sdk';
import type { PipeConfigurator } from './index';

export const CurrencyPipeConfigurator: PipeConfigurator = {
  type: 'currency',

  renderConfig(config: PipeConfig, onChange: (option: string, value: any) => void) {
    return (
      <Input
        size="small"
        placeholder="货币符号（默认：¥）"
        value={config.options?.symbol || ''}
        onChange={(e) => onChange('symbol', e.target.value)}
      />
    );
  },
};
