const spark = {
    blue: { glowColor: "metricBlue", sparklinePath: "M 0 15 Q 10 5, 20 12 T 40 8 T 60 4", stroke: "#3b82f6" },
    green: { glowColor: "metricGreen", sparklinePath: "M 0 18 Q 15 15, 30 8 T 60 2", stroke: "#10b981" },
    purple: { glowColor: "metricPurple", sparklinePath: "M 0 14 Q 10 18, 25 10 T 50 6 T 60 12", stroke: "#8b5cf6" },
    amber: { glowColor: "metricAmber", sparklinePath: "M 0 16 Q 20 10, 35 14 T 60 6", stroke: "#f59e0b" },
    rose: { glowColor: "metricRose", sparklinePath: "M 0 12 Q 20 16, 35 10 T 60 14", stroke: "#f43f5e" },
};

export const COMPANY_OWNER_NAME = "Somali Electric Co.";

/** Dashboard — all 10 stat cards per OWNERAGENT.md */
export const ownerDashboardAllStats = [
    { title: "Total Customers", value: "12,480", trend: "+186 this month", ...spark.blue },
    { title: "Active Customers", value: "11,920", trend: "95.5% active", ...spark.green },
    { title: "Total Meters", value: "12,310", trend: "Installed fleet", ...spark.purple },
    { title: "Online Meters", value: "12,148", trend: "98.7% online", ...spark.green },
    { title: "Offline Meters", value: "162", trend: "Needs attention", ...spark.rose },
    { title: "Monthly Revenue", value: "$284,520", trend: "+12.1% MoM", ...spark.blue },
    { title: "Pending Bills", value: "1,860", trend: "$28.4k outstanding", ...spark.amber },
    { title: "Electricity Usage", value: "1.24M kWh", trend: "+6.4% vs last month", ...spark.purple },
    { title: "Active Staff", value: "45", trend: "3 on leave", ...spark.green },
    { title: "Open Tickets", value: "24", trend: "6 critical", ...spark.rose },
];

export const ownerDashboardMetrics = ownerDashboardAllStats.slice(0, 4);

export const ownerMonthlyRevenueChart = [
    { month: "Jan", value: 198000 },
    { month: "Feb", value: 212000 },
    { month: "Mar", value: 228000 },
    { month: "Apr", value: 245000 },
    { month: "May", value: 268000 },
    { month: "Jun", value: 284520 },
];

export const ownerCustomerGrowthChart = [
    { month: "Jan", customers: 11800 },
    { month: "Feb", customers: 11950 },
    { month: "Mar", customers: 12100 },
    { month: "Apr", customers: 12280 },
    { month: "May", customers: 12410 },
    { month: "Jun", customers: 12480 },
];

export const ownerPaymentSuccessChart = [
    { week: "W1", rate: 94 },
    { week: "W2", rate: 96 },
    { week: "W3", rate: 95 },
    { week: "W4", rate: 98 },
];

export type OwnerActivityItem = {
    id: number;
    type: "customer" | "payment" | "meter" | "ticket" | "staff" | "alert";
    title: string;
    description: string;
    time: string;
};

export const ownerActivityFeed: OwnerActivityItem[] = [
    { id: 1, type: "customer", title: "New customer registered", description: "Hodan district — MTR-10241 assigned", time: "5 min ago" },
    { id: 2, type: "payment", title: "Payment received", description: "Abdirahman Hassan — $42.80 via EVC Plus", time: "12 min ago" },
    { id: 3, type: "meter", title: "Meter activated", description: "MTR-10088 online — Smart meter", time: "28 min ago" },
    { id: 4, type: "ticket", title: "Support ticket opened", description: "Power outage — Hodan (High priority)", time: "45 min ago" },
    { id: 5, type: "staff", title: "Staff login", description: "Hassan Omar — Field technician", time: "1 hr ago" },
    { id: 6, type: "alert", title: "System alert", description: "162 meters offline — auto-notification sent", time: "2 hr ago" },
];

export const ownerPaymentAnalytics = [
    { label: "Collected", value: 82, color: "#10b981" },
    { label: "Pending", value: 12, color: "#f59e0b" },
    { label: "Failed", value: 6, color: "#f43f5e" },
];

export const ownerConsumptionChart = [
    { day: "Mon", kwh: 168000, peak: 4200 },
    { day: "Tue", kwh: 172000, peak: 4350 },
    { day: "Wed", kwh: 165000, peak: 4100 },
    { day: "Thu", kwh: 178000, peak: 4480 },
    { day: "Fri", kwh: 181000, peak: 4520 },
    { day: "Sat", kwh: 142000, peak: 3800 },
    { day: "Sun", kwh: 138000, peak: 3650 },
];

export type OwnerTransactionRow = {
    id: number;
    trxId: string;
    customer: string;
    type: string;
    amount: string;
    status: string;
    time: string;
};

export const ownerRecentTransactions: OwnerTransactionRow[] = [
    { id: 1, trxId: "PAY-88421", customer: "Abdirahman Hassan", type: "Bill Payment", amount: "$42.80", status: "Success", time: "2 min ago" },
    { id: 2, trxId: "PAY-88420", customer: "Aamina Yusuf", type: "Bill Payment", amount: "$38.50", status: "Success", time: "18 min ago" },
    { id: 3, trxId: "PAY-88419", customer: "Mohamed Ali", type: "Bill Payment", amount: "$35.20", status: "Failed", time: "1 hr ago" },
    { id: 4, trxId: "PAY-88418", customer: "Fatuma Ahmed", type: "Top-up", amount: "$50.00", status: "Success", time: "2 hr ago" },
    { id: 5, trxId: "PAY-88417", customer: "Ismail Noor", type: "Bill Payment", amount: "$29.10", status: "Pending", time: "3 hr ago" },
];

export const ownerCustomerMetrics = [
    { title: "Total Customers", value: "12,480", trend: "8.2% from last month", ...spark.blue },
    { title: "Active", value: "11,920", trend: "95.5% active rate", ...spark.green },
    { title: "Inactive", value: "560", trend: "4.5% of total", ...spark.rose },
    { title: "New This Month", value: "186", trend: "14.2% growth", ...spark.purple },
];

export const ownerEmployeeMetrics = [
    { title: "Total Employees", value: "48", trend: "3 new this month", ...spark.blue },
    { title: "Active", value: "45", trend: "93.8% active", ...spark.green },
    { title: "Meter Readers", value: "22", trend: "Field staff", ...spark.purple },
    { title: "On Leave", value: "3", trend: "Scheduled", ...spark.amber },
];

export const ownerAdminMetrics = [
    { title: "Company Admins", value: "6", trend: "2 roles assigned", ...spark.blue },
    { title: "Active Sessions", value: "4", trend: "Online now", ...spark.green },
    { title: "Permissions", value: "32", trend: "Scoped to company", ...spark.purple },
    { title: "Last Login", value: "Today", trend: "All admins active", ...spark.amber },
];

export const ownerMeterMetrics = [
    { title: "Total Meters", value: "12,310", trend: "Installed units", ...spark.blue },
    { title: "Smart Meters", value: "8,420", trend: "68.4% of fleet", ...spark.green },
    { title: "Maintenance", value: "42", trend: "Scheduled this week", ...spark.amber },
    { title: "Faulty", value: "18", trend: "Needs replacement", ...spark.rose },
];

export const ownerReadingMetrics = [
    { title: "Readings This Month", value: "11,890", trend: "96.6% completed", ...spark.blue },
    { title: "Pending", value: "420", trend: "Due in 3 days", ...spark.amber },
    { title: "Verified", value: "11,470", trend: "98.2% verified", ...spark.green },
    { title: "Disputed", value: "12", trend: "Under review", ...spark.rose },
];

export const ownerBillingMetrics = [
    { title: "Bills Generated", value: "12,480", trend: "May 2026 cycle", ...spark.blue },
    { title: "Paid", value: "10,240", trend: "82.1% collection", ...spark.green },
    { title: "Overdue", value: "1,860", trend: "14.9% overdue", ...spark.rose },
    { title: "Total Billed", value: "$312,400", trend: "This month", ...spark.purple },
];

export const ownerPaymentMetrics = [
    { title: "Payments Today", value: "248", trend: "$18,420 collected", ...spark.blue },
    { title: "This Month", value: "$284,520", trend: "12.1% vs last month", ...spark.green },
    { title: "Failed", value: "14", trend: "0.8% failure rate", ...spark.rose },
    { title: "Refunds", value: "6", trend: "$420 total", ...spark.amber },
];

export const ownerReportMetrics = [
    { title: "Revenue", value: "$284,520", trend: "May 2026", ...spark.blue },
    { title: "Consumption", value: "1.2M kWh", trend: "8.4% increase", ...spark.green },
    { title: "Collection Rate", value: "82.1%", trend: "2.3% improvement", ...spark.purple },
    { title: "Outstanding", value: "$28,400", trend: "Due this month", ...spark.amber },
];

export const ownerAnalyticsMetrics = [
    { title: "Peak Load", value: "4.2 MW", trend: "Yesterday 7 PM", ...spark.blue },
    { title: "Avg Daily Usage", value: "38.4 kWh", trend: "Per customer", ...spark.green },
    { title: "Growth", value: "+8.2%", trend: "Customer base", ...spark.purple },
    { title: "Churn Risk", value: "124", trend: "Inactive 60+ days", ...spark.rose },
];

export const ownerOutageMetrics = [
    { title: "Active Outages", value: "2", trend: "2 districts affected", ...spark.rose },
    { title: "Scheduled", value: "1", trend: "Jun 02 maintenance", ...spark.amber },
    { title: "Resolved (30d)", value: "18", trend: "Avg 2.4h restore", ...spark.green },
    { title: "Customers Affected", value: "840", trend: "Current incidents", ...spark.blue },
];

export const ownerChatMetrics = [
    { title: "Open Chats", value: "12", trend: "Awaiting reply", ...spark.amber },
    { title: "Resolved Today", value: "28", trend: "Support team", ...spark.green },
    { title: "Avg Response", value: "18 min", trend: "12% faster", ...spark.blue },
    { title: "Satisfaction", value: "4.6/5", trend: "Last 30 days", ...spark.purple },
];

export const ownerNotificationMetrics = [
    { title: "Sent Today", value: "1,248", trend: "SMS + push", ...spark.blue },
    { title: "Scheduled", value: "4", trend: "Upcoming", ...spark.amber },
    { title: "Delivery Rate", value: "98.2%", trend: "Last 7 days", ...spark.green },
    { title: "Failed", value: "22", trend: "Retry queued", ...spark.rose },
];

export type OwnerCustomerRow = {
    id: number;
    name: string;
    phone: string;
    email: string;
    meter: string;
    district: string;
    status: string;
    joined: string;
    color: string;
};

export type OwnerStaffRow = {
    id: number;
    name: string;
    email: string;
    role: string;
    department: string;
    status: string;
    joined: string;
    color: string;
    username?: string;
    phone?: string;
    position?: string;
    employmentType?: string;
    branch?: string;
    joiningDate?: string;
    accessLevel?: string;
    twoFactor?: boolean;
    moduleAccess?: Record<string, boolean>;
};

export type OwnerMeterRow = {
    id: number;
    meterId: string;
    customer: string;
    type: string;
    capacity: string;
    district: string;
    status: string;
    connectivity: string;
    installed: string;
};

export type OwnerReadingRow = {
    id: number;
    readingId: string;
    meterId: string;
    customer: string;
    previous: string;
    current: string;
    usage: string;
    status: string;
    date: string;
};

export type OwnerBillingRow = {
    id: number;
    billId: string;
    customer: string;
    amount: string;
    dueDate: string;
    status: string;
    period: string;
};

export type OwnerPaymentRow = {
    id: number;
    trxId: string;
    customer: string;
    amount: string;
    method: string;
    status: string;
    date: string;
    color: string;
};

export type OwnerOutageRow = {
    id: number;
    outageId: string;
    district: string;
    cause: string;
    customers: string;
    status: string;
    started: string;
};

export type OwnerTicketRow = {
    id: number;
    ticketId: string;
    customer: string;
    subject: string;
    category: string;
    priority: string;
    status: string;
    assignee: string;
    created: string;
};

export type OwnerChatRow = {
    id: number;
    chatId: string;
    customer: string;
    subject: string;
    status: string;
    lastMessage: string;
};

export const ownerTicketRows: OwnerTicketRow[] = [
    { id: 1, ticketId: "TK-2026-0412", customer: "Abdirahman Hassan", subject: "Power outage — Hodan", category: "Power Outage", priority: "Critical", status: "Open", assignee: "Hassan Omar", created: "May 27, 08:30 AM" },
    { id: 2, ticketId: "TK-2026-0411", customer: "Mohamed Ali", subject: "Meter fault reading", category: "Meter Fault", priority: "High", status: "In Progress", assignee: "Yusuf Jama", created: "May 26, 04:15 PM" },
    { id: 3, ticketId: "TK-2026-0410", customer: "Aamina Yusuf", subject: "Billing discrepancy", category: "Billing Issue", priority: "Medium", status: "Open", assignee: "Unassigned", created: "May 26, 11:00 AM" },
    { id: 4, ticketId: "TK-2026-0409", customer: "Fatuma Ahmed", subject: "New connection request", category: "New Connection", priority: "Medium", status: "Resolved", assignee: "Sahra Idle", created: "May 25, 09:45 AM" },
    { id: 5, ticketId: "TK-2026-0408", customer: "Ismail Noor", subject: "Payment not reflected", category: "Payment Issue", priority: "High", status: "In Progress", assignee: "Layla Mohamed", created: "May 25, 03:20 PM" },
];

export type OwnerNotificationRow = {
    id: number;
    title: string;
    channel: string;
    audience: string;
    status: string;
    sentAt: string;
};

export const ownerCustomerRows: OwnerCustomerRow[] = [
    { id: 1, name: "Abdirahman Hassan", phone: "+252 61 421 1001", email: "abdi@beco.so", meter: "MTR-10001", district: "Hodan", status: "Active", joined: "Jan 12, 2024", color: "from-blue-500 to-blue-600" },
    { id: 2, name: "Aamina Yusuf", phone: "+252 61 421 1002", email: "ayan@beco.so", meter: "MTR-10002", district: "Waberi", status: "Active", joined: "Feb 01, 2024", color: "from-emerald-500 to-emerald-600" },
    { id: 3, name: "Mohamed Ali", phone: "+252 61 421 1003", email: "m.ali@beco.so", meter: "MTR-10003", district: "Hamar Weyne", status: "Inactive", joined: "Feb 14, 2024", color: "from-purple-500 to-purple-600" },
    { id: 4, name: "Fatuma Ahmed", phone: "+252 61 421 1004", email: "fatuma@beco.so", meter: "MTR-10004", district: "Karan", status: "Active", joined: "Mar 05, 2024", color: "from-orange-500 to-orange-600" },
    { id: 5, name: "Ismail Noor", phone: "+252 61 421 1005", email: "ismail@beco.so", meter: "MTR-10005", district: "Yaaqshiid", status: "Active", joined: "Mar 28, 2024", color: "from-cyan-500 to-cyan-600" },
];

export const ownerEmployeeRows: OwnerStaffRow[] = [
    { id: 1, name: "Hassan Omar", email: "hassan@beco.so", role: "Meter Reader", department: "Field Ops", status: "Active", joined: "Mar 10, 2023", color: "from-blue-500 to-blue-600" },
    { id: 2, name: "Sahra Idle", email: "sahra@beco.so", role: "Billing Clerk", department: "Finance", status: "Active", joined: "Jun 22, 2023", color: "from-emerald-500 to-emerald-600" },
    { id: 3, name: "Yusuf Jama", email: "yusuf@beco.so", role: "Support Agent", department: "Support", status: "Active", joined: "Sep 01, 2023", color: "from-purple-500 to-purple-600" },
    { id: 4, name: "Khadija Ali", email: "khadija@beco.so", role: "Meter Reader", department: "Field Ops", status: "On Leave", joined: "Jan 15, 2024", color: "from-amber-500 to-amber-600" },
];

export const ownerAdminRows: OwnerStaffRow[] = [
    { id: 1, name: "Omar Farah", email: "omar@beco.so", role: "Company Admin", department: "Management", status: "Active", joined: "Jan 01, 2023", color: "from-blue-500 to-blue-600" },
    { id: 2, name: "Layla Mohamed", email: "layla@beco.so", role: "Finance Admin", department: "Finance", status: "Active", joined: "Apr 12, 2023", color: "from-emerald-500 to-emerald-600" },
    { id: 3, name: "Ahmed Nur", email: "ahmed@beco.so", role: "Operations Admin", department: "Operations", status: "Active", joined: "Aug 20, 2023", color: "from-violet-500 to-violet-600" },
];

export const ownerMeterRows: OwnerMeterRow[] = [
    { id: 1, meterId: "MTR-10001", customer: "Abdirahman Hassan", type: "Smart", capacity: "60A", district: "Hodan", status: "Active", connectivity: "Online", installed: "Jan 12, 2024" },
    { id: 2, meterId: "MTR-10002", customer: "Aamina Yusuf", type: "Smart", capacity: "60A", district: "Waberi", status: "Active", connectivity: "Online", installed: "Feb 01, 2024" },
    { id: 3, meterId: "MTR-10003", customer: "Mohamed Ali", type: "Analog", capacity: "40A", district: "Hamar Weyne", status: "Maintenance", connectivity: "Offline", installed: "Feb 14, 2024" },
    { id: 4, meterId: "MTR-10004", customer: "Fatuma Ahmed", type: "Smart", capacity: "80A", district: "Karan", status: "Active", connectivity: "Online", installed: "Mar 05, 2024" },
];

export const ownerStaffPermissions = [
    { module: "Customers", create: true, read: true, update: true, delete: false, export: true },
    { module: "Meters", create: true, read: true, update: true, delete: false, export: true },
    { module: "Billing", create: true, read: true, update: true, delete: false, export: true },
    { module: "Payments", create: false, read: true, update: true, delete: false, export: true },
    { module: "Reports", create: false, read: true, update: false, delete: false, export: true },
    { module: "Support", create: true, read: true, update: true, delete: false, export: false },
];

export const ownerActivityLogs = [
    { id: 1, user: "Hassan Omar", action: "Verified meter reading RD-2026-001", time: "May 27, 10:15 AM" },
    { id: 2, user: "Sahra Idle", action: "Generated bill BILL-2026-004", time: "May 27, 09:40 AM" },
    { id: 3, user: "Yusuf Jama", action: "Closed ticket TK-2026-0409", time: "May 27, 09:12 AM" },
];

export const ownerReadingRows: OwnerReadingRow[] = [
    { id: 1, readingId: "RD-2026-001", meterId: "MTR-10001", customer: "Abdirahman Hassan", previous: "4,210", current: "4,268", usage: "58 kWh", status: "Verified", date: "May 25, 2026" },
    { id: 2, readingId: "RD-2026-002", meterId: "MTR-10002", customer: "Aamina Yusuf", previous: "2,890", current: "2,942", usage: "52 kWh", status: "Verified", date: "May 25, 2026" },
    { id: 3, readingId: "RD-2026-003", meterId: "MTR-10003", customer: "Mohamed Ali", previous: "1,120", current: "1,168", usage: "48 kWh", status: "Pending", date: "May 24, 2026" },
];

export const ownerBillingRows: OwnerBillingRow[] = [
    { id: 1, billId: "BILL-2026-001", customer: "Abdirahman Hassan", amount: "$42.80", dueDate: "Jun 10, 2026", status: "Paid", period: "May 2026" },
    { id: 2, billId: "BILL-2026-002", customer: "Aamina Yusuf", amount: "$38.50", dueDate: "Jun 10, 2026", status: "Paid", period: "May 2026" },
    { id: 3, billId: "BILL-2026-003", customer: "Mohamed Ali", amount: "$35.20", dueDate: "Jun 10, 2026", status: "Overdue", period: "May 2026" },
    { id: 4, billId: "BILL-2026-004", customer: "Fatuma Ahmed", amount: "$51.10", dueDate: "Jun 10, 2026", status: "Pending", period: "May 2026" },
];

export const ownerPaymentRows: OwnerPaymentRow[] = [
    { id: 1, trxId: "PAY-2026-0001", customer: "Abdirahman Hassan", amount: "$42.80", method: "EVC Plus", status: "Success", date: "May 26, 2026", color: "from-blue-500 to-blue-600" },
    { id: 2, trxId: "PAY-2026-0002", customer: "Aamina Yusuf", amount: "$38.50", method: "eDahab", status: "Success", date: "May 26, 2026", color: "from-emerald-500 to-emerald-600" },
    { id: 3, trxId: "PAY-2026-0003", customer: "Mohamed Ali", amount: "$35.20", method: "Bank", status: "Failed", date: "May 25, 2026", color: "from-rose-500 to-rose-600" },
];

export const ownerOutageRows: OwnerOutageRow[] = [
    { id: 1, outageId: "OUT-2026-01", district: "Hodan", cause: "Transformer fault", customers: "420", status: "Active", started: "May 27, 2026 08:30 AM" },
    { id: 2, outageId: "OUT-2026-02", district: "Waberi", cause: "Cable damage", customers: "420", status: "Active", started: "May 27, 2026 10:15 AM" },
    { id: 3, outageId: "OUT-2026-03", district: "Karan", cause: "Scheduled maintenance", customers: "180", status: "Scheduled", started: "Jun 02, 2026 06:00 AM" },
];

export const ownerChatRows: OwnerChatRow[] = [
    { id: 1, chatId: "CH-2401", customer: "Abdirahman Hassan", subject: "High bill inquiry", status: "Open", lastMessage: "May 27, 11:20 AM" },
    { id: 2, chatId: "CH-2402", customer: "Aamina Yusuf", subject: "Payment confirmation", status: "Resolved", lastMessage: "May 26, 04:45 PM" },
    { id: 3, chatId: "CH-2403", customer: "Mohamed Ali", subject: "Meter reading dispute", status: "In Progress", lastMessage: "May 26, 09:10 AM" },
];

export const ownerNotificationRows: OwnerNotificationRow[] = [
    { id: 1, title: "May bill reminder", channel: "SMS", audience: "Overdue customers", status: "Sent", sentAt: "May 27, 2026 09:00 AM" },
    { id: 2, title: "Outage update — Hodan", channel: "Push", audience: "Hodan district", status: "Sent", sentAt: "May 27, 2026 08:45 AM" },
    { id: 3, title: "Scheduled maintenance", channel: "Email", audience: "All customers", status: "Scheduled", sentAt: "Jun 01, 2026 08:00 AM" },
];

export const ownerRevenueChart = [
    { day: "May 19", value: 8200 },
    { day: "May 20", value: 9100 },
    { day: "May 21", value: 8800 },
    { day: "May 22", value: 10200 },
    { day: "May 23", value: 11400 },
    { day: "May 24", value: 10800 },
    { day: "May 25", value: 12100 },
];

export const ownerDistrictShare = [
    { name: "Hodan", value: 28, color: "#3b82f6" },
    { name: "Waberi", value: 22, color: "#10b981" },
    { name: "Karan", value: 18, color: "#8b5cf6" },
    { name: "Other", value: 32, color: "#64748b" },
];
