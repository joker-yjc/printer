/**
 * 金额转换管道配置器
 */

import { Input, InputNumber, Radio, Space, Checkbox } from 'antd';
import type { PipeConfig } from '@printer/sdk';
import type { PipeConfigurator } from './index';

export const MoneyPipeConfigurator: PipeConfigurator = {
  type: 'money',

  renderConfig(config: PipeConfig, onChange: (option: string, value: any) => void) {
    const mode = config.options?.mode || 'fenToYuan';
    const precision = config.options?.precision ?? 2;
    const symbol = config.options?.symbol || '';
    const separator = config.options?.separator === true;

    return (
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {/* 转换模式 */}
        <div>
          <div style={{ marginBottom: 4, fontSize: 12, color: '#666' }}>转换模式</div>
          <Radio.Group
            size="small"
            value={mode}
            onChange={(e) => onChange('mode', e.target.value)}
            style={{ width: '100%' }}
          >
            <Radio.Button value="fenToYuan" style={{ width: '33.33%', textAlign: 'center' }}>
              分→元
            </Radio.Button>
            <Radio.Button value="yuanToFen" style={{ width: '33.33%', textAlign: 'center' }}>
              元→分
            </Radio.Button>
            <Radio.Button value="none" style={{ width: '33.33%', textAlign: 'center' }}>
              不转换
            </Radio.Button>
          </Radio.Group>
        </div>

        {/* 小数精度 */}
        <div>
          <div style={{ marginBottom: 4, fontSize: 12, color: '#666' }}>小数位数</div>
          <InputNumber
            size="small"
            min={0}
            max={8}
            value={precision}
            onChange={(val) => onChange('precision', val ?? 2)}
            style={{ width: '100%' }}
            placeholder="默认 2 位"
          />
        </div>

        {/* 货币符号 */}
        <div>
          <div style={{ marginBottom: 4, fontSize: 12, color: '#666' }}>货币符号</div>
          <Input
            size="small"
            value={symbol}
            onChange={(e) => onChange('symbol', e.target.value)}
            placeholder="如：¥、$、€（可留空）"
            style={{ width: '100%' }}
          />
        </div>

        {/* 千分位分隔 */}
        <div>
          <Checkbox
            checked={separator}
            onChange={(e) => onChange('separator', e.target.checked)}
          >
            使用千分位分隔符
          </Checkbox>
        </div>
      </Space>
    );
  },
};
