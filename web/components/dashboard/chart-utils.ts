/** Pure chart helpers, usable from both Server and Client Components. */

export const DAY = 86_400_000;

/** Counts of dates per day over the last `days` days, oldest first. */
export function dailyCounts(dates: string[], days: number, now = Date.now()): number[] {
  const start = now - days * DAY;
  const counts = new Array<number>(days).fill(0);
  for (const iso of dates) {
    const t = new Date(iso).getTime();
    if (t < start || t > now) continue;
    counts[Math.min(days - 1, Math.floor((t - start) / DAY))] += 1;
  }
  return counts;
}
