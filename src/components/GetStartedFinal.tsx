"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Briefcase, Calendar, Zap } from "lucide-react";

export function GetStartedFinal() {
  return (
    <section id="get-started" className="py-32 relative overflow-hidden border-t border-slate-200/80 dark:border-slate-800/80 bg-[#F4F3EE] dark:bg-[#080B12]">
      
      {/* Background Orbiting Convergence Visual */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 dark:opacity-40">
        
        {/* Student Notebook Orbit */}
        <motion.div
          animate={{ x: [-140, -50, -140], y: [-50, 10, -50], rotate: [-12, 0, -12] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-16 left-1/4 p-3.5 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-[#3157D5] dark:text-[#4F8CFF] border border-blue-500/30 flex items-center gap-2 shadow-xs"
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Student Notebook</span>
        </motion.div>

        {/* Task Sheet Orbit */}
        <motion.div
          animate={{ x: [140, 50, 140], y: [-40, 10, -40], rotate: [12, 0, 12] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-16 right-1/4 p-3.5 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 text-[#0D9488] dark:text-[#38D9C5] border border-teal-500/30 flex items-center gap-2 shadow-xs"
        >
          <Briefcase className="w-5 h-5" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Task Sheet</span>
        </motion.div>

        {/* Calendar Orbit */}
        <motion.div
          animate={{ y: [70, 15, 70] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-16 p-3.5 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 text-[#E56B4E] border border-orange-500/30 flex items-center gap-2 shadow-xs"
        >
          <Calendar className="w-5 h-5" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Household Schedule</span>
        </motion.div>

        {/* Central Core Mark */}
        <div className="w-52 h-52 rounded-full border border-blue-500/30 flex items-center justify-center animate-pulse">
          <div className="w-28 h-28 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Zap className="w-10 h-10 text-[#3157D5] dark:text-[#4F8CFF]" />
          </div>
        </div>

      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
        
        <h2 className="section-headline text-slate-900 dark:text-white font-heading">
          Your life has enough tabs.
        </h2>

        <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-200 font-heading">
          Bring it together with <span className="text-[#3157D5] dark:text-[#4F8CFF]">AI4Life.</span>
        </p>

        <div className="pt-4 flex flex-col items-center gap-3">
          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href="#workspaces"
            className="group inline-flex items-center justify-center gap-3 px-9 py-4 rounded-2xl text-base font-bold text-white bg-[#3157D5] dark:bg-[#4F8CFF] hover:bg-[#2848b8] dark:hover:bg-[#3b79f0] shadow-xl shadow-blue-500/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span>Get started free</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </motion.a>

          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            No credit card required.
          </span>
        </div>

      </div>
    </section>
  );
}
