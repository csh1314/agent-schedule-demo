import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLocalStorage } from '../../src/hooks/useLocalStorage';

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

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  // AC-006-1: 添加后持久化 — 初始值写入 localStorage
  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', []));

    expect(result.current[0]).toEqual([]);
  });

  // AC-006-1: 从 localStorage 读取已有数据
  it('should return stored value from localStorage', () => {
    localStorageMock.setItem('test-key', JSON.stringify([1, 2, 3]));

    const { result } = renderHook(() => useLocalStorage('test-key', []));

    expect(result.current[0]).toEqual([1, 2, 3]);
  });

  // AC-006-2: 状态变更后持久化 — setter 同时更新 state 和 localStorage
  it('should update both state and localStorage when setter is called', () => {
    const { result } = renderHook(() => useLocalStorage<string[]>('test-key', []));

    act(() => {
      result.current[1](['hello']);
    });

    expect(result.current[0]).toEqual(['hello']);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(['hello']));
  });

  // setter 支持函数形式更新
  it('should support functional updates', () => {
    const { result } = renderHook(() => useLocalStorage<number[]>('test-key', [1]));

    act(() => {
      result.current[1]((prev) => [...prev, 2]);
    });

    expect(result.current[0]).toEqual([1, 2]);
  });

  // AC-006-3: 删除后持久化 — 数据被正确更新
  it('should persist updated data after removal', () => {
    const { result } = renderHook(() => useLocalStorage<string[]>('test-key', ['a', 'b', 'c']));

    act(() => {
      result.current[1]((prev) => prev.filter(item => item !== 'b'));
    });

    expect(result.current[0]).toEqual(['a', 'c']);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(['a', 'c']));
  });

  // 数据损坏时容错处理 — 返回 initialValue
  it('should return initial value when localStorage contains invalid JSON', () => {
    localStorageMock.getItem.mockReturnValueOnce('invalid-json{{{');

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    expect(result.current[0]).toBe('default');
  });

  // --- 边界用例 ---

  // localStorage.getItem 抛出异常时容错
  it('should return initial value when localStorage.getItem throws', () => {
    localStorageMock.getItem.mockImplementationOnce(() => {
      throw new Error('localStorage is not available');
    });

    const { result } = renderHook(() => useLocalStorage('test-key', 42));

    expect(result.current[0]).toBe(42);
  });

  // 存储复杂嵌套对象
  it('should handle complex nested objects', () => {
    const complexData = {
      users: [{ name: 'Alice', tags: ['admin', 'user'] }],
      meta: { version: 1, nested: { deep: true } },
    };

    const { result } = renderHook(() => useLocalStorage('test-key', complexData));

    act(() => {
      result.current[1]({
        ...complexData,
        users: [...complexData.users, { name: 'Bob', tags: ['user'] }],
      });
    });

    expect(result.current[0].users).toHaveLength(2);
    expect(result.current[0].users[1].name).toBe('Bob');
  });

  // 存储大量数据
  it('should handle large data arrays', () => {
    const largeArray = Array.from({ length: 1000 }, (_, i) => ({
      id: `item-${i}`,
      value: `value-${i}`,
    }));

    const { result } = renderHook(() => useLocalStorage('test-key', largeArray));

    expect(result.current[0]).toHaveLength(1000);
    expect(result.current[0][999].id).toBe('item-999');
  });

  // 存储空字符串（区别于 null/undefined）
  it('should correctly store and retrieve empty string as value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'non-empty'));

    act(() => {
      result.current[1]('');
    });

    expect(result.current[0]).toBe('');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(''));
  });

  // 存储 null 值
  it('should handle null as a stored value', () => {
    localStorageMock.setItem('test-key', JSON.stringify(null));

    const { result } = renderHook(() => useLocalStorage<string | null>('test-key', 'fallback'));

    expect(result.current[0]).toBeNull();
  });

  // 多次连续更新
  it('should handle rapid successive updates', () => {
    const { result } = renderHook(() => useLocalStorage<number>('test-key', 0));

    act(() => {
      result.current[1](1);
    });
    act(() => {
      result.current[1](2);
    });
    act(() => {
      result.current[1](3);
    });

    expect(result.current[0]).toBe(3);
    expect(localStorageMock.setItem).toHaveBeenLastCalledWith('test-key', JSON.stringify(3));
  });

  // 函数式更新基于最新值
  it('should chain functional updates correctly', () => {
    const { result } = renderHook(() => useLocalStorage<number>('test-key', 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });
    act(() => {
      result.current[1]((prev) => prev + 10);
    });

    expect(result.current[0]).toBe(11);
  });

  // 存储特殊字符
  it('should handle special characters in stored values', () => {
    const specialStr = '特殊字符 <script>alert("xss")</script> & "quotes" \'single\'';
    const { result } = renderHook(() => useLocalStorage('test-key', ''));

    act(() => {
      result.current[1](specialStr);
    });

    expect(result.current[0]).toBe(specialStr);
  });
});
