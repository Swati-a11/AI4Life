"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { ProfessionalMemory } from "@/lib/types/professional-types";

export function AIMemoryView() {
  const [memories, setMemories] = useState<ProfessionalMemory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPreference, setNewPreference] = useState("");
  const [newCategory, setNewCategory] = useState("Executive Style");
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchMemories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/professional/memory");
      const data = await res.json();
      if (data.success) {
        setMemories(data.memories || []);
      }
    } catch (err) {
      console.error("Fetch memory error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPreference.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/professional/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: newCategory,
          preference: newPreference,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMemories((prev) => [data.memory, ...prev]);
        setNewPreference("");
        setToastMessage("AI4Life remembered your preference.");
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err) {
      console.error("Add memory error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
    try {
      await fetch(`/api/professional/memory/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Delete memory error:", err);
    }
  };

  const examplePreferences = [
    "I prefer concise executive summaries.",
    "Keep client emails professional but friendly.",
    "Our team uses Jira for task tracking.",
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header Bar */}
      <div className="p-6 rounded-3xl bg-[#EFEAE6]/90 dark:bg-[#111722] border border-[#D5CBC2] dark:border-slate-800 space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
              Mem0 Professional AI Memory
            </h2>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              Mem0 Architecture
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Persist your professional working style, executive preferences, and workflow guidelines.
          </p>
        </div>

        {/* Add Memory Form */}
        <form onSubmit={handleAddMemory} className="flex flex-col sm:flex-row gap-3">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="px-3 py-2.5 rounded-2xl bg-white dark:bg-[#151C2B] border border-[#D5CBC2] dark:border-slate-800 text-xs text-slate-900 dark:text-white font-bold focus:outline-none"
          >
            <option value="Executive Style">Executive Style</option>
            <option value="Communication Tone">Communication Tone</option>
            <option value="Workflow Tooling">Workflow Tooling</option>
            <option value="Reporting Format">Reporting Format</option>
          </select>

          <input
            type="text"
            value={newPreference}
            onChange={(e) => setNewPreference(e.target.value)}
            placeholder="e.g. I prefer concise executive summaries..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#151C2B] border border-[#D5CBC2] dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          <button
            type="submit"
            disabled={!newPreference.trim() || isSaving}
            className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-40 shrink-0"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Remember Preference</span>
          </button>
        </form>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs font-extrabold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-teal-500" />
          <span>{toastMessage}</span>
        </motion.div>
      )}

      {/* Suggested Quick Examples */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold text-slate-500 shrink-0">Quick Add:</span>
        {examplePreferences.map((pref, i) => (
          <button
            key={i}
            onClick={() => setNewPreference(pref)}
            className="px-3 py-1 rounded-full bg-[#DFD7D0]/60 dark:bg-[#161D2A] border border-[#D5CBC2] dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold hover:bg-teal-500/20 transition-colors shrink-0 cursor-pointer"
            type="button"
          >
            "{pref}"
          </button>
        ))}
      </div>

      {/* Stored Memories List */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-900 dark:text-white font-heading uppercase tracking-wide">
          STORED MEMORIES ({memories.length})
        </h3>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Loading AI memories...
          </div>
        ) : memories.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs rounded-3xl border border-dashed border-[#D5CBC2] dark:border-slate-800">
            No memories saved yet. Add a preference above to customize AI Copilot responses.
          </div>
        ) : (
          <div className="space-y-3">
            {memories.map((mem) => (
              <motion.div
                key={mem.id}
                whileHover={{ scale: 1.005 }}
                className="p-4 rounded-2xl bg-[#EFEAE6]/90 dark:bg-[#111722] border border-[#D5CBC2] dark:border-slate-800 flex items-center justify-between gap-4 shadow-xs"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 shrink-0">
                    <Brain className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-400">
                        {mem.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {mem.updatedAt}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1">
                      "{mem.preference}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10">
                    AI Active
                  </span>
                  <button
                    onClick={() => handleDeleteMemory(mem.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    type="button"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
