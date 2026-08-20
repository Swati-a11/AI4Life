"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  Search,
  Trash2,
  CheckCircle2,
  Clock,
  Video,
  FileCode,
  ArrowRight,
  Plus,
  Eye,
  X,
  Sparkles,
  Layers,
  AlertTriangle,
  Bookmark
} from "lucide-react";
import { StudyMaterial, StudentTab } from "@/lib/types/student-types";
import { getOrCreateLocalUserId } from "@/lib/utils/user-id-utils";

interface MyMaterialsViewProps {
  onTabChange: (tab: StudentTab) => void;
}

export function MyMaterialsView({ onTabChange }: MyMaterialsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [isUploading, setIsUploading] = useState(false);
  const [youtubeUrlInput, setYoutubeUrlInput] = useState("");
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadStatusText, setUploadStatusText] = useState<string | null>(null);

  // Active Source Viewer Modal State
  const [viewingMaterial, setViewingMaterial] = useState<{
    id: string;
    title: string;
    sourceType: string;
    sizeMb: number;
    extractedText: string;
    chunks?: any[];
  } | null>(null);
  const [isFetchingSource, setIsFetchingSource] = useState(false);

  const fetchMaterials = () => {
    setIsLoading(true);
    const userId = getOrCreateLocalUserId();
    fetch("/api/upload", {
      headers: { "x-user-id": userId }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.documents) {
          const mapped: StudyMaterial[] = data.documents.map((d: any) => ({
            id: d.id,
            title: d.title,
            subject: d.sourceType === "youtube" ? "Operating Systems" : "Computer Science",
            fileType: d.sourceType || "pdf",
            sizeMb: d.sizeMb || 1.2,
            uploadedAt: d.uploadedAt || "Recently",
            status: d.processingStatus === "ready" ? "Ready" : "Processing",
            chunksCount: d.chunks ? d.chunks.length : 0,
            qdrantCollectionRef: `qdrant_${d.id}`
          }));
          setMaterials(mapped);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      setUploadStatusText("This video is too large. Please upload a video under 100 MB.");
      setTimeout(() => setUploadStatusText(null), 5000);
      return;
    }

    setIsUploading(true);
    setUploadStatusText("Uploading & Processing...");

    try {
      const userId = getOrCreateLocalUserId();
      const formData = new FormData();
      formData.append("file", file);

      setUploadStatusText("Processing text/audio...");
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "x-user-id": userId },
        body: formData
      });

      const contentType = res.headers.get("content-type") || "";
      let data: any = null;

      if (contentType.includes("application/json")) {
        data = await res.json().catch(() => null);
      } else {
        const text = await res.text().catch(() => "");
        data = { success: false, error: text || `Upload failed with status ${res.status}` };
      }

      if (data && data.success && data.document) {
        setUploadStatusText("Content Ready");
        fetchMaterials();
      } else {
        setUploadStatusText(data?.error || "Couldn't process this file.");
      }
    } catch (err: any) {
      console.error("Upload API error:", err);
      setUploadStatusText(err?.message || "Could not extract readable content from this source.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadStatusText(null), 5000);
    }
  };

  const handleYoutubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrlInput.trim()) return;

    setIsUploading(true);
    setUploadStatusText("Extracting YouTube Transcript...");

    try {
      const userId = getOrCreateLocalUserId();
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": userId 
        },
        body: JSON.stringify({ youtubeUrl: youtubeUrlInput })
      });

      const contentType = res.headers.get("content-type") || "";
      let data: any = null;

      if (contentType.includes("application/json")) {
        data = await res.json().catch(() => null);
      } else {
        const text = await res.text().catch(() => "");
        data = { success: false, error: text || `Transcript extraction failed with status ${res.status}` };
      }

      if (data && data.success && data.document) {
        setUploadStatusText("Transcript Ready");
        setYoutubeUrlInput("");
        setShowYoutubeInput(false);
        fetchMaterials();
      } else {
        setUploadStatusText(data?.error || "Transcript is unavailable for this YouTube video. Please upload the video/audio file directly if you have permission to do so.");
      }
    } catch (err: any) {
      console.error("YouTube extraction error:", err);
      setUploadStatusText(err?.message || "Transcript is unavailable for this YouTube video. Please upload the video/audio file directly if you have permission to do so.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadStatusText(null), 6000);
    }
  };

  const handleOpenSourceViewer = async (id: string) => {
    setIsFetchingSource(true);
    try {
      const userId = getOrCreateLocalUserId();
      const res = await fetch(`/api/materials/${id}`, {
        headers: { "x-user-id": userId }
      });
      const data = await res.json();
      if (data.success && data.material) {
        setViewingMaterial(data.material);
      } else {
        alert(data.error || "Could not extract readable content from this source.");
      }
    } catch (err) {
      console.error("Source viewer error:", err);
      alert("Could not retrieve material content.");
    } finally {
      setIsFetchingSource(false);
    }
  };

  const handleDelete = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const filteredMaterials = materials.filter((item) => {
    const matchesQuery = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "all" || item.subject === selectedSubject;
    return matchesQuery && matchesSubject;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
            My Study Materials
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Manage your PDFs, TXT, YouTube transcripts, MP4/MOV lectures, and SVG diagrams indexed into vector storage.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowYoutubeInput(!showYoutubeInput)}
              className="px-4 py-3 rounded-2xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors flex items-center gap-2 shadow-md cursor-pointer"
              type="button"
            >
              <Video className="w-4 h-4" />
              <span>YouTube Video</span>
            </button>

            <label className="px-5 py-3 rounded-2xl bg-[#3157D5] dark:bg-[#4F8CFF] text-white font-bold text-xs hover:bg-[#2848b8] transition-colors flex items-center gap-2 shadow-md cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>{isUploading ? (uploadStatusText || "Processing...") : "Upload File (PDF/TXT/MP4/MOV/SVG)"}</span>
              <input
                type="file"
                accept=".pdf,.docx,.txt,.mp4,.mov,.m4v,.webm,.mkv,.svg,video/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>

          {uploadStatusText && (
            <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400">
              {uploadStatusText}
            </span>
          )}
        </div>
      </div>

      {/* YouTube URL Drawer Input */}
      {showYoutubeInput && (
        <form onSubmit={handleYoutubeSubmit} className="p-4 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
          <Video className="w-5 h-5 text-red-600 shrink-0" />
          <input
            type="text"
            value={youtubeUrlInput}
            onChange={(e) => setYoutubeUrlInput(e.target.value)}
            placeholder="Paste YouTube Video URL (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)"
            className="flex-1 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={isUploading || !youtubeUrlInput.trim()}
            className="px-5 py-2.5 rounded-2xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 disabled:opacity-50 cursor-pointer"
          >
            Extract Transcript
          </button>
        </form>
      )}

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search study materials by name..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full sm:w-48 px-4 py-3 rounded-2xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
        >
          <option value="all">All Subjects</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Software Engineering">Software Engineering</option>
          <option value="Operating Systems">Operating Systems</option>
          <option value="Mathematics">Mathematics</option>
        </select>
      </div>

      {/* Materials Grid / Empty State */}
      {filteredMaterials.length === 0 && !isLoading ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <FileText className="w-8 h-8 text-blue-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">You haven't added any material yet.</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload your first PDF, DOCX, TXT, MP4, MOV, or YouTube link above to start querying with AI.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredMaterials.map((mat) => (
            <motion.div
              key={mat.id}
              whileHover={{ y: -3 }}
              className="p-5 rounded-2xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-blue-600 dark:text-sky-400">
                    {mat.title.startsWith("YouTube:") || mat.title.endsWith(".mp4") || mat.title.endsWith(".mov") ? (
                      <Video className="w-5 h-5 text-red-500" />
                    ) : mat.title.endsWith(".svg") ? (
                      <FileCode className="w-5 h-5 text-purple-500" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                  </div>
                  
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    mat.status === "Ready"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  }`}>
                    {mat.status === "Ready" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3 animate-spin" />}
                    {mat.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{mat.title}</h3>
                  <span className="text-xs text-slate-500 font-medium">{mat.subject}</span>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1">
                  <div className="flex justify-between"><span>Size:</span> <span>{mat.sizeMb} MB</span></div>
                  <div className="flex justify-between"><span>Vectors:</span> <span>{mat.chunksCount} chunks</span></div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleOpenSourceViewer(mat.id)}
                  className="text-xs font-bold text-[#3157D5] dark:text-[#4F8CFF] hover:underline flex items-center gap-1 cursor-pointer"
                  type="button"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ask from source</span>
                </button>

                <button
                  onClick={() => handleDelete(mat.id)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                  type="button"
                  aria-label="Delete material"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Source Content Viewer Modal */}
      <AnimatePresence>
        {viewingMaterial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl relative max-h-[85vh] flex flex-col"
            >
              <button
                onClick={() => setViewingMaterial(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {viewingMaterial.sourceType.toUpperCase()} SOURCE CONTENT
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{viewingMaterial.title}</h3>
              </div>

              {/* Source Extracted Content Container */}
              <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-800 font-sans">
                  <span>Extracted Readable Content</span>
                  <span>{viewingMaterial.sizeMb} MB</span>
                </div>
                <div className="whitespace-pre-wrap">{viewingMaterial.extractedText}</div>
              </div>

              {/* AI Actions Footer */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setViewingMaterial(null);
                      onTabChange("ask-notes");
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#3157D5] dark:bg-[#4F8CFF] text-white font-bold text-xs hover:bg-[#2848b8] flex items-center gap-2 cursor-pointer"
                    type="button"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask AI about this material</span>
                  </button>

                  <button
                    onClick={async () => {
                      if (!viewingMaterial) return;
                      try {
                        const res = await fetch("/api/notes", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            title: viewingMaterial.title,
                            content: viewingMaterial.extractedText,
                            sourceType: "material",
                            sourceName: viewingMaterial.title,
                            materialId: viewingMaterial.id
                          })
                        });
                        const data = await res.json();
                        if (data.success) alert("Note saved.");
                      } catch (err) {
                        console.error("Save note error:", err);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold text-xs hover:bg-amber-500/20 flex items-center gap-1.5 cursor-pointer"
                    type="button"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Save Note</span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-500">Indexed for vector RAG queries</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
