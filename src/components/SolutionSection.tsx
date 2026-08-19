"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  BrainCircuit,
  Database,
  Zap,
  FileText,
  MessageSquare,
  Sparkles,
  CheckSquare,
  Check,
  ChevronRight,
  Search,
  BookOpen,
  HelpCircle,
  Clock,
  Layers
} from "lucide-react";

export function SolutionSection() {
  const [activeFlowIndex, setActiveFlowIndex] = useState(1);

  const flowStages = [
    {
      id: "upload",
      title: "1. UPLOAD",
      subtitle: "Ingest Any Content",
      desc: "Upload PDFs, URLs, audio, notes, or images into a unified space.",
      icon: Upload,
      color: "text-cyan-400"
    },
    {
      id: "understand",
      title: "2. UNDERSTAND",
      subtitle: "Multi-Modal Reasoning",
      desc: "AI4Life parses complex terms, tables, and audio transcripts with accuracy.",
      icon: BrainCircuit,
      color: "text-sky-400"
    },
    {
      id: "remember",
      title: "3. REMEMBER",
      subtitle: "Context & Preferences",
      desc: "Mem0 vector memory retains your personal style across sessions.",
      icon: Database,
      color: "text-teal-400"
    },
    {
      id: "act",
      title: "4. ACT",
      subtitle: "Automated Deliverables",
      desc: "Instantly generates study flashcards, Jira tasks, summaries & quizzes.",
      icon: Zap,
      color: "text-amber-400"
    }
  ];

  return (
    <section id="solution" className="py-24 relative overflow-hidden border-t border-slate-800/60 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            The AI4Life Engine
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white font-heading tracking-tight">
            One workspace. <span className="gradient-text-cyan">Everything understood.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            A single intelligent hub that unifies your information pipeline into real, executed outputs.
          </p>
        </div>

        {/* Sequential Visual Flow Indicator Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10 max-w-4xl mx-auto">
          {flowStages.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = activeFlowIndex === idx;
            return (
              <button
                key={stage.id}
                onClick={() => setActiveFlowIndex(idx)}
                className={`p-4 rounded-2xl border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                  isActive
                    ? "bg-slate-900 border-cyan-400/60 shadow-lg shadow-cyan-500/10 scale-102"
                    : "bg-slate-900/40 border-slate-800 hover:bg-slate-900/70"
                }`}
                type="button"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${stage.color}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isActive ? "bg-cyan-500/20 text-cyan-300" : "text-slate-500"}`}>
                    {stage.title}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1 font-heading">{stage.subtitle}</h4>
                <p className="text-xs text-slate-400 line-clamp-2">{stage.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Polished AI4Life Product Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl glass-card border border-slate-800 p-2 sm:p-4 shadow-2xl overflow-hidden bg-slate-950/90"
        >
          {/* Top Window Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-semibold text-slate-400 ml-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                AI4Life Workspace • Q3 Strategy & Academic Vault
              </span>
            </div>
            
            {/* Memory & Credit Status Indicators */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                Mem0 Sync Active
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                1,240 / 2,000 Credits
              </span>
            </div>
          </div>

          {/* Dashboard Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 min-h-[480px]">
            
            {/* Sidebar (Sources & Folders) */}
            <div className="lg:col-span-3 rounded-2xl bg-slate-900/60 p-4 border border-slate-800 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Uploaded Sources (4)
                  </span>
                  <Upload className="w-4 h-4 text-cyan-400 cursor-pointer hover:scale-110 transition-transform" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/80 border border-cyan-500/30 text-xs text-white">
                    <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="truncate font-medium">School_Circular_2026.pdf</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                    <BookOpen className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className="truncate font-medium">Q3_Product_Roadmap.docx</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                    <MessageSquare className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate font-medium">Team_Sync_Transcript.mp3</span>
                  </div>
                </div>
              </div>

              {/* Memory Vault Indicator */}
              <div className="pt-4 border-t border-slate-800">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <span className="font-semibold text-slate-300 block mb-1">
                    Personal Context:
                  </span>
                  <p className="text-slate-400 italic text-[11px]">
                    "Prefers bullet summaries & automatic checklist creation."
                  </p>
                </div>
              </div>
            </div>

            {/* Middle Section: AI Chat & Reasoning Stream */}
            <div className="lg:col-span-6 rounded-2xl bg-slate-900/80 p-4 sm:p-6 border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                {/* User Prompt */}
                <div className="flex justify-end">
                  <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs sm:text-sm text-cyan-200 max-w-sm">
                    "Extract key deadlines from the school circular and create my action checklist."
                  </div>
                </div>

                {/* AI Assistant Output */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-sky-500 flex items-center justify-center text-slate-950 font-bold shrink-0 shadow-md">
                    <Zap className="w-4 h-4 fill-current text-slate-950" />
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-slate-200 space-y-2 w-full">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                      <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI4Life Understanding Complete
                      </span>
                      <span className="text-[10px] text-slate-400">15 pages processed in 0.4s</span>
                    </div>
                    <p className="text-slate-300 text-xs">
                      I analyzed <strong className="text-white">School_Circular_2026.pdf</strong> using your personal context preferences. Here are the 4 key action items found:
                    </p>
                    <ul className="space-y-1.5 text-xs text-slate-200">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Annual Tuition Fee Deadline — Sept 30</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Parent Orientation Night — Sept 18 at 6 PM</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Chat Input Bar */}
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value="Generate 5-question quiz for student review..."
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 focus:outline-none"
                />
                <button className="absolute right-2 top-2 p-1.5 rounded-lg bg-cyan-400 text-slate-950 font-bold" type="button">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Panel: Generated Actions */}
            <div className="lg:col-span-3 rounded-2xl bg-slate-900/60 p-4 border border-slate-800 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Generated Actions
              </span>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-800/90 border border-cyan-500/40 text-xs space-y-1">
                  <div className="flex items-center justify-between text-cyan-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5" />
                      Parent Checklist
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">Active</span>
                  </div>
                  <p className="text-[11px] text-slate-300">4 items synced to Apple Reminders</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1 hover:border-sky-500/30 transition-colors">
                  <div className="flex items-center justify-between text-slate-200 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      12 Quiz Flashcards
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Ready for revision</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1 hover:border-teal-500/30 transition-colors">
                  <div className="flex items-center justify-between text-slate-200 font-bold">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-teal-400" />
                      Executive Brief
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">1-page summary generated</p>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
