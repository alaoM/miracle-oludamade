"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useSpring } from "framer-motion";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

/**
 * Subtle desktop-only magnetic hover wrapper.
 * Automatically disables on coarse/touch pointers and under prefers-reduced-motion.
 */
export function MagneticButton({
  children,
  className = "",
  strength = 0.22,
}: MagneticButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  const x = useSpring(0, { stiffness: 260, damping: 20, mass: 0.4 });
  const y = useSpring(0, { stiffness: 260, damping: 20, mass: 0.4 });

  useEffect(() => {
    if (prefersReducedMotion) {
      setEnabled(false);
      return;
    }
    const mq = window.matchMedia("(pointer: fine)");
    setEnabled(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setEnabled(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [prefersReducedMotion]);

  if (!enabled) {
    return <div className={`inline-block ${className}`}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const offsetX = e.clientX - (rect.left + rect.width / 2);
        const offsetY = e.clientY - (rect.top + rect.height / 2);
        x.set(Math.max(-10, Math.min(10, offsetX * strength)));
        y.set(Math.max(-8, Math.min(8, offsetY * strength)));
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}
