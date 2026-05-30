import { Modal, Form, Radio, InputNumber, Space, Switch, Select, Divider, Typography } from 'antd';
import { CONTINUOUS_PAPER_DEFAULT_WIDTH, CONTINUOUS_PAPER_MIN_HEIGHT } from '../../../../constants';
import type { PageConfig } from '../../../../types';

const { Text } = Typography;

interface PageSettingModalProps {
  open: boolean;
  onOk: (config: PageConfig) => void;
  onCancel: () => void;
  form: any;
  customSizeEnabled: boolean;
  continuousPaperEnabled: boolean;
  onSizeChange: (value: string) => void;
}

/** 带整数限制的数字输入框 */
const IntInput = (props: any) => (
  <InputNumber precision={0} step={1} {...props} />
);

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

    // 页头/页脚开关（连续纸时强制关闭）
    if (values.size === 'CONTINUOUS') {
      newConfig.headerEnabled = false;
      newConfig.footerEnabled = false;
    } else {
      newConfig.headerEnabled = values.headerEnabled ?? false;
      newConfig.headerHeight = values.headerHeight || undefined;
      newConfig.footerEnabled = values.footerEnabled ?? false;
      newConfig.footerHeight = values.footerHeight || undefined;
    }

    onOk(newConfig);
  };

  return (
    <Modal
      title="页面设置"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      width={520}
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
                <IntInput min={50} max={500} style={{ width: 120 }} />
              </Form.Item>
              <span>×</span>
              <Form.Item label="高" name="customHeight" initialValue={297} noStyle>
                <IntInput min={50} max={500} style={{ width: 120 }} />
              </Form.Item>
            </Space>
          </Form.Item>
        )}

        {continuousPaperEnabled && (
          <>
            <Form.Item label="纸张宽度 (mm)" name="continuousWidth" initialValue={CONTINUOUS_PAPER_DEFAULT_WIDTH}>
              <IntInput min={20} max={500} style={{ width: 200 }} />
            </Form.Item>
            <Form.Item
              label="最小高度 (mm)"
              name="minHeight"
              initialValue={CONTINUOUS_PAPER_MIN_HEIGHT}
              tooltip="画布编辑时显示的基础高度，实际打印会根据内容自动调整"
            >
              <IntInput min={50} max={1000} style={{ width: 200 }} />
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
              <IntInput min={0} max={50} style={{ width: 80 }} />
            </Form.Item>
            <Form.Item label="右" name="marginRight" initialValue={10} noStyle>
              <IntInput min={0} max={50} style={{ width: 80 }} />
            </Form.Item>
            <Form.Item label="下" name="marginBottom" initialValue={10} noStyle>
              <IntInput min={0} max={50} style={{ width: 80 }} />
            </Form.Item>
            <Form.Item label="左" name="marginLeft" initialValue={10} noStyle>
              <IntInput min={0} max={50} style={{ width: 80 }} />
            </Form.Item>
          </Space>
        </Form.Item>

        <Divider />
        <Text strong style={{ fontSize: 13 }}>区域设置</Text>

        <div style={{ marginTop: 12 }}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            {/* 页头区域 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Form.Item
                name="headerEnabled"
                valuePropName="checked"
                initialValue={false}
                style={{ marginBottom: 0 }}
                noStyle
              >
                <Switch disabled={continuousPaperEnabled} />
              </Form.Item>
              <span style={{ fontSize: 14, color: '#262626', minWidth: 80 }}>页头区域</span>
              <Form.Item shouldUpdate noStyle>
                {({ getFieldValue }: any) =>
                  getFieldValue('headerEnabled') ? (
                    <Form.Item
                      name="headerHeight"
                      initialValue={15}
                      style={{ marginBottom: 0 }}
                      noStyle
                    >
                      <IntInput
                        min={15}
                        max={100}
                        suffix="mm"
                        style={{ width: 100 }}
                        disabled={continuousPaperEnabled}
                      />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
            </div>

            {/* 页脚区域 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Form.Item
                name="footerEnabled"
                valuePropName="checked"
                initialValue={false}
                style={{ marginBottom: 0 }}
                noStyle
              >
                <Switch disabled={continuousPaperEnabled} />
              </Form.Item>
              <span style={{ fontSize: 14, color: '#262626', minWidth: 80 }}>页脚区域</span>
              <Form.Item shouldUpdate noStyle>
                {({ getFieldValue }: any) =>
                  getFieldValue('footerEnabled') ? (
                    <Form.Item
                      name="footerHeight"
                      initialValue={15}
                      style={{ marginBottom: 0 }}
                      noStyle
                    >
                      <IntInput
                        min={15}
                        max={100}
                        suffix="mm"
                        style={{ width: 100 }}
                        disabled={continuousPaperEnabled}
                      />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
            </div>

            {/* 高度警告 */}
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }: any) => {
                const hEnabled = getFieldValue('headerEnabled');
                const fEnabled = getFieldValue('footerEnabled');
                const hHeight = getFieldValue('headerHeight') || 15;
                const fHeight = getFieldValue('footerHeight') || 15;
                const pageSize = getFieldValue('size');

                if (pageSize === 'CONTINUOUS') return null;

                const pageHeightMm =
                  pageSize === 'A4' ? 297 : pageSize === 'A5' ? 210 : getFieldValue('customHeight') || 297;
                const marginTop = getFieldValue('marginTop') || 10;
                const marginBottom = getFieldValue('marginBottom') || 10;
                const maxTotal = pageHeightMm - marginTop - marginBottom - 30;

                const total = (hEnabled ? hHeight : 0) + (fEnabled ? fHeight : 0);

                if (total > maxTotal) {
                  return (
                    <Text type="danger" style={{ fontSize: 12, display: 'block' }}>
                      警告：页头与页脚总高度（{total}mm）过大，内容区域将被压缩
                    </Text>
                  );
                }
                return null;
              }}
            </Form.Item>
          </Space>
        </div>

        <Divider />

        {/* 页码配置 */}
        <Text strong style={{ fontSize: 13 }}>页码设置</Text>
        <div style={{ marginTop: 12, padding: 12, background: '#fafafa', borderRadius: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Form.Item
              name="pageNumberEnabled"
              valuePropName="checked"
              initialValue={false}
              style={{ marginBottom: 0 }}
              noStyle
            >
              <Switch />
            </Form.Item>
            <span style={{ fontSize: 14, color: '#262626' }}>显示页码</span>
          </div>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.pageNumberEnabled !== currentValues.pageNumberEnabled
            }
          >
            {({ getFieldValue }: any) =>
              getFieldValue('pageNumberEnabled') ? (
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  <Form.Item
                    label="页码位置"
                    name="pageNumberPosition"
                    initialValue="bottom-right"
                    style={{ marginBottom: 0 }}
                  >
                    <Select
                      style={{ width: 200 }}
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

                  <Form.Item
                    label="页码格式"
                    name="pageNumberFormat"
                    initialValue="slash"
                    style={{ marginBottom: 0 }}
                  >
                    <Radio.Group>
                      <Radio value="slash">1/3</Radio>
                      <Radio value="text">第1页 共3页</Radio>
                      <Radio value="simple">1</Radio>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item label="页码样式" style={{ marginBottom: 0 }}>
                    <Space>
                      <Form.Item label="字号" name="pageNumberFontSize" initialValue={12} noStyle>
                        <IntInput min={8} max={24} style={{ width: 80 }} addonAfter="px" />
                      </Form.Item>
                      <Form.Item label="颜色" name="pageNumberColor" initialValue="#666666" noStyle>
                        <input type="color" style={{ width: 50, height: 32, border: '1px solid #d9d9d9', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
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
                </Space>
              ) : null
            }
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default PageSettingModal;
