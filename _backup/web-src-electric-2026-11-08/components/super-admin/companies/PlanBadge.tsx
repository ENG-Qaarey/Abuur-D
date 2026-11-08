import { cn } from "@/lib/utils";

export function PlanBadge({ plan }: { plan: string }) {
    const styles: Record<string, string> = {
        Premium: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20",
        Standard: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/20",
        Basic: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700",
    };

    return <span className={cn("inline-flex items-center rounded-lg border px-3 py-1 text-[11px] font-bold", styles[plan] || styles.Basic)}>{plan}</span>;
}
