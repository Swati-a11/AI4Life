"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trophy,
  ArrowRight,
  HelpCircle,
  FileText,
  Video,
  AlertCircle,
  FileCode,
  Check,
  RotateCcw
} from "lucide-react";
import { QuizItem, QuizQuestion, StudyMaterial } from "@/lib/types/student-types";
import { CreditService } from "@/lib/services/credit-service";
import { getOrCreateLocalUserId } from "@/lib/utils/user-id-utils";
import {
  loadMaterialsFromCache,
  getMaterialFromCache,
  CachedMaterial
} from "@/lib/utils/materials-cache";

interface QuizLabViewProps {
  onDeductCredits?: (cost: number) => boolean;
}

export function QuizLabView({ onDeductCredits }: QuizLabViewProps) {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
  const [materialsError, setMaterialsError] = useState<string | null>(null);

  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  const fetchMaterials = useCallback(async () => {
    setIsLoadingMaterials(true);
    setMaterialsError(null);

    const userId = getOrCreateLocalUserId();

    // 1. Instantly load from local storage cache
    let combinedMaterials: StudyMaterial[] = [];
    try {
      const cached = loadMaterialsFromCache(userId);
      if (cached && cached.length > 0) {
        combinedMaterials = cached.map((m) => ({
          id: m.id || m.materialId,
          title: m.title || m.name || "Untitled Material",
          subject: m.sourceType === "youtube" ? "Operating Systems" : "Computer Science",
          fileType: (m.sourceType || m.type || "pdf") as StudyMaterial["fileType"],
          sizeMb: m.sizeMb || 1.2,
          uploadedAt: m.uploadedAt || "Recently",
          status: m.status === "ready" ? "Ready" : "Processing",
          chunksCount: m.chunksCount || 0,
          qdrantCollectionRef: `qdrant_${m.id}`
        }));
        setMaterials(combinedMaterials);
        if (!selectedMaterialId && combinedMaterials.length > 0) {
          setSelectedMaterialId(combinedMaterials[0].id);
        }
      }
    } catch (e) {
      console.warn("Local cache read error in QuizLabView:", e);
    }

    // 2. Fetch from backend API
    try {
      const res = await fetch("/api/materials", {
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId
        }
      });

      if (!res.ok) {
        if (combinedMaterials.length === 0) {
          setMaterialsError("Unable to load your materials. Please try again.");
        }
        return;
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.materials)) {
        const serverMapped: StudyMaterial[] = data.materials.map((d: any) => ({
          id: d.id || d.materialId,
          title: d.title || d.name || "Untitled Material",
          subject: d.sourceType === "youtube" ? "Operating Systems" : "Computer Science",
          fileType: (d.sourceType || d.type || "pdf") as StudyMaterial["fileType"],
          sizeMb: d.sizeMb || 1.2,
          uploadedAt: d.uploadedAt || d.date || "Recently",
          status: d.processingStatus === "ready" || d.status === "ready" ? "Ready" : "Processing",
          chunksCount: d.chunks ? d.chunks.length : 0,
          qdrantCollectionRef: `qdrant_${d.id}`
        }));

        // Merge server materials with cached materials, preventing duplicates
        const map = new Map<string, StudyMaterial>();
        serverMapped.forEach((m) => map.set(m.id, m));
        combinedMaterials.forEach((m) => {
          if (!map.has(m.id)) map.set(m.id, m);
        });

        const merged = Array.from(map.values());
        setMaterials(merged);

        if (merged.length > 0) {
          setSelectedMaterialId((prev) => (prev && map.has(prev) ? prev : merged[0].id));
        }
      } else if (!data.success && combinedMaterials.length === 0) {
        setMaterialsError(data.error || "Unable to load your materials. Please try again.");
      }
    } catch (err) {
      console.error("Failed to fetch materials from API:", err);
      if (combinedMaterials.length === 0) {
        setMaterialsError("Unable to load your materials. Please try again.");
      }
    } finally {
      setIsLoadingMaterials(false);
    }
  }, [selectedMaterialId]);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleGenerateQuiz = async () => {
    if (!selectedMaterialId && materials.length > 0) return;
    setQuizError(null);

    const currentCredits = CreditService.getCredits();
    if (currentCredits < 10) {
      setQuizError("Insufficient credits. You need at least 10 credits to generate a material quiz.");
      if (onDeductCredits) onDeductCredits(10);
      return;
    }

    const selectedMat = materials.find((m) => m.id === selectedMaterialId);
    const targetTitle = selectedMat ? selectedMat.title : "Study Material";
    const cachedObj = getMaterialFromCache(selectedMaterialId);
    const extractedText = cachedObj ? cachedObj.extractedText || cachedObj.content : undefined;

    const idempotencyKey = `quiz_${Date.now()}`;
    const userId = getOrCreateLocalUserId();

    setIsGenerating(true);
    setQuizSubmitted(false);
    setUserAnswers({});

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId
        },
        body: JSON.stringify({
          documentId: selectedMaterialId,
          topic: targetTitle,
          extractedText,
          questionCount: 5,
          difficulty,
          idempotencyKey
        })
      });

      const data = await res.json();
      if (data.success && data.questions && data.questions.length > 0) {
        if (data.creditsRemaining !== undefined) {
          CreditService.notifyCreditDeduction(10, data.creditsRemaining);
        }
        setActiveQuiz({
          id: `quiz_${Date.now()}`,
          title: `Quiz on ${targetTitle}`,
          subject: selectedMat?.subject || "Computer Science",
          difficulty,
          questions: data.questions
        });
      } else {
        setQuizError(data.error || "There's not enough readable content in this material to generate a reliable quiz.");
        if (data.errorCode === "INSUFFICIENT_CREDITS" && onDeductCredits) {
          onDeductCredits(10);
        }
      }
    } catch (err) {
      console.error("Quiz API Error:", err);
      setQuizError("Couldn't generate quiz. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    let correctCount = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctOptionIndex) correctCount++;
    });
    const finalScore = Math.round((correctCount / activeQuiz.questions.length) * 100);
    setActiveQuiz((prev) => (prev ? { ...prev, score: finalScore } : null));
    setQuizSubmitted(true);

    // Record quiz attempt to server progress store (free)
    try {
      const userId = getOrCreateLocalUserId();
      await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId
        },
        body: JSON.stringify({
          recordAttempt: true,
          attemptData: {
            topic: activeQuiz.title,
            score: correctCount,
            total: activeQuiz.questions.length
          }
        })
      });
    } catch (err) {
      console.error("Failed to record quiz attempt:", err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Quiz Config Header Bar */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Source-Grounded Quiz Generator
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">
              Material Quiz
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Generate custom MCQs and practice questions directly from your uploaded materials • 10 Credits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMaterials}
              disabled={isLoadingMaterials}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
              title="Refresh materials"
              type="button"
            >
              <RotateCcw className={`w-4 h-4 ${isLoadingMaterials ? "animate-spin" : ""}`} />
            </button>

            {materials.length > 0 && (
              <button
                onClick={handleGenerateQuiz}
                disabled={isGenerating || !selectedMaterialId}
                className="px-6 py-3 rounded-2xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 shadow-md cursor-pointer shrink-0 transition-all"
                type="button"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? "Generating Quiz..." : "Generate AI Quiz • 10 Credits"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Error Alert: Distinguishing API errors from Empty State */}
        {materialsError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{materialsError}</span>
            </div>
            <button
              onClick={fetchMaterials}
              className="underline text-xs font-black cursor-pointer ml-3"
              type="button"
            >
              Retry
            </button>
          </div>
        )}

        {/* Quiz Deduction Error Alert */}
        {quizError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-between">
            <span>{quizError}</span>
            {onDeductCredits && (
              <button
                onClick={() => onDeductCredits(10)}
                className="underline text-xs font-black cursor-pointer ml-3"
                type="button"
              >
                Upgrade Plan
              </button>
            )}
          </div>
        )}

        {/* STATE A: Loading Materials */}
        {isLoadingMaterials && materials.length === 0 ? (
          <div className="p-10 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <RefreshCw className="w-6 h-6 text-purple-500 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Loading your uploaded study materials...</p>
          </div>
        ) : materials.length === 0 && !materialsError ? (
          /* STATE B: Genuinely Zero Materials Uploaded */
          <div className="p-10 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <FileText className="w-10 h-10 text-purple-500 mx-auto" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">You haven't added any material yet.</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
              Upload your first PDF, DOCX, or video notes in **My Materials** to use Material Quiz for generating custom quizzes.
            </p>
          </div>
        ) : materials.length > 0 ? (
          /* STATE C: Show Uploaded Materials Selection */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Select Source Material ({materials.length} available)
              </label>
              <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">
                Click a material to select
              </span>
            </div>

            {/* Material Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {materials.map((m) => {
                const isSelected = selectedMaterialId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMaterialId(m.id)}
                    className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-purple-500/10 border-purple-500 shadow-md ring-1 ring-purple-500"
                        : "bg-slate-50/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-900"
                    }`}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-2 w-full">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-2 rounded-xl shrink-0 ${isSelected ? "bg-purple-600 text-white" : "bg-purple-500/10 text-purple-600 dark:text-purple-400"}`}>
                          {m.fileType === "youtube" ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {m.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                            {m.fileType} • {m.sizeMb} MB
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200/60 dark:border-slate-800/60 pt-2 w-full">
                      <span>Uploaded {m.uploadedAt}</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {isSelected ? "Selected" : "Click to select"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quiz Configuration Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1.5">Difficulty Level</label>
                <div className="flex items-center gap-2">
                  {(["Easy", "Medium", "Hard"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        difficulty === d
                          ? "bg-purple-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800"
                      }`}
                      type="button"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1.5">Question Format</label>
                <div className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>5 MCQs Grounded on Source</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-black">
                    Strict Grounding
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Active Quiz Area */}
      {activeQuiz && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">{activeQuiz.title}</h3>
              <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">{activeQuiz.difficulty} Difficulty • {activeQuiz.questions.length} Questions</span>
            </div>

            {quizSubmitted && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-extrabold text-sm">
                <Trophy className="w-4 h-4" />
                Score: {activeQuiz.score}%
              </div>
            )}
          </div>

          <div className="space-y-6">
            {activeQuiz.questions.map((q, qIdx) => (
              <div key={q.id || qIdx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs flex items-center justify-center font-black">
                    {qIdx + 1}
                  </span>
                  {q.question}
                </h4>

                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = userAnswers[qIdx] === optIdx;
                    const isCorrect = q.correctOptionIndex === optIdx;

                    let btnStyle = "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200";
                    if (quizSubmitted) {
                      if (isCorrect) btnStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold";
                      else if (isSelected && !isCorrect) btnStyle = "bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-400";
                    } else if (isSelected) {
                      btnStyle = "bg-purple-500/10 border-purple-500 text-purple-700 dark:text-purple-300 font-bold";
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(qIdx, optIdx)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${btnStyle}`}
                        type="button"
                      >
                        <span>{opt}</span>
                        {quizSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                        {quizSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {quizSubmitted && (
                  <div className="pt-2 text-xs text-slate-600 dark:text-slate-300 font-medium italic border-t border-slate-200 dark:border-slate-800">
                    💡 Explanation: {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          {!quizSubmitted ? (
            <button
              onClick={handleSubmitQuiz}
              className="w-full py-4 rounded-2xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 shadow-md transition-colors cursor-pointer"
              type="button"
            >
              Submit Quiz Answers
            </button>
          ) : (
            <button
              onClick={handleGenerateQuiz}
              className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs hover:opacity-90 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              type="button"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retake / Generate New Quiz</span>
            </button>
          )}
        </div>
      )}

    </div>
  );
}
