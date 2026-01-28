import { message, Modal, Form, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { useState, useEffect } from 'react';
import styles from './index.module.css';
import { useDesignerStore } from '../../../../store/designer';
import type { ComponentNode, PageConfig } from '../../../../types';
import PrintPreview from '../../../../components/PrintPreview';
import { CONTINUOUS_PAPER_MIN_HEIGHT, CONTINUOUS_PAPER_DEFAULT_WIDTH } from '../../../../constants';
import { snapToGrid as gridSnapToGrid } from '../../../../utils/grid';
import CanvasToolbar from './CanvasToolbar';
import PageSettingModal from './PageSettingModal';
import SaveTemplateModal from './SaveTemplateModal';
import ComponentPreview from './ComponentPreview';
import ResizeHandles from './ResizeHandles';
import AlignmentGuides from './AlignmentGuides';
import ShortcutHint from './ShortcutHint';
import type { AlignmentLine } from './AlignmentGuides';
import { detectAlignment } from './alignmentDetector';

const CanvasArea = () => {
  const {
    components,
    addComponent,
    updateComponent,
    selectComponent,
    selectedComponentId,
    selectedComponentIds,
    toggleSelectComponent,
    copyComponents,
    pasteComponents,
    duplicateComponent,
    templateName,
    clearCanvas,
    removeComponent,
    undo,
    redo,
    canUndo,
    canRedo,
    pageConfig,
    setPageConfig,
    alignComponents,
    distributeComponents,
    gridEnabled,
    gridSize,
    toggleGrid,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
  } = useDesignerStore();
  const [dragOver, setDragOver] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuComponentId, setContextMenuComponentId] = useState<string | null>(null);
  const [draggingComponentId, setDraggingComponentId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [dragStartLayout, setDragStartLayout] = useState({ xMm: 0, yMm: 0 });
  const [dragStartLayouts, setDragStartLayouts] = useState<Map<string, { xMm: number; yMm: number }>>(new Map());
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [pageSettingOpen, setPageSettingOpen] = useState(false);
  const [pageForm] = Form.useForm();
  const [customSizeEnabled, setCustomSizeEnabled] = useState(false);
  const [continuousPaperEnabled, setContinuousPaperEnabled] = useState(false);
  const [alignmentLines, setAlignmentLines] = useState<AlignmentLine[]>([]);

  // 网格吸附函数（使用通用工具函数）
  // 支持按住 Shift 键临时禁用吸附
  const snapToGrid = (value: number, ignoreShift: boolean = false) => {
    // 如果按住 Shift 键，临时禁用网格吸附
    const shiftPressed = !ignoreShift && (window.event as any)?.shiftKey;
    const shouldSnap = gridEnabled && !shiftPressed;
    return gridSnapToGrid(value, shouldSnap, gridSize);
  };

  // 获取页面尺寸（mm）
  const getPageSize = (): { width: number; height: number } => {
    let pageWidthMm: number;
    let pageHeightMm: number;

    if (pageConfig.size === 'CONTINUOUS') {
      pageWidthMm = pageConfig.widthMm || CONTINUOUS_PAPER_DEFAULT_WIDTH;
      pageHeightMm = 10000; // 连续纸给一个足够大的值
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

    return { width: pageWidthMm, height: pageHeightMm };
  };

  // 处理组件尺寸调整
  const handleComponentResize = (id: string, newLayout: { xMm?: number; yMm?: number; widthMm?: number; heightMm?: number }) => {
    const comp = components.find(c => c.id === id);
    if (!comp) return;

    updateComponent(id, {
      layout: {
        ...comp.layout,
        ...newLayout,
      },
    });
  };

  // 监听键盘删除事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 检查焦点是否在输入框、文本域等可编辑元素中
      const target = e.target as HTMLElement;
      const isEditableElement =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // 删除组件（仅当焦点不在可编辑元素中时）
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedComponentId && !isEditableElement) {
        e.preventDefault();
        handleDeleteComponent(selectedComponentId);
      }
      // 复制：Ctrl+C 或 Cmd+C
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !isEditableElement) {
        e.preventDefault();
        if (selectedComponentIds.length > 0) {
          copyComponents(selectedComponentIds);
          message.success(`已复制 ${selectedComponentIds.length} 个组件`);
        }
      }
      // 粘贴：Ctrl+V 或 Cmd+V
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !isEditableElement) {
        e.preventDefault();
        pasteComponents();
      }
      // 撤销：Ctrl+Z 或 Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // 重做：Ctrl+Shift+Z 或 Cmd+Shift+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      // 复制：Ctrl+D 或 Cmd+D
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && !isEditableElement) {
        e.preventDefault();
        if (selectedComponentId) {
          duplicateComponent(selectedComponentId);
          message.success('已克隆组件');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponentId, selectedComponentIds, undo, redo, copyComponents, pasteComponents, duplicateComponent]);

  // 检查组件是否超出画布边界
  const isComponentOutOfBounds = (comp: ComponentNode) => {
    let pageWidthMm: number;
    let pageHeightMm: number;

    if (pageConfig.size === 'CONTINUOUS') {
      pageWidthMm = pageConfig.widthMm || CONTINUOUS_PAPER_DEFAULT_WIDTH;
      pageHeightMm = Infinity; // 连续纸不限制高度
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

    // 连续纸模式：只检测宽度，不检测高度
    if (pageConfig.size === 'CONTINUOUS') {
      return compRight > pageWidthMm;
    }

    // 普通纸张：检测宽度和高度
    return compRight > pageWidthMm || compBottom > pageHeightMm;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    // 计算相对于画布的坐标
    const canvas = e.currentTarget as HTMLElement;
    const rect = canvas.getBoundingClientRect();
    const rawXMm = (e.clientX - rect.left - 30) / 3.78;
    const rawYMm = (e.clientY - rect.top - 30) / 3.78;

    // 应用网格吸附
    const xMm = snapToGrid(Math.max(0, rawXMm));
    const yMm = snapToGrid(Math.max(0, rawYMm));

    // 检查是组件拖拽还是数据资产拖拽
    const componentType = e.dataTransfer.getData('componentType');

    if (componentType) {
      // 组件库拖拽：根据类型创建组件
      let defaultProps: any;
      let componentName = '';

      switch (componentType) {
        case 'text':
          componentName = '文本';
          defaultProps = {
            layout: { mode: 'absolute' as const, xMm, yMm, widthMm: 60, heightMm: 10 },
            style: { fontSize: 14, color: '#262626' },
            props: { text: '文本内容' },
          };
          break;
        case 'image':
          componentName = '图片';
          defaultProps = {
            layout: { mode: 'absolute' as const, xMm, yMm, widthMm: 60, heightMm: 40 },
            props: { src: '' },
          };
          break;
        case 'table':
          componentName = '表格';
          const pageWidthMm = pageConfig.size === 'A4' ? 210 : 148;
          const { top, left, right } = pageConfig.marginMm;
          const availableWidth = pageWidthMm - left - right;
          defaultProps = {
            layout: { mode: 'absolute' as const, xMm, yMm, widthMm: availableWidth, heightMm: 60 },
            style: { fontSize: 12 },
            props: { columns: [], bordered: true, showHeader: true },
          };
          break;
        case 'line':
          componentName = '线条';
          const pageW = pageConfig.size === 'A4' ? 210 : 148;
          const { left: l, right: r } = pageConfig.marginMm;
          const availW = pageW - l - r;
          defaultProps = {
            layout: { mode: 'absolute' as const, xMm: l, yMm, widthMm: availW, heightMm: 5 },
            style: { borderTopWidth: 1, borderTopColor: '#000', borderTopStyle: 'solid' },
            props: { direction: 'horizontal' },
          };
          break;
        case 'qrcode':
          componentName = '二维码';
          defaultProps = {
            layout: { mode: 'absolute' as const, xMm, yMm, widthMm: 30, heightMm: 30 },
            props: { content: 'https://example.com', size: 30 },
          };
          break;
        case 'barcode':
          componentName = '条形码';
          defaultProps = {
            layout: { mode: 'absolute' as const, xMm, yMm, widthMm: 60, heightMm: 20 },
            props: { content: '1234567890', format: 'CODE128' },
          };
          break;
        case 'rect':
          componentName = '矩形';
          defaultProps = {
            layout: { mode: 'absolute' as const, xMm, yMm, widthMm: 60, heightMm: 15 },
            style: { border: '1px solid #000', background: 'transparent' },
          };
          break;
        default:
          return;
      }

      const newComponent: ComponentNode = {
        id: `comp-${Date.now()}`,
        type: componentType as any,
        ...defaultProps,
      } as ComponentNode;

      addComponent(newComponent);
      selectComponent(newComponent.id);
      message.success(`已添加${componentName}组件`);
      return;
    }

    // 数据资产拖拽
    const fieldPath = e.dataTransfer.getData('fieldPath');
    const fieldTitle = e.dataTransfer.getData('fieldTitle');
    const fieldType = e.dataTransfer.getData('fieldType');
    const fieldChildren = e.dataTransfer.getData('fieldChildren');

    if (!fieldPath) return;

    // 计算可用区域（扣除边距）
    let pageWidthMm: number;
    if (pageConfig.size === 'CUSTOM') {
      pageWidthMm = pageConfig.widthMm || 210;
    } else {
      pageWidthMm = pageConfig.size === 'A4' ? 210 : 148;
    }
    if (pageConfig.orientation === 'landscape') {
      const pageHeightMm = pageConfig.size === 'CUSTOM'
        ? (pageConfig.heightMm || 297)
        : (pageConfig.size === 'A4' ? 297 : 210);
      pageWidthMm = pageHeightMm;
    }
    const { top, right, left } = pageConfig.marginMm;
    const availableWidth = pageWidthMm - left - right;

    // 根据字段类型生成不同组件
    let newComponent: ComponentNode;

    if (fieldType === 'array' && fieldChildren) {
      // 数组类型：生成表格组件，宽度铺满可用区域
      const children = JSON.parse(fieldChildren);
      const columns = children.map((child: any) => ({
        title: child.label,
        dataIndex: child.key,
      }));

      newComponent = {
        id: `comp-${Date.now()}`,
        type: 'table',
        layout: {
          mode: 'absolute',
          xMm: 0,  // 表格从可用区域最左边开始（padding 内部）
          yMm: Math.max(top, yMm),  // 使用 top 边距或 yMm 的较大值
          widthMm: availableWidth,
          heightMm: 60,
        },
        binding: {
          path: fieldPath,
        },
        style: {
          fontSize: 12,
        },
        props: {
          columns: columns,
          bordered: true,
          showHeader: true,
        },
      };
      message.success(`已添加表格组件：${fieldTitle}（${columns.length} 列）`);
    } else {
      // 普通字段：生成文本组件
      newComponent = {
        id: `comp-${Date.now()}`,
        type: 'text',
        layout: {
          mode: 'absolute',
          xMm: Math.max(0, xMm),
          yMm: Math.max(0, yMm),
          widthMm: 60,
          heightMm: 10,
        },
        binding: {
          path: fieldPath,
        },
        style: {
          fontSize: 14,
          color: '#262626',
        },
        props: {
          label: `${fieldTitle}：`,
        },
      };
      message.success(`已添加组件：${fieldTitle}`);
    }

    addComponent(newComponent);
    selectComponent(newComponent.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleComponentClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!draggingComponentId) {
      // Ctrl/Cmd + 点击：多选模式
      if (e.ctrlKey || e.metaKey) {
        toggleSelectComponent(id);
      } else {
        selectComponent(id);
      }
    }
  };

  const handleComponentMouseDown = (id: string, e: React.MouseEvent) => {
    if (e.button !== 0) return; // 只响应左键
    e.stopPropagation();

    const comp = components.find(c => c.id === id);
    if (!comp) return;

    // 如果是 Ctrl/Cmd + 点击，不要处理拖拽，只处理选中
    if (e.ctrlKey || e.metaKey) {
      return;
    }

    // 如果点击的组件不在当前选中列表中，则单选
    if (!selectedComponentIds.includes(id)) {
      selectComponent(id);
    }

    setDraggingComponentId(id);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setDragStartLayout({ xMm: comp.layout.xMm || 0, yMm: comp.layout.yMm || 0 });

    // 保存所有选中组件的初始位置
    const layouts = new Map<string, { xMm: number; yMm: number }>();
    const idsToSave = selectedComponentIds.includes(id) ? selectedComponentIds : [id];
    idsToSave.forEach((cid) => {
      const c = components.find((item) => item.id === cid);
      if (c) {
        layouts.set(cid, { xMm: c.layout.xMm || 0, yMm: c.layout.yMm || 0 });
      }
    });
    setDragStartLayouts(layouts);
  };

  // 监听全局鼠标移动和释放
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingComponentId) return;

      const deltaX = (e.clientX - dragStartPos.x) / 3.78;
      const deltaY = (e.clientY - dragStartPos.y) / 3.78;

      const rawXMm = dragStartLayout.xMm + deltaX;
      const rawYMm = dragStartLayout.yMm + deltaY;

      // 计算纸张尺寸
      let pageWidthMm: number;
      let pageHeightMm: number;

      if (pageConfig.size === 'CUSTOM') {
        pageWidthMm = pageConfig.widthMm || 210;
        pageHeightMm = pageConfig.heightMm || 297;
      } else {
        pageWidthMm = pageConfig.size === 'A4' ? 210 : 148;
        pageHeightMm = pageConfig.size === 'A4' ? 297 : 210;
      }

      if (pageConfig.orientation === 'landscape') {
        [pageWidthMm, pageHeightMm] = [pageHeightMm, pageWidthMm];
      }

      // 应用网格吸附
      let snappedXMm = snapToGrid(rawXMm);
      let snappedYMm = snapToGrid(rawYMm);

      // 检测智能对齐（单个组件拖拽时）
      if (selectedComponentIds.length === 1) {
        const draggingComp = components.find((c) => c.id === draggingComponentId);
        if (draggingComp) {
          // 创建临时组件（带有当前位置）
          const tempComp = {
            ...draggingComp,
            layout: {
              ...draggingComp.layout,
              xMm: snappedXMm,
              yMm: snappedYMm,
            },
          };

          // 检测对齐
          const alignment = detectAlignment(tempComp, components, 3.78);
          setAlignmentLines(alignment.lines);

          // 应用对齐吸附（优先级高于网格吸附）
          if (alignment.snapX !== undefined) {
            snappedXMm = alignment.snapX;
          }
          if (alignment.snapY !== undefined) {
            snappedYMm = alignment.snapY;
          }
        }
      } else {
        // 多选拖拽时清空参考线
        setAlignmentLines([]);
      }

      // 计算偏移量（相对于初始位置）
      const offsetX = snappedXMm - dragStartLayout.xMm;
      const offsetY = snappedYMm - dragStartLayout.yMm;

      // 如果是多选，同时移动所有选中的组件
      if (selectedComponentIds.length > 1 && selectedComponentIds.includes(draggingComponentId)) {
        selectedComponentIds.forEach((id) => {
          const startLayout = dragStartLayouts.get(id);
          const comp = components.find((c) => c.id === id);
          if (startLayout && comp) {
            const newXMm = startLayout.xMm + offsetX;
            const newYMm = startLayout.yMm + offsetY;
            const compWidth = comp.layout.widthMm || 0;
            const compHeight = comp.layout.heightMm || 0;

            // 限制在纸张范围内
            const clampedXMm = Math.max(0, Math.min(newXMm, pageWidthMm - compWidth));
            const clampedYMm = Math.max(0, Math.min(newYMm, pageHeightMm - compHeight));

            updateComponent(id, {
              layout: {
                ...comp.layout,
                xMm: clampedXMm,
                yMm: clampedYMm,
              },
            });
          }
        });
      } else {
        // 单个组件拖拽
        const comp = components.find((c) => c.id === draggingComponentId);
        if (comp) {
          const compWidth = comp.layout.widthMm || 0;
          const compHeight = comp.layout.heightMm || 0;

          // 限制在纸张范围内
          const clampedXMm = Math.max(0, Math.min(snappedXMm, pageWidthMm - compWidth));
          const clampedYMm = Math.max(0, Math.min(snappedYMm, pageHeightMm - compHeight));

          updateComponent(draggingComponentId, {
            layout: {
              ...comp.layout,
              xMm: clampedXMm,
              yMm: clampedYMm,
            },
          });
        }
      }
    };

    const handleMouseUp = () => {
      if (draggingComponentId) {
        setDraggingComponentId(null);
        // 清空参考线
        setAlignmentLines([]);
      }
    };

    if (draggingComponentId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingComponentId, dragStartPos, dragStartLayout, components, updateComponent, selectedComponentIds, dragStartLayouts]);

  const handleComponentRightClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    selectComponent(id);
    setContextMenuComponentId(id);
    setContextMenuVisible(true);
  };

  const handleDeleteComponent = (id: string) => {
    removeComponent(id);
    if (selectedComponentId === id) {
      selectComponent(null);
    }
    message.success('已删除组件');
  };


  const contextMenuItems: MenuProps['items'] = [
    {
      key: 'copy',
      label: '复制 (Ctrl+C)',
      onClick: () => {
        if (contextMenuComponentId) {
          copyComponents([contextMenuComponentId]);
          message.success('已复制组件');
        }
        setContextMenuVisible(false);
      },
    },
    {
      key: 'duplicate',
      label: '克隆 (Ctrl+D)',
      onClick: () => {
        if (contextMenuComponentId) {
          duplicateComponent(contextMenuComponentId);
          message.success('已克隆组件');
        }
        setContextMenuVisible(false);
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'layer',
      label: '层级',
      children: [
        {
          key: 'bringToFront',
          label: '置顶',
          onClick: () => {
            if (contextMenuComponentId) {
              bringToFront(contextMenuComponentId);
              message.success('已置顶');
            }
            setContextMenuVisible(false);
          },
        },
        {
          key: 'bringForward',
          label: '上移一层',
          onClick: () => {
            if (contextMenuComponentId) {
              bringForward(contextMenuComponentId);
              message.success('已上移一层');
            }
            setContextMenuVisible(false);
          },
        },
        {
          key: 'sendBackward',
          label: '下移一层',
          onClick: () => {
            if (contextMenuComponentId) {
              sendBackward(contextMenuComponentId);
              message.success('已下移一层');
            }
            setContextMenuVisible(false);
          },
        },
        {
          key: 'sendToBack',
          label: '置底',
          onClick: () => {
            if (contextMenuComponentId) {
              sendToBack(contextMenuComponentId);
              message.success('已置底');
            }
            setContextMenuVisible(false);
          },
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: '删除 (Delete)',
      danger: true,
      onClick: () => {
        if (contextMenuComponentId) {
          handleDeleteComponent(contextMenuComponentId);
        }
        setContextMenuVisible(false);
      },
    },
  ];

  const handleSave = () => {
    setSaveModalOpen(true);
  };

  const handleNew = () => {
    Modal.confirm({
      title: '确认重置模板？',
      content: '当前的编辑内容将被清空，请确保已保存。',
      onOk: () => {
        clearCanvas();
        message.success('已清空画布');
      },
    });
  };

  const handleQuickPrint = () => {
    if (components.length === 0) {
      message.warning('画布为空，请先添加组件');
      return;
    }
    // 直接打开预览弹窗
    setPrintPreviewOpen(true);
  };

  const handlePageSetting = () => {
    pageForm.setFieldsValue({
      size: pageConfig.size,
      orientation: pageConfig.orientation,
      customWidth: pageConfig.widthMm || 210,
      customHeight: pageConfig.heightMm || 297,
      continuousWidth: pageConfig.widthMm || CONTINUOUS_PAPER_DEFAULT_WIDTH,
      minHeight: pageConfig.minHeightMm || CONTINUOUS_PAPER_MIN_HEIGHT,
      marginTop: pageConfig.marginMm.top,
      marginRight: pageConfig.marginMm.right,
      marginBottom: pageConfig.marginMm.bottom,
      marginLeft: pageConfig.marginMm.left,
      // 页码配置
      pageNumberEnabled: pageConfig.pageNumber?.enabled || false,
      pageNumberPosition: pageConfig.pageNumber?.position || 'bottom-right',
      pageNumberFormat: pageConfig.pageNumber?.format || 'slash',
      pageNumberPrefix: pageConfig.pageNumber?.prefix || '',
      pageNumberSuffix: pageConfig.pageNumber?.suffix || '',
      pageNumberSeparator: pageConfig.pageNumber?.separator || '/',
      pageNumberOffsetX: pageConfig.pageNumber?.offsetX || 0,
      pageNumberOffsetY: pageConfig.pageNumber?.offsetY || 0,
      pageNumberFontSize: pageConfig.pageNumber?.style?.fontSize || 12,
      pageNumberColor: pageConfig.pageNumber?.style?.color || '#666666',
      pageNumberFontWeight: pageConfig.pageNumber?.style?.fontWeight || 'normal',
    });
    setCustomSizeEnabled(pageConfig.size === 'CUSTOM');
    setContinuousPaperEnabled(pageConfig.size === 'CONTINUOUS');
    setPageSettingOpen(true);
  };

  const handlePageSettingSave = (newConfig: PageConfig) => {
    setPageConfig(newConfig);
    setPageSettingOpen(false);
    message.success('页面设置已保存');
  };

  // 计算画布尺寸（像素）
  const getCanvasSize = () => {
    let width: number;
    let height: number;

    if (pageConfig.size === 'CONTINUOUS') {
      // 连续纸模式：根据内容动态计算高度
      width = pageConfig.widthMm || CONTINUOUS_PAPER_DEFAULT_WIDTH;

      // 计算所有组件的最大底部位置
      const maxBottom = components.reduce((max, comp) => {
        const bottom = (comp.layout.yMm || 0) + (comp.layout.heightMm || 0);
        return Math.max(max, bottom);
      }, 0);

      // 高度 = max(最小高度, 内容高度 + 下边距 + 缓冲)
      const minHeight = pageConfig.minHeightMm || CONTINUOUS_PAPER_MIN_HEIGHT;
      height = Math.max(minHeight, maxBottom + pageConfig.marginMm.bottom + 20);

    } else if (pageConfig.size === 'CUSTOM') {
      // 自定义尺寸
      width = pageConfig.widthMm || 210;
      height = pageConfig.heightMm || 297;
    } else {
      // 预设尺寸
      width = pageConfig.size === 'A4' ? 210 : 148;
      height = pageConfig.size === 'A4' ? 297 : 210;
    }

    if (pageConfig.orientation === 'landscape' && pageConfig.size !== 'CONTINUOUS') {
      [width, height] = [height, width];
    }

    return {
      widthPx: width * 3.78,
      heightPx: height * 3.78,
    };
  };

  const canvasSize = getCanvasSize();

  return (
    <div className={styles['canvas-area']}>
      <CanvasToolbar
        onNew={handleNew}
        onSave={handleSave}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo()}
        canRedo={canRedo()}
        selectedCount={selectedComponentIds.length}
        onAlign={alignComponents}
        onDistribute={distributeComponents}
        onPageSetting={handlePageSetting}
        onToggleGrid={toggleGrid}
        gridEnabled={gridEnabled}
        gridSize={gridSize}
        pageConfig={pageConfig}
        onQuickPrint={handleQuickPrint}
      />
      <div className={styles['canvas-wrapper']}>
        {/* 快捷键提示 */}
        <ShortcutHint />
        <div className={styles['canvas-container']} style={{
          width: `${canvasSize.widthPx + 30}px`,
          height: `${canvasSize.heightPx + 30}px`,
        }}>
          <div className={styles['ruler-horizontal']} />
          <div className={styles['ruler-vertical']} />
          <div
            className={`${styles['page-content']} ${dragOver ? styles['drag-over'] : ''} ${gridEnabled ? styles['grid-enabled'] : ''}`}
            style={{
              width: `${canvasSize.widthPx}px`,
              height: `${canvasSize.heightPx}px`,
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => selectComponent(null)}
          >
            {/* 页边距可视化 */}
            <div
              className={styles['page-margin-overlay']}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                borderTop: `${pageConfig.marginMm.top * 3.78}px solid rgba(255, 193, 7, 0.1)`,
                borderRight: `${pageConfig.marginMm.right * 3.78}px solid rgba(255, 193, 7, 0.1)`,
                borderBottom: `${pageConfig.marginMm.bottom * 3.78}px solid rgba(255, 193, 7, 0.1)`,
                borderLeft: `${pageConfig.marginMm.left * 3.78}px solid rgba(255, 193, 7, 0.1)`,
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  border: '1px dashed rgba(255, 193, 7, 0.5)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* 页码位置可视化 */}
            {pageConfig.pageNumber?.enabled && (() => {
              const position = pageConfig.pageNumber.position;
              const offsetX = (pageConfig.pageNumber.offsetX || 0) * 3.78;
              const offsetY = (pageConfig.pageNumber.offsetY || 0) * 3.78;
              const margin = 10 * 3.78; // 默认边距 10mm

              let left = 0, top = 0;

              // 根据位置计算坐标
              if (position === 'top-left') {
                left = pageConfig.marginMm.left * 3.78 + margin;
                top = pageConfig.marginMm.top * 3.78 + margin;
              } else if (position === 'top-center') {
                left = canvasSize.widthPx / 2;
                top = pageConfig.marginMm.top * 3.78 + margin;
              } else if (position === 'top-right') {
                left = canvasSize.widthPx - pageConfig.marginMm.right * 3.78 - margin;
                top = pageConfig.marginMm.top * 3.78 + margin;
              } else if (position === 'bottom-left') {
                left = pageConfig.marginMm.left * 3.78 + margin;
                top = canvasSize.heightPx - pageConfig.marginMm.bottom * 3.78 - margin;
              } else if (position === 'bottom-center') {
                left = canvasSize.widthPx / 2;
                top = canvasSize.heightPx - pageConfig.marginMm.bottom * 3.78 - margin;
              } else { // bottom-right
                left = canvasSize.widthPx - pageConfig.marginMm.right * 3.78 - margin;
                top = canvasSize.heightPx - pageConfig.marginMm.bottom * 3.78 - margin;
              }

              // 应用偏移
              left += offsetX;
              top += offsetY;

              // 格式化示例文本
              const format = pageConfig.pageNumber.format || 'slash';
              let exampleText = '';
              if (format === 'simple') {
                exampleText = '1';
              } else if (format === 'text') {
                exampleText = '第1页 共3页';
              } else {
                exampleText = '1/3';
              }

              const prefix = pageConfig.pageNumber.prefix || '';
              const suffix = pageConfig.pageNumber.suffix || '';
              exampleText = `${prefix}${exampleText}${suffix}`;

              return (
                <div
                  style={{
                    position: 'absolute',
                    left: `${left}px`,
                    top: `${top}px`,
                    transform: position.includes('center') ? 'translateX(-50%)' : 'none',
                    pointerEvents: 'none',
                    padding: '4px 8px',
                    backgroundColor: 'rgba(24, 144, 255, 0.1)',
                    border: '1px dashed rgba(24, 144, 255, 0.5)',
                    borderRadius: '2px',
                    fontSize: `${(pageConfig.pageNumber.style?.fontSize || 12) * 0.8}px`,
                    color: pageConfig.pageNumber.style?.color || '#666',
                    fontWeight: pageConfig.pageNumber.style?.fontWeight || 'normal',
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                  }}
                >
                  {exampleText}
                  <div style={{
                    fontSize: '10px',
                    color: '#1890ff',
                    marginTop: '2px',
                    fontWeight: 'normal',
                  }}>
                    页码预览
                  </div>
                </div>
              );
            })()}
            {components.map((comp) => {
              const baseStyle: React.CSSProperties = {
                position: 'absolute',
                left: `${(comp.layout.xMm || 0) * 3.78}px`,
                top: `${(comp.layout.yMm || 0) * 3.78}px`,
                width: `${(comp.layout.widthMm || 60) * 3.78}px`,
                height: `${(comp.layout.heightMm || 10) * 3.78}px`,
                cursor: 'move',
              };

              return (
                <Dropdown
                  key={comp.id}
                  menu={{ items: contextMenuItems }}
                  trigger={['contextMenu']}
                  open={contextMenuVisible && contextMenuComponentId === comp.id}
                  onOpenChange={(visible) => {
                    if (!visible) setContextMenuVisible(false);
                  }}
                >
                  <div
                    className={`${styles.component} ${selectedComponentIds.includes(comp.id) ? styles.selected : ''} ${draggingComponentId === comp.id ? styles.dragging : ''} ${isComponentOutOfBounds(comp) ? styles['out-of-bounds'] : ''}`}
                    style={baseStyle}
                    onMouseDown={(e) => handleComponentMouseDown(comp.id, e)}
                    onClick={(e) => handleComponentClick(comp.id, e)}
                    onContextMenu={(e) => handleComponentRightClick(comp.id, e)}
                  >
                    <ComponentPreview component={comp} />
                    {/* 只在单个组件选中时显示调整手柄 */}
                    {selectedComponentIds.length === 1 && selectedComponentIds.includes(comp.id) && (
                      <ResizeHandles
                        component={comp}
                        onResize={handleComponentResize}
                        pageWidth={getPageSize().width}
                        pageHeight={getPageSize().height}
                        snapToGrid={snapToGrid}
                      />
                    )}
                  </div>
                </Dropdown>
              );
            })}

            {/* 智能对齐参考线 */}
            {alignmentLines.length > 0 && (
              <AlignmentGuides
                lines={alignmentLines}
                canvasWidth={canvasSize.widthPx}
                canvasHeight={canvasSize.heightPx}
              />
            )}
          </div>
        </div>
      </div>

      <SaveTemplateModal
        open={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        initialName={templateName}
      />

      <PrintPreview
        open={printPreviewOpen}
        onClose={() => setPrintPreviewOpen(false)}
      />

      <PageSettingModal
        open={pageSettingOpen}
        onOk={handlePageSettingSave}
        onCancel={() => setPageSettingOpen(false)}
        form={pageForm}
        customSizeEnabled={customSizeEnabled}
        continuousPaperEnabled={continuousPaperEnabled}
        onSizeChange={(value) => {
          setCustomSizeEnabled(value === 'CUSTOM');
          setContinuousPaperEnabled(value === 'CONTINUOUS');
        }}
      />
    </div>
  );
};

export default CanvasArea;
