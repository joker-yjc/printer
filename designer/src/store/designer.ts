import { create } from 'zustand';
import type { ComponentNode, PrintTemplate, PageConfig, PageSection } from '../types';
import { snapToGrid } from '../utils/grid';
import { CONTINUOUS_PAPER_DEFAULT_WIDTH } from '../constants';

// 最多保存 20 步历史
const MAX_HISTORY_STEPS = 20;

interface DesignerStore {
  // 画布上的组件列表
  components: ComponentNode[];
  /** 页头区域组件 */
  headerComponents: ComponentNode[];
  /** 页脚区域组件 */
  footerComponents: ComponentNode[];
  addComponent: (component: ComponentNode, section?: PageSection) => void;
  updateComponent: (id: string, updates: Partial<ComponentNode>) => void;
  removeComponent: (id: string) => void;

  // 当前选中的组件
  selectedComponentId: string | null;
  selectComponent: (id: string | null) => void;

  // 多选组件
  selectedComponentIds: string[];
  toggleSelectComponent: (id: string) => void;
  clearSelection: () => void;
  selectMultiple: (ids: string[]) => void;

  // 模板信息
  templateId: string | null;
  templateName: string;
  schemaId: string | null;
  pageConfig: PageConfig;
  setTemplateInfo: (info: Partial<{ templateId: string | null; templateName: string; schemaId: string | null }>) => void;
  setPageConfig: (config: Partial<PageConfig>) => void;
  /** 设置页头区域开关 */
  setHeaderEnabled: (enabled: boolean) => void;
  /** 设置页脚区域开关 */
  setFooterEnabled: (enabled: boolean) => void;

  // 生成完整的模板 JSON
  generateTemplate: () => Omit<PrintTemplate, 'id'>;

  // 加载模板
  loadTemplate: (template: PrintTemplate) => void;

  // 清空画布
  clearCanvas: () => void;

  // 复制/粘贴
  clipboard: ComponentNode[];
  copyComponents: (ids: string[]) => void;
  pasteComponents: (section?: PageSection) => void;
  duplicateComponent: (id: string) => void;

  /** 将组件移动到指定区域 */
  moveComponentToSection: (id: string, targetSection: PageSection, newYm?: number) => void;

  // 网格设置
  gridEnabled: boolean;
  gridSize: number;
  toggleGrid: () => void;
  setGridSize: (size: number) => void;

  // 缩放设置
  zoomLevel: number;
  setZoom: (level: number) => void;
  zoomInAction: () => void;
  zoomOutAction: () => void;
  resetZoom: () => void;

  // 对齐工具
  alignComponents: (direction: 'left' | 'right' | 'top' | 'bottom' | 'centerH' | 'centerV') => void;
  distributeComponents: (direction: 'horizontal' | 'vertical') => void;

  // 层级管理
  bringToFront: (id: string) => void;  // 置顶
  sendToBack: (id: string) => void;    // 置底
  bringForward: (id: string) => void;  // 上移一层
  sendBackward: (id: string) => void;  // 下移一层

  // 撤销/重做 — 全量状态快照
  history: { headerComponents: ComponentNode[]; components: ComponentNode[]; footerComponents: ComponentNode[] }[];
  historyIndex: number;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

// 保存历史记录
const saveHistory = (state: DesignerStore) => {
  const snapshot = {
    headerComponents: JSON.parse(JSON.stringify(state.headerComponents)),
    components: JSON.parse(JSON.stringify(state.components)),
    footerComponents: JSON.parse(JSON.stringify(state.footerComponents)),
  };
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(snapshot);
  if (newHistory.length > MAX_HISTORY_STEPS) {
    newHistory.shift();
    return { history: newHistory, historyIndex: newHistory.length - 1 };
  }
  return { history: newHistory, historyIndex: newHistory.length - 1 };
};

export const useDesignerStore = create<DesignerStore>((set, get) => ({
  components: [],
  headerComponents: [],
  footerComponents: [],

  addComponent: (component, section = 'content') => {
    set((state) => {
      let updater: Partial<DesignerStore>;
      if (section === 'header') {
        updater = { headerComponents: [...state.headerComponents, component] };
      } else if (section === 'footer') {
        updater = { footerComponents: [...state.footerComponents, component] };
      } else {
        updater = { components: [...state.components, component] };
      }
      return { ...updater, ...saveHistory({ ...state, ...updater }) };
    });
  },
  updateComponent: (id, updates) => {
    set((state) => {
      const updater = (list: ComponentNode[]) =>
        list.map((comp) => (comp.id === id ? { ...comp, ...updates } : comp));
      const newState = {
        headerComponents: updater(state.headerComponents),
        components: updater(state.components),
        footerComponents: updater(state.footerComponents),
      };
      return { ...newState, ...saveHistory({ ...state, ...newState }) };
    });
  },
  removeComponent: (id) => {
    set((state) => {
      const newState = {
        headerComponents: state.headerComponents.filter((comp) => comp.id !== id),
        components: state.components.filter((comp) => comp.id !== id),
        footerComponents: state.footerComponents.filter((comp) => comp.id !== id),
        selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId,
        selectedComponentIds: state.selectedComponentIds.filter((sid) => sid !== id),
      };
      return { ...newState, ...saveHistory({ ...state, ...newState }) };
    });
  },

  selectedComponentId: null,
  selectComponent: (id) => set({ selectedComponentId: id, selectedComponentIds: id ? [id] : [] }),

  selectedComponentIds: [],
  toggleSelectComponent: (id) => {
    set((state) => {
      const isSelected = state.selectedComponentIds.includes(id);
      const newIds = isSelected
        ? state.selectedComponentIds.filter((cid) => cid !== id)
        : [...state.selectedComponentIds, id];
      return {
        selectedComponentIds: newIds,
        selectedComponentId: newIds.length === 1 ? newIds[0] : null,
      };
    });
  },
  clearSelection: () => set({ selectedComponentId: null, selectedComponentIds: [] }),
  selectMultiple: (ids) => set({ selectedComponentIds: ids, selectedComponentId: ids.length === 1 ? ids[0] : null }),

  templateId: null,
  templateName: '未命名模板',
  schemaId: null,
  pageConfig: {
    size: 'A4',
    orientation: 'portrait',
    marginMm: { top: 10, right: 10, bottom: 10, left: 10 },
  },
  setTemplateInfo: (info) => set(info),
  setPageConfig: (config) => set((state) => ({
    pageConfig: { ...state.pageConfig, ...config },
  })),
  setHeaderEnabled: (enabled) => set((state) => ({
    pageConfig: { ...state.pageConfig, headerEnabled: enabled },
  })),
  setFooterEnabled: (enabled) => set((state) => ({
    pageConfig: { ...state.pageConfig, footerEnabled: enabled },
  })),

  generateTemplate: () => {
    const state = get();
    return {
      name: state.templateName,
      version: '1.0.0',
      schemaId: state.schemaId || '',
      page: state.pageConfig,
      layoutMode: 'absolute',
      components: state.components,
      headerComponents: state.headerComponents,
      footerComponents: state.footerComponents,
    };
  },

  loadTemplate: (template) => {
    // 向后兼容：旧模板可能没有 headerHeight/footerHeight，按现有逻辑推断一次
    const inferHeight = (
      enabled: boolean,
      existingHeight: number | undefined,
      components: ComponentNode[],
      defaultMin: number
    ): number => {
      if (existingHeight !== undefined && existingHeight > 0) return existingHeight;
      if (!enabled) return 0;
      const autoH = Math.max(
        defaultMin,
        ...components.map((c) => (c.layout.yMm || 0) + (c.layout.heightMm || 10))
      );
      return autoH;
    };

    const headerHeight = inferHeight(
      template.page.headerEnabled ?? false,
      template.page.headerHeight,
      template.headerComponents || [],
      15
    );
    const footerHeight = inferHeight(
      template.page.footerEnabled ?? false,
      template.page.footerHeight,
      template.footerComponents || [],
      15
    );

    set({
      templateId: template.id,
      templateName: template.name,
      schemaId: template.schemaId,
      pageConfig: {
        ...template.page,
        headerEnabled: template.page.headerEnabled ?? false,
        footerEnabled: template.page.footerEnabled ?? false,
        headerHeight,
        footerHeight,
      },
      components: template.components,
      headerComponents: template.headerComponents || [],
      footerComponents: template.footerComponents || [],
      selectedComponentId: null,
      zoomLevel: 100,
    });
  },

  clearCanvas: () => {
    set({
      components: [],
      headerComponents: [],
      footerComponents: [],
      selectedComponentId: null,
      selectedComponentIds: [],
      templateId: null,
      templateName: '未命名模板',
      history: [{ headerComponents: [], components: [], footerComponents: [] }],
      historyIndex: 0,
    });
  },

  // 复制/粘贴
  clipboard: [],
  copyComponents: (ids) => {
    const state = get();
    const allComps = [...state.headerComponents, ...state.components, ...state.footerComponents];
    const componentsToCopy = allComps.filter((c) => ids.includes(c.id));
    const copied = JSON.parse(JSON.stringify(componentsToCopy));
    set({ clipboard: copied });
  },
  pasteComponents: (section = 'content') => {
    set((state) => {
      if (state.clipboard.length === 0) return state;

      const newComponents = state.clipboard.map((comp) => ({
        ...comp,
        id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        layout: {
          ...comp.layout,
          xMm: snapToGrid((comp.layout.xMm || 0) + 10, state.gridEnabled, state.gridSize),
          yMm: snapToGrid((comp.layout.yMm || 0) + 10, state.gridEnabled, state.gridSize),
        },
      }));

      const newIds = newComponents.map((c) => c.id);

      let newState: Partial<DesignerStore>;
      if (section === 'header') {
        newState = { headerComponents: [...state.headerComponents, ...newComponents] };
      } else if (section === 'footer') {
        newState = { footerComponents: [...state.footerComponents, ...newComponents] };
      } else {
        newState = { components: [...state.components, ...newComponents] };
      }

      return {
        ...newState,
        selectedComponentIds: newIds,
        selectedComponentId: newIds.length === 1 ? newIds[0] : null,
        ...saveHistory({ ...state, ...newState }),
      };
    });
  },
  duplicateComponent: (id) => {
    set((state) => {
      const findIn = (list: ComponentNode[]) => {
        return list.find((c) => c.id === id);
      };
      const comp = findIn(state.headerComponents) || findIn(state.components) || findIn(state.footerComponents);
      if (!comp) return state;

      const newComp = {
        ...JSON.parse(JSON.stringify(comp)),
        id: `comp-${Date.now()}`,
        layout: {
          ...comp.layout,
          xMm: snapToGrid((comp.layout.xMm || 0) + 10, state.gridEnabled, state.gridSize),
          yMm: snapToGrid((comp.layout.yMm || 0) + 10, state.gridEnabled, state.gridSize),
        },
      };

      const dupIn = (list: ComponentNode[], sourceId: string) => {
        const idx = list.findIndex((c) => c.id === sourceId);
        if (idx === -1) return list;
        return [...list.slice(0, idx + 1), newComp, ...list.slice(idx + 1)];
      };

      const newState = {
        headerComponents: dupIn(state.headerComponents, id),
        components: dupIn(state.components, id),
        footerComponents: dupIn(state.footerComponents, id),
      };

      return {
        ...newState,
        selectedComponentId: newComp.id,
        selectedComponentIds: [newComp.id],
        ...saveHistory({ ...state, ...newState }),
      };
    });
  },

  // 网格设置
  gridEnabled: true,
  gridSize: 5, // 5mm
  toggleGrid: () => set((state) => ({ gridEnabled: !state.gridEnabled })),
  setGridSize: (size) => set({ gridSize: size }),

  // 缩放设置
  zoomLevel: 100,
  setZoom: (level) => set({ zoomLevel: Math.max(25, Math.min(200, level)) }),
  zoomInAction: () => set((state) => ({ zoomLevel: Math.min(200, state.zoomLevel + 25) })),
  zoomOutAction: () => set((state) => ({ zoomLevel: Math.max(25, state.zoomLevel - 25) })),
  resetZoom: () => set({ zoomLevel: 100 }),

  // 层级管理（区域感知）
  bringToFront: (id) => {
    set((state) => {
      const findInSection = (list: ComponentNode[]) => list.findIndex((c) => c.id === id);
      const hIdx = findInSection(state.headerComponents);
      const cIdx = findInSection(state.components);
      const fIdx = findInSection(state.footerComponents);

      if (hIdx !== -1 && hIdx < state.headerComponents.length - 1) {
        const newList = [...state.headerComponents];
        const [comp] = newList.splice(hIdx, 1);
        newList.push(comp);
        return { headerComponents: newList, ...saveHistory({ ...state, headerComponents: newList }) };
      }
      if (cIdx !== -1 && cIdx < state.components.length - 1) {
        const newList = [...state.components];
        const [comp] = newList.splice(cIdx, 1);
        newList.push(comp);
        return { components: newList, ...saveHistory({ ...state, components: newList }) };
      }
      if (fIdx !== -1 && fIdx < state.footerComponents.length - 1) {
        const newList = [...state.footerComponents];
        const [comp] = newList.splice(fIdx, 1);
        newList.push(comp);
        return { footerComponents: newList, ...saveHistory({ ...state, footerComponents: newList }) };
      }
      return state;
    });
  },
  sendToBack: (id) => {
    set((state) => {
      const findInSection = (list: ComponentNode[]) => list.findIndex((c) => c.id === id);
      const hIdx = findInSection(state.headerComponents);
      const cIdx = findInSection(state.components);
      const fIdx = findInSection(state.footerComponents);

      if (hIdx > 0) {
        const newList = [...state.headerComponents];
        const [comp] = newList.splice(hIdx, 1);
        newList.unshift(comp);
        return { headerComponents: newList, ...saveHistory({ ...state, headerComponents: newList }) };
      }
      if (cIdx > 0) {
        const newList = [...state.components];
        const [comp] = newList.splice(cIdx, 1);
        newList.unshift(comp);
        return { components: newList, ...saveHistory({ ...state, components: newList }) };
      }
      if (fIdx > 0) {
        const newList = [...state.footerComponents];
        const [comp] = newList.splice(fIdx, 1);
        newList.unshift(comp);
        return { footerComponents: newList, ...saveHistory({ ...state, footerComponents: newList }) };
      }
      return state;
    });
  },
  bringForward: (id) => {
    set((state) => {
      const findInSection = (list: ComponentNode[]) => list.findIndex((c) => c.id === id);
      const hIdx = findInSection(state.headerComponents);
      const cIdx = findInSection(state.components);
      const fIdx = findInSection(state.footerComponents);

      if (hIdx !== -1 && hIdx < state.headerComponents.length - 1) {
        const newList = [...state.headerComponents];
        [newList[hIdx], newList[hIdx + 1]] = [newList[hIdx + 1], newList[hIdx]];
        return { headerComponents: newList, ...saveHistory({ ...state, headerComponents: newList }) };
      }
      if (cIdx !== -1 && cIdx < state.components.length - 1) {
        const newList = [...state.components];
        [newList[cIdx], newList[cIdx + 1]] = [newList[cIdx + 1], newList[cIdx]];
        return { components: newList, ...saveHistory({ ...state, components: newList }) };
      }
      if (fIdx !== -1 && fIdx < state.footerComponents.length - 1) {
        const newList = [...state.footerComponents];
        [newList[fIdx], newList[fIdx + 1]] = [newList[fIdx + 1], newList[fIdx]];
        return { footerComponents: newList, ...saveHistory({ ...state, footerComponents: newList }) };
      }
      return state;
    });
  },
  sendBackward: (id) => {
    set((state) => {
      const findInSection = (list: ComponentNode[]) => list.findIndex((c) => c.id === id);
      const hIdx = findInSection(state.headerComponents);
      const cIdx = findInSection(state.components);
      const fIdx = findInSection(state.footerComponents);

      if (hIdx > 0) {
        const newList = [...state.headerComponents];
        [newList[hIdx], newList[hIdx - 1]] = [newList[hIdx - 1], newList[hIdx]];
        return { headerComponents: newList, ...saveHistory({ ...state, headerComponents: newList }) };
      }
      if (cIdx > 0) {
        const newList = [...state.components];
        [newList[cIdx], newList[cIdx - 1]] = [newList[cIdx - 1], newList[cIdx]];
        return { components: newList, ...saveHistory({ ...state, components: newList }) };
      }
      if (fIdx > 0) {
        const newList = [...state.footerComponents];
        [newList[fIdx], newList[fIdx - 1]] = [newList[fIdx - 1], newList[fIdx]];
        return { footerComponents: newList, ...saveHistory({ ...state, footerComponents: newList }) };
      }
      return state;
    });
  },

  // ==== 区域移动 ====
  moveComponentToSection: (id, targetSection, newYm) => {
    set((state) => {
      const findComp = (list: ComponentNode[]) => list.find((c) => c.id === id);

      const found =
        findComp(state.headerComponents) ||
        findComp(state.components) ||
        findComp(state.footerComponents);

      if (!found) return state;

      // 表格组件不允许放入页头/页脚
      if (targetSection !== 'content' && found.type === 'table') return state;

      const removeFrom = (list: ComponentNode[]) => list.filter((c) => c.id !== id);
      const h = removeFrom(state.headerComponents);
      const c = removeFrom(state.components);
      const f = removeFrom(state.footerComponents);

      const moved: ComponentNode = {
        ...found,
        layout: {
          ...found.layout,
          yMm: newYm !== undefined
            ? snapToGrid(newYm, state.gridEnabled, state.gridSize)
            : snapToGrid(0, state.gridEnabled, state.gridSize),
        },
      };

      const newState = {
        headerComponents: targetSection === 'header' ? [...h, moved] : h,
        components: targetSection === 'content' ? [...c, moved] : c,
        footerComponents: targetSection === 'footer' ? [...f, moved] : f,
      };

      return { ...newState, ...saveHistory({ ...state, ...newState }) };
    });
  },

  // 撤销/重做 — 全量快照
  history: [{ headerComponents: [], components: [], footerComponents: [] }],
  historyIndex: 0,
  undo: () => {
    set((state) => {
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        const snapshot = state.history[newIndex];
        return {
          headerComponents: JSON.parse(JSON.stringify(snapshot.headerComponents)),
          components: JSON.parse(JSON.stringify(snapshot.components)),
          footerComponents: JSON.parse(JSON.stringify(snapshot.footerComponents)),
          historyIndex: newIndex,
          selectedComponentId: null,
        };
      }
      return state;
    });
  },
  redo: () => {
    set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        const snapshot = state.history[newIndex];
        return {
          headerComponents: JSON.parse(JSON.stringify(snapshot.headerComponents)),
          components: JSON.parse(JSON.stringify(snapshot.components)),
          footerComponents: JSON.parse(JSON.stringify(snapshot.footerComponents)),
          historyIndex: newIndex,
          selectedComponentId: null,
        };
      }
      return state;
    });
  },
  canUndo: () => {
    return get().historyIndex > 0;
  },
  canRedo: () => {
    return get().historyIndex < get().history.length - 1;
  },

  // ==== 对齐工具（区域感知） ====
  alignComponents: (direction) => {
    set((state) => {
      const selectedIds = state.selectedComponentIds;
      if (selectedIds.length < 2) return state;

      // 从三个区域中查找选中的组件
      const allComps = [...state.headerComponents, ...state.components, ...state.footerComponents];
      const selectedComps = allComps.filter((c) => selectedIds.includes(c.id));
      if (selectedComps.length < 2) return state;

      // 垂直方向对齐（top/bottom/centerV）不允许跨区域操作
      if (['top', 'bottom', 'centerV'].includes(direction)) {
        const sections = new Set<string>();
        selectedComps.forEach((c) => {
          if (state.headerComponents.some((h) => h.id === c.id)) sections.add('header');
          else if (state.footerComponents.some((f) => f.id === c.id)) sections.add('footer');
          else sections.add('content');
        });
        if (sections.size > 1) return state; // 跨区域，不执行
      }

      const { size, orientation, marginMm, widthMm, heightMm } = state.pageConfig;
      let pageW: number;
      let pageH: number;
      if (size === 'CONTINUOUS') {
        pageW = widthMm || CONTINUOUS_PAPER_DEFAULT_WIDTH;
        pageH = 10000; // 连续纸高度无限
      } else if (size === 'CUSTOM') {
        pageW = widthMm || 210;
        pageH = heightMm || 297;
      } else {
        pageW = size === 'A4' ? 210 : 148;
        pageH = size === 'A4' ? 297 : 210;
      }
      // 连续纸不支持横版旋转
      if (orientation === 'landscape' && size !== 'CONTINUOUS') { [pageW, pageH] = [pageH, pageW]; }

      const availW = pageW - marginMm.left - marginMm.right;

      const constrainX = (x: number, w: number) => Math.max(marginMm.left, Math.min(marginMm.left + availW - w, x));
      /** 根据组件所在区域返回 Y 约束函数（坐标系：区域相对，0 = 区域顶部） */
      const constrainYFor = (section: 'header' | 'content' | 'footer', h: number) => {
        if (section === 'header') {
          const headerH = Math.max(15, state.pageConfig.headerHeight || 15);
          return (y: number) => Math.max(0, Math.min(headerH - h, y));
        }
        if (section === 'footer') {
          const footerH = Math.max(15, state.pageConfig.footerHeight || 15);
          return (y: number) => Math.max(0, Math.min(footerH - h, y));
        }
        // content 区域：yMm 相对于内容区域顶部，范围 [0, contentAvailH - h]
        const headerH = (state.pageConfig.headerEnabled ?? false)
          ? Math.max(15, state.pageConfig.headerHeight || 15) : 0;
        const footerH = (state.pageConfig.footerEnabled ?? false)
          ? Math.max(15, state.pageConfig.footerHeight || 15) : 0;
        const contentAvailH = pageH - marginMm.top - marginMm.bottom - headerH - footerH;
        return (y: number) => Math.max(0, Math.min(contentAvailH - h, y));
      };

      // 构建新的三个列表
      const hList = [...state.headerComponents];
      const cList = [...state.components];
      const fList = [...state.footerComponents];

      /** 判断组件所属区域 */
      const getSection = (id: string): 'header' | 'content' | 'footer' => {
        if (hList.some((c) => c.id === id)) return 'header';
        if (fList.some((c) => c.id === id)) return 'footer';
        return 'content';
      };

      const updateComp = (list: ComponentNode[], id: string, updater: (c: ComponentNode) => ComponentNode) => {
        const idx = list.findIndex((c) => c.id === id);
        if (idx !== -1) list[idx] = updater(list[idx]);
        return list;
      };

      const apply = (id: string, fn: (c: ComponentNode) => ComponentNode) => {
        updateComp(hList, id, fn);
        updateComp(cList, id, fn);
        updateComp(fList, id, fn);
      };

      switch (direction) {
        case 'left': {
          const minX = Math.min(...selectedComps.map((c) => c.layout.xMm || 0));
          selectedIds.forEach((id) => {
            const comp = allComps.find((c) => c.id === id);
            if (!comp) return;
            const w = comp.layout.widthMm || 0;
            apply(id, (c) => ({ ...c, layout: { ...c.layout, xMm: constrainX(minX, w) } }));
          });
          break;
        }
        case 'right': {
          const maxR = Math.max(...selectedComps.map((c) => (c.layout.xMm || 0) + (c.layout.widthMm || 0)));
          selectedIds.forEach((id) => {
            const comp = allComps.find((c) => c.id === id);
            if (!comp) return;
            const w = comp.layout.widthMm || 0;
            apply(id, (c) => ({ ...c, layout: { ...c.layout, xMm: constrainX(maxR - w, w) } }));
          });
          break;
        }
        case 'top': {
          const minY = Math.min(...selectedComps.map((c) => c.layout.yMm || 0));
          selectedIds.forEach((id) => {
            const comp = allComps.find((c) => c.id === id);
            if (!comp) return;
            const h = comp.layout.heightMm || 0;
            const cyFn = constrainYFor(getSection(id), h);
            apply(id, (c) => ({ ...c, layout: { ...c.layout, yMm: cyFn(minY) } }));
          });
          break;
        }
        case 'bottom': {
          const maxB = Math.max(...selectedComps.map((c) => (c.layout.yMm || 0) + (c.layout.heightMm || 0)));
          selectedIds.forEach((id) => {
            const comp = allComps.find((c) => c.id === id);
            if (!comp) return;
            const h = comp.layout.heightMm || 0;
            const cyFn = constrainYFor(getSection(id), h);
            apply(id, (c) => ({ ...c, layout: { ...c.layout, yMm: cyFn(maxB - h) } }));
          });
          break;
        }
        case 'centerH': {
          const cX = selectedComps.reduce((s, c) => s + (c.layout.xMm || 0) + (c.layout.widthMm || 0) / 2, 0) / selectedComps.length;
          selectedIds.forEach((id) => {
            const comp = allComps.find((c) => c.id === id);
            if (!comp) return;
            const w = comp.layout.widthMm || 0;
            apply(id, (c) => ({ ...c, layout: { ...c.layout, xMm: constrainX(cX - w / 2, w) } }));
          });
          break;
        }
        case 'centerV': {
          const cY = selectedComps.reduce((s, c) => s + (c.layout.yMm || 0) + (c.layout.heightMm || 0) / 2, 0) / selectedComps.length;
          selectedIds.forEach((id) => {
            const comp = allComps.find((c) => c.id === id);
            if (!comp) return;
            const h = comp.layout.heightMm || 0;
            const cyFn = constrainYFor(getSection(id), h);
            apply(id, (c) => ({ ...c, layout: { ...c.layout, yMm: cyFn(cY - h / 2) } }));
          });
          break;
        }
      }

      const newState = { headerComponents: hList, components: cList, footerComponents: fList };
      return { ...newState, ...saveHistory({ ...state, ...newState }) };
    });
  },

  distributeComponents: (direction) => {
    set((state) => {
      const selectedIds = state.selectedComponentIds;
      if (selectedIds.length < 3) return state;

      // 从三个区域中查找选中的组件
      const allComps = [...state.headerComponents, ...state.components, ...state.footerComponents];
      const selectedComps = allComps
        .filter((c) => selectedIds.includes(c.id))
        .sort((a, b) =>
          direction === 'horizontal'
            ? (a.layout.xMm || 0) - (b.layout.xMm || 0)
            : (a.layout.yMm || 0) - (b.layout.yMm || 0)
        );

      // 垂直方向分布不允许跨区域操作
      if (direction === 'vertical') {
        const sections = new Set<string>();
        selectedComps.forEach((c) => {
          if (state.headerComponents.some((h) => h.id === c.id)) sections.add('header');
          else if (state.footerComponents.some((f) => f.id === c.id)) sections.add('footer');
          else sections.add('content');
        });
        if (sections.size > 1) return state; // 跨区域，不执行
      }

      const hList = [...state.headerComponents];
      const cList = [...state.components];
      const fList = [...state.footerComponents];

      const updater = (list: ComponentNode[], id: string, fn: (c: ComponentNode) => ComponentNode) => {
        const idx = list.findIndex((c) => c.id === id);
        if (idx !== -1) list[idx] = fn(list[idx]);
        return list;
      };
      const applyDist = (id: string, fn: (c: ComponentNode) => ComponentNode) => {
        updater(hList, id, fn);
        updater(cList, id, fn);
        updater(fList, id, fn);
      };

      if (direction === 'horizontal') {
        const firstX = selectedComps[0].layout.xMm || 0;
        const lastRight = (selectedComps[selectedComps.length - 1].layout.xMm || 0) + (selectedComps[selectedComps.length - 1].layout.widthMm || 0);
        const totalW = selectedComps.reduce((s, c) => s + (c.layout.widthMm || 0), 0);
        const gap = (lastRight - firstX - totalW) / (selectedComps.length - 1);
        let curX = firstX;
        selectedComps.forEach((comp) => {
          applyDist(comp.id, (c) => ({ ...c, layout: { ...c.layout, xMm: curX } }));
          curX += (comp.layout.widthMm || 0) + gap;
        });
      } else {
        const firstY = selectedComps[0].layout.yMm || 0;
        const lastB = (selectedComps[selectedComps.length - 1].layout.yMm || 0) + (selectedComps[selectedComps.length - 1].layout.heightMm || 0);
        const totalH = selectedComps.reduce((s, c) => s + (c.layout.heightMm || 0), 0);
        const gap = (lastB - firstY - totalH) / (selectedComps.length - 1);
        let curY = firstY;
        selectedComps.forEach((comp) => {
          applyDist(comp.id, (c) => ({ ...c, layout: { ...c.layout, yMm: curY } }));
          curY += (comp.layout.heightMm || 0) + gap;
        });
      }

      const newState = { headerComponents: hList, components: cList, footerComponents: fList };
      return { ...newState, ...saveHistory({ ...state, ...newState }) };
    });
  },
}));
