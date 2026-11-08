"use client";

import type { Company } from "./types";
import { ModalShell } from "./ModalShell";

export function DeleteModal({ company, onClose, onConfirm }: { company: Company; onClose: () => void; onConfirm: () => void }) {
    return (
        <ModalShell title="Delete Company" subtitle={`This will remove ${company.name} from the list.`} onClose={onClose} maxWidth="max-w-lg">
            <div className="space-y-6 bg-slate-50 p-6 dark:bg-slate-950">
                <div className="rounded-3xl border border-red-500/10 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
                    <p className="text-sm font-medium leading-6 text-slate-700 dark:text-slate-200">
                        Are you sure you want to delete <span className="font-black text-slate-950 dark:text-white">{company.name}</span>? This action cannot be undone.
                    </p>
                </div>
                <div className="flex gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <button onClick={onClose} className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="flex-1 rounded-full border border-red-500/20 bg-red-500 px-4 py-3 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:bg-red-600">
                        Delete
                    </button>
                </div>
            </div>
        </ModalShell>
    );
}
