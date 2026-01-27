/**
 * 数据绑定配置区域
 * 负责组件的数据绑定和管道配置
 */

import { Input, Select, Typography, Tag, Button, Tooltip } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import styles from './index.module.css';
import type { ComponentNode, PipeConfig } from '../../../../types';
import { getAllPipes } from '@jcyao/print-sdk';
import { getConfigurator } from '../../../../pipes/configurators';

const { Text } = Typography;

interface DataBindingSectionProps {
  component: ComponentNode;
  onBindingChange: (field: string, value: any) => void;
}

const DataBindingSection: React.FC<DataBindingSectionProps> = ({ component, onBindingChange }) => {
  const handleAddPipe = (pipeType: string) => {
    const currentPipes = component.binding?.pipes || [];
    const newPipe: PipeConfig = { type: pipeType, options: {} };
    onBindingChange('pipes', [...currentPipes, newPipe]);
  };

  const handleRemovePipe = (index: number) => {
    const currentPipes = component.binding?.pipes || [];
    const newPipes = currentPipes.filter((_, i) => i !== index);
    onBindingChange('pipes', newPipes.length > 0 ? newPipes : undefined);
  };

  const handlePipeOptionChange = (index: number, option: string, value: any) => {
    const currentPipes = [...(component.binding?.pipes || [])];
    currentPipes[index] = {
      ...currentPipes[index],
      options: {
        ...currentPipes[index].options,
        [option]: value,
      },
    };
    onBindingChange('pipes', currentPipes);
  };

  return (
    <div className={styles["property-section"]}>
      <div className={styles["property-title"]}>🔗 数据绑定</div>
      <div className={styles["property-list"]}>
        <div className={styles["property-item"]}>
          <Tooltip title="数据的JSON路径，如 'user.name'、'items.0.title'，也可从左侧数据资产拖拽">
            <Text className={styles["property-label"]}>🔗 绑定路径</Text>
          </Tooltip>
          <Input
            value={component.binding?.path || ''}
            placeholder="例如：user.name"
            onChange={(e) => onBindingChange('path', e.target.value)}
            allowClear
          />
        </div>
        <div className={styles["property-item"]}>
          <Tooltip title="当数据为空、null或undefined时的默认显示值">
            <Text className={styles["property-label"]}>🛡️ 默认值 (Fallback)</Text>
          </Tooltip>
          <Input
            value={component.binding?.fallback || ''}
            placeholder="数据为空时显示"
            onChange={(e) => onBindingChange('fallback', e.target.value)}
            allowClear
          />
        </div>
        <div className={styles["property-item"]}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Tooltip title="数据管道用于格式化数据，如日期格式化、大小写转换等，按顺序执行">
              <Text className={styles["property-label"]}>🔧 数据管道 (Pipes)</Text>
            </Tooltip>
            <Select
              size="small"
              style={{ width: 120 }}
              placeholder="添加管道"
              onChange={(value: string) => {
                handleAddPipe(value);
              }}
              value={null}
              options={getAllPipes()}
            />
          </div>
          {component.binding?.pipes && component.binding.pipes.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {component.binding.pipes.map((pipe, index) => {
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
                    {/* 使用插件化配置器渲染配置 UI */}
                    {configurator && configurator.renderConfig(pipe, (option: string, value: any) => {
                      handlePipeOptionChange(index, option, value);
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataBindingSection;
