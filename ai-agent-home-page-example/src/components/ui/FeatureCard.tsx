import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group relative rounded-xl p-6 md:p-8",
        "bg-slate-800/50 backdrop-blur-sm",
        "border border-slate-700/50",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-2",
        "hover:border-purple-500/50",
        "hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]",
        className
      )}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-600/5 via-transparent to-cyan-600/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20 text-2xl">
          {icon}
        </div>
        <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
        <p className="text-sm leading-relaxed text-slate-400">{description}</p>
      </div>
    </div>
  );
}
