"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, CheckSquare, Sparkles, Check, ArrowRight, Layers, ListChecks } from "lucide-react";

export function MainDemoSection() {
  const [isChecklistMode, setIsChecklistMode] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const toggleCheck = (index: number) => {
    setCheckedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const initialHighlights = [
    { title: "Fee due Sept 30", detail: "Annual tuition balance" },
    { title: "Parent orientation Sept 18", detail: "6:00 PM in Main Auditorium" },
    { title: "Medical record due Sept 22", detail: "Immunization updates required" },
    { title: "Uniform pickup starts Monday", detail: "School supply store" },
  ];

  const checklistItems = [
    "Pay school fee",
    "Upload medical record",
    "Attend orientation",
    "Collect uniform",
  ];

  return (
    <section id="demo" className="py-20 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            PRODUCT DEMO
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
            From one document to a <span className="gradient-text-cyan">whole plan.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Watch how a dense 15-page circular converts into clear actionable tasks in one click.
          </p>
        </div>

        {/* Large Interactive Product Demo Box */}
        <div className="rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 p-4 sm:p-8 shadow-2xl bg-white/80 dark:bg-slate-950 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Realistic Document Preview */}
            <div className="md:col-span-5 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">School_Circular.pdf</h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400">15 pages • Dense text & policy</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 text-[11px] text-slate-500 space-y-1 font-mono">
                  <p>...section 4.2: annual fee schedule due prior to Sept 30...</p>
                  <p>...parent orientation convening Sept 18 18:00 hrs...</p>
                  <p>...health records mandatory before Sept 22...</p>
                </div>
              </div>

              <div className="text-center sm:text-left">
                <span className="text-[11px] font-semibold text-slate-500 italic block">
                  "One document. Several useful outcomes."
                </span>
              </div>
            </div>

            {/* Right Column: AI4Life Analysis & Transformation */}
            <div className="md:col-span-7 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
              {/* User Prompt */}
              <div className="flex justify-end">
                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-800 dark:text-cyan-200 border border-cyan-500/20 text-xs font-semibold">
                  "Find what I actually need to do."
                </div>
              </div>

              {/* Transformation Output */}
              <AnimatePresence mode="wait">
                {!isChecklistMode ? (
                  <motion.div
                    key="highlights"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        4 things you need to know
                      </span>
                    </div>

                    <div className="space-y-2">
                      {initialHighlights.map((item) => (
                        <div
                          key={item.title}
                          className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-500" />
                            <span className="font-bold text-slate-800 dark:text-slate-200">{item.title}</span>
                          </div>
                          <span className="text-[11px] text-slate-500">{item.detail}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setIsChecklistMode(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-md transition-all"
                      type="button"
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span>Create checklist</span>
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="checklist"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2">
                      <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ListChecks className="w-4 h-4" />
                        MY CHECKLIST
                      </span>
                      <button
                        onClick={() => setIsChecklistMode(false)}
                        className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white underline"
                        type="button"
                      >
                        Reset view
                      </button>
                    </div>

                    <div className="space-y-2">
                      {checklistItems.map((item, idx) => (
                        <button
                          key={item}
                          onClick={() => toggleCheck(idx)}
                          className={`w-full text-left p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                            checkedItems[idx]
                              ? "bg-cyan-500/10 border-cyan-500/30 text-slate-500 line-through"
                              : "bg-white dark:bg-slate-950 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                          }`}
                          type="button"
                        >
                          <span className="font-semibold">{item}</span>
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center border ${checkedItems[idx] ? "bg-cyan-400 border-cyan-400 text-slate-950" : "border-slate-400"}`}>
                            {checkedItems[idx] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
