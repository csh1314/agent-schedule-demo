import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes } from "react";

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
  size?: "default" | "lg";
  pulse?: boolean;
  className?: string;
}

export function GlowButton({
  variant = "primary",
  size = "default",
  pulse = false,
  className,
  children,
  ...props
}: GlowButtonProps) {
  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 cursor-pointer",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
        size === "default" && "px-6 py-3 text-sm",
        size === "lg" && "px-8 py-4 text-lg",
        variant === "primary" && [
          "bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white",
          "hover:from-blue-500 hover:via-purple-500 hover:to-cyan-500",
          "hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]",
          "hover:scale-105",
          "active:scale-95",
        ],
        variant === "outline" && [
          "border border-purple-500/50 text-purple-300 bg-transparent",
          "hover:border-purple-400 hover:text-white",
          "hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]",
          "hover:bg-purple-500/10",
          "hover:scale-105",
          "active:scale-95",
        ],
        pulse && "animate-pulse",
        className
      )}
      {...props}
    >
      {variant === "primary" && (
        <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-50" />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
