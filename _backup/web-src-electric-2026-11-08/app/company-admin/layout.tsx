"use client";

import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function CompanyAdminLayout({ children }: { children: ReactNode }) {
    return <DashboardLayout>{children}</DashboardLayout>;
}