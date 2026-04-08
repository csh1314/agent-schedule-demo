import { cn } from "@/lib/utils";

interface WorkflowStepCardProps {
  step: number;
  title: string;
  description: string;
  isLast?: boolean;
  className?: string;
}

export function WorkflowStepCard({
  step,
  title,
  description,
  isLast = false,
  className,
}: WorkflowStepCardProps) {
  return (
    <div className={cn("relative flex flex-col items-center text-center", className)}>
      {/* Step number circle */}
      <div className="relative mb-6">
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-30 blur-md" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-xl font-bold text-white shadow-lg shadow-purple-500/25">
          {step}
        </div>
      </div>

      {/* Content */}
      <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
      <p className="max-w-xs text-sm leading-relaxed text-slate-400">{description}</p>

      {/* Connector line (hidden on last step and mobile) */}
      {!isLast && (
        <div className="absolute left-[calc(50%+48px)] top-8 hidden h-px w-[calc(100%-96px)] md:block">
          <div className="h-full w-full bg-gradient-to-r from-purple-500/50 via-blue-500/30 to-purple-500/50" />
          {/* Arrow */}
          <div className="absolute -right-1 -top-1 h-0 w-0 border-y-[3px] border-l-[6px] border-y-transparent border-l-purple-500/50" />
        </div>
      )}
    </div>
  );
}
