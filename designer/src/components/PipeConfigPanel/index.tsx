/**
 * 通用管道配置面板
 * 用于 DataBinding、TableColumn 等需要配置管道的场景
 */

import { Select, Typography, Tag, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import type { PipeConfig } from '@jcyao/print-sdk';
import { getAllPipes } from '@jcyao/print-sdk';
import { getConfigurator } from '../../pipes/configurators';

const { Text } = Typography;

export interface PipeConfigPanelProps {
  /** 当前管道配置列表 */
  pipes?: PipeConfig[];
  /** 管道配置变更回调 */
  onChange: (pipes: PipeConfig[]) => void;
  /** 可选：限制可用的管道类型（不传则全部开放） */
  availablePipes?: string[];
  /** 可选：最大管道数量（不传则不限制） */
  maxPipes?: number;
}

/**
 * 通用管道配置面板
 * 提供管道的添加、删除、配置功能，可嵌入各种属性面板场景
 */
const PipeConfigPanel: React.FC<PipeConfigPanelProps> = ({
  pipes = [],
  onChange,
  availablePipes,
  maxPipes,
}) => {
  // 获取可用管道列表
  const allPipes = getAllPipes();
  const filteredPipes = availablePipes
    ? allPipes.filter((p) => availablePipes.includes(p.value))
    : allPipes;

  // 是否已达最大管道数
  const isMaxReached = maxPipes !== undefined && pipes.length >= maxPipes;

  const handleAddPipe = (pipeType: string) => {
    const newPipe: PipeConfig = { type: pipeType, options: {} };
    onChange([...pipes, newPipe]);
  };

  const handleRemovePipe = (index: number) => {
    const newPipes = pipes.filter((_, i) => i !== index);
    onChange(newPipes);
  };

  const handlePipeOptionChange = (index: number, option: string, value: any) => {
    const newPipes = [...pipes];
    newPipes[index] = {
      ...newPipes[index],
      options: {
        ...newPipes[index].options,
        [option]: value,
      },
    };
    onChange(newPipes);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontSize: 12 }}>管道转换</Text>
        {!isMaxReached && (
          <Select
            size="small"
            style={{ width: 120 }}
            placeholder="添加管道"
            onChange={handleAddPipe}
            value={null}
            options={filteredPipes}
          />
        )}
      </div>
      {pipes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pipes.map((pipe, index) => {
            const configurator = getConfigurator(pipe.type);
            return (
              <div
                key={index}
                style={{
                  border: '1px solid #d9d9d9',
                  borderRadius: 4,
                  padding: 8,
                  background: '#fafafa',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Tag color="blue">{pipe.type}</Tag>
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => handleRemovePipe(index)}
                  />
                </div>
                {configurator && configurator.renderConfig(pipe, (option: string, value: any) => {
                  handlePipeOptionChange(index, option, value);
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PipeConfigPanel;
