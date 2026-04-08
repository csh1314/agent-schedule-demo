import { useEffect, useState } from "react";

interface UseCountUpOptions {
  target: number;
  duration?: number;
  enabled?: boolean;
}

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

    // Determine decimal precision from target value
    const decimalStr = String(target).split(".")[1];
    const decimals = decimalStr ? decimalStr.length : 0;
    const factor = Math.pow(10, decimals);

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      // Round to target's decimal precision to avoid floating point artifacts
      const value = Math.round(eased * target * factor) / factor;
      setCount(value);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [target, duration, enabled]);

  return count;
}
