export interface Todo {
  id: string;          // 唯一标识，使用 crypto.randomUUID() 生成
  text: string;        // 待办事项内容（已 trim）
  completed: boolean;  // 是否已完成，默认 false
  createdAt: number;   // 创建时间戳，Date.now()
}

export type FilterStatus = 'all' | 'active' | 'completed';
