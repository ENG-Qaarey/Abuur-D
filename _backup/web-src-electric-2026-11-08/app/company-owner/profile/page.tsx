"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
    Camera,
    Trash2,
    Shield,
    ShieldCheck,
    LogOut,
    Monitor,
    Smartphone,
    CheckCircle2,
    AlertCircle,
    Eye,
    EyeOff,
    Zap,
    Mail,
    Phone,
    Key,
    User,
    Settings,
    Bell,
    Fingerprint,
    ExternalLink,
    Clock,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { COMPANY_OWNER_NAME } from "@/data/company-owner-mock";
import {
    CoCard,
    CoField,
    CoHeroBanner,
    CoPrimaryButton,
    CoSecondaryButton,
    CoStatPill,
    PasswordStrengthBar,
    ProfileCompletionBar,
    VerifiedBadge,
    coInputCls,
} from "@/components/company-owner/shared/profile-settings-ui";

type Tab = "personal" | "password" | "2fa" | "sessions";

function HeroGraphic() {
    return (
        <div className="absolute top-4 right-4 sm:right-8 w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 rounded-full bg-emerald-400/30 blur-2xl animate-pulse" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-white/25 bg-white/10 backdrop-blur-md flex items-center justify-center shadow-2xl">
                <Shield size={40} className="text-white/50 stroke-[1.5]" />
                <Zap size={18} className="absolute text-emerald-200 fill-emerald-100 drop-shadow-[0_0_10px_rgba(110,231,183,0.9)]" />
            </div>
        </div>
    );
}

export default function CompanyOwnerProfilePage() {
    const [activeTab, setActiveTab] = useState<Tab>("personal");
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const { user, updateUser } = useAuthStore();
    const avatarInputRef = useRef<HTMLInputElement | null>(null);

    const [form, setForm] = useState({
        fullName: "Ahmed Mohamed",
        email: "owner@beco.so",
        phone: "+252 61 500 0001",
        jobTitle: "Company Owner",
        language: "English",
        timezone: "(GMT+03:00) Mogadishu",
        aboutMe: "Company owner responsible for operations, billing, staff, and customer management at BECO.",
        website: "https://beco.so",
    });

    const [passwords, setPasswords] = useState({ current: "", newPw: "", confirm: "" });
    const [saved, setSaved] = useState(false);
    const [avatarError, setAvatarError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        if (!user) return;
        setForm((c) => ({ ...c, fullName: user.fullName, phone: user.phone }));
    }, [user]);

    const avatarSrc = user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=AhmedOwner&backgroundColor=c0f2e8";

    const profilePercent = useMemo(() => {
        const checks = [
            Boolean(form.fullName?.trim()),
            Boolean(form.email?.trim()),
            Boolean(form.phone?.trim()),
            Boolean(form.jobTitle?.trim()),
            Boolean(form.aboutMe?.trim()),
            Boolean(form.website?.trim()),
            Boolean(user?.avatar),
        ];
        return Math.round((checks.filter(Boolean).length / checks.length) * 100);
    }, [form, user?.avatar]);

    const tabs: { id: Tab; label: string; icon: typeof User }[] = [
        { id: "personal", label: "Personal", icon: User },
        { id: "password", label: "Password", icon: Key },
        { id: "2fa", label: "2FA", icon: Fingerprint },
        { id: "sessions", label: "Sessions", icon: Monitor },
    ];

    const sessions = [
        { device: "Chrome on Windows", location: "Mogadishu, SO", ip: "41.79.x.x", time: "Active now", icon: Monitor, current: true },
        { device: "Safari on iPhone", location: "Mogadishu, SO", ip: "41.79.x.x", time: "Yesterday", icon: Smartphone, current: false },
        { device: "Edge on Windows", location: "Mogadishu, SO", ip: "41.79.x.x", time: "5 days ago", icon: Monitor, current: false },
    ];

    const securityLog = [
        { action: "Password changed", time: "8 days ago", ok: true },
        { action: "New login from Chrome", time: "Today 09:12", ok: true },
        { action: "Email OTP enabled", time: "Mar 12, 2024", ok: true },
    ];

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateUser({ fullName: form.fullName, phone: form.phone });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setAvatarError("Please choose an image file.");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setAvatarError("Max size 2MB.");
            return;
        }
        setAvatarError("");
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = typeof reader.result === "string" ? reader.result : "";
            if (dataUrl) updateUser({ avatar: dataUrl });
        };
        reader.readAsDataURL(file);
        event.target.value = "";
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");
        if (passwords.newPw !== passwords.confirm) return;
        if (!passwords.current || !passwords.newPw) {
            setPasswordError("Current and new passwords are required.");
            return;
        }
        if (passwords.newPw.length < 8) {
            setPasswordError("Use at least 8 characters.");
            return;
        }
        setPasswordError("Unable to update password right now. Please try again.");
    };

    return (
        <div className="space-y-6 pb-4">
            <CoHeroBanner
                badge={COMPANY_OWNER_NAME}
                title="Profile Settings"
                description="Manage your owner account, security preferences, and active sessions."
                graphic={<HeroGraphic />}
                actions={
                    <>
                        <Link
                            href="/company-owner/settings"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 transition-colors"
                        >
                            <Settings size={14} /> Company settings
                        </Link>
                        <Link
                            href="/company-owner/notifications"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-50 text-xs font-bold border border-white/10 transition-colors"
                        >
                            <Bell size={14} /> Notifications
                        </Link>
                    </>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <CoStatPill label="Customers" value="12,480" trend="+186 this month" />
                <CoStatPill label="Meters" value="12,310" trend="98% online" />
                <CoStatPill label="Staff" value="24" trend="3 admins" />
                <CoStatPill label="Account age" value="14 mo" trend="Since Mar 2024" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
                <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
                    <CoCard className="p-6 flex flex-col items-center text-center">
                        <div className="w-full text-left mb-4">
                            <ProfileCompletionBar percent={profilePercent} />
                        </div>
                        <div className="relative mb-3 group">
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 overflow-hidden ring-4 ring-emerald-100 dark:ring-emerald-900/50 shadow-lg shadow-emerald-500/20">
                                <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                            <button
                                type="button"
                                onClick={() => avatarInputRef.current?.click()}
                                className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white dark:border-[#0a1628] shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Camera size={14} />
                            </button>
                            <div className="absolute bottom-1 left-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0a1628]" />
                        </div>
                        <h2 className="text-slate-900 dark:text-white font-bold text-lg flex items-center gap-1.5">
                            {form.fullName}
                            <VerifiedBadge />
                        </h2>
                        <p className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold">{form.jobTitle}</p>
                        <p className="text-slate-400 text-xs mt-2 font-medium">{form.email}</p>
                    </CoCard>

                    <CoCard className="p-5">
                        <p className="text-slate-800 dark:text-slate-200 font-bold text-sm mb-3">Quick links</p>
                        <div className="space-y-1">
                            {[
                                { href: "/company-owner/settings", label: "Company settings", icon: Settings },
                                { href: "/company-owner/staff", label: "Manage staff", icon: User },
                                { href: "/company-owner/billing", label: "Billing rules", icon: ExternalLink },
                            ].map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-emerald-500/5 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors group"
                                >
                                    <span className="flex items-center gap-2">
                                        <link.icon size={15} className="text-emerald-500" />
                                        {link.label}
                                    </span>
                                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-50" />
                                </Link>
                            ))}
                        </div>
                    </CoCard>

                    <CoCard className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                                <ShieldCheck size={22} className="text-emerald-600" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-sm text-slate-900 dark:text-white">Security score</p>
                                <p className="text-xs text-emerald-600 font-semibold">Strong · 2FA on email</p>
                            </div>
                        </div>
                        <CoSecondaryButton className="w-full" onClick={() => setActiveTab("password")}>
                            Update password
                        </CoSecondaryButton>
                    </CoCard>

                    <CoCard className="p-5">
                        <p className="text-slate-800 dark:text-slate-200 font-bold text-sm mb-3 flex items-center gap-2">
                            <Clock size={14} className="text-emerald-500" /> Recent activity
                        </p>
                        <ul className="space-y-2.5">
                            {securityLog.map((item) => (
                                <li key={item.action} className="flex items-start gap-2 text-left">
                                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{item.action}</p>
                                        <p className="text-[10px] text-slate-400">{item.time}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CoCard>
                </div>

                <CoCard className="overflow-hidden flex flex-col min-h-[480px]">
                    <div className="flex border-b border-slate-100 dark:border-[#1a2744] overflow-x-auto custom-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex-shrink-0 flex items-center gap-2 px-5 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "text-emerald-600 dark:text-emerald-400 border-emerald-500 bg-emerald-50/40 dark:bg-emerald-500/5"
                                        : "text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50/50 dark:hover:bg-white/5",
                                )}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-6 flex-1">
                        {activeTab === "personal" && (
                            <form onSubmit={handleSave} className="space-y-5 max-w-2xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <CoField label="Full name">
                                        <input className={coInputCls} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                                    </CoField>
                                    <CoField label="Job title">
                                        <input className={coInputCls} value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} />
                                    </CoField>
                                </div>
                                <CoField label="Email address">
                                    <input className={coInputCls} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                                </CoField>
                                <CoField label="Phone number">
                                    <input className={coInputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                                </CoField>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <CoField label="Language">
                                        <select className={coInputCls} value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                                            <option>English</option>
                                            <option>Somali</option>
                                            <option>Arabic</option>
                                        </select>
                                    </CoField>
                                    <CoField label="Timezone">
                                        <select className={coInputCls} value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })}>
                                            <option>(GMT+03:00) Mogadishu</option>
                                            <option>(GMT+03:00) Nairobi</option>
                                            <option>(GMT+00:00) UTC</option>
                                        </select>
                                    </CoField>
                                </div>
                                <CoField label="Profile photo" hint="JPG, PNG or GIF. Max 2MB.">
                                    <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-[#0f1629] border border-slate-100 dark:border-[#1e2d4a]">
                                        <img src={avatarSrc} alt="" className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-500/30" />
                                        <div className="flex gap-2">
                                            <CoSecondaryButton onClick={() => avatarInputRef.current?.click()}>
                                                <span className="flex items-center gap-1.5">
                                                    <Camera size={14} /> Upload
                                                </span>
                                            </CoSecondaryButton>
                                            <button type="button" onClick={() => updateUser({ avatar: undefined })} className="p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d4a] text-slate-400 hover:text-red-500">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                    </div>
                                    {avatarError && <p className="text-red-500 text-xs font-semibold">{avatarError}</p>}
                                </CoField>
                                <CoField label="About me">
                                    <textarea rows={4} className={cn(coInputCls, "resize-none")} value={form.aboutMe} onChange={(e) => setForm({ ...form, aboutMe: e.target.value })} />
                                </CoField>
                                <CoField label="Website">
                                    <input className={coInputCls} value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                                </CoField>
                                {saved && (
                                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm font-semibold">
                                        <CheckCircle2 size={16} /> Profile updated successfully!
                                    </div>
                                )}
                                <div className="flex justify-end pt-2">
                                    <CoPrimaryButton type="submit">Save profile</CoPrimaryButton>
                                </div>
                            </form>
                        )}

                        {activeTab === "password" && (
                            <form onSubmit={handlePasswordChange} className="space-y-5 max-w-lg">
                                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-sm text-amber-800 dark:text-amber-200/90">
                                    Use a unique password with at least 8 characters, including numbers and symbols.
                                </div>
                                {(["current", "newPw", "confirm"] as const).map((key, i) => {
                                    const labels = ["Current password", "New password", "Confirm new password"];
                                    const show = [showCurrentPw, showNewPw, showConfirmPw][i];
                                    const setShow = [setShowCurrentPw, setShowNewPw, setShowConfirmPw][i];
                                    return (
                                        <CoField key={key} label={labels[i]}>
                                            <div className="relative">
                                                <input
                                                    type={show ? "text" : "password"}
                                                    className={cn(coInputCls, "pr-12")}
                                                    placeholder="••••••••"
                                                    value={passwords[key]}
                                                    onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
                                                />
                                                <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                            {key === "newPw" && <PasswordStrengthBar password={passwords.newPw} />}
                                        </CoField>
                                    );
                                })}
                                {passwords.newPw && passwords.confirm && passwords.newPw !== passwords.confirm && (
                                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-sm font-semibold">
                                        <AlertCircle size={16} /> Passwords do not match.
                                    </div>
                                )}
                                {passwordError && (
                                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 text-sm font-semibold">
                                        <AlertCircle size={16} /> {passwordError}
                                    </div>
                                )}
                                <div className="flex gap-3 pt-2">
                                    <CoSecondaryButton onClick={() => setPasswords({ current: "", newPw: "", confirm: "" })}>Cancel</CoSecondaryButton>
                                    <CoPrimaryButton type="submit">Update password</CoPrimaryButton>
                                </div>
                            </form>
                        )}

                        {activeTab === "2fa" && (
                            <div className="space-y-4 max-w-lg">
                                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 border border-emerald-500/25 flex gap-4">
                                    <ShieldCheck size={28} className="text-emerald-600 shrink-0" />
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">Protect your company account</p>
                                        <p className="text-sm text-slate-500 mt-1">Owners can access billing, customers, and staff — enable 2FA for every sign-in.</p>
                                    </div>
                                </div>
                                {[
                                    { icon: Smartphone, label: "Authenticator app", desc: "Google Authenticator, Authy", enabled: false },
                                    { icon: Mail, label: "Email OTP", desc: `Codes to ${form.email}`, enabled: true },
                                    { icon: Phone, label: "SMS OTP", desc: `Codes to ${form.phone}`, enabled: false },
                                ].map(({ icon: Icon, label, desc, enabled }) => (
                                    <div key={label} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#0f1629] border border-slate-100 dark:border-[#1e2d4a] hover:border-emerald-500/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                                <Icon size={18} className="text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{label}</p>
                                                <p className="text-xs text-slate-400">{desc}</p>
                                            </div>
                                        </div>
                                        <span className={cn("text-[10px] font-black uppercase px-2 py-1 rounded-md", enabled ? "bg-emerald-500/15 text-emerald-700" : "bg-slate-200 dark:bg-slate-800 text-slate-500")}>
                                            {enabled ? "On" : "Off"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === "sessions" && (
                            <div className="space-y-3 max-w-2xl">
                                <p className="text-sm text-slate-500 mb-2">Devices where you are signed in. Revoke any session you do not recognize.</p>
                                {sessions.map(({ device, location, ip, time, icon: Icon, current }) => (
                                    <div
                                        key={device + time}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-xl border transition-colors",
                                            current
                                                ? "bg-emerald-500/5 border-emerald-500/25"
                                                : "bg-slate-50 dark:bg-[#0f1629] border-slate-100 dark:border-[#1e2d4a]",
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", current ? "bg-emerald-500/15 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400")}>
                                                <Icon size={18} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{device}</p>
                                                    {current && (
                                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold uppercase">
                                                            Current
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {location} · {ip} · {time}
                                                </p>
                                            </div>
                                        </div>
                                        {!current && (
                                            <button type="button" className="text-red-500 text-xs font-bold flex items-center gap-1 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-500/10">
                                                <LogOut size={14} /> Revoke
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" className="w-full mt-4 py-3 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-500/5 flex items-center justify-center gap-2">
                                    <LogOut size={16} /> Sign out of all other devices
                                </button>
                            </div>
                        )}
                    </div>
                </CoCard>
            </div>

            <footer className="pt-4 border-t border-slate-200/50 dark:border-[#1a2744]/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400 text-xs font-semibold">
                <span>© 2026 {COMPANY_OWNER_NAME}</span>
                <span>Owner panel · v2.1.0</span>
            </footer>
        </div>
    );
}
