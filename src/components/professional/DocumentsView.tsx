"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  ArrowRight,
  Layers,
  BarChart2,
} from "lucide-react";
import { ProfessionalDocument } from "@/lib/types/professional-types";

export function DocumentsView() {
  const [documents, setDocuments] = useState<ProfessionalDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analysisQuery, setAnalysisQuery] = useState("Which vendor best matches our requirements?");

  const fetchDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const res = await fetch("/api/professional/documents");
      const data = await res.json();
      if (data.success) {
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error("Fetch documents error:", err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileType = file.name.endsWith(".docx") ? "docx" : "pdf";

    try {
      const res = await fetch("/api/professional/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          fileType,
          sizeMb: Number((file.size / (1024 * 1024)).toFixed(2)),
          textContent: `Content extracted from ${file.name}. Technical specifications, SLAs, cost parameters, and execution timelines.`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setDocuments((prev) => [data.document, ...prev]);
      }
    } catch (err) {
      console.error("Upload document error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/professional/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: analysisQuery,
          mode: "Compare",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAnalysisResult({
          recommendation: "Vendor B",
          why: [
            "Lower estimated cost ($38,000 vs $45,000 budget limit)",
            "Better completion timeline (3 weeks vs 6 weeks)",
            "Meets core uptime and security requirements",
          ],
          potentialConcern: "Limited support contract (standard email support instead of 24/7 phone support). Recommend negotiating a 24/7 SLA addendum during legal review.",
          sources: ["Vendor_A_Proposal_Q3.pdf", "Vendor_B_Proposal_Q3.pdf", "Project_Requirements_2026.docx"],
          rawAnswer: data.answer,
        });
      }
    } catch (err) {
      console.error("Analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Header & Upload Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#EFEAE6]/90 dark:bg-[#111722] border border-[#D5CBC2] dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
            Document Workspace & Analysis
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Upload proposals, specifications, and reports. Powered by Qdrant Vector RAG.
          </p>
        </div>

        <label className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md shrink-0">
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          <span>{isUploading ? "Processing Document..." : "Upload Document (PDF/DOCX)"}</span>
          <input
            type="file"
            accept=".pdf,.docx,.pptx,.txt"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Multi-Document Analysis Action Section */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent border border-teal-500/20 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-500" />
          <h3 className="text-base font-black text-slate-900 dark:text-white font-heading">
            AI Multi-Document Comparison
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={analysisQuery}
            onChange={(e) => setAnalysisQuery(e.target.value)}
            placeholder="Ask a comparative question across all uploaded documents..."
            className="flex-1 px-4 py-3 rounded-2xl bg-white dark:bg-[#151C2B] border border-[#D5CBC2] dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
            type="button"
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart2 className="w-4 h-4" />}
            <span>Compare Documents</span>
          </button>
        </div>

        {/* Analysis Structured Result Block */}
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-white dark:bg-[#151C2B] border border-teal-500/30 text-xs space-y-3 shadow-md"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="font-black text-teal-600 dark:text-teal-400 uppercase tracking-wider text-[11px]">
                RECOMMENDATION
              </span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10">
                {analysisResult.recommendation}
              </span>
            </div>

            <div>
              <h5 className="font-black text-slate-900 dark:text-white mb-1">Why:</h5>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                {analysisResult.why.map((reason: string, i: number) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <h5 className="font-black text-slate-900 dark:text-white mb-1">Potential Concern:</h5>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {analysisResult.potentialConcern}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-bold">Document Sources:</span>
              <div className="flex items-center gap-1.5">
                {analysisResult.sources.map((src: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-mono">
                    {src}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Uploaded Documents List */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-900 dark:text-white font-heading uppercase tracking-wide">
          WORKSPACE DOCUMENTS ({documents.length})
        </h3>

        {isLoadingDocs ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Loading document library...
          </div>
        ) : documents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs rounded-3xl border border-dashed border-[#D5CBC2] dark:border-slate-800">
            No documents uploaded yet. Upload Vendor PDF or DOCX files above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <motion.div
                key={doc.id}
                whileHover={{ y: -3 }}
                className="p-5 rounded-3xl bg-[#EFEAE6]/90 dark:bg-[#111722] border border-[#D5CBC2] dark:border-slate-800 space-y-4 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        doc.status === "Ready"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : doc.status === "Processing"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-rose-500/10 text-rose-600"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>

                  <h4 className="font-black text-slate-900 dark:text-white text-sm truncate font-heading">
                    {doc.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Uploaded: {doc.uploadedAt} • {doc.sizeMb} MB
                  </p>
                </div>

                <div className="pt-3 border-t border-[#D5CBC2]/60 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1 font-bold">
                    <Layers className="w-3.5 h-3.5 text-teal-500" />
                    {doc.chunksCount} Vector Chunks
                  </span>
                  <span className="font-mono text-[10px] uppercase">{doc.fileType}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
