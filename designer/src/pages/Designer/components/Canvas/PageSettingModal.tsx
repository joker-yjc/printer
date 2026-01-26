import { Modal, Form, Radio, InputNumber, Space } from 'antd';
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
      </Form>
    </Modal>
  );
};

export default PageSettingModal;
