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

  // Decompress ZIP local entries and extract clean text from <w:t> XML nodes
  public static extractTextFromDocxBuffer(buffer: Buffer): { success: boolean; text: string; error?: string } {
    try {
      let combinedXmlText = "";

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
                  console.warn("Docx stream inflate warning for " + fileName);
                }
              }
            } else if (compressionMethod === 0) {
              xmlContent = compressedData.toString("utf-8");
            }

            if (xmlContent) {
              const wtMatches = Array.from(xmlContent.matchAll(/<w:t[^>]*>([^<]+)<\/w:t>/g));
              if (wtMatches.length > 0) {
                const textNode = wtMatches
                  .map((m) => m[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"'))
                  .join(" ");
                combinedXmlText += " " + textNode;
              }
            }
          }
          offset = Math.max(offset + 1, dataOffset + compressedSize);
        } else {
          offset++;
        }
      }

      // Fallback: search raw XML string if ZIP iteration yielded empty
      if (!combinedXmlText || combinedXmlText.trim().length === 0) {
        const rawStr = buffer.toString("latin1");
        const wtMatches = Array.from(rawStr.matchAll(/<w:t[^>]*>([^<]+)<\/w:t>/g));
        if (wtMatches.length > 0) {
          combinedXmlText = wtMatches
            .map((m) => m[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"'))
            .join(" ");
        }
      }

      const cleanText = combinedXmlText.replace(/\s+/g, " ").trim();
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
