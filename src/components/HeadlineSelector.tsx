"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, Layers, SlidersHorizontal } from "lucide-react";

export interface HeadlineOption {
  id: string;
  badge: string;
  headline: string;
  accentWord: string;
  subheadline: string;
}

export const HEADLINE_OPTIONS: HeadlineOption[] = [
  {
    id: "action",
    badge: "Option A • Action Focused",
    headline: "Turn scattered information into crystal clarity and",
    accentWord: "decisive action.",
    subheadline: "Upload your raw documents, lecture notes, or household files. AI4Life connects your data across Student, Professional, and Household spaces to generate instant summaries and automated workflow tasks."
  },
  {
    id: "spaces",
    badge: "Option B • 3-Spaces Focused",
    headline: "One intelligent AI platform. Three dedicated spaces for",
    accentWord: "study, work, & home.",
    subheadline: "Stop context-switching between fragmented tools. Experience a single AI core optimized for student courseware, professional deliverables, and household management."
  },
  {
    id: "synthesis",
    badge: "Option C • Synthesis Focused",
    headline: "From uploaded files to deep understanding to",
    accentWord: "automatic execution.",
    subheadline: "Upload PDF research, quarterly roadmaps, or home warranties. AI4Life distills complex information into actionable study cards, executive briefs, and recurring reminders."
  }
];

interface HeadlineSelectorProps {
  activeId: string;
  onSelect: (option: HeadlineOption) => void;
}

export function HeadlineSelector({ activeId, onSelect }: HeadlineSelectorProps) {
  const activeOption = HEADLINE_OPTIONS.find((opt) => opt.id === activeId) || HEADLINE_OPTIONS[0];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto text-center">
      {/* Interactive Headline Version Switcher Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-200/50 dark:bg-slate-800/60 border border-slate-300/60 dark:border-slate-700/60 backdrop-blur-md shadow-inner"
      >
        <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          Headline Variation:
        </span>
        <div className="flex items-center gap-1">
          {HEADLINE_OPTIONS.map((opt) => {
            const isActive = opt.id === activeId;
            return (
              <button
                key={opt.id}
                onClick={() => onSelect(opt)}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                  isActive
                    ? "text-teal-950 dark:text-teal-100 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/40 dark:hover:bg-slate-700/40"
                }`}
                type="button"
              >
                {isActive && (
                  <motion.div
                    layoutId="headline-pill"
                    className="absolute inset-0 rounded-xl bg-white dark:bg-slate-700 border border-slate-200/80 dark:border-slate-600 shadow-xs"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {isActive && <Check className="w-3 h-3 text-teal-600 dark:text-teal-400" />}
                  {opt.id.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Main Animated Headline Display */}
      <div className="min-h-[140px] sm:min-h-[160px] flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeOption.id}
            initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex flex-col items-center gap-3"
          >
            {/* Category Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
              <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              {activeOption.badge}
            </span>

            {/* Headline H1 */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading leading-[1.15] max-w-4xl">
              {activeOption.headline}{" "}
              <span className="gradient-text-teal inline-block">
                {activeOption.accentWord}
              </span>
            </h1>

            {/* Subheadline Paragraph */}
            <p className="mt-2 text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl font-normal leading-relaxed">
              {activeOption.subheadline}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
