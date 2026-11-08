"use client";

import { useRef, useState, type ReactNode } from "react";
import {
    User,
    Briefcase,
    Shield,
    MapPin,
    Phone,
    FileText,
    Upload,
    Camera,
    Lock,
    StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SuperAdminModalShell } from "@/components/super-admin/shared/modals/SuperAdminModalShell";
import { SuperAdminModalFooter, SuperAdminModalButton } from "@/components/super-admin/shared/modals/SuperAdminModalFooter";
import { modalBodyClass, modalInputClass, modalLabelClass } from "@/components/super-admin/shared/modals/modal-styles";
import {
    ACCESS_LEVELS,
    ACCOUNT_STATUSES,
    EMPLOYMENT_TYPES,
    ROLE_PERMISSIONS,
    STAFF_BRANCHES,
    STAFF_DEPARTMENTS,
    STAFF_DISTRICTS,
    STAFF_MODULES,
    STAFF_REGIONS,
    STAFF_ROLES,
    defaultStaffFormState,
    type StaffFormState,
} from "./staff-form-types";

const coModalInput = cn(modalInputClass, "h-9 px-3 text-xs focus:border-emerald-500 focus:ring-emerald-500/20");
const coModalSelect = cn(coModalInput, "cursor-pointer appearance-none pr-8");
const coModalTextarea = cn(coModalInput, "h-auto min-h-[44px] py-1.5 resize-y");
const formGrid = "grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3";

function Section({
    title,
    icon: Icon,
    children,
}: {
    title: string;
    icon: React.ElementType;
    children: ReactNode;
}) {
    return (
        <section className="space-y-6">
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200/80 dark:border-[#1e2d4a]">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 border border-emerald-500/20">
                    <Icon size={12} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white tracking-tight">{title}</h4>
            </div>
            {children}
        </section>
    );
}

function Field({
    label,
    required,
    hint,
    children,
    className,
}: {
    label: string;
    required?: boolean;
    hint?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <label className={cn("block space-y-1", className)}>
            <span className={modalLabelClass}>
                {label}
                {required ? <span className="text-red-500"> *</span> : null}
            </span>
            {children}
            {hint ? <span className="text-[10px] text-slate-400 font-medium">{hint}</span> : null}
        </label>
    );
}

function FileSlot({
    label,
    fileName,
    onPick,
    onClear,
}: {
    label: string;
    fileName: string;
    onPick: (file: File) => void;
    onClear: () => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="rounded-lg border border-dashed border-slate-200 dark:border-[#1e2d4a] bg-white dark:bg-[#0f1629] p-2">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{label}</p>
            <div className="flex items-center gap-1.5 flex-wrap">
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-md border border-slate-200 dark:border-[#1e2d4a] hover:border-emerald-500/40 hover:bg-emerald-500/5"
                >
                    <Upload size={10} /> Upload
                </button>
                {fileName ? (
                    <>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate max-w-[140px]">{fileName}</span>
                        <button type="button" onClick={onClear} className="text-xs font-bold text-red-500 hover:underline">
                            Remove
                        </button>
                    </>
                ) : (
                    <span className="text-xs text-slate-400">PDF, JPG · max 5MB</span>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onPick(file);
                    e.target.value = "";
                }}
            />
        </div>
    );
}

export function AddStaffModal({
    mode,
    initial,
    onClose,
    onSubmit,
}: {
    mode: "create" | "edit";
    initial?: StaffFormState;
    onClose: () => void;
    onSubmit: (form: StaffFormState) => void;
}) {
    const [form, setForm] = useState<StaffFormState>(initial ?? defaultStaffFormState());
    const [error, setError] = useState("");
    const photoRef = useRef<HTMLInputElement>(null);

    const patch = <K extends keyof StaffFormState>(key: K, value: StaffFormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const pickImage = (file: File, onData: (dataUrl: string, name: string) => void) => {
        if (!file.type.startsWith("image/") && !file.name.endsWith(".pdf")) {
            setError("Please upload an image or PDF.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("File must be 5MB or smaller.");
            return;
        }
        setError("");
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") onData(reader.result, file.name);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const required: (keyof StaffFormState)[] = ["fullName", "username", "email", "phone", "staffRole", "department"];
        const missing = required.filter((k) => !String(form[k]).trim());
        if (missing.length) {
            setError("Please fill in all required fields.");
            return;
        }

        if (mode === "create") {
            if (!form.password.trim()) {
                setError("Password is required for new staff.");
                return;
            }
            if (form.password.length < 8) {
                setError("Password must be at least 8 characters.");
                return;
            }
        }

        if (form.password && form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        onSubmit(form);
    };

    return (
        <SuperAdminModalShell
            title={mode === "create" ? "Add Staff" : "Edit Staff"}
            subtitle="Create or update a staff account."
            onClose={onClose}
            variant="form"
            maxWidth="max-w-3xl co-staff-modal-dialog"
            maxHeight="max-h-[min(90dvh,44rem)]"
            compact
            icon={<User size={16} className="text-emerald-500" />}
            bodyClassName={cn(modalBodyClass, "p-2")}
            footer={
                <SuperAdminModalFooter className="p-3">
                    <SuperAdminModalButton onClick={onClose} className="h-9 min-w-[88px] text-xs rounded-lg">
                        Cancel
                    </SuperAdminModalButton>
                    <SuperAdminModalButton
                        type="submit"
                        form="add-staff-form"
                        variant="primary"
                        className="co-owner-btn-primary h-9 min-w-[100px] text-xs rounded-lg !from-emerald-600 !to-cyan-600 !shadow-emerald-500/20 border-0"
                    >
                        Save Staff
                    </SuperAdminModalButton>
                </SuperAdminModalFooter>
            }
        >
            <form id="add-staff-form" className="space-y-4 p-3 sm:p-4" onSubmit={handleSubmit}>
                {error ? (
                    <p className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
                ) : null}

                <Section title="Personal Information" icon={User}>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex flex-row sm:flex-col items-center gap-2 shrink-0">
                            <div className="w-14 h-14 rounded-xl border border-slate-200 dark:border-[#1e2d4a] overflow-hidden bg-slate-100 dark:bg-[#0f1629] flex items-center justify-center">
                                {form.profilePhoto ? (
                                    <img src={form.profilePhoto} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={22} className="text-slate-400" />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => photoRef.current?.click()}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:underline"
                            >
                                <Camera size={12} /> Profile Photo
                            </button>
                            <input
                                ref={photoRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) pickImage(file, (data) => patch("profilePhoto", data));
                                }}
                            />
                        </div>
                        <div className={cn("flex-1", formGrid)}>
                            <Field label="Full Name" required className="lg:col-span-3">
                                <input className={coModalInput} value={form.fullName} onChange={(e) => patch("fullName", e.target.value)} placeholder="Hassan Omar" />
                            </Field>
                            <Field label="Username" required>
                                <input className={coModalInput} value={form.username} onChange={(e) => patch("username", e.target.value)} placeholder="hassan.omar" />
                            </Field>
                            <Field label="Email Address" required>
                                <input type="email" className={coModalInput} value={form.email} onChange={(e) => patch("email", e.target.value)} placeholder="hassan@beco.so" />
                            </Field>
                            <Field label="Phone Number" required>
                                <input className={coModalInput} value={form.phone} onChange={(e) => patch("phone", e.target.value)} placeholder="+252 61 500 0001" />
                            </Field>
                        </div>
                    </div>
                </Section>

                <Section title="Employment Information" icon={Briefcase}>
                    <div className={formGrid}>
                        <Field label="Staff Role" required>
                            <select className={coModalSelect} value={form.staffRole} onChange={(e) => patch("staffRole", e.target.value)}>
                                {STAFF_ROLES.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Department" required>
                            <select className={coModalSelect} value={form.department} onChange={(e) => patch("department", e.target.value)}>
                                {STAFF_DEPARTMENTS.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Position Title">
                            <input className={coModalInput} value={form.positionTitle} onChange={(e) => patch("positionTitle", e.target.value)} placeholder="Senior Meter Reader" />
                        </Field>
                        <Field label="Employment Type">
                            <select className={coModalSelect} value={form.employmentType} onChange={(e) => patch("employmentType", e.target.value)}>
                                {EMPLOYMENT_TYPES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Joining Date">
                            <input type="date" className={coModalInput} value={form.joiningDate} onChange={(e) => patch("joiningDate", e.target.value)} />
                        </Field>
                        <Field label="Branch / Office">
                            <select className={coModalSelect} value={form.branch} onChange={(e) => patch("branch", e.target.value)}>
                                {STAFF_BRANCHES.map((b) => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                        </Field>
                    </div>
                </Section>

                <Section title="Permissions" icon={Shield}>
                    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                        <Field label="Role Permissions" className="lg:col-span-2">
                            <select className={coModalSelect} value={form.rolePermissions} onChange={(e) => patch("rolePermissions", e.target.value)}>
                                {ROLE_PERMISSIONS.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Access Level" className="lg:col-span-2">
                            <select className={coModalSelect} value={form.accessLevel} onChange={(e) => patch("accessLevel", e.target.value)}>
                                {ACCESS_LEVELS.map((l) => (
                                    <option key={l} value={l}>{l}</option>
                                ))}
                            </select>
                        </Field>
                    </div>
                    <Field label="Module Access" hint="Select modules this staff member can use.">
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-1.5">
                            {STAFF_MODULES.map((mod) => (
                                <label
                                    key={mod}
                                    className={cn(
                                        "flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all",
                                        form.moduleAccess[mod]
                                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                                            : "border-slate-200 dark:border-[#1e2d4a] text-slate-600 dark:text-slate-400 hover:border-emerald-500/30",
                                    )}
                                >
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                        checked={Boolean(form.moduleAccess[mod])}
                                        onChange={(e) =>
                                            patch("moduleAccess", { ...form.moduleAccess, [mod]: e.target.checked })
                                        }
                                    />
                                    {mod}
                                </label>
                            ))}
                        </div>
                    </Field>
                </Section>

                <Section title="Security" icon={Lock}>
                    <div className={formGrid}>
                        <Field label="Password" required={mode === "create"} hint={mode === "edit" ? "Leave blank to keep current password" : undefined}>
                            <input type="password" className={coModalInput} value={form.password} onChange={(e) => patch("password", e.target.value)} autoComplete="new-password" />
                        </Field>
                        <Field label="Confirm Password" required={mode === "create"}>
                            <input type="password" className={coModalInput} value={form.confirmPassword} onChange={(e) => patch("confirmPassword", e.target.value)} autoComplete="new-password" />
                        </Field>
                        <Field label="Account Status">
                            <select className={coModalSelect} value={form.accountStatus} onChange={(e) => patch("accountStatus", e.target.value)}>
                                {ACCOUNT_STATUSES.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </Field>
                        <div className="flex items-end">
                            <label className="flex items-center justify-between w-full gap-2 p-2 rounded-lg border border-slate-200 dark:border-[#1e2d4a] bg-white dark:bg-[#0f1629] cursor-pointer">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200">Two-Factor Authentication</p>
                                    <p className="text-[9px] text-slate-400">Require 2FA on login</p>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={form.twoFactor}
                                    onClick={() => patch("twoFactor", !form.twoFactor)}
                                    className={cn(
                                        "relative h-5 w-9 rounded-full shrink-0 transition-colors",
                                        form.twoFactor ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700",
                                    )}
                                >
                                    <span className={cn("absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform", form.twoFactor ? "translate-x-4" : "")} />
                                </button>
                            </label>
                        </div>
                    </div>
                </Section>

                <Section title="Address Information" icon={MapPin}>
                    <div className={formGrid}>
                        <Field label="Region">
                            <select className={coModalSelect} value={form.region} onChange={(e) => patch("region", e.target.value)}>
                                {STAFF_REGIONS.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="District">
                            <select className={coModalSelect} value={form.district} onChange={(e) => patch("district", e.target.value)}>
                                {STAFF_DISTRICTS.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Address">
                            <input className={coModalInput} value={form.address} onChange={(e) => patch("address", e.target.value)} placeholder="Street, building, landmark" />
                        </Field>
                    </div>
                </Section>

                <Section title="Emergency Contact" icon={Phone}>
                    <div className={formGrid}>
                        <Field label="Emergency Contact Name">
                            <input className={coModalInput} value={form.emergencyName} onChange={(e) => patch("emergencyName", e.target.value)} />
                        </Field>
                        <Field label="Emergency Phone Number">
                            <input className={coModalInput} value={form.emergencyPhone} onChange={(e) => patch("emergencyPhone", e.target.value)} />
                        </Field>
                        <Field label="Relationship">
                            <input className={coModalInput} value={form.emergencyRelationship} onChange={(e) => patch("emergencyRelationship", e.target.value)} placeholder="Spouse, Parent..." />
                        </Field>
                    </div>
                </Section>

                <Section title="Upload Documents" icon={FileText}>
                    <div className="grid gap-2 sm:grid-cols-3">
                        <FileSlot
                            label="National ID"
                            fileName={form.nationalIdFile}
                            onPick={(f) => patch("nationalIdFile", f.name)}
                            onClear={() => patch("nationalIdFile", "")}
                        />
                        <FileSlot
                            label="Employment Contract"
                            fileName={form.contractFile}
                            onPick={(f) => patch("contractFile", f.name)}
                            onClear={() => patch("contractFile", "")}
                        />
                        <FileSlot
                            label="Certificates"
                            fileName={form.certificatesFile}
                            onPick={(f) => patch("certificatesFile", f.name)}
                            onClear={() => patch("certificatesFile", "")}
                        />
                    </div>
                </Section>

                <Section title="Notes" icon={StickyNote}>
                    <Field label="Internal Notes" hint="Admins only.">
                        <input className={coModalInput} value={form.internalNotes} onChange={(e) => patch("internalNotes", e.target.value)} placeholder="Onboarding notes, access restrictions..." />
                    </Field>
                </Section>
            </form>
        </SuperAdminModalShell>
    );
}
