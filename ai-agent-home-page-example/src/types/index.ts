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
  /** 图标 */
  icon: string;
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
