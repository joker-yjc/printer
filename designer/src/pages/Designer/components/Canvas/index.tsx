import { message, Modal, Form, Dropdown } from 'antd';
import type { MenuProps } from 'antd';

import { useState, useEffect, useRef } from 'react';
import styles from './index.module.css';
import { useDesignerStore } from '../../../../store/designer';
import type { ComponentNode, PageConfig, PageSection } from '../../../../types';
import PrintPreview from '../../../../components/PrintPreview';
import { CONTINUOUS_PAPER_MIN_HEIGHT, CONTINUOUS_PAPER_DEFAULT_WIDTH, HEADER_FOOTER_MIN_HEIGHT } from '../../../../constants';
import { isPageNumberOutOfBounds } from '../../../../utils/pageNumber';
import { snapToGrid as gridSnapToGrid } from '../../../../utils/grid';
import { pxToMm } from '../../../../utils/zoom';
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
    headerComponents,
    footerComponents,
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
    moveComponentToSection,
    zoomLevel,
    selectedPageNumber,
    selectPageNumber,
    deselectPageNumber,
    updatePageNumberConfig,
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
  const [resizingSection, setResizingSection] = useState<'header' | 'footer' | null>(null);
  const resizeStartYRef = useRef(0);
  const resizeStartHeightRef = useRef(0);
  const [alignmentLines, setAlignmentLines] = useState<AlignmentLine[]>([]);
  const [draggingPageNumber, setDraggingPageNumber] = useState(false);
  const [pageNumberDragStart, setPageNumberDragStart] = useState({ x: 0, y: 0, startCustomX: 0, startCustomY: 0 });

  /** 跟踪拖拽时的鼠标位置，用于 mouseUp 时判断跨区域 */
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // === 拖拽 useEffect 的 useRef 缓存（避免频繁重绑事件监听器） ===
  const headerComponentsRef = useRef(headerComponents);
  headerComponentsRef.current = headerComponents;
  const componentsRef = useRef(components);
  componentsRef.current = components;
  const footerComponentsRef = useRef(footerComponents);
  footerComponentsRef.current = footerComponents;
  const pageConfigRef = useRef(pageConfig);
  pageConfigRef.current = pageConfig;
  const zoomLevelRef = useRef(zoomLevel);
  zoomLevelRef.current = zoomLevel;
  const selectedComponentIdsRef = useRef(selectedComponentIds);
  selectedComponentIdsRef.current = selectedComponentIds;
  const updateComponentRef = useRef(updateComponent);
  updateComponentRef.current = updateComponent;
  const moveComponentToSectionRef = useRef(moveComponentToSection);
  moveComponentToSectionRef.current = moveComponentToSection;
  const dragStartPosRef = useRef(dragStartPos);
  const dragStartLayoutRef = useRef(dragStartLayout);
  const dragStartLayoutsRef = useRef(dragStartLayouts);

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
    const allComps = [...headerComponents, ...components, ...footerComponents];
    const comp = allComps.find(c => c.id === id);
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
        // 根据当前选中组件推断目标 section
        const store = useDesignerStore.getState();
        let targetSection: 'header' | 'content' | 'footer' = 'content';
        if (store.selectedComponentId) {
          if (store.headerComponents.some((c) => c.id === store.selectedComponentId)) targetSection = 'header';
          else if (store.footerComponents.some((c) => c.id === store.selectedComponentId)) targetSection = 'footer';
        }
        pasteComponents(targetSection);
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
      // 缩放：Ctrl + = 或 Ctrl + + 放大
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+') && !isEditableElement) {
        e.preventDefault();
        const { zoomInAction: doZoomIn } = useDesignerStore.getState();
        doZoomIn();
      }
      // 缩放：Ctrl + - 缩小
      if ((e.ctrlKey || e.metaKey) && e.key === '-' && !isEditableElement) {
        e.preventDefault();
        const { zoomOutAction: doZoomOut } = useDesignerStore.getState();
        doZoomOut();
      }
      // 缩放：Ctrl + 0 重置
      if ((e.ctrlKey || e.metaKey) && e.key === '0' && !isEditableElement) {
        e.preventDefault();
        const { resetZoom: doResetZoom } = useDesignerStore.getState();
        doResetZoom();
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

    // 宽度越界（所有区域通用）
    if (compRight > pageWidthMm) return true;

    // 判断组件所属区域
    const inHeader = headerComponents.some((c) => c.id === comp.id);
    const inFooter = footerComponents.some((c) => c.id === comp.id);

    const headerEnabled = pageConfig.headerEnabled ?? false;
    const footerEnabled = pageConfig.footerEnabled ?? false;
    const headerH = headerEnabled ? Math.max(HEADER_FOOTER_MIN_HEIGHT, pageConfig.headerHeight || HEADER_FOOTER_MIN_HEIGHT) : 0;
    const footerH = footerEnabled ? Math.max(HEADER_FOOTER_MIN_HEIGHT, pageConfig.footerHeight || HEADER_FOOTER_MIN_HEIGHT) : 0;

    if (inHeader) {
      // 页头组件：超出页头区域高度
      return compBottom > headerH;
    } else if (inFooter) {
      // 页脚组件：超出页脚区域高度
      return compBottom > footerH;
    } else {
      // content 区域组件
      if (headerEnabled || footerEnabled) {
        // 有页头/页脚时：检测是否超出 content 区域范围
        const contentH = pageHeightMm - pageConfig.marginMm.top - pageConfig.marginMm.bottom - headerH - footerH;
        if ((comp.layout.yMm ?? 0) < 0) return true;
        if (compBottom > contentH) return true;
      }
      // 无页头/页脚（旧模板）或已通过区域检查：检测是否超出整页高度
      return compBottom > pageHeightMm;
    }
  };


  const handleDrop = (e: React.DragEvent, section: PageSection = 'content') => {
    e.preventDefault();
    setDragOver(false);

    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const rawXMm = pxToMm(e.clientX - rect.left - 30, zoomLevel);
    const rawYMm = pxToMm(e.clientY - rect.top - 30, zoomLevel);

    // 应用网格吸附
    const xMm = snapToGrid(Math.max(0, rawXMm));
    const yMm = snapToGrid(Math.max(0, rawYMm));

    // 检查是组件拖拽还是数据资产拖拽
    const componentType = e.dataTransfer.getData('componentType');

    if (componentType) {
      // 拦截表格组件拖入页头/页脚
      if (componentType === 'table' && section !== 'content') {
        message.warning({ content: '表格组件不支持放入页头/页脚区域', duration: 5 });
        return;
      }
      // 组件库拖拽用：计算有效页面宽度（考虑纸张尺寸和横版）
      const pageWidthMmForDrop = pageConfig.size === 'CUSTOM'
        ? (pageConfig.widthMm || 210)
        : (pageConfig.size === 'CONTINUOUS' ? (pageConfig.widthMm || 210) : (pageConfig.size === 'A4' ? 210 : 148));
      const effectivePageWForDrop = pageConfig.orientation === 'landscape'
        ? (pageConfig.size === 'CUSTOM' ? (pageConfig.heightMm || 297) : (pageConfig.size === 'A4' ? 297 : 210))
        : pageWidthMmForDrop;

      // 组件库拖拽：根据类型创建组件
      let defaultProps: any;
      let componentName = '';

      switch (componentType) {
        case 'text':
          componentName = '文本';
          defaultProps = {
            layout: { mode: 'absolute' as const, xMm, yMm, widthMm: 60, heightMm: 10 },
            style: { fontSize: 14, color: '#262626', fontWeight: 'normal' },
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
          const { left, right } = pageConfig.marginMm;
          const availableWidth = effectivePageWForDrop - left - right;
          defaultProps = {
            layout: { mode: 'absolute' as const, xMm, yMm, widthMm: availableWidth, heightMm: 60 },
            style: { fontSize: 12 },
            props: { columns: [], bordered: true, showHeader: true },
          };
          break;
        case 'line':
          componentName = '线条';
          const { left: l, right: r } = pageConfig.marginMm;
          const availW = effectivePageWForDrop - l - r;
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

      addComponent(newComponent, section);
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
      // 数组类型（表格）不允许放入页头/页脚
      if (section !== 'content') {
        message.warning({ content: '表格组件不支持放入页头/页脚区域', duration: 5 });
        return;
      }
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

    addComponent(newComponent, section);
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
    if (e.button !== 0) return;
    e.stopPropagation();

    const allComps = [...headerComponents, ...components, ...footerComponents];
    const comp = allComps.find(c => c.id === id);
    if (!comp) return;

    if (e.ctrlKey || e.metaKey) {
      return;
    }

    if (!selectedComponentIds.includes(id)) {
      selectComponent(id);
    }

    setDraggingComponentId(id);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setDragStartLayout({ xMm: comp.layout.xMm || 0, yMm: comp.layout.yMm || 0 });
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    dragStartLayoutRef.current = { xMm: comp.layout.xMm || 0, yMm: comp.layout.yMm || 0 };

    const layouts = new Map<string, { xMm: number; yMm: number }>();
    const idsToSave = selectedComponentIds.includes(id) ? selectedComponentIds : [id];
    idsToSave.forEach((cid) => {
      const c = allComps.find((item) => item.id === cid);
      if (c) {
        layouts.set(cid, { xMm: c.layout.xMm || 0, yMm: c.layout.yMm || 0 });
      }
    });
    setDragStartLayouts(layouts);
    dragStartLayoutsRef.current = layouts;
  };

  // 监听全局鼠标移动和释放（使用 useRef 缓存状态值，仅依赖 draggingComponentId）
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingComponentId) return;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };

      const curZoom = zoomLevelRef.current;
      const curPageConfig = pageConfigRef.current;
      const curSelectedIds = selectedComponentIdsRef.current;
      const curHeaderComps = headerComponentsRef.current;
      const curComps = componentsRef.current;
      const curFooterComps = footerComponentsRef.current;
      const curDragStartPos = dragStartPosRef.current;
      const curDragStartLayout = dragStartLayoutRef.current;
      const curDragStartLayouts = dragStartLayoutsRef.current;

      const deltaX = pxToMm(e.clientX - curDragStartPos.x, curZoom);
      const deltaY = pxToMm(e.clientY - curDragStartPos.y, curZoom);

      const rawXMm = curDragStartLayout.xMm + deltaX;
      const rawYMm = curDragStartLayout.yMm + deltaY;

      // 计算纸张尺寸（基于 curPageConfig 内联计算，避免闭包过期）
      let pageWidthMm: number;
      let pageHeightMm: number;

      if (curPageConfig.size === 'CONTINUOUS') {
        pageWidthMm = curPageConfig.widthMm || CONTINUOUS_PAPER_DEFAULT_WIDTH;
        pageHeightMm = 10000;
      } else if (curPageConfig.size === 'CUSTOM') {
        pageWidthMm = curPageConfig.widthMm || 210;
        pageHeightMm = curPageConfig.heightMm || 297;
      } else {
        pageWidthMm = curPageConfig.size === 'A4' ? 210 : 148;
        pageHeightMm = curPageConfig.size === 'A4' ? 297 : 210;
      }

      if (curPageConfig.orientation === 'landscape' && curPageConfig.size !== 'CONTINUOUS') {
        [pageWidthMm, pageHeightMm] = [pageHeightMm, pageWidthMm];
      }

      // 应用网格吸附
      let snappedXMm = snapToGrid(rawXMm);
      let snappedYMm = snapToGrid(rawYMm);

      // 检测智能对齐（单个组件拖拽时）
      if (curSelectedIds.length === 1) {
        const allComps = [...curHeaderComps, ...curComps, ...curFooterComps];
        const draggingComp = allComps.find((c) => c.id === draggingComponentId);
        if (draggingComp) {
          const tempComp = {
            ...draggingComp,
            layout: { ...draggingComp.layout, xMm: snappedXMm, yMm: snappedYMm },
          };
          const alignment = detectAlignment(tempComp, allComps, 3.78, curZoom);
          setAlignmentLines(alignment.lines);

          if (alignment.snapX !== undefined) snappedXMm = alignment.snapX;
          if (alignment.snapY !== undefined) snappedYMm = alignment.snapY;
        }
      } else {
        setAlignmentLines([]);
      }

      // 计算偏移量
      const offsetX = snappedXMm - curDragStartLayout.xMm;
      const offsetY = snappedYMm - curDragStartLayout.yMm;

      // 多选拖拽
      if (curSelectedIds.length > 1 && curSelectedIds.includes(draggingComponentId)) {
        curSelectedIds.forEach((id) => {
          const startLayout = curDragStartLayouts.get(id);
          const allComps = [...curHeaderComps, ...curComps, ...curFooterComps];
          const comp = allComps.find((c) => c.id === id);
          if (startLayout && comp) {
            const compWidth = comp.layout.widthMm || 0;
            const compHeight = comp.layout.heightMm || 0;
            const clampedXMm = Math.max(0, Math.min(startLayout.xMm + offsetX, pageWidthMm - compWidth));
            const clampedYMm = Math.max(0, Math.min(startLayout.yMm + offsetY, pageHeightMm - compHeight));
            updateComponentRef.current(id, { layout: { ...comp.layout, xMm: clampedXMm, yMm: clampedYMm } });
          }
        });
      } else {
        // 单个组件拖拽
        const comp = [...curHeaderComps, ...curComps, ...curFooterComps].find((c) => c.id === draggingComponentId);
        if (comp) {
          const compWidth = comp.layout.widthMm || 0;
          const compHeight = comp.layout.heightMm || 0;
          const clampedXMm = Math.max(0, Math.min(snappedXMm, pageWidthMm - compWidth));
          const clampedYMm = Math.max(0, Math.min(snappedYMm, pageHeightMm - compHeight));
          updateComponentRef.current(draggingComponentId, { layout: { ...comp.layout, xMm: clampedXMm, yMm: clampedYMm } });
        }
      }
    };

    const handleMouseUp = () => {
      if (!draggingComponentId) return;

      const curDragStartPos = dragStartPosRef.current;
      const curHeaderComps = headerComponentsRef.current;
      const curComps = componentsRef.current;
      const curFooterComps = footerComponentsRef.current;
      const curPageConfig = pageConfigRef.current;
      const curZoom = zoomLevelRef.current;

      const dx = Math.abs(lastMousePosRef.current.x - curDragStartPos.x);
      const dy = Math.abs(lastMousePosRef.current.y - curDragStartPos.y);
      const isRealDrag = dx > 3 || dy > 3;

      if (isRealDrag) {
        const comp = [...curHeaderComps, ...curComps, ...curFooterComps].find((c) => c.id === draggingComponentId);
        if (comp) {
          const source: PageSection =
            curHeaderComps.some((c) => c.id === draggingComponentId) ? 'header' :
              curFooterComps.some((c) => c.id === draggingComponentId) ? 'footer' :
                'content';

          const pageContent = document.querySelector(`.${styles['page-content']}`) as HTMLElement | null;
          if (pageContent) {
            const pageRect = pageContent.getBoundingClientRect();
            const pageYMm = pxToMm(lastMousePosRef.current.y - pageRect.top, curZoom);

            const headerH = (curPageConfig.headerEnabled ?? false) ? Math.max(HEADER_FOOTER_MIN_HEIGHT, curPageConfig.headerHeight || HEADER_FOOTER_MIN_HEIGHT) : 0;
            const footerH = (curPageConfig.footerEnabled ?? false) ? Math.max(HEADER_FOOTER_MIN_HEIGHT, curPageConfig.footerHeight || HEADER_FOOTER_MIN_HEIGHT) : 0;
            const contentTop = curPageConfig.marginMm.top + headerH;
            // 基于 ref 计算页面高度，避免闭包过期
            let curPageH: number;
            if (curPageConfig.size === 'CONTINUOUS') { curPageH = 10000; }
            else if (curPageConfig.size === 'CUSTOM') { curPageH = curPageConfig.heightMm || 297; }
            else { curPageH = curPageConfig.size === 'A4' ? 297 : 210; }
            if (curPageConfig.orientation === 'landscape' && curPageConfig.size !== 'CONTINUOUS') {
              curPageH = curPageConfig.size === 'CUSTOM' ? (curPageConfig.widthMm || 210) : (curPageConfig.size === 'A4' ? 210 : 148);
            }
            const footerTop = curPageH - curPageConfig.marginMm.bottom - footerH;

            let target: PageSection = 'content';
            if ((curPageConfig.headerEnabled ?? false) && pageYMm < contentTop) target = 'header';
            else if ((curPageConfig.footerEnabled ?? false) && pageYMm > footerTop) target = 'footer';

            if (target !== source) {
              let targetY = pageYMm;
              if (target === 'header') targetY = pageYMm - curPageConfig.marginMm.top;
              else if (target === 'content') targetY = pageYMm - contentTop;
              else if (target === 'footer') targetY = pageYMm - footerTop;
              moveComponentToSectionRef.current(draggingComponentId, target, Math.max(0, targetY));
            }
          }
        }
      }

      setDraggingComponentId(null);
      setAlignmentLines([]);
    };

    if (draggingComponentId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingComponentId]);

  // 页码拖拽事件
  useEffect(() => {
    if (!draggingPageNumber) return;

    const handlePageNumberMove = (e: MouseEvent) => {
      const curZoom = zoomLevelRef.current;
      const curPageConfig = pageConfigRef.current;

      const deltaX = e.clientX - pageNumberDragStart.x;
      const deltaY = e.clientY - pageNumberDragStart.y;
      const deltaXMm = pxToMm(deltaX, curZoom);
      const deltaYMm = pxToMm(deltaY, curZoom);

      let newX = pageNumberDragStart.startCustomX + deltaXMm;
      let newY = pageNumberDragStart.startCustomY + deltaYMm;

      newX = gridSnapToGrid(newX, gridEnabled, gridSize);
      newY = gridSnapToGrid(newY, gridEnabled, gridSize);

      let pageW: number, pageH: number;
      if (curPageConfig.size === 'CONTINUOUS') {
        pageW = curPageConfig.widthMm ?? CONTINUOUS_PAPER_DEFAULT_WIDTH;
        pageH = 10000;
      } else if (curPageConfig.size === 'CUSTOM') {
        pageW = curPageConfig.widthMm ?? 210;
        pageH = curPageConfig.heightMm ?? 297;
      } else {
        pageW = curPageConfig.size === 'A4' ? 210 : 148;
        pageH = curPageConfig.size === 'A4' ? 297 : 210;
      }
      if (curPageConfig.orientation === 'landscape' && curPageConfig.size !== 'CONTINUOUS') {
        [pageW, pageH] = [pageH, pageW];
      }

      newX = Math.max(0, Math.min(pageW, newX));
      newY = Math.max(0, Math.min(pageH, newY));

      updatePageNumberConfig({ customX: newX, customY: newY });
    };

    const handlePageNumberUp = () => {
      setDraggingPageNumber(false);
    };

    window.addEventListener('mousemove', handlePageNumberMove);
    window.addEventListener('mouseup', handlePageNumberUp);
    return () => {
      window.removeEventListener('mousemove', handlePageNumberMove);
      window.removeEventListener('mouseup', handlePageNumberUp);
    };
  }, [draggingPageNumber]);

  // 监听区域高度拖拽手柄（使用 useRef 缓存状态值）
  useEffect(() => {
    if (!resizingSection) return;

    const handleResizeMove = (e: MouseEvent) => {
      const curZoom = zoomLevelRef.current;
      const curPageConfig = pageConfigRef.current;

      const deltaPx = e.clientY - resizeStartYRef.current;
      const deltaMm = pxToMm(deltaPx, curZoom);
      // 页头手柄在底部，向下拖拽增加高度；页脚手柄在顶部，向下拖拽减少高度
      let newHeight = resizeStartHeightRef.current + (resizingSection === 'header' ? deltaMm : -deltaMm);

      // 最小高度
      newHeight = Math.max(HEADER_FOOTER_MIN_HEIGHT, newHeight);

      // 最大高度：确保内容区域至少保留 30mm
      // 基于 ref 计算页面高度，避免闭包过期
      let curPageH: number;
      if (curPageConfig.size === 'CONTINUOUS') { curPageH = 10000; }
      else if (curPageConfig.size === 'CUSTOM') { curPageH = curPageConfig.heightMm || 297; }
      else { curPageH = curPageConfig.size === 'A4' ? 297 : 210; }
      if (curPageConfig.orientation === 'landscape' && curPageConfig.size !== 'CONTINUOUS') {
        curPageH = curPageConfig.size === 'CUSTOM' ? (curPageConfig.widthMm || 210) : (curPageConfig.size === 'A4' ? 210 : 148);
      }
      const maxAvailable = curPageH - curPageConfig.marginMm.top - curPageConfig.marginMm.bottom - 30;
      const otherH = resizingSection === 'header'
        ? Math.max(HEADER_FOOTER_MIN_HEIGHT, curPageConfig.footerHeight || HEADER_FOOTER_MIN_HEIGHT)
        : Math.max(HEADER_FOOTER_MIN_HEIGHT, curPageConfig.headerHeight || HEADER_FOOTER_MIN_HEIGHT);
      newHeight = Math.min(newHeight, maxAvailable - otherH);

      // 应用网格吸附
      newHeight = snapToGrid(newHeight);

      setPageConfig({
        [resizingSection === 'header' ? 'headerHeight' : 'footerHeight']: newHeight,
      });
    };

    const handleResizeUp = () => {
      setResizingSection(null);
    };

    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeUp);
    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeUp);
    };
  }, [resizingSection, setPageConfig]);

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
    if (components.length === 0 && headerComponents.length === 0 && footerComponents.length === 0) {
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
      pageNumberEnabled: pageConfig.pageNumber?.enabled ?? false,
      pageNumberPosition: pageConfig.pageNumber?.position ?? 'bottom-right',
      pageNumberFormat: pageConfig.pageNumber?.format ?? 'slash',
      pageNumberPrefix: pageConfig.pageNumber?.prefix ?? '',
      pageNumberSuffix: pageConfig.pageNumber?.suffix ?? '',
      pageNumberSeparator: pageConfig.pageNumber?.separator ?? '/',
      pageNumberOffsetX: pageConfig.pageNumber?.offsetX ?? 0,
      pageNumberOffsetY: pageConfig.pageNumber?.offsetY ?? 0,
      pageNumberCustomX: pageConfig.pageNumber?.customX ?? 0,
      pageNumberCustomY: pageConfig.pageNumber?.customY ?? 0,
      pageNumberFontSize: pageConfig.pageNumber?.style?.fontSize ?? 12,
      pageNumberColor: pageConfig.pageNumber?.style?.color ?? '#666666',
      pageNumberFontWeight: pageConfig.pageNumber?.style?.fontWeight ?? 'normal',
      // 页头/页脚开关
      headerEnabled: pageConfig.headerEnabled ?? false,
      headerHeight: pageConfig.headerHeight || undefined,
      footerEnabled: pageConfig.footerEnabled ?? false,
      footerHeight: pageConfig.footerHeight || undefined,
    });
    setCustomSizeEnabled(pageConfig.size === 'CUSTOM');
    setContinuousPaperEnabled(pageConfig.size === 'CONTINUOUS');
    setPageSettingOpen(true);
  };

  const handlePageSettingSave = (newConfig: PageConfig) => {
    if (newConfig.pageNumber?.position === 'custom') {
      const prevPageNumber = pageConfig.pageNumber;
      const prevPosition = prevPageNumber?.position;
      if (prevPosition !== 'custom') {
        const pageW = newConfig.size === 'A4' ? 210 : newConfig.size === 'A5' ? 148 : newConfig.widthMm ?? 210;
        let pageH = newConfig.size === 'A4' ? 297 : newConfig.size === 'A5' ? 210 : (newConfig.size === 'CONTINUOUS' ? 10000 : (newConfig.heightMm ?? 297));
        const isLandscape = newConfig.orientation === 'landscape' && newConfig.size !== 'CONTINUOUS';
        const w = isLandscape ? pageH : pageW;
        const h = isLandscape ? pageW : pageH;
        newConfig.pageNumber.customX = (w - newConfig.marginMm.left - newConfig.marginMm.right) / 2 + newConfig.marginMm.left;
        const isTop = prevPosition?.includes('top');
        newConfig.pageNumber.customY = isTop
          ? newConfig.marginMm.top + 10
          : h - newConfig.marginMm.bottom - 10;
      }
    }
    if (!newConfig.pageNumber?.enabled) {
      deselectPageNumber();
    }
    setPageConfig(newConfig);
    if (isPageNumberOutOfBounds(newConfig)) {
      message.warning('页码位置超出纸张边界，请调整坐标');
    }
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
      const allComps = [...headerComponents, ...components, ...footerComponents];
      const maxBottom = allComps.reduce((max, comp) => {
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
        <div className={`${styles['canvas-container']} ${dragOver ? styles['drag-over'] : ''}`} style={{
          width: `${(canvasSize.widthPx * zoomLevel / 100) + 30}px`,
          height: `${(canvasSize.heightPx * zoomLevel / 100) + 30}px`,
        }}>
          <div className={styles['ruler-horizontal']} />
          <div className={styles['ruler-vertical']} />
          <div
            className={`${styles['page-content']} ${dragOver ? styles['drag-over'] : ''} ${gridEnabled ? styles['grid-enabled'] : ''}`}
            style={{
              width: `${canvasSize.widthPx}px`,
              height: `${canvasSize.heightPx}px`,
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top left',
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'content')}
            onClick={() => { selectComponent(null); deselectPageNumber(); }}
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

            {/* 页码预览 */}
            {pageConfig.pageNumber?.enabled && (() => {
              const position = pageConfig.pageNumber.position;
              const isCustom = position === 'custom';
              const offsetX = !isCustom ? (pageConfig.pageNumber.offsetX ?? 0) * 3.78 : 0;
              const offsetY = !isCustom ? (pageConfig.pageNumber.offsetY ?? 0) * 3.78 : 0;
              const margin = 10 * 3.78;

              let left = 0, top = 0;

              if (isCustom) {
                left = (pageConfig.pageNumber.customX ?? 0) * 3.78;
                top = (pageConfig.pageNumber.customY ?? 0) * 3.78;
              } else {
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
                } else {
                  left = canvasSize.widthPx - pageConfig.marginMm.right * 3.78 - margin;
                  top = canvasSize.heightPx - pageConfig.marginMm.bottom * 3.78 - margin;
                }
                left += offsetX;
                top += offsetY;
              }

              const format = pageConfig.pageNumber.format ?? 'slash';
              let exampleText = '';
              const separator = pageConfig.pageNumber.separator ?? '/';
              if (format === 'simple') {
                exampleText = '1';
              } else if (format === 'text') {
                exampleText = '第1页 共3页';
              } else {
                exampleText = `1${separator}3`;
              }
              const prefix = pageConfig.pageNumber.prefix ?? '';
              const suffix = pageConfig.pageNumber.suffix ?? '';
              exampleText = `${prefix}${exampleText}${suffix}`;

              const isSelected = selectedPageNumber;
              const isOutOfBounds = isPageNumberOutOfBounds(pageConfig);

              const handlePageNumberMouseDown = (e: React.MouseEvent) => {
                if (e.button !== 0) return;
                e.stopPropagation();
                e.preventDefault();
                selectPageNumber();
                if (isCustom) {
                  setDraggingPageNumber(true);
                  setPageNumberDragStart({
                    x: e.clientX,
                    y: e.clientY,
                    startCustomX: pageConfig.pageNumber?.customX ?? 0,
                    startCustomY: pageConfig.pageNumber?.customY ?? 0,
                  });
                }
              };

              const handlePageNumberClick = (e: React.MouseEvent) => {
                e.stopPropagation();
              };

              return (
                <div
                  onMouseDown={handlePageNumberMouseDown}
                  onClick={handlePageNumberClick}
                  style={{
                    position: 'absolute',
                    left: `${left}px`,
                    top: `${top}px`,
                    transform: !isCustom && position.includes('center') ? 'translateX(-50%)' : 'none',
                    pointerEvents: 'auto',
                    cursor: isCustom ? 'move' : 'default',
                    padding: '2px 4px',
                    backgroundColor: isOutOfBounds ? 'rgba(255, 77, 79, 0.1)' : (isSelected ? 'rgba(24, 144, 255, 0.2)' : 'rgba(24, 144, 255, 0.1)'),
                    border: isOutOfBounds ? '2px dashed #ff4d4f' : (isSelected ? '2px solid #1890ff' : '1px dashed rgba(24, 144, 255, 0.5)'),
                    borderRadius: '2px',
                    fontSize: `${(pageConfig.pageNumber.style?.fontSize ?? 12) * 0.8}px`,
                    color: pageConfig.pageNumber.style?.color ?? '#666',
                    fontWeight: pageConfig.pageNumber.style?.fontWeight ?? 'normal',
                    whiteSpace: 'nowrap',
                    zIndex: isCustom ? 1000 : 50,
                    userSelect: 'none',
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
            {/* ===== 页头区域（连续纸不显示） ===== */}
            {pageConfig.headerEnabled && pageConfig.size !== 'CONTINUOUS' && (() => {
              const sectionW = canvasSize.widthPx;
              const sectionH = Math.max(HEADER_FOOTER_MIN_HEIGHT, pageConfig.headerHeight || HEADER_FOOTER_MIN_HEIGHT) * 3.78;
              const marginLeftPx = pageConfig.marginMm.left * 3.78;
              const marginRightPx = pageConfig.marginMm.right * 3.78;
              return (
                <div
                  style={{
                    position: 'absolute',
                    top: pageConfig.marginMm.top * 3.78,
                    left: 0,
                    width: sectionW,
                    height: sectionH,
                    border: '1px dashed #d9d9d9',
                    background: 'transparent',
                  }}
                  onDrop={(e) => { e.stopPropagation(); handleDrop(e, 'header'); }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {headerComponents.length === 0 && (
                    <div style={{
                      position: 'absolute',
                      left: marginLeftPx,
                      width: sectionW - marginLeftPx - marginRightPx,
                      height: '100%',
                      background: '#fafafa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#bbb',
                      fontSize: 12,
                    }}>
                      拖入页头组件
                    </div>
                  )}
                  {headerComponents.map((comp) => (
                    <Dropdown key={comp.id} menu={{ items: contextMenuItems }} trigger={['contextMenu']}
                      open={contextMenuVisible && contextMenuComponentId === comp.id}
                      onOpenChange={(visible) => { if (!visible) setContextMenuVisible(false); }}>
                      <div
                        className={`${styles.component} ${selectedComponentIds.includes(comp.id) ? styles.selected : ''} ${draggingComponentId === comp.id ? styles.dragging : ''} ${isComponentOutOfBounds(comp) ? styles['out-of-bounds'] : ''}`}
                        style={{ position: 'absolute', left: (comp.layout.xMm || 0) * 3.78, top: (comp.layout.yMm || 0) * 3.78, width: (comp.layout.widthMm || 60) * 3.78, height: (comp.layout.heightMm || 10) * 3.78, cursor: 'move' }}
                        onMouseDown={(e) => handleComponentMouseDown(comp.id, e)}
                        onClick={(e) => handleComponentClick(comp.id, e)}
                        onContextMenu={(e) => handleComponentRightClick(comp.id, e)}>
                        <ComponentPreview component={comp} />
                        {selectedComponentIds.length === 1 && selectedComponentIds.includes(comp.id) && (
                          <ResizeHandles component={comp} onResize={handleComponentResize} pageWidth={getPageSize().width} pageHeight={getPageSize().height} snapToGrid={snapToGrid} zoomLevel={zoomLevel} />
                        )}
                      </div>
                    </Dropdown>
                  ))}
                </div>
              );
            })()}

            {/* ===== 内容区域 ===== */}
            {(() => {
              const headerEnabled = pageConfig.headerEnabled ?? false;
              const headerH = headerEnabled ? Math.max(HEADER_FOOTER_MIN_HEIGHT, pageConfig.headerHeight || HEADER_FOOTER_MIN_HEIGHT) : 0;
              const footerEnabled = pageConfig.footerEnabled ?? false;
              const footerH = footerEnabled ? Math.max(HEADER_FOOTER_MIN_HEIGHT, pageConfig.footerHeight || HEADER_FOOTER_MIN_HEIGHT) : 0;
              const contentTop = (pageConfig.marginMm.top + headerH) * 3.78;
              const contentH = canvasSize.heightPx - (pageConfig.marginMm.top + pageConfig.marginMm.bottom) * 3.78 - headerH * 3.78 - footerH * 3.78;
              const sectionW = canvasSize.widthPx;
              return (
                <div
                  style={{
                    position: 'absolute',
                    top: contentTop,
                    left: 0,
                    width: sectionW,
                    height: Math.max(0, contentH),
                  }}
                  onDrop={(e) => { e.stopPropagation(); handleDrop(e, 'content'); }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {components.map((comp) => (
                    <Dropdown key={comp.id} menu={{ items: contextMenuItems }} trigger={['contextMenu']}
                      open={contextMenuVisible && contextMenuComponentId === comp.id}
                      onOpenChange={(visible) => { if (!visible) setContextMenuVisible(false); }}>
                      <div
                        className={`${styles.component} ${selectedComponentIds.includes(comp.id) ? styles.selected : ''} ${draggingComponentId === comp.id ? styles.dragging : ''} ${isComponentOutOfBounds(comp) ? styles['out-of-bounds'] : ''}`}
                        style={{ position: 'absolute', left: (comp.layout.xMm || 0) * 3.78, top: (comp.layout.yMm || 0) * 3.78, width: (comp.layout.widthMm || 60) * 3.78, height: (comp.layout.heightMm || 10) * 3.78, cursor: 'move' }}
                        onMouseDown={(e) => handleComponentMouseDown(comp.id, e)}
                        onClick={(e) => handleComponentClick(comp.id, e)}
                        onContextMenu={(e) => handleComponentRightClick(comp.id, e)}>
                        <ComponentPreview component={comp} />
                        {selectedComponentIds.length === 1 && selectedComponentIds.includes(comp.id) && (
                          <ResizeHandles component={comp} onResize={handleComponentResize} pageWidth={getPageSize().width} pageHeight={getPageSize().height} snapToGrid={snapToGrid} zoomLevel={zoomLevel} />
                        )}
                      </div>
                    </Dropdown>
                  ))}
                </div>
              );
            })()}

            {/* ===== 页脚区域（连续纸不显示） ===== */}
            {pageConfig.footerEnabled && pageConfig.size !== 'CONTINUOUS' && (() => {
              const footerH = Math.max(HEADER_FOOTER_MIN_HEIGHT, pageConfig.footerHeight || HEADER_FOOTER_MIN_HEIGHT);
              const sectionW = canvasSize.widthPx;
              const sectionTop = canvasSize.heightPx - pageConfig.marginMm.bottom * 3.78 - footerH * 3.78;
              const marginLeftPx = pageConfig.marginMm.left * 3.78;
              const marginRightPx = pageConfig.marginMm.right * 3.78;
              return (
                <div
                  style={{
                    position: 'absolute',
                    top: sectionTop,
                    left: 0,
                    width: sectionW,
                    height: footerH * 3.78,
                    border: '1px dashed #d9d9d9',
                    background: 'transparent',
                  }}
                  onDrop={(e) => { e.stopPropagation(); handleDrop(e, 'footer'); }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {footerComponents.length === 0 && (
                    <div style={{
                      position: 'absolute',
                      left: marginLeftPx,
                      width: sectionW - marginLeftPx - marginRightPx,
                      height: '100%',
                      background: '#fafafa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#bbb',
                      fontSize: 12,
                    }}>
                      拖入页脚组件
                    </div>
                  )}
                  {footerComponents.map((comp) => (
                    <Dropdown key={comp.id} menu={{ items: contextMenuItems }} trigger={['contextMenu']}
                      open={contextMenuVisible && contextMenuComponentId === comp.id}
                      onOpenChange={(visible) => { if (!visible) setContextMenuVisible(false); }}>
                      <div
                        className={`${styles.component} ${selectedComponentIds.includes(comp.id) ? styles.selected : ''} ${draggingComponentId === comp.id ? styles.dragging : ''} ${isComponentOutOfBounds(comp) ? styles['out-of-bounds'] : ''}`}
                        style={{ position: 'absolute', left: (comp.layout.xMm || 0) * 3.78, top: (comp.layout.yMm || 0) * 3.78, width: (comp.layout.widthMm || 60) * 3.78, height: (comp.layout.heightMm || 10) * 3.78, cursor: 'move' }}
                        onMouseDown={(e) => handleComponentMouseDown(comp.id, e)}
                        onClick={(e) => handleComponentClick(comp.id, e)}
                        onContextMenu={(e) => handleComponentRightClick(comp.id, e)}>
                        <ComponentPreview component={comp} />
                        {selectedComponentIds.length === 1 && selectedComponentIds.includes(comp.id) && (
                          <ResizeHandles component={comp} onResize={handleComponentResize} pageWidth={getPageSize().width} pageHeight={getPageSize().height} snapToGrid={snapToGrid} zoomLevel={zoomLevel} />
                        )}
                      </div>
                    </Dropdown>
                  ))}
                </div>
              );
            })()}

            {/* 页头区域高度拖拽手柄（连续纸不显示） */}
            {pageConfig.headerEnabled && pageConfig.size !== 'CONTINUOUS' && (
              <div
                className={styles['section-resize-handle']}
                style={{
                  position: 'absolute',
                  top: (pageConfig.marginMm.top + Math.max(HEADER_FOOTER_MIN_HEIGHT, pageConfig.headerHeight || HEADER_FOOTER_MIN_HEIGHT)) * 3.78 - 3,
                  left: 0,
                  width: canvasSize.widthPx,
                  height: 6,
                  cursor: 'ns-resize',
                  zIndex: 100,
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setResizingSection('header');
                  resizeStartYRef.current = e.clientY;
                  resizeStartHeightRef.current = Math.max(HEADER_FOOTER_MIN_HEIGHT, pageConfig.headerHeight || HEADER_FOOTER_MIN_HEIGHT);
                }}
                title="拖拽调整页头高度"
              />
            )}

            {/* 页脚区域高度拖拽手柄（连续纸不显示） */}
            {pageConfig.footerEnabled && pageConfig.size !== 'CONTINUOUS' && (
              <div
                className={styles['section-resize-handle']}
                style={{
                  position: 'absolute',
                  top: (getPageSize().height - pageConfig.marginMm.bottom - Math.max(HEADER_FOOTER_MIN_HEIGHT, pageConfig.footerHeight || HEADER_FOOTER_MIN_HEIGHT)) * 3.78 - 3,
                  left: 0,
                  width: canvasSize.widthPx,
                  height: 6,
                  cursor: 'ns-resize',
                  zIndex: 100,
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setResizingSection('footer');
                  resizeStartYRef.current = e.clientY;
                  resizeStartHeightRef.current = Math.max(HEADER_FOOTER_MIN_HEIGHT, pageConfig.footerHeight || HEADER_FOOTER_MIN_HEIGHT);
                }}
                title="拖拽调整页脚高度"
              />
            )}

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
