"use client";

import { useRef } from "react";

/** Card with a soft light that follows the mouse (21st.dev "spotlight card" pattern). */
export function SpotlightCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(event: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  }

  return (
    <div ref={ref} onMouseMove={onMove} className={`abuur-spotlight abuur-tile ${className}`}>
      {children}
    </div>
  );
}
