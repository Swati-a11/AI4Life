"use client";

import { useState, useEffect } from "react";
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
  Upload,
  Eye,
  HelpCircle,
  Video
} from "lucide-react";
import { StudyMaterial } from "@/lib/types/student-types";
import { getOrCreateLocalUserId } from "@/lib/utils/user-id-utils";
import { loadMaterialsFromCache, getMaterialFromCache } from "@/lib/utils/materials-cache";

interface AskFromNotesViewProps {
  onDeductCredits: (cost: number) => boolean;
}

export function AskFromNotesView({ onDeductCredits }: AskFromNotesViewProps) {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);

  // Active Selected Material State
  const [selectedMaterial, setSelectedMaterial] = useState<{
    id: string;
    title: string;
    sourceType: string;
    sizeMb: number;
    extractedText: string;
    chunks?: any[];
  } | null>(null);

  const [materialQuestion, setMaterialQuestion] = useState("");
  const [isAskingMaterial, setIsAskingMaterial] = useState(false);

  const [ragResult, setRagResult] = useState<{
    answerText: string;
    isGrounded: boolean;
    citations: { title: string; chunkText: string; page?: number }[];
  } | null>(null);

  useEffect(() => {
    setIsLoadingMaterials(true);
    try {
      const userId = getOrCreateLocalUserId();
      const cached = loadMaterialsFromCache(userId);
      const mapped: StudyMaterial[] = cached.map((m) => ({
        id: m.id,
        title: m.title,
        subject: m.sourceType === "youtube" ? "Operating Systems" : "Computer Science",
        fileType: (m.sourceType || "pdf") as StudyMaterial["fileType"],
        sizeMb: m.sizeMb || 1.2,
        uploadedAt: m.uploadedAt || "Recently",
        status: m.status === "ready" ? "Ready" : "Processing",
        chunksCount: m.chunksCount || 0,
        qdrantCollectionRef: `qdrant_${m.id}`
      }));
      setMaterials(mapped);
      // Auto-select first material if available
      if (mapped.length > 0) {
        handleSelectMaterial(mapped[0].id);
      }
    } catch (err) {
      console.error("AskFromNotes cache load error:", err);
    } finally {
      setIsLoadingMaterials(false);
    }
  }, []);

  const handleSelectMaterial = async (id: string) => {
    try {
      // Try localStorage cache first
      const cached = getMaterialFromCache(id);
      if (cached) {
        setSelectedMaterial({
          id: cached.id,
          title: cached.title,
          sourceType: cached.sourceType,
          sizeMb: cached.sizeMb,
          extractedText: cached.extractedText || cached.content || "No extractable content found."
        });
        setRagResult(null);
        return;
      }

      // Fallback: fetch from server if not in cache
      const userId = getOrCreateLocalUserId();
      const res = await fetch(`/api/materials/${id}`, {
        headers: { "x-user-id": userId }
      });
      const data = await res.json();
      if (data.success && data.material) {
        setSelectedMaterial(data.material);
        setRagResult(null);
      } else {
        alert("Couldn't extract readable content from this source.");
      }
    } catch (err) {
      console.error("Select material error:", err);
      alert("Couldn't retrieve material content.");
    }
  };

  const handleAskMaterialQuestion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!materialQuestion.trim() || !selectedMaterial) return;

    const hasCredits = onDeductCredits(10);
    if (!hasCredits) return;

    setIsAskingMaterial(true);
    try {
      const userId = getOrCreateLocalUserId();
      const res = await fetch(`/api/materials/${selectedMaterial.id}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId
        },
        body: JSON.stringify({
          query: materialQuestion
        })
      });

      const data = await res.json();
      if (data.success) {
        setRagResult({
          answerText: data.responseText || "No response generated.",
          isGrounded: Boolean(data.isGrounded),
          citations: data.citations || []
        });
      } else {
        setRagResult({
          answerText: "I couldn't find that information in this material.\n\nYou can ask me something else about this material.",
          isGrounded: false,
          citations: []
        });
      }
    } catch (err) {
      console.error("Ask material error:", err);
      setRagResult({
        answerText: "Couldn't query material at this time. Please try again.",
        isGrounded: false,
        citations: []
      });
    } finally {
      setIsAskingMaterial(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-[#0D9488] dark:text-[#38D9C5] text-xs font-bold border border-teal-500/20">
          <Database className="w-3.5 h-3.5" />
          Ask From Materials
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
          Ask From Your Uploaded Materials
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Query your PDFs, DOCX, TXT, YouTube transcripts, and study materials directly. AI answers prioritize your selected material.
        </p>
      </div>

      {/* Empty State when 0 uploads */}
      {materials.length === 0 && !isLoadingMaterials ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <FileText className="w-8 h-8 text-teal-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">You haven't added any material yet.</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload your study material in My Materials to start asking questions grounded in your content.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Materials Selector List (Col 4) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider px-1">
              Select Source Material ({materials.length})
            </h3>
            
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {materials.map((m) => {
                const isSelected = selectedMaterial?.id === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMaterial(m.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-teal-500/10 border-teal-500 text-slate-900 dark:text-white shadow-xs"
                        : "bg-white dark:bg-[#111722] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                    type="button"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2.5 rounded-xl shrink-0 ${isSelected ? "bg-teal-500 text-white" : "bg-slate-100 dark:bg-slate-900 text-slate-500"}`}>
                        {m.fileType === "youtube" ? <Video className="w-4 h-4 text-red-500" /> : <FileText className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold truncate text-slate-900 dark:text-white">{m.title}</h4>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">{m.fileType} • {m.sizeMb} MB</span>
                      </div>
                    </div>

                    {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Material Reader & Dedicated Question Input Form (Col 8) */}
          <div className="lg:col-span-8 space-y-6">
            {selectedMaterial ? (
              <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-5">
                
                {/* Header Metadata */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                      {selectedMaterial.sourceType.toUpperCase()} SOURCE CONTENT
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{selectedMaterial.title}</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-500">{selectedMaterial.sizeMb} MB</span>
                </div>

                {/* Readable Extracted Content View */}
                <div className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed max-h-60 overflow-y-auto border border-slate-800 space-y-2">
                  <div className="text-[11px] text-slate-500 pb-2 border-b border-slate-800 font-sans">
                    Extracted Text / Transcript Content
                  </div>
                  <div className="whitespace-pre-wrap">{selectedMaterial.extractedText}</div>
                </div>

                {/* Dedicated Question Input Area */}
                <form onSubmit={handleAskMaterialQuestion} className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-teal-500" />
                    <span>Ask AI about this material</span>
                  </label>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={materialQuestion}
                      onChange={(e) => setMaterialQuestion(e.target.value)}
                      placeholder={`Type your question about ${selectedMaterial.title}...`}
                      className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
                    />
                    <button
                      type="submit"
                      disabled={!materialQuestion.trim() || isAskingMaterial}
                      className="px-6 py-3 rounded-2xl bg-[#0D9488] dark:bg-[#38D9C5] text-white dark:text-slate-950 font-bold text-xs hover:opacity-90 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isAskingMaterial ? "Asking AI..." : "Ask AI"}</span>
                    </button>
                  </div>
                </form>

                {/* RAG Source-Grounded Answer Result */}
                {ragResult && (
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        Source-Grounded Response
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${ragResult.isGrounded ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"}`}>
                          {ragResult.isGrounded ? "Grounded in selected source" : "Not found in material"}
                        </span>
                        <button
                          onClick={async () => {
                            if (!ragResult || !selectedMaterial) return;
                            try {
                              const userId = getOrCreateLocalUserId();
                              const res = await fetch("/api/notes", {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  "x-user-id": userId
                                },
                                body: JSON.stringify({
                                  title: materialQuestion.substring(0, 40) || selectedMaterial.title,
                                  content: ragResult.answerText,
                                  sourceType: "material",
                                  sourceName: selectedMaterial.title,
                                  materialId: selectedMaterial.id
                                })
                              });
                              const data = await res.json();
                              if (data.success) alert("Note saved.");
                            } catch (err) {
                              console.error("Save note error:", err);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30 text-[11px] font-bold hover:bg-teal-500/20 cursor-pointer flex items-center gap-1"
                          type="button"
                        >
                          <span>Save Note</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                      {ragResult.answerText}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="p-12 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 text-center text-slate-500 text-xs">
                Select a material from the left to view its extracted content and ask questions.
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
