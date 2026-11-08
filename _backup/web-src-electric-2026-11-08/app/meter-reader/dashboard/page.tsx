"use client";

import { motion } from "framer-motion";
import { Zap, Camera, Home, History, Bell, User } from "lucide-react";
import Link from "next/link";

export default function MeterReaderDashboard() {
    return (
        <div className="space-y-6 pb-10">
            <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between gap-4 p-6">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">Meter Portal</h1>
                        <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Field Agent: Ahmed Mohamed</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
                        <Bell size={20} />
                    </div>
                </div>
            </section>

            <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Today's Goal</p>
                        <p className="text-2xl font-black text-slate-900">12/40</p>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-primary h-full w-[30%] rounded-full" />
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                        <div className="flex items-center text-emerald-500 space-x-1 mt-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-sm font-black uppercase">Online</span>
                        </div>
                    </div>
                </div>

                {/* Scan Button - Mobile First */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-primary text-white p-8 rounded-3xl flex flex-col items-center justify-center shadow-2xl shadow-primary/30 space-y-4"
                >
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                        <Camera size={32} />
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-black uppercase tracking-widest">Scan Meter</p>
                        <p className="text-white/60 text-xs font-bold">Auto-detect meter reading</p>
                    </div>
                </motion.button>

                {/* Pending Readings */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Nearby Assignments</h2>
                        <Link href="#" className="text-[10px] font-black text-primary uppercase tracking-widest">View Map</Link>
                    </div>

                    <div className="space-y-3">
                        {[
                            { id: "MTR-9021", loc: "Hodan District, Sector 4", name: "Ibrahim Abdi" },
                            { id: "MTR-8842", loc: "Waberi, Airport Rd", name: "Safia Nuur" },
                            { id: "MTR-7711", loc: "Bondhere, St 12", name: "Muse Hirsi" },
                        ].map((reader) => (
                            <div key={reader.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-slate-900">{reader.name}</p>
                                    <p className="text-[10px] text-slate-500 font-bold">{reader.loc}</p>
                                    <p className="text-[9px] text-primary font-black uppercase tracking-widest">{reader.id}</p>
                                </div>
                                <button className="bg-slate-50 text-slate-900 px-4 py-2 rounded-xl text-xs font-black border border-slate-100">
                                    Select
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
