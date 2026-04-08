import { cn } from "@/lib/utils";
import { GlowButton } from "@/components/ui/GlowButton";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface CtaSectionProps {
  className?: string;
}

export function CtaSection({ className }: CtaSectionProps) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      className={cn(
        "relative overflow-hidden py-24 md:py-32",
        "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950",
        className
      )}
    >
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(88,28,135,0.2),transparent_70%)]" />

      <div
        ref={ref}
        className={cn(
          "relative z-10 mx-auto max-w-3xl px-4 text-center transition-all duration-700 ease-out",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        )}
      >
        <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
          准备好开启 AI Agent 之旅了吗？
        </h2>
        <p className="mb-10 text-lg text-slate-400">
          立即注册，免费体验全部核心功能
        </p>
        <GlowButton
          variant="primary"
          size="lg"
          className="w-full animate-[pulse_3s_ease-in-out_infinite] sm:w-auto"
        >
          免费开始
        </GlowButton>
      </div>
    </section>
  );
}
