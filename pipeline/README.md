# Pipeline 调度框架

## 概述

`pipeline.yaml` 定义了多 Agent 协作的执行流程。Claude Code 读取此配置后，按阶段（Phase）依次调度对应的 sub-agent 完成任务。

## 配置格式

```yaml
name: pipeline-name
description: 流程描述

phases:
  - id: unique-phase-id        # 阶段唯一标识
    label: "显示名称"            # 用于日志和报告
    agents: [agent-1, agent-2]  # 要调度的 Agent 列表
    parallel: true|false        # 是否并行执行
    depends_on: [phase-id]      # 依赖的前置阶段
    produces: [path/to/output]  # 产出文件/目录
    review: true|false          # 阶段完成后是否由 project-manager 评审
```

## 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `id` | 是 | 阶段唯一标识，用于 `depends_on` 引用 |
| `label` | 是 | 阶段名称，用于进度报告 |
| `agents` | 是 | 该阶段需要调度的 Agent 名称列表，对应 `.claude/agents/` 下的文件名 |
| `parallel` | 否 | 默认 `false`。为 `true` 时，`agents` 列表中的 Agent 将并发执行 |
| `depends_on` | 否 | 前置依赖阶段的 `id` 列表，所有依赖完成后才会执行当前阶段 |
| `produces` | 否 | 该阶段预期产出的文件或目录路径 |
| `review` | 否 | 默认 `false`。为 `true` 时，阶段完成后由 project-manager 评审产出质量 |

## 自定义 Pipeline

### 只跑前端流程

```yaml
name: frontend-only
description: 仅前端开发流程

phases:
  - id: requirements
    agents: [product-manager]
    produces: [docs/prd.md]

  - id: design
    agents: [ui-designer]
    depends_on: [requirements]
    produces: [src/components/]

  - id: implementation
    agents: [frontend-expert]
    depends_on: [design]
    produces: [src/]
```

### 只跑测试流程

```yaml
name: test-only
description: 仅测试流程

phases:
  - id: testing
    agents: [test-expert]
    produces: [tests/]
```

## 复用方式

1. **换项目**: 将 `.claude/agents/` 和 `pipeline/` 复制到新项目
2. **换流程**: 修改 `pipeline.yaml` 定义不同的 Agent 组合和执行顺序
3. **换 Agent**: 在 `.claude/agents/` 中新增或替换 Agent 定义，在 `pipeline.yaml` 中引用
