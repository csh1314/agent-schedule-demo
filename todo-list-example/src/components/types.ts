/**
 * Todo 数据模型（与 PRD 数据模型一致）
 */
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

/**
 * 筛选类型
 */
export type FilterType = 'all' | 'active' | 'completed';
