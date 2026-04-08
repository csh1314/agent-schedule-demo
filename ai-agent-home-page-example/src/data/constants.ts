import type {
  Feature,
  WorkflowStep,
  TechAdvantage,
  Metric,
  NavLink,
  FooterGroup,
  ParticleConfig,
} from "@/types";

/** 导航链接列表 */
export const NAV_LINKS: NavLink[] = [
  { label: "功能特性", href: "#features" },
  { label: "工作流程", href: "#workflow" },
  { label: "技术亮点", href: "#tech-highlights" },
];

/** 核心能力卡片数据 */
export const FEATURES: Feature[] = [
  {
    icon: "\u{1F4AC}",
    title: "智能对话",
    description: "自然语言理解与多轮对话能力，让人机交互更加自然流畅",
  },
  {
    icon: "\u26A1",
    title: "任务自动化",
    description: "自动分解和执行复杂任务，显著提升工作效率与质量",
  },
  {
    icon: "\u{1F91D}",
    title: "多 Agent 协作",
    description: "多个 Agent 协同完成复杂工作流，实现 1+1>2 的协作效果",
  },
  {
    icon: "\u{1F50D}",
    title: "知识检索",
    description: "智能检索与知识库管理，快速获取精准信息",
  },
];

/** 工作流程步骤数据 */
export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step: 1,
    title: "描述需求",
    description: "用自然语言描述你的任务需求，无需复杂配置",
  },
  {
    step: 2,
    title: "Agent 规划",
    description: "AI Agent 自动分析并制定最优执行计划",
  },
  {
    step: 3,
    title: "自动执行",
    description: "多 Agent 协作执行任务并交付高质量结果",
  },
];

/** 技术优势数据 */
export const TECH_ADVANTAGES: TechAdvantage[] = [
  {
    icon: "\u{1F680}",
    title: "极速响应",
    description: "毫秒级响应延迟，流畅的实时交互体验",
  },
  {
    icon: "\u{1F512}",
    title: "安全可靠",
    description: "企业级数据加密和隐私保护",
  },
  {
    icon: "\u{1F310}",
    title: "无限扩展",
    description: "弹性架构支持海量并发",
  },
];

/** 数据指标 */
export const METRICS: Metric[] = [
  { label: "响应速度", value: 100, suffix: "ms", prefix: "<" },
  { label: "任务成功率", value: 99.9, suffix: "%" },
  { label: "已服务用户", value: 100, suffix: "K+" },
  { label: "Agent 数量", value: 50, suffix: "+" },
];

/** 页脚链接分组 */
export const FOOTER_GROUPS: FooterGroup[] = [
  {
    title: "产品",
    links: [
      { label: "功能介绍", href: "#features" },
      { label: "定价方案", href: "#" },
      { label: "更新日志", href: "#" },
    ],
  },
  {
    title: "资源",
    links: [
      { label: "开发文档", href: "#" },
      { label: "API 参考", href: "#" },
      { label: "社区论坛", href: "#" },
    ],
  },
  {
    title: "公司",
    links: [
      { label: "关于我们", href: "#" },
      { label: "加入团队", href: "#" },
      { label: "联系我们", href: "#" },
    ],
  },
];

/** 粒子动画配置参数 */
export const PARTICLE_CONFIG: ParticleConfig = {
  count: 65,
  color: "rgba(147, 130, 255, 1)",
  maxRadius: 3,
  maxSpeed: 0.5,
  linkDistance: 150,
};
