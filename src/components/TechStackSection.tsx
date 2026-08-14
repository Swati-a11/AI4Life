"use client";

import { Code2, Database, Cpu, Sparkles, Layers, Lock } from "lucide-react";

export function TechStackSection() {
  const tools = [
    { name: "Next.js", icon: Code2 },
    { name: "TypeScript", icon: Code2 },
    { name: "MongoDB", icon: Database },
    { name: "Qdrant", icon: Database },
    { name: "Mem0", icon: Cpu },
    { name: "Gemini", icon: Sparkles },
    { name: "Tavily", icon: Layers },
    { name: "Razorpay", icon: Lock },
  ];

  return (
    <section className="py-16 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-950/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Built with tools we trust.
        </h3>

        <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-3xl mx-auto">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.name}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs"
              >
                <Icon className="w-3.5 h-3.5 text-cyan-500" />
                <span>{tool.name}</span>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
