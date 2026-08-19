import zlib from "zlib";

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

  // Synchronous/Async PDF text extraction using robust pdf-parse library with native stream fallback
  public static async extractTextFromPdfBufferAsync(buffer: Buffer): Promise<ParsedPdfResult> {
    try {
      // 1. Try robust pdf-parse library first
      let pdfParse: any = null;
      try {
        pdfParse = require("pdf-parse");
      } catch (e) {
        // Module load fallback
      }

      if (pdfParse) {
        try {
          const fn = typeof pdfParse === "function" ? pdfParse : pdfParse.default || pdfParse;
          if (typeof fn === "function") {
            const pageTexts: { page: number; text: string }[] = [];
            let currentPage = 1;

            const data = await fn(buffer, {
              pagerender: (pageData: any) => {
                return pageData.getTextContent().then((textContent: any) => {
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
                  if (cleanStr.length > 0 && !PdfService.containsRawPdfBytes(cleanStr)) {
                    pageTexts.push({
                      page: currentPage++,
                      text: cleanStr
                    });
                  }
                  return pageStr;
                });
              }
            });

            if (pageTexts.length > 0) {
              const fullText = pageTexts.map((p) => `Page ${p.page}\n\n${p.text}`).join("\n\n---\n\n");
              return {
                success: true,
                fullText,
                pages: pageTexts
              };
            }

            if (data && data.text) {
              const cleanFull = PdfService.normalizeExtractedText(data.text);
              if (cleanFull.length > 10 && !PdfService.containsRawPdfBytes(cleanFull)) {
                const paragraphs = cleanFull.split("\n\n").filter((p) => p.trim().length > 0);
                const pages = paragraphs.map((pText, i) => ({
                  page: Math.floor(i / 4) + 1,
                  text: pText
                }));
                return {
                  success: true,
                  fullText: cleanFull,
                  pages
                };
              }
            }
          }
        } catch (parseErr) {
          console.warn("pdf-parse execution warning, falling back to stream extraction:", parseErr);
        }
      }

      // 2. Fallback stream parser with strict binary symbol filtering
      return this.extractTextFromPdfBuffer(buffer);
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

  // Server-side PDF text extraction stream fallback with strict binary guard
  public static extractTextFromPdfBuffer(buffer: Buffer): ParsedPdfResult {
    try {
      const pdfString = buffer.toString("binary");

      // Verify PDF file signature
      if (!pdfString.startsWith("%PDF")) {
        return {
          success: false,
          fullText: "Could not extract readable content from this PDF.",
          pages: [],
          error: "Could not extract readable content from this PDF."
        };
      }

      const pages: { page: number; text: string }[] = [];
      let currentPageNum = 1;

      // Extract text stream objects
      const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
      let match: RegExpExecArray | null;

      while ((match = streamRegex.exec(pdfString)) !== null) {
        const rawStream = match[1];
        const streamBuf = Buffer.from(rawStream, "binary");

        let decompressedText = "";
        try {
          const decompressed = zlib.unzipSync(streamBuf);
          decompressedText = decompressed.toString("latin1");
        } catch (err) {
          decompressedText = streamBuf.toString("latin1");
        }

        const pageTextParts: string[] = [];

        // Tj: (text) Tj
        const tjRegex = /\(([^)]+)\)\s*Tj/g;
        let tjMatch: RegExpExecArray | null;
        while ((tjMatch = tjRegex.exec(decompressedText)) !== null) {
          if (tjMatch[1] && !this.containsRawPdfBytes(tjMatch[1])) {
            pageTextParts.push(tjMatch[1]);
          }
        }

        // TJ: [(text1) 10 (text2)] TJ
        const tjArrayRegex = /\[\s*([\s\S]*?)\s*\]\s*TJ/g;
        let tjArrayMatch: RegExpExecArray | null;
        while ((tjArrayMatch = tjArrayRegex.exec(decompressedText)) !== null) {
          const inner = tjArrayMatch[1];
          const innerTextRegex = /\(([^)]+)\)/g;
          let innerMatch: RegExpExecArray | null;
          let line = "";
          while ((innerMatch = innerTextRegex.exec(inner)) !== null) {
            if (!this.containsRawPdfBytes(innerMatch[1])) {
              line += innerMatch[1];
            }
          }
          if (line.trim().length > 0) {
            pageTextParts.push(line);
          }
        }

        if (pageTextParts.length > 0) {
          const cleanPageText = this.normalizeExtractedText(
            pageTextParts.join(" ").replace(/\\([()\\])/g, "$1")
          );

          if (cleanPageText.length > 0 && !this.containsRawPdfBytes(cleanPageText)) {
            pages.push({
              page: currentPageNum++,
              text: cleanPageText
            });
          }
        }
      }

      // Fallback: search plain text parenthesized literals if custom font encoding stream missing
      if (pages.length === 0) {
        const asciiMatches = pdfString.match(/\(([A-Za-z0-9\s.,;:'"!\?\-]{4,})\)/g);
        if (asciiMatches) {
          const extractedFallback = this.normalizeExtractedText(
            asciiMatches
              .map((m) => m.slice(1, -1))
              .filter((t) => !this.containsRawPdfBytes(t))
              .join(" ")
          );

          if (extractedFallback.length > 0) {
            pages.push({
              page: 1,
              text: extractedFallback
            });
          }
        }
      }

      // Detect scanned image-only PDF where no readable text stream was found
      if (pages.length === 0) {
        return {
          success: false,
          fullText: "This PDF does not contain selectable text. OCR is required to read its content.",
          pages: [],
          error: "This PDF does not contain selectable text. OCR is required to read its content."
        };
      }

      const fullText = pages.map((p) => `Page ${p.page}\n\n${p.text}`).join("\n\n---\n\n");

      return {
        success: true,
        fullText,
        pages
      };
    } catch (err) {
      console.error("Error in PdfService.extractTextFromPdfBuffer:", err);
      return {
        success: false,
        fullText: "Could not extract readable content from this PDF.",
        pages: [],
        error: "Could not extract readable content from this PDF."
      };
    }
  }

  // Self-heal and sanitize pre-existing stored document chunks (0 FAKE FALLBACKS!)
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

    const hasBadBinary = chunks.some((c) => this.containsRawPdfBytes(c.text));
    if (!hasBadBinary) {
      return chunks;
    }

    // Clean out raw binary chunks
    const cleanedChunks = chunks
      .map((c) => {
        if (this.containsRawPdfBytes(c.text)) {
          const asciiOnly = this.normalizeExtractedText(
            c.text
              .replace(/%PDF[\s\S]*?endstream/g, "")
              .replace(/PK[\s\S]*?docProps/g, "")
              .replace(/[^\x20-\x7E\n]/g, " ")
          );

          if (asciiOnly.length > 15 && !this.containsRawPdfBytes(asciiOnly)) {
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
        text: `This PDF does not contain selectable text. OCR is required to read its content.`,
        page: 1
      }
    ];
  }
}
