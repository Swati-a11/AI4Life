"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Video,
  FileText,
  Sparkles,
  Loader2,
  CheckCircle2,
  Plus,
  Clock,
  User,
  ArrowRight,
} from "lucide-react";
import { ProfessionalMeeting } from "@/lib/types/professional-types";

export function MeetingIntelligenceView() {
  const [meetings, setMeetings] = useState<ProfessionalMeeting[]>([]);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(true);
  const [transcriptInput, setTranscriptInput] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [taskCreatedToast, setTaskCreatedToast] = useState<string | null>(null);

  const fetchMeetings = async () => {
    setIsLoadingMeetings(true);
    try {
      const res = await fetch("/api/professional/meetings");
      const data = await res.json();
      if (data.success) {
        setMeetings(data.meetings || []);
      }
    } catch (err) {
      console.error("Fetch meetings error:", err);
    } finally {
      setIsLoadingMeetings(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleProcessTranscript = async () => {
    if (!transcriptInput.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      const res = await fetch("/api/professional/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: transcriptInput,
          title: meetingTitle || "Executive Sync",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMeetings((prev) => [data.meeting, ...prev]);
        setTranscriptInput("");
        setMeetingTitle("");
      }
    } catch (err) {
      console.error("Process transcript error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateTasksFromMeeting = async (meeting: ProfessionalMeeting) => {
    if (!meeting.actionItems || meeting.actionItems.length === 0) return;

    try {
      const res = await fetch("/api/professional/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: meeting.actionItems.map((item) => ({
            title: item.title,
            owner: item.owner || "Swati",
            dueDate: item.dueDate || "Upcoming",
            priority: "High",
            status: "Todo",
            description: `Action item from meeting "${meeting.title}"`,
            sourceId: meeting.id,
          })),
        }),
      });

      if (res.ok) {
        setTaskCreatedToast(`Created ${meeting.actionItems.length} tasks from "${meeting.title}"!`);
        setTimeout(() => setTaskCreatedToast(null), 4000);
      }
    } catch (e) {
      console.error("Create tasks error:", e);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#EFEAE6]/90 dark:bg-[#111722] border border-[#D5CBC2] dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
            Meeting Intelligence
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Transform meeting transcripts into concise summaries, decisions, and actionable tasks.
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {taskCreatedToast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{taskCreatedToast}</span>
        </motion.div>
      )}

      {/* Transcript Input / Upload Box */}
      <div className="p-6 rounded-3xl bg-[#EFEAE6]/90 dark:bg-[#111722] border border-[#D5CBC2] dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 dark:text-white font-heading uppercase tracking-wide">
            PROCESS NEW MEETING TRANSCRIPT
          </h3>
        </div>

        <input
          type="text"
          value={meetingTitle}
          onChange={(e) => setMeetingTitle(e.target.value)}
          placeholder="Meeting Title (e.g. Q3 Vendor Review & Roadmap Sync)"
          className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-[#151C2B] border border-[#D5CBC2] dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        <textarea
          rows={4}
          value={transcriptInput}
          onChange={(e) => setTranscriptInput(e.target.value)}
          placeholder="Paste meeting transcript text here (e.g. Swati: We need to finalize vendor B by Friday. Alex: Launch is set for Sept 15...)"
          className="w-full p-4 rounded-2xl bg-white dark:bg-[#151C2B] border border-[#D5CBC2] dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
        />

        <div className="flex justify-end">
          <button
            onClick={handleProcessTranscript}
            disabled={!transcriptInput.trim() || isProcessing}
            className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-40"
            type="button"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Process Meeting Intelligence</span>
          </button>
        </div>
      </div>

      {/* Processed Meetings List */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-900 dark:text-white font-heading uppercase tracking-wide">
          PROCESSED MEETINGS ({meetings.length})
        </h3>

        {isLoadingMeetings ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Loading meeting records...
          </div>
        ) : meetings.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs rounded-3xl border border-dashed border-[#D5CBC2] dark:border-slate-800">
            No meeting transcripts processed yet. Paste a transcript above to generate decisions and tasks.
          </div>
        ) : (
          <div className="space-y-6">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="p-6 rounded-3xl bg-[#EFEAE6]/90 dark:bg-[#111722] border border-[#D5CBC2] dark:border-slate-800 space-y-5 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D5CBC2]/60 dark:border-slate-800 pb-3">
                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white font-heading">
                      {meeting.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Date: {meeting.date}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCreateTasksFromMeeting(meeting)}
                    className="px-4 py-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer self-start sm:self-auto"
                    type="button"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Tasks</span>
                  </button>
                </div>

                {/* MEETING SUMMARY */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-black uppercase text-teal-700 dark:text-teal-400 tracking-wider">
                    MEETING SUMMARY
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {meeting.summary}
                  </p>
                </div>

                {/* DECISIONS */}
                {meeting.decisions && meeting.decisions.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-black uppercase text-purple-700 dark:text-purple-400 tracking-wider">
                      DECISIONS
                    </span>
                    <ul className="space-y-1.5">
                      {meeting.decisions.map((dec, i) => (
                        <li
                          key={i}
                          className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-start gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                          <span>{dec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* ACTION ITEMS */}
                {meeting.actionItems && meeting.actionItems.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-black uppercase text-amber-700 dark:text-amber-400 tracking-wider">
                      ACTION ITEMS
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {meeting.actionItems.map((item, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1 text-xs"
                        >
                          <h5 className="font-bold text-slate-900 dark:text-white">
                            {item.title}
                          </h5>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                            <span className="font-semibold text-teal-600 dark:text-teal-400">Owner: {item.owner}</span>
                            <span>Due: {item.dueDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
