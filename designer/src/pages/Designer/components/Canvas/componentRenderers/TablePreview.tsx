import type { ComponentNode } from '../../../../../types';

interface TablePreviewProps {
  component: ComponentNode;
}

/**
 * 表格组件预览
 */
export const TablePreview = ({ component }: TablePreviewProps) => {
  const columns = component.props?.columns || [];
  const bordered = component.props?.bordered !== false;
  const showHeader = component.props?.showHeader !== false;
  const visibleColumns = columns.filter((col: any) => !col.hidden);
  const tableTextAlign = component.style?.textAlign || 'left';

  return (
    <table style={{
      width: '100%',
      height: '100%',
      borderCollapse: 'collapse',
      fontSize: component.style?.fontSize || 12,
    }}>
      {showHeader && visibleColumns.length > 0 && (
        <thead>
          <tr>
            {visibleColumns.map((col: any, idx: number) => (
              <th key={idx} style={{
                border: bordered ? '1px solid #d9d9d9' : 'none',
                padding: '8px',
                background: '#fafafa',
                fontWeight: 600,
                textAlign: tableTextAlign as any,
              }}>
                {col.title || col.dataIndex}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        <tr>
          <td colSpan={visibleColumns.length || 1} style={{
            border: bordered ? '1px solid #d9d9d9' : 'none',
            padding: '8px',
            textAlign: 'center',
            color: '#999',
          }}>
            暂无数据
          </td>
        </tr>
      </tbody>
    </table>
  );
};
