# Todo List 应用 - 技术架构文档

## 1. 架构模式

**模式 C：纯前端**

本项目是一个纯前端 Todo List 应用，所有业务逻辑在浏览器端完成，数据持久化使用 localStorage，不依赖任何后端服务或数据库。无需 API 层、服务器或构建后端运行时。

## 2. 技术栈

| 类别 | 技术选型 | 版本 | 用途 |
|------|----------|------|------|
| UI 框架 | React | 18.x | 组件化 UI 构建 |
| 类型系统 | TypeScript | 5.x | 静态类型检查，strict 模式 |
| 构建工具 | Vite | 5.x | 开发服务器、HMR、生产构建 |
| 测试框架 | Vitest | 1.x | 单元测试、组件测试 |
| 测试工具 | React Testing Library | 14.x | 组件渲染与交互测试 |
| 测试 DOM | jsdom | - | Vitest 的浏览器 DOM 模拟 |
| CSS 框架 | Tailwind CSS | 4.x | Utility-first CSS，通过 @tailwindcss/vite 插件集成 |
| 包管理 | pnpm | 10.x | 依赖管理 |

## 3. 目录结构

```
todo-list-example/
├── docs/
│   ├── prd.md                    # 产品需求文档
│   └── architecture.md           # 技术架构文档（本文件）
├── public/
│   └── index.html                # HTML 入口（如使用 Vite 默认则为根 index.html）
├── src/
│   ├── main.tsx                  # 应用入口，ReactDOM.createRoot 挂载点
│   ├── App.tsx                   # 根组件，组合所有子组件
│   ├── index.css                 # Tailwind CSS 入口
│   ├── index.css                 # Tailwind CSS 入口（@import "tailwindcss"）
│   ├── components/
│   │   ├── TodoInput.tsx         # 输入框 + 添加按钮（Tailwind CSS）
│   │   ├── TodoItem.tsx          # 单条待办事项（Tailwind CSS）
│   │   ├── TodoList.tsx          # 待办事项列表容器（Tailwind CSS）
│   │   ├── TodoFilter.tsx        # 筛选按钮组（Tailwind CSS）
│   │   └── TodoCounter.tsx       # 剩余未完成数量显示（Tailwind CSS）
│   ├── hooks/
│   │   ├── useTodos.ts           # Todo CRUD 逻辑 + 状态管理
│   │   └── useLocalStorage.ts    # localStorage 读写封装
│   └── types/
│       └── todo.ts               # Todo 类型定义
├── tests/
│   ├── setup.ts                  # 测试环境配置（jsdom、cleanup 等）
│   ├── components/
│   │   ├── TodoInput.test.tsx    # TodoInput 组件测试
│   │   ├── TodoItem.test.tsx     # TodoItem 组件测试
│   │   ├── TodoList.test.tsx     # TodoList 组件测试
│   │   ├── TodoFilter.test.tsx   # TodoFilter 组件测试
│   │   └── TodoCounter.test.tsx  # TodoCounter 组件测试
│   ├── hooks/
│   │   ├── useTodos.test.ts      # useTodos hook 测试
│   │   └── useLocalStorage.test.ts # useLocalStorage hook 测试
│   └── App.test.tsx              # 集成测试（完整用户交互流程）
├── index.html                    # Vite HTML 入口
├── package.json                  # 项目配置
├── tsconfig.json                 # TypeScript 配置
├── vite.config.ts                # Vite 构建配置
└── vitest.config.ts              # Vitest 测试配置（可合并到 vite.config.ts）
```

## 4. 数据模型

### 4.1 Todo 类型定义

```typescript
// src/types/todo.ts

export interface Todo {
  id: string;          // 唯一标识，使用 crypto.randomUUID() 生成
  text: string;        // 待办事项内容（已 trim）
  completed: boolean;  // 是否已完成，默认 false
  createdAt: number;   // 创建时间戳，Date.now()
}

export type FilterStatus = 'all' | 'active' | 'completed';
```

### 4.2 localStorage 存储方案

- **Key**: `todos`
- **Value**: `JSON.stringify(Todo[])`
- 读取时使用 `JSON.parse` 并做容错处理（数据损坏时返回空数组）
- 每次 todos 状态变更后同步写入 localStorage

```typescript
// useLocalStorage hook 核心逻辑
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // 初始化时从 localStorage 读取，解析失败则使用 initialValue
  // setter 同时更新 React state 和 localStorage
}
```

## 5. 状态管理方案

采用 **React Hooks** 进行状态管理，不引入 Redux / Zustand 等外部状态库。应用状态简单、组件层级浅，hooks 足以胜任。

### 5.1 状态结构

```typescript
// 核心状态（由 useTodos hook 管理）
todos: Todo[]          // 全部待办事项列表，持久化到 localStorage
filter: FilterStatus   // 当前筛选状态，仅在内存中（刷新后重置为 'all'）
```

### 5.2 useTodos Hook 接口

```typescript
// src/hooks/useTodos.ts

interface UseTodosReturn {
  // 状态
  todos: Todo[];                    // 完整 todo 列表
  filteredTodos: Todo[];            // 根据 filter 筛选后的列表
  filter: FilterStatus;            // 当前筛选条件
  activeCount: number;              // 未完成事项数量

  // 操作
  addTodo: (text: string) => void;          // 添加（自动 trim，空字符串忽略）
  toggleTodo: (id: string) => void;         // 切换完成状态
  deleteTodo: (id: string) => void;         // 删除
  setFilter: (filter: FilterStatus) => void; // 设置筛选条件
}

function useTodos(): UseTodosReturn;
```

### 5.3 数据流

```
用户交互 → 组件事件处理 → useTodos 操作方法 → 更新 todos state
                                                     ↓
                                              useLocalStorage 同步写入
                                                     ↓
                                              React 重新渲染 → UI 更新
```

筛选逻辑和计数通过 `useMemo` 派生，避免不必要的重计算：

```typescript
const filteredTodos = useMemo(() => {
  switch (filter) {
    case 'active':    return todos.filter(t => !t.completed);
    case 'completed': return todos.filter(t => t.completed);
    default:          return todos;
  }
}, [todos, filter]);

const activeCount = useMemo(() => todos.filter(t => !t.completed).length, [todos]);
```

## 6. 组件设计

### 6.1 组件树

```
App
├── TodoInput           # 输入新待办事项
├── TodoList            # 待办列表容器
│   └── TodoItem × N   # 单条待办事项（循环渲染）
├── TodoCounter         # "X 项待完成" 计数
└── TodoFilter          # 筛选按钮组
```

### 6.2 组件职责与 Props

#### App（根组件）

- 调用 `useTodos()` hook 获取所有状态和操作方法
- 将状态和回调分发给各子组件
- 不包含业务逻辑

```typescript
function App(): JSX.Element;
```

#### TodoInput（输入组件）

- 管理输入框的本地 state（受控组件）
- Enter 键和按钮点击均触发提交
- 提交前 trim，空字符串不提交
- 提交后清空输入框

```typescript
interface TodoInputProps {
  onAdd: (text: string) => void;
}
```

#### TodoList（列表组件）

- 渲染 `filteredTodos` 数组
- 列表为空时显示提示信息（如"没有匹配的待办事项"）

```typescript
interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}
```

#### TodoItem（单条事项组件）

- 显示复选框、文本、删除按钮
- 已完成事项文本添加删除线样式
- 复选框点击触发 `onToggle`
- 删除按钮点击触发 `onDelete`

```typescript
interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}
```

#### TodoFilter（筛选组件）

- 渲染三个筛选按钮：全部 / 未完成 / 已完成
- 当前激活的筛选按钮有视觉高亮
- 点击按钮触发 `onFilterChange`

```typescript
interface TodoFilterProps {
  current: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
}
```

#### TodoCounter（计数组件）

- 显示 `"{n} 项待完成"` 文本
- 纯展示组件，无交互

```typescript
interface TodoCounterProps {
  count: number;
}
```

## 7. 可访问性（Accessibility）

- 输入框：关联 `<label>` 或使用 `aria-label="添加待办事项"`
- 添加按钮：`aria-label="添加"`
- 复选框：`aria-label="标记 {text} 为完成/未完成"`
- 删除按钮：`aria-label="删除 {text}"`
- 筛选按钮：使用 `aria-pressed` 标识当前选中状态
- 所有交互元素支持键盘 Tab 导航和 Enter/Space 激活

## 8. 构建与测试配置

### 8.1 TypeScript 配置要点

```json
{
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true
  }
}
```

### 8.2 Vitest 配置要点

```typescript
// vitest.config.ts（或合并在 vite.config.ts 中）
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    css: true,
  },
});
```

### 8.3 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm install` | 安装依赖 |
| `pnpm run dev` | 启动开发服务器 |
| `pnpm run build` | 生产构建 |
| `pnpm run preview` | 预览生产构建 |
| `pnpm exec vitest` | 运行测试（watch 模式） |
| `pnpm exec vitest run` | 运行测试（单次） |
| `pnpm exec vitest run --coverage` | 运行测试 + 覆盖率 |

## Changelog

| 版本 | 日期 | 变更说明 | 变更人 |
|------|------|----------|--------|
| v1.1 | 2026-03-19 | 样式方案从 CSS Modules 迁移至 Tailwind CSS v4，更新技术栈和目录结构 | tech-architect |
| v1.0 | 2026-03-19 | 初始版本：架构模式选型（C 纯前端）、技术栈、目录结构、数据模型、状态管理、组件设计 | tech-architect |
