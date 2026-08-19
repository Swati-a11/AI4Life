"use client";

import { useState, useEffect } from "react";
import { StudentTab } from "@/lib/types/student-types";
import { StudentShell } from "@/components/student/StudentShell";
import { DashboardView } from "@/components/student/DashboardView";
import { AITutorView } from "@/components/student/AITutorView";
import { AskFromNotesView } from "@/components/student/AskFromNotesView";
import { MyMaterialsView } from "@/components/student/MyMaterialsView";
import { QuizLabView } from "@/components/student/QuizLabView";
import { ChallengeModeView } from "@/components/student/ChallengeModeView";
import { ProgressView } from "@/components/student/ProgressView";
import { StudyPlannerView } from "@/components/student/StudyPlannerView";
import { SavedView } from "@/components/student/SavedView";
import { Mem0MemoryView } from "@/components/student/Mem0MemoryView";
import { TavilyResearchView } from "@/components/student/TavilyResearchView";
import { CreditService } from "@/lib/services/credit-service";
import { getOrCreateLocalUserId } from "@/lib/utils/user-id-utils";

export default function StudentWorkspacePage() {
  const [activeTab, setActiveTab] = useState<StudentTab>("dashboard");
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  useEffect(() => {
    getOrCreateLocalUserId();
  }, []);

  const handleDeductCredits = (cost: number = 20): boolean => {
    const userId = getOrCreateLocalUserId();
    const res = CreditService.deductCredits(cost, userId);
    if (!res.success) {
      setIsUpgradeModalOpen(true);
    }
    return res.success;
  };

  return (
    <StudentShell currentTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "dashboard" && (
        <DashboardView
          userName="Swati"
          onTabChange={setActiveTab}
          onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
        />
      )}

      {activeTab === "tutor" && (
        <AITutorView onDeductCredits={handleDeductCredits} />
      )}

      {activeTab === "ask-notes" && (
        <AskFromNotesView onDeductCredits={handleDeductCredits} />
      )}

      {activeTab === "materials" && (
        <MyMaterialsView onTabChange={setActiveTab} />
      )}

      {activeTab === "quiz-lab" && (
        <QuizLabView onDeductCredits={handleDeductCredits} />
      )}

      {activeTab === "challenge" && (
        <ChallengeModeView onDeductCredits={handleDeductCredits} />
      )}

      {activeTab === "progress" && <ProgressView />}

      {activeTab === "planner" && (
        <StudyPlannerView onDeductCredits={handleDeductCredits} />
      )}

      {activeTab === "saved" && <SavedView />}

      {activeTab === "memory" && <Mem0MemoryView />}

      {activeTab === "research" && (
        <TavilyResearchView onDeductCredits={handleDeductCredits} />
      )}
    </StudentShell>
  );
}
