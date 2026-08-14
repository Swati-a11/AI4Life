"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Check, Sparkles, ChevronDown, Database, Cpu, HardDrive } from "lucide-react";

export function MemorySection() {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  return (
    <section id="memory" className="py-20 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            PERSISTENT CONTEXT
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
            AI4Life gets to know <span className="gradient-text-cyan">how you work.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            You shouldn't have to explain yourself every time.
          </p>
        </div>

        {/* Conversational Memory Visual Card */}
        <div className="max-w-3xl mx-auto glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 space-y-6 shadow-xl bg-white/80 dark:bg-slate-950">
          
          {/* Day 1 Chat Exchange */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                DAY 1
              </span>
            </div>
            
            <div className="flex justify-end">
              <div className="p-3 rounded-2xl bg-cyan-500/10 text-slate-900 dark:text-cyan-200 border border-cyan-500/20 text-xs font-medium max-w-md">
                "I prefer short bullet-point explanations with zero jargon."
              </div>
            </div>

            <div className="flex justify-start">
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-500" />
                <span>Got it. I'll format future outputs this way.</span>
              </div>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-200 dark:border-slate-800" />

          {/* Later Automatic Adaptation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                LATER...
              </span>
              <span className="text-[11px] text-slate-400">User uploads dense research PDF</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                <Sparkles className="w-3.5 h-3.5" />
                AI4Life Automatic Response:
              </div>
              <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 pl-1">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                  <span><strong>Short explanation:</strong> Core mechanics broken into 3 parts.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                  <span><strong>Key points:</strong> Instant takeaway without fluff.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                  <span><strong>No jargon:</strong> Formatted to match your preferences.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Tiny Technical Footer */}
          <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
            Powered by persistent AI memory.
          </div>
        </div>

        {/* Small Expandable "How it works" Row */}
        <div className="max-w-3xl mx-auto mt-6 text-center">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            type="button"
          >
            <span>{showTechnicalDetails ? "Hide technical stack" : "How it works technically"}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTechnicalDetails ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {showTechnicalDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 rounded-2xl bg-white/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-3"
              >
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950">
                  <Cpu className="w-4 h-4 text-cyan-500" />
                  <span>Personal preferences → Mem0</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950">
                  <Database className="w-4 h-4 text-sky-500" />
                  <span>Document knowledge → Qdrant</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950">
                  <HardDrive className="w-4 h-4 text-teal-500" />
                  <span>App data → MongoDB</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
