import { NextRequest, NextResponse } from "next/server";
import { serverState, StoredDocument } from "@/lib/services/server-store";
import { YouTubeService } from "@/lib/services/youtube-service";
import { AuthService } from "@/lib/services/auth-service";
import { PdfService } from "@/lib/services/pdf-service";
import { DocxService } from "@/lib/services/docx-service";

export async function POST(req: NextRequest) {
  try {
    const userId = await AuthService.getUserIdFromRequest(req);
    const contentType = req.headers.get("content-type") || "";

    // 1. Process YouTube URL request (JSON body)
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { youtubeUrl } = body;

      if (!youtubeUrl || typeof youtubeUrl !== "string") {
        return NextResponse.json({
          success: false,
          errorCode: "INVALID_URL",
          error: "Please provide a valid YouTube video URL."
        }, { status: 200 });
      }

      console.log("[Material Processing]", {
        sourceType: "youtube",
        youtubeUrl,
        userId,
        processingStep: "Extracting YouTube Transcript"
      });

      const result = await YouTubeService.extractTranscript(youtubeUrl);
      if (!result.success || !result.chunks) {
        return NextResponse.json({
          success: false,
          errorCode: result.errorCode || "TRANSCRIPT_UNAVAILABLE",
          error: result.error || "Transcript is unavailable for this YouTube video. You can upload the video/audio file directly if you have permission to do so."
        }, { status: 200 });
      }

      const newDoc: StoredDocument = {
        id: `yt_doc_${result.videoId}_${Date.now()}`,
        title: `YouTube: ${result.title}`,
        sourceType: "youtube",
        sizeMb: 0.8,
        uploadedAt: new Date().toISOString().split("T")[0],
        processingStatus: "ready",
        transcriptionStatus: "completed",
        userId,
        workspaceId: "student_default",
        chunks: result.chunks
      };

      serverState.addDocument(newDoc);

      return NextResponse.json({
        success: true,
        document: {
          id: newDoc.id,
          title: newDoc.title,
          sourceType: newDoc.sourceType,
          sizeMb: newDoc.sizeMb,
          uploadedAt: newDoc.uploadedAt,
          status: newDoc.processingStatus,
          chunksGenerated: newDoc.chunks.length
        }
      });
    }

    // 2. Process Multimodal File Upload (PDF, DOCX, TXT, MP4, MOV, SVG via FormData)
    const formData = await req.formData();
    const file = (formData.get("file") || formData.get("document") || formData.get("media")) as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({
        success: false,
        error: "No valid file received. Please select a document or video file to upload."
      }, { status: 200 });
    }

    // Size validation: max 100MB for video/docs
    const maxSizeBytes = 100 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json({
        success: false,
        error: "This video is too large. Please upload a video under 100 MB."
      }, { status: 200 });
    }

    const sizeMb = Number((file.size / (1024 * 1024)).toFixed(1));
    const title = file.name || "Uploaded_Material";
    const lowerName = title.toLowerCase();

    let sourceType: "pdf" | "docx" | "txt" | "mp4" | "svg" = "pdf";
    if (lowerName.endsWith(".txt")) sourceType = "txt";
    else if (
      lowerName.endsWith(".docx") ||
      lowerName.endsWith(".doc") ||
      file.type.includes("word") ||
      file.type.includes("officedocument")
    ) {
      sourceType = "docx";
    }
    else if (
      lowerName.endsWith(".mp4") ||
      lowerName.endsWith(".mov") ||
      lowerName.endsWith(".m4v") ||
      lowerName.endsWith(".webm") ||
      lowerName.endsWith(".mkv") ||
      file.type.startsWith("video/") ||
      file.type.includes("quicktime")
    ) {
      sourceType = "mp4";
    }
    else if (lowerName.endsWith(".svg")) sourceType = "svg";

    console.log("[Material Processing]", {
      sourceType,
      fileName: title,
      fileSize: file.size,
      mimeType: file.type,
      userId,
      processingStep: "Parsing upload file buffer"
    });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let chunks: { id: string; text: string; page?: number }[] = [];
    let processingStatus: "ready" | "failed" = "ready";
    let transcriptionStatus: "pending" | "completed" | "no_audio" | "failed" | undefined = undefined;
    let error: string | undefined = undefined;

    // Parse PDF Document: Server-Side PDF Stream Decompressor
    if (sourceType === "pdf" || file.type === "application/pdf") {
      const pdfParsed = PdfService.extractTextFromPdfBuffer(buffer);

      if (pdfParsed.success && pdfParsed.pages.length > 0) {
        processingStatus = "ready";
        chunks = pdfParsed.pages.map((p) => ({
          id: `pdf_c_${Date.now()}_${p.page}`,
          text: `Page ${p.page}\n\n${p.text}`,
          page: p.page
        }));
      } else {
        processingStatus = "failed";
        error = pdfParsed.error || "This PDF appears to contain scanned pages. Text extraction is unavailable for this file.";
        chunks = [
          {
            id: `pdf_c_fail_${Date.now()}`,
            text: "This PDF appears to contain scanned pages. Text extraction is unavailable for this file.",
            page: 1
          }
        ];
      }
    }
    // Parse DOCX Document: Dedicated XML ZIP Entry Parser
    else if (sourceType === "docx") {
      const docxResult = DocxService.extractTextFromDocxBuffer(buffer);
      if (docxResult.success && docxResult.text.length > 0) {
        processingStatus = "ready";
        const normalizedDocxText = PdfService.normalizeExtractedText(docxResult.text);
        const rawChunks = normalizedDocxText.split("\n\n").filter((t) => t.trim().length > 5);
        chunks =
          rawChunks.length > 0
            ? rawChunks.map((chunkText, idx) => ({
                id: `docx_c_${Date.now()}_${idx}`,
                text: chunkText.trim(),
                page: Math.floor(idx / 3) + 1
              }))
            : [
                {
                  id: `docx_c_${Date.now()}_1`,
                  text: normalizedDocxText.trim(),
                  page: 1
                }
              ];
      } else {
        processingStatus = "failed";
        error = "Could not extract readable content from this DOCX file.";
        chunks = [
          {
            id: `docx_c_fail_${Date.now()}`,
            text: "Could not extract readable content from this DOCX file.",
            page: 1
          }
        ];
      }
    }
    // Parse SVG: sanitize and extract textual labels
    else if (sourceType === "svg") {
      const textContent = buffer.toString("utf-8");
      const sanitizedSvg = textContent.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
      const matches = Array.from(sanitizedSvg.matchAll(/<(?:text|title|desc|tspan)[^>]*>([^<]+)<\/(?:text|title|desc|tspan)>/gi));
      const extractedLabels = matches.map((m) => m[1].trim()).filter((t) => t.length > 0);

      chunks = [
        {
          id: `svg_c_${Date.now()}_1`,
          text: `SVG Diagram Title: ${title}. Extracted Diagram Labels: ${extractedLabels.length > 0 ? extractedLabels.join(", ") : "Structural SVG vector diagram components."}`,
          page: 1
        }
      ];
    }
    // Parse MP4/MOV Video: Real Speech-to-Text Transcription & Audio Stream Status
    else if (sourceType === "mp4") {
      const apiKey = process.env.GEMINI_API_KEY;
      let transcribedSpeech = "";

      console.log("[Material Processing] Audio Stream Probe", {
        fileName: title,
        sizeBytes: file.size,
        mimeType: file.type,
        detectedFormat: lowerName.endsWith(".mov") ? "QuickTime MOV" : "MP4 Video"
      });

      if (apiKey && buffer && buffer.length > 0) {
        try {
          const mimeType = file.type || (lowerName.endsWith(".mov") ? "video/quicktime" : "video/mp4");
          const base64Data = buffer.toString("base64");

          const prompt = "Extract and transcribe the spoken audio in this video file accurately word for word. Output ONLY the clean verbatim speech transcript of what is spoken in the video. Do not add summaries, intro, or commentary. If no speech is spoken, return 'NO_SPEECH_DETECTED'.";

          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { text: prompt },
                      { inlineData: { mimeType, data: base64Data } }
                    ]
                  }
                ]
              })
            }
          );

          if (res.ok) {
            const resData = await res.json();
            const text = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text && text.trim().length > 0) {
              transcribedSpeech = text.trim();
            }
          }
        } catch (e) {
          console.warn("[Material Processing] Gemini video transcription error:", e);
        }
      }

      if (transcribedSpeech && !transcribedSpeech.includes("NO_SPEECH_DETECTED") && !transcribedSpeech.toLowerCase().includes("no readable speech")) {
        processingStatus = "ready";
        transcriptionStatus = "completed";
        const rawParagraphs = transcribedSpeech.split("\n\n").filter((p) => p.trim().length > 5);
        chunks =
          rawParagraphs.length > 0
            ? rawParagraphs.map((para, idx) => ({
                id: `mp4_c_${Date.now()}_${idx}`,
                text: para.trim(),
                page: idx + 1
              }))
            : [
                {
                  id: `mp4_c_${Date.now()}_1`,
                  text: transcribedSpeech,
                  page: 1
                }
              ];
      } else if (transcribedSpeech.includes("NO_SPEECH_DETECTED")) {
        processingStatus = "failed";
        transcriptionStatus = "no_audio";
        error = "No spoken audio was detected in this video.";
        chunks = [
          {
            id: `mp4_c_no_audio_${Date.now()}`,
            text: "No spoken audio was detected in this video.",
            page: 1
          }
        ];
      } else {
        processingStatus = "failed";
        transcriptionStatus = "failed";
        error = "I couldn't extract spoken content from this video, so I can't reliably answer what was said.";
        chunks = [
          {
            id: `mp4_c_fail_${Date.now()}`,
            text: "I couldn't extract spoken content from this video, so I can't reliably answer what was said.",
            page: 1
          }
        ];
      }
    }
    // Parse Plain TXT document
    else {
      const textContent = PdfService.normalizeExtractedText(buffer.toString("utf-8"));
      const rawChunks = textContent.split("\n\n").filter((t) => t.trim().length > 5);
      chunks =
        rawChunks.length > 0
          ? rawChunks.map((chunkText, idx) => ({
              id: `c_${Date.now()}_${idx}`,
              text: chunkText.trim(),
              page: Math.floor(idx / 3) + 1
            }))
          : [
              {
                id: `c_${Date.now()}_1`,
                text: textContent.trim() || "No text content found in file.",
                page: 1
              }
            ];
    }

    const newDoc: StoredDocument = {
      id: `doc_${Date.now()}`,
      title,
      sourceType,
      sizeMb: sizeMb || 1.5,
      uploadedAt: new Date().toISOString().split("T")[0],
      processingStatus,
      transcriptionStatus,
      userId,
      workspaceId: "student_default",
      chunks,
      error
    };

    serverState.addDocument(newDoc);

    return NextResponse.json({
      success: true,
      document: {
        id: newDoc.id,
        title: newDoc.title,
        sourceType: newDoc.sourceType,
        sizeMb: newDoc.sizeMb,
        uploadedAt: newDoc.uploadedAt,
        status: newDoc.processingStatus,
        transcriptionStatus: newDoc.transcriptionStatus,
        chunksGenerated: newDoc.chunks.length,
        error: newDoc.error
      }
    });
  } catch (error) {
    console.error("Error in /api/upload route:", error);
    return NextResponse.json(
      { success: false, error: "Couldn't process this source file. Please ensure it is a valid PDF, DOCX, TXT, MP4, MOV, SVG, or YouTube URL." },
      { status: 200 }
    );
  }
}

export async function GET(req: NextRequest) {
  const userId = await AuthService.getUserIdFromRequest(req);
  const rawDocs = serverState.getDocuments(userId);

  // Self-heal any stored doc containing raw PDF bytes
  const sanitizedDocs = rawDocs.map((doc) => ({
    ...doc,
    chunks: PdfService.sanitizeOrRecoverDocumentChunks(doc.chunks, doc.title)
  }));

  return NextResponse.json({ success: true, documents: sanitizedDocs });
}
