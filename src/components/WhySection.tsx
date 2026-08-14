"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

export function WhySection() {
  return (
    <section className="py-24 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-950/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            THE DIFFERENCE
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
            Not another <span className="gradient-text-cyan">chatbot.</span>
          </h2>
        </div>

        {/* 3 Simple Typographic Statements */}
        <div className="space-y-8 max-w-3xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40"
          >
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 font-heading sm:w-1/3">
              CHATBOTS
            </span>
            <span className="text-xl font-bold text-slate-600 dark:text-slate-400 sm:w-2/3 mt-1 sm:mt-0">
              Give you answers.
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40"
          >
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 font-heading sm:w-1/3">
              NOTE APPS
            </span>
            <span className="text-xl font-bold text-slate-600 dark:text-slate-400 sm:w-2/3 mt-1 sm:mt-0">
              Store your information.
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-2xl border border-cyan-500/40 bg-cyan-500/5 dark:bg-slate-900 shadow-lg"
          >
            <span className="text-xs font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400 font-heading sm:w-1/3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              AI4Life
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white sm:w-2/3 mt-1 sm:mt-0">
              Understands your information and helps you use it.
            </span>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
