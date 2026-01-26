import { create } from 'zustand';
import type { ComponentNode, PrintTemplate, PageConfig } from '../types';
import { snapToGrid } from '../utils/grid';

// 最多保存 20 步历史
const MAX_HISTORY_STEPS = 20;

interface DesignerStore {
  // 画布上的组件列表
  components: ComponentNode[];
  addComponent: (component: ComponentNode) => void;
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
  setPageConfig: (config: PageConfig) => void;

  // 生成完整的模板 JSON
  generateTemplate: () => Omit<PrintTemplate, 'id'>;

  // 加载模板
  loadTemplate: (template: PrintTemplate) => void;

  // 清空画布
  clearCanvas: () => void;

  // 复制/粘贴
  clipboard: ComponentNode[];
  copyComponents: (ids: string[]) => void;
  pasteComponents: () => void;
  duplicateComponent: (id: string) => void;

  // 网格设置
  gridEnabled: boolean;
  gridSize: number;
  toggleGrid: () => void;
  setGridSize: (size: number) => void;

  // 对齐工具
  alignComponents: (direction: 'left' | 'right' | 'top' | 'bottom' | 'centerH' | 'centerV') => void;
  distributeComponents: (direction: 'horizontal' | 'vertical') => void;

  // 层级管理
  bringToFront: (id: string) => void;  // 置顶
  sendToBack: (id: string) => void;    // 置底
  bringForward: (id: string) => void;  // 上移一层
  sendBackward: (id: string) => void;  // 下移一层

  // 撤销/重做
  history: ComponentNode[][];
  historyIndex: number;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

// 保存历史记录
const saveHistory = (state: DesignerStore) => {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(JSON.parse(JSON.stringify(state.components)));
  // 最多保存 20 步历史
  if (newHistory.length > MAX_HISTORY_STEPS) {
    newHistory.shift();
    return { history: newHistory, historyIndex: newHistory.length - 1 };
  }
  return { history: newHistory, historyIndex: newHistory.length - 1 };
};

export const useDesignerStore = create<DesignerStore>((set, get) => ({
  components: [],
  addComponent: (component) => {
    set((state) => {
      const newComponents = [...state.components, component];
      return { components: newComponents, ...saveHistory({ ...state, components: newComponents }) };
    });
  },
  updateComponent: (id, updates) => {
    set((state) => {
      const newComponents = state.components.map((comp) =>
        comp.id === id ? { ...comp, ...updates } : comp
      );
      return { components: newComponents, ...saveHistory({ ...state, components: newComponents }) };
    });
  },
  removeComponent: (id) => {
    set((state) => {
      const newComponents = state.components.filter((comp) => comp.id !== id);
      return { components: newComponents, ...saveHistory({ ...state, components: newComponents }) };
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
  setPageConfig: (config) => set({ pageConfig: config }),

  generateTemplate: () => {
    const state = get();
    return {
      name: state.templateName,
      version: '1.0.0',
      schemaId: state.schemaId || '',
      page: state.pageConfig,
      layoutMode: 'absolute',
      components: state.components,
    };
  },

  loadTemplate: (template) => {
    set({
      templateId: template.id,
      templateName: template.name,
      schemaId: template.schemaId,
      pageConfig: template.page,
      components: template.components,
      selectedComponentId: null,
    });
  },

  clearCanvas: () => {
    set({
      components: [],
      selectedComponentId: null,
      selectedComponentIds: [],
      templateId: null,
      templateName: '未命名模板',
      history: [[]],
      historyIndex: 0,
    });
  },

  // 复制/粘贴
  clipboard: [],
  copyComponents: (ids) => {
    const state = get();
    const componentsToCopy = state.components.filter((c) => ids.includes(c.id));
    const copied = JSON.parse(JSON.stringify(componentsToCopy));
    set({ clipboard: copied });
  },
  pasteComponents: () => {
    set((state) => {
      if (state.clipboard.length === 0) return state;

      const newComponents = state.clipboard.map((comp) => ({
        ...comp,
        id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        layout: {
          ...comp.layout,
          xMm: snapToGrid((comp.layout.xMm || 0) + 10, state.gridEnabled, state.gridSize), // 向右偏移 10mm
          yMm: snapToGrid((comp.layout.yMm || 0) + 10, state.gridEnabled, state.gridSize), // 向下偏移 10mm
        },
      }));

      const allComponents = [...state.components, ...newComponents];
      const newIds = newComponents.map((c) => c.id);

      return {
        components: allComponents,
        selectedComponentIds: newIds,
        selectedComponentId: newIds.length === 1 ? newIds[0] : null,
        ...saveHistory({ ...state, components: allComponents }),
      };
    });
  },
  duplicateComponent: (id) => {
    set((state) => {
      const comp = state.components.find((c) => c.id === id);
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

      const newComponents = [...state.components, newComp];
      return {
        components: newComponents,
        selectedComponentId: newComp.id,
        selectedComponentIds: [newComp.id],
        ...saveHistory({ ...state, components: newComponents }),
      };
    });
  },

  // 网格设置
  gridEnabled: true,
  gridSize: 5, // 5mm
  toggleGrid: () => set((state) => ({ gridEnabled: !state.gridEnabled })),
  setGridSize: (size) => set({ gridSize: size }),

  // 层级管理
  bringToFront: (id) => {
    set((state) => {
      const index = state.components.findIndex((c) => c.id === id);
      if (index === -1 || index === state.components.length - 1) return state;

      const newComponents = [...state.components];
      const [component] = newComponents.splice(index, 1);
      newComponents.push(component);

      return {
        components: newComponents,
        ...saveHistory({ ...state, components: newComponents }),
      };
    });
  },
  sendToBack: (id) => {
    set((state) => {
      const index = state.components.findIndex((c) => c.id === id);
      if (index === -1 || index === 0) return state;

      const newComponents = [...state.components];
      const [component] = newComponents.splice(index, 1);
      newComponents.unshift(component);

      return {
        components: newComponents,
        ...saveHistory({ ...state, components: newComponents }),
      };
    });
  },
  bringForward: (id) => {
    set((state) => {
      const index = state.components.findIndex((c) => c.id === id);
      if (index === -1 || index === state.components.length - 1) return state;

      const newComponents = [...state.components];
      [newComponents[index], newComponents[index + 1]] = [newComponents[index + 1], newComponents[index]];

      return {
        components: newComponents,
        ...saveHistory({ ...state, components: newComponents }),
      };
    });
  },
  sendBackward: (id) => {
    set((state) => {
      const index = state.components.findIndex((c) => c.id === id);
      if (index === -1 || index === 0) return state;

      const newComponents = [...state.components];
      [newComponents[index], newComponents[index - 1]] = [newComponents[index - 1], newComponents[index]];

      return {
        components: newComponents,
        ...saveHistory({ ...state, components: newComponents }),
      };
    });
  },

  // 撤销/重做
  history: [[]],
  historyIndex: 0,
  undo: () => {
    set((state) => {
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        return {
          components: JSON.parse(JSON.stringify(state.history[newIndex])),
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
        return {
          components: JSON.parse(JSON.stringify(state.history[newIndex])),
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

  // 对齐工具
  alignComponents: (direction) => {
    set((state) => {
      const selectedIds = state.selectedComponentIds;
      if (selectedIds.length < 2) return state;

      const selectedComps = state.components.filter((c) => selectedIds.includes(c.id));
      const newComponents = [...state.components];

      // 计算页面可用区域（扣除页边距）
      const { size, orientation, marginMm, widthMm, heightMm } = state.pageConfig;
      let pageWidthMm: number;
      let pageHeightMm: number;

      if (size === 'CUSTOM') {
        // 自定义尺寸
        pageWidthMm = widthMm || 210;
        pageHeightMm = heightMm || 297;
      } else {
        // 预设尺寸
        pageWidthMm = size === 'A4' ? 210 : 148;
        pageHeightMm = size === 'A4' ? 297 : 210;
      }

      if (orientation === 'landscape') {
        [pageWidthMm, pageHeightMm] = [pageHeightMm, pageWidthMm];
      }

      const availableWidthMm = pageWidthMm - marginMm.left - marginMm.right;
      const availableHeightMm = pageHeightMm - marginMm.top - marginMm.bottom;

      // 边界限制函数
      const constrainX = (x: number, width: number) => {
        const minX = marginMm.left;
        const maxX = marginMm.left + availableWidthMm - width;
        return Math.max(minX, Math.min(maxX, x));
      };
      const constrainY = (y: number, height: number) => {
        const minY = marginMm.top;
        const maxY = marginMm.top + availableHeightMm - height;
        return Math.max(minY, Math.min(maxY, y));
      };

      switch (direction) {
        case 'left': {
          const minX = Math.min(...selectedComps.map((c) => c.layout.xMm || 0));
          selectedIds.forEach((id) => {
            const idx = newComponents.findIndex((c) => c.id === id);
            if (idx !== -1) {
              const width = newComponents[idx].layout.widthMm || 0;
              const constrainedX = constrainX(minX, width);
              // 只修改 X，保持 Y 不变
              newComponents[idx] = {
                ...newComponents[idx],
                layout: { ...newComponents[idx].layout, xMm: constrainedX },
              };
            }
          });
          break;
        }
        case 'right': {
          const maxRight = Math.max(...selectedComps.map((c) => (c.layout.xMm || 0) + (c.layout.widthMm || 0)));
          selectedIds.forEach((id) => {
            const idx = newComponents.findIndex((c) => c.id === id);
            if (idx !== -1) {
              const width = newComponents[idx].layout.widthMm || 0;
              const targetX = maxRight - width;
              const constrainedX = constrainX(targetX, width);
              // 只修改 X，保持 Y 不变
              newComponents[idx] = {
                ...newComponents[idx],
                layout: { ...newComponents[idx].layout, xMm: constrainedX },
              };
            }
          });
          break;
        }
        case 'top': {
          const minY = Math.min(...selectedComps.map((c) => c.layout.yMm || 0));
          selectedIds.forEach((id) => {
            const idx = newComponents.findIndex((c) => c.id === id);
            if (idx !== -1) {
              const height = newComponents[idx].layout.heightMm || 0;
              const constrainedY = constrainY(minY, height);
              // 只修改 Y，保持 X 不变
              newComponents[idx] = {
                ...newComponents[idx],
                layout: { ...newComponents[idx].layout, yMm: constrainedY },
              };
            }
          });
          break;
        }
        case 'bottom': {
          const maxBottom = Math.max(...selectedComps.map((c) => (c.layout.yMm || 0) + (c.layout.heightMm || 0)));
          selectedIds.forEach((id) => {
            const idx = newComponents.findIndex((c) => c.id === id);
            if (idx !== -1) {
              const height = newComponents[idx].layout.heightMm || 0;
              const targetY = maxBottom - height;
              const constrainedY = constrainY(targetY, height);
              // 只修改 Y，保持 X 不变
              newComponents[idx] = {
                ...newComponents[idx],
                layout: { ...newComponents[idx].layout, yMm: constrainedY },
              };
            }
          });
          break;
        }
        case 'centerH': {
          const centerX = selectedComps.reduce((sum, c) => sum + (c.layout.xMm || 0) + (c.layout.widthMm || 0) / 2, 0) / selectedComps.length;
          selectedIds.forEach((id) => {
            const idx = newComponents.findIndex((c) => c.id === id);
            if (idx !== -1) {
              const width = newComponents[idx].layout.widthMm || 0;
              const targetX = centerX - width / 2;
              const constrainedX = constrainX(targetX, width);
              // 只修改 X，保持 Y 不变
              newComponents[idx] = {
                ...newComponents[idx],
                layout: { ...newComponents[idx].layout, xMm: constrainedX },
              };
            }
          });
          break;
        }
        case 'centerV': {
          const centerY = selectedComps.reduce((sum, c) => sum + (c.layout.yMm || 0) + (c.layout.heightMm || 0) / 2, 0) / selectedComps.length;
          selectedIds.forEach((id) => {
            const idx = newComponents.findIndex((c) => c.id === id);
            if (idx !== -1) {
              const height = newComponents[idx].layout.heightMm || 0;
              const targetY = centerY - height / 2;
              const constrainedY = constrainY(targetY, height);
              // 只修改 Y，保持 X 不变
              newComponents[idx] = {
                ...newComponents[idx],
                layout: { ...newComponents[idx].layout, yMm: constrainedY },
              };
            }
          });
          break;
        }
      }

      return { components: newComponents, ...saveHistory({ ...state, components: newComponents }) };
    });
  },

  distributeComponents: (direction) => {
    set((state) => {
      const selectedIds = state.selectedComponentIds;
      if (selectedIds.length < 3) return state;

      const selectedComps = state.components
        .filter((c) => selectedIds.includes(c.id))
        .sort((a, b) => {
          if (direction === 'horizontal') {
            return (a.layout.xMm || 0) - (b.layout.xMm || 0);
          }
          return (a.layout.yMm || 0) - (b.layout.yMm || 0);
        });

      const newComponents = [...state.components];

      if (direction === 'horizontal') {
        const firstX = selectedComps[0].layout.xMm || 0;
        const lastX = (selectedComps[selectedComps.length - 1].layout.xMm || 0) + (selectedComps[selectedComps.length - 1].layout.widthMm || 0);
        const totalWidth = selectedComps.reduce((sum, c) => sum + (c.layout.widthMm || 0), 0);
        const gap = (lastX - firstX - totalWidth) / (selectedComps.length - 1);

        let currentX = firstX;
        selectedComps.forEach((comp) => {
          const idx = newComponents.findIndex((c) => c.id === comp.id);
          if (idx !== -1) {
            newComponents[idx] = {
              ...newComponents[idx],
              layout: { ...newComponents[idx].layout, xMm: currentX },
            };
            currentX += (comp.layout.widthMm || 0) + gap;
          }
        });
      } else {
        const firstY = selectedComps[0].layout.yMm || 0;
        const lastY = (selectedComps[selectedComps.length - 1].layout.yMm || 0) + (selectedComps[selectedComps.length - 1].layout.heightMm || 0);
        const totalHeight = selectedComps.reduce((sum, c) => sum + (c.layout.heightMm || 0), 0);
        const gap = (lastY - firstY - totalHeight) / (selectedComps.length - 1);

        let currentY = firstY;
        selectedComps.forEach((comp) => {
          const idx = newComponents.findIndex((c) => c.id === comp.id);
          if (idx !== -1) {
            newComponents[idx] = {
              ...newComponents[idx],
              layout: { ...newComponents[idx].layout, yMm: currentY },
            };
            currentY += (comp.layout.heightMm || 0) + gap;
          }
        });
      }

      return { components: newComponents, ...saveHistory({ ...state, components: newComponents }) };
    });
  },
}));
