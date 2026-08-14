"use client";

import { motion } from "framer-motion";
import { Upload, MessageSquare, CheckSquare, ArrowRight } from "lucide-react";

export function HowItWorksSimple() {
  const steps = [
    {
      num: "01",
      title: "Bring it in",
      desc: "Upload a file, paste a link, or add a note.",
      icon: Upload,
      color: "text-[#3157D5] dark:text-[#4F8CFF]"
    },
    {
      num: "02",
      title: "Ask naturally",
      desc: "Ask questions without learning how to prompt.",
      icon: MessageSquare,
      color: "text-[#0D9488] dark:text-[#38D9C5]"
    },
    {
      num: "03",
      title: "Get things done",
      desc: "Turn information into summaries, plans, quizzes or tasks.",
      icon: CheckSquare,
      color: "text-[#E56B4E]"
    }
  ];

  return (
    <section id="how-it-works" className="py-28 border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#080B12] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-3">
          <span className="small-label text-slate-600 dark:text-slate-400">
            HOW IT WORKS
          </span>
          <h2 className="section-headline text-slate-900 dark:text-white font-heading">
            Simple by <span className="text-[#3157D5] dark:text-[#4F8CFF]">design.</span>
          </h2>
          <p className="body-lead text-slate-700 dark:text-slate-200 font-normal">
            Bring something in. Ask what matters. Get something useful.
          </p>
        </div>

        {/* 3 Steps Horizontal Grid with Oversized Step Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Connecting Line Backdrop */}
          <div className="hidden md:block absolute top-1/2 left-12 right-12 h-0.5 bg-gradient-to-r from-blue-500/30 via-teal-500/30 to-orange-500/30 -z-0 -translate-y-6" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="premium-card rounded-3xl p-8 flex flex-col justify-between group relative overflow-hidden z-10"
              >
                {/* Oversized Step Number */}
                <div className="absolute -top-6 -right-2 text-7xl font-black text-slate-900/5 dark:text-white/5 font-heading pointer-events-none select-none">
                  {step.num}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-black text-slate-600 dark:text-slate-400 font-heading">
                      STEP {step.num}
                    </span>
                    <div className={`p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 ${step.color} shadow-xs`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="card-title font-bold text-slate-900 dark:text-white font-heading mb-3">
                    {step.title}
                  </h3>

                  <p className="text-base text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/80 mt-8 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span>Phase {idx + 1}</span>
                  {idx < 2 && <ArrowRight className="w-4 h-4 text-[#3157D5] dark:text-[#4F8CFF] group-hover:translate-x-1.5 transition-transform" />}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Sequential Flow Banner */}
        <div className="mt-16 p-4 rounded-2xl bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center gap-4 text-xs font-bold text-slate-700 dark:text-slate-200">
          <span className="text-slate-600 dark:text-slate-400">BRING IT IN</span>
          <ArrowRight className="w-4 h-4 text-[#3157D5] dark:text-[#4F8CFF]" />
          <span className="text-slate-600 dark:text-slate-400">ASK NATURALLY</span>
          <ArrowRight className="w-4 h-4 text-[#3157D5] dark:text-[#4F8CFF]" />
          <span className="text-slate-900 dark:text-white font-black">GET THINGS DONE</span>
        </div>

      </div>
    </section>
  );
}
