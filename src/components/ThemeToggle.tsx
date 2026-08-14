"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-16 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex items-center w-16 h-8 p-1 rounded-full bg-slate-200/90 dark:bg-slate-900 border border-slate-300/80 dark:border-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-inner"
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      type="button"
    >
      <div className="flex items-center justify-between w-full px-1 text-slate-500">
        <Sun className="w-3.5 h-3.5 text-amber-500 z-0" />
        <Moon className="w-3.5 h-3.5 text-blue-400 z-0" />
      </div>

      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`absolute top-1 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-300/50 dark:border-slate-700 flex items-center justify-center shadow-md z-10 ${
          isDark ? "left-[calc(100%-1.75rem)]" : "left-1"
        }`}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-sky-400" />
        ) : (
          <Sun className="w-3 h-3 text-amber-500" />
        )}
      </motion.div>
    </button>
  );
}
