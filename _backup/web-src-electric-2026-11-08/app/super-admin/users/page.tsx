"use client";

import { AnimatedSparkline } from "@/components/ui/AnimatedSparkline";
import { ResponsiveTableShell } from "@/components/ui/ResponsiveTableShell";
import { ActionTip } from "@/components/super-admin/shared/super-admin-layout";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    ArrowUpRight,
    ChevronLeft,
    ChevronRight,
    Copy,
    Edit2,
    Eye,
    Mail,
    MoreVertical,
    Phone,
    Plus,
    Search,
    Shield,
    SlidersHorizontal,
    Trash2,
    UserCog,
    X,
} from "lucide-react";

type UserRole = "System Admin" | "Company Owner" | "Company Admin" | "Employee" | "Meter Reader";
type UserStatus = "Active" | "Suspended";

type UserRecord = {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    company: string;
    role: UserRole;
    status: UserStatus;
    joined: string;
    lastActive: string;
    avatarColor: string;
};

type UserFormState = {
    fullName: string;
    email: string;
    phone: string;
    company: string;
    role: UserRole;
    status: UserStatus;
};

type SortKey = "fullName" | "role" | "status" | "joined";
type SortDir = "asc" | "desc";

export const allUsers: UserRecord[] = [
    { id: 1, fullName: "Abdi Hassan", email: "abdi@beco.so", phone: "+252 61 421 1001", company: "BECO", role: "Company Owner", status: "Active", joined: "Jan 12, 2024", lastActive: "5m ago", avatarColor: "from-blue-500 to-blue-600" },
    { id: 2, fullName: "Ayan Mohamed", email: "ayan@sompower.so", phone: "+252 61 421 1002", company: "Som Power", role: "Company Admin", status: "Active", joined: "Feb 01, 2024", lastActive: "13m ago", avatarColor: "from-emerald-500 to-emerald-600" },
    { id: 3, fullName: "Mohamed Ali", email: "m.ali@heco.so", phone: "+252 61 421 1003", company: "HECO", role: "Company Owner", status: "Active", joined: "Feb 14, 2024", lastActive: "1h ago", avatarColor: "from-purple-500 to-purple-600" },
    { id: 4, fullName: "Hodan Ahmed", email: "hodan@telesom.so", phone: "+252 61 421 1004", company: "Telesom Electric", role: "Employee", status: "Active", joined: "Mar 05, 2024", lastActive: "2h ago", avatarColor: "from-orange-500 to-orange-600" },
    { id: 5, fullName: "Yusuf Nur", email: "yusuf@necsom.so", phone: "+252 61 421 1005", company: "NECSOM", role: "Meter Reader", status: "Suspended", joined: "Mar 28, 2024", lastActive: "2d ago", avatarColor: "from-cyan-500 to-cyan-600" },
    { id: 6, fullName: "Sahra Ibrahim", email: "sahra@bosasoec.so", phone: "+252 61 421 1006", company: "Bosaso Electric", role: "Company Admin", status: "Active", joined: "Apr 02, 2024", lastActive: "9m ago", avatarColor: "from-rose-500 to-rose-600" },
    { id: 7, fullName: "Ahmed Omar", email: "ahmed@galkayo.so", phone: "+252 61 421 1007", company: "Galkayo Power", role: "Employee", status: "Active", joined: "Apr 19, 2024", lastActive: "31m ago", avatarColor: "from-amber-500 to-amber-600" },
    { id: 8, fullName: "Deeqa Warsame", email: "deeqa@sea.so", phone: "+252 61 421 1008", company: "Somali Electric App", role: "System Admin", status: "Active", joined: "May 01, 2024", lastActive: "Just now", avatarColor: "from-teal-500 to-teal-600" },
    { id: 9, fullName: "Fadumo Abdullahi", email: "fadumo@kismayo.so", phone: "+252 61 421 1009", company: "Kismayo Electric", role: "Meter Reader", status: "Suspended", joined: "May 09, 2024", lastActive: "4d ago", avatarColor: "from-fuchsia-500 to-fuchsia-600" },
    { id: 10, fullName: "Ismail Farah", email: "ismail@beco.so", phone: "+252 61 421 1010", company: "BECO", role: "Employee", status: "Active", joined: "May 17, 2024", lastActive: "18m ago", avatarColor: "from-sky-500 to-sky-600" },
];

const roles: Array<"All Roles" | UserRole> = ["All Roles", "System Admin", "Company Owner", "Company Admin", "Employee", "Meter Reader"];
const statuses: Array<"All Status" | UserStatus> = ["All Status", "Active", "Suspended"];

function StatusBadge({ status }: { status: UserStatus }) {
    const active = status === "Active";
    return (
        <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold", active ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300" : "border-red-200 bg-red-50 text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300")}>{status}</span>
    );
}

function RoleBadge({ role }: { role: UserRole }) {
    const styles: Record<UserRole, string> = {
        "System Admin": "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300",
        "Company Owner": "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300",
        "Company Admin": "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300",
        Employee: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
        "Meter Reader": "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300",
    };
    return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold", styles[role])}>{role}</span>;
}

function ModalShell({ title, subtitle, onClose, children, maxWidth = "max-w-2xl" }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode; maxWidth?: string }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button aria-label="Close modal" className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm dark:bg-slate-950/80" onClick={onClose} />
            <div className={cn("relative z-10 w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950", maxWidth)}>
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5 dark:border-slate-800 dark:bg-slate-900/70">
                    <div>
                        <h3 className="text-lg font-black tracking-tight text-slate-950 dark:text-white">{title}</h3>
                        {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
                    </div>
                    <button onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white">
                        <X size={16} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

function ViewUserModal({ user, onClose }: { user: UserRecord; onClose: () => void }) {
    return (
        <ModalShell title={user.fullName} subtitle={user.email} onClose={onClose} maxWidth="max-w-xl">
            <div className="space-y-4 p-6 text-sm">
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                        <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Role</div>
                        <div className="mt-2"><RoleBadge role={user.role} /></div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                        <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Status</div>
                        <div className="mt-2"><StatusBadge status={user.status} /></div>
                    </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"><div className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Company</div><div className="mt-1 font-bold text-slate-900 dark:text-slate-100">{user.company}</div></div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"><div className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Phone</div><div className="mt-1 font-bold text-slate-900 dark:text-slate-100">{user.phone}</div></div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"><div className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Joined</div><div className="mt-1 font-bold text-slate-900 dark:text-slate-100">{user.joined}</div></div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"><div className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Last Active</div><div className="mt-1 font-bold text-slate-900 dark:text-slate-100">{user.lastActive}</div></div>
                </div>
            </div>
        </ModalShell>
    );
}

function EditUserModal({ user, onClose, onSave }: { user: UserRecord; onClose: () => void; onSave: (updated: UserRecord) => void }) {
    const [form, setForm] = useState<UserFormState>({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        company: user.company,
        role: user.role,
        status: user.status,
    });

    return (
        <ModalShell title="Edit User" subtitle="Update user profile and access level" onClose={onClose}>
            <form
                className="p-6"
                onSubmit={(e) => {
                    e.preventDefault();
                    onSave({ ...user, ...form, fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim(), company: form.company.trim() });
                }}
            >
                <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2 md:col-span-2"><span className="text-sm font-bold text-slate-700 dark:text-slate-300">Full name</span><input value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} className="h-12 w-full rounded-full border border-slate-200 bg-white px-4 text-slate-950 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
                    <label className="space-y-2"><span className="text-sm font-bold text-slate-700 dark:text-slate-300">Email</span><input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} className="h-12 w-full rounded-full border border-slate-200 bg-white px-4 text-slate-950 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
                    <label className="space-y-2"><span className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone</span><input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} className="h-12 w-full rounded-full border border-slate-200 bg-white px-4 text-slate-950 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
                    <label className="space-y-2 md:col-span-2"><span className="text-sm font-bold text-slate-700 dark:text-slate-300">Company</span><input value={form.company} onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))} className="h-12 w-full rounded-full border border-slate-200 bg-white px-4 text-slate-950 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
                    <label className="space-y-2"><span className="text-sm font-bold text-slate-700 dark:text-slate-300">Role</span><select value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as UserRole }))} className="h-12 w-full rounded-full border border-slate-200 bg-white px-4 text-slate-950 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white">{roles.slice(1).map((role) => <option key={role}>{role}</option>)}</select></label>
                    <label className="space-y-2"><span className="text-sm font-bold text-slate-700 dark:text-slate-300">Status</span><select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as UserStatus }))} className="h-12 w-full rounded-full border border-slate-200 bg-white px-4 text-slate-950 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white">{statuses.slice(1).map((status) => <option key={status}>{status}</option>)}</select></label>
                </div>
                <div className="mt-6 flex gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <button type="button" onClick={onClose} className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">Cancel</button>
                    <button type="submit" className="flex-1 rounded-full border border-blue-600/20 bg-blue-600 px-4 py-3 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700">Save changes</button>
                </div>
            </form>
        </ModalShell>
    );
}

function DeleteUserModal({ user, onClose, onConfirm }: { user: UserRecord; onClose: () => void; onConfirm: () => void }) {
    return (
        <ModalShell title="Delete User" subtitle={`This will remove ${user.fullName}.`} onClose={onClose} maxWidth="max-w-lg">
            <div className="p-6">
                <p className="text-slate-600 dark:text-slate-300">Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">{user.fullName}</span>? This action cannot be undone.</p>
                <div className="mt-6 flex gap-3">
                    <button onClick={onClose} className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">Cancel</button>
                    <button onClick={onConfirm} className="flex-1 rounded-full border border-red-500/20 bg-red-500 px-4 py-3 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:bg-red-600">Delete user</button>
                </div>
            </div>
        </ModalShell>
    );
}

function AddUserModal({ onClose, onAdd }: { onClose: () => void; onAdd: (user: Omit<UserRecord, "id" | "joined" | "lastActive" | "avatarColor">) => void }) {
    const [form, setForm] = useState<UserFormState>({ fullName: "", email: "", phone: "", company: "", role: "Employee", status: "Active" });
    return (
        <ModalShell title="Add User" subtitle="Create a user and assign permissions" onClose={onClose}>
            <form
                className="p-6"
                onSubmit={(e) => {
                    e.preventDefault();
                    onAdd({ ...form, fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim(), company: form.company.trim() });
                }}
            >
                <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2 md:col-span-2"><span className="text-sm font-bold text-slate-700 dark:text-slate-300">Full name</span><input required value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} className="h-12 w-full rounded-full border border-slate-200 bg-white px-4 text-slate-950 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
                    <label className="space-y-2"><span className="text-sm font-bold text-slate-700 dark:text-slate-300">Email</span><input required type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} className="h-12 w-full rounded-full border border-slate-200 bg-white px-4 text-slate-950 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
                    <label className="space-y-2"><span className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone</span><input required value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} className="h-12 w-full rounded-full border border-slate-200 bg-white px-4 text-slate-950 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
                    <label className="space-y-2 md:col-span-2"><span className="text-sm font-bold text-slate-700 dark:text-slate-300">Company</span><input required value={form.company} onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))} className="h-12 w-full rounded-full border border-slate-200 bg-white px-4 text-slate-950 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
                    <label className="space-y-2"><span className="text-sm font-bold text-slate-700 dark:text-slate-300">Role</span><select value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as UserRole }))} className="h-12 w-full rounded-full border border-slate-200 bg-white px-4 text-slate-950 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white">{roles.slice(1).map((role) => <option key={role}>{role}</option>)}</select></label>
                    <label className="space-y-2"><span className="text-sm font-bold text-slate-700 dark:text-slate-300">Status</span><select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as UserStatus }))} className="h-12 w-full rounded-full border border-slate-200 bg-white px-4 text-slate-950 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white">{statuses.slice(1).map((status) => <option key={status}>{status}</option>)}</select></label>
                </div>
                <div className="mt-6 flex gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <button type="button" onClick={onClose} className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">Cancel</button>
                    <button type="submit" className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500 px-4 py-3 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-600"><Plus size={16} /> Add user</button>
                </div>
            </form>
        </ModalShell>
    );
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserRecord[]>(allUsers);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<"All Roles" | UserRole>("All Roles");
    const [statusFilter, setStatusFilter] = useState<"All Status" | UserStatus>("All Status");
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(8);
    const [sortKey, setSortKey] = useState<SortKey>("fullName");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
    const [viewingUser, setViewingUser] = useState<UserRecord | null>(null);
    const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
    const [deletingUser, setDeletingUser] = useState<UserRecord | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const onMouseDown = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setActiveDropdownId(null);
        };
        const onEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setActiveDropdownId(null);
        };
        document.addEventListener("mousedown", onMouseDown);
        window.addEventListener("keydown", onEscape);
        return () => {
            document.removeEventListener("mousedown", onMouseDown);
            window.removeEventListener("keydown", onEscape);
        };
    }, []);

    const filtered = useMemo(() => {
        let data = [...users];
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            data = data.filter((user) => user.fullName.toLowerCase().includes(q) || user.email.toLowerCase().includes(q) || user.company.toLowerCase().includes(q));
        }
        if (roleFilter !== "All Roles") data = data.filter((user) => user.role === roleFilter);
        if (statusFilter !== "All Status") data = data.filter((user) => user.status === statusFilter);

        data.sort((a, b) => {
            let cmp = 0;
            switch (sortKey) {
                case "fullName": cmp = a.fullName.localeCompare(b.fullName); break;
                case "role": cmp = a.role.localeCompare(b.role); break;
                case "status": cmp = a.status.localeCompare(b.status); break;
                case "joined": cmp = new Date(a.joined).getTime() - new Date(b.joined).getTime(); break;
            }
            return sortDir === "asc" ? cmp : -cmp;
        });

        return data;
    }, [users, searchQuery, roleFilter, statusFilter, sortKey, sortDir]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const paginatedData = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

    useEffect(() => {
        setCurrentPage((page) => Math.min(page, totalPages));
    }, [totalPages]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
        else {
            setSortKey(key);
            setSortDir("asc");
        }
        setCurrentPage(1);
    };

    const getPageNumbers = () => {
        const pages: number[] = [];
        if (totalPages <= 5) for (let i = 1; i <= totalPages; i++) pages.push(i);
        else if (currentPage <= 3) pages.push(1, 2, 3, 4);
        else if (currentPage >= totalPages - 2) pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        else pages.push(currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
        return pages;
    };

    const updateUser = (updated: UserRecord) => {
        setUsers((list) => list.map((user) => (user.id === updated.id ? updated : user)));
        setEditingUser(null);
    };

    const addUser = (user: Omit<UserRecord, "id" | "joined" | "lastActive" | "avatarColor">) => {
        const nextId = Math.max(...users.map((item) => item.id), 0) + 1;
        const palette = ["from-blue-500 to-blue-600", "from-emerald-500 to-emerald-600", "from-purple-500 to-purple-600", "from-orange-500 to-orange-600", "from-cyan-500 to-cyan-600"];
        const joined = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
        setUsers((list) => [{ ...user, id: nextId, joined, lastActive: "Just now", avatarColor: palette[nextId % palette.length] }, ...list]);
        setIsAddModalOpen(false);
    };

    const deleteUser = (id: number) => {
        setUsers((list) => list.filter((user) => user.id !== id));
        setDeletingUser(null);
    };

    const toggleStatus = (id: number) => {
        setUsers((list) => list.map((user) => user.id === id ? { ...user, status: user.status === "Active" ? "Suspended" : "Active" } : user));
        setActiveDropdownId(null);
    };

    const copyUserId = async (id: number) => {
        await navigator.clipboard.writeText(String(id));
        setActiveDropdownId(null);
    };

    const SortIcon = ({ column }: { column: SortKey }) => {
        if (sortKey !== column) return <ArrowUpDown size={12} className="text-slate-300 dark:text-slate-600" />;
        return sortDir === "asc" ? <ArrowUp size={12} className="text-blue-500" /> : <ArrowDown size={12} className="text-blue-500" />;
    };

    const activeCount = users.filter((user) => user.status === "Active").length;
    const suspendedCount = users.filter((user) => user.status === "Suspended").length;
    const adminCount = users.filter((user) => user.role === "System Admin" || user.role === "Company Admin" || user.role === "Company Owner").length;

    const stats = [
        {
            title: "Total Users",
            value: String(users.length),
            trend: `${activeCount} active`,
            glowColor: "usersBlueGlow",
            sparklinePath: "M 0 15 Q 10 5, 20 12 T 40 8 T 60 4",
            stroke: "#3b82f6",
        },
        {
            title: "Active",
            value: String(activeCount),
            trend: `${Math.round((activeCount / Math.max(users.length, 1)) * 100)}% of total`,
            glowColor: "usersGreenGlow",
            sparklinePath: "M 0 18 Q 15 15, 30 8 T 60 2",
            stroke: "#10b981",
        },
        {
            title: "Suspended",
            value: String(suspendedCount),
            trend: suspendedCount === 0 ? "No suspended users" : "Requires review",
            glowColor: "usersRoseGlow",
            sparklinePath: "M 0 12 Q 20 16, 35 10 T 60 14",
            stroke: "#f43f5e",
        },
        {
            title: "Admins",
            value: String(adminCount),
            trend: "Owners & admins",
            glowColor: "usersPurpleGlow",
            sparklinePath: "M 0 14 Q 10 18, 25 10 T 50 6 T 60 12",
            stroke: "#8b5cf6",
        },
    ];

    const filterSelectClass =
        "h-10 rounded-xl bg-slate-50 dark:bg-[#0f1629] border border-slate-200 dark:border-[#1e2d4a] px-3 text-slate-900 dark:text-slate-100 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

    return (
        <div className="space-y-6 min-w-0 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Users Management</h1>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5 font-medium">Manage platform users, roles, and access status.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={stat.title} className="bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-5 flex items-center justify-between shadow-sm hover:border-slate-200 dark:hover:border-[#1e2d4a] transition-all">
                        <div className="space-y-1">
                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{stat.title}</span>
                            <h3 className="text-slate-900 dark:text-white text-2xl font-black">{stat.value}</h3>
                            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                <ArrowUpRight size={12} className="shrink-0" />
                                <span>{stat.trend}</span>
                            </div>
                        </div>
                        <div className="w-16 h-10 flex items-center shrink-0">
                            <AnimatedSparkline
                                gradientId={stat.glowColor}
                                path={stat.sparklinePath}
                                stroke={stat.stroke}
                                delay={index * 120}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl overflow-hidden shadow-sm min-w-0">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-4 sm:p-5 border-b border-slate-100 dark:border-[#1a2744]">
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300 shrink-0">All Users</p>
                    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full xl:w-auto min-w-0">
                        <div className="relative w-full sm:w-64 min-w-0">
                            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                placeholder="Search users..."
                                className="w-full h-10 pl-11 pr-4 rounded-xl bg-slate-50 dark:bg-[#0f1629] border border-slate-200 dark:border-[#1e2d4a] text-slate-900 dark:text-slate-100 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                            />
                        </div>
                        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value as "All Roles" | UserRole); setCurrentPage(1); }} className={filterSelectClass}>
                            {roles.map((role) => <option key={role}>{role}</option>)}
                        </select>
                        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as "All Status" | UserStatus); setCurrentPage(1); }} className={filterSelectClass}>
                            {statuses.map((status) => <option key={status}>{status}</option>)}
                        </select>
                        <button
                            type="button"
                            disabled
                            aria-disabled="true"
                            title="Filter panel is not available yet"
                            className="h-10 flex items-center gap-2 px-4 border border-slate-200 dark:border-[#1e2d4a] text-slate-400 dark:text-slate-500 font-bold text-sm rounded-xl bg-transparent cursor-not-allowed"
                        >
                            <SlidersHorizontal size={14} />
                            Filter
                        </button>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="h-10 flex items-center gap-2 px-5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg shadow-blue-500/5 hover:shadow-blue-500/10 shrink-0"
                        >
                            <Plus size={16} />
                            Add User
                        </button>
                    </div>
                </div>

                <div className="p-4 sm:p-5 space-y-4 min-w-0">
                    <ResponsiveTableShell>
                        <table className="w-full text-left text-sm border-collapse max-xl:min-w-[760px] xl:min-w-0 xl:table-fixed">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-[#1a2744] text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
                                    <th className="py-4 px-2 sm:px-4 w-10 sm:w-12">#</th>
                                    <th className="py-4 px-2 sm:px-4 min-w-[180px] cursor-pointer" onClick={() => handleSort("fullName")}>User <SortIcon column="fullName" /></th>
                                    <th className="py-4 px-2 sm:px-4 hidden sm:table-cell">Company</th>
                                    <th className="py-4 px-2 sm:px-4 cursor-pointer" onClick={() => handleSort("role")}>Role <SortIcon column="role" /></th>
                                    <th className="py-4 px-2 sm:px-4 cursor-pointer" onClick={() => handleSort("status")}>Status <SortIcon column="status" /></th>
                                    <th className="py-4 px-2 sm:px-4 cursor-pointer hidden md:table-cell" onClick={() => handleSort("joined")}>Joined <SortIcon column="joined" /></th>
                                    <th className="py-4 px-2 sm:px-4 hidden lg:table-cell">Last Active</th>
                                    <th className="py-4 px-2 sm:px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-[#1a2744]">
                                {paginatedData.map((user, index) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="py-4 px-2 sm:px-4 text-slate-400 dark:text-slate-500 font-semibold">{(currentPage - 1) * perPage + index + 1}</td>
                                        <td className="py-4 px-2 sm:px-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-black text-white shadow-sm shrink-0", user.avatarColor)}>{user.fullName.charAt(0).toUpperCase()}</div>
                                                <div>
                                                    <div className="text-slate-900 dark:text-slate-100 font-bold">{user.fullName}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">{user.email}</div>
                                                    <div className="text-[10px] text-slate-500 dark:text-slate-500">{user.phone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-2 sm:px-4 text-slate-700 dark:text-slate-300 font-semibold hidden sm:table-cell">{user.company}</td>
                                        <td className="py-4 px-2 sm:px-4"><RoleBadge role={user.role} /></td>
                                        <td className="py-4 px-2 sm:px-4"><StatusBadge status={user.status} /></td>
                                        <td className="py-4 px-2 sm:px-4 text-slate-500 dark:text-slate-400 font-semibold text-xs hidden md:table-cell">{user.joined}</td>
                                        <td className="py-4 px-2 sm:px-4 text-slate-500 dark:text-slate-400 font-semibold text-xs hidden lg:table-cell">{user.lastActive}</td>
                                        <td className="py-4 px-2 sm:px-4 text-right">
                                            <div className="flex items-center gap-2 justify-end">
                                                <ActionTip label="View Details">
                                                    <button onClick={() => setViewingUser(user)} className="p-2 border border-slate-200 dark:border-[#1e2d4a] text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-500/30 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 rounded-xl bg-transparent transition-all">
                                                        <Eye size={14} className="stroke-[2.5]" />
                                                    </button>
                                                </ActionTip>
                                                <ActionTip label="Edit User">
                                                    <button onClick={() => setEditingUser(user)} className="p-2 border border-slate-200 dark:border-[#1e2d4a] text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-200 dark:hover:border-amber-500/30 hover:bg-amber-50/50 dark:hover:bg-amber-500/5 rounded-xl bg-transparent transition-all">
                                                        <Edit2 size={14} className="stroke-[2.5]" />
                                                    </button>
                                                </ActionTip>
                                                <div className="relative" ref={activeDropdownId === user.id ? dropdownRef : null}>
                                                    <ActionTip label="More Actions">
                                                        <button onClick={() => setActiveDropdownId((prev) => prev === user.id ? null : user.id)} className="p-2 border border-slate-200 dark:border-[#1e2d4a] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl bg-transparent transition-all">
                                                            <MoreVertical size={14} className="stroke-[2.5]" />
                                                        </button>
                                                    </ActionTip>
                                                    {activeDropdownId === user.id && (
                                                        <div className="absolute right-0 top-full z-[9999] mt-1 w-56 overflow-hidden rounded-2xl border border-slate-100 dark:border-[#1e2d4a] bg-white dark:bg-[#0a1628] p-1.5 shadow-2xl shadow-black/10">
                                                            <button onClick={() => copyUserId(user.id)} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[12px] font-semibold text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-50 dark:hover:bg-white/5"><Copy size={13} className="shrink-0" /> Copy User ID</button>
                                                            <button onClick={() => { setEditingUser(user); setActiveDropdownId(null); }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[12px] font-semibold text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-50 dark:hover:bg-white/5"><UserCog size={13} className="text-blue-500 shrink-0" /> Manage Access</button>
                                                            <button onClick={() => toggleStatus(user.id)} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[12px] font-semibold text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-50 dark:hover:bg-white/5"><Shield size={13} className="text-slate-400 shrink-0" /> {user.status === "Active" ? "Suspend User" : "Activate User"}</button>
                                                            <button onClick={() => { window.open(`mailto:${user.email}`, "_blank", "noopener,noreferrer"); setActiveDropdownId(null); }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[12px] font-semibold text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-50 dark:hover:bg-white/5"><Mail size={13} className="shrink-0" /> Send Email</button>
                                                            <button onClick={() => { window.open(`tel:${user.phone.replace(/\s+/g, "")}`, "_blank", "noopener,noreferrer"); setActiveDropdownId(null); }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[12px] font-semibold text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-50 dark:hover:bg-white/5"><Phone size={13} className="shrink-0" /> Call User</button>
                                                            <div className="my-1 border-t border-slate-100 dark:border-[#1a2744]" />
                                                            <button onClick={() => { setDeletingUser(user); setActiveDropdownId(null); }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[12px] font-semibold text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 size={13} className="shrink-0" /> Delete User</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </ResponsiveTableShell>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-[#1a2744]">
                        <div className="text-slate-400 dark:text-slate-500 text-xs font-semibold">
                            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length} users
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="flex items-center gap-1.5">
                                <button onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} className="p-2 rounded-xl border border-slate-200 dark:border-[#1e2d4a] text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-[#0f1d35] transition-all bg-transparent disabled:opacity-40 disabled:cursor-not-allowed">
                                    <ChevronLeft size={14} className="stroke-[2.5]" />
                                </button>
                                {getPageNumbers().map((page) => (
                                    <button key={page} onClick={() => setCurrentPage(page)} className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all", page === currentPage ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "border border-slate-200 dark:border-[#1e2d4a] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#0f1d35] bg-transparent")}>{page}</button>
                                ))}
                                <button onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded-xl border border-slate-200 dark:border-[#1e2d4a] text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-[#0f1d35] transition-all bg-transparent disabled:opacity-40 disabled:cursor-not-allowed">
                                    <ChevronRight size={14} className="stroke-[2.5]" />
                                </button>
                            </div>
                            <div className="relative">
                                <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }} className="bg-transparent border border-slate-200 dark:border-[#1e2d4a] text-slate-600 dark:text-slate-300 text-xs font-semibold pl-3 pr-8 py-2 rounded-xl outline-none transition-all cursor-pointer focus:border-blue-500 appearance-none">
                                    <option value={8}>8 / page</option>
                                    <option value={12}>12 / page</option>
                                    <option value={20}>20 / page</option>
                                    <option value={50}>50 / page</option>
                                </select>
                                <ChevronRight size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none rotate-90 stroke-[2.5]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isAddModalOpen && <AddUserModal onClose={() => setIsAddModalOpen(false)} onAdd={addUser} />}
            {viewingUser && <ViewUserModal user={viewingUser} onClose={() => setViewingUser(null)} />}
            {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={updateUser} />}
            {deletingUser && <DeleteUserModal user={deletingUser} onClose={() => setDeletingUser(null)} onConfirm={() => deleteUser(deletingUser.id)} />}
        </div>
    );
}
