"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  FileText,
  Database,
  Sparkles,
  BarChart2,
  Calendar,
  Bookmark,
  Globe,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  LayoutDashboard,
  Home,
  LogOut,
  Bot,
  Brain
} from "lucide-react";
import { StudentTab } from "@/lib/types/student-types";
import { ThemeToggle } from "../ThemeToggle";
import { CreditService } from "@/lib/services/credit-service";
import { UpgradeModal } from "./UpgradeModal";
import { getOrCreateLocalUserId } from "@/lib/utils/user-id-utils";

interface StudentShellProps {
  currentTab: StudentTab;
  onTabChange: (tab: StudentTab) => void;
  children: React.ReactNode;
}

export function StudentShell({ currentTab, onTabChange, children }: StudentShellProps) {
  const [credits, setCredits] = useState<number>(100);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // User state
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    const userId = getOrCreateLocalUserId();
    const currentCredits = CreditService.getCredits(userId);
    setCredits(currentCredits);

    const handleCreditsUpdated = (e: any) => {
      if (e.detail && e.detail.credits !== undefined) {
        setCredits(e.detail.credits);
      }
    };

    const handleCreditDeducted = (e: any) => {
      if (e.detail && e.detail.remainingCredits !== undefined) {
        setCredits(e.detail.remainingCredits);
        const cost = e.detail.cost || 20;
        setToastMessage(`${cost} credits used · ${e.detail.remainingCredits} credits remaining`);
        setTimeout(() => {
          setToastMessage((prev) => (prev?.includes(`${e.detail.remainingCredits}`) ? null : prev));
        }, 4000);
      }
    };

    window.addEventListener("ai4life:credits-updated", handleCreditsUpdated);
    window.addEventListener("ai4life:credit-deducted", handleCreditDeducted);

    fetch("/api/auth", {
      headers: { "x-user-id": userId }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
          if (data.user.credits !== undefined) setCredits(data.user.credits);
        }
      })
      .catch(console.error);

    return () => {
      window.removeEventListener("ai4life:credits-updated", handleCreditsUpdated);
      window.removeEventListener("ai4life:credit-deducted", handleCreditDeducted);
    };
  }, []);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success && data.results) {
        setSearchResults(data.results);
      }
    } catch (err) {
      console.error("Search API error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLogout = () => {
    onTabChange("dashboard");
  };

  const sidebarNavItems = [
    { tab: "dashboard" as StudentTab, label: "Dashboard", icon: LayoutDashboard },
    { tab: "challenge" as StudentTab, label: "AI Se Baazi", icon: Zap, badge: "Flagship" },
    { tab: "tutor" as StudentTab, label: "AI Tutor", icon: Bot },
    { tab: "ask-notes" as StudentTab, label: "Ask From Materials", icon: Database },
    { tab: "materials" as StudentTab, label: "My Materials", icon: FileText },
    { tab: "quiz-lab" as StudentTab, label: "Quiz Lab", icon: Sparkles },
    { tab: "planner" as StudentTab, label: "Study Planner", icon: Calendar },
    { tab: "memory" as StudentTab, label: "Personalized Memory", icon: Brain, badge: "Mem0" },
    { tab: "progress" as StudentTab, label: "Progress", icon: BarChart2 },
    { tab: "saved" as StudentTab, label: "Saved Notes", icon: Bookmark },
  ];

  return (
    <div className="min-h-screen bg-[#F4F3EE] dark:bg-[#080B12] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300 workspace-shell student-workspace">
      
      {/* Top Fixed Header */}
      <header className="h-16 border-b border-[#D5CBC2] dark:border-slate-800 bg-[#F4F3EE]/90 dark:bg-[#080B12]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Menu Toggle + Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-200/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
            type="button"
          >
            <Menu className="w-5 h-5" />
          </button>

          <a href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <Home className="w-4 h-4" />
            <span className="text-xs font-bold hidden sm:inline">Home</span>
          </a>
          <span className="text-slate-400 dark:text-slate-700 text-xs">/</span>
          <span className="text-xs font-black text-[#3C324A] dark:text-white capitalize">
            {currentTab.replace("-", " ")}
          </span>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md relative hidden md:block">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search materials, notes, or AI tutor..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs font-medium bg-[#EFEAE6] dark:bg-[#111722] border border-[#D5CBC2] dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {searchResults.length > 0 && searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 max-h-80 overflow-y-auto"
              >
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (res.type === "material") onTabChange("materials");
                      if (res.type === "note") onTabChange("saved");
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{res.title}</p>
                      <p className="text-[10px] text-slate-500 capitalize">{res.type}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Credits Pill + Theme Toggle */}
        <div className="flex items-center gap-3">
          
          {/* Credit Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300">
            <Zap className="w-3.5 h-3.5 fill-current text-amber-500" />
            <span className="text-xs font-black">{isMounted ? credits : 100}</span>
            <button
              onClick={() => setIsUpgradeOpen(true)}
              className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500 text-white hover:bg-amber-600 transition-colors cursor-pointer"
            >
              + Add
            </button>
          </div>

          <ThemeToggle />
        </div>

      </header>

      {/* Floating Credit Notification Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="px-4 py-2.5 rounded-2xl bg-slate-900/90 dark:bg-slate-100/90 text-white dark:text-slate-900 border border-slate-700/50 dark:border-slate-300 shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs font-bold">
              <Zap className="w-4 h-4 text-amber-400 dark:text-amber-600 fill-current shrink-0 animate-bounce" />
              <span>{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Workspace Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Workspace Sidebar (Desktop) */}
        <aside className="w-64 shrink-0 hidden md:flex flex-col justify-between p-4 border-r border-[#D5CBC2] dark:border-slate-800 bg-[#F4F3EE]/50 dark:bg-[#080B12]/50">
          
          <div className="space-y-6">
            
            {/* Profile Card Pill */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#EFEAE6]/80 dark:bg-[#1A2232] border border-[#D5CBC2]/60 dark:border-slate-800">
              <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 border-blue-500/80 shadow-xs bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm">
                {currentUser?.name ? currentUser.name.split(" ").map((n: string) => n[0]).join("") : "SK"}
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-black text-[#3C324A] dark:text-white truncate">
                  {currentUser?.name || "Swati Kumari"}
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  Computer Science & AI
                </p>
              </div>
            </div>

            {/* Sidebar Navigation Items */}
            <nav className="space-y-1.5">
              {sidebarNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.tab;
                return (
                  <button
                    key={item.tab}
                    onClick={() => onTabChange(item.tab)}
                    className={`w-full px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#EFEAE6] dark:bg-[#1E2738] text-[#3C324A] dark:text-white shadow-sm border border-[#D5CBC2] dark:border-slate-700"
                        : "text-slate-600 dark:text-slate-400 hover:bg-[#EAE4DE] dark:hover:bg-[#161D2A] hover:text-slate-900 dark:hover:text-white"
                    }`}
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1 rounded-lg ${isActive ? "bg-amber-400/20 text-amber-700 dark:text-amber-300" : "text-slate-500"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${isActive ? "bg-[#3C324A] text-white" : "bg-amber-500/20 text-amber-700 dark:text-amber-400"}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Log out / Reset Button */}
          <div className="pt-4 border-t border-[#D5CBC2]/60 dark:border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-3 cursor-pointer"
              type="button"
            >
              <div className="p-1 rounded-lg bg-rose-500/10 text-rose-600">
                <LogOut className="w-4 h-4" />
              </div>
              <span>Reset Dashboard</span>
            </button>
          </div>

        </aside>

        {/* Mobile Drawer Navigation */}
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
                className="relative w-72 max-w-full bg-[#EFEAE6] dark:bg-[#111722] p-6 space-y-4 shadow-2xl z-10 overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-[#D5CBC2] dark:border-slate-800 pb-4">
                  <span className="font-black text-[#3C324A] dark:text-white font-heading text-lg">AI4Life</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} type="button">
                    <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  </button>
                </div>

                <div className="space-y-1.5">
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
                          isActive ? "bg-[#3C324A] text-white" : "text-slate-700 dark:text-slate-300"
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

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>

      </div>

      {/* Upgrade Plan Modal */}
      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        onSuccess={(added) => setCredits((prev) => prev + added)}
      />

    </div>
  );
}
