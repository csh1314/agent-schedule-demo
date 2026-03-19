# 代码审查报告

## 审查范围

审查覆盖 `src/` 下全部源文件，包括：

- `src/types/todo.ts`
- `src/hooks/useLocalStorage.ts`
- `src/hooks/useTodos.ts`
- `src/App.tsx`
- `src/main.tsx`
- `src/index.css`
- `src/components/index.ts`
- `src/components/types.ts`
- `src/components/TodoApp.tsx`
- `src/components/TodoInput.tsx`
- `src/components/TodoItem.tsx`
- `src/components/TodoList.tsx`
- `src/components/TodoFilter.tsx`
- `src/components/TodoCounter.tsx`

架构模式：**模式 C（纯前端）**，技术栈：React 18 + TypeScript + Vite + Tailwind CSS v4

---

## 审查结果

### 1. 安全漏洞

#### [Major] S-01: localStorage JSON.parse 缺乏 schema 校验

- **文件**: `src/hooks/useLocalStorage.ts`，第 7 行
- **描述**: `JSON.parse(item)` 后直接作为 `T` 类型返回，没有对反序列化数据做结构校验。如果 localStorage 中被注入畸形数据（如手动篡改、XSS 注入），应用会以错误的数据结构运行，可能导致运行时崩溃或不可预期的行为。
- **风险**: 攻击者可以通过 DevTools 或其他方式向 localStorage 写入恶意结构，导致应用渲染异常。
- **修复建议**:

```typescript
// 添加可选的 validator 参数
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  validator?: (value: unknown) => value is T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return initialValue;
      const parsed = JSON.parse(item);
      if (validator && !validator(parsed)) return initialValue;
      return parsed;
    } catch {
      return initialValue;
    }
  });
  // ...rest
}
```

#### [Minor] S-02: 用户输入文本通过 React JSX 渲染，无 XSS 风险

- **文件**: `src/components/TodoItem.tsx`，第 24 行
- **描述**: `{todo.text}` 作为 JSX 文本子节点渲染，React 默认进行转义处理。**无安全问题**，此处确认合格。

#### [Minor] S-03: `document.getElementById('root')!` 使用非空断言

- **文件**: `src/main.tsx`，第 6 行
- **描述**: 非空断言 `!` 假定 `#root` 元素始终存在。若 `index.html` 配置错误，将抛出运行时异常。风险较低（入口文件配套使用），标记为 Minor。

---

### 2. 编码规范

#### [Major] R-01: 重复类型定义 — `Todo` 和 `FilterStatus`/`FilterType` 存在两套

- **文件**: `src/types/todo.ts` 和 `src/components/types.ts`
- **描述**: 项目中存在两套完全相同的 `Todo` 接口定义。`src/types/todo.ts` 定义了 `FilterStatus` 类型，而 `src/components/types.ts` 定义了语义相同但名称不同的 `FilterType`。`App.tsx` 和 `hooks/` 使用 `src/types/todo.ts` 的类型，而 `components/` 使用 `src/components/types.ts` 的类型。这导致类型定义分散、命名不一致，增加维护成本和出错风险。
- **修复建议**: 删除 `src/components/types.ts`，统一使用 `src/types/todo.ts`，在 `components/` 中将所有 `FilterType` 改为 `FilterStatus`。

#### [Major] R-02: 死代码 — `TodoApp.tsx` 是弃用的原型组件

- **文件**: `src/components/TodoApp.tsx`
- **描述**: 该文件包含硬编码的 mock 数据（第 9-13 行）、无 localStorage 持久化、无 `useMemo` 优化，且注释明确标注 "后续由 frontend-expert 替换为真实逻辑"（第 8 行、第 19 行）。实际入口 `App.tsx` 已经使用 `useTodos` hook 实现了完整逻辑。该文件应被移除。
- **影响**: `components/index.ts` 仍然导出了 `TodoApp`（第 1 行），增加了 bundle 大小和开发者困惑。

#### [Major] R-03: `components/index.ts` barrel 文件导出 `TodoApp` 和 `FilterType` 但从未使用

- **文件**: `src/components/index.ts`，第 1 行、第 7 行
- **描述**: `TodoApp` 和 `FilterType` 通过 barrel 导出，但 `App.tsx` 直接 import 各组件文件，并未使用 barrel。barrel 文件本身也未被任何消费者引用，存在两个问题：(1) 导出了废弃组件；(2) barrel 文件本身未被使用。
- **修复建议**: 如保留 barrel，移除 `TodoApp` 导出并将 `FilterType` 改为 `FilterStatus`。如不需要 barrel，可直接删除 `index.ts`。

#### [Minor] R-04: `React` 默认导入在 React 17+ JSX Transform 下不再必需

- **文件**: `src/App.tsx`（第 1 行）、`src/main.tsx`（第 1 行）、`src/components/TodoApp.tsx`（第 1 行）、`src/components/TodoInput.tsx`（第 1 行）、`src/components/TodoItem.tsx`（第 1 行）、`src/components/TodoList.tsx`（第 1 行）、`src/components/TodoFilter.tsx`（第 1 行）、`src/components/TodoCounter.tsx`（第 1 行）
- **描述**: 项目使用 Vite + `@vitejs/plugin-react`，自动启用新 JSX Transform。大部分文件不需要 `import React from 'react'`，仅 `main.tsx` 中的 `React.StrictMode` 需要。其余文件可移除此导入以减少冗余。但这不影响功能，属于风格建议。

#### [Minor] R-05: `TodoCounter` 的 prop 命名为 `activeCount` 而非 `count`

- **文件**: `src/components/TodoCounter.tsx`，第 5 行
- **描述**: 架构文档定义的接口为 `TodoCounterProps { count: number }`，但实际实现使用 `activeCount`。命名语义更明确，但与架构文档不一致。建议更新架构文档或统一命名。

---

### 3. 性能风险

#### [Minor] P-01: `TodoApp.tsx` 中筛选和计数未使用 `useMemo`

- **文件**: `src/components/TodoApp.tsx`，第 46-52 行
- **描述**: `filteredTodos` 和 `activeCount` 每次渲染都会重新计算。但此文件为已弃用的原型组件（见 R-02），若移除该文件则此问题自动消除。正式入口 `App.tsx` 通过 `useTodos` hook 已正确使用 `useMemo`。

#### [Minor] P-02: `TodoApp.tsx` 中事件处理函数未使用 `useCallback`

- **文件**: `src/components/TodoApp.tsx`，第 20-44 行
- **描述**: `handleAdd`、`handleToggle`、`handleDelete`、`handleFilterChange` 每次渲染都创建新引用，可能导致子组件不必要的重渲染。同样属于弃用原型代码问题，正式 `useTodos` hook 已正确使用 `useCallback`。

#### [Suggestion] P-03: 大列表场景下可考虑虚拟滚动

- **文件**: `src/components/TodoList.tsx`
- **描述**: 当前 `TodoList` 直接渲染所有 todo 项。对于 Todo List 应用，数据量通常不大，当前实现完全可以接受。若未来需支持成百上千条记录，可引入 `react-window` 或 `@tanstack/virtual` 实现虚拟滚动。当前无需处理。

---

### 4. 代码异味

#### [Major] C-01: 重复的组件实现 — `TodoApp.tsx` 与 `App.tsx` 功能完全重叠

- **文件**: `src/components/TodoApp.tsx` 与 `src/App.tsx`
- **描述**: 两个文件承担相同职责（根组件 + 状态管理 + 子组件组合），`TodoApp.tsx` 是早期原型，`App.tsx` 是正式实现。`TodoApp.tsx` 的存在是明显的代码异味，应当删除。

#### [Minor] C-02: `TodoItem` 删除按钮仅 hover 可见，移动端不可用

- **文件**: `src/components/TodoItem.tsx`，第 27 行
- **描述**: `opacity-0 group-hover:opacity-100` 使删除按钮在非 hover 状态下不可见。移动端无 hover 交互，用户无法看到删除按钮。
- **修复建议**: 添加移动端适配，例如 `opacity-0 group-hover:opacity-100 sm:opacity-0 max-sm:opacity-100` 或使用 touch 事件。

#### [Suggestion] C-03: `useLocalStorage` 的 `key` 变更不会重新初始化

- **文件**: `src/hooks/useLocalStorage.ts`
- **描述**: `useState` 的初始化函数只在首次渲染时执行。如果 `key` 参数变化（虽然在当前应用中不会发生），不会从新的 key 读取数据。当前使用场景下不构成问题，记录为建议。

#### [Suggestion] C-04: localStorage 的 key 为硬编码字符串 `'todos'`

- **文件**: `src/hooks/useTodos.ts`，第 17 行
- **描述**: `useLocalStorage<Todo[]>('todos', [])` 中 `'todos'` 为魔法字符串。建议提取为常量以便统一管理和避免拼写错误。

```typescript
const STORAGE_KEY = 'todos' as const;
```

---

## 审查总结

### 统计

| 级别 | 数量 |
|------|------|
| Critical | 0 |
| Major | 4 |
| Minor | 6 |
| Suggestion | 3 |

### 总体评价

代码整体质量**良好**。正式实现代码（`App.tsx`、`useTodos.ts`、`useLocalStorage.ts`、各组件文件）遵循了 React 最佳实践：

- TypeScript 类型标注完整，使用 strict 模式
- Hooks 使用正确（`useMemo`、`useCallback`、`useState`）
- 样式使用 Tailwind CSS，**无 CSS Modules 残留**
- 组件职责清晰，props 接口定义规范
- 可访问性（`aria-label`、`aria-pressed`、`aria-live`、`role`）实现良好

**主要改进建议**（按优先级）：

1. **删除 `src/components/TodoApp.tsx`** — 弃用的原型代码，与正式 `App.tsx` 重复
2. **统一类型定义** — 删除 `src/components/types.ts`，全部使用 `src/types/todo.ts`，统一 `FilterStatus` 命名
3. **清理 barrel 文件** — 移除或更新 `src/components/index.ts`
4. **增加 localStorage 数据校验** — 在 `useLocalStorage` 中增加可选的 schema validator

以上 Major 问题均不影响运行时功能正确性，但会影响代码可维护性和团队协作效率，建议在合并前修复。

---

## Changelog

| 版本 | 日期 | 变更说明 | 变更人 |
|------|------|----------|--------|
| v1.0 | 2026-03-19 | 初始代码审查：覆盖 src/ 全部 14 个文件，识别 0 Critical / 4 Major / 6 Minor / 3 Suggestion | code-reviewer |
