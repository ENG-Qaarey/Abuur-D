import type { OwnerStaffRow } from "@/data/company-owner-mock";

export type StaffFormState = {
    fullName: string;
    username: string;
    email: string;
    phone: string;
    profilePhoto: string;
    staffRole: string;
    department: string;
    positionTitle: string;
    employmentType: string;
    joiningDate: string;
    branch: string;
    rolePermissions: string;
    accessLevel: string;
    moduleAccess: Record<string, boolean>;
    password: string;
    confirmPassword: string;
    twoFactor: boolean;
    accountStatus: string;
    region: string;
    district: string;
    address: string;
    emergencyName: string;
    emergencyPhone: string;
    emergencyRelationship: string;
    nationalIdFile: string;
    contractFile: string;
    certificatesFile: string;
    internalNotes: string;
};

export const STAFF_ROLES = [
    "Meter Reader",
    "Billing Clerk",
    "Support Agent",
    "Technician",
    "Cashier",
    "Company Admin",
    "Finance Admin",
    "Operations Admin",
];

export const STAFF_DEPARTMENTS = ["Field Ops", "Finance", "Support", "Operations", "Management", "IT", "HR"];

export const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Intern"];

export const ACCESS_LEVELS = ["View only", "Standard", "Advanced", "Administrator"];

export const ROLE_PERMISSIONS = ["Inherited from role", "Custom permissions", "Read-only", "Full access"];

export const ACCOUNT_STATUSES = ["Active", "Inactive", "Suspended", "Pending"];

export const STAFF_REGIONS = ["Banaadir", "Galmudug", "Hirshabelle", "South West", "Jubaland"];

export const STAFF_DISTRICTS = ["Hodan", "Waberi", "Hamar Weyne", "Karan", "Yaaqshiid", "Daynile"];

export const STAFF_BRANCHES = ["Head Office — Hodan", "Waberi Branch", "Karan Service Center", "Field Ops Depot"];

export const STAFF_MODULES = ["Customers", "Meters", "Billing", "Payments", "Reports", "Support", "Staff", "Settings"];

export const STAFF_AVATAR_COLORS = [
    "from-blue-500 to-blue-600",
    "from-emerald-500 to-emerald-600",
    "from-purple-500 to-purple-600",
    "from-amber-500 to-amber-600",
    "from-cyan-500 to-cyan-600",
    "from-violet-500 to-violet-600",
];

export function defaultStaffFormState(): StaffFormState {
    const moduleAccess = Object.fromEntries(STAFF_MODULES.map((m) => [m, false])) as Record<string, boolean>;
    moduleAccess.Customers = true;
    moduleAccess.Meters = true;

    return {
        fullName: "",
        username: "",
        email: "",
        phone: "",
        profilePhoto: "",
        staffRole: STAFF_ROLES[0],
        department: STAFF_DEPARTMENTS[0],
        positionTitle: "",
        employmentType: EMPLOYMENT_TYPES[0],
        joiningDate: new Date().toISOString().slice(0, 10),
        branch: STAFF_BRANCHES[0],
        rolePermissions: ROLE_PERMISSIONS[0],
        accessLevel: ACCESS_LEVELS[1],
        moduleAccess,
        password: "",
        confirmPassword: "",
        twoFactor: false,
        accountStatus: ACCOUNT_STATUSES[0],
        region: STAFF_REGIONS[0],
        district: STAFF_DISTRICTS[0],
        address: "",
        emergencyName: "",
        emergencyPhone: "",
        emergencyRelationship: "",
        nationalIdFile: "",
        contractFile: "",
        certificatesFile: "",
        internalNotes: "",
    };
}

export function staffRowToForm(row: OwnerStaffRow | null): StaffFormState {
    const base = defaultStaffFormState();
    if (!row) return base;

    return {
        ...base,
        fullName: row.name,
        username: row.username ?? row.email.split("@")[0] ?? "",
        email: row.email,
        phone: row.phone ?? "",
        staffRole: row.role,
        department: row.department,
        positionTitle: row.position ?? row.role,
        joiningDate: row.joiningDate ?? new Date().toISOString().slice(0, 10),
        branch: row.branch ?? STAFF_BRANCHES[0],
        accountStatus: row.status,
        moduleAccess: { ...base.moduleAccess, ...(row.moduleAccess ?? {}) },
    };
}

export function staffFormToRow(form: StaffFormState, id: number, color: string): OwnerStaffRow {
    const joined = form.joiningDate
        ? new Date(form.joiningDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
        : new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

    return {
        id,
        name: form.fullName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.staffRole,
        department: form.department,
        position: form.positionTitle.trim() || form.staffRole,
        employmentType: form.employmentType,
        branch: form.branch,
        status: form.accountStatus,
        joined,
        joiningDate: form.joiningDate,
        color,
        moduleAccess: form.moduleAccess,
        accessLevel: form.accessLevel,
        twoFactor: form.twoFactor,
    };
}
