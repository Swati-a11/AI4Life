"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Briefcase,
  FileText,
  Sparkles,
  Calendar,
  Brain,
  Globe,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  LayoutDashboard,
  CheckSquare,
  TrendingUp,
  MessageSquare,
  MoreVertical,
  LogOut,
  UserCheck,
  Building2,
  Video,
} from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { CreditService } from "@/lib/services/credit-service";
import { UpgradeModal } from "../student/UpgradeModal";
import { ProfessionalTab } from "@/lib/types/professional-types";

interface ProfessionalShellProps {
  currentTab: ProfessionalTab;
  onTabChange?: (tab: ProfessionalTab) => void;
  children: React.ReactNode;
}

export function ProfessionalShell({ currentTab, onTabChange, children }: ProfessionalShellProps) {
  const [credits, setCredits] = useState(100);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setCredits(CreditService.getCredits());
  }, []);

  const sidebarNavItems = [
    { tab: "dashboard" as ProfessionalTab, path: "/professional", label: "Dashboard", icon: LayoutDashboard },
    { tab: "copilot" as ProfessionalTab, path: "/professional/copilot", label: "AI Copilot", icon: Sparkles, badge: "Primary" },
    { tab: "documents" as ProfessionalTab, path: "/professional/documents", label: "Documents", icon: FileText },
    { tab: "meetings" as ProfessionalTab, path: "/professional/meetings", label: "Meeting Intelligence", icon: Video },
    { tab: "tasks" as ProfessionalTab, path: "/professional/tasks", label: "Tasks", icon: CheckSquare },
    { tab: "research" as ProfessionalTab, path: "/professional/research", label: "Research", icon: Globe },
    { tab: "insights" as ProfessionalTab, path: "/professional/insights", label: "Insights", icon: TrendingUp },
    { tab: "memory" as ProfessionalTab, path: "/professional/memory", label: "AI Memory", icon: Brain },
    { tab: "settings" as ProfessionalTab, path: "/professional/memory", label: "Settings", icon: Settings },
  ];

  const handleNavigate = (item: typeof sidebarNavItems[0]) => {
    if (onTabChange) {
      onTabChange(item.tab);
    }
    router.push(item.path);
    setIsMobileMenuOpen(false);
  };

  const handleUpgradeSuccess = () => {
    setCredits(CreditService.getCredits());
  };

  return (
    <div className="min-h-screen bg-[#E5DFC5]/40 dark:bg-[#080B12] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors p-2 sm:p-4 md:p-6 workspace-shell professional-workspace">
      
      {/* Outer Shell Card Container matching Student Workspace rounded card backdrop */}
      <div className="max-w-7xl w-full mx-auto bg-[#EFEAE6] dark:bg-[#0E131F] rounded-[36px] border border-[#E2DAD3] dark:border-slate-800/80 shadow-2xl overflow-hidden flex flex-col min-h-[92vh]">
        
        {/* Top Header Bar */}
        <header className="border-b border-[#E2DAD3]/70 dark:border-slate-800/80 bg-[#EFEAE6]/90 dark:bg-[#0E131F]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between gap-4">
          
          {/* Mobile Menu Trigger & Greeting */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-2xl bg-[#DFD7D0] dark:bg-slate-900 md:hidden text-slate-700 dark:text-slate-200"
              type="button"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#3C324A] dark:text-white tracking-wider font-heading uppercase">
                GOOD MORNING.
              </h1>
              <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                Here's what needs your attention.
              </p>
            </div>
          </div>

          {/* Center Pill Search Bar */}
          <div className="hidden md:flex items-center gap-2 max-w-sm w-full px-4 py-2 rounded-full bg-[#DFD7D0]/60 dark:bg-[#161D2A] border border-[#D5CBC2] dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search work documents, meetings, or Copilot..."
              className="w-full bg-transparent border-none text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            
            {/* Credit Badge */}
            <button
              onClick={() => setIsUpgradeOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-800 dark:text-teal-300 font-extrabold text-xs flex items-center gap-1.5 hover:bg-teal-500/20 transition-colors cursor-pointer"
              type="button"
            >
              <Zap className="w-3.5 h-3.5 fill-current animate-pulse text-teal-600 dark:text-teal-400" />
              <span>{credits} Credits</span>
            </button>

            {/* Notification Bell Icon */}
            <div className="relative p-2 rounded-full bg-[#DFD7D0]/60 dark:bg-[#161D2A] text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-[#D5CBC2]">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-teal-500 animate-ping" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-teal-500" />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Actions vertical dots */}
            <button className="p-2 rounded-full bg-[#DFD7D0]/60 dark:bg-[#161D2A] text-slate-700 dark:text-slate-300 hover:bg-[#D5CBC2]" type="button">
              <MoreVertical className="w-4 h-4" />
            </button>

          </div>
        </header>

        {/* Main Workspace Layout (Sidebar + Content) */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          
          {/* Left Sidebar (Desktop) */}
          <aside className="hidden md:flex w-64 shrink-0 bg-[#DFD7D0]/50 dark:bg-[#121824] border-r border-[#E2DAD3] dark:border-slate-800/80 p-5 flex-col justify-between space-y-6">
            
            <div className="space-y-6">
              
              {/* Top Logo / App Name */}
              <div className="flex items-center gap-3 px-2">
                <Link href="/" className="text-2xl font-black text-[#4A3E56] dark:text-white tracking-tight font-heading hover:opacity-90 transition-opacity">
                  AI4Life
                </Link>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20">
                  Professional
                </span>
              </div>

              {/* Profile Card Pill */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#EFEAE6]/80 dark:bg-[#1A2232] border border-[#D5CBC2]/60 dark:border-slate-800">
                <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 border-teal-500/80 shadow-xs bg-gradient-to-tr from-teal-600 to-emerald-600 text-white flex items-center justify-center font-black text-sm">
                  SK
                </div>
                <div className="min-w-0">
                  <h2 className="text-xs font-black text-[#3C324A] dark:text-white truncate">
                    Swati Kumari
                  </h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                    Product & Executive Lead
                  </p>
                </div>
              </div>

              {/* Sidebar Navigation Items */}
              <nav className="space-y-1.5">
                {sidebarNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path || currentTab === item.tab;
                  return (
                    <button
                      key={item.tab}
                      onClick={() => handleNavigate(item)}
                      className={`w-full px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#EFEAE6] dark:bg-[#1E2738] text-[#3C324A] dark:text-white shadow-sm border border-[#D5CBC2] dark:border-slate-700"
                          : "text-slate-600 dark:text-slate-400 hover:bg-[#EAE4DE] dark:hover:bg-[#161D2A] hover:text-slate-900 dark:hover:text-white"
                      }`}
                      type="button"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1 rounded-lg ${isActive ? "bg-teal-400/20 text-teal-700 dark:text-teal-300" : "text-slate-500"}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${isActive ? "bg-teal-600 text-white" : "bg-teal-500/20 text-teal-700 dark:text-teal-400"}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Log out / Upgrade Button */}
            <div className="pt-4 border-t border-[#D5CBC2]/60 dark:border-slate-800 space-y-2">
              <button
                onClick={() => setIsUpgradeOpen(true)}
                className="w-full px-4 py-2 rounded-2xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                type="button"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upgrade Plan</span>
              </button>

              <Link
                href="/"
                className="w-full px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-3"
              >
                <div className="p-1 rounded-lg bg-rose-500/10 text-rose-600">
                  <LogOut className="w-4 h-4" />
                </div>
                <span>Exit Workspace</span>
              </Link>
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
                    <span className="font-black text-[#3C324A] dark:text-white font-heading text-lg">AI4Life Professional</span>
                    <button onClick={() => setIsMobileMenuOpen(false)} type="button">
                      <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {sidebarNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.path || currentTab === item.tab;
                      return (
                        <button
                          key={item.tab}
                          onClick={() => handleNavigate(item)}
                          className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between ${
                            isActive ? "bg-teal-700 text-white" : "text-slate-700 dark:text-slate-300"
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
        onSuccess={handleUpgradeSuccess}
      />

    </div>
  );
}
