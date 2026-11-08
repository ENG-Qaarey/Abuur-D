"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
    Building2,
    Image as ImageIcon,
    CreditCard,
    Bell,
    Shield,
    Mail,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    Phone,
    Trash2,
    RefreshCw,
    Download,
    Database,
    Gauge,
} from "lucide-react";
import { useBrandSettings } from "@/store/brand-settings.store";
import { useTheme } from "@/components/theme-provider";
import { COMPANY_OWNER_NAME } from "@/data/company-owner-mock";
import {
    companyBrandColorsFromStore,
    DEFAULT_COMPANY_BRAND_COLORS,
    type CompanyBrandColors,
} from "@/lib/brand-colors";
import { CompanyBrandColorsEditor } from "@/components/company-owner/shared/CompanyBrandColors";
import {
    CoCard,
    CoField,
    CoHeroBanner,
    CoSaveBar,
    CoSectionHeader,
    CoSelectWrapper,
    CoStatPill,
    CoToggle,
    coInputCls,
    coSelectCls,
} from "@/components/company-owner/shared/profile-settings-ui";
import Link from "next/link";

type SettingsSection = "general" | "branding" | "billing" | "notifications" | "security" | "email" | "sms";

const DEFAULT_COMPANY = {
    name: COMPANY_OWNER_NAME,
    email: "admin@beco.so",
    phone: "+252 61 500 0000",
    address: "Hodan District, Mogadishu, Somalia",
    website: "https://beco.so",
    taxId: "TIN-2024-88421",
    timezone: "(GMT+03:00) Mogadishu",
};

const DEFAULT_LOCALE = {
    language: "English",
    currency: "USD - US Dollar",
    billingCycle: "Monthly (1st of month)",
};

const DEFAULT_TAGLINE = "Reliable power for Mogadishu";

const DEFAULT_BILLING = {
    defaultTariff: "Standard residential",
    lateFee: "5%",
    graceDays: "7",
    gateways: ["EVC Plus", "eDahab", "Bank transfer"] as string[],
};

const DEFAULT_NOTIFICATIONS: Record<string, boolean> = {
    emailAlerts: true,
    smsAlerts: true,
    outageAlerts: true,
    billReminders: true,
    paymentConfirm: true,
    staffDigest: false,
};

const DEFAULT_SECURITY: Record<string, boolean> = {
    twoFactor: true,
    staffIpLock: false,
    sessionTimeout: true,
    auditLog: true,
};

const DEFAULT_EMAIL = {
    host: "smtp.beco.so",
    port: "587",
    from: "billing@beco.so",
    username: "",
    password: "",
};

const DEFAULT_SMS = {
    provider: "Africa's Talking",
    senderId: "BECO",
    apiKey: "",
};

const navItems: { id: SettingsSection; label: string; icon: React.ElementType }[] = [
    { id: "general", label: "Company Profile", icon: Building2 },
    { id: "branding", label: "Branding & Logo", icon: ImageIcon },
    { id: "billing", label: "Billing & Tariffs", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "email", label: "Email Settings", icon: Mail },
    { id: "sms", label: "SMS Settings", icon: MessageSquare },
];

function BuildingGraphic() {
    return (
        <div className="w-32 h-32 shrink-0 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
            <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.25)]">
                <Building2 size={44} className="text-emerald-600 dark:text-emerald-400" />
            </div>
        </div>
    );
}

function MeterGraphic() {
    return (
        <div className="w-32 h-32 shrink-0 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-cyan-500/15 blur-xl rounded-full" />
            <div className="relative w-24 h-24 rounded-full border-2 border-cyan-500/40 flex items-center justify-center bg-cyan-500/5">
                <Gauge size={40} className="text-cyan-600 dark:text-cyan-400 animate-pulse" />
            </div>
        </div>
    );
}

export default function CompanyOwnerSettingsPage() {
    const [activeSection, setActiveSection] = useState<SettingsSection>("general");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [saved, setSaved] = useState(false);
    const [savedMessage, setSavedMessage] = useState("Settings saved.");
    const [actionMessage, setActionMessage] = useState("");
    const [logoError, setLogoError] = useState("");
    const { branding, setBranding } = useBrandSettings();
    const { resolvedTheme } = useTheme();
    const logoInputRef = useRef<HTMLInputElement | null>(null);

    const [company, setCompany] = useState({ ...DEFAULT_COMPANY });

    const [locale, setLocale] = useState({ ...DEFAULT_LOCALE });

    const [tagline, setTagline] = useState(DEFAULT_TAGLINE);
    const [brandColors, setBrandColors] = useState<CompanyBrandColors>(() => companyBrandColorsFromStore(branding));
    const [billing, setBilling] = useState({ ...DEFAULT_BILLING });

    const tariffPlans = ["Standard residential", "Commercial tier 1", "Industrial"];
    const gatewayOptions = ["EVC Plus", "eDahab", "Bank transfer", "Sahal", "Premier Wallet"];

    const [notifications, setNotifications] = useState<Record<string, boolean>>({ ...DEFAULT_NOTIFICATIONS });

    const [security, setSecurity] = useState<Record<string, boolean>>({ ...DEFAULT_SECURITY });

    const [email, setEmail] = useState({ ...DEFAULT_EMAIL });

    const [sms, setSms] = useState({ ...DEFAULT_SMS });

    useEffect(() => {
        setCompany((c) => ({
            ...c,
            name: branding.brandName || COMPANY_OWNER_NAME,
            email: branding.supportEmail || c.email,
            phone: branding.supportPhone || c.phone,
        }));
        if (branding.brandTagline) setTagline(branding.brandTagline);
        setBrandColors(companyBrandColorsFromStore(branding));
    }, [branding]);

    const handleBrandColorsChange = (colors: CompanyBrandColors) => {
        setBrandColors(colors);
        setBranding({
            primaryColor: colors.primaryColor,
            secondaryColor: colors.secondaryColor,
            sidebarDepthColor: colors.sidebarDepthColor,
            accentColor: colors.primaryColor,
        });
    };

    const currentLogo =
        resolvedTheme === "dark" ? branding.logoDark || "/iconDark.png" : branding.logoLight || "/iconLight.png";

    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setLogoError("Please select an image file.");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setLogoError("Logo must be 2MB or smaller.");
            return;
        }
        setLogoError("");
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = typeof reader.result === "string" ? reader.result : "";
            if (resolvedTheme === "dark") setBranding({ logoDark: dataUrl });
            else setBranding({ logoLight: dataUrl });
        };
        reader.readAsDataURL(file);
        event.target.value = "";
    };

    const handleSave = () => {
        setBranding({
            brandName: company.name,
            brandTagline: tagline,
            supportEmail: company.email,
            supportPhone: company.phone,
            address: company.address,
            primaryColor: brandColors.primaryColor,
            secondaryColor: brandColors.secondaryColor,
            sidebarDepthColor: brandColors.sidebarDepthColor,
            accentColor: brandColors.primaryColor,
        });
        setSavedMessage(`${navItems.find((n) => n.id === activeSection)?.label} saved.`);
        setSaved(true);
        setActionMessage("");
        setTimeout(() => setSaved(false), 3000);
    };

    const handleReset = () => {
        setActionMessage("");
        setSaved(false);

        switch (activeSection) {
            case "general":
                setCompany({ ...DEFAULT_COMPANY });
                setLocale({ ...DEFAULT_LOCALE });
                break;
            case "branding":
                setCompany((c) => ({ ...c, name: DEFAULT_COMPANY.name }));
                setTagline(DEFAULT_TAGLINE);
                handleBrandColorsChange({ ...DEFAULT_COMPANY_BRAND_COLORS });
                setBranding({
                    brandName: DEFAULT_COMPANY.name,
                    brandTagline: DEFAULT_TAGLINE,
                    logoLight: "/iconLight.png",
                    logoDark: "/iconDark.png",
                    primaryColor: DEFAULT_COMPANY_BRAND_COLORS.primaryColor,
                    secondaryColor: DEFAULT_COMPANY_BRAND_COLORS.secondaryColor,
                    sidebarDepthColor: DEFAULT_COMPANY_BRAND_COLORS.sidebarDepthColor,
                    accentColor: DEFAULT_COMPANY_BRAND_COLORS.primaryColor,
                });
                setLogoError("");
                break;
            case "billing":
                setBilling({ ...DEFAULT_BILLING, gateways: [...DEFAULT_BILLING.gateways] });
                break;
            case "notifications":
                setNotifications({ ...DEFAULT_NOTIFICATIONS });
                break;
            case "security":
                setSecurity({ ...DEFAULT_SECURITY });
                break;
            case "email":
                setEmail({ ...DEFAULT_EMAIL });
                break;
            case "sms":
                setSms({ ...DEFAULT_SMS });
                break;
        }

        setActionMessage(`${navItems.find((n) => n.id === activeSection)?.label} reset to defaults.`);
        setTimeout(() => setActionMessage(""), 4000);
    };

    const toggleGateway = (name: string) => {
        setBilling((b) => ({
            ...b,
            gateways: b.gateways.includes(name) ? b.gateways.filter((g) => g !== name) : [...b.gateways, name],
        }));
    };

    return (
        <div className="w-full max-w-full overflow-x-hidden space-y-5 pb-8">
            <CoHeroBanner
                badge="Workspace settings"
                title="Company Settings"
                description={`Configure ${company.name} — profile, branding, billing, notifications, and integrations.`}
                actions={
                    <Link
                        href="/company-owner/profile"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20"
                    >
                        Profile settings →
                    </Link>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <CoStatPill label="Plan" value="Enterprise" trend="Unlimited meters" />
                <CoStatPill label="Customers" value="12,480" trend="Active fleet" />
                <CoStatPill label="Last backup" value="Today" trend="02:00 AM · 42 MB" />
                <CoStatPill label="Integrations" value="3/5" trend="Email · SMS · EVC" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[auto_minmax(0,1fr)] gap-6 items-start">
                <aside
                    className={cn(
                        "relative shrink-0 bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-4 shadow-sm w-full lg:sticky lg:top-4",
                        sidebarCollapsed ? "lg:w-20" : "lg:w-60",
                    )}
                >
                    <button
                        type="button"
                        onClick={() => setSidebarCollapsed((c) => !c)}
                        className="absolute -right-3 top-5 z-20 h-7 w-7 rounded-full border border-slate-200 bg-slate-950 text-slate-200 hidden lg:flex items-center justify-center hover:bg-emerald-600"
                        aria-label="Toggle settings menu"
                    >
                        {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>
                    <nav className="space-y-1">
                        {navItems.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setActiveSection(id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left",
                                    sidebarCollapsed && "lg:justify-center lg:px-3",
                                    activeSection === id
                                        ? "bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg shadow-emerald-600/15"
                                        : "text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5",
                                )}
                                title={label}
                            >
                                <Icon size={16} />
                                <span className={cn(sidebarCollapsed && "lg:hidden")}>{label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="min-w-0 space-y-6">
                    {activeSection === "general" && (
                        <>
                            <div className="co-owner-card bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-6 shadow-sm">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-5">
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Company profile</h2>
                                            <p className="text-slate-400 text-sm font-medium">Legal and contact information for your utility.</p>
                                        </div>
                                        <CoField label="Company Name">
                                            <input className={coInputCls} value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} />
                                        </CoField>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <CoField label="Contact Email">
                                                <input className={coInputCls} type="email" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} />
                                            </CoField>
                                            <CoField label="Phone">
                                                <div className="relative">
                                                    <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input className={cn(coInputCls, "pl-10")} value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} />
                                                </div>
                                            </CoField>
                                        </div>
                                        <CoField label="Address">
                                            <input className={coInputCls} value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} />
                                        </CoField>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <CoField label="Website">
                                                <input className={coInputCls} value={company.website} onChange={(e) => setCompany({ ...company, website: e.target.value })} />
                                            </CoField>
                                            <CoField label="Tax ID">
                                                <input className={coInputCls} value={company.taxId} onChange={(e) => setCompany({ ...company, taxId: e.target.value })} />
                                            </CoField>
                                        </div>
                                    </div>
                                    <BuildingGraphic />
                                </div>
                            </div>

                            <div className="co-owner-card bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-6 shadow-sm">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-5">
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Regional preferences</h2>
                                            <p className="text-slate-400 text-sm font-medium">Language, currency, and billing cycle.</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <CoField label="Default Language">
                                                <CoSelectWrapper>
                                                    <select className={coSelectCls} value={locale.language} onChange={(e) => setLocale({ ...locale, language: e.target.value })}>
                                                        <option>English</option>
                                                        <option>Somali</option>
                                                        <option>Arabic</option>
                                                    </select>
                                                </CoSelectWrapper>
                                            </CoField>
                                            <CoField label="Currency">
                                                <CoSelectWrapper>
                                                    <select className={coSelectCls} value={locale.currency} onChange={(e) => setLocale({ ...locale, currency: e.target.value })}>
                                                        <option>USD - US Dollar</option>
                                                        <option>SOS - Somali Shilling</option>
                                                    </select>
                                                </CoSelectWrapper>
                                            </CoField>
                                            <CoField label="Timezone">
                                                <CoSelectWrapper>
                                                    <select className={coSelectCls} value={company.timezone} onChange={(e) => setCompany({ ...company, timezone: e.target.value })}>
                                                        <option>(GMT+03:00) Mogadishu</option>
                                                        <option>(GMT+03:00) Nairobi</option>
                                                    </select>
                                                </CoSelectWrapper>
                                            </CoField>
                                            <CoField label="Billing cycle">
                                                <CoSelectWrapper>
                                                    <select className={coSelectCls} value={locale.billingCycle} onChange={(e) => setLocale({ ...locale, billingCycle: e.target.value })}>
                                                        <option>Monthly (1st of month)</option>
                                                        <option>Bi-weekly</option>
                                                    </select>
                                                </CoSelectWrapper>
                                            </CoField>
                                        </div>
                                    </div>
                                    <MeterGraphic />
                                </div>
                            </div>

                            <CoCard className="p-6 space-y-4">
                                <CoSectionHeader title="Data & maintenance" description="Export, backup, and cache for your company workspace." icon={Database} />
                                <div className="flex flex-wrap gap-3">
                                    <button type="button" onClick={() => setActionMessage("Cache cleared successfully.")} className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md">
                                        <RefreshCw size={14} /> Clear cache
                                    </button>
                                    <button type="button" onClick={() => setActionMessage("Customer export started — check your email.")} className="flex items-center gap-2 px-5 py-3 border border-slate-200 dark:border-[#1e2d4a] text-sm font-semibold rounded-xl hover:bg-emerald-500/5">
                                        <Download size={14} /> Export customers
                                    </button>
                                    <button type="button" onClick={() => setActionMessage("Backup queued for tonight 02:00.")} className="flex items-center gap-2 px-5 py-3 border border-slate-200 dark:border-[#1e2d4a] text-sm font-semibold rounded-xl hover:bg-emerald-500/5">
                                        <Database size={14} /> Backup now
                                    </button>
                                </div>
                                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#1a2744]">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent backups</p>
                                    {[
                                        { name: "beco_backup_2026-05-28.zip", size: "42.1 MB", when: "Today 02:00" },
                                        { name: "beco_backup_2026-05-27.zip", size: "41.8 MB", when: "Yesterday" },
                                    ].map((b) => (
                                        <div key={b.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0f1629] border border-slate-100 dark:border-[#1e2d4a] text-xs">
                                            <div>
                                                <p className="font-mono font-semibold text-slate-700 dark:text-slate-300">{b.name}</p>
                                                <p className="text-slate-400 mt-0.5">{b.when} · {b.size}</p>
                                            </div>
                                            <button type="button" className="text-emerald-600 font-bold hover:underline">Download</button>
                                        </div>
                                    ))}
                                </div>
                            </CoCard>
                        </>
                    )}

                    {activeSection === "branding" && (
                        <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6">
                            <CoCard className="p-6 space-y-5">
                                <CoSectionHeader title="Branding & logo" description="Shown on bills, customer app, and staff portal." icon={ImageIcon} />
                                <CoField label="Company display name">
                                    <input className={coInputCls} value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} />
                                </CoField>
                                <CoField label="Tagline">
                                    <input className={coInputCls} value={tagline} onChange={(e) => setTagline(e.target.value)} />
                                </CoField>
                                <CoField label="Logo" hint="PNG or SVG · max 2MB">
                                    <div className="flex items-center gap-3 flex-wrap p-4 rounded-xl bg-slate-50 dark:bg-[#0f1629] border border-dashed border-emerald-500/30">
                                        <div className="w-16 h-16 rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden border border-slate-700 shadow-lg">
                                            <img src={currentLogo} alt="Logo" className="h-full w-full object-contain p-1.5" />
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => logoInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-[#1e2d4a] text-sm font-semibold rounded-xl hover:bg-emerald-500/10 hover:border-emerald-500/30">
                                                <ImageIcon size={14} /> Upload logo
                                            </button>
                                            <button type="button" onClick={() => setBranding({ logoLight: "", logoDark: "" })} className="p-2.5 border border-slate-200 dark:border-[#1e2d4a] text-slate-400 hover:text-red-500 rounded-xl">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                                    </div>
                                    {logoError && <p className="text-xs text-red-500 font-semibold">{logoError}</p>}
                                </CoField>
                                <div className="pt-2 border-t border-slate-100 dark:border-[#1a2744]">
                                    <CompanyBrandColorsEditor colors={brandColors} onChange={handleBrandColorsChange} />
                                </div>
                            </CoCard>
                            <CoCard className="p-5 xl:sticky xl:top-4">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Bill preview</p>
                                <div className="rounded-xl border border-slate-200 dark:border-[#1e2d4a] overflow-hidden bg-white dark:bg-[#060d1f] shadow-inner">
                                    <div
                                        className="h-2"
                                        style={{ background: `linear-gradient(90deg, ${brandColors.primaryColor}, ${brandColors.secondaryColor})` }}
                                    />
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <img src={currentLogo} alt="" className="w-8 h-8 object-contain" />
                                            <div>
                                                <p className="text-xs font-black text-slate-900 dark:text-white">{company.name}</p>
                                                <p className="text-[9px] text-slate-500">{tagline}</p>
                                            </div>
                                        </div>
                                        <div className="h-px bg-slate-100 dark:bg-[#1a2744]" />
                                        <p className="text-[10px] text-slate-500">Customer · Meter #88421</p>
                                        <p className="text-lg font-black" style={{ color: brandColors.primaryColor }}>$48.20</p>
                                    </div>
                                </div>
                            </CoCard>
                        </div>
                    )}

                    {activeSection === "billing" && (
                        <CoCard className="p-6 space-y-6">
                            <CoSectionHeader title="Billing & tariffs" description="Default rates and payment channels for your customers." icon={CreditCard} />
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Default tariff plan</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {tariffPlans.map((plan) => (
                                        <button
                                            key={plan}
                                            type="button"
                                            onClick={() => setBilling({ ...billing, defaultTariff: plan })}
                                            className={cn(
                                                "p-4 rounded-xl border-2 text-left transition-all",
                                                billing.defaultTariff === plan
                                                    ? "border-emerald-500 bg-emerald-500/5 shadow-md shadow-emerald-500/10"
                                                    : "border-slate-200 dark:border-[#1e2d4a] hover:border-emerald-500/40",
                                            )}
                                        >
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{plan}</p>
                                            <p className="text-[10px] text-slate-400 mt-1">
                                                {plan.includes("residential") ? "$0.12/kWh" : plan.includes("Commercial") ? "$0.18/kWh" : "$0.22/kWh"}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <CoField label="Late payment fee (%)">
                                    <input className={coInputCls} value={billing.lateFee} onChange={(e) => setBilling({ ...billing, lateFee: e.target.value })} />
                                </CoField>
                                <CoField label="Grace period (days)">
                                    <input className={coInputCls} value={billing.graceDays} onChange={(e) => setBilling({ ...billing, graceDays: e.target.value })} />
                                </CoField>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Payment gateways</p>
                                <div className="flex flex-wrap gap-2">
                                    {gatewayOptions.map((gw) => (
                                        <button
                                            key={gw}
                                            type="button"
                                            onClick={() => toggleGateway(gw)}
                                            className={cn(
                                                "px-3 py-2 rounded-xl text-xs font-bold border transition-all",
                                                billing.gateways.includes(gw)
                                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                                                    : "border-slate-200 dark:border-[#1e2d4a] text-slate-600 dark:text-slate-400 hover:border-emerald-500/40",
                                            )}
                                        >
                                            {gw}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CoCard>
                    )}

                    {activeSection === "notifications" && (
                        <div className="co-owner-card bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-6 shadow-sm space-y-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notification preferences</h2>
                                <p className="text-slate-400 text-sm font-medium">Alerts for you and your operations team.</p>
                            </div>
                            {[
                                { key: "emailAlerts", label: "Email alerts", desc: "Billing, outages, and support escalations" },
                                { key: "smsAlerts", label: "SMS alerts", desc: "Urgent operational notifications" },
                                { key: "outageAlerts", label: "Outage notifications", desc: "When meters or zones go offline" },
                                { key: "billReminders", label: "Bill reminders", desc: "Notify customers before due dates" },
                                { key: "paymentConfirm", label: "Payment confirmations", desc: "When customers complete payments" },
                                { key: "staffDigest", label: "Weekly staff digest", desc: "Summary every Monday morning" },
                            ].map(({ key, label, desc }) => (
                                <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#0f1629] border border-slate-100 dark:border-[#1e2d4a]">
                                    <div>
                                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{label}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                                    </div>
                                    <CoToggle checked={Boolean(notifications[key])} onChange={(v) => setNotifications({ ...notifications, [key]: v })} label={label} />
                                </div>
                            ))}
                        </div>
                    )}

                    {activeSection === "security" && (
                        <div className="co-owner-card bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-6 shadow-sm space-y-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Security settings</h2>
                                <p className="text-slate-400 text-sm font-medium">Protect company data and staff access.</p>
                            </div>
                            {[
                                { key: "twoFactor", label: "Require 2FA for owners", desc: "Extra verification for owner accounts" },
                                { key: "staffIpLock", label: "Staff IP allowlist", desc: "Restrict staff logins to office IPs" },
                                { key: "sessionTimeout", label: "Session timeout", desc: "Auto-logout after 30 minutes idle" },
                                { key: "auditLog", label: "Audit logging", desc: "Track changes to bills and customers" },
                            ].map(({ key, label, desc }) => (
                                <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#0f1629] border border-slate-100 dark:border-[#1e2d4a]">
                                    <div>
                                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{label}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                                    </div>
                                    <CoToggle checked={Boolean(security[key])} onChange={(v) => setSecurity({ ...security, [key]: v })} label={label} />
                                </div>
                            ))}
                        </div>
                    )}

                    {activeSection === "email" && (
                        <div className="co-owner-card bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-6 shadow-sm space-y-5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Email settings</h2>
                                <p className="text-slate-400 text-sm font-medium">SMTP for bills and customer notifications.</p>
                            </div>
                            <CoField label="SMTP Host"><input className={coInputCls} value={email.host} onChange={(e) => setEmail({ ...email, host: e.target.value })} /></CoField>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <CoField label="Port"><input className={coInputCls} value={email.port} onChange={(e) => setEmail({ ...email, port: e.target.value })} /></CoField>
                                <CoField label="From address"><input className={coInputCls} value={email.from} onChange={(e) => setEmail({ ...email, from: e.target.value })} /></CoField>
                            </div>
                            <CoField label="Username"><input className={coInputCls} value={email.username} onChange={(e) => setEmail({ ...email, username: e.target.value })} /></CoField>
                            <CoField label="Password"><input type="password" className={coInputCls} value={email.password} onChange={(e) => setEmail({ ...email, password: e.target.value })} /></CoField>
                            <button type="button" onClick={() => setActionMessage("SMTP test queued.")} className="px-5 py-3 border border-slate-200 dark:border-[#1e2d4a] text-sm font-semibold rounded-xl hover:bg-emerald-500/5">
                                Test connection
                            </button>
                        </div>
                    )}

                    {activeSection === "sms" && (
                        <div className="co-owner-card bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-6 shadow-sm space-y-5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">SMS settings</h2>
                                <p className="text-slate-400 text-sm font-medium">Gateway for outage and payment SMS.</p>
                            </div>
                            <CoField label="Provider">
                                <CoSelectWrapper>
                                    <select className={coSelectCls} value={sms.provider} onChange={(e) => setSms({ ...sms, provider: e.target.value })}>
                                        <option>Africa&apos;s Talking</option>
                                        <option>Twilio</option>
                                        <option>Hormuud SMS</option>
                                    </select>
                                </CoSelectWrapper>
                            </CoField>
                            <CoField label="Sender ID"><input className={coInputCls} value={sms.senderId} onChange={(e) => setSms({ ...sms, senderId: e.target.value })} /></CoField>
                            <CoField label="API Key"><input className={coInputCls} value={sms.apiKey} onChange={(e) => setSms({ ...sms, apiKey: e.target.value })} placeholder="Your API key" /></CoField>
                        </div>
                    )}

                    <CoSaveBar
                        saved={saved}
                        savedMessage={savedMessage}
                        actionMessage={actionMessage}
                        onSave={handleSave}
                        onReset={handleReset}
                        resetLabel="Reset section"
                    />
                </main>
            </div>

            <footer className="pt-4 border-t border-slate-200/50 dark:border-[#1a2744]/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400 text-xs font-semibold">
                <span>© 2026 {company.name}</span>
                <span>Settings · v2.1.0</span>
            </footer>
        </div>
    );
}
