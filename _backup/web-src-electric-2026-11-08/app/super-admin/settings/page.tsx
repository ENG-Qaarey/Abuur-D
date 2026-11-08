"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
    Settings, Globe, Mail, MessageSquare, CreditCard, Shield,
    Bell, Database, Wrench, FileText, Code2, Phone, ChevronDown,
    Image as ImageIcon, Trash2, CheckCircle2, RefreshCw, Download,
    Zap, ChevronLeft, ChevronRight, Laptop, Lock, ShieldCheck, ArrowRight
} from "lucide-react";
import { useBrandSettings } from "@/store/brand-settings.store";
import { useTheme } from "@/components/theme-provider";

// ─── Types ────────────────────────────────────────────────────────────────────

type SettingsSection =
    | "general"
    | "site"
    | "email"
    | "sms"
    | "payment"
    | "security"
    | "notifications"
    | "backup"
    | "maintenance"
    | "logs"
    | "api";

// ─── Input Styling ────────────────────────────────────────────────────────────

const inputCls =
    "w-full px-4 py-3 rounded-xl bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-[#1e2d4a] text-slate-900 dark:text-slate-100 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 dark:placeholder:text-slate-600";

const selectCls =
    "w-full px-4 py-3 rounded-xl bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-[#1e2d4a] text-slate-900 dark:text-slate-100 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none pr-10";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</label>
            {children}
        </div>
    );
}

function SelectWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative">
            {children}
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
    );
}

// ─── Sidebar Nav Items ────────────────────────────────────────────────────────

const navItems: { id: SettingsSection; label: string; icon: React.ElementType }[] = [
    { id: "general",       label: "General Settings",      icon: Settings },
    { id: "site",          label: "Site Configuration",    icon: Globe },
    { id: "email",         label: "Email Settings",        icon: Mail },
    { id: "sms",           label: "SMS Settings",          icon: MessageSquare },
    { id: "payment",       label: "Payment Settings",      icon: CreditCard },
    { id: "security",      label: "Security Settings",     icon: Shield },
    { id: "notifications", label: "Notification Settings", icon: Bell },
    { id: "backup",        label: "Backup & Restore",      icon: Database },
    { id: "maintenance",   label: "Maintenance Mode",      icon: Wrench },
    { id: "logs",          label: "System Logs",           icon: FileText },
    { id: "api",           label: "API Settings",          icon: Code2 },
];

// ─── Glowing 3D-like Graphics ─────────────────────────────────────────────────

function GearGraphic() {
    return (
        <div className="w-36 h-36 shrink-0 relative flex items-center justify-center overflow-visible">
            {/* Base platform glow */}
            <div className="absolute bottom-2 w-28 h-8 rounded-full bg-blue-500/20 blur-md" />
            
            {/* The circular glowing platform */}
            <div className="absolute bottom-4 w-24 h-6 rounded-full bg-gradient-to-b from-blue-500/10 to-blue-600/40 border border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.6)] flex items-center justify-center transform -rotate-x-12">
                <div className="w-20 h-4 rounded-full bg-blue-900/30 border border-blue-400/30" />
            </div>

            {/* Glass dome outline */}
            <div className="absolute bottom-4 w-28 h-28 rounded-t-full bg-gradient-to-b from-blue-400/10 via-blue-500/5 to-transparent border-t border-x border-blue-400/30 backdrop-blur-[1px] shadow-[inset_0_4px_12px_rgba(59,130,246,0.15)] flex items-center justify-center">
                {/* Gears inside the dome */}
                <div className="relative -mt-4">
                    <Settings size={52} className="text-blue-500 dark:text-blue-400/80 drop-shadow-[0_0_12px_rgba(59,130,246,0.8)] stroke-[1.5] animate-spin" style={{ animationDuration: "12s" }} />
                    <Settings size={28} className="absolute -bottom-2 -right-2 text-blue-600/60 dark:text-blue-500/60 stroke-[1.5] animate-spin" style={{ animationDuration: "8s", animationDirection: "reverse" }} />
                </div>
            </div>
        </div>
    );
}

function GlobeGraphic() {
    return (
        <div className="w-36 h-36 shrink-0 relative flex items-center justify-center overflow-visible">
            {/* Background glow */}
            <div className="absolute w-28 h-20 bg-indigo-500/15 blur-xl rounded-xl" />

            {/* Browser window */}
            <div className="w-32 h-24 rounded-xl bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] dark:from-[#121c3b] dark:to-[#080f24] border border-slate-200 dark:border-indigo-500/30 shadow-2xl p-2 flex flex-col gap-1.5 transform hover:scale-105 transition-transform duration-300">
                {/* Title bar */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-indigo-900/50 pb-1.5">
                    <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500/70" />
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/70" />
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500/70" />
                    </div>
                    <div className="w-16 h-1.5 rounded bg-slate-300 dark:bg-indigo-950/80" />
                    <div className="w-2" />
                </div>
                {/* Content area: Globe inside browser */}
                <div className="flex-1 flex items-center justify-center relative">
                    <Globe size={32} className="text-indigo-600 dark:text-indigo-400/80 animate-pulse drop-shadow-[0_0_8px_rgba(129,140,248,0.6)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1),transparent_70%)]" />
                </div>
            </div>
        </div>
    );
}

function EarthGraphic() {
    return (
        <div className="w-36 h-36 shrink-0 relative flex items-center justify-center overflow-visible">
            {/* Green ambient glow */}
            <div className="absolute w-28 h-28 bg-emerald-500/20 blur-2xl rounded-full" />
            
            {/* Neon green base ring */}
            <div className="absolute bottom-4 w-24 h-5 rounded-full border border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.3)] transform -rotate-x-12" />

            {/* Glowing Globe */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/5 via-slate-100 to-slate-200 dark:from-emerald-500/10 dark:via-[#0a201c] dark:to-[#040e0b] border-2 border-emerald-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] relative overflow-hidden group">
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:10px_10px]" />
                <Globe size={48} className="text-emerald-600 dark:text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.7)] animate-pulse" />
                <div className="absolute inset-0 rounded-full border border-emerald-400/25 animate-ping opacity-50" style={{ animationDuration: "4s" }} />
            </div>
        </div>
    );
}

// ─── Main Settings Component ──────────────────────────────────────────────────

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState<SettingsSection>("general");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [saved, setSaved] = useState(false);
    const [savedMessage, setSavedMessage] = useState("Settings saved successfully!");
    const [actionMessage, setActionMessage] = useState("");
    const [logoError, setLogoError] = useState("");
    const [apiKeyVisible, setApiKeyVisible] = useState(false);
    const [generalDirty, setGeneralDirty] = useState(false);
    const [siteDirty, setSiteDirty] = useState(false);
    const { branding, setBranding } = useBrandSettings();
    const { resolvedTheme } = useTheme();
    const logoInputRef = useRef<HTMLInputElement | null>(null);

    // States for Form fields
    const [general, setGeneral] = useState({
        systemName: "Somali Electric Management System",
        systemEmail: "admin@somalielectric.so",
        systemPhone: "+252 61 123 4567",
        timezone: "(GMT+03:00) Nairobi",
    });

    const [site, setSite] = useState({
        siteTitle: "Somali Electric",
        siteDesc: "Enterprise electricity management platform for Somalia",
    });

    const [locale, setLocale] = useState({
        language: "English",
        currency: "USD - US Dollar",
        dateFormat: "May 27, 2026",
        timeFormat: "24 Hours (14:30)",
    });

    const [security, setSecurity] = useState<Record<string, boolean>>({
        twoFactor: true,
        ipAllow: false,
        timeout: true,
        rateLimit: true,
    });

    const [notifications, setNotifications] = useState<Record<string, boolean>>({
        emailAlerts: true,
        smsAlerts: false,
        pushAlerts: true,
        slackAlerts: false,
        weeklyDigest: true,
    });

    const [maintenance, setMaintenance] = useState({
        enabled: false,
        message: "We're currently performing scheduled maintenance. We'll be back soon!",
        duration: "2 hours",
    });

    const [email, setEmail] = useState({
        host: "smtp.example.com",
        port: "587",
        encryption: "TLS",
        username: "",
        password: "",
        from: "noreply@somalielectric.so"
    });

    const [sms, setSms] = useState({
        provider: "Twilio",
        apiKey: "",
        apiSecret: "",
        senderId: "SOMELECTRIC"
    });

    const [payment, setPayment] = useState({
        gateway: "Stripe",
        apiKey: "",
        secretKey: "",
        webhook: "https://somalielectric.so/webhook/payment"
    });

    const [api, setApi] = useState({
        webhook: "https://yourdomain.com/webhook",
        origins: "https://app.somalielectric.so\nhttps://admin.somalielectric.so"
    });

    useEffect(() => {
        if (!generalDirty) {
            setGeneral((current) => ({
                ...current,
                systemName: branding.brandName,
                systemEmail: branding.supportEmail,
                systemPhone: branding.supportPhone,
            }));
        }

        if (!siteDirty) {
            setSite((current) => ({
                ...current,
                siteTitle: branding.brandName,
                siteDesc: branding.brandTagline,
            }));
        }
    }, [branding, generalDirty, siteDirty]);

    const updateGeneralField = (field: keyof typeof general, value: string) => {
        setGeneralDirty(true);
        setGeneral((current) => ({ ...current, [field]: value }));
    };

    const updateSiteField = (field: keyof typeof site, value: string) => {
        setSiteDirty(true);
        setSite((current) => ({ ...current, [field]: value }));
    };

    const currentLogo = resolvedTheme === "dark"
        ? branding.logoDark || "/iconDark.png"
        : branding.logoLight || "/iconLight.png";

    const handleLogoButtonClick = () => {
        logoInputRef.current?.click();
    };

    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            setLogoError("Please select an image file.");
            event.target.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setLogoError("Logo must be 2MB or smaller.");
            event.target.value = "";
            return;
        }

        setLogoError("");

        const reader = new FileReader();
        reader.onerror = () => {
            setLogoError("Unable to read logo file.");
        };
        reader.onload = () => {
            const dataUrl = typeof reader.result === "string" ? reader.result : "";

            if (!dataUrl) {
                setLogoError("Unable to read logo file.");
                return;
            }

            if (resolvedTheme === "dark") {
                setBranding({ logoDark: dataUrl });
            } else {
                setBranding({ logoLight: dataUrl });
            }
        };
        reader.readAsDataURL(file);

        event.target.value = "";
    };

    const handleLogoDelete = () => {
        if (!window.confirm("Delete the current logo for this theme?")) {
            return;
        }

        if (resolvedTheme === "dark") {
            setBranding({ logoDark: "" });
        } else {
            setBranding({ logoLight: "" });
        }

        setLogoError("");
        setActionMessage("Logo removed.");
    };

    const runAction = (message: string) => {
        setActionMessage(message);
    };

    const handleSave = () => {
        setBranding({
            brandName: site.siteTitle || general.systemName,
            brandTagline: site.siteDesc,
            supportEmail: general.systemEmail,
            supportPhone: general.systemPhone,
        });
        setSavedMessage(`${navItems.find((item) => item.id === activeSection)?.label || "Settings"} saved.`);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="w-full max-w-full overflow-x-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-[auto_minmax(0,1fr)] gap-6 items-start">
            {/* ── Left Sidebar ───────────────────────────────────────────── */}
            <aside className={cn(
                "relative z-10 shrink-0 bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-4 shadow-sm transition-all duration-300 self-start w-full lg:sticky lg:top-4",
                sidebarCollapsed ? "lg:w-20" : "lg:w-64"
            )}>
                <button
                    type="button"
                    onClick={() => setSidebarCollapsed((current) => !current)}
                    className="absolute -right-3 top-5 z-20 inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-950 text-slate-200 shadow-lg transition-colors hover:bg-blue-600 dark:border-slate-700"
                    aria-label={sidebarCollapsed ? "Expand settings sidebar" : "Collapse settings sidebar"}
                >
                    {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                <nav className={cn("space-y-1", sidebarCollapsed && "lg:space-y-2") }>
                    {navItems.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveSection(id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left border border-transparent",
                                sidebarCollapsed && "lg:justify-center lg:px-3 lg:gap-0",
                                activeSection === id
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/10 dark:bg-blue-600/20 dark:text-blue-400 dark:border-blue-500/30"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                            )}
                            title={label}
                        >
                            <Icon size={16} className={activeSection === id ? "text-white dark:text-blue-400" : "text-slate-400"} />
                            <span className={cn("whitespace-nowrap", sidebarCollapsed && "lg:hidden")}>{label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* ── Main Content Area ──────────────────────────────────────── */}
            <main className="min-w-0 w-full space-y-6 pt-0">

                {/* ── GENERAL SETTINGS (DISPLAY MULTIPLE CARDS STACKED) ── */}
                {activeSection === "general" && (
                    <>
                        {/* Card 1: General Settings */}
                        <div className="bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-6 shadow-sm">
                            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                                <div className="flex-1 w-full space-y-5">
                                    <div>
                                        <h2 className="text-slate-900 dark:text-white font-bold text-lg">General Settings</h2>
                                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5 font-medium">Configure general system settings and preferences.</p>
                                    </div>
                                    <Field label="System Name">
                                        <input className={inputCls} value={general.systemName} onChange={(e) => updateGeneralField("systemName", e.target.value)} />
                                    </Field>
                                    <Field label="System Email">
                                        <input className={inputCls} type="email" value={general.systemEmail} onChange={(e) => updateGeneralField("systemEmail", e.target.value)} />
                                    </Field>
                                    <Field label="System Phone">
                                        <div className="relative">
                                            <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input className={cn(inputCls, "pl-10")} value={general.systemPhone} onChange={(e) => updateGeneralField("systemPhone", e.target.value)} />
                                        </div>
                                    </Field>
                                    <Field label="Default Timezone">
                                        <SelectWrapper>
                                            <select className={selectCls} value={general.timezone} onChange={(e) => updateGeneralField("timezone", e.target.value)}>
                                                <option>(GMT+03:00) Nairobi</option>
                                                <option>(GMT+03:00) Mogadishu</option>
                                                <option>(GMT+00:00) UTC</option>
                                                <option>(GMT+04:00) Dubai</option>
                                            </select>
                                        </SelectWrapper>
                                    </Field>
                                </div>
                                <GearGraphic />
                            </div>
                        </div>

                        {/* Card 3: Localization Settings */}
                        <div className="bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-6 shadow-sm">
                            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                                <div className="flex-1 w-full space-y-5">
                                    <div>
                                        <h2 className="text-slate-900 dark:text-white font-bold text-lg">Localization Settings</h2>
                                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5 font-medium">Configure language and currency settings.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Field label="Default Language">
                                            <SelectWrapper>
                                                <select className={selectCls} value={locale.language} onChange={(e) => setLocale({ ...locale, language: e.target.value })}>
                                                    <option>English</option>
                                                    <option>Somali</option>
                                                    <option>Arabic</option>
                                                </select>
                                            </SelectWrapper>
                                        </Field>
                                        <Field label="Default Currency">
                                            <SelectWrapper>
                                                <select className={selectCls} value={locale.currency} onChange={(e) => setLocale({ ...locale, currency: e.target.value })}>
                                                    <option>USD - US Dollar</option>
                                                    <option>SOS - Somali Shilling</option>
                                                    <option>EUR - Euro</option>
                                                    <option>KES - Kenyan Shilling</option>
                                                </select>
                                            </SelectWrapper>
                                        </Field>
                                        <Field label="Date Format">
                                            <input className={inputCls} value={locale.dateFormat} onChange={(e) => setLocale({ ...locale, dateFormat: e.target.value })} />
                                        </Field>
                                        <Field label="Time Format">
                                            <SelectWrapper>
                                                <select className={selectCls} value={locale.timeFormat} onChange={(e) => setLocale({ ...locale, timeFormat: e.target.value })}>
                                                    <option>24 Hours (14:30)</option>
                                                    <option>12 Hours (2:30 PM)</option>
                                                </select>
                                            </SelectWrapper>
                                        </Field>
                                    </div>
                                </div>
                                <EarthGraphic />
                            </div>
                        </div>

                        {/* Card 4: System Maintenance */}
                        <div className="bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-6 shadow-sm">
                            <h2 className="text-slate-900 dark:text-white font-bold text-lg mb-1">System Maintenance</h2>
                            <p className="text-slate-400 dark:text-slate-500 text-sm mb-5 font-medium">Perform system maintenance and cleanup.</p>
                            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-5 items-center">
                                <div>
                                    <p className="text-slate-800 dark:text-slate-200 font-semibold text-sm">Cache Management</p>
                                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">Clear system cache to improve performance.</p>
                                </div>
                                <div>
                                    <p className="text-slate-800 dark:text-slate-200 font-semibold text-sm">System Logs</p>
                                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">View and download system logs.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => runAction("Cache clear queued.")}
                                    className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg shrink-0"
                                >
                                    <RefreshCw size={14} className="animate-spin" style={{ animationDuration: "3s" }} />
                                    Clear Cache
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* ── INDIVIDUAL CARD VIEWS ── */}

                {/* Site Configuration */}
                {activeSection === "site" && (
                    <div className="bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-6 shadow-sm">
                        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                            <div className="flex-1 w-full space-y-5">
                                <div>
                                    <h2 className="text-slate-900 dark:text-white font-bold text-lg">Site Configuration</h2>
                                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5 font-medium">Configure website and application information.</p>
                                </div>
                                <Field label="Site Title">
                                    <input className={inputCls} value={site.siteTitle} onChange={(e) => updateSiteField("siteTitle", e.target.value)} />
                                </Field>
                                <Field label="Site Description">
                                    <input className={inputCls} value={site.siteDesc} onChange={(e) => updateSiteField("siteDesc", e.target.value)} />
                                </Field>
                                <Field label="Logo">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden border border-slate-700 shadow-lg shadow-blue-500/20">
                                            <img src={currentLogo} alt="Current logo" className="h-full w-full object-cover" />
                                        </div>
                                        <button type="button" onClick={handleLogoButtonClick} className="flex items-center gap-2 px-4 py-2 border border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700 text-sm font-semibold rounded-xl transition-all">
                                            <ImageIcon size={14} /> Change Logo
                                        </button>
                                        <button type="button" onClick={handleLogoDelete} className="p-2.5 border border-slate-200 dark:border-[#1e2d4a] text-slate-400 hover:text-red-500 hover:border-red-200 dark:hover:text-red-400 dark:hover:border-red-900/30 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-all bg-transparent">
                                            <Trash2 size={16} />
                                        </button>
                                        <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                                    </div>
                                    {logoError && <p className="text-xs font-semibold text-red-600 dark:text-red-400">{logoError}</p>}
                                </Field>
                            </div>
                            <GlobeGraphic />
                        </div>
                    </div>
                )}

                {/* Email Settings */}
                {activeSection === "email" && (
                    <div className="bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-6 shadow-sm space-y-5">
                        <div>
                            <h2 className="text-slate-900 dark:text-white font-bold text-lg">Email Settings</h2>
                            <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5 font-medium">Configure SMTP and email delivery settings.</p>
                        </div>
                        <Field label="SMTP Host"><input className={inputCls} value={email.host} onChange={(e) => setEmail({ ...email, host: e.target.value })} placeholder="smtp.example.com" /></Field>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="SMTP Port"><input className={inputCls} value={email.port} onChange={(e) => setEmail({ ...email, port: e.target.value })} placeholder="587" /></Field>
                            <Field label="Encryption">
                                <SelectWrapper>
                                    <select className={selectCls} value={email.encryption} onChange={(e) => setEmail({ ...email, encryption: e.target.value })}>
                                        <option>TLS</option>
                                        <option>SSL</option>
                                        <option>None</option>
                                    </select>
                                </SelectWrapper>
                            </Field>
                        </div>
                        <Field label="SMTP Username"><input className={inputCls} value={email.username} onChange={(e) => setEmail({ ...email, username: e.target.value })} placeholder="username@example.com" /></Field>
                        <Field label="SMTP Password"><input className={inputCls} type="password" value={email.password} onChange={(e) => setEmail({ ...email, password: e.target.value })} placeholder="••••••••" /></Field>
                        <Field label="From Email"><input className={inputCls} value={email.from} onChange={(e) => setEmail({ ...email, from: e.target.value })} placeholder="noreply@somalielectric.so" /></Field>
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => runAction("SMTP test requested.")} className="px-5 py-3 border border-slate-200 dark:border-[#1e2d4a] text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-[#0f1d35] transition-all bg-transparent">
                                Test Connection
                            </button>
                        </div>
                    </div>
                )}

                {/* SMS Settings */}
                {activeSection === "sms" && (
                    <div className="bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-6 shadow-sm space-y-5">
                        <div>
                            <h2 className="text-slate-900 dark:text-white font-bold text-lg">SMS Settings</h2>
                            <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5 font-medium">Configure SMS gateway for notifications.</p>
                        </div>
                        <Field label="SMS Provider">
                            <SelectWrapper>
                                <select className={selectCls} value={sms.provider} onChange={(e) => setSms({ ...sms, provider: e.target.value })}>
                                    <option>Twilio</option>
                                    <option>Nexmo</option>
                                    <option>Africa's Talking</option>
                                </select>
                            </SelectWrapper>
                        </Field>
                        <Field label="API Key"><input className={inputCls} value={sms.apiKey} onChange={(e) => setSms({ ...sms, apiKey: e.target.value })} placeholder="Your API key..." /></Field>
                        <Field label="API Secret"><input className={inputCls} type="password" value={sms.apiSecret} onChange={(e) => setSms({ ...sms, apiSecret: e.target.value })} placeholder="••••••••" /></Field>
                        <Field label="Sender ID"><input className={inputCls} value={sms.senderId} onChange={(e) => setSms({ ...sms, senderId: e.target.value })} placeholder="SOMELECTRIC" /></Field>
                    </div>
                )}

                {/* Payment Settings */}
                {activeSection === "payment" && (
                    <div className="bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-6 shadow-sm space-y-5">
                        <div>
                            <h2 className="text-slate-900 dark:text-white font-bold text-lg">Payment Settings</h2>
                            <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5 font-medium">Configure payment gateways and billing.</p>
                        </div>
                        <Field label="Payment Gateway">
                            <SelectWrapper>
                                <select className={selectCls} value={payment.gateway} onChange={(e) => setPayment({ ...payment, gateway: e.target.value })}>
                                    <option>Stripe</option>
                                    <option>PayPal</option>
                                    <option>Hormuud</option>
                                    <option>EVC Plus</option>
                                </select>
                            </SelectWrapper>
                        </Field>
                        <Field label="API Key"><input className={inputCls} value={payment.apiKey} onChange={(e) => setPayment({ ...payment, apiKey: e.target.value })} placeholder="pk_live_..." /></Field>
                        <Field label="Secret Key"><input className={inputCls} type="password" value={payment.secretKey} onChange={(e) => setPayment({ ...payment, secretKey: e.target.value })} placeholder="sk_live_..." /></Field>
                        <Field label="Webhook URL"><input className={inputCls} value={payment.webhook} onChange={(e) => setPayment({ ...payment, webhook: e.target.value })} placeholder="https://somalielectric.so/webhook/payment" /></Field>
                    </div>
                )}

                {/* Security Settings */}
                {activeSection === "security" && (
                    <div className="bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-6 shadow-sm space-y-5">
                        <div>
                            <h2 className="text-slate-900 dark:text-white font-bold text-lg">Security Settings</h2>
                            <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5 font-medium">Manage authentication, sessions and access control.</p>
                        </div>
                        {[
                            { key: "twoFactor", label: "Two-Factor Authentication", desc: "Require 2FA for all admin accounts" },
                            { key: "ipAllow", label: "IP Allowlist", desc: "Restrict admin access to trusted IPs" },
                            { key: "timeout", label: "Session Timeout", desc: "Auto-logout after 30 minutes of inactivity" },
                            { key: "rateLimit", label: "Rate Limiting", desc: "Limit login attempts to prevent brute force" },
                        ].map(({ key, label, desc }) => (
                            <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#0f1629] border border-slate-100 dark:border-[#1e2d4a]">
                                <div>
                                    <p className="text-slate-800 dark:text-slate-200 font-semibold text-sm">{label}</p>
                                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5 font-medium">{desc}</p>
                                </div>
                                <button
                                    onClick={() => setSecurity({ ...security, [key]: !security[key] })}
                                    role="switch"
                                    aria-checked={Boolean(security[key])}
                                    aria-label={label}
                                    className={cn(
                                        "relative h-6 w-11 rounded-full transition-colors outline-none",
                                        security[key] ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                                    )}
                                >
                                    <span className={cn(
                                        "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                                        security[key] ? "translate-x-5" : "translate-x-0"
                                    )} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Notification Settings */}
                {activeSection === "notifications" && (
                    <div className="bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-6 shadow-sm space-y-5">
                        <div>
                            <h2 className="text-slate-900 dark:text-white font-bold text-lg">Notification Settings</h2>
                            <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5 font-medium">Configure system notification channels and events.</p>
                        </div>
                        {[
                            { key: "emailAlerts", label: "Email Notifications", desc: "Send email alerts for critical events" },
                            { key: "smsAlerts", label: "SMS Notifications", desc: "Send SMS for urgent operational alerts" },
                            { key: "pushAlerts", label: "Push Notifications", desc: "Browser push notifications for admins" },
                            { key: "slackAlerts", label: "Slack Integration", desc: "Send alerts to Slack channels" },
                            { key: "weeklyDigest", label: "Weekly Digest", desc: "Summary report every Monday morning" },
                        ].map(({ key, label, desc }) => (
                            <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#0f1629] border border-slate-100 dark:border-[#1e2d4a]">
                                <div>
                                    <p className="text-slate-800 dark:text-slate-200 font-semibold text-sm">{label}</p>
                                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5 font-medium">{desc}</p>
                                </div>
                                <button
                                    onClick={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
                                    role="switch"
                                    aria-checked={Boolean(notifications[key])}
                                    aria-label={label}
                                    className={cn(
                                        "relative h-6 w-11 rounded-full transition-colors outline-none",
                                        notifications[key] ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                                    )}
                                >
                                    <span className={cn(
                                        "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                                        notifications[key] ? "translate-x-5" : "translate-x-0"
                                    )} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Backup & Restore */}
                {activeSection === "backup" && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-6 shadow-sm space-y-5">
                            <div>
                                <h2 className="text-slate-900 dark:text-white font-bold text-lg">Backup & Restore</h2>
                                <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5 font-medium">Manage system backups and data restoration.</p>
                            </div>
                            <Field label="Backup Frequency">
                                <SelectWrapper>
                                    <select className={selectCls}>
                                        <option>Daily</option>
                                        <option>Weekly</option>
                                        <option>Monthly</option>
                                    </select>
                                </SelectWrapper>
                            </Field>
                            <Field label="Retention Period">
                                <SelectWrapper>
                                    <select className={selectCls}>
                                        <option>30 days</option>
                                        <option>60 days</option>
                                        <option>90 days</option>
                                    </select>
                                </SelectWrapper>
                            </Field>
                            <div className="flex flex-wrap gap-3 pt-2">
                                <button type="button" onClick={() => runAction("Backup job started.")} className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg">
                                    <Database size={14} />
                                    Create Backup Now
                                </button>
                                <button type="button" onClick={() => runAction("Latest backup download requested.")} className="flex items-center gap-2 px-5 py-3 border border-slate-200 dark:border-[#1e2d4a] text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-[#0f1d35] transition-all bg-transparent">
                                    <Download size={14} />
                                    Download Latest
                                </button>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-6 shadow-sm">
                            <h3 className="text-slate-800 dark:text-slate-200 font-bold text-sm mb-4">Recent Backups</h3>
                            <div className="space-y-2">
                                {[
                                    { name: "backup_2026-05-27_02-00.zip", size: "45.2 MB", date: "May 27, 2026 2:00 AM" },
                                    { name: "backup_2026-05-26_02-00.zip", size: "44.8 MB", date: "May 26, 2026 2:00 AM" },
                                    { name: "backup_2026-05-25_02-00.zip", size: "44.5 MB", date: "May 25, 2026 2:00 AM" },
                                ].map(({ name, size, date }) => (
                                    <div key={name} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#0f1629] border border-slate-100 dark:border-[#1e2d4a]">
                                        <div>
                                            <p className="text-slate-700 dark:text-slate-300 text-xs font-mono font-semibold">{name}</p>
                                            <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-0.5 font-medium">{date} · {size}</p>
                                        </div>
                                        <button type="button" onClick={() => runAction(`Download requested for ${name}.`)} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-bold flex items-center gap-1 bg-transparent">
                                            <Download size={12} /> Download
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Maintenance Mode */}
                {activeSection === "maintenance" && (
                    <div className="bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-6 shadow-sm space-y-5">
                        <div>
                            <h2 className="text-slate-900 dark:text-white font-bold text-lg">Maintenance Mode</h2>
                            <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5 font-medium">Enable maintenance mode to restrict access during updates.</p>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/25">
                            <div>
                                <p className="text-amber-700 dark:text-amber-400 font-bold text-sm">Maintenance Mode</p>
                                <p className="text-slate-500 dark:text-slate-500 text-xs mt-0.5 font-semibold">When enabled, only admins can access the system.</p>
                            </div>
                            <button
                                onClick={() => setMaintenance({ ...maintenance, enabled: !maintenance.enabled })}
                                role="switch"
                                aria-checked={maintenance.enabled}
                                aria-label="Maintenance mode"
                                className={cn(
                                    "relative h-6 w-11 rounded-full transition-colors outline-none",
                                    maintenance.enabled ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"
                                )}
                            >
                                <span className={cn(
                                    "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                                    maintenance.enabled ? "translate-x-5" : "translate-x-0"
                                )} />
                            </button>
                        </div>
                        <Field label="Maintenance Message">
                            <textarea
                                rows={3}
                                className={cn(inputCls, "resize-none")}
                                value={maintenance.message}
                                onChange={(e) => setMaintenance({ ...maintenance, message: e.target.value })}
                                placeholder="We're currently performing scheduled maintenance. We'll be back soon!"
                            />
                        </Field>
                        <Field label="Expected Duration">
                            <input
                                className={inputCls}
                                value={maintenance.duration}
                                onChange={(e) => setMaintenance({ ...maintenance, duration: e.target.value })}
                                placeholder="e.g. 2 hours"
                            />
                        </Field>
                    </div>
                )}

                {/* System Logs */}
                {activeSection === "logs" && (
                    <div className="bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-slate-900 dark:text-white font-bold text-lg">System Logs</h2>
                                <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5 font-medium">View and download system activity logs.</p>
                            </div>
                            <button type="button" onClick={() => runAction("Log export started.")} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg">
                                <Download size={14} /> Export Logs
                            </button>
                        </div>
                        <div className="space-y-1 font-mono text-xs bg-slate-900 rounded-xl p-4 max-h-96 overflow-y-auto border border-slate-950">
                            {[
                                { time: "2026-05-27 14:23:01", level: "INFO", msg: "User admin@somalielectric.so logged in" },
                                { time: "2026-05-27 14:20:15", level: "INFO", msg: "Company BECO updated successfully" },
                                { time: "2026-05-27 14:15:32", level: "WARN", msg: "High memory usage detected: 82%" },
                                { time: "2026-05-27 13:58:47", level: "INFO", msg: "Backup completed successfully (45.2 MB)" },
                                { time: "2026-05-27 13:45:22", level: "ERROR", msg: "SMS gateway timeout - retry scheduled" },
                                { time: "2026-05-27 13:30:11", level: "INFO", msg: "New company Galkayo Power registered" },
                                { time: "2026-05-27 13:15:03", level: "INFO", msg: "Cache cleared by admin" },
                                { time: "2026-05-27 12:58:44", level: "INFO", msg: "System health check passed" },
                            ].map(({ time, level, msg }) => (
                                <div key={time + msg} className="flex gap-3 py-0.5 text-slate-300">
                                    <span className="text-slate-500 shrink-0">{time}</span>
                                    <span className={cn("shrink-0 w-12 font-bold",
                                        level === "ERROR" ? "text-red-400" : level === "WARN" ? "text-amber-400" : "text-emerald-400"
                                    )}>[{level}]</span>
                                    <span>{msg}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* API Settings */}
                {activeSection === "api" && (
                    <div className="bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-6 shadow-sm space-y-5">
                        <div>
                            <h2 className="text-slate-900 dark:text-white font-bold text-lg">API Settings</h2>
                            <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5 font-medium">Manage API keys and third-party integrations.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0f1629] border border-slate-100 dark:border-[#1e2d4a]">
                            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">API Key</p>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <code className="flex-1 text-emerald-600 dark:text-emerald-400 text-xs font-mono bg-white dark:bg-[#060d1f] border border-slate-200 dark:border-transparent px-4 py-2.5 rounded-lg select-all">
                                    {apiKeyVisible ? "sea_live_sk_demo_key_value" : "sea_live_sk_••••••••••••••••••••••••••••••"}
                                </code>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setApiKeyVisible((current) => !current)}
                                        className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1e2d4a] rounded-lg hover:bg-slate-50 dark:hover:bg-[#0f1d35] transition-all bg-transparent"
                                    >
                                        {apiKeyVisible ? "Hide" : "Reveal"}
                                    </button>
                                    <button type="button" onClick={() => runAction("API key regeneration requested.")} className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all bg-transparent">
                                        Regenerate
                                    </button>
                                </div>
                            </div>
                        </div>
                        <Field label="Webhook URL">
                            <input className={inputCls} value={api.webhook} onChange={(e) => setApi({ ...api, webhook: e.target.value })} placeholder="https://yourdomain.com/webhook" />
                        </Field>
                        <Field label="Allowed Origins (CORS)">
                            <textarea rows={3} className={cn(inputCls, "resize-none")} value={api.origins} onChange={(e) => setApi({ ...api, origins: e.target.value })} placeholder="https://app.somalielectric.so&#10;https://admin.somalielectric.so" />
                        </Field>
                    </div>
                )}

                {/* Save Changes Bottom Row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <div className="flex-1">
                        {actionMessage && (
                            <div className="mb-3 flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-400 text-sm font-semibold">
                                <ArrowRight size={16} />
                                {actionMessage}
                            </div>
                        )}
                        {saved && (
                            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-semibold animate-pulse">
                                <CheckCircle2 size={16} />
                                {savedMessage}
                            </div>
                        )}
                    </div>
                    
                    <button
                        onClick={handleSave}
                        className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/10 shadow-blue-500/5 text-center shrink-0"
                    >
                        Save Changes
                    </button>
                </div>
            </main>
            </div>
        </div>
    );
}
