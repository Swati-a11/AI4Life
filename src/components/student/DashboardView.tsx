"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Calendar as CalendarIcon,
  BookOpen,
  Zap,
  MoreHorizontal
} from "lucide-react";
import { StudentTab } from "@/lib/types/student-types";

interface DashboardViewProps {
  userName: string;
  onTabChange: (tab: StudentTab) => void;
  onOpenUpgradeModal: () => void;
}

export function DashboardView({ userName, onTabChange, onOpenUpgradeModal }: DashboardViewProps) {
  // Real dynamic date calculation
  const today = new Date();
  const realYear = today.getFullYear();
  const realMonthIndex = today.getMonth(); // 0 = Jan, 7 = Aug, etc.
  const realTodayDate = today.getDate(); // e.g. 19

  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(realMonthIndex);
  const [currentYear, setCurrentYear] = useState<number>(realYear);
  const [selectedDay, setSelectedDay] = useState<number>(realTodayDate);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Calculate calendar grid metrics dynamically for current selected month & year
  const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1);
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  // Monday-indexed offset (0 = Mon, 1 = Tue, ..., 6 = Sun)
  const startDayOffset = (firstDayOfMonth.getDay() + 6) % 7;

  // Exactly Two Polished AI Tutor Personas as requested
  const teachers = [
    {
      id: "aarav",
      name: "Aarav Mehta",
      role: "Friendly & Patient AI Tutor",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    },
    {
      id: "riya",
      name: "Riya Kapoor",
      role: "Structured & Exam-Focused Tutor",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
    },
  ];

  // Real Upcoming events data for Swati
  const events = [
    {
      id: "e1",
      title: "AI & Machine Learning Workshop",
      datetime: `${realTodayDate} ${months[realMonthIndex].slice(0, 3)} ${realYear} 14:00`,
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: "e2",
      title: "Data Structures Midterm Quiz",
      datetime: `${Math.min(realTodayDate + 3, daysInMonth)} ${months[realMonthIndex].slice(0, 3)} ${realYear} 16:30`,
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=200&q=80",
    },
  ];

  // Real Schedule items for Swati
  const scheduleItems = [
    { day: realTodayDate, title: "AI Tutor & RAG Practice", time: "14:00" },
    { day: Math.min(realTodayDate + 1, daysInMonth), title: "Algorithms & Time Complexity", time: "16:30" },
    { day: Math.min(realTodayDate + 3, daysInMonth), title: "System Design & Vector Search", time: "18:00" },
  ];

  // Real Projects data for Swati
  const projects = [
    {
      id: "p1",
      title: "AI4Life Student Workspace",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80",
    },
  ];

  // Radial progress gauge helper component matching reference screenshot
  const RadialGauge = ({
    percentage,
    label,
    strokeColor,
  }: {
    percentage: number;
    label: string;
    strokeColor: string;
  }) => {
    const radius = 34;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center justify-center p-4 rounded-3xl bg-[#DFD7D0]/60 dark:bg-[#17202F] border border-[#D5CBC2]/60 dark:border-slate-800 space-y-2">
        <span className="text-xs font-bold text-[#3C324A] dark:text-slate-300 font-heading">
          {label}
        </span>

        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
            {/* Background Track Circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              className="stroke-[#D5CBC2]/50 dark:stroke-slate-700/60"
              strokeWidth="7"
              fill="transparent"
            />
            {/* Progress Circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke={strokeColor}
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-base font-black text-[#3C324A] dark:text-white font-heading">
              {percentage}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonthIndex(currentMonthIndex - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonthIndex(currentMonthIndex + 1);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT & CENTER MAIN SECTION (2 columns wide on desktop) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* ROW 1: Linked Teachers + Upcoming Events */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Linked Teachers Card */}
          <div className="p-5 rounded-[28px] bg-[#DFD7D0]/40 dark:bg-[#131A28] border border-[#D5CBC2]/70 dark:border-slate-800/80 space-y-4 flex flex-col justify-between shadow-xs">
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-[#3C324A] dark:text-slate-300 font-heading">
                Linked Teachers
              </h2>

              <div className="space-y-3">
                {teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-[#EFEAE6]/90 dark:bg-[#1A2232] border border-[#D5CBC2]/60 dark:border-slate-800 hover:shadow-xs transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={teacher.avatar}
                        alt={teacher.name}
                        className="w-10 h-10 rounded-full object-cover border border-blue-400/60"
                      />
                      <div>
                        <h3 className="text-xs font-bold text-[#3C324A] dark:text-white">
                          {teacher.name}
                        </h3>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {teacher.role}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onTabChange("tutor")}
                      className="w-8 h-8 rounded-full bg-[#3C324A] dark:bg-slate-700 text-white flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
                      title="Send message in AI Tutor"
                      type="button"
                    >
                      <MessageSquare className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onTabChange("tutor")}
              className="text-xs font-bold text-[#3C324A] dark:text-amber-400 hover:underline inline-flex items-center gap-1 pt-2 self-start cursor-pointer"
              type="button"
            >
              <span>See more</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Upcoming Events Card */}
          <div className="p-5 rounded-[28px] bg-[#DFD7D0]/40 dark:bg-[#131A28] border border-[#D5CBC2]/70 dark:border-slate-800/80 space-y-4 flex flex-col justify-between shadow-xs">
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-[#3C324A] dark:text-slate-300 font-heading">
                Upcoming events
              </h2>

              <div className="space-y-3">
                {events.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => onTabChange("planner")}
                    className="p-3 rounded-full bg-[#EFEAE6]/90 dark:bg-[#1A2232] border border-[#D5CBC2]/60 dark:border-slate-800 flex items-center justify-between gap-3 cursor-pointer hover:shadow-xs transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={evt.image}
                        alt={evt.title}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-300/60"
                      />
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-[#3C324A] dark:text-white truncate">
                          {evt.title}
                        </p>
                        <span className="text-[9px] font-bold text-slate-500 block">
                          {evt.datetime}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onTabChange("planner")}
              className="text-xs font-bold text-[#3C324A] dark:text-amber-400 hover:underline inline-flex items-center gap-1 pt-2 self-start cursor-pointer"
              type="button"
            >
              <span>See more</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* ROW 2: My Schedule (Interactive Mini Calendar + Schedule Timeline) */}
        <div className="p-6 rounded-[32px] bg-[#DFD7D0]/40 dark:bg-[#131A28] border border-[#D5CBC2]/70 dark:border-slate-800/80 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-[#3C324A] dark:text-slate-300 font-heading">
            My schedule
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left: Dynamic Mini Calendar Picker */}
            <div className="md:col-span-7 p-4 rounded-3xl bg-[#EFEAE6]/90 dark:bg-[#1A2232] border border-[#D5CBC2]/60 dark:border-slate-800 space-y-3">
              
              {/* Month Selector Header */}
              <div className="flex items-center justify-between px-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-[#DFD7D0]/60 cursor-pointer"
                  type="button"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-[#3C324A] dark:text-white font-heading">
                  {months[currentMonthIndex]} {currentYear}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-[#DFD7D0]/60 cursor-pointer"
                  type="button"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day Labels */}
              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-500 tracking-wider">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>

              {/* Days Grid dynamically generated */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
                {/* Empty slots for starting weekday offset */}
                {Array.from({ length: startDayOffset }).map((_, idx) => (
                  <div key={`empty-${idx}`} />
                ))}

                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const isSelected = day === selectedDay;
                  const isToday = day === realTodayDate && currentMonthIndex === realMonthIndex && currentYear === realYear;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`h-7 w-7 mx-auto rounded-full flex items-center justify-center transition-all cursor-pointer relative ${
                        isSelected
                          ? "bg-[#3C324A] dark:bg-amber-400 text-white dark:text-slate-900 font-bold shadow-xs"
                          : isToday
                          ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 font-extrabold border border-blue-500/40"
                          : "text-slate-700 dark:text-slate-300 hover:bg-[#DFD7D0]/50 dark:hover:bg-slate-800"
                      }`}
                      type="button"
                    >
                      <span>{day}</span>
                      {isToday && !isSelected && (
                        <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-blue-500" />
                      )}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Right: Schedule Timeline Items */}
            <div className="md:col-span-5 flex flex-col justify-center space-y-3">
              {scheduleItems.map((item) => (
                <div
                  key={item.day}
                  onClick={() => setSelectedDay(item.day)}
                  className={`p-3 rounded-full border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    item.day === selectedDay
                      ? "bg-[#EFEAE6] dark:bg-[#1F2A3E] border-[#3C324A] dark:border-amber-400 shadow-xs"
                      : "bg-[#EFEAE6]/60 dark:bg-[#1A2232]/80 border-[#D5CBC2]/60 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#DFD7D0] dark:bg-slate-800 text-[#3C324A] dark:text-white font-black text-xs flex items-center justify-center shrink-0">
                      {item.day}
                    </div>
                    <span className="text-xs font-bold text-[#3C324A] dark:text-white">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 pr-2">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ROW 3: My Projects Card */}
        <div className="p-6 rounded-[32px] bg-[#DFD7D0]/40 dark:bg-[#131A28] border border-[#D5CBC2]/70 dark:border-slate-800/80 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-[#3C324A] dark:text-slate-300 font-heading">
            My projects
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <motion.div
                key={proj.id}
                whileHover={{ y: -3 }}
                onClick={() => onTabChange("materials")}
                className="p-3 rounded-[24px] bg-[#EFEAE6]/90 dark:bg-[#1A2232] border border-[#D5CBC2]/60 dark:border-slate-800 space-y-3 cursor-pointer group shadow-xs"
              >
                <div className="w-full h-36 rounded-2xl overflow-hidden relative">
                  <img
                    src={proj.image}
                    alt={proj.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="px-2 pb-1">
                  <span className="text-xs font-bold text-[#3C324A] dark:text-white">
                    {proj.title}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT SIDEBAR STATS PANEL */}
      <div className="lg:col-span-1">
        <div className="p-6 rounded-[36px] bg-[#DFD7D0]/40 dark:bg-[#131A28] border border-[#D5CBC2]/70 dark:border-slate-800/80 space-y-6 flex flex-col justify-between min-h-full shadow-xs">
          
          <div className="space-y-6">
            
            {/* Attendance Chart */}
            <RadialGauge
              label="Attendance"
              percentage={95}
              strokeColor="#E64A85"
            />

            {/* Homework Chart */}
            <RadialGauge
              label="Homework"
              percentage={92}
              strokeColor="#14B8A6"
            />

            {/* Rating Chart */}
            <RadialGauge
              label="Rating"
              percentage={88}
              strokeColor="#F59E0B"
            />

          </div>

          <div className="pt-4 border-t border-[#D5CBC2]/50 dark:border-slate-800">
            <button
              onClick={() => onTabChange("progress")}
              className="text-xs font-bold text-[#3C324A] dark:text-amber-400 hover:underline inline-flex items-center gap-2 cursor-pointer"
              type="button"
            >
              <span>See more</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
