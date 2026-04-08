import { cn } from "@/lib/utils";
import { GlowButton } from "@/components/ui/GlowButton";
import { ParticleCanvas } from "@/components/ui/ParticleCanvas";

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className }: HeroSectionProps) {
  const handleScrollToFeatures = () => {
    const el = document.querySelector("#features");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className={cn(
        "relative flex min-h-screen items-center justify-center overflow-hidden",
        "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950",
        className
      )}
    >
      {/* Particle background */}
      <ParticleCanvas />

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(88,28,135,0.15),transparent_70%)]" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-7xl">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            下一代 AI Agent
          </span>
          <br />
          <span className="text-white">智能协作平台</span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400 md:text-xl">
          释放 AI Agent 的无限潜能，让多个智能体协同工作，自动化完成复杂任务
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <GlowButton variant="primary" size="lg" className="w-full sm:w-auto">
            开始体验
          </GlowButton>
          <GlowButton
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            onClick={handleScrollToFeatures}
          >
            了解更多
          </GlowButton>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
    </section>
  );
}
