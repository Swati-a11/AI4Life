"use client";

import { useState, useEffect } from "react";
import { Brain, Sparkles, Plus, CheckCircle2 } from "lucide-react";
import { Mem0Preference } from "@/lib/types/student-types";
import { Mem0Service } from "@/lib/services/mem0-service";

export function Mem0MemoryView() {
  const [preferences, setPreferences] = useState<Mem0Preference[]>([]);
  const [newCat, setNewCat] = useState("");
  const [newPref, setNewPref] = useState("");

  const [indicatorMsg, setIndicatorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/memory")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.preferences) {
          setPreferences(data.preferences);
        }
      })
      .catch(console.error);
  }, []);

  const handleAdd = async () => {
    if (!newCat.trim() || !newPref.trim()) return;

    try {
      const res = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newCat, preference: newPref })
      });

      const data = await res.json();
      if (data.success && data.preference) {
        setPreferences((prev) => [data.preference, ...prev]);
        setIndicatorMsg(data.indicatorText || "AI4Life remembered your preference.");
        setNewCat("");
        setNewPref("");
        setTimeout(() => setIndicatorMsg(null), 4000);
      }
    } catch (err) {
      console.error("Mem0 API Error:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-500/20">
          <Brain className="w-3.5 h-3.5" />
          Mem0 Personal AI Memory Vault
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
          Personalized Learning Memory
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          AI4Life continuously adapts explanation styles, target exam goals, and weak topic focus using Mem0 memory.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {preferences.map((pref) => (
          <div key={pref.id} className="p-5 rounded-2xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-purple-600 dark:text-purple-400 uppercase">{pref.category}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                {Math.round(pref.confidence * 100)}% Confidence
              </span>
            </div>
            <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
              "{pref.preference}"
            </p>
            <div className="text-[10px] text-slate-400">Last synced: {pref.updatedAt}</div>
          </div>
        ))}
      </div>

      {/* Add Custom Preference */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Custom AI Learning Preference</h3>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="Category (e.g. Preferred Language)"
            className="w-full sm:w-64 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
          />
          <input
            type="text"
            value={newPref}
            onChange={(e) => setNewPref(e.target.value)}
            placeholder="Preference details (e.g. Always write code in C++)"
            className="flex-1 w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
          />
          <button
            onClick={handleAdd}
            className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 flex items-center gap-1"
            type="button"
          >
            <Plus className="w-4 h-4" />
            <span>Save Memory</span>
          </button>
        </div>
      </div>
    </div>
  );
}
