"use client";

import { motion } from "framer-motion";
import { GraduationCap, HeartHandshake, Briefcase, Store, ArrowRight } from "lucide-react";

export function UseCasesSection() {
  const cards = [
    {
      badge: "STUDENT",
      desc: "Turn lecture notes into something you can actually study.",
      flow: ["Notes", "Quiz", "Flashcards"],
      icon: GraduationCap,
      color: "text-indigo-600 dark:text-indigo-400",
      border: "border-indigo-500/20"
    },
    {
      badge: "PARENT",
      desc: "Turn school circulars into a simple checklist.",
      flow: ["PDF", "Dates", "Tasks"],
      icon: HeartHandshake,
      color: "text-cyan-600 dark:text-cyan-400",
      border: "border-cyan-500/20"
    },
    {
      badge: "PROFESSIONAL",
      desc: "Turn meeting notes into clear next steps.",
      flow: ["Transcript", "Summary", "Action items"],
      icon: Briefcase,
      color: "text-sky-600 dark:text-sky-400",
      border: "border-sky-500/20"
    },
    {
      badge: "SMALL BUSINESS",
      desc: "Turn documents into decisions.",
      flow: ["Invoice / report", "Insights", "Actions"],
      icon: Store,
      color: "text-amber-600 dark:text-amber-400",
      border: "border-amber-500/20"
    }
  ];

  return (
    <section id="use-cases" className="py-20 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            REAL LIFE USE CASES
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
            Useful wherever life gets <span className="gradient-text-cyan">complicated.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Short, focused workflows for every domain of your daily life.
          </p>
        </div>

        {/* 4 Compact Story Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.badge}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                className={`glass-card rounded-2xl p-6 border ${card.border} flex flex-col justify-between group transition-all`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                      {card.badge}
                    </span>
                    <div className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-900 ${card.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading leading-snug mb-4">
                    "{card.desc}"
                  </h3>
                </div>

                {/* Animated Flow Chips on Hover */}
                <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <span>{card.flow[0]}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-cyan-500" />
                    <span>{card.flow[1]}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-cyan-500" />
                    <span className="text-slate-900 dark:text-white font-bold">{card.flow[2]}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
