"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Search, Trash2, Copy, Check, Eye, Edit3, X, FileText, Bot, User, Sparkles } from "lucide-react";
import { CentralSavedNote } from "@/lib/services/server-store";

export function SavedView() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "tutor" | "material" | "ai_tutor">("all");
  const [notes, setNotes] = useState<CentralSavedNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal View / Edit State
  const [viewingNote, setViewingNote] = useState<CentralSavedNote | null>(null);
  const [editingNote, setEditingNote] = useState<CentralSavedNote | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = () => {
    setIsLoading(true);
    fetch("/api/notes")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && (data.notes || data.savedNotes)) {
          setNotes(data.notes || data.savedNotes);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  const handleDeleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (viewingNote?.id === id) setViewingNote(null);
    if (editingNote?.id === id) setEditingNote(null);

    try {
      await fetch(`/api/notes/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Delete note error:", err);
    }
  };

  const handleCopyNote = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenEdit = (note: CentralSavedNote) => {
    setEditingNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const handleSaveEdit = async () => {
    if (!editingNote) return;
    try {
      const res = await fetch(`/api/notes/${editingNote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, content: editContent })
      });
      const data = await res.json();
      if (data.success && data.note) {
        setNotes((prev) => prev.map((n) => (n.id === editingNote.id ? data.note : n)));
        setEditingNote(null);
      }
    } catch (err) {
      console.error("Update note error:", err);
    }
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      (n.sourceName && n.sourceName.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === "tutor") {
      return n.sourceType === "tutor" || n.sourceType === "aarav" || n.sourceType === "riya";
    }
    if (activeFilter === "material") {
      return n.sourceType === "material";
    }
    if (activeFilter === "ai_tutor") {
      return n.sourceType === "ai_tutor";
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
          <Bookmark className="w-3.5 h-3.5 fill-current" />
          Central Saved Notes Vault
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">
          Saved Notes
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl font-medium">
          Central place for every note explicitly saved from Aarav Mehta, Riya Kapoor, AI Tutor, Ask From Materials, and Source Content Viewers.
        </p>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {(
            [
              { key: "all", label: "All Notes" },
              { key: "tutor", label: "Tutor Conversations" },
              { key: "material", label: "Materials" },
              { key: "ai_tutor", label: "AI Tutor" }
            ] as const
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === f.key
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "bg-white dark:bg-[#111722] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-amber-400"
              }`}
              type="button"
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, content, or source..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none font-medium"
          />
        </div>
      </div>

      {/* EMPTY STATE */}
      {filteredNotes.length === 0 && !isLoading ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-xs">
          <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500 w-max mx-auto">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white font-heading">
            No saved notes yet.
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Save useful explanations from your conversations and study materials to find them here later.
          </p>
        </div>
      ) : (
        /* GRID OF SAVED NOTES */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -2 }}
              className="p-5 rounded-2xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400 block tracking-wider leading-tight">
                    {item.sourceLabel || `From ${item.sourceName}`}
                  </span>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {item.createdAt}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-4 leading-relaxed whitespace-pre-wrap font-sans">
                  {item.content}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewingNote(item)}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1"
                    type="button"
                    title="View Full Note"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-[11px] font-bold">View</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1"
                    type="button"
                    title="Edit Note"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[11px] font-bold">Edit</span>
                  </button>

                  <button
                    onClick={() => handleCopyNote(item.id, item.content)}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1"
                    type="button"
                    title="Copy Content"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[11px] font-bold">{copiedId === item.id ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <button
                  onClick={() => handleDeleteNote(item.id)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                  type="button"
                  title="Delete Note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* VIEW NOTE MODAL */}
      <AnimatePresence>
        {viewingNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl relative max-h-[85vh] flex flex-col"
            >
              <button
                onClick={() => setViewingNote(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {viewingNote.sourceLabel}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{viewingNote.title}</h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans text-xs leading-relaxed border border-slate-200 dark:border-slate-800 whitespace-pre-wrap">
                {viewingNote.content}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => handleCopyNote(viewingNote.id, viewingNote.content)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 cursor-pointer flex items-center gap-1.5"
                  type="button"
                >
                  {copiedId === viewingNote.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedId === viewingNote.id ? "Copied to Clipboard" : "Copy Content"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT NOTE MODAL */}
      <AnimatePresence>
        {editingNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl relative"
            >
              <button
                onClick={() => setEditingNote(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">Edit Saved Note</h3>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Content</label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={6}
                    className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setEditingNote(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 shadow-xs cursor-pointer"
                  type="button"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
