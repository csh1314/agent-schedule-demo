# Multi-Agent 调度系统

基于 Claude Code sub-agent 机制的多 Agent 协作调度系统。用户输入项目需求后，按 Pipeline 自动编排 8 个专业 Agent 协作完成开发。

## 调度协议

当用户输入项目需求时：

1. 读取 `pipeline/pipeline.yaml` 获取阶段定义和依赖关系
2. 读取 `pipeline/prompts.md` 获取每个阶段的 Agent 调度 prompt
3. 按 phase 顺序执行，`parallel: true` 的阶段使用同一 message 中多个 Agent tool 并发调用
4. 每个 `review: true` 的阶段完成后，调度 `project-manager` agent 评审
5. 评审 NEEDS_REVISION 时重新调度对应 Agent（最多重试 1 次）
6. 全部完成后向用户汇报产出清单和关键指标

Agent 调用时使用 `subagent_type: "general-purpose"` 并在 prompt 中指定角色。唯一例外是 `code-reviewer`，使用 `.claude/agents/code-reviewer.md` 配置文件实现只读权限隔离（tools 仅含 Glob, Grep, Read）。

## 开发原则

- **TDD 驱动**: Red → Green → Refactor。测试先于实现，开发者以通过测试为目标编写代码
- **架构模式自适应**: tech-architect 在 Phase 2 判断架构模式（A 一体化全栈 / B 前后端分离 / C 纯前端），写入 `docs/architecture.md` 第一章，后续 Agent 据此调整工作方式
- **包管理**: 使用 pnpm。所有 Agent 执行安装/运行命令时使用 `pnpm` 而非 npm/yarn（如 `pnpm install`、`pnpm run dev`、`pnpm exec vitest`）
- **样式方案**: Tailwind CSS first。所有 UI 组件使用 Tailwind utility class，不使用 CSS Modules、styled-components 等其他 CSS 模块化方案

## Artifact 传递

Agent 之间通过文件系统传递 artifact：

| Artifact | 路径 | 生产者 | 消费者 |
|----------|------|--------|--------|
| PRD | `docs/prd.md` | product-manager | 所有 Agent |
| 架构文档 | `docs/architecture.md` | tech-architect | frontend-expert, backend-architect, test-expert |
| UI 组件 | `src/components/` | ui-designer | frontend-expert |
| API 设计 | `docs/api-design.md` | backend-architect | frontend-expert, test-expert |
| 前端代码 | `src/` | frontend-expert | test-expert |
| 测试文件 | `tests/` | test-expert | frontend-expert, project-manager |
| 代码审查 | `docs/code-review.md` | code-reviewer | project-manager |
| 进度报告 | `docs/progress-report.md` | project-manager | 用户 |

## 变更追踪

所有文档类 artifact（`docs/*.md`）末尾必须维护 Changelog 表格：

```markdown
## Changelog
| 版本 | 日期 | 变更说明 | 变更人 |
|------|------|----------|--------|
| v1.0 | YYYY-MM-DD | 初始版本 | agent-name |
```

- 初次 v1.0，小改递增小版本，大改递增大版本，倒序排列
- 修改已有文档前必须先读取现有内容，在其基础上修改
