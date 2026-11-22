"use client";

import { useState } from "react";
import { Building2, Plus, X } from "lucide-react";
import type { AdminUser, Plan } from "@/lib/types";
import { AddBusinessForm } from "@/app/admin/businesses/add/add-business-form";

export function AddBusinessModal({ users, plans }: { users: AdminUser[]; plans: Plan[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-transparent bg-cl-blue px-4 text-[0.88rem] font-semibold text-white transition hover:bg-cl-blue-hover"
      >
        <Plus size={16} />
        Add Business
      </button>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-end bg-black/35 p-3 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="add-business-title">
          <div className="flex h-full w-full max-w-[760px] flex-col rounded-2xl border border-cl-border bg-cl-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-cl-border px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cl-blue text-white">
                  <Building2 size={17} />
                </span>
                <div>
                  <h2 id="add-business-title" className="font-semibold">Add Business</h2>
                  <p className="text-xs text-cl-muted">Create a business and assign an existing owner account.</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-md p-2 text-cl-muted hover:bg-cl-blue-light hover:text-cl-blue" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <AddBusinessForm users={users} plans={plans} compact />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
