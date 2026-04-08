# 技术架构文档

## 0. 架构模式

- **模式**: C（纯前端应用）
- **选择理由**:
  - 本项目为 AI Agent Hub Landing Page，是纯展示型单页应用（SPA）
  - 所有数据为静态常量，无需后端 API 调用或数据库
  - 无用户认证、数据持久化等服务端需求
  - PRD 明确约束"无第三方动画库依赖，粒子效果使用原生 Canvas API 实现"
  - 无 SEO 强需求（Landing Page 可通过静态构建产物部署），不需要 SSR/SSG 框架
  - 项目规模小、组件数量有限，使用轻量级 Vite + React 即可满足全部需求

## 1. 技术选型

| 类别 | 技术 | 版本 | 选型理由 |
|------|------|------|----------|
| 前端框架 | React | ^19.0 | 组件化开发，生态成熟，适合 SPA 场景 |
| 类型系统 | TypeScript | ^5.7 | strict mode，提供完整类型安全 |
| 构建工具 | Vite | ^6.0 | 极速 HMR，开箱即用的 TypeScript 支持 |
| 样式方案 | Tailwind CSS | v4 | 通过 `@tailwindcss/vite` 插件集成，utility-first，零运行时 CSS |
| 测试框架 | Vitest | ^3.0 | 与 Vite 原生集成，兼容 Jest API |
| 测试工具 | @testing-library/react | ^16.0 | 组件测试标准方案 |
| 包管理 | pnpm | latest | 高效磁盘利用，严格依赖管理 |
| 代码规范 | ESLint + Prettier | latest | 统一代码风格 |

### 关键决策说明

1. **不使用路由库**: 单页应用仅一个页面，使用锚点滚动即可，无需 react-router
2. **不使用状态管理库**: 组件状态简单，React 内置 useState/useRef 足够
3. **不使用第三方动画库**: PRD 明确要求，粒子效果用原生 Canvas API，滚动动画用 Intersection Observer API + CSS transition
4. **Tailwind CSS v4 集成方式**: 使用 `@tailwindcss/vite` 插件，通过 CSS 文件 `@import "tailwindcss"` 引入，不使用 CSS Modules 或任何其他模块化 CSS 方案

## 2. 系统架构

### 整体架构

```
┌─────────────────────────────────────────────┐
│                  浏览器                       │
│  ┌───────────────────────────────────────┐  │
│  │           React SPA (Vite)            │  │
│  │  ┌─────────┐  ┌──────────────────┐   │  │
│  │  │  Hooks  │  │   Components     │   │  │
│  │  │ Layer   │  │   (UI Layer)     │   │  │
│  │  └────┬────┘  └────────┬─────────┘   │  │
│  │       │                │             │  │
│  │  ┌────▼────────────────▼─────────┐   │  │
│  │  │     Static Data (constants)   │   │  │
│  │  └───────────────────────────────┘   │  │
│  │                                       │  │
│  │  ┌───────────────────────────────┐   │  │
│  │  │  Canvas API (粒子动画)         │   │  │
│  │  └───────────────────────────────┘   │  │
│  │                                       │  │
│  │  ┌───────────────────────────────┐   │  │
│  │  │  Intersection Observer (滚动)  │   │  │
│  │  └───────────────────────────────┘   │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Tailwind CSS v4 (构建时生成原子类)           │
└─────────────────────────────────────────────┘
```

### 前端架构

**页面结构**: 单页面，由多个 Section 组件垂直排列组成

```
App
├── Navbar                    # 固定顶部导航
├── HeroSection               # 首屏 Hero（含 ParticleCanvas）
│   └── ParticleCanvas        # Canvas 粒子动画
├── FeaturesSection           # 核心能力展示
│   └── FeatureCard x4        # 能力卡片
├── WorkflowSection           # 工作流程展示
│   └── WorkflowStep x3       # 流程步骤
├── TechHighlightsSection     # 技术亮点
├── CtaSection                # 行动召唤
└── Footer                    # 页脚
```

**状态管理**: 无全局状态管理，各组件使用局部状态

| 状态 | 所在组件 | 类型 | 说明 |
|------|----------|------|------|
| isScrolled | Navbar | boolean | 页面是否滚动超过 50px，控制导航栏样式 |
| isMobileMenuOpen | Navbar | boolean | 移动端菜单展开状态 |
| isVisible | useScrollAnimation | boolean | 元素是否进入视口 |
| count | useCountUp | number | 当前计数值 |

**路由设计**: 无路由，使用锚点导航（`#features`、`#workflow`、`#tech`），通过 `scrollIntoView({ behavior: 'smooth' })` 实现平滑滚动。

## 3. 模块划分

### 模块职责

| 模块 | 路径 | 职责 |
|------|------|------|
| 页面区块组件 | `src/components/sections/` | 各 Section 组件，组合公共组件和数据渲染页面各区块 |
| 公共 UI 组件 | `src/components/ui/` | 可复用的 UI 元素：SectionTitle、GlowButton、FeatureCard、WorkflowStep |
| 粒子动画组件 | `src/components/ui/ParticleCanvas.tsx` | Canvas 粒子动画渲染与生命周期管理 |
| 自定义 Hooks | `src/hooks/` | useScrollAnimation、useCountUp、useScrollPosition |
| 静态数据 | `src/data/` | 所有页面展示用的常量数据 |
| 类型定义 | `src/types/` | TypeScript 接口和类型定义 |

### 模块依赖关系

```
sections/* ──────► ui/*          (Section 组件使用 UI 组件)
sections/* ──────► hooks/*       (Section 组件使用自定义 Hooks)
sections/* ──────► data/*        (Section 组件消费静态数据)
sections/* ──────► types/*       (类型引用)
ui/*       ──────► types/*       (类型引用)
hooks/*    ──────► (无外部依赖)   (仅使用 React 内置 API)
data/*     ──────► types/*       (数据常量使用类型约束)
```

## 4. 数据模型

### 核心数据结构定义

```typescript
// src/types/index.ts

/** 能力卡片数据 */
export interface Feature {
  /** 图标标识（emoji 或 SVG 组件名） */
  icon: string;
  /** 能力标题 */
  title: string;
  /** 能力描述 */
  description: string;
}

/** 工作流程步骤 */
export interface WorkflowStep {
  /** 步骤编号（从 1 开始） */
  step: number;
  /** 步骤标题 */
  title: string;
  /** 步骤描述 */
  description: string;
}

/** 技术优势 */
export interface TechAdvantage {
  /** 优势标题 */
  title: string;
  /** 优势描述 */
  description: string;
}

/** 数据指标 */
export interface Metric {
  /** 指标名称 */
  label: string;
  /** 目标数值 */
  value: number;
  /** 后缀（如 "ms", "%", "K+", "+"） */
  suffix: string;
  /** 前缀（如 "<"） */
  prefix?: string;
}

/** 导航链接 */
export interface NavLink {
  /** 显示文字 */
  label: string;
  /** 锚点链接（如 "#features"） */
  href: string;
}

/** 页脚链接分组 */
export interface FooterGroup {
  /** 分组标题 */
  title: string;
  /** 链接列表 */
  links: FooterLink[];
}

/** 页脚单个链接 */
export interface FooterLink {
  /** 显示文字 */
  label: string;
  /** 链接地址 */
  href: string;
}

/** 粒子配置 */
export interface ParticleConfig {
  /** 粒子数量 */
  count: number;
  /** 粒子颜色（CSS 颜色值） */
  color: string;
  /** 粒子最大半径 */
  maxRadius: number;
  /** 粒子最大速度 */
  maxSpeed: number;
  /** 连接线最大距离 */
  linkDistance: number;
}

/** 单个粒子状态（运行时） */
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}
```

### 数据流向

```
data/constants.ts  ──(import)──►  sections/*  ──(props)──►  ui/*
     │                                                        │
     ▼                                                        ▼
  静态数据定义                                            DOM 渲染

hooks/*  ──(状态 + ref)──►  sections/*  ──(className/style)──►  DOM
```

所有数据为单向流动：静态数据 -> Section 组件 -> UI 组件 -> DOM。无异步数据获取，无副作用数据流。

## 5. API 协议

本项目为纯前端静态应用，无后端 API 调用。

所有展示数据以 TypeScript 常量形式硬编码在 `src/data/constants.ts` 中，包括：

- `NAV_LINKS: NavLink[]` -- 导航链接列表
- `FEATURES: Feature[]` -- 核心能力卡片数据
- `WORKFLOW_STEPS: WorkflowStep[]` -- 工作流程步骤数据
- `TECH_ADVANTAGES: TechAdvantage[]` -- 技术优势数据
- `METRICS: Metric[]` -- 数据指标
- `FOOTER_GROUPS: FooterGroup[]` -- 页脚链接分组
- `PARTICLE_CONFIG: ParticleConfig` -- 粒子动画配置参数

## 6. 目录结构

```
ai-agent-home-page-example/
├── docs/
│   ├── prd.md                          # 产品需求文档
│   └── architecture.md                 # 技术架构文档（本文档）
├── public/
│   └── favicon.svg                     # 网站图标
├── src/
│   ├── components/
│   │   ├── sections/                   # 页面区块组件
│   │   │   ├── Navbar.tsx              # 导航栏
│   │   │   ├── HeroSection.tsx         # Hero 区域
│   │   │   ├── FeaturesSection.tsx     # 核心能力展示区
│   │   │   ├── WorkflowSection.tsx     # 工作流程展示区
│   │   │   ├── TechHighlightsSection.tsx # 技术亮点区
│   │   │   ├── CtaSection.tsx          # CTA 区域
│   │   │   └── Footer.tsx              # 页脚
│   │   └── ui/                         # 可复用 UI 组件
│   │       ├── ParticleCanvas.tsx      # Canvas 粒子动画
│   │       ├── SectionTitle.tsx        # 区域标题（渐变文字）
│   │       ├── GlowButton.tsx          # 发光按钮
│   │       ├── FeatureCard.tsx         # 能力卡片
│   │       └── WorkflowStep.tsx        # 流程步骤
│   ├── hooks/
│   │   ├── useScrollAnimation.ts       # 滚动入场动画 Hook
│   │   ├── useCountUp.ts              # 数字计数动画 Hook
│   │   └── useScrollPosition.ts       # 滚动位置检测 Hook
│   ├── data/
│   │   └── constants.ts               # 所有静态展示数据
│   ├── types/
│   │   └── index.ts                   # TypeScript 类型定义
│   ├── App.tsx                         # 根组件，组合所有 Section
│   ├── main.tsx                        # 入口文件
│   └── index.css                       # 全局样式（@import "tailwindcss" + 自定义 CSS 变量）
├── tests/
│   ├── components/
│   │   ├── sections/
│   │   │   ├── Navbar.test.tsx
│   │   │   ├── HeroSection.test.tsx
│   │   │   ├── FeaturesSection.test.tsx
│   │   │   ├── WorkflowSection.test.tsx
│   │   │   ├── TechHighlightsSection.test.tsx
│   │   │   ├── CtaSection.test.tsx
│   │   │   └── Footer.test.tsx
│   │   └── ui/
│   │       ├── SectionTitle.test.tsx
│   │       ├── GlowButton.test.tsx
│   │       ├── FeatureCard.test.tsx
│   │       └── WorkflowStep.test.tsx
│   └── hooks/
│       ├── useScrollAnimation.test.ts
│       └── useCountUp.test.ts
├── index.html                          # HTML 入口
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── eslint.config.js
```

## 7. 开发规范

### 命名规范

| 类别 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `FeatureCard.tsx` |
| Hook 文件 | camelCase，use 前缀 | `useScrollAnimation.ts` |
| 类型文件 | camelCase | `index.ts` |
| 数据文件 | camelCase | `constants.ts` |
| 测试文件 | 与源文件同名 + `.test` | `Navbar.test.tsx` |
| 组件名 | PascalCase | `export function FeatureCard()` |
| Hook 名 | camelCase，use 前缀 | `export function useCountUp()` |
| 常量名 | UPPER_SNAKE_CASE | `NAV_LINKS`, `PARTICLE_CONFIG` |
| 接口名 | PascalCase | `interface Feature` |
| CSS 类名 | Tailwind utility class | `className="flex items-center gap-4"` |

### 代码组织原则

1. **组件职责单一**: 每个组件只负责一个明确的 UI 区块，逻辑通过 Hook 抽离
2. **数据与视图分离**: 静态数据统一放在 `data/constants.ts`，组件只负责渲染
3. **类型先行**: 所有 props、数据结构先定义 TypeScript interface，再编写实现
4. **Tailwind CSS Only**: 所有样式通过 Tailwind utility class 实现，仅在 `index.css` 中定义必要的全局样式（如 `@import "tailwindcss"`、CSS 自定义属性、`@keyframes` 动画）
5. **无 any 类型**: TypeScript strict mode，禁止使用 `any`，必要时使用 `unknown` + 类型守卫
6. **组件导出方式**: 使用命名导出（named export），不使用默认导出
7. **Hook 设计原则**: 每个 Hook 职责单一，返回值语义明确，内部仅使用 React 内置 API（useState, useEffect, useRef, useCallback）

### Tailwind CSS v4 集成要点

- 通过 `@tailwindcss/vite` 插件在 `vite.config.ts` 中集成
- `src/index.css` 中使用 `@import "tailwindcss"` 引入
- 自定义主题色通过 CSS 变量在 `@theme` 中定义
- 渐变色、发光效果等通过 Tailwind 自定义 utility 或内联 `style` 属性实现

### 性能优化策略

- 粒子动画使用 `requestAnimationFrame` 驱动，组件卸载时取消动画帧
- Canvas 使用 `devicePixelRatio` 适配高清屏
- Intersection Observer 使用 `threshold` 参数控制触发时机，减少不必要的回调
- 图片资源（如有）使用 lazy loading
- 构建产物使用 Vite 默认的代码分割和 tree-shaking

## Changelog

| 版本 | 日期 | 变更说明 | 变更人 |
|------|------|----------|--------|
| v1.0 | 2026-04-08 | 初始版本，完成技术架构设计 | tech-architect |
