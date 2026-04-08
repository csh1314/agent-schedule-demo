# 产品需求文档 (PRD)

## 1. 项目概述

- **项目名称**: AI Agent Hub Landing Page
- **一句话描述**: 一个具有炫酷科技感视觉效果的 AI Agent 平台首页，展示平台核心能力并引导用户注册体验
- **目标用户**: 对 AI Agent 技术感兴趣的开发者、企业决策者、技术爱好者
- **技术栈**: React + TypeScript + Vite + Tailwind CSS v4
- **包管理**: pnpm
- **项目目录**: `ai-agent-home-page-example/`

## 2. 需求背景

### 用户痛点

- AI Agent 平台需要一个高质量的首页来传达产品价值主张，但市面上多数 Landing Page 设计平庸，缺乏科技感和视觉冲击力
- 用户在初次访问时需要快速理解平台能力，传统的文字堆砌方式无法有效吸引目标用户

### 解决方案概述

打造一个视觉效果炫酷、具有强烈科技感的 AI Agent 平台 Landing Page，通过渐变色彩、流畅动画、粒子特效等视觉元素，结合清晰的信息架构，让用户在短时间内感受到平台的技术实力并理解核心功能。

## 3. 功能需求

### 3.1 核心功能清单

| 编号 | 功能名称 | 描述 | 优先级 |
|------|----------|------|--------|
| F01 | Hero 区域 | 首屏大视觉区域，包含标题、副标题、CTA 按钮和粒子动画背景 | P0 |
| F02 | 导航栏 | 固定顶部导航，包含 Logo、导航链接和 CTA 按钮，支持滚动时样式变化 | P0 |
| F03 | 核心能力展示区 | 以卡片形式展示 AI Agent 平台的核心能力 | P0 |
| F04 | 工作流程展示区 | 可视化展示 AI Agent 的工作流程步骤 | P0 |
| F05 | 技术亮点区 | 展示平台的技术优势和数据指标 | P1 |
| F06 | CTA 区域 | 底部行动召唤区域，引导用户注册或体验 | P0 |
| F07 | 页脚 | 包含版权信息、链接等 | P1 |
| F08 | 粒子动画背景 | Hero 区域的交互式粒子动画效果 | P0 |
| F09 | 滚动动画 | 各区块在滚动进入视口时的入场动画 | P1 |
| F10 | 响应式布局 | 适配桌面端和移动端 | P1 |

### 3.2 功能详情

#### F01 Hero 区域

**用户故事**: As a visitor, I want to see an impressive hero section when I first land on the page, so that I immediately feel the technological sophistication of the platform.

**详细描述**:
- 全屏高度的 Hero 区域，深色背景（深蓝/深紫渐变）
- 大标题文字带有渐变色效果（如蓝紫渐变）
- 副标题简洁描述平台定位
- 两个 CTA 按钮：主按钮（"开始体验"，亮色填充）和次按钮（"了解更多"，描边样式）
- 背景有粒子动画效果（见 F08）

**验收标准**:

```
Given 用户首次访问页面
When 页面加载完成
Then Hero 区域占满首屏视口高度（100vh）
And 显示主标题文字，文字带有渐变色效果
And 显示副标题描述文字
And 显示"开始体验"主 CTA 按钮（填充样式）
And 显示"了解更多"次 CTA 按钮（描边样式）
And 背景区域渲染粒子动画
```

```
Given 用户在 Hero 区域
When 用户将鼠标悬停在主 CTA 按钮上
Then 按钮出现悬停视觉反馈（如发光效果或缩放）
```

```
Given 用户在 Hero 区域
When 用户点击"了解更多"按钮
Then 页面平滑滚动到核心能力展示区
```

#### F02 导航栏

**用户故事**: As a visitor, I want a persistent navigation bar, so that I can quickly jump to any section of the page.

**详细描述**:
- 固定在页面顶部（sticky）
- 左侧 Logo（文字 Logo "AgentHub"）
- 中间导航链接：功能特性、工作流程、技术亮点
- 右侧 CTA 按钮："立即注册"
- 页面滚动后导航栏添加背景模糊效果（backdrop-blur）和半透明底色

**验收标准**:

```
Given 页面已加载
When 用户查看页面顶部
Then 导航栏固定显示在顶部
And 左侧显示 "AgentHub" Logo 文字
And 中间显示导航链接：功能特性、工作流程、技术亮点
And 右侧显示"立即注册"按钮
```

```
Given 用户在页面顶部（未滚动）
When 用户向下滚动页面超过 50px
Then 导航栏背景变为半透明深色并带有 backdrop-blur 模糊效果
```

```
Given 导航栏已显示
When 用户点击"功能特性"导航链接
Then 页面平滑滚动到核心能力展示区（Features section）
```

```
Given 导航栏已显示
When 用户点击"工作流程"导航链接
Then 页面平滑滚动到工作流程展示区（Workflow section）
```

```
Given 导航栏已显示
When 用户点击"技术亮点"导航链接
Then 页面平滑滚动到技术亮点区（Tech Highlights section）
```

#### F03 核心能力展示区

**用户故事**: As a visitor, I want to understand the core capabilities of the AI Agent platform, so that I can evaluate whether it meets my needs.

**详细描述**:
- 区域标题："核心能力" 带渐变色效果
- 区域副标题：简要说明
- 展示 4 张能力卡片，每张包含：图标、标题、描述文字
- 四项核心能力：
  1. **智能对话** - 自然语言理解与多轮对话能力
  2. **任务自动化** - 自动分解和执行复杂任务
  3. **多 Agent 协作** - 多个 Agent 协同完成复杂工作流
  4. **知识检索** - 智能检索与知识库管理
- 卡片样式：深色半透明背景、边框发光效果、悬停时有上浮和发光增强动画
- 使用 grid 布局，桌面端 2x2，移动端单列

**验收标准**:

```
Given 用户滚动到核心能力展示区
When 该区域进入视口
Then 显示区域标题"核心能力"，文字带渐变色效果
And 显示区域副标题
And 显示 4 张能力卡片
And 每张卡片包含图标、标题和描述文字
```

```
Given 核心能力展示区已显示
When 检查 4 张卡片内容
Then 第 1 张卡片标题为"智能对话"
And 第 2 张卡片标题为"任务自动化"
And 第 3 张卡片标题为"多 Agent 协作"
And 第 4 张卡片标题为"知识检索"
```

```
Given 核心能力展示区已显示
When 用户将鼠标悬停在某张卡片上
Then 该卡片出现上浮效果（translateY 向上移动）
And 卡片边框发光效果增强
```

```
Given 桌面端视口宽度 >= 768px
When 用户查看核心能力展示区
Then 4 张卡片以 2 列 2 行的 grid 布局排列
```

```
Given 移动端视口宽度 < 768px
When 用户查看核心能力展示区
Then 4 张卡片以单列垂直排列
```

#### F04 工作流程展示区

**用户故事**: As a visitor, I want to see how the AI Agent workflow operates, so that I can understand how the platform solves real-world problems.

**详细描述**:
- 区域标题："工作流程" 带渐变色效果
- 展示 3 个步骤的流程，每步包含：步骤编号、标题、描述
- 三个步骤：
  1. **描述需求** - 用自然语言描述你的任务需求
  2. **Agent 规划** - AI Agent 自动分析并制定执行计划
  3. **自动执行** - 多 Agent 协作执行任务并交付结果
- 步骤之间用连接线或箭头串联，形成流程感
- 每个步骤编号使用圆形容器，带渐变背景和发光效果

**验收标准**:

```
Given 用户滚动到工作流程展示区
When 该区域进入视口
Then 显示区域标题"工作流程"，文字带渐变色效果
And 显示 3 个步骤
```

```
Given 工作流程展示区已显示
When 检查步骤内容
Then 步骤 1 标题为"描述需求"，显示步骤编号 "1"
And 步骤 2 标题为"Agent 规划"，显示步骤编号 "2"
And 步骤 3 标题为"自动执行"，显示步骤编号 "3"
And 每个步骤包含描述文字
```

```
Given 工作流程展示区已显示
When 用户查看步骤之间的视觉元素
Then 步骤之间存在视觉连接元素（连接线或箭头）表示流程方向
```

#### F05 技术亮点区

**用户故事**: As a visitor, I want to see the technical strengths and performance metrics of the platform, so that I can have confidence in the platform's capabilities.

**详细描述**:
- 区域标题："技术亮点" 带渐变色效果
- 左侧展示 3 个技术优势点，每个包含标题和描述：
  1. **极速响应** - 毫秒级响应延迟，流畅的实时交互体验
  2. **安全可靠** - 企业级数据加密和隐私保护
  3. **无限扩展** - 弹性架构支持海量并发
- 右侧展示数据指标面板，包含 3-4 个关键数字：
  - 响应速度: < 100ms
  - 任务成功率: 99.9%
  - 已服务用户: 100K+
  - Agent 数量: 50+
- 数据指标数字带有从 0 到目标值的计数动画效果

**验收标准**:

```
Given 用户滚动到技术亮点区
When 该区域进入视口
Then 显示区域标题"技术亮点"，文字带渐变色效果
```

```
Given 技术亮点区已显示
When 检查技术优势内容
Then 显示"极速响应"技术优势及其描述
And 显示"安全可靠"技术优势及其描述
And 显示"无限扩展"技术优势及其描述
```

```
Given 技术亮点区已显示
When 检查数据指标面板
Then 显示响应速度指标"< 100ms"
And 显示任务成功率指标"99.9%"
And 显示已服务用户指标"100K+"
And 显示 Agent 数量指标"50+"
```

```
Given 技术亮点区首次进入视口
When 数据指标面板变为可见
Then 数字指标从 0 开始播放计数动画至目标值
```

```
Given 桌面端视口宽度 >= 768px
When 用户查看技术亮点区
Then 技术优势和数据指标以左右两列布局排列
```

#### F06 CTA 区域

**用户故事**: As a visitor, I want a clear call-to-action at the bottom of the page, so that I know how to take the next step after learning about the platform.

**详细描述**:
- 独立的全宽区域，带有渐变背景
- 标题文字："准备好开启 AI Agent 之旅了吗？"
- 副标题："立即注册，免费体验全部核心功能"
- 一个醒目的 CTA 按钮："免费开始"，大尺寸，带发光/脉冲动画效果
- 背景带有微妙的网格或光线效果

**验收标准**:

```
Given 用户滚动到页面底部 CTA 区域
When 该区域可见
Then 显示标题"准备好开启 AI Agent 之旅了吗？"
And 显示副标题"立即注册，免费体验全部核心功能"
And 显示"免费开始"CTA 按钮
```

```
Given CTA 区域已显示
When 用户观察 CTA 按钮
Then 按钮具有脉冲或发光动画效果，持续吸引注意力
```

```
Given CTA 区域已显示
When 用户将鼠标悬停在"免费开始"按钮上
Then 按钮出现悬停视觉反馈效果
```

#### F07 页脚

**用户故事**: As a visitor, I want to see footer information, so that I can find additional links and legal information.

**详细描述**:
- 深色背景，与整体页面风格一致
- 左侧 Logo 和简短描述
- 中间链接分组：产品、资源、公司
- 右侧社交媒体图标占位
- 底部版权信息："Copyright 2026 AgentHub. All rights reserved."

**验收标准**:

```
Given 用户滚动到页面最底部
When 页脚区域可见
Then 显示 "AgentHub" Logo 文字
And 显示版权信息文字包含 "2026" 和 "AgentHub"
And 显示链接分组
```

#### F08 粒子动画背景

**用户故事**: As a visitor, I want to see a dynamic particle animation in the hero area, so that I feel the technological atmosphere of the platform.

**详细描述**:
- Hero 区域背景展示动态粒子效果
- 粒子为小圆点，颜色为蓝紫色调，带透明度变化
- 粒子缓慢随机移动，粒子之间在接近时绘制连接线
- 使用 Canvas 实现以确保性能
- 粒子数量适中（约 50-80 个），不影响页面性能
- 响应窗口 resize 事件，自动调整 Canvas 尺寸

**验收标准**:

```
Given 页面加载完成
When Hero 区域渲染
Then 背景中存在一个 Canvas 元素
And Canvas 尺寸与 Hero 区域一致
```

```
Given 粒子动画已渲染
When 观察动画
Then 屏幕上存在可见的粒子（小圆点）
And 粒子在缓慢移动
```

```
Given 粒子动画正在运行
When 浏览器窗口尺寸发生变化
Then Canvas 尺寸自动适应新的窗口尺寸
```

#### F09 滚动动画

**用户故事**: As a visitor, I want to see smooth entrance animations as I scroll through the page, so that the browsing experience feels polished and engaging.

**详细描述**:
- 各内容区块在首次滚动进入视口时播放入场动画
- 动画类型：淡入 + 从下方上移（fade-in-up）
- 使用 Intersection Observer API 检测元素进入视口
- 动画只播放一次，不重复
- 动画时长约 600ms，使用 ease-out 缓动

**验收标准**:

```
Given 页面已加载，内容区块在视口下方
When 用户向下滚动使某个区块进入视口
Then 该区块播放淡入上移动画
And 动画播放完成后元素保持可见状态
```

```
Given 某区块的入场动画已播放过
When 用户再次滚动使该区块离开并重新进入视口
Then 该区块保持可见状态，动画不再重复播放
```

#### F10 响应式布局

**用户故事**: As a mobile user, I want the page to adapt to my screen size, so that I can comfortably browse the content on my phone.

**详细描述**:
- 断点设计：移动端 < 768px，桌面端 >= 768px
- 导航栏在移动端收起为汉堡菜单按钮
- 卡片网格在移动端转为单列
- 文字大小在移动端适当缩小
- CTA 按钮在移动端全宽显示

**验收标准**:

```
Given 视口宽度 < 768px
When 用户查看导航栏
Then 导航链接隐藏，显示汉堡菜单按钮
```

```
Given 视口宽度 < 768px 且汉堡菜单按钮可见
When 用户点击汉堡菜单按钮
Then 展开移动端导航菜单，显示所有导航链接
```

```
Given 移动端导航菜单已展开
When 用户点击某个导航链接
Then 菜单收起，页面滚动到对应区域
```

```
Given 视口宽度 < 768px
When 用户查看核心能力展示区
Then 能力卡片以单列垂直排列
```

```
Given 视口宽度 >= 768px
When 用户查看核心能力展示区
Then 能力卡片以多列 grid 布局排列
```

## 4. 非功能需求

### 性能要求

| 指标 | 要求 |
|------|------|
| 首屏加载时间（FCP） | < 1.5s |
| 粒子动画帧率 | >= 30fps |
| Lighthouse Performance 评分 | >= 80 |
| 总打包体积 | < 500KB (gzip) |

### 兼容性要求

| 维度 | 要求 |
|------|------|
| 浏览器 | Chrome >= 90, Firefox >= 90, Safari >= 15, Edge >= 90 |
| 设备 | 桌面端、平板、手机 |
| 最小视口宽度 | 375px |

### 技术约束

- 样式方案：Tailwind CSS utility class only，禁止 CSS Modules / styled-components
- 包管理：pnpm
- 构建工具：Vite
- 语言：TypeScript（strict mode）
- 无第三方动画库依赖，粒子效果使用原生 Canvas API 实现
- 无需后端 API 调用，所有数据为静态写死

## 5. 页面/视图清单

本项目为单页应用（SPA），仅包含一个页面，由以下区块（Section）组成：

| 区块 | 组件名称 | 核心元素 |
|------|----------|----------|
| 导航栏 | `Navbar` | Logo, 导航链接 x3, CTA 按钮, 汉堡菜单（移动端） |
| Hero 区域 | `HeroSection` | 主标题, 副标题, 2 个 CTA 按钮, Canvas 粒子背景 |
| 核心能力展示 | `FeaturesSection` | 区域标题, 4 张 `FeatureCard` 组件 |
| 工作流程展示 | `WorkflowSection` | 区域标题, 3 个 `WorkflowStep` 组件, 连接线 |
| 技术亮点 | `TechHighlightsSection` | 区域标题, 3 个优势点, 数据指标面板 |
| CTA 区域 | `CtaSection` | 标题, 副标题, CTA 按钮 |
| 页脚 | `Footer` | Logo, 链接分组, 版权信息 |

### 公共组件

| 组件 | 描述 |
|------|------|
| `ParticleCanvas` | Canvas 粒子动画组件，在 HeroSection 中使用 |
| `SectionTitle` | 区域标题组件，支持渐变文字效果 |
| `GlowButton` | 带发光效果的按钮组件 |
| `useScrollAnimation` | 滚动入场动画 Hook（基于 Intersection Observer） |
| `useCountUp` | 数字计数动画 Hook |

## 6. 数据模型概要

本项目为纯前端静态页面，无后端数据库。所有数据以 TypeScript 常量形式定义。

### 核心数据结构

```typescript
// 能力卡片数据
interface Feature {
  icon: string;       // 图标标识（使用 emoji 或 SVG）
  title: string;      // 标题
  description: string; // 描述
}

// 工作流程步骤数据
interface WorkflowStep {
  step: number;       // 步骤编号
  title: string;      // 标题
  description: string; // 描述
}

// 技术优势数据
interface TechAdvantage {
  title: string;      // 标题
  description: string; // 描述
}

// 数据指标
interface Metric {
  label: string;      // 指标名称
  value: number;      // 目标数值
  suffix: string;     // 后缀（如 "ms", "%", "K+", "+"）
  prefix?: string;    // 前缀（如 "<"）
}

// 导航链接
interface NavLink {
  label: string;      // 显示文字
  href: string;       // 锚点链接（如 "#features"）
}

// 页脚链接分组
interface FooterGroup {
  title: string;      // 分组标题
  links: { label: string; href: string }[];
}
```

## 7. 里程碑

### MVP (v1.0) - 核心页面交付

**范围**: F01 - F08（Hero、导航栏、核心能力、工作流程、CTA、页脚、粒子动画、技术亮点区）

**交付物**:
- 完整的单页 Landing Page
- 所有区块内容和样式
- 粒子动画背景效果
- 基础悬停交互

### v1.1 - 动画增强

**范围**: F09（滚动动画）

**交付物**:
- 各区块滚动入场动画
- 数字计数动画
- 流畅的滚动体验

### v1.2 - 响应式适配

**范围**: F10（响应式布局）

**交付物**:
- 移动端汉堡菜单
- 全断点响应式适配
- 移动端触控优化

## Changelog

| 版本 | 日期 | 变更说明 | 变更人 |
|------|------|----------|--------|
| v1.0 | 2026-04-08 | 初始版本，完成全部需求分析和 PRD 撰写 | product-manager |
