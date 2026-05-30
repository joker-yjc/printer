import { Modal, Input, message } from 'antd';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { templateApi } from '../../../../services/api';
import { useDesignerStore } from '../../../../store/designer';
import type { ComponentNode } from '../../../../types';

interface SaveTemplateModalProps {
  open: boolean;
  onClose: () => void;
  initialName?: string;
}

const SaveTemplateModal = ({
  open,
  onClose,
  initialName = '',
}: SaveTemplateModalProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    components,
    headerComponents,
    footerComponents,
    pageConfig,
    generateTemplate,
    templateId,
    setTemplateInfo,
  } = useDesignerStore();

  const [tempName, setTempName] = useState('');
  const [saving, setSaving] = useState(false);

  // 打开弹窗时初始化名称
  useEffect(() => {
    if (open) {
      setTempName(initialName);
    }
  }, [open, initialName]);

  // 检查组件是否超出边界
  const isComponentOutOfBounds = (comp: ComponentNode) => {
    let pageWidthMm: number;
    let pageHeightMm: number;

    if (pageConfig.size === 'CONTINUOUS') {
      pageWidthMm = pageConfig.widthMm || 80;
      pageHeightMm = Infinity;
    } else if (pageConfig.size === 'CUSTOM') {
      pageWidthMm = pageConfig.widthMm || 210;
      pageHeightMm = pageConfig.heightMm || 297;
    } else {
      pageWidthMm = pageConfig.size === 'A4' ? 210 : 148;
      pageHeightMm = pageConfig.size === 'A4' ? 297 : 210;
    }

    if (pageConfig.orientation === 'landscape' && pageConfig.size !== 'CONTINUOUS') {
      [pageWidthMm, pageHeightMm] = [pageHeightMm, pageWidthMm];
    }

    const compRight = (comp.layout.xMm || 0) + (comp.layout.widthMm || 0);
    const compBottom = (comp.layout.yMm || 0) + (comp.layout.heightMm || 0);

    if (pageConfig.size === 'CONTINUOUS') {
      return compRight > pageWidthMm;
    }

    // 宽度越界（所有区域通用）
    if (compRight > pageWidthMm) return true;

    // 判断组件所属区域
    const inHeader = headerComponents.some((c) => c.id === comp.id);
    const inFooter = footerComponents.some((c) => c.id === comp.id);

    const headerEnabled = pageConfig.headerEnabled ?? false;
    const footerEnabled = pageConfig.footerEnabled ?? false;
    const headerH = headerEnabled ? Math.max(15, pageConfig.headerHeight || 15) : 0;
    const footerH = footerEnabled ? Math.max(15, pageConfig.footerHeight || 15) : 0;

    if (inHeader) {
      return compBottom > headerH;
    } else if (inFooter) {
      return compBottom > footerH;
    } else {
      // content 区域组件
      if (headerEnabled || footerEnabled) {
        const contentH = pageHeightMm - pageConfig.marginMm.top - pageConfig.marginMm.bottom - headerH - footerH;
        if ((comp.layout.yMm ?? 0) < 0) return true;
        if (compBottom > contentH) return true;
      }
      return compBottom > pageHeightMm;
    }
  };

  // 执行保存
  const performSave = async () => {
    setSaving(true);
    try {
      const template = generateTemplate();
      const payload = { ...template, name: tempName };

      if (templateId) {
        // 更新现有模板
        await templateApi.update(templateId, { ...payload, id: templateId });
        message.success('模板更新成功！');
        window.location.reload();
      } else {
        // 创建新模板
        const result = await templateApi.create(payload);
        setTemplateInfo({ templateId: result.id, templateName: tempName });
        navigate(`${location.pathname}?templateId=${result.id}`, {
          replace: true,
        });
        message.success('模板保存成功！');
      }
      onClose();
    } catch (error) {
      message.error('保存失败！');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // 确认保存
  const handleConfirm = async () => {
    if (!tempName.trim()) {
      message.error('请输入模板名称');
      return;
    }

    // 检查是否有超出边界的组件（三个区域都要检查）
    const allComponents = [...headerComponents, ...components, ...footerComponents];
    const outOfBoundsComponents = allComponents.filter(comp => isComponentOutOfBounds(comp));

    if (outOfBoundsComponents.length > 0) {
      Modal.confirm({
        title: '检测到位置异常的组件',
        content: (
          <div>
            <p>当前有 {outOfBoundsComponents.length} 个组件位置超出其所属区域范围（已用红色虚线标记）。</p>
            <p>可能的原因：超出页面边界、侵入页头/页脚区域、或页头/页脚内组件超出区域高度。</p>
            <p>位置异常的组件在打印时可能被截断或显示不完整。</p>
            <p style={{ marginTop: 12, fontWeight: 'bold' }}>是否继续保存？</p>
          </div>
        ),
        okText: '继续保存',
        cancelText: '取消',
        onOk: async () => {
          await performSave();
        },
      });
    } else {
      await performSave();
    }
  };

  return (
    <Modal
      title="保存模板"
      open={open}
      onOk={handleConfirm}
      onCancel={onClose}
      confirmLoading={saving}
    >
      <Input
        placeholder="请输入模板名称"
        value={tempName}
        onChange={(e) => setTempName(e.target.value)}
        onPressEnter={handleConfirm}
      />
    </Modal>
  );
};

export default SaveTemplateModal;
