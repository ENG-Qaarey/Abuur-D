import { Company } from "./types";

export const regions = ["All Regions", "Mogadishu", "Somaliland", "Puntland", "Jubaland"];
export const statuses = ["All Status", "Active", "Inactive"];
export const plans = ["Premium", "Standard", "Basic"];

export const allCompanies: Company[] = [
    { id: 1, name: "BECO (Benadir Electric)", domain: "beco.so", region: "Mogadishu", customers: 45230, meters: 62340, revenue: 425230, plan: "Premium", status: "Active", joined: "Jan 12, 2024", logo: "B", logoColor: "from-blue-500 to-blue-600" },
    { id: 2, name: "Som Power", domain: "sompower.so", region: "Mogadishu", customers: 38450, meters: 51230, revenue: 367890, plan: "Premium", status: "Active", joined: "Feb 18, 2024", logo: "S", logoColor: "from-emerald-500 to-emerald-600" },
    { id: 3, name: "HECO (Hargeisa Electric)", domain: "heco.so", region: "Somaliland", customers: 32120, meters: 45780, revenue: 289450, plan: "Standard", status: "Active", joined: "Mar 05, 2024", logo: "H", logoColor: "from-purple-500 to-purple-600" },
    { id: 4, name: "Telesom Electric", domain: "telesomelectric.so", region: "Somaliland", customers: 28450, meters: 38920, revenue: 245780, plan: "Standard", status: "Active", joined: "Mar 22, 2024", logo: "T", logoColor: "from-orange-500 to-orange-600" },
    { id: 5, name: "NECSOM", domain: "necsom.so", region: "Puntland", customers: 25890, meters: 34560, revenue: 198650, plan: "Premium", status: "Active", joined: "Apr 10, 2024", logo: "N", logoColor: "from-cyan-500 to-cyan-600" },
    { id: 6, name: "Bosaso Electric Company", domain: "bosasoelectric.so", region: "Puntland", customers: 18230, meters: 24450, revenue: 145230, plan: "Basic", status: "Active", joined: "May 14, 2024", logo: "B", logoColor: "from-rose-500 to-rose-600" },
    { id: 7, name: "Galkayo Power", domain: "galkayopower.so", region: "Puntland", customers: 15670, meters: 21340, revenue: 132450, plan: "Standard", status: "Active", joined: "Jun 02, 2024", logo: "G", logoColor: "from-amber-500 to-amber-600" },
    { id: 8, name: "Kismayo Electric", domain: "kismayoelectric.so", region: "Jubaland", customers: 14230, meters: 19870, revenue: 118760, plan: "Basic", status: "Active", joined: "Jun 18, 2024", logo: "K", logoColor: "from-teal-500 to-teal-600" },
];
