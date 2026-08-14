"use client";

import { useState } from "react";
import { Bookmark, Search, Trash2, ExternalLink, Sparkles } from "lucide-react";
import { SavedItem } from "@/lib/types/student-types";

export function SavedView() {
  const [search, setSearch] = useState("");

  const [savedItems, setSavedItems] = useState<SavedItem[]>([
    {
      id: "save_1",
      title: "Binary Search O(log N) Time Complexity Intuition",
      type: "Explanation",
      snippet: "Binary search eliminates half the remaining elements at each step. Pointers left and right define the active space...",
      source: "AI Tutor (Explain Mode)",
      date: "2026-08-12"
    },
    {
      id: "save_2",
      title: "GATE Question on Worst-Case Merge Sort Comparisons",
      type: "Quiz Question",
      snippet: "Merge sort guarantees O(N log N) worst-case time complexity because it consistently divides array halves...",
      source: "AI Quiz Lab",
      date: "2026-08-11"
    },
    {
      id: "save_3",
      title: "Fault-Tolerant Quantum Error Correction 2026",
      type: "Research Note",
      snippet: "Researchers demonstrate gate fidelity above 99.9% using surface codes in distributed quantum logic...",
      source: "Tavily Web Research",
      date: "2026-08-13"
    }
  ]);

  const handleDelete = (id: string) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const filtered = savedItems.filter((i) =>
    i.title.toLowerCase().includes(search.toLowerCase()) || i.snippet.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
          <Bookmark className="w-3.5 h-3.5" />
          Saved Knowledge Vault
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
          Bookmarked Explanations & Notes
        </h2>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search saved explanations and research notes..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="p-5 rounded-2xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">{item.type}</span>
                <span className="text-slate-400">{item.date}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 font-mono leading-relaxed">{item.snippet}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">{item.source}</span>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10"
                type="button"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
