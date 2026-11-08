const spark = {
    blue: { glowColor: "metricBlue", sparklinePath: "M 0 15 Q 10 5, 20 12 T 40 8 T 60 4", stroke: "#3b82f6" },
    green: { glowColor: "metricGreen", sparklinePath: "M 0 18 Q 15 15, 30 8 T 60 2", stroke: "#10b981" },
    purple: { glowColor: "metricPurple", sparklinePath: "M 0 14 Q 10 18, 25 10 T 50 6 T 60 12", stroke: "#8b5cf6" },
    amber: { glowColor: "metricAmber", sparklinePath: "M 0 16 Q 20 10, 35 14 T 60 6", stroke: "#f59e0b" },
    rose: { glowColor: "metricRose", sparklinePath: "M 0 12 Q 20 16, 35 10 T 60 14", stroke: "#f43f5e" },
};

export const customerMetrics = [
    { title: "Total Customers", value: "218,270", trend: "12.3% from last month", ...spark.blue },
    { title: "Active Customers", value: "192,540", trend: "13.2% from last month", ...spark.green },
    { title: "Inactive Customers", value: "15,430", trend: "4.3% from last month", ...spark.rose },
    { title: "New This Month", value: "10,289", trend: "8.7% from last month", ...spark.purple },
];

export const transactionMetrics = [
    { title: "Total Transactions", value: "518,760", trend: "18.2% from last month", ...spark.blue },
    { title: "Total Amount", value: "$2,985,540", trend: "18.2% from last month", ...spark.green },
    { title: "Successful", value: "498,540", trend: "18.2% from last month", ...spark.green },
    { title: "Failed", value: "20,220", trend: "3.0% from last month", ...spark.rose },
];

export const reportMetrics = [
    { title: "Total Revenue", value: "$2,885,540", trend: "18.2% from last month", ...spark.blue },
    { title: "Total Customers", value: "218,270", trend: "12.3% from last month", ...spark.green },
    { title: "Transactions", value: "518,760", trend: "18.2% from last month", ...spark.purple },
    { title: "Active Companies", value: "48", trend: "4 new this month", ...spark.amber },
];

export const monitoringMetrics = [
    { title: "System Status", value: "Healthy", trend: "All systems operational", ...spark.green },
    { title: "Server Uptime", value: "99.99%", trend: "0.01% from last month", ...spark.blue },
    { title: "Active Users", value: "1,248", trend: "Online right now", ...spark.purple },
    { title: "System Load", value: "24%", trend: "Normal load", ...spark.amber },
];

export const subscriptionMetrics = [
    { title: "Total Plans", value: "6", trend: "Active subscription plans", ...spark.blue },
    { title: "Active Subscriptions", value: "48", trend: "Companies subscribed", ...spark.green },
    { title: "Total Revenue", value: "$2,845,230", trend: "From subscriptions", ...spark.purple },
    { title: "MRR", value: "$235,420", trend: "Monthly recurring revenue", ...spark.amber },
];

export const announcementMetrics = [
    { title: "Total Announcements", value: "24", trend: "All time", ...spark.blue },
    { title: "Published", value: "18", trend: "Active now", ...spark.green },
    { title: "Scheduled", value: "4", trend: "Upcoming", ...spark.amber },
    { title: "Drafts", value: "2", trend: "Not published", ...spark.purple },
];

export const supportMetrics = [
    { title: "Total Tickets", value: "1,248", trend: "All time", ...spark.blue },
    { title: "Open Tickets", value: "156", trend: "Need attention", ...spark.amber },
    { title: "In Progress", value: "89", trend: "Being handled", ...spark.green },
    { title: "Resolved", value: "1,003", trend: "Completed", ...spark.purple },
];

export type CustomerRow = {
    id: number;
    name: string;
    phone: string;
    email: string;
    company: string;
    meter: string;
    status: string;
    joined: string;
    color: string;
};

export type TransactionRow = {
    id: number;
    trxId: string;
    customer: string;
    type: string;
    company: string;
    amount: string;
    status: string;
    date: string;
    color: string;
};

export type SubscriptionRow = {
    id: number;
    company: string;
    plan: string;
    status: string;
    amount: string;
    start: string;
    next: string;
};

export type AnnouncementRow = {
    id: number;
    title: string;
    audience: string;
    status: string;
    publishedAt: string;
};

export type TicketRow = {
    id: number;
    ticketId: string;
    subject: string;
    customer: string;
    priority: string;
    status: string;
    created: string;
};

export const customerRows: CustomerRow[] = [
    { id: 1, name: "Abdirahman Hassan", phone: "+252 61 421 1001", email: "abdi@beco.so", company: "Somali Electric Co.", meter: "MTR-10001", status: "Active", joined: "Jan 12, 2024", color: "from-blue-500 to-blue-600" },
    { id: 2, name: "Aamina Yusuf", phone: "+252 61 421 1002", email: "ayan@sompower.so", company: "Som Power", meter: "MTR-10002", status: "Active", joined: "Feb 01, 2024", color: "from-emerald-500 to-emerald-600" },
    { id: 3, name: "Mohamed Ali", phone: "+252 61 421 1003", email: "m.ali@heco.so", company: "HECO", meter: "MTR-10003", status: "Inactive", joined: "Feb 14, 2024", color: "from-purple-500 to-purple-600" },
    { id: 4, name: "Fatuma Ahmed", phone: "+252 61 421 1004", email: "fatuma@telesom.so", company: "Telesom Electric", meter: "MTR-10004", status: "Active", joined: "Mar 05, 2024", color: "from-orange-500 to-orange-600" },
    { id: 5, name: "Ismail Noor", phone: "+252 61 421 1005", email: "ismail@necsom.so", company: "NECSOM", meter: "MTR-10005", status: "Active", joined: "Mar 28, 2024", color: "from-cyan-500 to-cyan-600" },
];

export const transactionRows: TransactionRow[] = [
    { id: 1, trxId: "TRX-2026-0001", customer: "Abdirahman Hassan", type: "Payment", company: "Somali Electric Co.", amount: "$125.50", status: "Success", date: "May 25, 2026 02:35 PM", color: "from-blue-500 to-blue-600" },
    { id: 2, trxId: "TRX-2026-0002", customer: "Aamina Yusuf", type: "Payment", company: "Som Power", amount: "$89.00", status: "Success", date: "May 25, 2026 01:12 PM", color: "from-emerald-500 to-emerald-600" },
    { id: 3, trxId: "TRX-2026-0003", customer: "Mohamed Ali", type: "Refund", company: "HECO", amount: "-$45.00", status: "Failed", date: "May 24, 2026 11:48 AM", color: "from-purple-500 to-purple-600" },
    { id: 4, trxId: "TRX-2026-0004", customer: "Fatuma Ahmed", type: "Payment", company: "Telesom Electric", amount: "$210.75", status: "Success", date: "May 24, 2026 09:20 AM", color: "from-orange-500 to-orange-600" },
    { id: 5, trxId: "TRX-2026-0005", customer: "Ismail Noor", type: "Payment", company: "NECSOM", amount: "$67.30", status: "Success", date: "May 23, 2026 04:55 PM", color: "from-cyan-500 to-cyan-600" },
];

export const subscriptionRows: SubscriptionRow[] = [
    { id: 1, company: "Somali Electric Co.", plan: "Premium", status: "Active", amount: "$1,299 / month", start: "Jan 01, 2024", next: "Jun 01, 2026" },
    { id: 2, company: "Som Power", plan: "Premium", status: "Active", amount: "$1,299 / month", start: "Feb 15, 2024", next: "Jun 15, 2026" },
    { id: 3, company: "HECO", plan: "Standard", status: "Active", amount: "$699 / month", start: "Mar 10, 2024", next: "Jun 10, 2026" },
    { id: 4, company: "Kismayo Power", plan: "Standard", status: "Active", amount: "$699 / month", start: "Apr 02, 2024", next: "Jul 02, 2026" },
    { id: 5, company: "NECSOM", plan: "Basic", status: "Active", amount: "$499 / month", start: "May 01, 2024", next: "Jul 01, 2026" },
];

export const announcementRows: AnnouncementRow[] = [
    { id: 1, title: "System Maintenance Notice", audience: "All Users", status: "Published", publishedAt: "May 24, 2024 10:00 AM" },
    { id: 2, title: "New Payment Gateway Integration", audience: "All Companies", status: "Published", publishedAt: "May 20, 2024 02:30 PM" },
    { id: 3, title: "Electricity Tariff Update", audience: "Customers", status: "Scheduled", publishedAt: "Jun 01, 2024 08:00 AM" },
    { id: 4, title: "Holiday Notice - Eid al Adha", audience: "All Users", status: "Draft", publishedAt: "—" },
];

export const ticketRows: TicketRow[] = [
    { id: 1, ticketId: "TK-2024-0001", subject: "High Bill Amount", customer: "Abdirahman Hassan", priority: "High", status: "Open", created: "May 25, 2024 02:30 PM" },
    { id: 2, ticketId: "TK-2024-0002", subject: "Payment Failed", customer: "Aamina Yusuf", priority: "Medium", status: "In Progress", created: "May 24, 2024 04:15 PM" },
    { id: 3, ticketId: "TK-2024-0003", subject: "Meter Reading Incorrect", customer: "Mohamed Ali", priority: "Low", status: "Resolved", created: "May 23, 2024 11:00 AM" },
    { id: 4, ticketId: "TK-2024-0004", subject: "Connection Issue", customer: "Fatuma Ahmed", priority: "High", status: "Open", created: "May 22, 2024 09:45 AM" },
    { id: 5, ticketId: "TK-2024-0005", subject: "Refund Not Received", customer: "Ismail Noor", priority: "Medium", status: "In Progress", created: "May 21, 2024 03:20 PM" },
];

export const revenueChartData = [
    { day: "May 19", value: 420 },
    { day: "May 20", value: 580 },
    { day: "May 21", value: 510 },
    { day: "May 22", value: 640 },
    { day: "May 23", value: 720 },
    { day: "May 24", value: 680 },
    { day: "May 25", value: 760 },
];

export const companyRevenueShare = [
    { name: "Somali Electric Co.", value: 32, color: "#3b82f6" },
    { name: "Som Power", value: 24, color: "#10b981" },
    { name: "HECO", value: 18, color: "#8b5cf6" },
    { name: "Others", value: 26, color: "#64748b" },
];

export const monitoringServices = [
    { name: "Web Server", status: "Operational", uptime: "99.98%" },
    { name: "Database", status: "Operational", uptime: "99.99%" },
    { name: "API Server", status: "Operational", uptime: "99.97%" },
    { name: "Payment Gateway", status: "Operational", uptime: "99.95%" },
    { name: "Email Service", status: "Operational", uptime: "99.90%" },
];
