# Pipeline 阶段 Prompt 模板

执行 Pipeline 时，按阶段使用以下 prompt 调度对应 Agent。

## Phase 1: 需求分析

**Agent**: `product-manager`

```
用户需求：{用户输入的需求描述}

请根据上述需求，产出完整的 PRD 文档，写入 docs/prd.md。
注意：每个功能的验收标准（Given/When/Then）将直接作为测试用例的来源，请务必详细。
```

**评审** — `project-manager`:
```
请评审 Phase 1（需求分析）的产出。
重点检查：docs/prd.md 的验收标准是否足够具体，能否直接转化为测试用例。
输出评审结论（PASS / NEEDS_REVISION）。
```

## Phase 2: 架构与 UI 设计（并行）

**Agent 1** - `tech-architect`:
```
请阅读 docs/prd.md，完成技术架构设计，输出到 docs/architecture.md。
重要：需要根据项目需求判断架构模式（A 一体化全栈 / B 前后端分离 / C 纯前端），
并在文档第一章明确标注，后续所有 Agent 将据此调整工作方式。
```

**Agent 2** - `ui-designer`:
```
请阅读 docs/prd.md，设计并产出 UI 组件原型代码，输出到 src/components/ 目录。
如果 docs/architecture.md 已生成，请遵循其技术选型和目录结构约定。
```

**评审** — `project-manager`: 评审 Phase 2 产出。

## Phase 3: 测试用例设计（TDD Red Phase）

**Agent**: `test-expert`（Red 模式）

```
请以 TDD Red Phase 模式工作。
阅读 docs/prd.md 的验收标准和 docs/architecture.md 的数据模型，
为每个核心功能编写测试骨架到 tests/ 目录。
测试应当引用尚未实现的模块路径，此时测试是"红色"（会失败）的。
每个测试用例标注对应的 PRD 验收标准编号。
```

**评审** — `project-manager`:
```
请评审 Phase 3（TDD Red Phase）的产出。
检查：测试用例是否覆盖 PRD 中所有验收标准，测试结构是否合理。
```

## Phase 4: 前后端实现（TDD Green Phase，并行）

**Agent 1** - `frontend-expert`:
```
请以 TDD Green Phase 模式工作。
先阅读 tests/ 下的测试用例，理解期望的接口和行为。
再阅读 docs/prd.md、docs/architecture.md，审查 src/components/ 下的 UI 组件。
你的目标是：实现代码使测试通过。按测试中 import 的路径创建对应模块。
完成后运行 npx vitest run 验证。
```

**Agent 2** - `backend-architect`:
```
请以 TDD Green Phase 模式工作。
先阅读 tests/ 下与数据层相关的测试用例，理解期望的接口契约。
再阅读 docs/prd.md、docs/architecture.md，设计 API 和数据存储方案。
输出 docs/api-design.md，产出代码时确保导出的接口与测试中的 import 一致。
```

**评审** — `project-manager`: 评审 Phase 4 产出。

## Phase 5: 测试验证与重构（TDD Refactor Phase）

**Agent**: `test-expert`（Refactor 模式）

```
请以 TDD Refactor Phase 模式工作。
更新 tests/ 下的测试骨架，替换 TODO 占位为真实断言。
运行 npx vitest run，分析测试结果。
补充边界用例和集成测试。
产出测试报告到 docs/test-report.md。
```

**评审** — `project-manager`: 评审 Phase 5 产出。

## Phase 6: 项目总结

**Agent**: `project-manager`

```
所有阶段已完成。请进行全局检查，产出最终项目进度报告到 docs/progress-report.md。
包含各阶段回顾、TDD 执行情况（Red→Green→Refactor 各阶段测试通过率）、
产出清单、质量总评和后续建议。
```
