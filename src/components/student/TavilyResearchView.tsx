"use client";

import { useState } from "react";
import { Search, Globe, ExternalLink, Sparkles } from "lucide-react";
import { TavilySearchResult } from "@/lib/types/student-types";
import { TavilySearchService } from "@/lib/services/tavily-service";

interface TavilyResearchViewProps {
  onDeductCredits: (cost: number) => boolean;
}

export function TavilyResearchView({ onDeductCredits }: TavilyResearchViewProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<{
    synthesis: string;
    sources: TavilySearchResult[];
  } | null>({
    synthesis: "### Web Synthesis: Latest Developments in Quantum Computing 2026\n\nRecent breakthroughs highlight fault-tolerant quantum logic gates achieving gate fidelity above 99.9%. Quantum computing labs at MIT and Google have demonstrated real-time error correction across distributed qubits.",
    sources: [
      {
        title: "Quantum Computing Advances 2026 - MIT Tech Review",
        url: "https://technologyreview.com/quantum-2026",
        snippet: "Researchers demonstrate fault-tolerant quantum error correction logic with 99.9% gate fidelity."
      },
      {
        title: "Logarithmic Search Acceleration in Distributed Databases",
        url: "https://arxiv.org/abs/2608.0123",
        snippet: "Hybrid vector-index logarithmic trees reduce query latency by 40% over traditional B-Trees."
      }
    ]
  });

  const handleResearch = async () => {
    if (!query.trim()) return;
    const hasCredits = onDeductCredits(15);
    if (!hasCredits) return;

    setIsSearching(true);
    setTimeout(async () => {
      const res = await TavilySearchService.searchWeb(query);
      setResult(res);
      setIsSearching(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-500/20">
          <Globe className="w-3.5 h-3.5" />
          Tavily Live Web Research
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
          AI Web Research & Citation Engine
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Search the web in real-time. Synthesize current research papers and technical breakthroughs.
        </p>
      </div>

      <div className="p-4 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Research any topic (e.g. latest developments in quantum computing)..."
          className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
        />
        <button
          onClick={handleResearch}
          disabled={!query.trim() || isSearching}
          className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          type="button"
        >
          <Search className="w-4 h-4" />
          <span>{isSearching ? "Synthesizing Web..." : "Research Web"}</span>
        </button>
      </div>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Web Synthesis
            </h3>
            <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {result.synthesis}
            </div>
          </div>

          <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-500" />
              Web Sources ({result.sources.length})
            </h3>
            <div className="space-y-3">
              {result.sources.map((s, idx) => (
                <a
                  key={idx}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 hover:border-indigo-500 transition-colors"
                >
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    <span className="truncate">{s.title}</span>
                    <ExternalLink className="w-3 h-3 text-indigo-500 shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{s.snippet}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
