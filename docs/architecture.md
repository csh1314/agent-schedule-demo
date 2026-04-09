# 技术架构文档 — Todo List 动画增强

## 0. 架构模式

**模式 C（纯前端应用）— 增量改造**

本项目是在已有 Todo List 纯前端应用基础上的增量改造，不涉及后端服务。核心目标是在不改变现有组件 props 接口和业务逻辑的前提下，叠加动画装饰层。

现有应用技术栈：
- React 18 + TypeScript + Vite 6
- Tailwind CSS v4（通过 `@tailwindcss/vite` 插件集成）
- Vitest + Testing Library
- pnpm 包管理

改造策略：**Wrapper 模式** — 通过动画包装组件（Animated Wrappers）和自定义 Hooks 为现有组件注入动画能力，现有组件代码保持不变或仅做最小改动（替换 HTML 元素为 motion 元素）。

## 1. 技术选型

### 动画库：framer-motion

| 维度 | 说明 |
|------|------|
| 版本 | `framer-motion ^11`（最新稳定版，支持 React 18） |
| 安装 | `pnpm add framer-motion` 作为 `dependencies` |
| 包体积 | tree-shakable，按需引入核心模块约 30-40KB gzipped，满足 PRD < 50KB 要求 |
| 集成方式 | 直接在组件中使用 `motion` 组件和 `AnimatePresence`，无需全局 Provider |

### 选型理由

1. **声明式 API**：`motion.div` + `animate/initial/exit` 声明式写法与 React 组件模型天然契合
2. **AnimatePresence**：原生支持退场动画（exit animation），解决 React 中元素卸载时无法动画的痛点，完美匹配 F2/F3（添加/删除动画）
3. **Layout Animation**：内置 `layout` prop 实现列表重排动画（F5），无需手动计算位置
4. **Spring Physics**：内置弹性物理引擎，PRD 中多处要求 spring 动画（F2 添加、F7 按钮、F9 指示条）
5. **手势支持**：`whileHover`/`whileTap` 声明式手势，直接满足 F7 按钮微交互
6. **性能优化**：默认使用 GPU 加速属性（transform/opacity），满足 60fps 要求

### 纯 CSS 动画（Tailwind 自定义动画）

以下场景使用纯 CSS animation 而非 framer-motion，避免不必要的 JS 开销：

| 场景 | 实现方式 |
|------|----------|
| F12 渐变流光背景 | Tailwind `@keyframes` + `animation` 自定义工具类 |
| F8 输入框发光脉动 | Tailwind `@keyframes` + `animation` |
| F11 空状态呼吸脉动 | Tailwind `@keyframes` + `animation` |
| F13 Checkbox SVG 描线 | CSS `stroke-dashoffset` transition |

## 2. 系统架构

### 动画层架构

```
┌─────────────────────────────────────────────────┐
│                  TodoApp（入口）                   │
│  ┌─────────────────────────────────────────────┐ │
│  │          动画层 (Animation Layer)             │ │
│  │                                             │ │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────┐ │ │
│  │  │ motion   │  │ Animate  │  │ Animation │ │ │
│  │  │ 组件替换  │  │ Presence │  │  Hooks    │ │ │
│  │  └──────────┘  └──────────┘  └───────────┘ │ │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────┐ │ │
│  │  │ Animated │  │ CSS 动画  │  │ Animation │ │ │
│  │  │ Wrappers │  │ (Tailwind)│  │  Configs  │ │ │
│  │  └──────────┘  └──────────┘  └───────────┘ │ │
│  └─────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────┐ │
│  │        业务层 (Business Layer) — 不变         │ │
│  │                                             │ │
│  │  TodoInput  TodoList  TodoItem  TodoFilter  │ │
│  │  TodoCounter  useTodos  useLocalStorage     │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### 集成方式

动画层与现有业务层的集成采用三种策略，按侵入程度从低到高：

**策略 A — motion 元素直接替换（主要方式）**

在现有组件内部，将 `div`/`button`/`span` 替换为 `motion.div`/`motion.button`/`motion.span`，添加动画 props。这是最轻量的改动方式，适用于大部分场景。

```
现有: <div className="...">
改后: <motion.div className="..." variants={...} initial="hidden" animate="visible">
```

适用功能：F1（入场）、F2/F3（添加/删除）、F4（完成状态）、F5（重排）、F7（按钮微交互）

**策略 B — 动画包装组件（特殊效果）**

对于需要额外 DOM 结构或复杂逻辑的动画效果，封装独立的动画组件，包装或替换现有组件的局部结构。

适用功能：F6（庆祝粒子特效）、F9（滑动指示条）、F10（数字滚动）、F13（自定义 Checkbox）

**策略 C — CSS 动画类（氛围效果）**

通过 Tailwind 自定义 `@keyframes` 和 `animation` 工具类，在现有元素上添加 className 即可。

适用功能：F8（输入框发光）、F11（空状态呼吸）、F12（渐变流光背景）

### prefers-reduced-motion 降级架构

```
┌────────────────────────────────┐
│     useReducedMotion() hook    │  ← framer-motion 内置
├────────────────────────────────┤
│  返回 true → 所有 framer-motion│
│  动画自动降级为 duration: 0    │
├────────────────────────────────┤
│  CSS 动画 → Tailwind 使用      │
│  motion-safe: / motion-reduce: │
│  变体类控制                    │
└────────────────────────────────┘
```

在 `src/animations/hooks/useAnimationConfig.ts` 中提供统一的 `useAnimationConfig` hook，所有动画组件通过该 hook 获取是否启用动画的全局开关。CSS 动画通过 Tailwind 的 `motion-safe:` 和 `motion-reduce:` 变体类处理。

## 3. 模块划分

### 3.1 动画配置模块 (`src/animations/configs/`)

集中管理所有动画参数，便于统一调整和维护。

| 文件 | 职责 | 对应功能 |
|------|------|----------|
| `transitions.ts` | 通用 transition 预设（spring、tween、ease） | 全局复用 |
| `variants.ts` | motion variants 定义（入场、退场、列表 stagger） | F1, F2, F3, F5 |
| `gestures.ts` | 手势动画配置（whileHover, whileTap） | F7 |

### 3.2 动画 Hooks 模块 (`src/animations/hooks/`)

封装动画相关的状态逻辑和副作用。

| 文件 | 职责 | 对应功能 |
|------|------|----------|
| `useAnimationConfig.ts` | 读取 `prefers-reduced-motion`，返回全局动画开关和降级配置 | 全局 |
| `useStaggerChildren.ts` | 管理子元素 stagger 入场的延迟计算 | F1 |
| `useCelebration.ts` | 管理庆祝粒子的触发状态和生命周期 | F6 |
| `useNumberRoll.ts` | 管理数字滚动动画的前值/后值状态 | F10 |
| `useSlidingIndicator.ts` | 计算滑动指示条位置和尺寸 | F9 |

### 3.3 动画包装组件模块 (`src/animations/components/`)

独立的动画专用组件，提供现有组件无法通过简单替换实现的复杂效果。

| 文件 | 职责 | 对应功能 |
|------|------|----------|
| `CelebrationEffect.tsx` | 粒子/星星迸发特效，挂载时播放动画，完成后自动卸载 | F6 |
| `AnimatedCheckbox.tsx` | 自定义 checkbox，SVG stroke-dashoffset 描线动画 | F13 |
| `NumberRoller.tsx` | 数字滚动组件，老虎机翻牌效果 | F10 |
| `SlidingIndicator.tsx` | 筛选按钮底部滑动指示条 | F9 |
| `StrikethroughText.tsx` | 删除线从左到右渐进展开的文本组件 | F4 |
| `GlowInput.tsx` | 聚焦时渐变发光效果的输入框（CSS 动画为主） | F8 |

### 3.4 模块依赖关系

```
configs/          ← 纯数据，无依赖
    ↑
hooks/            ← 依赖 configs，依赖 framer-motion
    ↑
components/       ← 依赖 hooks + configs，依赖 framer-motion
    ↑
现有业务组件       ← 引用 animations/ 下的 configs、hooks、components
```

## 4. 数据模型

### 4.1 动画配置类型定义

```typescript
// src/animations/types.ts

import type { Transition, Variants, TargetAndTransition } from 'framer-motion';

/**
 * 全局动画配置，由 useAnimationConfig 返回
 */
export interface AnimationConfig {
  /** 是否启用动画（false 时所有动画跳过） */
  enabled: boolean;
  /** 降级模式下的统一 transition：duration 0，无动画 */
  reducedTransition: Transition;
}

/**
 * Spring 弹性动画参数
 */
export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass?: number;
}

/**
 * 预设的 Transition 配置
 */
export interface TransitionPresets {
  /** 默认 spring：用于添加 Todo（F2）、列表重排（F5） */
  spring: Transition;
  /** 快速 spring：用于按钮微交互（F7）、指示条滑动（F9） */
  springFast: Transition;
  /** 平滑 tween：用于淡入淡出、颜色过渡 */
  tween: Transition;
  /** 快速 tween：用于退场动画（F3 删除） */
  tweenFast: Transition;
}

/**
 * 列表项动画 variants
 */
export interface TodoItemVariants {
  /** 入场前的初始状态 */
  initial: TargetAndTransition;
  /** 入场后的可见状态 */
  animate: TargetAndTransition;
  /** 退场状态（删除时） */
  exit: TargetAndTransition;
}

/**
 * 庆祝粒子配置
 */
export interface CelebrationConfig {
  /** 粒子数量 */
  particleCount: number;
  /** 扩散半径（px） */
  spread: number;
  /** 动画持续时间（s） */
  duration: number;
  /** 粒子颜色列表 */
  colors: string[];
}

/**
 * 数字滚动方向
 */
export type RollDirection = 'up' | 'down';

/**
 * 滑动指示条位置
 */
export interface IndicatorPosition {
  /** 相对于容器的 left 偏移（px） */
  left: number;
  /** 指示条宽度（px） */
  width: number;
}

/**
 * 手势动画配置
 */
export interface GestureConfig {
  whileHover: TargetAndTransition;
  whileTap: TargetAndTransition;
}
```

### 4.2 业务数据模型

保持不变，不做任何修改：

```typescript
// src/components/types.ts — 原样保留
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}
type FilterType = 'all' | 'active' | 'completed';
```

## 5. API 协议

无。本项目为纯前端应用（模式 C），无后端 API。

数据持久化通过现有的 `useLocalStorage` hook 实现，动画层不涉及任何数据存储。

## 6. 目录结构

以下为新增文件的位置规划。**已有文件仅标注需改动项**，未列出的已有文件不做任何改动。

```
todo-list-example/
├── src/
│   ├── animations/                    # ★ 新增：动画模块根目录
│   │   ├── index.ts                   # 统一导出
│   │   ├── types.ts                   # 动画类型定义（见第 4 章）
│   │   ├── configs/
│   │   │   ├── index.ts               # 统一导出
│   │   │   ├── transitions.ts         # Transition 预设（spring、tween）
│   │   │   ├── variants.ts            # Motion variants（入场、退场、stagger）
│   │   │   └── gestures.ts            # 手势配置（whileHover、whileTap）
│   │   ├── hooks/
│   │   │   ├── index.ts               # 统一导出
│   │   │   ├── useAnimationConfig.ts  # prefers-reduced-motion 全局开关
│   │   │   ├── useStaggerChildren.ts  # Stagger 入场延迟管理
│   │   │   ├── useCelebration.ts      # 庆祝粒子触发与生命周期
│   │   │   ├── useNumberRoll.ts       # 数字滚动前值/后值管理
│   │   │   └── useSlidingIndicator.ts # 滑动指示条位置计算
│   │   └── components/
│   │       ├── index.ts               # 统一导出
│   │       ├── CelebrationEffect.tsx  # F6 粒子特效
│   │       ├── AnimatedCheckbox.tsx    # F13 SVG 描线 checkbox
│   │       ├── NumberRoller.tsx        # F10 数字滚动
│   │       ├── SlidingIndicator.tsx    # F9 滑动指示条
│   │       ├── StrikethroughText.tsx   # F4 渐进删除线
│   │       └── GlowInput.tsx          # F8 聚焦发光输入框
│   ├── components/
│   │   ├── TodoApp.tsx                # ✏️ 改动：添加入场动画（F1）、背景动画类（F12）
│   │   ├── TodoInput.tsx              # ✏️ 改动：替换为 GlowInput（F8）、按钮加手势（F7）
│   │   ├── TodoList.tsx               # ✏️ 改动：加 AnimatePresence + layout（F2/F3/F5/F11）
│   │   ├── TodoItem.tsx               # ✏️ 改动：motion.div 包装 + AnimatedCheckbox + StrikethroughText + CelebrationEffect
│   │   ├── TodoFilter.tsx             # ✏️ 改动：加 SlidingIndicator（F9）
│   │   ├── TodoCounter.tsx            # ✏️ 改动：加 NumberRoller（F10）
│   │   ├── types.ts                   # 不变
│   │   └── index.ts                   # 不变
│   ├── hooks/
│   │   ├── useTodos.ts                # 不变
│   │   └── useLocalStorage.ts         # 不变
│   ├── types/
│   │   └── todo.ts                    # 不变
│   ├── index.css                      # ✏️ 改动：添加 @keyframes 和自定义动画工具类（F8/F11/F12）
│   ├── App.tsx                        # 不变
│   └── main.tsx                       # 不变
├── tests/
│   └── animations/                    # ★ 新增：动画相关测试
│       ├── hooks/
│       │   ├── useAnimationConfig.test.ts
│       │   ├── useCelebration.test.ts
│       │   ├── useNumberRoll.test.ts
│       │   └── useSlidingIndicator.test.ts
│       └── components/
│           ├── CelebrationEffect.test.tsx
│           ├── AnimatedCheckbox.test.tsx
│           ├── NumberRoller.test.tsx
│           └── SlidingIndicator.test.tsx
├── package.json                       # ✏️ 改动：添加 framer-motion 依赖
├── vite.config.ts                     # 不变
└── tsconfig.json                      # 不变
```

## 7. 开发规范

### 7.1 动画编写规范

**一、优先使用声明式 API**

```typescript
// ✅ 正确：声明式，framer-motion 自动优化
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, x: 60 }}
  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
/>

// ❌ 避免：命令式 useAnimate，除非确有必要
const [scope, animate] = useAnimate();
animate(scope.current, { opacity: 1 });
```

**二、从 configs/ 引用动画参数，不硬编码**

```typescript
// ✅ 正确：从集中配置引用
import { springTransition } from '@/animations/configs/transitions';
<motion.div transition={springTransition} />

// ❌ 避免：在组件中硬编码数值
<motion.div transition={{ type: 'spring', stiffness: 300, damping: 24 }} />
```

**三、使用 variants 管理多状态动画**

```typescript
// ✅ 正确：variants 集中管理状态
const itemVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: 60 },
};

<motion.div variants={itemVariants} initial="hidden" animate="visible" exit="exit" />
```

**四、AnimatePresence 必须包裹可卸载元素**

```typescript
// ✅ 正确：AnimatePresence 包裹列表，key 确保唯一
<AnimatePresence mode="popLayout">
  {todos.map(todo => (
    <motion.div key={todo.id} layout exit={{ opacity: 0, x: 60 }}>
      <TodoItem todo={todo} />
    </motion.div>
  ))}
</AnimatePresence>
```

**五、layout animation 标记一致**

参与同一个列表重排的所有 `motion` 元素必须带 `layout` prop，且共享同一个 `AnimatePresence` 上下文。

### 7.2 性能注意事项

| 规则 | 说明 |
|------|------|
| GPU 加速属性优先 | 动画属性限制为 `transform`（x, y, scale, rotate）和 `opacity`。避免动画 `width`/`height`/`top`/`left` 等触发 layout 的属性 |
| 避免动画 height: auto | framer-motion 不支持直接动画到 `height: auto`。使用 `layout` prop 或设定具体 px 值 |
| 粒子特效及时清理 | `CelebrationEffect` 组件必须在动画结束后通过 `onAnimationComplete` 回调触发卸载，防止 DOM 节点残留和内存泄漏 |
| CSS 动画用于循环动画 | 无限循环的动画（背景流光 F12、呼吸脉动 F11、发光脉动 F8）使用 CSS `@keyframes`，不占用 JS 主线程 |
| 避免 re-render 触发重播 | 动画配置对象使用模块级常量或 `useMemo`，避免每次 render 创建新对象导致动画重播 |
| `will-change` 谨慎使用 | 仅在持续动画元素上使用 `will-change: transform`，临时动画由 framer-motion 自动管理 |
| 列表项 key 稳定 | `AnimatePresence` 内的 `key` 必须使用 `todo.id`（稳定标识），不可使用数组 index |

### 7.3 可访问性规范

1. **prefers-reduced-motion**：`useAnimationConfig` hook 检测系统设置，返回 `enabled: false` 时所有 framer-motion 动画设置 `transition: { duration: 0 }`。CSS 动画通过 `motion-reduce:animate-none` 类处理。
2. **aria-live 区域**：`TodoCounter` 的 `aria-live="polite"` 区域内容更新不受动画延迟影响——数字滚动为纯视觉效果，实际文本内容立即更新。
3. **动画不阻塞交互**：所有动画设置 `pointer-events: auto`，入场动画播放期间用户可正常操作。

### 7.4 Tailwind CSS 自定义动画

在 `src/index.css` 中通过 `@theme` 扩展 Tailwind CSS v4 的动画主题：

```css
@import "tailwindcss";

@theme {
  --animate-gradient-flow: gradient-flow 8s ease infinite;
  --animate-glow-pulse: glow-pulse 2s ease-in-out infinite;
  --animate-breathe: breathe 2s ease-in-out infinite;
}

@keyframes gradient-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 8px rgba(99, 102, 241, 0.4); }
  50% { box-shadow: 0 0 16px rgba(139, 92, 246, 0.6); }
}

@keyframes breathe {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

使用方式：`className="motion-safe:animate-gradient-flow"` — 当用户开启 `prefers-reduced-motion` 时自动禁用。

### 7.5 测试规范

- framer-motion 动画在 vitest + jsdom 中不会真实执行，测试重点为：
  - 动画组件正确渲染（DOM 结构正确）
  - Hooks 返回值正确（`useAnimationConfig` 根据 media query 返回正确状态）
  - 庆祝粒子组件的挂载/卸载生命周期
  - `AnimatePresence` 包裹结构的存在性
- 使用 `@testing-library/react` 的 `render` + `screen` 查询
- Mock `window.matchMedia` 测试 `prefers-reduced-motion` 降级逻辑

## Changelog

| 版本 | 日期 | 变更说明 | 变更人 |
|------|------|----------|--------|
| v1.0 | 2026-04-09 | 初始版本：动画层架构设计，含模块划分、类型定义、目录结构、开发规范 | tech-architect |
