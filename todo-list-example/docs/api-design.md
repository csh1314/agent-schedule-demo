# Todo List 应用 - 数据层接口设计

## 1. 概述

本项目采用**架构模式 C（纯前端）**，所有业务逻辑和数据操作在浏览器端完成，**不存在后端 API 服务**。数据持久化通过浏览器 localStorage 实现，数据层以 React Custom Hooks 形式对外暴露接口。

本文档定义数据层的两个核心 Hook——`useLocalStorage` 和 `useTodos` 的接口契约，以及 localStorage 存储方案和错误处理策略。

## 2. localStorage 存储方案

### 2.1 Key 规范

| Key | 数据类型 | 说明 |
|-----|----------|------|
| `todos` | `Todo[]`（JSON 序列化） | 全部待办事项列表 |

- 仅使用单一 key `todos` 存储完整待办列表
- 筛选状态 `filter` 不持久化，仅存在于内存中，页面刷新后重置为 `'all'`

### 2.2 数据结构

```typescript
// src/types/todo.ts

export interface Todo {
  id: string;          // 唯一标识，crypto.randomUUID() 生成
  text: string;        // 待办事项内容（已 trim，非空）
  completed: boolean;  // 是否已完成，新建默认 false
  createdAt: number;   // 创建时间戳，Date.now()
}

export type FilterStatus = 'all' | 'active' | 'completed';
```

localStorage 中存储格式示例：

```json
[
  {
    "id": "a1b2c3d4-...",
    "text": "买牛奶",
    "completed": false,
    "createdAt": 1742380800000
  }
]
```

### 2.3 读写策略

| 操作 | 时机 | 方法 |
|------|------|------|
| **读取** | Hook 初始化（组件首次挂载） | `JSON.parse(localStorage.getItem('todos'))` |
| **写入** | 每次 todos 状态变更后同步写入 | `localStorage.setItem('todos', JSON.stringify(todos))` |

- 采用**同步写入**策略：每次调用 setter 时，同时更新 React state 和 localStorage
- 不使用延迟/批量写入，保证数据一致性
- 初始化时若 localStorage 中无数据或数据不合法，回退到 `initialValue`（空数组 `[]`）

## 3. useLocalStorage Hook 接口契约

### 3.1 签名

```typescript
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void];
```

### 3.2 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `key` | `string` | localStorage 的 key 名称 |
| `initialValue` | `T` | 当 localStorage 中无数据或数据损坏时的回退值 |

### 3.3 返回值

返回一个元组 `[storedValue, setValue]`，语义对齐 `React.useState`：

| 索引 | 类型 | 说明 |
|------|------|------|
| `[0]` | `T` | 当前存储值 |
| `[1]` | `(value: T \| ((prev: T) => T)) => void` | 更新函数，同时写入 React state 和 localStorage |

### 3.4 行为规范

根据测试用例，`useLocalStorage` 必须满足以下契约：

| 场景 | 预期行为 | 关联测试 |
|------|----------|----------|
| localStorage 为空 | 返回 `initialValue` | `should return initial value when localStorage is empty` |
| localStorage 有合法数据 | 解析并返回存储值 | `should return stored value from localStorage` |
| 调用 setter（直接赋值） | 同时更新 state 和 localStorage | `should update both state and localStorage when setter is called` |
| 调用 setter（函数式更新） | 基于前一个值计算新值并更新 | `should support functional updates` |
| 数据更新后 | localStorage 中数据同步更新 | `should persist updated data after removal` |
| localStorage 数据损坏（非法 JSON） | 捕获异常，返回 `initialValue` | `should return initial value when localStorage contains invalid JSON` |

### 3.5 实现要点

- 初始化读取使用惰性初始化（`useState(() => { ... })`），避免每次渲染都读取 localStorage
- setter 必须同时调用 `setState` 和 `localStorage.setItem`
- `JSON.parse` 需要 try-catch 包裹，解析失败时静默回退到 `initialValue`

## 4. useTodos Hook 接口契约

### 4.1 签名

```typescript
function useTodos(): UseTodosReturn;
```

### 4.2 返回值类型

```typescript
interface UseTodosReturn {
  // 状态
  todos: Todo[];               // 完整 todo 列表（未筛选）
  filteredTodos: Todo[];       // 根据当前 filter 筛选后的列表
  filter: FilterStatus;        // 当前筛选条件，默认 'all'
  activeCount: number;          // 未完成事项数量

  // 操作
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  setFilter: (filter: FilterStatus) => void;
}
```

### 4.3 操作方法契约

#### addTodo(text: string)

| 场景 | 预期行为 | 关联验收标准 |
|------|----------|-------------|
| 输入有效文本 `"买牛奶"` | 在列表末尾添加新 Todo，`completed: false`，自动生成 `id` 和 `createdAt` | AC-001-1 |
| 输入空字符串 `""` | 不添加，列表保持不变 | AC-001-3 |
| 输入仅空格 `"   "` | 不添加，列表保持不变 | AC-001-3 |
| 输入含前后空格 `"  读书  "` | 自动 trim 后添加，`text` 为 `"读书"` | AC-001-4 |

#### toggleTodo(id: string)

| 场景 | 预期行为 | 关联验收标准 |
|------|----------|-------------|
| 对未完成事项调用 | `completed` 变为 `true` | AC-002-1 |
| 对已完成事项调用 | `completed` 变为 `false` | AC-002-2 |

#### deleteTodo(id: string)

| 场景 | 预期行为 | 关联验收标准 |
|------|----------|-------------|
| 删除指定 id 的事项 | 该事项从列表中移除，其余事项顺序不变 | AC-003-1, AC-003-2 |

#### setFilter(filter: FilterStatus)

| 场景 | 预期行为 | 关联验收标准 |
|------|----------|-------------|
| 设为 `'all'` | `filteredTodos` 返回全部事项 | AC-004-1, AC-004-4 |
| 设为 `'active'` | `filteredTodos` 仅返回 `completed === false` 的事项 | AC-004-2 |
| 设为 `'completed'` | `filteredTodos` 仅返回 `completed === true` 的事项 | AC-004-3 |

### 4.4 派生状态规范

#### filteredTodos

基于 `todos` 和 `filter` 使用 `useMemo` 计算：

```typescript
const filteredTodos = useMemo(() => {
  switch (filter) {
    case 'active':    return todos.filter(t => !t.completed);
    case 'completed': return todos.filter(t => t.completed);
    default:          return todos;
  }
}, [todos, filter]);
```

#### activeCount

基于 `todos` 使用 `useMemo` 计算未完成事项数量：

```typescript
const activeCount = useMemo(
  () => todos.filter(t => !t.completed).length,
  [todos]
);
```

| 场景 | 预期行为 | 关联验收标准 |
|------|----------|-------------|
| 无 todo | 返回 `0` | AC-005-1 |
| 添加新 todo | 计数 +1 | AC-005-2 |
| 标记为完成 | 计数 -1 | AC-005-3 |
| 删除未完成事项 | 计数 -1 | AC-005-4 |
| 删除已完成事项 | 计数不变 | AC-005-5 |

## 5. 数据流图

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户界面（React 组件）                     │
│                                                                 │
│  TodoInput ──addTodo──┐                                         │
│  TodoItem ──toggleTodo─┤                                        │
│  TodoItem ──deleteTodo─┤                                        │
│  TodoFilter ──setFilter┤                                        │
│                        ▼                                        │
│              ┌─────────────────┐                                │
│              │   useTodos Hook  │                                │
│              │                 │                                 │
│              │  todos          │◄─── 状态                        │
│              │  filter         │◄─── 状态（内存，不持久化）        │
│              │  filteredTodos  │◄─── useMemo 派生                 │
│              │  activeCount    │◄─── useMemo 派生                 │
│              └────────┬────────┘                                │
│                       │                                         │
│                       ▼                                         │
│            ┌──────────────────────┐                              │
│            │  useLocalStorage Hook │                              │
│            │                      │                              │
│            │  [value, setValue]   │                               │
│            └──────────┬───────────┘                              │
│                       │                                         │
└───────────────────────┼─────────────────────────────────────────┘
                        │ JSON.stringify / JSON.parse
                        ▼
              ┌──────────────────┐
              │   localStorage    │
              │                  │
              │  key: "todos"    │
              │  val: Todo[] JSON│
              └──────────────────┘
```

**数据流方向**：

1. **写入路径**：用户操作 -> 组件事件 -> `useTodos` 操作方法 -> 更新 `todos` state -> `useLocalStorage` setter -> 同步写入 localStorage -> React 重新渲染 -> UI 更新
2. **读取路径**：页面加载 -> `useLocalStorage` 初始化 -> 从 localStorage 读取 JSON -> `JSON.parse` -> `useTodos` 获得初始 `todos` -> 渲染 UI
3. **派生路径**：`todos` 或 `filter` 变更 -> `useMemo` 重新计算 `filteredTodos` 和 `activeCount` -> UI 更新

## 6. 错误处理和容错机制

### 6.1 localStorage 数据损坏

| 场景 | 处理方式 |
|------|----------|
| `JSON.parse` 抛出异常（非法 JSON） | 捕获异常，使用 `initialValue`（空数组）作为初始状态 |
| `localStorage.getItem` 返回 `null` | 使用 `initialValue` 作为初始状态 |
| localStorage 被用户清空 | 下次写入时自动重建 key |

### 6.2 浏览器兼容性

| 场景 | 处理方式 |
|------|----------|
| localStorage 不可用（隐私模式等） | `useLocalStorage` 的 try-catch 保证应用不崩溃，数据在内存中仍可正常工作，但不持久化 |
| localStorage 配额超限 | `setItem` 可能抛出 `QuotaExceededError`，建议在 setter 中 try-catch 包裹，保证 React state 更新不受影响 |

### 6.3 数据完整性

- Todo 的 `id` 使用 `crypto.randomUUID()` 生成，碰撞概率极低
- `text` 字段在 `addTodo` 中已 trim 且校验非空，数据源头保证合法
- `completed` 字段仅通过 `toggleTodo` 翻转，类型安全由 TypeScript 保证
- `createdAt` 在创建时使用 `Date.now()` 自动生成，不可被用户修改

### 6.4 边界情况

| 场景 | 预期行为 |
|------|----------|
| 对不存在的 id 调用 `toggleTodo` / `deleteTodo` | 列表不变，无副作用 |
| 快速连续操作 | React 状态更新机制保证最终一致性，函数式 setter 确保基于最新状态更新 |
| 大量数据（100+ 条） | localStorage 单 key 存储 JSON 字符串，100 条数据远低于 5MB 配额限制，无性能问题 |

## Changelog

| 版本 | 日期 | 变更说明 | 变更人 |
|------|------|----------|--------|
| v1.0 | 2026-03-19 | 初始版本：数据层接口设计，包括 localStorage 方案、useLocalStorage/useTodos 接口契约、数据流图、错误处理 | backend-architect |
