"use client";

import { useMemo, useState } from "react";

import { DAY } from "./chart-utils";

/** Smooth path through points (Catmull-Rom → cubic Bézier), clamped so it never dips below the baseline. */
function smoothPath(points: [number, number][], baseline: number): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M${points[0][0]},${points[0][1]}`;
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = Math.min(baseline, p1[1] + (p2[1] - p0[1]) / 6);
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = Math.min(baseline, p2[1] - (p3[1] - p1[1]) / 6);
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/** Tiny trend line for a KPI card. A flat line when there is no data. */
export function Sparkline({ values, color = "var(--cl-blue)" }: { values: number[]; color?: string }) {
  const w = 120;
  const h = 32;
  const max = Math.max(1, ...values);
  const step = values.length > 1 ? w / (values.length - 1) : w;
  const pts: [number, number][] = values.map((v, i) => [i * step, h - 2 - (v / max) * (h - 6)]);
  const line = smoothPath(pts, h - 2);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-full" preserveAspectRatio="none" aria-hidden>
      <path d={`${line} L${w},${h} L0,${h} Z`} fill={color} opacity={0.12} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

type Series = { label: string; color: string; dates: string[] };

const RANGES = [
  { key: "7d", label: "7 Days", buckets: 7, size: 1 },
  { key: "30d", label: "30 Days", buckets: 30, size: 1 },
  { key: "3m", label: "3 Months", buckets: 13, size: 7 },
  { key: "1y", label: "1 Year", buckets: 12, size: 30 },
] as const;

/** Line/area chart of how many records were created per day/week/month. */
export function ActivityChart({ series }: { series: Series[] }) {
  const [rangeKey, setRangeKey] = useState<(typeof RANGES)[number]["key"]>("30d");
  const range = RANGES.find((r) => r.key === rangeKey)!;
  // Fixed per render so labels and buckets agree.
  const [now] = useState(() => Date.now());

  const { buckets, labels } = useMemo(() => {
    const span = range.buckets * range.size;
    const start = now - span * DAY;
    const buckets = series.map((s) => {
      const out = new Array<number>(range.buckets).fill(0);
      for (const iso of s.dates) {
        const t = new Date(iso).getTime();
        if (t < start || t > now) continue;
        out[Math.min(range.buckets - 1, Math.floor((t - start) / (range.size * DAY)))] += 1;
      }
      return out;
    });
    const fmt = new Intl.DateTimeFormat("en-GB", range.size >= 30 ? { month: "short" } : { day: "numeric", month: "short" });
    const labels = Array.from({ length: range.buckets }, (_, i) => fmt.format(new Date(start + (i + 1) * range.size * DAY)));
    return { buckets, labels };
  }, [series, range, now]);

  const W = 760;
  const H = 220;
  const padL = 28;
  const padB = 26;
  const padT = 10;
  const plotW = W - padL - 8;
  const plotH = H - padB - padT;
  const max = Math.max(4, ...buckets.flat());
  const yMax = Math.ceil(max / 4) * 4;
  const step = plotW / Math.max(1, range.buckets - 1);
  const x = (i: number) => padL + i * step;
  const y = (v: number) => padT + plotH - (v / yMax) * plotH;
  const labelEvery = Math.ceil(range.buckets / 10);
  const total = buckets.flat().reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="flex flex-wrap gap-1" role="tablist" aria-label="Time range">
        {RANGES.map((r) => (
          <button
            key={r.key}
            type="button"
            role="tab"
            aria-selected={r.key === rangeKey}
            onClick={() => setRangeKey(r.key)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              r.key === rangeKey ? "bg-cl-blue text-white" : "text-cl-muted hover:bg-cl-blue-light hover:text-cl-blue"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-auto w-full" role="img" aria-label={`${total} records in the selected range`}>
        {[0, 1, 2, 3, 4].map((i) => {
          const v = (yMax / 4) * i;
          return (
            <g key={i}>
              <line x1={padL} x2={W - 8} y1={y(v)} y2={y(v)} stroke="var(--cl-border)" strokeDasharray="3 4" />
              <text x={padL - 8} y={y(v) + 4} textAnchor="end" fontSize="10" fill="var(--cl-muted)">
                {v}
              </text>
            </g>
          );
        })}
        {labels.map((l, i) =>
          i % labelEvery === 0 || i === labels.length - 1 ? (
            <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="var(--cl-muted)">
              {l}
            </text>
          ) : null,
        )}
        {series.map((s, si) => {
          const pts: [number, number][] = buckets[si].map((v, i) => [x(i), y(v)]);
          const line = smoothPath(pts, y(0));
          return (
            <g key={s.label}>
              <path d={`${line} L${x(range.buckets - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill={s.color} opacity={0.1} />
              <path d={line} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" />
            </g>
          );
        })}
      </svg>

      <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs">
        {series.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5" style={{ color: s.color }}>
            <span className="h-0.5 w-3 rounded" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Donut of named segments. Shows a muted ring when everything is zero. */
export function Donut({
  segments,
  size = 150,
  thickness = 22,
  center,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  center?: React.ReactNode;
}) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((a, s) => a + s.value, 0);
  const gap = segments.filter((s) => s.value > 0).length > 1 ? 3 : 0;
  let offset = 0;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--cl-border)" strokeWidth={thickness} />
        {total > 0 &&
          segments.map((s) => {
            if (s.value === 0) return null;
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
                strokeDasharray={`${Math.max(0, len - gap)} ${c}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return el;
          })}
      </svg>
      {center && <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{center}</div>}
    </div>
  );
}
