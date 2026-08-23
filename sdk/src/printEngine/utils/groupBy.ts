/**
 * 表格分组工具
 * 按指定字段将扁平数据切分为多组，首版保持首次出现顺序，不排序
 * @module groupBy
 */

/**
 * 分组后内部结构
 */
export interface GroupedData {
  /** 分组键（原始字符串，未经 pipes 转换） */
  key: string;
  /** 组内明细 */
  items: any[];
  /** 组在原扁平数组中的起始序号（用于行号连续） */
  startRowIndex: number;
  /** 是否为空值归组（field 值为 null/undefined/''），此类组的标题不走 pipes 转换 */
  isEmpty?: boolean;
}

const DEFAULT_EMPTY_LABEL = '未分组';

/**
 * 根据数据路径从对象中取值（轻量版，复用 TableRenderer 的 getByPath 逻辑）
 * @param obj - 数据对象
 * @param path - 属性路径，支持点号分隔
 * @returns 属性值
 */
function getByPath(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  const keys = path.split('.');
  let value = obj;
  for (const key of keys) {
    if (value === null || value === undefined) return undefined;
    value = value[key];
  }
  return value;
}

/**
 * 按指定字段将扁平数据分组
 * @param data - 扁平数据数组
 * @param field - 分组字段，支持点号路径
 * @param emptyLabel - 空值分组标题，默认"未分组"
 * @returns 分组列表，保持首次出现顺序
 * @example
 * groupByField([{cat:'a',v:1},{cat:'b',v:2},{cat:'a',v:3}], 'cat')
 * // → [{key:'a', items:[{cat:'a',v:1},{cat:'a',v:3}], startRowIndex:0},
 * //    {key:'b', items:[{cat:'b',v:2}], startRowIndex:1}]
 */
export function groupByField(
  data: any[],
  field: string,
  emptyLabel: string = DEFAULT_EMPTY_LABEL
): GroupedData[] {
  if (!Array.isArray(data) || data.length === 0) return [];
  if (!field) return [{ key: emptyLabel, items: [...data], startRowIndex: 0 }];

  const map = new Map<string, GroupedData>();
  const order: string[] = [];

  data.forEach((row, idx) => {
    const raw = getByPath(row, field);
    const isEmpty = raw === null || raw === undefined || raw === '';
    const key = isEmpty ? emptyLabel : String(raw);

    if (!map.has(key)) {
      const g: GroupedData = { key, items: [], startRowIndex: idx, isEmpty: isEmpty };
      map.set(key, g);
      order.push(key);
    }
    // 保持组内原序，首个出现的 startRowIndex 即为组起始序号
    map.get(key)!.items.push(row);
  });

  return order.map(k => map.get(k)!);
}

/**
 * 判断分组表格是否会渲染分组小计行。
 * 只要开启分组小计（showSummary !== false）就会渲染小计行；
 * 未配置 summaryItems 时仅渲染标签（如「{group}小计」）而不做数据汇总，
 * 供用户将小计行用于签收、签字等其它用途。
 * @param groupBy - 分组配置
 * @returns 是否会渲染分组小计行
 */
export function hasGroupSummary(groupBy: any): boolean {
  return !!groupBy && groupBy.showSummary !== false;
}
