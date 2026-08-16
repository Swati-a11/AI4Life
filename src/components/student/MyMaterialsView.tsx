"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Upload,
  Search,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCode,
  ArrowRight
} from "lucide-react";
import { StudyMaterial, StudentTab } from "@/lib/types/student-types";

interface MyMaterialsViewProps {
  onTabChange: (tab: StudentTab) => void;
}

export function MyMaterialsView({ onTabChange }: MyMaterialsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [isUploading, setIsUploading] = useState(false);

  const [materials, setMaterials] = useState<StudyMaterial[]>([
    {
      id: "mat_1",
      title: "Data_Structures_Chapter3.pdf",
      subject: "Computer Science",
      fileType: "pdf",
      sizeMb: 4.2,
      uploadedAt: "2026-08-12",
      status: "Ready",
      chunksCount: 48,
      qdrantCollectionRef: "qdrant_ds_ch3"
    },
    {
      id: "mat_2",
      title: "Algorithms_Lecture_Notes.docx",
      subject: "Software Engineering",
      fileType: "docx",
      sizeMb: 1.8,
      uploadedAt: "2026-08-11",
      status: "Ready",
      chunksCount: 22,
      qdrantCollectionRef: "qdrant_algo_notes"
    },
    {
      id: "mat_3",
      title: "OS_Lecture_5_Notes.note",
      subject: "Operating Systems",
      fileType: "note",
      sizeMb: 0.5,
      uploadedAt: "2026-08-13",
      status: "Ready",
      chunksCount: 10,
      qdrantCollectionRef: "qdrant_os_notes"
    },
    {
      id: "mat_4",
      title: "Linear_Algebra_Formulas.pdf",
      subject: "Mathematics",
      fileType: "pdf",
      sizeMb: 3.1,
      uploadedAt: "Just now",
      status: "Processing",
      chunksCount: 0,
      qdrantCollectionRef: "qdrant_math_formulas"
    }
  ]);

  const [uploadStatusText, setUploadStatusText] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadStatusText("File exceeds maximum size of 10MB.");
      setTimeout(() => setUploadStatusText(null), 4000);
      return;
    }

    setIsUploading(true);
    setUploadStatusText("Uploading...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      setUploadStatusText("Processing...");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (data.success && data.document) {
        const newMat: StudyMaterial = {
          id: data.document.id,
          title: data.document.title,
          subject: "Computer Science",
          fileType: data.document.title.endsWith(".pdf") ? "pdf" : "docx",
          sizeMb: data.document.sizeMb,
          uploadedAt: "Just now",
          status: "Ready",
          chunksCount: data.document.chunksGenerated,
          qdrantCollectionRef: `qdrant_${data.document.id}`
        };
        setMaterials((prev) => [newMat, ...prev]);
        setUploadStatusText("Ready");
      } else {
        setUploadStatusText(data.error || "Couldn't process this file.");
      }
    } catch (err) {
      console.error("Upload API error:", err);
      setUploadStatusText("Couldn't process this file.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadStatusText(null), 4000);
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
            Manage your PDFs, DOCX files, and study notes indexed into Qdrant vector storage.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <label className="px-5 py-3 rounded-2xl bg-[#3157D5] dark:bg-[#4F8CFF] text-white font-bold text-xs hover:bg-[#2848b8] transition-colors flex items-center gap-2 shadow-md cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>{isUploading ? (uploadStatusText || "Processing...") : "Upload New File"}</span>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
          {uploadStatusText && (
            <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400">
              {uploadStatusText}
            </span>
          )}
        </div>
      </div>

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

      {/* Materials Grid */}
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
                  <FileText className="w-5 h-5" />
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
                onClick={() => onTabChange("ask-notes")}
                className="text-xs font-bold text-[#3157D5] dark:text-[#4F8CFF] hover:underline flex items-center gap-1"
                type="button"
              >
                <span>Ask from file</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                onClick={() => handleDelete(mat.id)}
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10"
                type="button"
                aria-label="Delete material"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
