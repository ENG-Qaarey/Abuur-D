"use client";

import { useEffect, useRef, useState } from "react";
import { Edit2, Eye, MoreVertical, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActionTip, TableActionButton, TableRowActions } from "./super-admin-layout";

export type MoreMenuItem = {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    variant?: "default" | "danger";
};

export function EntityTableActions({
    onView,
    onEdit,
    onDelete,
    moreItems,
    showView = true,
    showEdit = true,
    showDelete = true,
    viewLabel = "View Details",
    editLabel = "Edit",
    deleteLabel = "Delete",
}: {
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    moreItems?: MoreMenuItem[];
    showView?: boolean;
    showEdit?: boolean;
    showDelete?: boolean;
    viewLabel?: string;
    editLabel?: string;
    deleteLabel?: string;
}) {
    const [openMore, setOpenMore] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!openMore) return;
        const handler = (e: MouseEvent) => {
            if (!wrapperRef.current?.contains(e.target as Node)) setOpenMore(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [openMore]);

    const hasMore = (moreItems?.length ?? 0) > 0;

    return (
        <TableRowActions>
            {showView && onView ? <TableActionButton label={viewLabel} variant="view" icon={Eye} onClick={onView} /> : null}
            {showEdit && onEdit ? <TableActionButton label={editLabel} variant="edit" icon={Edit2} onClick={onEdit} /> : null}
            {showDelete && onDelete ? <TableActionButton label={deleteLabel} variant="delete" icon={Trash2} onClick={onDelete} /> : null}
            {hasMore ? (
                <div className="relative" ref={wrapperRef} data-dropdown-wrapper="">
                    <ActionTip label="More Actions">
                        <button
                            type="button"
                            onClick={() => setOpenMore((v) => !v)}
                            className="p-2 border border-slate-200 dark:border-[#1e2d4a] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl bg-transparent transition-all"
                        >
                            <MoreVertical size={14} className="stroke-[2.5]" />
                        </button>
                    </ActionTip>
                    {openMore ? (
                        <div className="absolute right-0 top-full z-[9999] mt-1 w-52 overflow-hidden rounded-2xl border border-slate-100 dark:border-[#1e2d4a] bg-white dark:bg-[#0a1628] p-1.5 shadow-2xl shadow-black/10">
                            {moreItems!.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.label}
                                        type="button"
                                        onClick={() => {
                                            item.onClick();
                                            setOpenMore(false);
                                        }}
                                        className={cn(
                                            "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[12px] font-semibold transition-all",
                                            item.variant === "danger"
                                                ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                                                : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5",
                                        )}
                                    >
                                        {Icon ? <Icon size={13} className="shrink-0" /> : null}
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                    ) : null}
                </div>
            ) : null}
        </TableRowActions>
    );
}
