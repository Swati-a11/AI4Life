"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Brain,
  Info,
} from "lucide-react";
import { ProfessionalInsight } from "@/lib/types/professional-types";

export function InsightsView() {
  const [insights, setInsights] = useState<ProfessionalInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/professional/insights");
      const data = await res.json();
      if (data.success) {
        setInsights(data.insights || []);
      }
    } catch (err) {
      console.error("Fetch insights error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header Bar */}
      <div className="p-6 rounded-3xl bg-[#EFEAE6]/90 dark:bg-[#111722] border border-[#D5CBC2] dark:border-slate-800">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
            AI Workspace Insights
          </h2>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            Real Workspace Intelligence
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Automated cross-analysis of your tasks, documents, meetings, and preferences.
        </p>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-slate-500 text-xs">
          Analyzing workspace data...
        </div>
      ) : insights.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-sm rounded-3xl bg-[#EFEAE6]/60 dark:bg-[#111722]/60 border border-dashed border-[#D5CBC2] dark:border-slate-800 space-y-2">
          <Info className="w-8 h-8 text-teal-500 mx-auto" />
          <p className="font-bold text-slate-800 dark:text-slate-200">
            Not enough activity to generate insights yet.
          </p>
          <p className="text-xs">
            Upload documents, process meeting transcripts, or create tasks to see AI insights.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => (
            <motion.div
              key={insight.id}
              whileHover={{ y: -2 }}
              className="p-6 rounded-3xl bg-[#EFEAE6]/90 dark:bg-[#111722] border border-[#D5CBC2] dark:border-slate-800 space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    insight.category === "PRIORITY"
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      : insight.category === "PATTERN"
                      ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                      : "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
                  }`}
                >
                  {insight.category}
                </span>
                <span className="text-[11px] font-extrabold text-slate-400">
                  {insight.impact}
                </span>
              </div>

              <h4 className="text-base font-black text-slate-900 dark:text-white font-heading">
                {insight.title}
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {insight.description}
              </p>
            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
}
