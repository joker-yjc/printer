import { Modal, Form, Radio, InputNumber, Space, Switch, Select, Divider } from 'antd';
import { CONTINUOUS_PAPER_DEFAULT_WIDTH, CONTINUOUS_PAPER_MIN_HEIGHT } from '../../../../constants';
import type { PageConfig } from '../../../../types';

interface PageSettingModalProps {
  open: boolean;
  onOk: (config: PageConfig) => void;
  onCancel: () => void;
  form: any;
  customSizeEnabled: boolean;
  continuousPaperEnabled: boolean;
  onSizeChange: (value: string) => void;
}

const PageSettingModal = ({
  open,
  onOk,
  onCancel,
  form,
  customSizeEnabled,
  continuousPaperEnabled,
  onSizeChange,
}: PageSettingModalProps) => {
  const handleOk = () => {
    const values = form.getFieldsValue();
    const newConfig: PageConfig = {
      size: values.size,
      orientation: values.size === 'CONTINUOUS' ? 'portrait' : values.orientation,
      marginMm: {
        top: values.marginTop,
        right: values.marginRight,
        bottom: values.marginBottom,
        left: values.marginLeft,
      },
    };

    // 如果是自定义尺寸，添加宽高
    if (values.size === 'CUSTOM') {
      newConfig.widthMm = values.customWidth;
      newConfig.heightMm = values.customHeight;
    }

    // 如果是连续纸，添加宽度和最小高度
    if (values.size === 'CONTINUOUS') {
      newConfig.widthMm = values.continuousWidth;
      newConfig.minHeightMm = values.minHeight;
    }

    // 页码配置
    if (values.pageNumberEnabled) {
      newConfig.pageNumber = {
        enabled: true,
        position: values.pageNumberPosition || 'bottom-right',
        format: values.pageNumberFormat || 'slash',
        prefix: values.pageNumberPrefix || '',
        suffix: values.pageNumberSuffix || '',
        separator: values.pageNumberSeparator || '/',
        offsetX: values.pageNumberOffsetX || 0,
        offsetY: values.pageNumberOffsetY || 0,
        style: {
          fontSize: values.pageNumberFontSize || 12,
          color: values.pageNumberColor || '#666',
          fontWeight: values.pageNumberFontWeight || 'normal',
        },
      };
    }

    onOk(newConfig);
  };

  return (
    <Modal
      title="页面设置"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      width={500}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="纸张尺寸" name="size" initialValue="A4">
          <Radio.Group onChange={(e) => onSizeChange(e.target.value)}>
            <Radio value="A4">A4 (210 × 297 mm)</Radio>
            <Radio value="A5">A5 (148 × 210 mm)</Radio>
            <Radio value="CUSTOM">自定义尺寸</Radio>
            <Radio value="CONTINUOUS">连续纸（不限高度）</Radio>
          </Radio.Group>
        </Form.Item>

        {customSizeEnabled && (
          <Form.Item label="自定义尺寸 (mm)">
            <Space>
              <Form.Item label="宽" name="customWidth" initialValue={210} noStyle>
                <InputNumber min={50} max={500} style={{ width: 120 }} />
              </Form.Item>
              <span>×</span>
              <Form.Item label="高" name="customHeight" initialValue={297} noStyle>
                <InputNumber min={50} max={500} style={{ width: 120 }} />
              </Form.Item>
            </Space>
          </Form.Item>
        )}

        {continuousPaperEnabled && (
          <>
            <Form.Item label="纸张宽度 (mm)" name="continuousWidth" initialValue={CONTINUOUS_PAPER_DEFAULT_WIDTH}>
              <InputNumber min={20} max={500} style={{ width: 200 }} />
            </Form.Item>
            <Form.Item
              label="最小高度 (mm)"
              name="minHeight"
              initialValue={CONTINUOUS_PAPER_MIN_HEIGHT}
              tooltip="画布编辑时显示的基础高度，实际打印会根据内容自动调整"
            >
              <InputNumber min={50} max={1000} style={{ width: 200 }} />
            </Form.Item>
          </>
        )}

        {!continuousPaperEnabled && (
          <Form.Item label="纸张方向" name="orientation" initialValue="portrait">
            <Radio.Group>
              <Radio value="portrait">竖向 (纵向)</Radio>
              <Radio value="landscape">横向 (横向)</Radio>
            </Radio.Group>
          </Form.Item>
        )}

        <Form.Item label="页边距 (mm)">
          <Space>
            <Form.Item label="上" name="marginTop" initialValue={10} noStyle>
              <InputNumber min={0} max={50} style={{ width: 80 }} />
            </Form.Item>
            <Form.Item label="右" name="marginRight" initialValue={10} noStyle>
              <InputNumber min={0} max={50} style={{ width: 80 }} />
            </Form.Item>
            <Form.Item label="下" name="marginBottom" initialValue={10} noStyle>
              <InputNumber min={0} max={50} style={{ width: 80 }} />
            </Form.Item>
            <Form.Item label="左" name="marginLeft" initialValue={10} noStyle>
              <InputNumber min={0} max={50} style={{ width: 80 }} />
            </Form.Item>
          </Space>
        </Form.Item>

        <Divider />

        {/* 页码配置 */}
        <Form.Item label="页码显示" name="pageNumberEnabled" valuePropName="checked" initialValue={false}>
          <Switch />
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.pageNumberEnabled !== currentValues.pageNumberEnabled}>
          {({ getFieldValue }: any) =>
            getFieldValue('pageNumberEnabled') ? (
              <>
                <Form.Item label="页码位置" name="pageNumberPosition" initialValue="bottom-right">
                  <Select
                    options={[
                      { label: '左上角', value: 'top-left' },
                      { label: '顶部居中', value: 'top-center' },
                      { label: '右上角', value: 'top-right' },
                      { label: '左下角', value: 'bottom-left' },
                      { label: '底部居中', value: 'bottom-center' },
                      { label: '右下角（默认）', value: 'bottom-right' },
                    ]}
                  />
                </Form.Item>

                <Form.Item label="页码格式" name="pageNumberFormat" initialValue="slash">
                  <Radio.Group>
                    <Radio value="slash">1/3</Radio>
                    <Radio value="text">第1页 共3页</Radio>
                    <Radio value="simple">1</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item label="页码样式">
                  <Space>
                    <Form.Item label="字号" name="pageNumberFontSize" initialValue={12} noStyle>
                      <InputNumber min={8} max={24} style={{ width: 80 }} addonAfter="px" />
                    </Form.Item>
                    <Form.Item label="颜色" name="pageNumberColor" initialValue="#666666" noStyle>
                      <input type="color" style={{ width: 50, height: 32 }} />
                    </Form.Item>
                    <Form.Item label="字重" name="pageNumberFontWeight" initialValue="normal" noStyle>
                      <Select
                        style={{ width: 80 }}
                        options={[
                          { label: '正常', value: 'normal' },
                          { label: '加粗', value: 'bold' },
                        ]}
                      />
                    </Form.Item>
                  </Space>
                </Form.Item>
              </>
            ) : null
          }
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PageSettingModal;
