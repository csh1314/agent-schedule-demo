import { cn } from "@/lib/utils";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { WorkflowStepCard } from "@/components/ui/WorkflowStepCard";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { WORKFLOW_STEPS } from "@/data/constants";

interface WorkflowSectionProps {
  className?: string;
}

export function WorkflowSection({ className }: WorkflowSectionProps) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      id="workflow"
      className={cn(
        "relative py-24 md:py-32",
        "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950",
        className
      )}
    >
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div
        ref={ref}
        className={cn(
          "relative z-10 mx-auto max-w-5xl px-4 md:px-6 transition-all duration-700 ease-out",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        )}
      >
        <SectionTitle
          title="工作流程"
          subtitle="三步开启智能化工作方式"
        />

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
          {WORKFLOW_STEPS.map((step, index) => (
            <WorkflowStepCard
              key={step.step}
              step={step.step}
              title={step.title}
              description={step.description}
              isLast={index === WORKFLOW_STEPS.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
