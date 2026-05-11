/**
 * 金额转换管道配置器
 */

import { Input, InputNumber, Radio, Space, Checkbox } from 'antd';
import type { PipeConfig } from '@jcyao/print-sdk';
import type { PipeConfigurator } from './index';

export const MoneyPipeConfigurator: PipeConfigurator = {
  type: 'money',

  renderConfig(config: PipeConfig, onChange: (option: string, value: any) => void) {
    const mode = config.options?.mode || 'fenToYuan';
    const format = config.options?.format || 'number';
    const precision = config.options?.precision ?? 2;
    const symbol = config.options?.symbol || '';
    const separator = config.options?.separator === true;
    const uppercaseMode = config.options?.uppercaseMode || 'uppercase';
    const uppercaseConnector =
      typeof config.options?.separator === 'string' ? config.options.separator : '';

    const isChineseUppercase = format === 'chineseUppercase';

    return (
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {/* 输出格式 */}
        <div>
          <div style={{ marginBottom: 4, fontSize: 12, color: '#666' }}>输出格式</div>
          <Radio.Group
            size="small"
            value={format}
            onChange={(e) => onChange('format', e.target.value)}
            style={{ width: '100%' }}
          >
            <Radio.Button value="number" style={{ width: '50%', textAlign: 'center' }}>
              数字
            </Radio.Button>
            <Radio.Button value="chineseUppercase" style={{ width: '50%', textAlign: 'center' }}>
              中文大写
            </Radio.Button>
          </Radio.Group>
        </div>

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

        {/* 中文大写专属选项 */}
        {isChineseUppercase && (
          <>
            <div>
              <div style={{ marginBottom: 4, fontSize: 12, color: '#666' }}>输出模式</div>
              <Radio.Group
                size="small"
                value={uppercaseMode}
                onChange={(e) => onChange('uppercaseMode', e.target.value)}
                style={{ width: '100%' }}
              >
                <Radio.Button value="uppercase" style={{ width: '50%', textAlign: 'center' }}>
                  仅大写
                </Radio.Button>
                <Radio.Button value="both" style={{ width: '50%', textAlign: 'center' }}>
                  原值+大写
                </Radio.Button>
              </Radio.Group>
            </div>
            {uppercaseMode === 'both' && (
              <div>
                <div style={{ marginBottom: 4, fontSize: 12, color: '#666' }}>连接符</div>
                <Input
                  size="small"
                  value={uppercaseConnector}
                  onChange={(e) => onChange('separator', e.target.value || undefined)}
                  placeholder="留空则使用默认括号"
                  style={{ width: '100%' }}
                />
              </div>
            )}
          </>
        )}

        {/* 数字格式专属选项 */}
        {!isChineseUppercase && (
          <>
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
          </>
        )}
      </Space>
    );
  },
};
