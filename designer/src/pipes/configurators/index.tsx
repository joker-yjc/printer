/**
 * 管道配置器集合
 */

import { Input, InputNumber, Space } from 'antd';
import type { PipeConfig } from '@printer/sdk';
import { DatePipeConfigurator } from './DatePipeConfigurator';
import { CurrencyPipeConfigurator } from './CurrencyPipeConfigurator';

export { DatePipeConfigurator, CurrencyPipeConfigurator };

/**
 * 管道配置器接口（UI层）
 */
export interface PipeConfigurator {
  type: string;
  renderConfig(config: PipeConfig, onChange: (option: string, value: any) => void): React.ReactNode;
}

/**
 * 截取字符串管道配置器
 */
export const SlicePipeConfigurator: PipeConfigurator = {
  type: 'slice',

  renderConfig(config: PipeConfig, onChange: (option: string, value: any) => void) {
    return (
      <Space.Compact size="small" style={{ width: '100%' }}>
        <InputNumber
          placeholder="起始位置"
          value={config.options?.start || 0}
          onChange={(val) => onChange('start', val)}
          style={{ width: '50%' }}
        />
        <InputNumber
          placeholder="结束位置"
          value={config.options?.end}
          onChange={(val) => onChange('end', val)}
          style={{ width: '50%' }}
        />
      </Space.Compact>
    );
  },
};

/**
 * 默认值管道配置器
 */
export const DefaultPipeConfigurator: PipeConfigurator = {
  type: 'default',

  renderConfig(config: PipeConfig, onChange: (option: string, value: any) => void) {
    return (
      <Input
        size="small"
        placeholder="默认值"
        value={config.options?.defaultValue || ''}
        onChange={(e) => onChange('defaultValue', e.target.value)}
      />
    );
  },
};

/**
 * 管道配置器注册表
 */
const configuratorRegistry = new Map<string, PipeConfigurator>();

// 注册配置器
configuratorRegistry.set('date', DatePipeConfigurator);
configuratorRegistry.set('currency', CurrencyPipeConfigurator);
configuratorRegistry.set('slice', SlicePipeConfigurator);
configuratorRegistry.set('default', DefaultPipeConfigurator);

/**
 * 获取管道配置器
 */
export function getConfigurator(type: string): PipeConfigurator | undefined {
  return configuratorRegistry.get(type);
}
