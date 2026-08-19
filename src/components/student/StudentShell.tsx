"use client";

import { useState, useEffect } from "react";
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
  ChevronRight,
  Home,
  MoreVertical,
  LogOut,
  Bot,
  User
} from "lucide-react";
import { UserButton, useClerk } from "@clerk/nextjs";
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

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // User state
  const [currentUser, setCurrentUser] = useState<any>({ name: "Swati Kumari", email: "swati@student.ai4life.com" });

  const pubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkEnabled = Boolean(
    pubKey &&
    pubKey.startsWith("pk_") &&
    !pubKey.includes("your_")
  );

  let clerk: any = null;
  try {
    if (isClerkEnabled) {
      clerk = useClerk();
    }
  } catch (err) {
    // Fallback if Clerk context is inactive
  }

  useEffect(() => {
    fetch("/api/auth")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
          if (data.user.credits !== undefined) setCredits(data.user.credits);
        }
      })
      .catch(console.error);
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
    if (isClerkEnabled && clerk) {
      clerk.signOut({ redirectUrl: "/" });
    } else {
      window.location.href = "/";
    }
  };

  const sidebarNavItems = [
    { tab: "dashboard" as StudentTab, label: "Dashboard", icon: LayoutDashboard },
    { tab: "challenge" as StudentTab, label: "AI Se Baazi", icon: Zap, badge: "Flagship" },
    { tab: "tutor" as StudentTab, label: "AI Tutor", icon: Bot },
    { tab: "ask-notes" as StudentTab, label: "Ask From Materials", icon: Database },
    { tab: "materials" as StudentTab, label: "My Materials", icon: FileText },
    { tab: "quiz-lab" as StudentTab, label: "Quiz Lab", icon: Sparkles },
    { tab: "planner" as StudentTab, label: "Study Planner", icon: Calendar },
    { tab: "progress" as StudentTab, label: "Progress", icon: BarChart2 },
    { tab: "saved" as StudentTab, label: "Saved Notes", icon: Bookmark },
    { tab: "memory" as StudentTab, label: "AI Memory", icon: Brain },
  ];

  return (
    <div className="min-h-screen bg-[#E5DFC5]/40 dark:bg-[#080B12] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors p-2 sm:p-4 md:p-6">
      
      {/* Outer Shell Card Container matching reference screenshot */}
      <div className="max-w-7xl w-full mx-auto bg-[#EFEAE6] dark:bg-[#0E131F] rounded-[36px] border border-[#E2DAD3] dark:border-slate-800/80 shadow-2xl overflow-hidden flex flex-col min-h-[92vh]">
        
        {/* Top Header Bar */}
        <header className="border-b border-[#E2DAD3]/70 dark:border-slate-800/80 bg-[#EFEAE6]/90 dark:bg-[#0E131F]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between gap-4 relative z-30">
          
          {/* Mobile Menu Trigger & Greeting */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-2xl bg-[#DFD7D0] dark:bg-slate-900 md:hidden text-slate-700 dark:text-slate-200 cursor-pointer"
              type="button"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#3C324A] dark:text-white tracking-wider font-heading uppercase">
                HELLO, {currentUser?.name ? currentUser.name.split(" ")[0].toUpperCase() : "SWATI"}!
              </h1>
            </div>
          </div>

          {/* Center Pill Search Bar */}
          <div className="hidden md:flex flex-col relative max-w-sm w-full">
            <div className="flex items-center gap-2 w-full px-4 py-2 rounded-full bg-[#DFD7D0]/60 dark:bg-[#161D2A] border border-[#D5CBC2] dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search study materials, quiz topics, or AI..."
                className="w-full bg-transparent border-none text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400 font-medium"
              />
            </div>

            {/* Live Search Overlay Results */}
            {searchResults.length > 0 && (
              <div className="absolute top-12 left-0 right-0 p-3 rounded-2xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-2 z-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2">Search Results</span>
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.tab as StudentTab);
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors cursor-pointer"
                    type="button"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{item.snippet}</p>
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      {item.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            
            {/* Credit Badge */}
            <button
              onClick={() => setIsUpgradeOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 font-extrabold text-xs flex items-center gap-1.5 hover:bg-amber-500/20 transition-colors cursor-pointer"
              type="button"
            >
              <Zap className="w-3.5 h-3.5 fill-current animate-pulse text-amber-500" />
              <span>{credits} Credits</span>
            </button>

            {/* Notification Bell */}
            <div className="relative p-2 rounded-full bg-[#DFD7D0]/60 dark:bg-[#161D2A] text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-[#D5CBC2]">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Clerk User Button Profile Control */}
            {isClerkEnabled && (
              <div className="flex items-center">
                <UserButton />
              </div>
            )}

          </div>
        </header>

        {/* Main Workspace Layout (Sidebar + Content) */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          
          {/* Left Sidebar (Desktop) */}
          <aside className="hidden md:flex w-64 shrink-0 bg-[#DFD7D0]/50 dark:bg-[#121824] border-r border-[#E2DAD3] dark:border-slate-800/80 p-5 flex-col justify-between space-y-6">
            
            <div className="space-y-6">
              
              {/* Logo / App Name */}
              <div className="flex items-center gap-3 px-2">
                <span className="text-2xl font-black text-[#4A3E56] dark:text-white tracking-tight font-heading">
                  AI4Life
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Student
                </span>
              </div>

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

            {/* Bottom Log out Button */}
            <div className="pt-4 border-t border-[#D5CBC2]/60 dark:border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-3 cursor-pointer"
                type="button"
              >
                <div className="p-1 rounded-lg bg-rose-500/10 text-rose-600">
                  <LogOut className="w-4 h-4" />
                </div>
                <span>Log out</span>
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
