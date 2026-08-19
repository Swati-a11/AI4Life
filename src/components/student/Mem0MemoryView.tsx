"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles, Plus, CheckCircle2, Sliders, BookOpen, Target, Lightbulb, RotateCcw } from "lucide-react";
import { Mem0Preference } from "@/lib/types/student-types";
import { ExplanationStyle, UserLearningMemory } from "@/lib/services/server-store";

export function Mem0MemoryView() {
  const [memory, setMemory] = useState<UserLearningMemory | null>(null);
  const [preferences, setPreferences] = useState<Mem0Preference[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<ExplanationStyle>("Bullet Points");
  const [newCat, setNewCat] = useState("Learning Preference");
  const [newPref, setNewPref] = useState("");
  const [indicatorMsg, setIndicatorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMemory();
  }, []);

  const fetchMemory = () => {
    fetch("/api/memory")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.memory) {
            setMemory(data.memory);
            setSelectedStyle(data.memory.explanationStyle || "Bullet Points");
          }
          if (data.preferences) {
            setPreferences(data.preferences);
          }
        }
      })
      .catch(console.error);
  };

  const handleSelectStyle = async (style: ExplanationStyle) => {
    setSelectedStyle(style);
    try {
      const res = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_style", style })
      });
      const data = await res.json();
      if (data.success) {
        if (data.memory) setMemory(data.memory);
        setIndicatorMsg(data.indicatorText || `AI explanation style set to "${style}".`);
        setTimeout(() => setIndicatorMsg(null), 4000);
      }
    } catch (err) {
      console.error("Failed to update style:", err);
    }
  };

  const handleAddCustom = async () => {
    if (!newPref.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_custom",
          category: newCat.trim() || "Learning Preference",
          preference: newPref.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        if (data.memory) setMemory(data.memory);
        if (data.preference) {
          setPreferences((prev) => [data.preference, ...prev]);
        }
        setIndicatorMsg("AI4Life saved your custom learning preference.");
        setNewPref("");
        setTimeout(() => setIndicatorMsg(null), 4000);
      }
    } catch (err) {
      console.error("Mem0 API Error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const styleOptions: { style: ExplanationStyle; label: string; desc: string }[] = [
    {
      style: "Bullet Points",
      label: "Bullet Points",
      desc: "Structured bullet list format focusing on key takeaways."
    },
    {
      style: "Paragraphs",
      label: "Paragraphs",
      desc: "Comprehensive fluid paragraph text without lists."
    },
    {
      style: "Short & Direct",
      label: "Short & Direct",
      desc: "Concise 1–2 sentence direct answers without extra fluff."
    },
    {
      style: "Step-by-Step",
      label: "Step-by-Step",
      desc: "Numbered sequential steps (Step 1:, Step 2:, etc.)."
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-extrabold border border-purple-500/20">
          <Brain className="w-3.5 h-3.5" />
          Mem0 Personal Learning Memory
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">
          Personalized Learning Memory & Style Selector
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl font-medium">
          Choose how AI tutors explain concepts across the Student Workspace. Your preferences shape response structures for Aarav, Riya, AI Tutor, Ask From Materials, and AI Se Baazi.
        </p>
      </div>

      {indicatorMsg && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span>{indicatorMsg}</span>
        </motion.div>
      )}

      {/* SECTION 1: "How should AI explain things?" Style Selector */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">
              EXPLANATION FORMAT PREFERENCE
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white font-heading">
              How should AI explain things?
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-400">Applies across all AI tutors</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {styleOptions.map((opt) => {
            const isSelected = selectedStyle === opt.style;
            return (
              <button
                key={opt.style}
                onClick={() => handleSelectStyle(opt.style)}
                className={`p-4 rounded-2xl text-left border transition-all cursor-pointer space-y-2 flex flex-col justify-between ${
                  isSelected
                    ? "bg-purple-500/10 border-purple-500 text-purple-700 dark:text-purple-300 font-bold shadow-xs"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-400/50"
                }`}
                type="button"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold">{opt.label}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal font-normal">
                    {opt.desc}
                  </p>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider block ${isSelected ? "text-purple-600 dark:text-purple-400" : "text-slate-400"}`}>
                  {isSelected ? "ACTIVE PREFERENCE" : "SELECT STYLE"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: "What should AI remember?" Memory Summary Card Grid */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <h3 className="text-lg font-black text-slate-900 dark:text-white font-heading">
          What should AI remember?
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Explanation Style Vault Card */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold text-purple-600 dark:text-purple-400">
              <span className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5" /> Style</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">95% Confidence</span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              "Prefers {selectedStyle.toLowerCase()} format explanations"
            </p>
            <button
              onClick={() => handleSelectStyle("Bullet Points")}
              className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline pt-1 block cursor-pointer"
              type="button"
            >
              [ Change Preference ]
            </button>
          </div>

          {/* Frequently Studied Topics Card */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold text-blue-600 dark:text-blue-400">
              <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Frequently Studied</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold">Persisted</span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {memory?.frequentlyStudied ? memory.frequentlyStudied.join(", ") : "JavaScript, Python, DSA"}
            </p>
          </div>

          {/* Focus / Weak Areas Card */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold text-amber-600 dark:text-amber-400">
              <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Focus Areas</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold">Active</span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {memory?.weakTopics ? memory.weakTopics.join(", ") : "React, Databases"}
            </p>
          </div>

          {/* Custom Learning Goals Card */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
              <span className="flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5" /> Learning Goals</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">Adaptive</span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              "Prefers intuitive examples and step-by-step explanations"
            </p>
          </div>

        </div>
      </div>

      {/* SECTION 3: Add Custom AI Learning Preference */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="space-y-1">
          <h3 className="text-base font-black text-slate-900 dark:text-white font-heading">
            Add Custom AI Learning Preference
          </h3>
          <p className="text-xs text-slate-500">
            Tell AI how you learn best (e.g. "Explain difficult concepts using real-life examples").
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="Category (e.g. Learning Preference)"
            className="w-full sm:w-64 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
          />
          <input
            type="text"
            value={newPref}
            onChange={(e) => setNewPref(e.target.value)}
            placeholder="Preference details (e.g. Explain difficult concepts using real-life examples)"
            className="flex-1 w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
          />
          <button
            onClick={handleAddCustom}
            disabled={isSaving || !newPref.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-purple-600 text-white font-black text-xs hover:bg-purple-700 shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            type="button"
          >
            <Plus className="w-4 h-4" />
            <span>Save Memory</span>
          </button>
        </div>
      </div>

      {/* Persisted Custom Preferences Vault History */}
      {preferences.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
            SAVED MEMORY VAULT LOG
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {preferences.map((pref) => (
              <div key={pref.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-purple-600 dark:text-purple-400 uppercase text-[10px]">{pref.category}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                    {Math.round(pref.confidence * 100)}% Confidence
                  </span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  "{pref.preference}"
                </p>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                  Last synced: {pref.updatedAt}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
