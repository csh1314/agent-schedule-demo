# 产品需求文档 (PRD)

## 1. 项目概述

- **项目名称**: Todo List 动画增强
- **一句话描述**: 为现有 Todo List 应用注入丰富、炫酷的动画效果，提升视觉吸引力与交互体验
- **目标用户**: 追求高品质交互体验的个人效率管理用户

## 2. 需求背景

### 用户痛点

当前 Todo List 应用功能完备（增删改查、筛选、计数、本地持久化），但所有交互均为瞬时状态切换，缺少视觉过渡与反馈动画，导致：

1. 添加/删除事项时无动画过渡，状态变化突兀，用户缺乏操作确认感
2. 完成事项时无庆祝反馈，无法给用户带来成就感
3. 页面静态无生命力，缺少吸引力和品质感
4. 筛选切换时列表直接替换，无法感知数据变化的逻辑关系

### 解决方案概述

引入 **framer-motion** 动画库，在不改变现有业务逻辑的前提下，为以下交互节点添加动画效果：

- 页面入场 / 容器载入动画
- Todo 项的增删、完成状态切换动画
- 列表重排与筛选过渡动画
- 输入框与按钮的微交互动画
- 完成事项时的粒子/纸屑庆祝特效
- 空状态提示的呼吸动画
- 渐变流光背景动画

## 3. 功能需求

### 3.1 核心功能

| 编号 | 功能名称 | 描述 | 优先级 |
|------|----------|------|--------|
| F1 | 页面入场动画 | 应用首次加载时，标题、卡片容器、各子组件依次渐入并上移，营造层次感 | P0 |
| F2 | 添加 Todo 动画 | 新 Todo 项从上方滑入并展开，同时伴随轻微弹性效果 | P0 |
| F3 | 删除 Todo 动画 | Todo 项向右滑出并收缩高度后消失，伴随透明度渐隐 | P0 |
| F4 | 完成状态切换动画 | 勾选时文字划线动画从左到右渐进展开，文字颜色柔和过渡；取消勾选时反向恢复 | P0 |
| F5 | 列表重排动画 | 筛选切换或列表项增删引起的排序变化时，各项平滑滑动到新位置（layout animation） | P0 |
| F6 | 完成庆祝特效 | 勾选完成时在 checkbox 附近触发一次粒子/纸屑/星星迸发特效 | P1 |
| F7 | 添加按钮微交互 | 按钮 hover 时轻微放大并加深阴影，点击时弹性缩放反馈 | P1 |
| F8 | 输入框聚焦动画 | 输入框聚焦时边框渐变发光效果，光晕颜色柔和脉动 | P1 |
| F9 | 筛选按钮切换动画 | 当前激活筛选项底部有滑动指示条（sliding indicator），切换时指示条平滑滑动到目标位置 | P1 |
| F10 | 计数器数字滚动 | 待完成数量变化时数字以滚动方式过渡（类似老虎机翻牌效果） | P1 |
| F11 | 空状态动画 | 列表为空时显示的提示文字带有呼吸式脉动动画 | P2 |
| F12 | 渐变流光背景 | 页面背景使用缓慢流动的渐变色动画，增加视觉层次感 | P2 |
| F13 | Checkbox 勾选动画 | 自定义 checkbox，勾选时 checkmark 以描线动画绘入，取消时反向擦除 | P1 |

### 3.2 功能详情

#### F1: 页面入场动画

**用户故事**: As a 用户, I want 打开应用时看到元素优雅地渐入, So that 感受到应用的精致与品质

**验收标准**:
- Given 用户首次加载页面, When 页面完成渲染, Then 标题先淡入并从上方下移（duration 0.6s），卡片容器随后淡入并上移（delay 0.2s, duration 0.5s），卡片内各组件依次入场（stagger 0.1s）
- Given 动画正在播放, When 用户开始交互, Then 动画不阻塞用户操作

#### F2: 添加 Todo 动画

**用户故事**: As a 用户, I want 新添加的待办事项以动画方式出现, So that 我能清楚地感知到新项目已成功添加

**验收标准**:
- Given 用户输入文本并提交, When 新 Todo 项被添加到列表, Then 新项从初始状态（opacity: 0, height: 0, y: -20px）过渡到最终状态（opacity: 1, height: auto, y: 0），使用 spring 弹性动画（stiffness: 300, damping: 24），duration 约 0.4s
- Given 快速连续添加多个 Todo, When 每个 Todo 被添加, Then 每个 Todo 独立播放入场动画，互不干扰

#### F3: 删除 Todo 动画

**用户故事**: As a 用户, I want 删除待办事项时看到它消失的过程, So that 我确认该项已被移除

**验收标准**:
- Given 用户点击删除按钮, When Todo 项被移除, Then 该项向右滑出（x: 60px）同时透明度降为 0，随后高度收缩为 0，总 duration 约 0.3s
- Given 删除动画播放中, When 动画完成, Then DOM 节点被移除，列表其余项平滑上移填补空间

#### F4: 完成状态切换动画

**用户故事**: As a 用户, I want 标记完成时看到文字被划线的渐进效果, So that 获得完成任务的视觉满足感

**验收标准**:
- Given 用户勾选某个 Todo, When completed 状态变为 true, Then 删除线从左到右渐进展开（duration 0.3s），文字颜色从 gray-700 平滑过渡到 gray-400
- Given 用户取消勾选某个 Todo, When completed 状态变为 false, Then 删除线从右到左收回，文字颜色恢复为 gray-700

#### F5: 列表重排动画

**用户故事**: As a 用户, I want 切换筛选时列表平滑过渡, So that 我能理解数据的变化关系

**验收标准**:
- Given 当前显示"全部"筛选, When 用户切换到"未完成"筛选, Then 已完成的项淡出并收缩，未完成的项平滑滑动到新位置，整体过渡流畅
- Given 列表中有多个 Todo, When 某一项被删除或添加, Then 其余各项以 layout animation 平滑移动到新位置（duration 0.3s）

#### F6: 完成庆祝特效

**用户故事**: As a 用户, I want 完成一项待办时看到小型庆祝特效, So that 获得成就感和愉悦的情感反馈

**验收标准**:
- Given 用户勾选某个 Todo 为完成, When checkbox 被勾选, Then 在 checkbox 位置触发一次粒子迸发特效（6-10 个小粒子/星星向外扩散并消失），特效 duration 约 0.6s
- Given 用户取消勾选, When completed 变为 false, Then 不触发庆祝特效
- Given 特效播放, When 特效动画完成, Then 粒子元素从 DOM 移除，不残留

#### F7: 添加按钮微交互

**用户故事**: As a 用户, I want 按钮有触感反馈, So that 交互更有手感和确认感

**验收标准**:
- Given 用户鼠标悬停在"添加"按钮上, When hover 状态激活, Then 按钮放大至 scale(1.05) 并增加阴影，过渡 duration 0.2s
- Given 用户点击"添加"按钮, When mousedown 触发, Then 按钮缩小至 scale(0.95)，释放后恢复至 scale(1)，形成弹性按压效果

#### F8: 输入框聚焦动画

**用户故事**: As a 用户, I want 输入框聚焦时有发光效果, So that 清晰感知当前焦点位置

**验收标准**:
- Given 用户点击输入框, When input 获得焦点, Then 输入框边框过渡为渐变色（蓝→紫），并出现柔和的外发光（box-shadow glow），发光效果轻微脉动
- Given 用户点击输入框外部, When input 失去焦点, Then 发光效果淡出，边框恢复默认样式，过渡 duration 0.3s

#### F9: 筛选按钮切换动画

**用户故事**: As a 用户, I want 筛选切换时有滑动指示器, So that 清晰感知当前所处的筛选模式

**验收标准**:
- Given 当前选中"全部"筛选, When 用户点击"未完成", Then 底部指示条从"全部"位置平滑滑动到"未完成"位置（duration 0.3s, ease spring）
- Given 筛选按钮组渲染完成, When 观察指示条位置, Then 指示条宽度与当前激活按钮宽度一致，位置精确对齐

#### F10: 计数器数字滚动

**用户故事**: As a 用户, I want 待完成数量变化时有数字滚动效果, So that 变化更直观

**验收标准**:
- Given 当前显示"3 项待完成", When 用户完成一项 Todo, Then 数字"3"以向上滚出动画消失，数字"2"从下方滚入，duration 约 0.3s
- Given 数字变化, When 新旧数字相同, Then 不触发滚动动画

#### F11: 空状态动画

**用户故事**: As a 用户, I want 空列表提示有生命力, So that 空白页面不会显得死板

**验收标准**:
- Given 筛选后列表为空, When 空状态提示文字显示, Then 文字以淡入方式出现（duration 0.4s），随后持续进行轻微的呼吸式脉动（opacity 在 0.5-1 之间循环，周期 2s）
- Given 列表从空变为有内容, When 空状态消失, Then 文字以淡出方式退出（duration 0.3s）

#### F12: 渐变流光背景

**用户故事**: As a 用户, I want 页面背景有流动感, So that 整体视觉更有层次和活力

**验收标准**:
- Given 页面加载完成, When 观察背景, Then 背景呈现缓慢流动的渐变色（如蓝紫渐变缓慢偏移），动画周期约 8-10s，无限循环
- Given 动画持续运行, When 检测 CPU 使用, Then 背景动画使用 CSS animation 实现（非 JS），不造成明显性能开销

#### F13: Checkbox 勾选动画

**用户故事**: As a 用户, I want checkbox 勾选时有描线绘入效果, So that 勾选动作更有仪式感

**验收标准**:
- Given 用户点击 checkbox, When checked 状态变为 true, Then 自定义的 checkmark 以 SVG stroke-dashoffset 动画方式从起点描绘到终点（duration 0.3s）
- Given 用户再次点击 checkbox, When checked 状态变为 false, Then checkmark 以反向动画擦除

## 4. 非功能需求

### 性能要求

- 所有动画的帧率不低于 55fps（目标 60fps），优先使用 GPU 加速属性（transform, opacity）
- 添加 framer-motion 后，打包体积增量不超过 50KB (gzipped)
- 首屏加载时间增加不超过 100ms
- 粒子特效不得导致内存泄漏，特效完成后必须清理 DOM 节点

### 可访问性要求

- 尊重用户系统级 `prefers-reduced-motion` 设置：当启用减少动画时，所有动画降级为简单的 opacity 淡入淡出或直接跳过
- 动画不得干扰屏幕阅读器（aria-live 区域的内容更新不受动画延迟影响）

### 兼容性要求

- 支持 Chrome、Firefox、Safari、Edge 最近两个主要版本
- 移动端 Safari (iOS 15+) 和 Chrome (Android) 正常运行
- 触屏设备上 hover 动画自动降级为 active 状态反馈

### 技术约束

- 动画库使用 **framer-motion**（React 生态主流方案，与现有 React 18 技术栈兼容）
- 背景渐变动画使用纯 CSS animation（Tailwind CSS 自定义动画），不依赖 JS
- 样式方案继续使用 Tailwind CSS，不引入其他 CSS 方案
- 不改变现有组件的 props 接口和业务逻辑，动画作为"装饰层"叠加

## 5. 页面/视图清单

本次需求不新增页面，仅在现有单页应用基础上增强动画。涉及变更的视图区域：

| 区域 | 对应组件 | 动画增强点 |
|------|----------|------------|
| 页面背景 | TodoApp 外层 | F12 渐变流光背景 |
| 页面标题 | TodoApp h1 | F1 入场动画 |
| 卡片容器 | TodoApp 白色卡片 | F1 入场动画 |
| 输入区域 | TodoInput | F1 入场、F7 按钮微交互、F8 聚焦发光 |
| 列表容器 | TodoList | F5 列表重排、F11 空状态动画 |
| 列表项 | TodoItem | F2 添加、F3 删除、F4 完成状态、F6 庆祝特效、F13 Checkbox 动画 |
| 筛选栏 | TodoFilter | F1 入场、F9 滑动指示器 |
| 计数器 | TodoCounter | F1 入场、F10 数字滚动 |

## 6. 数据模型概要

本次需求不变更数据模型。现有 Todo 实体保持不变：

```typescript
interface Todo {
  id: string;          // 唯一标识
  text: string;        // 待办内容
  completed: boolean;  // 完成状态
  createdAt: number;   // 创建时间戳
}

type FilterStatus = 'all' | 'active' | 'completed';
```

动画状态为纯 UI 层面的瞬时状态，由 framer-motion 内部管理，不引入额外的持久化数据。

## 7. 里程碑

### MVP（Phase 1）— P0 功能

包含 F1-F5，覆盖核心交互场景的动画效果：

- 页面入场动画
- 添加/删除 Todo 动画
- 完成状态切换动画
- 列表重排动画

交付物：所有 P0 功能通过验收标准，framer-motion 集成完成，`prefers-reduced-motion` 降级就绪。

### Phase 2 — P1 功能

包含 F6-F10、F13，增加微交互和情感化设计：

- 完成庆祝粒子特效
- 按钮/输入框微交互
- 筛选滑动指示器
- 计数器数字滚动
- Checkbox 描线动画

### Phase 3 — P2 功能

包含 F11-F12，氛围层动画：

- 空状态呼吸动画
- 渐变流光背景

## Changelog

| 版本 | 日期 | 变更说明 | 变更人 |
|------|------|----------|--------|
| v1.0 | 2026-04-09 | 初始版本：Todo List 动画增强 PRD，含 13 项功能需求 | product-manager |
