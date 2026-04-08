# API 设计文档

## 1. 架构模式声明

本项目为 **架构模式 C（纯前端应用）**，是一个 AI Agent Hub Landing Page 静态展示型单页应用。

**不涉及以下内容：**

- 后端服务或 API 端点
- 数据库或 ORM
- 用户认证 / 授权
- 网络请求（fetch / axios）
- localStorage / IndexedDB / 任何客户端持久化存储
- WebSocket 或实时通信

## 2. 数据层设计

所有页面展示数据通过 TypeScript 静态常量管理，无需网络请求或本地存储。

### 数据源文件

| 文件 | 路径 | 职责 |
|------|------|------|
| 类型定义 | `src/types/index.ts` | 所有数据结构的 TypeScript interface |
| 静态常量 | `src/data/constants.ts` | 所有页面展示用的常量数据 |

### 数据模型（TypeScript Interface）

```typescript
// src/types/index.ts

/** 能力卡片数据 */
export interface Feature {
  icon: string;
  title: string;
  description: string;
}

/** 工作流程步骤 */
export interface WorkflowStep {
  step: number;
  title: string;
  description: string;
}

/** 技术优势 */
export interface TechAdvantage {
  title: string;
  description: string;
  icon: string;
}

/** 数据指标 */
export interface Metric {
  label: string;
  value: number;
  suffix: string;
  prefix?: string;
}

/** 导航链接 */
export interface NavLink {
  label: string;
  href: string;
}

/** 页脚链接分组 */
export interface FooterGroup {
  title: string;
  links: FooterLink[];
}

/** 页脚单个链接 */
export interface FooterLink {
  label: string;
  href: string;
}

/** 粒子配置 */
export interface ParticleConfig {
  count: number;
  color: string;
  maxRadius: number;
  maxSpeed: number;
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

### 静态常量清单

| 常量名 | 类型 | 消费组件 | 说明 |
|--------|------|----------|------|
| `NAV_LINKS` | `NavLink[]` | Navbar | 导航链接列表（3 项：功能特性、工作流程、技术亮点） |
| `FEATURES` | `Feature[]` | FeaturesSection | 核心能力卡片数据（4 项：智能对话、任务自动化、多 Agent 协作、知识检索） |
| `WORKFLOW_STEPS` | `WorkflowStep[]` | WorkflowSection | 工作流程步骤数据（3 项：描述需求、Agent 规划、自动执行） |
| `TECH_ADVANTAGES` | `TechAdvantage[]` | TechHighlightsSection | 技术优势数据（3 项：极速响应、安全可靠、无限扩展） |
| `METRICS` | `Metric[]` | TechHighlightsSection | 数据指标（4 项：响应速度、任务成功率、已服务用户、Agent 数量） |
| `FOOTER_GROUPS` | `FooterGroup[]` | Footer | 页脚链接分组（3 组：产品、资源、公司） |
| `PARTICLE_CONFIG` | `ParticleConfig` | ParticleCanvas | 粒子动画配置参数 |

### 数据流向

```
src/data/constants.ts  ──(import)──►  sections/*  ──(props)──►  ui/*  ──►  DOM
```

单向数据流：静态常量 -> Section 组件 -> UI 子组件 -> DOM 渲染。无异步数据获取，无副作用数据流。

## 3. API 端点

不适用。本项目无 API 端点。

## 4. 错误处理

不适用。本项目无网络请求，不涉及 API 错误处理。

组件层面的错误边界由 React 默认机制处理。

## 5. 存储方案

不适用。本项目无数据持久化需求。

- 不使用 localStorage
- 不使用 IndexedDB
- 不使用 Cookie
- 所有数据为编译时静态嵌入，随构建产物一起部署

## Changelog

| 版本 | 日期 | 变更说明 | 变更人 |
|------|------|----------|--------|
| v1.0 | 2026-04-08 | 初始版本，声明纯前端架构模式 C，记录静态数据层设计 | backend-architect |
