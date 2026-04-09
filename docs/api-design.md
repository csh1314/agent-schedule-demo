# API 设计文档 — Todo List 动画增强

## 1. API 概览

**架构模式 C（纯前端应用）** — 无后端服务，无 REST/GraphQL API。

所有数据操作在浏览器端完成，通过 React 自定义 Hooks 暴露数据操作接口，localStorage 提供持久化能力。动画增强不改变任何数据操作接口，动画状态完全由 framer-motion 运行时管理，不进入数据层。

### 接口层次

```
用户操作
  ↓
React 组件层（调用 Hook 方法）
  ↓
useTodos Hook（业务逻辑 + 状态管理）
  ↓
useLocalStorage Hook（持久化适配器）
  ↓
window.localStorage（浏览器存储）
```

## 2. 数据模型

### 2.1 Todo 实体

```typescript
// src/types/todo.ts
interface Todo {
  id: string;          // 唯一标识，crypto.randomUUID() 生成（UUID v4）
  text: string;        // 待办事项内容（已 trim，非空）
  completed: boolean;  // 是否已完成，默认 false
  createdAt: number;   // 创建时间戳，Date.now() 毫秒级
}
```

### 2.2 筛选类型

```typescript
// src/types/todo.ts
type FilterStatus = 'all' | 'active' | 'completed';
```

### 2.3 动画增强对数据模型的影响

**结论：不需要新增任何字段。**

| 动画功能 | 是否需要新字段 | 说明 |
|----------|----------------|------|
| F1 页面入场 | 否 | 由 framer-motion `initial`/`animate` 控制，纯 UI 瞬态 |
| F2 添加动画 | 否 | `AnimatePresence` 根据列表 diff 自动触发入场动画 |
| F3 删除动画 | 否 | `AnimatePresence` 的 `exit` prop 处理退场，无需标记删除态 |
| F4 完成状态切换 | 否 | 复用现有 `completed` 字段驱动动画方向 |
| F5 列表重排 | 否 | `layout` prop 自动检测位置变化 |
| F6 庆祝特效 | 否 | 由 `toggleTodo` 的 completed 变化触发，组件内部管理粒子生命周期 |
| F7-F13 微交互 | 否 | 均为纯 UI 层效果，不涉及数据状态 |

## 3. 数据操作接口

### 3.1 useTodos Hook

主要业务接口，组件通过该 Hook 获取数据和操作方法。

```typescript
// src/hooks/useTodos.ts
interface UseTodosReturn {
  todos: Todo[];              // 全量 Todo 列表（按创建顺序）
  filteredTodos: Todo[];      // 当前筛选条件下的 Todo 列表
  filter: FilterStatus;       // 当前筛选状态
  activeCount: number;        // 未完成 Todo 计数
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  setFilter: (filter: FilterStatus) => void;
}

function useTodos(): UseTodosReturn;
```

#### 方法详情

**addTodo(text: string): void**

| 属性 | 说明 |
|------|------|
| 入参 | `text: string` — 待办事项文本 |
| 前置校验 | 自动 trim，空字符串静默跳过 |
| 行为 | 创建新 Todo（id: UUID, completed: false, createdAt: 当前时间戳），追加到列表末尾 |
| 副作用 | 触发 localStorage 同步写入 |
| 动画联动 | 新项出现在 `filteredTodos` 中时，`AnimatePresence` 自动触发入场动画（F2） |

**toggleTodo(id: string): void**

| 属性 | 说明 |
|------|------|
| 入参 | `id: string` — 目标 Todo 的 UUID |
| 行为 | 翻转目标 Todo 的 `completed` 状态 |
| 副作用 | 触发 localStorage 同步写入 |
| 动画联动 | completed 变为 true 时触发完成状态切换动画（F4）和庆祝特效（F6）；筛选模式下可能触发列表重排（F5） |

**deleteTodo(id: string): void**

| 属性 | 说明 |
|------|------|
| 入参 | `id: string` — 目标 Todo 的 UUID |
| 行为 | 从列表中移除目标 Todo |
| 副作用 | 触发 localStorage 同步写入 |
| 动画联动 | `AnimatePresence` 检测到项消失，自动触发退场动画（F3），完成后 DOM 节点移除，剩余项 layout 动画填补空间（F5） |

**setFilter(filter: FilterStatus): void**

| 属性 | 说明 |
|------|------|
| 入参 | `filter: FilterStatus` — 'all' / 'active' / 'completed' |
| 行为 | 更新筛选状态，`filteredTodos` 重新计算（useMemo） |
| 副作用 | 无持久化（筛选状态为会话级） |
| 动画联动 | 被隐藏的项触发退场动画，保留的项触发 layout 重排动画（F5），滑动指示条移动到新位置（F9） |

### 3.2 useLocalStorage Hook

持久化适配器，为 `useTodos` 提供底层存储能力。

```typescript
// src/hooks/useLocalStorage.ts
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void];
```

| 属性 | 说明 |
|------|------|
| 读取策略 | 组件挂载时从 localStorage 读取并 JSON.parse，失败时回退到 initialValue |
| 写入策略 | 每次 setValue 调用时同步 JSON.stringify 写入 localStorage |
| 支持函数式更新 | `setValue(prev => [...prev, newItem])` — 与 React useState 一致的 API |
| 错误处理 | 读取失败（JSON 解析错误、key 不存在）静默回退到 initialValue |

### 3.3 派生状态

以下为 `useTodos` 内部通过 `useMemo` 计算的派生状态，不直接暴露修改方法：

| 状态 | 计算逻辑 | 依赖 |
|------|----------|------|
| `filteredTodos` | 根据 `filter` 值过滤 `todos` 数组 | `[todos, filter]` |
| `activeCount` | `todos.filter(t => !t.completed).length` | `[todos]` |

## 4. 存储方案

### 4.1 localStorage 持久化策略

| 配置项 | 值 |
|--------|-----|
| 存储 Key | `"todos"` |
| 数据格式 | `JSON.stringify(Todo[])` |
| 写入时机 | 每次 CRUD 操作后同步写入 |
| 读取时机 | 组件首次挂载时（useState 初始化函数中） |
| 容量限制 | 受浏览器 localStorage 上限约束（通常 5-10MB），Todo 列表场景远低于此限制 |

### 4.2 数据流示意

```
[用户操作] → addTodo/toggleTodo/deleteTodo
                    ↓
            setTodos(prev => newTodos)
                    ↓
         ┌──────────┴──────────┐
         ↓                     ↓
  React state 更新       localStorage.setItem
  → 组件 re-render       → 数据持久化
  → filteredTodos 重算
  → 动画层响应变化
```

### 4.3 筛选状态存储

筛选状态（`filter`）使用 React `useState` 管理，**不持久化**到 localStorage。刷新页面后筛选重置为 `'all'`。这是有意设计：筛选是临时视图状态，不属于用户数据。

## 5. 动画相关说明

### 5.1 核心原则

**动画状态不持久化。** 所有动画效果均为运行时瞬态，由 framer-motion 和 CSS animation 在组件生命周期内自行管理。localStorage 中仅存储业务数据（`Todo[]`），不存储任何动画相关状态。

### 5.2 动画状态管理方式

| 动画类型 | 状态管理者 | 持久化 | 说明 |
|----------|-----------|--------|------|
| 入场/退场动画 | framer-motion `AnimatePresence` | 否 | 根据 React 虚拟 DOM diff 自动触发 |
| Layout 重排 | framer-motion `layout` prop | 否 | 自动检测元素位置变化 |
| 手势动画 | framer-motion `whileHover`/`whileTap` | 否 | 用户交互时实时响应 |
| 庆祝粒子 | `useCelebration` hook（组件内部状态） | 否 | 触发后自动播放并清理 |
| 数字滚动 | `useNumberRoll` hook（前值/后值对比） | 否 | 仅在 `activeCount` 变化时触发 |
| 滑动指示条 | `useSlidingIndicator` hook（DOM 测量） | 否 | 根据激活按钮的 DOM 位置计算 |
| CSS 循环动画 | CSS `@keyframes` + Tailwind 工具类 | 否 | 纯 CSS，不涉及 JS 状态 |

### 5.3 数据层与动画层的边界

```
┌─────────────────────────────┐
│  数据层（持久化 + 业务逻辑）   │  ← localStorage + useTodos
│  Todo[], FilterStatus        │
│  addTodo, toggleTodo, etc.   │
├─────────────────────────────┤  ← 清晰边界：数据变更触发 re-render
│  动画层（纯 UI 装饰）         │  ← framer-motion + CSS animation
│  入场/退场/重排/手势/粒子      │
│  不持久化，不修改数据模型       │
└─────────────────────────────┘
```

动画层通过 React 的响应式机制（props/state 变化触发 re-render）感知数据变化，而非直接订阅数据层。这保证了：

1. **零耦合**：移除全部动画代码后，应用功能完全不受影响
2. **零迁移成本**：数据模型无新增字段，localStorage 数据格式不变，升级前后数据完全兼容
3. **可测试性**：业务逻辑测试无需 mock 动画库，动画测试无需真实数据

## Changelog

| 版本 | 日期 | 变更说明 | 变更人 |
|------|------|----------|--------|
| v1.0 | 2026-04-09 | 初始版本：纯前端数据操作接口设计，确认动画不影响数据模型和存储方案 | backend-architect |
