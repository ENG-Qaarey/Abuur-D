"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Plus,
  Trash2,
  X,
  AlertTriangle,
  Check,
} from "lucide-react";
import type { EntityConfig, Field, ModuleConfig } from "@/lib/module-config";
import { createEntityAction, updateEntityAction, deleteEntityAction } from "@/lib/actions/module";

type Row = Record<string, any>;

function FieldInput({
  field,
  value,
  onChange,
  dynamicOptions,
}: {
  field: Field;
  value: string;
  onChange: (v: string) => void;
  dynamicOptions?: { value: string; label: string }[];
}) {
  const base =
    "w-full rounded-lg border border-cl-border bg-cl-bg px-3 py-2 text-sm text-cl-text outline-none transition focus:border-cl-blue focus:ring-2 focus:ring-cl-blue/20";
  if (field.type === "textarea") {
    return <textarea name={field.name} value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={base} placeholder={field.placeholder} required={field.required} />;
  }
  if (field.type === "select") {
    const opts = field.options ?? dynamicOptions ?? [];
    return (
      <select name={field.name} value={value} onChange={(e) => onChange(e.target.value)} className={base} required={field.required}>
        <option value="">Select…</option>
        {opts.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }
  return (
    <input
      name={field.name}
      type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "email" ? "email" : "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={base}
      placeholder={field.placeholder}
      required={field.required}
      step={field.type === "number" ? "any" : undefined}
    />
  );
}

function EntityTable({
  entity,
  rows,
  onEdit,
  onDelete,
}: {
  entity: EntityConfig;
  rows: Row[];
  onEdit: (row: Row) => void;
  onDelete: (row: Row) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-cl-border text-left text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-cl-muted">
            {entity.columns.map((c) => (
              <th key={c.key} className="px-3 py-2.5 font-semibold first:pl-4 last:pr-4">{c.label}</th>
            ))}
            <th className="px-3 py-2.5 text-right font-semibold last:pr-4">Actions</th>
          </tr>
        </thead>
        <tbody className="[&>tr]:border-b [&>tr]:border-cl-border [&>tr:last-child]:border-0">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={entity.columns.length + 1} className="px-4 py-10 text-center text-cl-muted">
                No {entity.label.toLowerCase()} yet.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="transition hover:bg-cl-blue-light/20">
                {entity.columns.map((c) => (
                  <td key={c.key} className="px-3 py-3 first:pl-4 last:pr-4">
                    {formatCell(row[c.key])}
                  </td>
                ))}
                <td className="px-3 py-3 last:pr-4">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => onEdit(row)} className="rounded-md p-1.5 text-cl-muted transition hover:bg-cl-blue-light hover:text-cl-blue" aria-label="Edit">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => onDelete(row)} className="rounded-md p-1.5 text-cl-muted transition hover:bg-red-500/10 hover:text-red-600" aria-label="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function formatCell(value: any): React.ReactNode {
  if (value === null || value === undefined || value === "") return <span className="text-cl-muted">—</span>;
  if (typeof value === "boolean") {
    return value ? (
      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[0.68rem] font-semibold text-emerald-700"><Check size={11} /> Yes</span>
    ) : <span className="text-cl-muted">No</span>;
  }
  if (typeof value === "object") return <span className="text-cl-muted">—</span>;
  return String(value);
}

export function ModuleManager({
  module,
  entitySlug,
  rowsByEntity,
  optionsByEntity,
}: {
  module: ModuleConfig;
  entitySlug: string;
  rowsByEntity: Record<string, Row[]>;
  optionsByEntity?: Record<string, Record<string, { value: string; label: string }[]>>;
}) {
  const router = useRouter();
  const [active, setActive] = useState(entitySlug);
  const [modal, setModal] = useState<{ mode: "create" } | { mode: "edit"; row: Row } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Row | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const entity = module.entities.find((e) => e.slug === active) ?? module.entities[0];
  const rows = rowsByEntity[entity.slug] ?? [];
  const dynamicOptions = optionsByEntity?.[entity.slug] ?? {};

  const openCreate = () => {
    setValues({});
    setModal({ mode: "create" });
  };

  const openEdit = (row: Row) => {
    const v: Record<string, string> = {};
    for (const f of entity.fields) v[f.name] = row[f.name] === null || row[f.name] === undefined ? "" : String(row[f.name]);
    setValues(v);
    setModal({ mode: "edit", row });
  };

  const submit = () => {
    startTransition(async () => {
      const result = modal?.mode === "edit"
        ? await updateEntityAction(module.slug, entity.slug, modal.row.id, values)
        : await createEntityAction(module.slug, entity.slug, values);
      if (result.status === "success") {
        setMessage({ kind: "success", text: result.message });
        setModal(null);
        router.refresh();
      } else {
        setMessage({ kind: "error", text: result.message });
      }
    });
  };

  const doDelete = () => {
    if (!confirmDelete) return;
    startTransition(async () => {
      const result = await deleteEntityAction(module.slug, entity.slug, confirmDelete.id);
      setMessage(result.status === "success" ? { kind: "success", text: result.message } : { kind: "error", text: result.message });
      setConfirmDelete(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      {/* Entity tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {module.entities.map((e) => (
            <button
              key={e.slug}
              onClick={() => setActive(e.slug)}
              className={`rounded-lg px-3 py-1.5 text-[0.82rem] font-medium transition ${active === e.slug ? "bg-cl-blue text-white" : "border border-cl-border bg-cl-card text-cl-text hover:bg-cl-blue-light hover:text-cl-blue"}`}
            >
              {e.label}
            </button>
          ))}
        </div>
        <button
          onClick={openCreate}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-cl-blue px-3.5 text-[0.82rem] font-semibold text-white transition hover:bg-cl-blue-hover"
        >
          <Plus size={15} /> New {entity.label.slice(0, -1) || entity.label}
        </button>
      </div>

      {message && (
        <p role="status" className={`rounded-lg border px-3.5 py-2.5 text-sm ${message.kind === "success" ? "border-cl-success/40 bg-cl-success/10 text-cl-success" : "border-red-500/40 bg-red-500/10 text-red-600"}`}>
          {message.text}
        </p>
      )}

      <div className="rounded-xl border border-cl-border bg-cl-card shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
        <div className="border-b border-cl-border px-4 py-3">
          <p className="text-[0.9rem] font-semibold">{entity.label}</p>
          <p className="text-[0.74rem] text-cl-muted">{rows.length} record{rows.length === 1 ? "" : "s"}</p>
        </div>
        <EntityTable entity={entity} rows={rows} onEdit={openEdit} onDelete={setConfirmDelete} />
      </div>

      {/* Create / edit modal */}
      {modal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-black/40" aria-label="Close" onClick={() => setModal(null)} />
          <div className="relative w-full max-w-lg rounded-xl border border-cl-border bg-cl-card p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">{modal.mode === "edit" ? "Edit" : "New"} {entity.label.slice(0, -1) || entity.label}</h3>
              <button onClick={() => setModal(null)} className="rounded-md p-1.5 text-cl-muted hover:bg-cl-blue-light" aria-label="Close">
                <X size={17} />
              </button>
            </div>
            <div className="mt-4 grid gap-3">
              {entity.fields.map((f) => (
                <label key={f.name} className="block">
                  <span className="mb-1 block text-[0.76rem] font-medium text-cl-muted">{f.label}{f.required && <span className="text-red-500"> *</span>}</span>
                  <FieldInput field={f} value={values[f.name] ?? ""} onChange={(v) => setValues((s) => ({ ...s, [f.name]: v }))} dynamicOptions={dynamicOptions[f.name]} />
                </label>
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="rounded-lg border border-cl-border px-4 py-2 text-sm font-medium hover:bg-cl-blue-light">Cancel</button>
              <button onClick={submit} disabled={pending} className="rounded-lg bg-cl-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-cl-blue-hover disabled:opacity-60">
                {pending ? "Saving…" : modal.mode === "edit" ? "Save changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-black/40" aria-label="Close" onClick={() => setConfirmDelete(null)} />
          <div className="relative w-full max-w-sm rounded-xl border border-cl-border bg-cl-card p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
                <AlertTriangle size={17} />
              </span>
              <div>
                <h3 className="text-base font-semibold">Delete this record?</h3>
                <p className="mt-1 text-sm text-cl-muted">This action cannot be undone.</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)} className="rounded-lg border border-cl-border px-4 py-2 text-sm font-medium hover:bg-cl-blue-light">Cancel</button>
              <button onClick={doDelete} disabled={pending} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60">
                {pending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
