"use client";

import { Zap, Code2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-100/60 dark:bg-slate-950 py-16 text-slate-600 dark:text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-slate-200/80 dark:border-slate-800">
          
          {/* Brand Info */}
          <div className="space-y-3 sm:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-400 text-slate-950 font-black shadow-sm">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <span className="text-lg font-black text-slate-900 dark:text-white font-heading tracking-tight">
                AI4Life
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm leading-relaxed font-normal">
              From information to action.
            </p>
          </div>

          {/* Product & Resources */}
          <div className="space-y-2.5">
            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Product</span>
            <ul className="space-y-2">
              <li><a href="#how-it-works" className="hover:text-cyan-500 transition-colors">How it works</a></li>
              <li><a href="#demo" className="hover:text-cyan-500 transition-colors">Interactive Demo</a></li>
              <li><a href="#use-cases" className="hover:text-cyan-500 transition-colors">Use cases</a></li>
              <li><a href="#pricing" className="hover:text-cyan-500 transition-colors">Pricing</a></li>
            </ul>
          </div>

          {/* Resources & Legal */}
          <div className="space-y-2.5">
            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Resources & Legal</span>
            <ul className="space-y-2">
              <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-500 transition-colors flex items-center gap-1.5"><Code2 className="w-3.5 h-3.5" /> GitHub</a></li>
              <li><a href="#privacy" className="hover:text-cyan-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-cyan-500 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 AI4Life. All rights reserved.
          </div>
          <div>
            Built with Next.js 15, TypeScript & Tailwind CSS.
          </div>
        </div>

      </div>
    </footer>
  );
}
