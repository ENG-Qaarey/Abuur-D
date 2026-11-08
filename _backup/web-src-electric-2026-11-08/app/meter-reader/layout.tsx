"use client";

import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function MeterReaderLayout({ children }: { children: ReactNode }) {
    return <DashboardLayout>{children}</DashboardLayout>;
}