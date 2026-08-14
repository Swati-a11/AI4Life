"use client";

import { motion } from "framer-motion";
import { Upload, MessageSquare, BrainCircuit, CheckSquare, ArrowRight } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "Bring it in",
      desc: "Upload a file, paste a link, or drop in a note.",
      icon: Upload,
      color: "text-cyan-600 dark:text-cyan-400"
    },
    {
      num: "02",
      title: "Ask anything",
      desc: "Ask questions in plain language.",
      icon: MessageSquare,
      color: "text-sky-600 dark:text-sky-400"
    },
    {
      num: "03",
      title: "AI4Life remembers",
      desc: "It keeps the context that actually matters to you.",
      icon: BrainCircuit,
      color: "text-teal-600 dark:text-teal-400"
    },
    {
      num: "04",
      title: "Get something done",
      desc: "Turn answers into plans, quizzes, checklists, summaries and tasks.",
      icon: CheckSquare,
      color: "text-amber-600 dark:text-amber-400"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            HOW IT WORKS
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
            Give AI4Life the <span className="gradient-text-cyan">messy stuff.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Four simple steps from raw information to completed deliverables.
          </p>
        </div>

        {/* 4 Horizontal Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 relative flex flex-col justify-between group hover:border-cyan-400/50 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-slate-400 dark:text-slate-600 font-heading">
                      {step.num}
                    </span>
                    <div className={`p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 ${step.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/80 mt-6 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>Step {idx + 1} of 4</span>
                  {idx < 3 && <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Flow Visual Banner */}
        <div className="mt-12 p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-4 text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="text-slate-500">CONTENT</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-500" />
          <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">AI4Life</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-500" />
          <span className="text-slate-900 dark:text-white">USEFUL RESULT</span>
        </div>

      </div>
    </section>
  );
}
