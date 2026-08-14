"use client";

import { Zap, Code2 } from "lucide-react";

export function FooterSimple() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-[#F4F3EE] dark:bg-[#080B12] py-12 text-slate-600 dark:text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-200/80 dark:border-slate-800/80">
          
          {/* Brand Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#3157D5] dark:bg-[#4F8CFF] text-white font-black">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="text-base font-black text-slate-900 dark:text-white font-heading">
                AI4Life
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                One AI core. Three ways to live.
              </p>
            </div>
          </div>

          {/* Minimal Navigation Links */}
          <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-700 dark:text-slate-300">
            <a href="#workspaces" className="hover:text-[#3157D5] dark:hover:text-[#4F8CFF] transition-colors">Workspaces</a>
            <a href="#how-it-works" className="hover:text-[#3157D5] dark:hover:text-[#4F8CFF] transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-[#3157D5] dark:hover:text-[#4F8CFF] transition-colors">Pricing</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#3157D5] dark:hover:text-[#4F8CFF] transition-colors flex items-center gap-1"><Code2 className="w-3.5 h-3.5" /> GitHub</a>
            <a href="#contact" className="hover:text-[#3157D5] dark:hover:text-[#4F8CFF] transition-colors">Contact</a>
            <a href="#privacy" className="hover:text-[#3157D5] dark:hover:text-[#4F8CFF] transition-colors">Privacy</a>
            <a href="#terms" className="hover:text-[#3157D5] dark:hover:text-[#4F8CFF] transition-colors">Terms</a>
          </div>

        </div>

        <div className="pt-6 text-center text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          © 2026 AI4Life. All rights reserved.
        </div>

      </div>
    </footer>
  );
}
