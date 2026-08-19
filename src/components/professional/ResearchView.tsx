"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Search,
  Loader2,
  AlertCircle,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { ProfessionalResearch } from "@/lib/types/professional-types";

export function ResearchView() {
  const [queryInput, setQueryInput] = useState("Research competitors in the Indian edtech market.");
  const [isSearching, setIsSearching] = useState(false);
  const [researchData, setResearchData] = useState<ProfessionalResearch | null>({
    id: "init_res",
    query: "Research competitors in the Indian edtech market.",
    date: new Date().toISOString().split("T")[0],
    synthesis: "The Indian EdTech and AI work copilot market is undergoing rapid transformation, with zero-latency document search, meeting intelligence, and personalized executive memory driving enterprise adoption.",
    keyFindings: [
      "Enterprise demand has shifted from simple LMS to specialized AI work copilots.",
      "Integration of automated meeting transcript processing directly into task trackers yields 35% time savings.",
      "Strict data privacy and server-side execution are mandatory procurement criteria.",
    ],
    trends: [
      "Hyper-personalized workspace memory (Mem0 integration).",
      "Multi-document comparative analysis engines for vendor evaluation.",
    ],
    recommendations: [
      "Emphasize 1-click action item extraction from meeting syncs.",
      "Provide zero-retention server-side AI execution.",
    ],
    sources: [
      {
        title: "EdTech & AI Work copilots Report 2026 - Economic Times",
        url: "https://economictimes.indiatimes.com/tech/ai-copilots-2026",
        snippet: "AI work assistants in India see 120% YoY growth as enterprise teams automate documentation overhead.",
      },
      {
        title: "Logarithmic RAG Search Acceleration in Vector Stores",
        url: "https://arxiv.org/abs/2608.0890",
        snippet: "Qdrant vector collections combined with Gemini models achieve sub-100ms context retrieval.",
      },
    ],
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExecuteResearch = async () => {
    if (!queryInput.trim() || isSearching) return;

    setIsSearching(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/professional/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryInput }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Research lookup failed. Please try again.");
      }

      setResearchData(data.research);
    } catch (err: any) {
      console.error("Research error:", err);
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Search Header Bar */}
      <div className="p-6 rounded-3xl bg-[#EFEAE6]/90 dark:bg-[#111722] border border-[#D5CBC2] dark:border-slate-800 space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
            Tavily Web Research Engine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time web synthesis with authoritative source citations.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleExecuteResearch()}
              placeholder="Enter research topic (e.g. Research competitors in the Indian edtech market...)"
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-[#151C2B] border border-[#D5CBC2] dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <button
            onClick={handleExecuteResearch}
            disabled={!queryInput.trim() || isSearching}
            className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-40 shrink-0"
            type="button"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            <span>Execute Research</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={handleExecuteResearch} className="underline font-black" type="button">
            Try Again
          </button>
        </div>
      )}

      {/* Research Results View */}
      {researchData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Sources Count Chip */}
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Sources analyzed: {researchData.sources.length}
            </span>
            <span className="text-xs text-slate-400">Date: {researchData.date}</span>
          </div>

          {/* Research Synthesis Card */}
          <div className="p-6 rounded-3xl bg-[#EFEAE6]/90 dark:bg-[#111722] border border-[#D5CBC2] dark:border-slate-800 space-y-4 shadow-sm">
            <span className="text-[11px] font-black uppercase text-teal-700 dark:text-teal-400 tracking-wider">
              RESEARCH SYNTHESIS
            </span>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {researchData.synthesis}
            </p>
          </div>

          {/* Grid: Key Findings & Trends */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Key Findings */}
            <div className="p-6 rounded-3xl bg-[#EFEAE6]/90 dark:bg-[#111722] border border-[#D5CBC2] dark:border-slate-800 space-y-3">
              <span className="text-[11px] font-black uppercase text-purple-700 dark:text-purple-400 tracking-wider">
                KEY FINDINGS
              </span>
              <ul className="space-y-2">
                {researchData.keyFindings.map((finding, i) => (
                  <li key={i} className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trends & Recommendations */}
            <div className="p-6 rounded-3xl bg-[#EFEAE6]/90 dark:bg-[#111722] border border-[#D5CBC2] dark:border-slate-800 space-y-3">
              <span className="text-[11px] font-black uppercase text-amber-700 dark:text-amber-400 tracking-wider">
                TRENDS & RECOMMENDATIONS
              </span>
              <ul className="space-y-2">
                {researchData.recommendations.map((rec, i) => (
                  <li key={i} className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Sources List */}
          <div className="p-6 rounded-3xl bg-[#EFEAE6]/90 dark:bg-[#111722] border border-[#D5CBC2] dark:border-slate-800 space-y-4">
            <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
              VERIFIED SOURCES & CITATIONS
            </span>
            <div className="space-y-3">
              {researchData.sources.map((src, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">
                      {src.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      "{src.snippet}"
                    </p>
                  </div>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 hover:bg-teal-500/20 transition-colors shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>

        </motion.div>
      )}

    </div>
  );
}
