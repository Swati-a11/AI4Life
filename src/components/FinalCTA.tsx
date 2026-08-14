"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export function FinalCTA() {
  return (
    <section id="try-ai4life" className="py-24 relative overflow-hidden border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950">
      {/* Subtle Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
        
        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-heading tracking-tight leading-tight">
          Your information is already valuable. <br />
          <span className="gradient-text-cyan">AI4Life helps you do something with it.</span>
        </h2>

        <div className="pt-4 flex flex-col items-center gap-3">
          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href="#pricing"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-teal-300 hover:from-cyan-300 hover:to-sky-300 shadow-xl shadow-cyan-500/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <span>Try AI4Life free</span>
            <ArrowRight className="w-5 h-5" />
          </motion.a>

          <span className="text-xs text-slate-500 font-medium">
            Bring a file. Ask a question. See what happens.
          </span>
        </div>

      </div>
    </section>
  );
}
