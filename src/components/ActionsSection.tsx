"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  HelpCircle,
  GitCompare,
  Sparkles,
  BookOpen,
  CheckSquare,
  ListTodo,
  Search,
  Check
} from "lucide-react";

export function ActionsSection() {
  const [activeAction, setActiveAction] = useState("Checklist");

  const actionItems = [
    { name: "Summarize", icon: FileText, color: "text-cyan-500" },
    { name: "Explain", icon: HelpCircle, color: "text-sky-500" },
    { name: "Compare", icon: GitCompare, color: "text-teal-500" },
    { name: "Quiz", icon: Sparkles, color: "text-indigo-500" },
    { name: "Flashcards", icon: BookOpen, color: "text-amber-500" },
    { name: "Checklist", icon: CheckSquare, color: "text-cyan-500" },
    { name: "Tasks", icon: ListTodo, color: "text-emerald-500" },
    { name: "Research", icon: Search, color: "text-purple-500" },
  ];

  return (
    <section id="actions" className="py-20 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            INTERACTIVE ACTIONS
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
            Don't just ask. <span className="gradient-text-cyan">Make something.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Select an action below to see how AI4Life transforms document input into useful output.
          </p>
        </div>

        {/* Interactive Action Strip */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 max-w-4xl mx-auto">
          {actionItems.map((act) => {
            const Icon = act.icon;
            const isActive = activeAction === act.name;
            return (
              <button
                key={act.name}
                onClick={() => setActiveAction(act.name)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                  isActive
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-md scale-105"
                    : "bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
                type="button"
              >
                <Icon className={`w-4 h-4 ${isActive ? (activeAction === act.name ? "text-cyan-400 dark:text-cyan-600" : "") : act.color}`} />
                <span>{act.name}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Central Output Card */}
        <div className="max-w-3xl mx-auto glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl bg-white/80 dark:bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3 mb-4">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              Output Mode: {activeAction}
            </span>
            <span className="text-[11px] text-slate-400">Source: School_Circular.pdf</span>
          </div>

          <AnimatePresence mode="wait">
            {activeAction === "Quiz" && (
              <motion.div
                key="Quiz"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3 text-xs"
              >
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">5-Question Revision Quiz</h4>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">1. When is the annual tuition fee deadline?</p>
                  <p className="text-slate-500 text-[11px] mt-1">Answer: September 30th (Auditorium ledger office).</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">2. Where will parent orientation take place?</p>
                  <p className="text-slate-500 text-[11px] mt-1">Answer: Main Auditorium at 6:00 PM on Sept 18th.</p>
                </div>
              </motion.div>
            )}

            {activeAction === "Checklist" && (
              <motion.div
                key="Checklist"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2 text-xs"
              >
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2">4 Action Items</h4>
                {["Pay school fee by Sept 30", "Upload medical record by Sept 22", "Attend orientation Sept 18", "Collect uniform starting Monday"].map((item) => (
                  <div key={item} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{item}</span>
                    <Check className="w-4 h-4 text-cyan-500" />
                  </div>
                ))}
              </motion.div>
            )}

            {activeAction === "Summarize" && (
              <motion.div
                key="Summarize"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3 text-xs"
              >
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">1-Page Executive Summary</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  This circular outlines academic calendar events, financial deadlines, and mandatory health record filings for the upcoming school semester.
                </p>
                <ul className="list-disc pl-4 text-slate-600 dark:text-slate-300 space-y-1">
                  <li>Key financial obligation: September 30 deadline.</li>
                  <li>Key event: Parent orientation on September 18.</li>
                </ul>
              </motion.div>
            )}

            {!["Quiz", "Checklist", "Summarize"].includes(activeAction) && (
              <motion.div
                key="Default"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300"
              >
                <p className="font-semibold text-slate-900 dark:text-white mb-1">{activeAction} Output Generated</p>
                <p className="text-slate-500">AI4Life converted the source document into structured {activeAction.toLowerCase()} deliverables.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
