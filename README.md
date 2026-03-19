# Multi-Agent Schedule Demo

基于 Claude Code sub-agent 机制的多 Agent 协作调度系统。输入需求，自动按 TDD Pipeline 编排 7 个 Agent 完成项目开发。

## 架构

```
CLAUDE.md (调度入口)
  ├── pipeline/pipeline.yaml  (阶段定义 + 依赖)
  ├── pipeline/prompts.md     (各阶段 prompt 模板)
  └── .claude/agents/*.md     (7 个 Agent 定义)
```

## Pipeline

```mermaid
graph TD
    User([用户需求]) --> P1

    subgraph "Phase 1"
        P1[product-manager]
    end

    P1 -->|docs/prd.md| R1{PM 评审}
    R1 --> P2A & P2B

    subgraph "Phase 2 · 并行"
        P2A[tech-architect]
        P2B[ui-designer]
    end

    P2A -->|docs/architecture.md| R2{PM 评审}
    P2B -->|src/components/| R2
    R2 --> P3

    subgraph "Phase 3 · TDD Red"
        P3[test-expert]
    end

    P3 -->|tests/ 骨架| R3{PM 评审}
    R3 --> P4A & P4B

    subgraph "Phase 4 · TDD Green · 并行"
        P4A[frontend-expert]
        P4B[backend-architect]
    end

    P4A -->|src/| R4{PM 评审}
    P4B -->|docs/api-design.md| R4
    R4 --> P5

    subgraph "Phase 5 · TDD Refactor"
        P5[test-expert]
    end

    P5 -->|tests/ + 报告| R5{PM 评审}
    R5 --> P6

    subgraph "Phase 6"
        P6[project-manager]
    end

    P6 -->|docs/progress-report.md| Done([交付])
```

> `PM 评审` = project-manager agent 阶段评审，NEEDS_REVISION 时重新调度（最多 1 次）

## 快速开始

```bash
# 在 Claude Code 中打开项目
cd agent-schedule-demo
claude

# 输入需求，Pipeline 自动执行
> 帮我做一个 Todo App
```

## 自定义

- **换流程**: 修改 `pipeline/pipeline.yaml`
- **换 Agent**: 增删 `.claude/agents/*.md`，在 yaml 中引用
- **换项目**: 复制 `.claude/agents/` + `pipeline/` 到新项目
