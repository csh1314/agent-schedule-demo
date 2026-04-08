import { cn } from "@/lib/utils";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useCountUp } from "@/hooks/useCountUp";
import { TECH_ADVANTAGES, METRICS } from "@/data/constants";
import type { Metric } from "@/types";

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

  // Format with same decimal precision as target
  const decimals = String(metric.value).split(".")[1]?.length ?? 0;
  const displayValue = decimals > 0 ? count.toFixed(decimals) : count;

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

interface TechHighlightsSectionProps {
  className?: string;
}

export function TechHighlightsSection({ className }: TechHighlightsSectionProps) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      id="tech-highlights"
      className={cn("relative py-24 md:py-32", "bg-slate-950", className)}
    >
      <div
        ref={ref}
        className={cn(
          "mx-auto max-w-6xl px-4 md:px-6 transition-all duration-700 ease-out",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        )}
      >
        <SectionTitle
          title="技术亮点"
          subtitle="行业领先的技术架构，为你的业务保驾护航"
        />

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
          {/* Left: Tech advantages */}
          <div className="flex flex-col gap-8">
            {TECH_ADVANTAGES.map((adv) => (
              <div key={adv.title} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20 text-2xl">
                  {adv.icon}
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-semibold text-white">
                    {adv.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-400">
                    {adv.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Metrics panel */}
          <div className="relative rounded-2xl border border-slate-700/50 bg-slate-800/30 p-8 backdrop-blur-sm">
            {/* Subtle glow */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-50" />

            <div className="relative z-10 grid grid-cols-2 gap-8">
              {METRICS.map((metric) => (
                <MetricItem
                  key={metric.label}
                  metric={metric}
                  enabled={isVisible}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
