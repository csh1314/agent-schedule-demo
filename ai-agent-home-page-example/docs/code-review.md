# 代码审查报告

## 审查概要
- 审查时间: 2026-04-08
- 审查范围: 21 个文件（`src/` 目录下全部源码）
- 问题统计: 2 critical / 5 warning / 5 info

## 问题清单

### Critical（必须修复）

| # | 文件 | 行号 | 类别 | 描述 | 修复建议 |
|---|------|------|------|------|----------|
| 1 | `src/components/sections/TechHighlightsSection.tsx` | 22-25 | 编码规范/逻辑缺陷 | `MetricItem` 中小数指标显示逻辑有误。当 `target=99.9` 时，`useCountUp` 内部 `Math.floor(eased * 99.9)` 会在动画过程中产出整数（0~99），而 `displayValue` 的计算 `count + (enabled ? 0.9 : 0)` 在动画中间帧会得到类似 `50.9`、`75.9` 这样不合理的跳跃值，最终帧虽然正确（`99 + 0.9 = 99.9`），但动画过程中的过渡值不自然。 | 将小数处理移入 `useCountUp`，使其原生支持浮点 target，或在 `MetricItem` 中用 `(eased * target).toFixed(1)` 的方式计算。修复示例见下方。 |
| 2 | `src/components/ui/ParticleCanvas.tsx` | 39-44 | 性能风险/内存泄漏 | `handleResize` 在每次触发时调用 `initParticles` 重新创建全部粒子数组，但未做 debounce/throttle。用户拖拽调整浏览器窗口时会在极短时间内高频触发 resize 事件，导致大量数组创建和 GC 压力。同时 canvas 未处理 `devicePixelRatio`，在高清屏上渲染模糊。 | 1) 对 `handleResize` 添加 debounce（200ms）；2) 使用 `devicePixelRatio` 缩放 canvas。修复示例见下方。 |

**Critical #1 修复示例** -- `TechHighlightsSection.tsx` MetricItem 小数显示：

```tsx
function MetricItem({
  metric,
  enabled,
}: {
  metric: Metric;
  enabled: boolean;
}) {
  const count = useCountUp({
    target: metric.value,
    duration: 2000,
    enabled,
  });

  // 统一使用整数部分的 count，小数由 target 本身决定精度
  const hasDecimal = metric.value % 1 !== 0;
  const decimalPlaces = hasDecimal
    ? metric.value.toString().split(".")[1]?.length ?? 0
    : 0;

  // useCountUp 返回的是 Math.floor 后的整数，需要按比例映射回带小数的值
  const displayValue = hasDecimal
    ? ((count / Math.floor(metric.value)) * metric.value).toFixed(decimalPlaces)
    : count;

  return (
    <div className="text-center">
      <div className="mb-1 text-3xl font-bold md:text-4xl">
        <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          {metric.prefix}
          {displayValue}
          {metric.suffix}
        </span>
      </div>
      <div className="text-sm text-slate-400">{metric.label}</div>
    </div>
  );
}
```

或者更优方案 -- 修改 `useCountUp` 使其直接支持浮点数：

```ts
// hooks/useCountUp.ts
export function useCountUp({
  target,
  duration = 2000,
  enabled = true,
}: UseCountUpOptions) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setCount(0);
      return;
    }

    let startTime: number | null = null;
    let animationFrameId: number;
    const isFloat = target % 1 !== 0;
    const decimalPlaces = isFloat
      ? (target.toString().split(".")[1]?.length ?? 0)
      : 0;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      const raw = eased * target;
      setCount(isFloat ? parseFloat(raw.toFixed(decimalPlaces)) : Math.floor(raw));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, duration, enabled]);

  return count;
}
```

**Critical #2 修复示例** -- `ParticleCanvas.tsx` resize debounce + devicePixelRatio：

```tsx
useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let resizeTimer: ReturnType<typeof setTimeout>;

  const applySize = () => {
    const parent = canvas.parentElement;
    if (!parent) return;
    const dpr = window.devicePixelRatio || 1;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
    initParticles(width, height);
  };

  const handleResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(applySize, 200);
  };

  applySize();
  // ... animate function stays the same, but use canvas.width/dpr, canvas.height/dpr
  // for particle boundary checks

  window.addEventListener("resize", handleResize);

  return () => {
    cancelAnimationFrame(animationRef.current);
    clearTimeout(resizeTimer);
    window.removeEventListener("resize", handleResize);
  };
}, [particleCount, connectionDistance, initParticles]);
```

### Warning（建议修复）

| # | 文件 | 行号 | 类别 | 描述 | 修复建议 |
|---|------|------|------|------|----------|
| 1 | `src/components/ui/ParticleCanvas.tsx` | 72-88 | 性能风险 | 粒子连线绘制使用双重循环 `O(n^2)` 复杂度。当 `particleCount=65` 时每帧需计算 `65*64/2=2080` 次距离。虽然当前数量可接受，但如果 count 增大会导致帧率下降。 | 考虑使用空间分区（grid hashing）优化，或在粒子数超过阈值时跳过连线绘制。 |
| 2 | `src/components/ui/ParticleCanvas.tsx` | 67 | 编码规范 | 粒子颜色 `rgba(147, 130, 255, ...)` 硬编码在组件内部，与 `PARTICLE_CONFIG.color` 常量不一致（常量定义了 `color` 字段但未被使用）。连线颜色 `rgba(120, 140, 255, ...)` 也是硬编码。 | 从 `PARTICLE_CONFIG.color` 读取颜色值，或提取为 props，保持数据源单一。 |
| 3 | `src/components/sections/Navbar.tsx` | 22-26 | 安全/健壮性 | `handleNavClick` 中 `document.querySelector(href)` 接受的 `href` 来自静态常量，目前安全。但若未来数据源变化（如来自 CMS），则存在 CSS 选择器注入风险。 | 建议增加 `href` 格式校验（如 `href.startsWith('#')`），或使用 `document.getElementById(href.slice(1))` 替代。 |
| 4 | `src/App.tsx` | 11 | 编码规范 | `App` 使用 `export default`，而项目架构文档规定"使用命名导出（named export），不使用默认导出"。 | 改为 `export function App()` 并更新 `main.tsx` 中的导入。 |
| 5 | `src/hooks/useCountUp.ts` | 32 | 编码规范 | `Math.floor(eased * target)` 当 target 为小数（如 99.9）时，`useCountUp` 返回整数序列 0~99，丢失小数精度。Hook 的接口设计未考虑浮点 target 场景。 | 见 Critical #1 的修复方案，使 hook 原生支持浮点数。 |

### Info（优化建议）

| # | 文件 | 行号 | 类别 | 描述 | 修复建议 |
|---|------|------|------|------|----------|
| 1 | `src/components/ui/GlowButton.tsx` | 47 | 性能/可维护性 | `variant === "primary"` 时的 glow span 使用了 `group-hover:opacity-50`，但按钮本身未添加 `group` class，该 hover 效果实际不会触发。 | 在 `<button>` 的 className 中添加 `group`，或将 `group-hover` 改为 `hover` 并使用兄弟选择器。 |
| 2 | `src/components/sections/Footer.tsx` | 56 | 编码规范 | 版权声明中 `Copyright 2026` 缺少 `(c)` 符号，且年份硬编码。 | 使用 `new Date().getFullYear()` 动态获取年份，或写为 `(c) 2026`。 |
| 3 | 架构文档 vs 实际代码 | - | 代码异味 | 架构文档中定义了 `useScrollPosition` hook，但实际代码中不存在该文件。`Navbar` 组件内联实现了 scroll position 检测逻辑，未抽取为独立 hook。 | 将 Navbar 中的 scroll 逻辑提取为 `useScrollPosition` hook，与架构文档保持一致。 |
| 4 | `src/types/index.ts` vs `docs/architecture.md` | 27-28 | 编码规范 | `TechAdvantage` 接口在架构文档中没有 `icon` 字段，但实际类型定义和数据中都有 `icon` 字段。文档与代码不一致。 | 更新架构文档中的类型定义，补充 `icon` 字段。 |
| 5 | `src/components/sections/TechHighlightsSection.tsx` | 8-39 | 代码异味 | `MetricItem` 作为内部组件定义在同一文件中，且每次父组件重渲染时都会创建新的组件引用（虽然在模块作用域无此问题，但如果未来移入渲染函数内部则会导致问题）。目前可接受，但建议考虑拆分为独立文件。 | 可将 `MetricItem` 提取到 `src/components/ui/MetricItem.tsx`，保持组件文件职责单一。 |

## 规范符合度

| 维度 | 评分 | 说明 |
|------|------|------|
| 安全性 | ★★★★☆ | 纯前端静态应用，无敏感数据泄露、无 XSS（无 dangerouslySetInnerHTML）、无注入风险。CSS 选择器注入为低风险项。 |
| TypeScript 严格性 | ★★★★★ | 全部文件使用 TypeScript，无 `any` 类型，接口定义完整，props 类型明确，`type` 导入使用规范。 |
| Tailwind CSS 合规性 | ★★★★★ | 严格遵循 Tailwind CSS only 约束。`index.css` 仅有 `@import "tailwindcss"`，所有样式通过 utility class 实现，未使用 CSS Modules 或其他模块化 CSS 方案。 |
| React 最佳实践 | ★★★★☆ | Hook 依赖数组正确，事件监听器清理到位，`requestAnimationFrame` 有对应 `cancelAnimationFrame`。`useScrollAnimation` 在元素可见后正确 unobserve。扣分项：App 使用 default export、GlowButton 的 group hover 失效。 |
| 代码可维护性 | ★★★★☆ | 组件职责清晰，数据与视图分离良好，命名规范一致。扣分项：架构文档与实际代码存在偏差（`useScrollPosition` 缺失、`TechAdvantage.icon` 未文档化）、`ParticleCanvas` 中颜色硬编码。 |

## Changelog

| 版本 | 日期 | 变更说明 | 变更人 |
|------|------|----------|--------|
| v1.0 | 2026-04-08 | 初始版本，完成全量代码审查 | code-reviewer |
