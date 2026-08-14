"use client";

import { motion } from "framer-motion";
import { FileText, Video, Image as ImageIcon, Headphones, Globe, FileCode, ArrowDown } from "lucide-react";

export function ProblemSection() {
  const scatteredItems = [
    { name: "PDF in your Drive", icon: FileText, color: "text-rose-500 dark:text-rose-400", border: "border-rose-500/20", pos: "top-2 left-2 sm:left-8" },
    { name: "Useful YouTube Video", icon: Video, color: "text-red-500 dark:text-red-400", border: "border-red-500/20", pos: "top-4 right-2 sm:right-8" },
    { name: "Screenshot in your Phone", icon: ImageIcon, color: "text-teal-500 dark:text-teal-400", border: "border-teal-500/20", pos: "top-28 left-6 sm:left-20" },
    { name: "Voice Note you forgot about", icon: Headphones, color: "text-amber-500 dark:text-amber-400", border: "border-amber-500/20", pos: "top-32 right-6 sm:right-20" },
    { name: "Bookmarked Web Page", icon: Globe, color: "text-sky-500 dark:text-sky-400", border: "border-sky-500/20", pos: "bottom-12 left-8 sm:left-24" },
    { name: "Unorganized Notepad Draft", icon: FileCode, color: "text-indigo-500 dark:text-indigo-400", border: "border-indigo-500/20", pos: "bottom-10 right-8 sm:right-24" },
  ];

  return (
    <section id="problem" className="py-20 relative overflow-hidden border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-950/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto mb-12 space-y-3"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            THE REAL FRICTION
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
            Everything you need is already somewhere.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto font-normal">
            A PDF in your Drive. A useful YouTube video. A screenshot in your phone. A voice note you forgot about.
          </p>
        </motion.div>

        {/* Scattered Cards Container converging to AI4Life */}
        <div className="relative min-h-[340px] sm:min-h-[380px] max-w-3xl mx-auto flex items-center justify-center rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 p-6 shadow-xl">
          
          {/* Subtle Converging Web Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-80 h-80 rounded-full border border-cyan-500/40 animate-ping" />
          </div>

          {/* Scattered Items */}
          {scatteredItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                animate={{
                  y: [0, index % 2 === 0 ? -8 : 8, 0],
                }}
                transition={{
                  duration: 3.5 + index * 0.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.1,
                }}
                className={`absolute ${item.pos} z-10 p-3 rounded-2xl glass-card border ${item.border} flex items-center gap-2.5 shadow-md`}
              >
                <div className={`p-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-900 ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {item.name}
                </span>
              </motion.div>
            );
          })}

          {/* Central AI4Life Statement */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative z-20 p-6 sm:p-8 rounded-3xl bg-slate-900 dark:bg-slate-950 border border-slate-700/80 shadow-2xl text-center max-w-sm"
          >
            <div className="flex justify-center mb-2 text-cyan-400">
              <ArrowDown className="w-5 h-5 animate-bounce" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-heading leading-snug">
              The problem isn't finding information. <br />
              <span className="text-cyan-400">It's doing something with it.</span>
            </h3>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
