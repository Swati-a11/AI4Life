"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  MessageSquare,
  FileText,
  Database,
  Sparkles,
  BarChart2,
  Calendar,
  Bookmark,
  Brain,
  Globe,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  LayoutDashboard,
  UserCheck,
  ChevronRight
} from "lucide-react";
import { StudentTab } from "@/lib/types/student-types";
import { ThemeToggle } from "../ThemeToggle";
import { CreditService } from "@/lib/services/credit-service";
import { UpgradeModal } from "./UpgradeModal";

interface StudentShellProps {
  currentTab: StudentTab;
  onTabChange: (tab: StudentTab) => void;
  children: React.ReactNode;
}

export function StudentShell({ currentTab, onTabChange, children }: StudentShellProps) {
  const [credits, setCredits] = useState(CreditService.getCredits());
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarNavItems = [
    { tab: "dashboard" as StudentTab, label: "Dashboard", icon: LayoutDashboard },
    { tab: "tutor" as StudentTab, label: "AI Tutor", icon: MessageSquare },
    { tab: "materials" as StudentTab, label: "My Materials", icon: FileText },
    { tab: "ask-notes" as StudentTab, label: "Ask from Notes", icon: Database },
    { tab: "quiz-lab" as StudentTab, label: "Quiz Lab", icon: Sparkles },
    { tab: "challenge" as StudentTab, label: "AI Se Baazi", icon: Zap, badge: "Signature" },
    { tab: "progress" as StudentTab, label: "Progress", icon: BarChart2 },
    { tab: "planner" as StudentTab, label: "Study Planner", icon: Calendar },
    { tab: "saved" as StudentTab, label: "Saved Notes", icon: Bookmark },
    { tab: "memory" as StudentTab, label: "Mem0 Memory", icon: Brain },
    { tab: "research" as StudentTab, label: "Tavily Research", icon: Globe },
  ];

  const handleDeductCredits = (cost: number = 10): boolean => {
    const res = CreditService.deductCredits(cost);
    setCredits(res.remainingCredits);
    if (!res.success) {
      setIsUpgradeOpen(true);
    }
    return res.success;
  };

  const handleUpgradeSuccess = (added: number) => {
    setCredits(CreditService.getCredits());
  };

  return (
    <div className="min-h-screen bg-[#F4F3EE] dark:bg-[#080B12] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 bg-[#F4F3EE]/90 dark:bg-[#080B12]/90 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between">
        
        {/* Left Brand Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-200/60 dark:bg-slate-900 md:hidden"
            type="button"
          >
            <Menu className="w-5 h-5" />
          </button>

          <a href="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#3157D5] dark:bg-[#4F8CFF] text-white font-black">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-black text-slate-900 dark:text-white font-heading">AI4Life</span>
              <span className="text-[10px] font-bold text-[#3157D5] dark:text-[#4F8CFF] block -mt-1">Student Workspace</span>
            </div>
          </a>
        </div>

        {/* Center Search Bar (Desktop) */}
        <div className="hidden md:flex items-center gap-2 max-w-md w-full px-4 py-2 rounded-2xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
          <Search className="w-4 h-4" />
          <input
            type="text"
            placeholder="Search study materials, quiz topics, or AI answers..."
            className="w-full bg-transparent border-none text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Right Action Widgets */}
        <div className="flex items-center gap-3">
          
          {/* Credit Indicator */}
          <button
            onClick={() => setIsUpgradeOpen(true)}
            className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold text-xs flex items-center gap-1.5 hover:bg-amber-500/20 transition-colors"
            type="button"
          >
            <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
            <span>{credits} Credits</span>
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              S
            </div>
            <div className="hidden lg:block text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-white block line-clamp-1">Swati Kumari</span>
              <span className="text-[10px] text-slate-500 font-medium block -mt-0.5">Plus Student</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        
        {/* Desktop Left Sidebar */}
        <aside className="hidden md:block w-64 shrink-0 space-y-6">
          <div className="p-4 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-sm">
            <div className="text-[10px] font-extrabold uppercase text-slate-400 px-3 py-1 tracking-wider">
              Workspace Navigation
            </div>

            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => onTabChange(item.tab)}
                  className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#3157D5] dark:bg-[#4F8CFF] text-white shadow-md"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                  type="button"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${isActive ? "bg-white text-blue-600" : "bg-amber-500/20 text-amber-600 dark:text-amber-400"}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Upgrade Box */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white space-y-3 shadow-lg">
            <div className="flex items-center gap-2 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Unlimited RAG & Quizzes</span>
            </div>
            <p className="text-[11px] text-blue-100 leading-relaxed">
              Upgrade to Pro for 10,000 Credits, priority vector search, and Tavily web research.
            </p>
            <button
              onClick={() => setIsUpgradeOpen(true)}
              className="w-full py-2 rounded-xl bg-white text-blue-600 font-extrabold text-xs shadow-xs hover:bg-blue-50 transition-colors"
              type="button"
            >
              Upgrade to Pro
            </button>
          </div>
        </aside>

        {/* Mobile Slide-out Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 md:hidden flex">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                className="relative w-72 max-w-full bg-white dark:bg-[#111722] p-6 space-y-4 shadow-2xl z-10 overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <span className="font-black text-slate-900 dark:text-white font-heading">Student Workspace</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} type="button">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {sidebarNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.tab;
                    return (
                      <button
                        key={item.tab}
                        onClick={() => {
                          onTabChange(item.tab);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between ${
                          isActive ? "bg-[#3157D5] text-white" : "text-slate-700 dark:text-slate-300"
                        }`}
                        type="button"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Main Workspace Content Area */}
        <main className="flex-1 min-w-0">
          {children}
        </main>

      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden sticky bottom-0 z-40 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#111722]/90 backdrop-blur-md px-2 py-2 flex items-center justify-around">
        {[
          { tab: "dashboard" as StudentTab, label: "Home", icon: LayoutDashboard },
          { tab: "tutor" as StudentTab, label: "Tutor", icon: MessageSquare },
          { tab: "ask-notes" as StudentTab, label: "Notes", icon: Database },
          { tab: "quiz-lab" as StudentTab, label: "Quiz", icon: Sparkles },
          { tab: "challenge" as StudentTab, label: "Baazi", icon: Zap },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => onTabChange(item.tab)}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-bold ${
                isActive ? "text-[#3157D5] dark:text-[#4F8CFF]" : "text-slate-500"
              }`}
              type="button"
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Upgrade Plan Modal */}
      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        onSuccess={handleUpgradeSuccess}
      />

    </div>
  );
}
