import zlib from "zlib";

export class DocxService {
  // Check if string contains raw DOCX ZIP headers or XML structural tags
  public static isRawDocxZip(text: string): boolean {
    if (!text) return false;
    return (
      text.includes("PK\x03\x04") ||
      text.includes("docProps/") ||
      text.includes("word/document.xml") ||
      text.includes("app.xml") ||
      /^PK[\s\S]*?docProps/i.test(text)
    );
  }

  // Decompress ZIP local entries and extract clean text from <w:t> XML nodes inside <w:p> paragraphs
  public static extractTextFromDocxBuffer(buffer: Buffer): { success: boolean; text: string; error?: string } {
    try {
      let combinedParagraphs: string[] = [];

      // Scan for PK\x03\x04 local file headers in buffer
      let offset = 0;
      while (offset < buffer.length - 30) {
        if (
          buffer[offset] === 0x50 &&
          buffer[offset + 1] === 0x4b &&
          buffer[offset + 2] === 0x03 &&
          buffer[offset + 3] === 0x04
        ) {
          const compressionMethod = buffer.readUInt16LE(offset + 8);
          const compressedSize = buffer.readUInt32LE(offset + 18);
          const fileNameLength = buffer.readUInt16LE(offset + 26);
          const extraLength = buffer.readUInt16LE(offset + 28);

          const fileName = buffer.toString("utf-8", offset + 30, offset + 30 + fileNameLength);
          const dataOffset = offset + 30 + fileNameLength + extraLength;

          if (fileName.startsWith("word/") && fileName.endsWith(".xml")) {
            const compressedData = buffer.subarray(dataOffset, dataOffset + compressedSize);
            let xmlContent = "";

            if (compressionMethod === 8) {
              try {
                xmlContent = zlib.inflateRawSync(compressedData).toString("utf-8");
              } catch (e) {
                try {
                  xmlContent = zlib.unzipSync(compressedData).toString("utf-8");
                } catch (e2) {
                  // Fallback
                }
              }
            } else if (compressionMethod === 0) {
              xmlContent = compressedData.toString("utf-8");
            }

            if (xmlContent) {
              // Extract paragraph by paragraph <w:p>
              const pMatches = Array.from(xmlContent.matchAll(/<w:p[^>]*>([\s\S]*?)<\/w:p>/g));
              if (pMatches.length > 0) {
                for (const pMatch of pMatches) {
                  const wtMatches = Array.from(pMatch[1].matchAll(/<w:t[^>]*>([^<]+)<\/w:t>/g));
                  const pText = wtMatches
                    .map((m) =>
                      m[1]
                        .replace(/&amp;/g, "&")
                        .replace(/&lt;/g, "<")
                        .replace(/&gt;/g, ">")
                        .replace(/&#39;/g, "'")
                        .replace(/&quot;/g, '"')
                    )
                    .join("")
                    .trim();
                  if (pText.length > 0) {
                    combinedParagraphs.push(pText);
                  }
                }
              } else {
                const wtMatches = Array.from(xmlContent.matchAll(/<w:t[^>]*>([^<]+)<\/w:t>/g));
                if (wtMatches.length > 0) {
                  const textNode = wtMatches
                    .map((m) =>
                      m[1]
                        .replace(/&amp;/g, "&")
                        .replace(/&lt;/g, "<")
                        .replace(/&gt;/g, ">")
                        .replace(/&#39;/g, "'")
                        .replace(/&quot;/g, '"')
                    )
                    .join(" ")
                    .trim();
                  if (textNode.length > 0) {
                    combinedParagraphs.push(textNode);
                  }
                }
              }
            }
          }
          offset = Math.max(offset + 1, dataOffset + compressedSize);
        } else {
          offset++;
        }
      }

      // Fallback: search raw XML string if ZIP iteration yielded empty
      if (combinedParagraphs.length === 0) {
        const rawStr = buffer.toString("latin1");
        const wtMatches = Array.from(rawStr.matchAll(/<w:t[^>]*>([^<]+)<\/w:t>/g));
        if (wtMatches.length > 0) {
          const rawText = wtMatches
            .map((m) =>
              m[1]
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&#39;/g, "'")
                .replace(/&quot;/g, '"')
            )
            .join(" ")
            .trim();
          if (rawText.length > 0) {
            combinedParagraphs.push(rawText);
          }
        }
      }

      const fullText = combinedParagraphs.join("\n\n").trim();
      const cleanText = fullText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();

      if (cleanText.length > 5 && !this.isRawDocxZip(cleanText)) {
        return { success: true, text: cleanText };
      }

      return {
        success: false,
        text: "Could not extract readable content from this DOCX file.",
        error: "Could not extract readable content from this DOCX file."
      };
    } catch (err) {
      console.error("Error in DocxService.extractTextFromDocxBuffer:", err);
      return {
        success: false,
        text: "Could not extract readable content from this DOCX file.",
        error: "Could not extract readable content from this DOCX file."
      };
    }
  }
}
