"use client";

import { motion } from "framer-motion";
import { Hammer } from "lucide-react";

export default function MeterReadersPage() {
  return (
    <div className="p-8 h-full flex flex-col items-center justify-center text-center space-y-4">
      <motion.div 
        initial={{ rotate: 0 }}
        animate={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center"
      >
        <Hammer size={32} />
      </motion.div>
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">company admin / meter readers</h1>
        <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">This module is currently being optimized.</p>
      </div>
    </div>
  );
}
