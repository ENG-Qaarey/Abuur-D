import { cn } from "@/lib/utils";

export function StatusDot({ status }: { status: string }) {
    const active = status === "Active";
    return (
        <div className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", active ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" : "bg-slate-400")} />
            <span className={cn("text-[12px] font-semibold", active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400")}>{status}</span>
        </div>
    );
}
