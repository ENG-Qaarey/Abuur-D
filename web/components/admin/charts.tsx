"use client";

import { useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

function niceMax(value: number): number {
  if (value <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(value)));
  const n = value / pow;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return nice * pow;
}

const GRID = "var(--cl-border)";
const MUTED = "var(--cl-muted)";
const BLUE = "#0d6efd";

/* ------------------------------------------------------------------ */
/* Area / line chart with gridlines, axis labels and hover tooltip      */
/* ------------------------------------------------------------------ */

export type LinePoint = { label: string; value: number };

export function AreaChart({
  data,
  height = 220,
  color = BLUE,
  formatValue = (v: number) => String(v),
}: {
  data: LinePoint[];
  height?: number;
  color?: string;
  formatValue?: (v: number) => string;
}) {
  const [hover, setHover] = useState<number | null>(null);

  const W = 720;
  const H = height;
  const padL = 44;
  const padR = 12;
  const padT = 12;
  const padB = 26;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const { points, max, ticks } = useMemo(() => {
    const max = niceMax(Math.max(1, ...data.map((d) => d.value)));
    const n = Math.max(1, data.length - 1);
    const pts = data.map((d, i) => ({
      x: padL + (i / n) * innerW,
      y: padT + innerH - (d.value / max) * innerH,
      ...d,
    }));
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
      y: padT + innerH - f * innerH,
      value: Math.round(max * f),
    }));
    return { points: pts, max, ticks };
  }, [data, innerW, innerH, padL, padT]);

  if (data.length === 0) {
    return <EmptyChart label="No data in this period" height={height} />;
  }

  const path = useMemo(() => {
    if (points.length === 0) return "";
    if (points.length === 1) return `M${points[0].x},${points[0].y}`;
    let d = `M${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] ?? points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] ?? p2;
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
    }
    return d;
  }, [points]);

  const area = path ? `${path} L${points[points.length - 1].x},${padT + innerH} L${points[0].x},${padT + innerH} Z` : "";
  const active = hover !== null ? points[hover] : null;

  return (
    <div className="relative">
      <style>{`
        @keyframes chart-line-reveal {
          from { stroke-dashoffset: 1; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes chart-area-rise {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .chart-line-reveal {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: chart-line-reveal 900ms cubic-bezier(.22,.61,.36,1) forwards;
        }
        .chart-area-rise {
          animation: chart-area-rise 650ms ease-out both;
          transform-origin: bottom;
        }
      `}</style>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full"
        style={{ aspectRatio: `${W} / ${H}` }}
        preserveAspectRatio="xMidYMid meet"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * W;
          let best = 0;
          let bd = Infinity;
          points.forEach((p, i) => {
            const d = Math.abs(p.x - x);
            if (d < bd) {
              bd = d;
              best = i;
            }
          });
          setHover(best);
        }}
      >
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {/* gridlines + y labels */}
        {ticks.map((t) => (
          <g key={t.y}>
            <line x1={padL} x2={W - padR} y1={t.y} y2={t.y} stroke={GRID} strokeWidth={1} strokeDasharray={t.value === 0 ? undefined : "3 4"} />
            <text x={padL - 8} y={t.y + 3} textAnchor="end" fontSize={10} fill={MUTED}>
              {formatValue(t.value)}
            </text>
          </g>
        ))}

        {/* area + line */}
        {area && <path d={area} fill="url(#areaFill)" className="chart-area-rise" />}
        {path && <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" pathLength="1" className="chart-line-reveal" />}

        {/* x labels (thin out if crowded) */}
        {points.map((p, i) => {
          const step = Math.ceil(points.length / 8);
          if (i % step !== 0 && i !== points.length - 1) return null;
          return (
            <text key={i} x={p.x} y={H - 8} textAnchor="middle" fontSize={10} fill={MUTED}>
              {p.label}
            </text>
          );
        })}

        {/* hover */}
        {active && (
          <g>
            <line x1={active.x} x2={active.x} y1={padT} y2={padT + innerH} stroke={color} strokeWidth={1} strokeDasharray="3 3" opacity={0.5} />
            <circle cx={active.x} cy={active.y} r={4} fill={color} stroke="#fff" strokeWidth={2} />
          </g>
        )}
      </svg>

      {active && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 rounded-lg border border-cl-border bg-cl-card px-2.5 py-1.5 text-center shadow-lg"
          style={{
            left: `${(active.x / W) * 100}%`,
            top: 0,
          }}
        >
          <p className="text-[0.7rem] font-semibold">{formatValue(active.value)}</p>
          <p className="text-[0.6rem] text-cl-muted">{active.label}</p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bar chart with gridlines, rounded bars and axis labels              */
/* ------------------------------------------------------------------ */

export type BarPoint = { label: string; value: number };

export function BarChart({
  data,
  height = 200,
  color = BLUE,
  formatValue = (v: number) => String(v),
}: {
  data: BarPoint[];
  height?: number;
  color?: string;
  formatValue?: (v: number) => string;
}) {
  const [hover, setHover] = useState<number | null>(null);

  const W = 720;
  const H = height;
  const padL = 44;
  const padR = 12;
  const padT = 12;
  const padB = 26;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const { max, ticks } = useMemo(() => {
    const max = niceMax(Math.max(1, ...data.map((d) => d.value)));
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
      y: padT + innerH - f * innerH,
      value: Math.round(max * f),
    }));
    return { max, ticks };
  }, [data, innerH, padT]);

  if (data.length === 0) {
    return <EmptyChart label="No data in this period" height={height} />;
  }

  const n = data.length;
  const slot = innerW / n;
  const barW = Math.min(38, slot * 0.6);

  return (
    <div className="relative">
      <style>{`
        @keyframes chart-bar-rise {
          from { transform: scaleY(0); opacity: 0.35; }
          to { transform: scaleY(1); opacity: 0.82; }
        }
        .chart-bar-rise {
          transform-box: fill-box;
          transform-origin: bottom;
          animation: chart-bar-rise 700ms cubic-bezier(.22,.61,.36,1) both;
        }
        @keyframes chart-donut-reveal {
          from { stroke-dasharray: 0 999; }
        }
        .chart-donut-reveal {
          animation: chart-donut-reveal 800ms cubic-bezier(.22,.61,.36,1) both;
        }
      `}</style>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full"
        style={{ aspectRatio: `${W} / ${H}` }}
        preserveAspectRatio="xMidYMid meet"
        onMouseLeave={() => setHover(null)}
      >
        {ticks.map((t) => (
          <g key={t.y}>
            <line x1={padL} x2={W - padR} y1={t.y} y2={t.y} stroke={GRID} strokeWidth={1} strokeDasharray={t.value === 0 ? undefined : "3 4"} />
            <text x={padL - 8} y={t.y + 3} textAnchor="end" fontSize={10} fill={MUTED}>
              {formatValue(t.value)}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const x = padL + i * slot + (slot - barW) / 2;
          const h = (d.value / max) * innerH;
          const y = padT + innerH - h;
          const active = hover === i;
          return (
            <g key={i} onMouseEnter={() => setHover(i)}>
              <rect x={padL + i * slot} y={padT} width={slot} height={innerH} fill="transparent" />
              <rect
                x={x}
                y={y}
                width={barW}
                height={Math.max(2, h)}
                rx={4}
                fill={color}
                opacity={active ? 1 : 0.82}
                className="chart-bar-rise transition-opacity"
                style={{ animationDelay: `${i * 35}ms` }}
              />
              <text x={padL + i * slot + slot / 2} y={H - 8} textAnchor="middle" fontSize={10} fill={MUTED}>
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {hover !== null && data[hover] && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 rounded-lg border border-cl-border bg-cl-card px-2.5 py-1.5 text-center shadow-lg"
          style={{ left: `${((padL + hover * slot + slot / 2) / W) * 100}%`, top: 0 }}
        >
          <p className="text-[0.7rem] font-semibold">{formatValue(data[hover].value)}</p>
          <p className="text-[0.6rem] text-cl-muted">{data[hover].label}</p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Donut chart with center total and legend                            */
/* ------------------------------------------------------------------ */

export function DonutChart({
  segments,
  size = 170,
  thickness = 24,
  centerLabel,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  if (total === 0) return <EmptyChart label="No data" height={size} />;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative w-full max-w-[170px] aspect-square" style={{ maxWidth: size }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="-rotate-90" preserveAspectRatio="xMidYMid meet">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={GRID} strokeWidth={thickness} />
          {segments.map((s) => {
            const len = (s.value / total) * c;
            const el = (
              <circle
                key={s.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={thickness}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
                className="chart-donut-reveal"
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{total}</span>
          <span className="text-[0.68rem] text-cl-muted">{centerLabel ?? "total"}</span>
        </div>
      </div>
      <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-2 text-[0.82rem]">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            <span className="truncate text-cl-muted">{s.label}</span>
            <span className="ml-auto font-semibold">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sparkline for KPI cards                                             */
/* ------------------------------------------------------------------ */

export function Sparkline({ values, color = BLUE, height = 34 }: { values: number[]; color?: string; height?: number }) {
  const w = 120;
  const h = height;
  const max = Math.max(1, ...values);
  const n = Math.max(1, values.length - 1);
  const pts = values.map((v, i) => [ (i / n) * w, h - 2 - (v / max) * (h - 6) ] as [number, number]);
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const cx = (p1[0] + p2[0]) / 2;
    d += ` C${cx},${p1[1]} ${cx},${p2[1]} ${p2[0]},${p2[1]}`;
  }
  const flat = values.every((v) => v === 0);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-full" preserveAspectRatio="none" aria-hidden>
      {!flat && <path d={`${d} L${w},${h} L0,${h} Z`} fill={color} opacity={0.1} />}
      <path d={d} fill="none" stroke={flat ? MUTED : color} strokeWidth={1.6} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Empty state                                                         */
/* ------------------------------------------------------------------ */

export function EmptyChart({ label, height = 160 }: { label: string; height?: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-cl-border text-cl-muted"
      style={{ height }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 3v18h18" strokeLinecap="round" />
        <path d="M7 14l4-4 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="text-[0.8rem]">{label}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton                                                            */
/* ------------------------------------------------------------------ */

export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div className="animate-pulse" style={{ height }}>
      <div className="flex h-full items-end gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex-1 rounded-t-md bg-cl-border/60" style={{ height: `${20 + ((i * 37) % 70)}%` }} />
        ))}
      </div>
    </div>
  );
}
