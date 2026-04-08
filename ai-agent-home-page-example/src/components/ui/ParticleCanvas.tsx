import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { PARTICLE_CONFIG } from "@/data/constants";
import type { Particle } from "@/types";

interface ParticleCanvasProps {
  className?: string;
  particleCount?: number;
  connectionDistance?: number;
}

export function ParticleCanvas({
  className,
  particleCount = PARTICLE_CONFIG.count,
  connectionDistance = PARTICLE_CONFIG.linkDistance,
}: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  const initParticles = useCallback((width: number, height: number) => {
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * PARTICLE_CONFIG.maxSpeed,
      vy: (Math.random() - 0.5) * PARTICLE_CONFIG.maxSpeed,
      radius: Math.random() * PARTICLE_CONFIG.maxRadius + 1,
      opacity: Math.random() * 0.5 + 0.3,
    }));
  }, [particleCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let resizeTimer: ReturnType<typeof setTimeout>;

    const applyResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = window.devicePixelRatio || 1;
      const width = parent.clientWidth;
      const height = parent.clientHeight;

      // Set canvas buffer size scaled by devicePixelRatio for sharp rendering
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      // Scale CSS size back to logical pixels
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Scale context so drawing operations use logical coordinates (high-DPI)
      if (typeof ctx.setTransform === "function") {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      } else if (typeof ctx.scale === "function") {
        ctx.scale(dpr, dpr);
      }

      initParticles(width, height);
    };

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(applyResize, 200);
    };

    const animate = () => {
      if (!ctx) return;
      const parent = canvas.parentElement;
      const width = parent ? parent.clientWidth : canvas.width;
      const height = parent ? parent.clientHeight : canvas.height;

      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;

      // Update and draw particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges (use logical dimensions)
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 130, 255, ${p.opacity})`;
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const opacity = (1 - dist / connectionDistance) * 0.2;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(120, 140, 255, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // Initial sizing without debounce
    applyResize();
    animate();

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(resizeTimer);
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [particleCount, connectionDistance, initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}
    />
  );
}
