import { Button, Space, Tooltip, Divider } from 'antd';
import {
  AlignLeftOutlined,
  AlignRightOutlined,
  AlignCenterOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignMiddleOutlined,
  ColumnWidthOutlined,
  ColumnHeightOutlined,
  BorderOutlined,
  UndoOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import { CONTINUOUS_PAPER_DEFAULT_WIDTH } from '../../../../constants';
import type { PageConfig } from '../../../../types';
import styles from './index.module.css';

interface CanvasToolbarProps {
  onNew: () => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  selectedCount: number;
  onAlign: (direction: 'left' | 'right' | 'top' | 'bottom' | 'centerH' | 'centerV') => void;
  onDistribute: (direction: 'horizontal' | 'vertical') => void;
  onPageSetting: () => void;
  onToggleGrid: () => void;
  gridEnabled: boolean;
  gridSize: number;
  pageConfig: PageConfig;
  onQuickPrint: () => void;
}

const CanvasToolbar = ({
  onNew,
  onSave,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  selectedCount,
  onAlign,
  onDistribute,
  onPageSetting,
  onToggleGrid,
  gridEnabled,
  gridSize,
  pageConfig,
  onQuickPrint,
}: CanvasToolbarProps) => {
  return (
    <div className={styles.toolbar}>
      <Space>
        <Button onClick={onNew}>重置</Button>
        <Button onClick={onSave}>保存</Button>
      </Space>
      <Space>
        <Tooltip title="撤销 (Ctrl+Z)">
          <Button
            icon={<UndoOutlined />}
            onClick={onUndo}
            disabled={!canUndo}
          >
          </Button>
        </Tooltip>
        <Tooltip title="重做 (Ctrl+Shift+Z)">
          <Button
            icon={<RedoOutlined />}
            onClick={onRedo}
            disabled={!canRedo}
          >
          </Button>
        </Tooltip>
      </Space>
      <Divider type="vertical" style={{ height: 24, margin: '0 8px' }} />
      <Space>
        <Tooltip title="左对齐">
          <Button
            icon={<AlignLeftOutlined />}
            disabled={selectedCount < 2}
            onClick={() => onAlign('left')}
          />
        </Tooltip>
        <Tooltip title="水平居中">
          <Button
            icon={<AlignCenterOutlined />}
            disabled={selectedCount < 2}
            onClick={() => onAlign('centerH')}
          />
        </Tooltip>
        <Tooltip title="右对齐">
          <Button
            icon={<AlignRightOutlined />}
            disabled={selectedCount < 2}
            onClick={() => onAlign('right')}
          />
        </Tooltip>
        <Tooltip title="顶部对齐">
          <Button
            icon={<VerticalAlignTopOutlined />}
            disabled={selectedCount < 2}
            onClick={() => onAlign('top')}
          />
        </Tooltip>
        <Tooltip title="垂直居中">
          <Button
            icon={<VerticalAlignMiddleOutlined />}
            disabled={selectedCount < 2}
            onClick={() => onAlign('centerV')}
          />
        </Tooltip>
        <Tooltip title="底部对齐">
          <Button
            icon={<VerticalAlignBottomOutlined />}
            disabled={selectedCount < 2}
            onClick={() => onAlign('bottom')}
          />
        </Tooltip>
      </Space>
      <Space>
        <Tooltip title="水平分布">
          <Button
            icon={<ColumnWidthOutlined />}
            disabled={selectedCount < 3}
            onClick={() => onDistribute('horizontal')}
          />
        </Tooltip>
        <Tooltip title="垂直分布">
          <Button
            icon={<ColumnHeightOutlined />}
            disabled={selectedCount < 3}
            onClick={() => onDistribute('vertical')}
          />
        </Tooltip>
      </Space>
      <Space>
        <Button onClick={onPageSetting}>
          📏 {pageConfig.size === 'CONTINUOUS'
            ? `连续纸 (${pageConfig.widthMm || CONTINUOUS_PAPER_DEFAULT_WIDTH}mm)`
            : pageConfig.size === 'CUSTOM'
              ? `自定义 (${pageConfig.widthMm}×${pageConfig.heightMm}mm)`
              : `${pageConfig.size} (${pageConfig.orientation === 'portrait' ? '竖向' : '横向'})`
          }
        </Button>
        <Tooltip title={gridEnabled ? '隐藏网格（按住 Shift 键可临时禁用吸附）' : '显示网格'}>
          <Button
            icon={<BorderOutlined />}
            type={gridEnabled ? 'primary' : 'default'}
            onClick={onToggleGrid}
          >
            网格 {gridSize}mm
          </Button>
        </Tooltip>
      </Space>
      <Space>
        <Button type="primary" onClick={onQuickPrint}>测试打印</Button>
      </Space>
    </div>
  );
};

export default CanvasToolbar;
