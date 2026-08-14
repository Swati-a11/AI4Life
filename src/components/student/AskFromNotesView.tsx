"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  Sparkles,
  ExternalLink,
  Layers,
  Database,
  CheckCircle2,
  X,
  Send,
  Upload
} from "lucide-react";
import { QdrantRAGService } from "@/lib/services/rag-service";

interface AskFromNotesViewProps {
  onDeductCredits: (cost: number) => boolean;
}

export function AskFromNotesView({ onDeductCredits }: AskFromNotesViewProps) {
  const [query, setQuery] = useState("");
  const [selectedDoc, setSelectedDoc] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [activeChunk, setActiveChunk] = useState<{ title: string; chunkText: string; page?: number } | null>(null);

  const [ragResult, setRagResult] = useState<{
    answerText: string;
    citations: { title: string; chunkText: string; page?: number }[];
  } | null>({
    answerText: "Based on your uploaded document Data_Structures_Chapter3.pdf, binary search requires the input array to be pre-sorted. Pointers `left` and `right` calculate `mid = left + (right - left) / 2` to prevent overflow.",
    citations: [
      {
        title: "Source: Data_Structures_Chapter3.pdf",
        chunkText: "...Section 3.2: Logarithmic binary search operates by taking the midpoint mid = left + (right - left) / 2 and comparing against the target key...",
        page: 14
      },
      {
        title: "Source: Algorithms_Lecture_Notes.docx",
        chunkText: "...Complexity bounds: Worst-case number of operations required for array size N is floor(log2 N) + 1...",
        page: 5
      }
    ]
  });

  const handleRagSearch = async () => {
    if (!query.trim()) return;
    const hasCredits = onDeductCredits(10);
    if (!hasCredits) return;

    setIsSearching(true);
    setTimeout(async () => {
      const res = await QdrantRAGService.queryVectorStore(query);
      setRagResult(res);
      setIsSearching(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-[#0D9488] dark:text-[#38D9C5] text-xs font-bold border border-teal-500/20">
          <Database className="w-3.5 h-3.5" />
          Qdrant RAG Notes Search
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
          Ask From Your Uploaded Notes
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Query your PDFs & DOCX files directly. AI groundings prioritize your exact study material.
        </p>
      </div>

      {/* Query Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={selectedDoc}
            onChange={(e) => setSelectedDoc(e.target.value)}
            className="w-full sm:w-64 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Uploaded Notes (4 Docs)</option>
            <option value="ds">Data_Structures_Chapter3.pdf</option>
            <option value="algo">Algorithms_Lecture_Notes.docx</option>
            <option value="os">OS_Lecture_5.pdf</option>
          </select>

          <div className="flex-1 w-full flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question from your study material..."
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
            />
            <button
              onClick={handleRagSearch}
              disabled={!query.trim() || isSearching}
              className="px-6 py-3 rounded-2xl bg-[#0D9488] dark:bg-[#38D9C5] text-white dark:text-slate-950 font-bold text-xs hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              type="button"
            >
              <Search className="w-4 h-4" />
              <span>{isSearching ? "Searching..." : "Search Notes"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* RAG Answer & Source Citations Display */}
      {ragResult && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Answer Box */}
          <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-[#0D9488] dark:text-[#38D9C5] uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Grounded AI Answer
              </span>
              <span className="text-[11px] text-slate-400">Indexed in Qdrant</span>
            </div>

            <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {ragResult.answerText}
            </div>
          </div>

          {/* Citations Sidebar */}
          <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-500" />
              Document Citations ({ragResult.citations.length})
            </h3>

            <div className="space-y-3">
              {ragResult.citations.map((cite, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveChunk(cite)}
                  className="w-full text-left p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 hover:border-teal-500 transition-colors group"
                  type="button"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                    <span className="truncate">{cite.title}</span>
                    {cite.page && <span className="text-[10px] text-teal-600 dark:text-teal-400">P. {cite.page}</span>}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 italic font-mono">
                    "{cite.chunkText}"
                  </p>
                  <div className="text-[10px] font-bold text-teal-600 dark:text-teal-400 group-hover:underline flex items-center gap-1">
                    <span>Inspect chunk context</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chunk Inspector Modal */}
      <AnimatePresence>
        {activeChunk && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl relative"
            >
              <button
                onClick={() => setActiveChunk(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Vector Chunk Context</span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{activeChunk.title}</h4>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed border border-slate-800">
                {activeChunk.chunkText}
              </div>

              <div className="text-[11px] text-slate-500">
                Vector Embedding Similarity Score: <span className="font-bold text-emerald-500">0.942</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
