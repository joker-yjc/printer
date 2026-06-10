/**
 * 页码属性面板
 * 编辑页码位置、格式和样式
 * @module PageNumberPropertyPanel
 */

import { Typography, InputNumber, Select, Radio } from 'antd';
import styles from './index.module.css';
import { useDesignerStore } from '../../../../store/designer';

const { Title, Text } = Typography;

const PageNumberPropertyPanel = () => {
  const { pageConfig, updatePageNumberConfig } = useDesignerStore();
  const pageNumber = pageConfig.pageNumber;

  if (!pageNumber) return null;

  const isCustom = pageNumber.position === 'custom';

  const handleUpdate = (updates: Record<string, any>) => {
    updatePageNumberConfig(updates);
  };

  return (
    <div className={styles["property-panel"]}>
      <div className={styles["property-header"]}>
        <Title level={5} style={{ margin: 0 }}>页码属性</Title>
        <Text type="secondary" style={{ fontSize: 12 }}>{isCustom ? '自定义位置' : '预设位置'}</Text>
      </div>

      <div className={styles["property-section"]}>
        <div className={styles["property-title"]}>位置</div>
        <div className={styles["property-list"]}>
          <div className={styles["property-item-full"]}>
            <Select
              value={pageNumber.position}
              onChange={(v) => handleUpdate({ position: v })}
              style={{ width: '100%' }}
              options={[
                { label: '左上角', value: 'top-left' },
                { label: '顶部居中', value: 'top-center' },
                { label: '右上角', value: 'top-right' },
                { label: '左下角', value: 'bottom-left' },
                { label: '底部居中', value: 'bottom-center' },
                { label: '右下角', value: 'bottom-right' },
                { label: '自定义', value: 'custom' },
              ]}
            />
          </div>
        </div>
      </div>

      {isCustom && (
        <div className={styles["property-section"]}>
          <div className={styles["property-title"]}>坐标位置</div>
          <div className={styles["property-list"]}>
            <div className={styles["property-item"]}>
              <span className={styles["property-label"]}>X (mm)</span>
              <InputNumber
                value={pageNumber.customX ?? 0}
                min={0}
                max={500}
                step={1}
                onChange={(v) => handleUpdate({ customX: v ?? 0 })}
                style={{ width: '100%' }}
              />
            </div>
            <div className={styles["property-item"]}>
              <span className={styles["property-label"]}>Y (mm)</span>
              <InputNumber
                value={pageNumber.customY ?? 0}
                min={0}
                max={500}
                step={1}
                onChange={(v) => handleUpdate({ customY: v ?? 0 })}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>
      )}

      {!isCustom && (
        <div className={styles["property-section"]}>
          <div className={styles["property-title"]}>偏移</div>
          <div className={styles["property-list"]}>
            <div className={styles["property-item"]}>
              <span className={styles["property-label"]}>X 偏移 (mm)</span>
              <InputNumber
                value={pageNumber.offsetX ?? 0}
                min={-50}
                max={50}
                step={1}
                onChange={(v) => handleUpdate({ offsetX: v ?? 0 })}
                style={{ width: '100%' }}
              />
            </div>
            <div className={styles["property-item"]}>
              <span className={styles["property-label"]}>Y 偏移 (mm)</span>
              <InputNumber
                value={pageNumber.offsetY ?? 0}
                min={-50}
                max={50}
                step={1}
                onChange={(v) => handleUpdate({ offsetY: v ?? 0 })}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>
      )}

      <div className={styles["property-section"]}>
        <div className={styles["property-title"]}>页码格式</div>
        <div className={styles["property-list"]}>
          <div className={styles["property-item-full"]}>
            <Radio.Group
              value={pageNumber.format || 'slash'}
              onChange={(e) => handleUpdate({ format: e.target.value })}
            >
              <Radio value="slash">1/3</Radio>
              <Radio value="text">第1页 共3页</Radio>
              <Radio value="simple">1</Radio>
            </Radio.Group>
          </div>
          <div className={styles["property-item"]}>
            <span className={styles["property-label"]}>前缀</span>
            <input
              type="text"
              value={pageNumber.prefix || ''}
              onChange={(e) => handleUpdate({ prefix: e.target.value })}
              style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }}
            />
          </div>
          <div className={styles["property-item"]}>
            <span className={styles["property-label"]}>后缀</span>
            <input
              type="text"
              value={pageNumber.suffix || ''}
              onChange={(e) => handleUpdate({ suffix: e.target.value })}
              style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }}
            />
          </div>
          {pageNumber.format === 'slash' && (
            <div className={styles["property-item"]}>
              <span className={styles["property-label"]}>分隔符</span>
              <Select
                value={pageNumber.separator || '/'}
                onChange={(v) => handleUpdate({ separator: v })}
                style={{ width: '100%' }}
                options={[
                  { label: '/', value: '/' },
                  { label: '-', value: '-' },
                  { label: '~', value: '~' },
                ]}
              />
            </div>
          )}
        </div>
      </div>

      <div className={styles["property-section"]}>
        <div className={styles["property-title"]}>页码样式</div>
        <div className={styles["property-list"]}>
          <div className={styles["property-item"]}>
            <span className={styles["property-label"]}>字号 (px)</span>
            <InputNumber
              value={pageNumber.style?.fontSize ?? 12}
              min={8}
              max={24}
              step={1}
              onChange={(v) => handleUpdate({ style: { ...pageNumber.style, fontSize: v ?? 12 } })}
              style={{ width: '100%' }}
            />
          </div>
          <div className={styles["property-item"]}>
            <span className={styles["property-label"]}>颜色</span>
            <input
              type="color"
              value={pageNumber.style?.color || '#666666'}
              onChange={(e) => handleUpdate({ style: { ...pageNumber.style, color: e.target.value } })}
              style={{ width: '100%', height: 32, border: '1px solid #d9d9d9', borderRadius: 4, padding: 2, cursor: 'pointer' }}
            />
          </div>
          <div className={styles["property-item"]}>
            <span className={styles["property-label"]}>字重</span>
            <Select
              value={pageNumber.style?.fontWeight || 'normal'}
              onChange={(v) => handleUpdate({ style: { ...pageNumber.style, fontWeight: v } })}
              style={{ width: '100%' }}
              options={[
                { label: '正常', value: 'normal' },
                { label: '加粗', value: 'bold' },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageNumberPropertyPanel;