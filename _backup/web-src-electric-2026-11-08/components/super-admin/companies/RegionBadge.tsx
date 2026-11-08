import { cn } from "@/lib/utils";

export function RegionBadge({ region }: { region: string }) {
    const colorMap: Record<string, string> = {
        Mogadishu: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20",
        Somaliland: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
        Puntland: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20",
        Jubaland: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/20",
    };

    return <span className={cn("inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-bold whitespace-nowrap", colorMap[region] || "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700")}>{region}</span>;
}
