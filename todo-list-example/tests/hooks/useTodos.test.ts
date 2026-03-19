import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTodos } from '../../src/hooks/useTodos';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useTodos', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  // --- addTodo ---

  // AC-001-1: 基本添加
  it('should add a new todo with the given text', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('买牛奶');
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe('买牛奶');
    expect(result.current.todos[0].completed).toBe(false);
  });

  // AC-001-3: 空内容拦截
  it('should not add a todo with empty text', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('');
    });

    expect(result.current.todos).toHaveLength(0);
  });

  // AC-001-3: 仅空格不添加
  it('should not add a todo with whitespace-only text', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('   ');
    });

    expect(result.current.todos).toHaveLength(0);
  });

  // AC-001-4: 前后空格清除
  it('should trim whitespace from todo text', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('  读书  ');
    });

    expect(result.current.todos[0].text).toBe('读书');
  });

  // --- toggleTodo ---

  // AC-002-1: 标记为完成
  it('should toggle a todo from uncompleted to completed', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('买牛奶');
    });

    const todoId = result.current.todos[0].id;

    act(() => {
      result.current.toggleTodo(todoId);
    });

    expect(result.current.todos[0].completed).toBe(true);
  });

  // AC-002-2: 取消完成标记
  it('should toggle a todo from completed back to uncompleted', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('买牛奶');
    });

    const todoId = result.current.todos[0].id;

    act(() => {
      result.current.toggleTodo(todoId);
    });
    act(() => {
      result.current.toggleTodo(todoId);
    });

    expect(result.current.todos[0].completed).toBe(false);
  });

  // --- deleteTodo ---

  // AC-003-1: 删除单条事项
  it('should delete a todo by id', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('买牛奶');
      result.current.addTodo('写周报');
    });

    const todoId = result.current.todos[0].id;

    act(() => {
      result.current.deleteTodo(todoId);
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe('写周报');
  });

  // AC-003-2: 删除后列表更新 — 顺序不变
  it('should preserve order after deletion', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('A');
      result.current.addTodo('B');
      result.current.addTodo('C');
    });

    const middleId = result.current.todos[1].id;

    act(() => {
      result.current.deleteTodo(middleId);
    });

    expect(result.current.todos.map(t => t.text)).toEqual(['A', 'C']);
  });

  // --- filter ---

  // AC-004-1: 默认筛选为 all
  it('should have "all" as default filter', () => {
    const { result } = renderHook(() => useTodos());

    expect(result.current.filter).toBe('all');
  });

  // AC-004-2: 筛选未完成
  it('should filter active (uncompleted) todos', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('买牛奶');
      result.current.addTodo('写周报');
    });

    const firstId = result.current.todos[0].id;

    act(() => {
      result.current.toggleTodo(firstId); // mark first as completed
    });

    act(() => {
      result.current.setFilter('active');
    });

    expect(result.current.filteredTodos).toHaveLength(1);
    expect(result.current.filteredTodos[0].text).toBe('写周报');
  });

  // AC-004-3: 筛选已完成
  it('should filter completed todos', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('买牛奶');
      result.current.addTodo('写周报');
    });

    const firstId = result.current.todos[0].id;

    act(() => {
      result.current.toggleTodo(firstId);
    });

    act(() => {
      result.current.setFilter('completed');
    });

    expect(result.current.filteredTodos).toHaveLength(1);
    expect(result.current.filteredTodos[0].text).toBe('买牛奶');
  });

  // AC-004-4: 切换回全部
  it('should show all todos when filter is set back to all', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('买牛奶');
      result.current.addTodo('写周报');
    });

    act(() => {
      result.current.setFilter('active');
    });

    act(() => {
      result.current.setFilter('all');
    });

    expect(result.current.filteredTodos).toHaveLength(2);
  });

  // --- activeCount ---

  // AC-005-1: 初始状态 — 0 项待完成
  it('should return 0 activeCount when there are no todos', () => {
    const { result } = renderHook(() => useTodos());

    expect(result.current.activeCount).toBe(0);
  });

  // AC-005-2: 添加后计数更新
  it('should increase activeCount when a todo is added', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('买牛奶');
    });

    expect(result.current.activeCount).toBe(1);
  });

  // AC-005-3: 完成后计数更新
  it('should decrease activeCount when a todo is completed', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('A');
      result.current.addTodo('B');
      result.current.addTodo('C');
    });

    const firstId = result.current.todos[0].id;

    act(() => {
      result.current.toggleTodo(firstId);
    });

    expect(result.current.activeCount).toBe(2);
  });

  // AC-005-4: 删除未完成事项后计数更新
  it('should decrease activeCount when an active todo is deleted', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('A');
      result.current.addTodo('B');
    });

    const firstId = result.current.todos[0].id;

    act(() => {
      result.current.deleteTodo(firstId);
    });

    expect(result.current.activeCount).toBe(1);
  });

  // AC-005-5: 删除已完成事项不影响计数
  it('should not change activeCount when a completed todo is deleted', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('A');
      result.current.addTodo('B');
    });

    const firstId = result.current.todos[0].id;

    act(() => {
      result.current.toggleTodo(firstId); // complete it
    });

    expect(result.current.activeCount).toBe(1);

    act(() => {
      result.current.deleteTodo(firstId); // delete completed
    });

    expect(result.current.activeCount).toBe(1);
  });

  // --- 边界用例 ---

  // 添加多个 todo 后批量操作
  it('should handle adding multiple todos in sequence', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('任务一');
      result.current.addTodo('任务二');
      result.current.addTodo('任务三');
      result.current.addTodo('任务四');
      result.current.addTodo('任务五');
    });

    expect(result.current.todos).toHaveLength(5);
    expect(result.current.activeCount).toBe(5);
    expect(result.current.todos.map(t => t.text)).toEqual([
      '任务一', '任务二', '任务三', '任务四', '任务五',
    ]);
  });

  // 批量标记完成后筛选验证
  it('should correctly filter after toggling multiple todos', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('A');
      result.current.addTodo('B');
      result.current.addTodo('C');
      result.current.addTodo('D');
    });

    // Toggle A and C as completed
    act(() => {
      result.current.toggleTodo(result.current.todos[0].id);
      result.current.toggleTodo(result.current.todos[2].id);
    });

    act(() => {
      result.current.setFilter('active');
    });

    expect(result.current.filteredTodos).toHaveLength(2);
    expect(result.current.filteredTodos.map(t => t.text)).toEqual(['B', 'D']);

    act(() => {
      result.current.setFilter('completed');
    });

    expect(result.current.filteredTodos).toHaveLength(2);
    expect(result.current.filteredTodos.map(t => t.text)).toEqual(['A', 'C']);
  });

  // ID 不存在时 toggleTodo 不影响列表
  it('should not change todos when toggling a non-existent id', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('存在的任务');
    });

    const todosBeforeToggle = result.current.todos.map(t => ({ ...t }));

    act(() => {
      result.current.toggleTodo('non-existent-id');
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe(todosBeforeToggle[0].text);
    expect(result.current.todos[0].completed).toBe(todosBeforeToggle[0].completed);
  });

  // ID 不存在时 deleteTodo 不影响列表
  it('should not change todos when deleting a non-existent id', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('存在的任务');
    });

    act(() => {
      result.current.deleteTodo('non-existent-id');
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe('存在的任务');
  });

  // Tab 字符的处理（trim 只处理前后空白）
  it('should not add a todo with only tab characters', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('\t\t');
    });

    expect(result.current.todos).toHaveLength(0);
  });

  // 换行符的处理
  it('should not add a todo with only newline characters', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('\n\n');
    });

    expect(result.current.todos).toHaveLength(0);
  });

  // 特殊字符可以作为有效内容
  it('should add todos with special characters', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('<script>alert("xss")</script>');
      result.current.addTodo('& < > " \' `');
      result.current.addTodo('emoji: ');
    });

    expect(result.current.todos).toHaveLength(3);
    expect(result.current.todos[0].text).toBe('<script>alert("xss")</script>');
    expect(result.current.todos[1].text).toBe('& < > " \' `');
  });

  // 超长文本
  it('should handle very long todo text', () => {
    const { result } = renderHook(() => useTodos());
    const longText = 'A'.repeat(10000);

    act(() => {
      result.current.addTodo(longText);
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe(longText);
    expect(result.current.todos[0].text.length).toBe(10000);
  });

  // 每个 todo 有唯一 id
  it('should generate unique ids for each todo', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('任务一');
      result.current.addTodo('任务二');
      result.current.addTodo('任务三');
    });

    const ids = result.current.todos.map(t => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(3);
  });

  // 新 todo 默认 completed 为 false 且有 createdAt
  it('should set completed to false and createdAt for new todos', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('新任务');
    });

    expect(result.current.todos[0].completed).toBe(false);
    expect(typeof result.current.todos[0].createdAt).toBe('number');
    expect(result.current.todos[0].createdAt).toBeGreaterThan(0);
  });

  // 删除所有 todo 后列表为空
  it('should result in empty list after deleting all todos', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('A');
      result.current.addTodo('B');
    });

    act(() => {
      result.current.deleteTodo(result.current.todos[0].id);
    });
    act(() => {
      result.current.deleteTodo(result.current.todos[0].id);
    });

    expect(result.current.todos).toHaveLength(0);
    expect(result.current.activeCount).toBe(0);
    expect(result.current.filteredTodos).toHaveLength(0);
  });

  // 筛选 "completed" 时空列表
  it('should return empty filteredTodos when filtering completed but none are completed', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('A');
      result.current.addTodo('B');
    });

    act(() => {
      result.current.setFilter('completed');
    });

    expect(result.current.filteredTodos).toHaveLength(0);
  });

  // 筛选 "active" 时空列表
  it('should return empty filteredTodos when filtering active but all are completed', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('A');
    });

    act(() => {
      result.current.toggleTodo(result.current.todos[0].id);
    });

    act(() => {
      result.current.setFilter('active');
    });

    expect(result.current.filteredTodos).toHaveLength(0);
    expect(result.current.activeCount).toBe(0);
  });
});
