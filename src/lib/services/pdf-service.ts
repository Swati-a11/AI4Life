export interface ParsedPdfResult {
  success: boolean;
  fullText: string;
  pages: { page: number; text: string }[];
  error?: string;
}

export class PdfService {
  // Central Safety Shield: Check if string contains raw PDF internal symbols or DOCX ZIP container headers
  public static containsRawPdfBytes(text: string): boolean {
    if (!text) return false;
    return (
      text.includes("%PDF-") ||
      text.includes("FlateDecode") ||
      text.includes("endstream") ||
      text.includes("startxref") ||
      text.includes("3 0 obj") ||
      text.includes("4 0 obj") ||
      text.includes("PK\x03\x04") ||
      text.includes("docProps/") ||
      text.includes("word/document.xml") ||
      text.includes("app.xml") ||
      /<<\s*\/Type\s*\/Page/i.test(text) ||
      /\bobj\b[\s\S]*?\bstream\b/.test(text)
    );
  }

  // Check if text is garbled/unreadable binary symbols (e.g. font encoding failure)
  public static isGarbledText(text: string): boolean {
    if (!text || text.length < 15) return false;
    const readableCount = (text.match(/[A-Za-z0-9\s.,;:'"!\?\-()\[\]{}\/]/g) || []).length;
    const ratio = readableCount / text.length;
    return ratio < 0.55;
  }

  // Central text normalization function (preserves headings, paragraphs, lists, page separation)
  public static normalizeExtractedText(text: string): string {
    if (!text) return "";
    return text
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "")
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
  }

  // Robust PDF text extraction using clean pdf-parse core library
  public static async extractTextFromPdfBufferAsync(buffer: Buffer): Promise<ParsedPdfResult> {
    try {
      if (!buffer || buffer.length === 0) {
        return {
          success: false,
          fullText: "Could not extract readable content from this PDF.",
          pages: [],
          error: "Empty file buffer."
        };
      }

      // Verify PDF signature
      const headerStr = buffer.subarray(0, 10).toString("latin1");
      if (!headerStr.includes("%PDF")) {
        return {
          success: false,
          fullText: "Could not extract readable content from this PDF.",
          pages: [],
          error: "Invalid PDF signature."
        };
      }

      // Dynamically load clean pdf-parse core module without top-level test runner side effects
      let pdfParseCore: any = null;
      try {
        pdfParseCore = require("pdf-parse/lib/pdf-parse.js");
      } catch (e) {
        console.warn("[PdfService] Error requiring pdf-parse core module:", e);
      }

      if (!pdfParseCore) {
        return {
          success: false,
          fullText: "No selectable text was found in this PDF. OCR is required for scanned/image-only PDFs.",
          pages: [],
          error: "PDF parser unavailable."
        };
      }

      const pages: { page: number; text: string }[] = [];
      let pageCounter = 1;

      const res = await pdfParseCore(buffer, {
        pagerender: async (pageData: any) => {
          try {
            const textContent = await pageData.getTextContent();
            let lastY: number | null = null;
            let pageStr = "";
            for (const item of textContent.items) {
              if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
                pageStr += "\n";
              }
              pageStr += item.str + " ";
              lastY = item.transform[5];
            }
            const cleanStr = PdfService.normalizeExtractedText(pageStr);
            if (
              cleanStr.length > 0 &&
              !PdfService.containsRawPdfBytes(cleanStr) &&
              !PdfService.isGarbledText(cleanStr)
            ) {
              pages.push({
                page: pageCounter++,
                text: cleanStr
              });
            }
            return pageStr;
          } catch (e) {
            return "";
          }
        }
      });

      // Fallback to res.text if page extraction callback yielded empty
      if (pages.length === 0 && res && res.text) {
        const cleanFull = this.normalizeExtractedText(
          res.text.replace(/--\s*\d+\s*of\s*\d+\s*--/gi, "")
        );
        if (
          cleanFull.length > 5 &&
          !this.containsRawPdfBytes(cleanFull) &&
          !this.isGarbledText(cleanFull)
        ) {
          const rawParagraphs = cleanFull.split("\n\n").filter((p) => p.trim().length > 0);
          rawParagraphs.forEach((pText, idx) => {
            pages.push({
              page: Math.floor(idx / 3) + 1,
              text: pText
            });
          });
        }
      }

      // Scanned / Image-only PDF or custom unreadable font encoding detection
      if (pages.length === 0) {
        return {
          success: false,
          fullText: "No selectable text was found in this PDF. OCR is required for scanned/image-only PDFs.",
          pages: [],
          error: "No selectable text was found in this PDF. OCR is required for scanned/image-only PDFs."
        };
      }

      const fullText = pages.map((p) => `Page ${p.page}\n\n${p.text}`).join("\n\n---\n\n");

      return {
        success: true,
        fullText,
        pages
      };
    } catch (err) {
      console.error("Error in PdfService.extractTextFromPdfBufferAsync:", err);
      return {
        success: false,
        fullText: "Could not extract readable content from this PDF.",
        pages: [],
        error: "Could not extract readable content from this PDF."
      };
    }
  }

  // Synchronous fallback
  public static extractTextFromPdfBuffer(buffer: Buffer): ParsedPdfResult {
    return {
      success: false,
      fullText: "No selectable text was found in this PDF. OCR is required for scanned/image-only PDFs.",
      pages: [],
      error: "Use extractTextFromPdfBufferAsync."
    };
  }

  // Self-heal and sanitize pre-existing stored document chunks
  public static sanitizeOrRecoverDocumentChunks(
    chunks: { id: string; text: string; page?: number }[],
    title: string
  ): { id: string; text: string; page?: number }[] {
    if (!chunks || chunks.length === 0) {
      return [
        {
          id: `clean_c_1`,
          text: `Could not extract readable content from this source file.`,
          page: 1
        }
      ];
    }

    const hasBadBinary = chunks.some((c) => this.containsRawPdfBytes(c.text) || this.isGarbledText(c.text));
    if (!hasBadBinary) {
      return chunks;
    }

    // Clean out raw binary chunks
    const cleanedChunks = chunks
      .map((c) => {
        if (this.containsRawPdfBytes(c.text) || this.isGarbledText(c.text)) {
          const asciiOnly = this.normalizeExtractedText(
            c.text
              .replace(/%PDF[\s\S]*?endstream/g, "")
              .replace(/PK[\s\S]*?docProps/g, "")
              .replace(/[^\x20-\x7E\n]/g, " ")
          );

          if (asciiOnly.length > 15 && !this.containsRawPdfBytes(asciiOnly) && !this.isGarbledText(asciiOnly)) {
            return { ...c, text: asciiOnly };
          }
          return null;
        }
        return c;
      })
      .filter((c): c is { id: string; text: string; page?: number } => c !== null);

    if (cleanedChunks.length > 0) {
      return cleanedChunks;
    }

    return [
      {
        id: `clean_c_failed`,
        text: `No selectable text was found in this PDF. OCR is required for scanned/image-only PDFs.`,
        page: 1
      }
    ];
  }
}
