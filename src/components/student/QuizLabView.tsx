"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, XCircle, RefreshCw, Trophy, ArrowRight, HelpCircle } from "lucide-react";
import { QuizItem, QuizQuestion } from "@/lib/types/student-types";
import { GeminiAIService } from "@/lib/services/ai-service";

interface QuizLabViewProps {
  onDeductCredits: (cost: number) => boolean;
}

export function QuizLabView({ onDeductCredits }: QuizLabViewProps) {
  const [selectedSource, setSelectedSource] = useState("Data_Structures_Chapter3.pdf");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const handleGenerateQuiz = async () => {
    const hasCredits = onDeductCredits(15);
    if (!hasCredits) return;

    setIsGenerating(true);
    setQuizSubmitted(false);
    setUserAnswers({});

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedSource,
          questionCount: 4,
          difficulty
        })
      });

      const data = await res.json();
      if (data.success && data.questions) {
        setActiveQuiz({
          id: `quiz_${Date.now()}`,
          title: `Quiz on ${selectedSource}`,
          subject: "Computer Science",
          difficulty,
          questions: data.questions
        });
      }
    } catch (err) {
      console.error("Quiz API Error:", err);
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

    // Record quiz attempt to server progress store
    try {
      await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordAttempt: true,
          attemptData: {
            topic: selectedSource,
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
    <div className="space-y-6">
      
      {/* Quiz Config Bar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
              AI Quiz Lab
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Generate custom MCQs and practice questions directly from your notes.
            </p>
          </div>

          <button
            onClick={handleGenerateQuiz}
            disabled={isGenerating}
            className="px-6 py-3 rounded-2xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 shadow-md"
            type="button"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? "Generating Quiz..." : "Generate AI Quiz"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Source Material</label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="Data_Structures_Chapter3.pdf">Data_Structures_Chapter3.pdf</option>
              <option value="Algorithms_Lecture_Notes.docx">Algorithms_Lecture_Notes.docx</option>
              <option value="OS_Lecture_5.pdf">OS_Lecture_5.pdf</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Difficulty</label>
            <div className="flex items-center gap-2">
              {(["Easy", "Medium", "Hard"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold ${
                    difficulty === d
                      ? "bg-purple-600 text-white"
                      : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                  }`}
                  type="button"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Question Count</label>
            <div className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200">
              4 Questions (MCQ)
            </div>
          </div>
        </div>
      </div>

      {/* Active Quiz Area */}
      {activeQuiz && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">{activeQuiz.title}</h3>
              <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">{activeQuiz.difficulty} Difficulty • 4 Questions</span>
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
              <div key={q.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
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
                        className={`w-full text-left p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all ${btnStyle}`}
                        type="button"
                      >
                        <span>{opt}</span>
                        {quizSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        {quizSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-500" />}
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
              className="w-full py-4 rounded-2xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 shadow-md transition-colors"
              type="button"
            >
              Submit Quiz Answers
            </button>
          ) : (
            <button
              onClick={handleGenerateQuiz}
              className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs hover:opacity-90 transition-colors flex items-center justify-center gap-2"
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
