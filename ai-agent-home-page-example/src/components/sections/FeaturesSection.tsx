import { cn } from "@/lib/utils";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { FEATURES } from "@/data/constants";

interface FeaturesSectionProps {
  className?: string;
}

export function FeaturesSection({ className }: FeaturesSectionProps) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      id="features"
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
          title="核心能力"
          subtitle="强大的 AI Agent 能力矩阵，覆盖从对话到执行的全链路"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {FEATURES.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
