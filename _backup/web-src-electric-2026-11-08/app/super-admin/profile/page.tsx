"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
    User, Mail, Phone, Briefcase, Globe, Clock, Camera, Trash2,
    Shield, ShieldCheck, Key, Lock, LogOut, Monitor, Smartphone,
    CheckCircle2, AlertCircle, Eye, EyeOff, ChevronRight, Zap
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = "personal" | "password" | "2fa" | "sessions";

// ─── Custom Starburst Verification Badge ─────────────────────────────────────

function VerifiedBadge({ className }: { className?: string }) {
    return (
        <svg className={cn("w-4.5 h-4.5 text-blue-500 fill-current shrink-0", className)} viewBox="0 0 24 24">
            <path d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12zm-13 5l-4-4 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
    );
}

// ─── Glowing Shield with Lightning Bolt ──────────────────────────────────────

function GlowingShieldZap() {
    return (
        <div className="absolute top-4 right-6 w-24 h-24 flex items-center justify-center">
            {/* Ambient Radial Glow */}
            <div className="absolute inset-0 rounded-full bg-blue-500/25 blur-xl animate-pulse" />
            
            {/* Glassmorphic Outer Container */}
            <div className="relative w-20 h-20 rounded-2xl border border-white/20 dark:border-blue-500/30 bg-white/10 dark:bg-blue-600/20 flex items-center justify-center shadow-2xl backdrop-blur-sm">
                <div className="relative flex items-center justify-center">
                    <Shield size={48} className="text-white/60 dark:text-blue-500/30 fill-white/10 dark:fill-blue-900/20 stroke-[1.5]" />
                    <Zap size={22} className="absolute text-blue-100 dark:text-blue-400 fill-blue-200 dark:fill-blue-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)] animate-pulse" />
                </div>
            </div>
        </div>
    );
}

// ─── Input Field ─────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {label}
            </label>
            {children}
        </div>
    );
}

const inputCls =
    "w-full px-4 py-3 rounded-xl bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-[#1e2d4a] text-slate-900 dark:text-slate-100 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 dark:placeholder:text-slate-600";

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<Tab>("personal");
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const { user, updateUser } = useAuthStore();
    const avatarInputRef = useRef<HTMLInputElement | null>(null);

    const [form, setForm] = useState({
        fullName: "System Owner",
        email: "admin@somalielectric.so",
        phone: "+252 61 123 4567",
        jobTitle: "Super Administrator",
        language: "English",
        timezone: "(GMT+03:00) Nairobi",
        aboutMe: "System owner and super administrator with full access to all modules and system configurations.",
        website: "https://somalielectric.so",
    });

    const [passwords, setPasswords] = useState({
        current: "",
        newPw: "",
        confirm: "",
    });

    const [saved, setSaved] = useState(false);
    const [pwSaved, setPwSaved] = useState(false);
    const [avatarError, setAvatarError] = useState<string>("");
    const [passwordError, setPasswordError] = useState<string>("");

    useEffect(() => {
        if (!user) {
            return;
        }

        setForm((current) => ({
            ...current,
            fullName: user.fullName,
            phone: user.phone,
        }));
    }, [user]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateUser({
            fullName: form.fullName,
            phone: form.phone,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleAvatarButtonClick = () => {
        avatarInputRef.current?.click();
    };

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            setAvatarError("Please choose an image file.");
            event.target.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setAvatarError("Image must be 2MB or smaller.");
            event.target.value = "";
            return;
        }

        setAvatarError("");

        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = typeof reader.result === "string" ? reader.result : "";
            if (!dataUrl) {
                setAvatarError("Failed to read image. Please try another file.");
                return;
            }

            updateUser({ avatar: dataUrl });
        };
        reader.readAsDataURL(file);
        event.target.value = "";
    };

    const handleAvatarDelete = () => {
        setAvatarError("");
        updateUser({ avatar: undefined });
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");
        setPwSaved(false);

        if (passwords.newPw !== passwords.confirm) {
            return;
        }

        if (!passwords.current || !passwords.newPw) {
            setPasswordError("Current and new passwords are required.");
            return;
        }

        try {
            // TODO: Replace with real password update API call.
            throw new Error("Password API unavailable");
        } catch {
            setPasswordError("Unable to update password right now. Please try again.");
        }
    };

    const tabs: { id: Tab; label: string }[] = [
        { id: "personal", label: "Personal Information" },
        { id: "password", label: "Change Password" },
        { id: "2fa", label: "Two Factor Authentication" },
        { id: "sessions", label: "Login Sessions" },
    ];

    const sessions = [
        { device: "Chrome on Windows", location: "Mogadishu, SO", ip: "196.201.x.x", time: "Active now", icon: Monitor, current: true },
        { device: "Safari on iPhone", location: "Nairobi, KE", ip: "41.80.x.x", time: "2 hours ago", icon: Smartphone, current: false },
        { device: "Firefox on macOS", location: "Dubai, AE", ip: "87.121.x.x", time: "3 days ago", icon: Monitor, current: false },
    ];

    return (
        <div className="space-y-6">
            {/* ── Hero Banner ────────────────────────────────────────────── */}
            <div className="relative h-36 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-800 dark:from-[#0a1628] dark:via-[#0d1f3c] dark:to-[#0a1628] border border-transparent dark:border-[#1a2744]">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top_right,rgba(29,78,216,0.35),transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,0,0,0.1),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_bottom_left,rgba(15,52,96,0.4),transparent_50%)]" />
                
                {/* Wavy decoration */}
                <svg className="absolute bottom-0 right-0 opacity-25 dark:opacity-20" width="300" height="100" viewBox="0 0 300 100" fill="none">
                    <path d="M0 50 Q75 0 150 50 Q225 100 300 50" stroke="#93c5fd" strokeWidth="2" fill="none" className="dark:stroke-[#3b82f6]"/>
                    <path d="M0 70 Q75 20 150 70 Q225 120 300 70" stroke="#60a5fa" strokeWidth="1.5" fill="none" className="dark:stroke-[#1d4ed8]"/>
                </svg>
                
                <GlowingShieldZap />
                
                <div className="absolute bottom-6 left-6">
                    <h1 className="text-2xl font-black text-white tracking-tight">My Profile</h1>
                    <p className="text-blue-100 dark:text-slate-400 text-sm mt-0.5 font-medium">Manage your personal information and account settings.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
                {/* ── Left Sidebar ───────────────────────────────────────── */}
                <div className="space-y-6">
                    {/* Profile Card */}
                    <div className="bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-6 flex flex-col items-center text-center shadow-sm">
                        <div className="w-full text-left border-b border-slate-100 dark:border-[#1a2744] pb-3 mb-5">
                            <h3 className="text-slate-800 dark:text-slate-200 font-bold text-sm">Profile Overview</h3>
                        </div>
                        
                        <div className="relative mb-3">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center overflow-hidden ring-4 ring-slate-100 dark:ring-[#1a2744]">
                                <img
                                    src={user?.avatar || "/images/avatar_system_owner.png"}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/avataaars/svg?seed=SystemOwner&backgroundColor=b6e3f4";
                                    }}
                                />
                            </div>
                            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-4 border-white dark:border-[#0a1628] shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        </div>
                        
                        <h2 className="text-slate-900 dark:text-white font-bold text-lg flex items-center gap-1.5 justify-center">
                            {form.fullName}
                            <VerifiedBadge />
                        </h2>
                        <p className="text-slate-400 dark:text-slate-500 text-sm font-semibold mt-0.5">Super Administrator</p>
                        
                        <div className="flex items-center gap-1.5 mt-2 bg-emerald-500/5 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.6)] animate-pulse" />
                            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">Online</span>
                        </div>

                        <div className="w-full mt-6 pt-2 border-t border-slate-100 dark:border-[#1a2744] space-y-3.5 text-left">
                            <div className="flex justify-between items-center">
                                <p className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider font-bold">Users Managed</p>
                                <p className="text-slate-800 dark:text-white font-black text-base">2,847</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider font-bold">Companies</p>
                                <p className="text-slate-800 dark:text-white font-black text-base">8</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider font-bold">Joined</p>
                                <p className="text-slate-700 dark:text-white font-bold text-xs">Jan 12, 2024</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider font-bold">Last Login</p>
                                <p className="text-slate-700 dark:text-white font-bold text-xs">May 27, 2026 02:45 PM</p>
                            </div>
                            <div className="border-t border-slate-100 dark:border-[#1a2744]/60 pt-3">
                                <p className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider font-bold">Email</p>
                                <p className="text-blue-600 dark:text-blue-400 font-bold text-xs break-all mt-0.5">{form.email}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider font-bold">Phone</p>
                                <p className="text-slate-700 dark:text-white font-bold text-xs mt-0.5">{form.phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Security Status */}
                    <div className="bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-5 shadow-sm">
                        <p className="text-slate-800 dark:text-slate-300 font-bold text-sm mb-4">Security Status</p>
                        <div className="flex flex-col items-center py-3">
                            <div className="w-16 h-16 rounded-full border-2 border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/10 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(52,211,153,0.15)] relative">
                                <ShieldCheck size={30} className="text-emerald-500 dark:text-emerald-400" />
                                <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping opacity-30" style={{ animationDuration: "3s" }} />
                            </div>
                            <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">Your account is secure</p>
                            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 font-semibold">Last password change: 15 days ago</p>
                        </div>
                        <button
                            onClick={() => setActiveTab("password")}
                            className="w-full mt-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d4a] text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-[#0f1d35] transition-colors bg-transparent"
                        >
                            Change Password
                        </button>
                    </div>
                </div>

                {/* ── Right Content ──────────────────────────────────────── */}
                <div className="bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                    <div>
                        {/* Tabs */}
                        <div className="flex border-b border-slate-100 dark:border-[#1a2744] overflow-x-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex-shrink-0 px-6 py-4.5 text-sm font-bold transition-all whitespace-nowrap border-b-2 relative",
                                        activeTab === tab.id
                                            ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-500 bg-blue-50/20 dark:bg-blue-500/5"
                                            : "text-slate-400 dark:text-slate-500 border-transparent hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-white/5"
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-6">
                            {/* ── Personal Information Tab ── */}
                            {activeTab === "personal" && (
                                <form onSubmit={handleSave} className="space-y-5">
                                    <Field label="Full Name">
                                        <input
                                            className={inputCls}
                                            value={form.fullName}
                                            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                        />
                                    </Field>
                                    <Field label="Email Address">
                                        <input
                                            className={inputCls}
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        />
                                    </Field>
                                    <Field label="Phone Number">
                                        <input
                                            className={inputCls}
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        />
                                    </Field>
                                    <Field label="Job Title">
                                        <input
                                            className={inputCls}
                                            value={form.jobTitle}
                                            onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                                        />
                                    </Field>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Field label="Language">
                                            <div className="relative">
                                                <select
                                                    className={cn(inputCls, "cursor-pointer appearance-none pr-10")}
                                                    value={form.language}
                                                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                                                >
                                                    <option>English</option>
                                                    <option>Somali</option>
                                                    <option>Arabic</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                                    <ChevronRight size={16} className="rotate-90" />
                                                </div>
                                            </div>
                                        </Field>
                                        <Field label="Timezone">
                                            <div className="relative">
                                                <select
                                                    className={cn(inputCls, "cursor-pointer appearance-none pr-10")}
                                                    value={form.timezone}
                                                    onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                                                >
                                                    <option>(GMT+03:00) Nairobi</option>
                                                    <option>(GMT+03:00) Mogadishu</option>
                                                    <option>(GMT+00:00) UTC</option>
                                                    <option>(GMT+04:00) Dubai</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                                    <ChevronRight size={16} className="rotate-90" />
                                                </div>
                                            </div>
                                        </Field>
                                    </div>

                                    {/* Profile Picture */}
                                    <Field label="Profile Picture">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 overflow-hidden flex items-center justify-center border-2 border-slate-100 dark:border-[#1a2744]">
                                                <img
                                                    src={user?.avatar || "/images/avatar_system_owner.png"}
                                                    alt="Avatar Preview"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/avataaars/svg?seed=SystemOwner&backgroundColor=b6e3f4";
                                                    }}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleAvatarButtonClick}
                                                className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-[#1e2d4a] text-slate-700 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-[#0f1d35] text-sm font-semibold rounded-xl transition-all bg-transparent"
                                            >
                                                <Camera size={14} />
                                                Change Photo
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleAvatarDelete}
                                                className="p-2.5 border border-slate-200 dark:border-[#1e2d4a] text-slate-400 hover:text-red-500 hover:border-red-200 dark:hover:text-red-400 dark:hover:border-red-900/30 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-all bg-transparent"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                        </div>
                                        <p className="text-slate-400 dark:text-slate-500 text-xs mt-1.5 font-medium">JPG, PNG or GIF. Max size 2MB.</p>
                                        {avatarError && (
                                            <p className="text-red-600 dark:text-red-400 text-xs mt-1.5 font-semibold">{avatarError}</p>
                                        )}
                                    </Field>

                                    <Field label="About Me">
                                        <textarea
                                            rows={3}
                                            className={cn(inputCls, "resize-none")}
                                            value={form.aboutMe}
                                            onChange={(e) => setForm({ ...form, aboutMe: e.target.value })}
                                        />
                                    </Field>

                                    <Field label="Website">
                                        <input
                                            className={inputCls}
                                            value={form.website}
                                            onChange={(e) => setForm({ ...form, website: e.target.value })}
                                        />
                                    </Field>

                                    {saved && (
                                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-semibold animate-pulse">
                                            <CheckCircle2 size={16} />
                                            Profile updated successfully!
                                        </div>
                                    )}

                                    <div className="pt-2 flex justify-end">
                                        <button
                                            type="submit"
                                            className="px-8 py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/10 shadow-blue-500/5"
                                        >
                                            Update Profile
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* ── Change Password Tab ── */}
                            {activeTab === "password" && (
                                <form onSubmit={handlePasswordChange} className="space-y-5 max-w-lg">
                                    <Field label="Current Password">
                                        <div className="relative">
                                            <input
                                                type={showCurrentPw ? "text" : "password"}
                                                className={cn(inputCls, "pr-12")}
                                                placeholder="••••••••"
                                                value={passwords.current}
                                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                            />
                                            <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                                {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </Field>
                                    <Field label="New Password">
                                        <div className="relative">
                                            <input
                                                type={showNewPw ? "text" : "password"}
                                                className={cn(inputCls, "pr-12")}
                                                placeholder="••••••••"
                                                value={passwords.newPw}
                                                onChange={(e) => setPasswords({ ...passwords, newPw: e.target.value })}
                                            />
                                            <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                                {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </Field>
                                    <Field label="Confirm New Password">
                                        <div className="relative">
                                            <input
                                                type={showConfirmPw ? "text" : "password"}
                                                className={cn(inputCls, "pr-12")}
                                                placeholder="••••••••"
                                                value={passwords.confirm}
                                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                            />
                                            <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                                {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </Field>

                                    {passwords.newPw && passwords.confirm && passwords.newPw !== passwords.confirm && (
                                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm font-semibold">
                                            <AlertCircle size={16} />
                                            Passwords do not match.
                                        </div>
                                    )}
                                    {passwordError && (
                                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-sm font-semibold">
                                            <AlertCircle size={16} />
                                            {passwordError}
                                        </div>
                                    )}
                                    {pwSaved && (
                                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                                            <CheckCircle2 size={16} />
                                            Password changed successfully!
                                        </div>
                                    )}

                                    <div className="pt-2 flex gap-3">
                                        <button
                                            type="button"
                                            className="px-6 py-3 border border-slate-200 dark:border-[#1e2d4a] text-slate-500 dark:text-slate-400 font-semibold text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-[#0f1d35] transition-colors bg-transparent"
                                            onClick={() => {
                                                setPasswords({ current: "", newPw: "", confirm: "" });
                                                setPasswordError("");
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-8 py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/10 shadow-blue-500/5"
                                        >
                                            Update Password
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* ── 2FA Tab ── */}
                            {activeTab === "2fa" && (
                                <div className="space-y-5 max-w-lg">
                                    <div className="p-5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-4">
                                        <ShieldCheck size={24} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">Two-factor authentication is enabled</p>
                                            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 font-medium">Your account is protected with an extra layer of security.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { icon: Smartphone, label: "Authenticator App", desc: "Use Google Authenticator or similar", enabled: true },
                                            { icon: Mail, label: "Email OTP", desc: "Receive a code at admin@somalielectric.so", enabled: false },
                                            { icon: Phone, label: "SMS OTP", desc: "Receive a code at +252 61 123 4567", enabled: false },
                                        ].map(({ icon: Icon, label, desc, enabled }) => (
                                            <div key={label} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#0f1629] border border-slate-100 dark:border-[#1e2d4a]">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-500/5 dark:bg-blue-600/20 flex items-center justify-center border border-blue-500/10">
                                                        <Icon size={18} className="text-blue-500 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-800 dark:text-slate-200 font-semibold text-sm">{label}</p>
                                                        <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">{desc}</p>
                                                    </div>
                                                </div>
                                                <button className={cn(
                                                    "relative h-6 w-11 rounded-full transition-colors",
                                                    enabled ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                                                )}>
                                                    <span className={cn(
                                                        "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                                                        enabled ? "translate-x-5" : "translate-x-0"
                                                    )} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Login Sessions Tab ── */}
                            {activeTab === "sessions" && (
                                <div className="space-y-4">
                                    {sessions.map(({ device, location, ip, time, icon: Icon, current }) => (
                                        <div key={device} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#0f1629] border border-slate-100 dark:border-[#1e2d4a]">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center border",
                                                    current
                                                        ? "bg-blue-500/5 dark:bg-blue-600/20 border-blue-500/10 text-blue-500 dark:text-blue-400"
                                                        : "bg-slate-100 dark:bg-slate-850 border-transparent text-slate-400 dark:text-slate-500"
                                                )}>
                                                    <Icon size={18} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-slate-800 dark:text-slate-200 font-semibold text-sm">{device}</p>
                                                        {current && (
                                                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider">
                                                                Current
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mt-0.5">{location} · {ip} · {time}</p>
                                                </div>
                                            </div>
                                            {!current && (
                                                <button className="text-red-500 dark:text-red-400 text-xs font-semibold hover:text-red-600 dark:hover:text-red-300 flex items-center gap-1 bg-transparent border-0 outline-none">
                                                    <LogOut size={14} />
                                                    Revoke
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <div className="pt-4 border-t border-slate-100 dark:border-[#1a2744]">
                                        <button className="flex items-center gap-2 text-red-500 dark:text-red-400 text-sm font-semibold hover:text-red-600 dark:hover:text-red-300 transition-colors bg-transparent border-0 outline-none">
                                            <LogOut size={16} />
                                            Revoke All Other Sessions
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Footer ─────────────────────────────────────────────────── */}
            <footer className="pt-6 border-t border-slate-200/50 dark:border-[#1a2744]/60 flex items-center justify-between text-slate-400 dark:text-slate-600 text-xs font-semibold">
                <div>© 2026 Somali Electric. All rights reserved.</div>
                <div>Version 2.1.0</div>
            </footer>
        </div>
    );
}
