export interface YouTubeTranscriptResult {
  success: boolean;
  title?: string;
  videoId?: string;
  transcriptText?: string;
  chunks?: { id: string; text: string; page?: number }[];
  errorCode?: string;
  error?: string;
}

export class YouTubeService {
  // Extract YouTube Video ID from standard formats (youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/...)
  static extractVideoId(url: string): string | null {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }

  // Clean HTML entities from raw XML text
  private static decodeHtmlEntities(text: string): string {
    if (!text) return "";
    return text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Extract transcript/captions for a YouTube video URL using multi-layer extraction
  static async extractTranscript(youtubeUrl: string): Promise<YouTubeTranscriptResult> {
    const videoId = this.extractVideoId(youtubeUrl);
    if (!videoId) {
      return {
        success: false,
        errorCode: "INVALID_URL",
        error: "Invalid YouTube URL. Please enter a valid YouTube video link (e.g., https://www.youtube.com/watch?v=...)."
      };
    }

    try {
      console.log("[Material Processing]", {
        sourceType: "youtube",
        videoId,
        youtubeUrl,
        processingStep: "Fetching YouTube video page & caption tracks"
      });

      // Layer 1: Fetch YouTube video page metadata & captionTracks JS object
      const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9"
        }
      });

      if (!response.ok) {
        return {
          success: false,
          errorCode: "VIDEO_UNAVAILABLE",
          error: "Transcript is unavailable for this YouTube video. You can upload the video/audio file directly if you have permission to do so."
        };
      }

      const html = await response.text();

      // Extract video title
      const titleMatch = html.match(/<meta name="title" content="([^"]+)">/) || html.match(/<title>([^<]+)<\/title>/);
      const title = titleMatch ? titleMatch[1].replace(" - YouTube", "") : `YouTube Video (${videoId})`;

      let captionUrl: string | null = null;

      // Extract caption tracks from ytInitialPlayerResponse or inline JSON
      const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({[\s\S]*?});/);
      if (playerResponseMatch) {
        try {
          const playerResponse = JSON.parse(playerResponseMatch[1]);
          const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
          if (Array.isArray(captionTracks) && captionTracks.length > 0) {
            const englishTrack = captionTracks.find((t: any) => t.languageCode === "en" || t.languageCode?.startsWith("en")) || captionTracks[0];
            if (englishTrack && englishTrack.baseUrl) {
              captionUrl = englishTrack.baseUrl;
            }
          }
        } catch (e) {
          console.warn("ytInitialPlayerResponse parse warning:", e);
        }
      }

      if (!captionUrl) {
        const captionMatch = html.match(/"captionTracks":\s*(\[[^\]]+\])/);
        if (captionMatch) {
          try {
            const captionTracks = JSON.parse(captionMatch[1]);
            const englishTrack = captionTracks.find((t: any) => t.languageCode === "en" || t.languageCode?.startsWith("en")) || captionTracks[0];
            if (englishTrack && englishTrack.baseUrl) {
              captionUrl = englishTrack.baseUrl;
            }
          } catch (e) {
            console.warn("captionTracks regex parse warning:", e);
          }
        }
      }

      // Layer 2: Direct timedtext fallback endpoint (Manual English captions)
      if (!captionUrl) {
        captionUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`;
      }

      // Fetch timedtext XML content
      let xmlText = "";
      try {
        const transcriptRes = await fetch(captionUrl);
        if (transcriptRes.ok) {
          xmlText = await transcriptRes.text();
        }
      } catch (e) {
        console.warn("Primary caption fetch error:", e);
      }

      // Layer 3: Direct timedtext ASR fallback (Auto-generated captions)
      if (!xmlText || !xmlText.includes("<text")) {
        try {
          const asrRes = await fetch(`https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&kind=asr`);
          if (asrRes.ok) {
            xmlText = await asrRes.text();
          }
        } catch (e) {
          console.warn("ASR caption fetch error:", e);
        }
      }

      // Parse XML text nodes
      if (xmlText && xmlText.includes("<text")) {
        const textMatches = Array.from(xmlText.matchAll(/<text[^>]*>([^<]+)<\/text>/g));
        if (textMatches.length > 0) {
          const cleanTextParts = textMatches
            .map((m) => this.decodeHtmlEntities(m[1]))
            .filter((t) => t.length > 0);

          if (cleanTextParts.length > 0) {
            const fullText = cleanTextParts.join(" ");

            // Chunk transcript into paragraph sections
            const rawParagraphs = fullText.split(". ");
            const chunks = rawParagraphs
              .map((para, idx) => ({
                id: `yt_chunk_${videoId}_${idx}`,
                text: para.trim() + ".",
                page: Math.floor(idx / 4) + 1
              }))
              .filter((c) => c.text.length > 10);

            return {
              success: true,
              title,
              videoId,
              transcriptText: fullText,
              chunks: chunks.length > 0 ? chunks : [{ id: `yt_${videoId}_1`, text: fullText.substring(0, 800), page: 1 }]
            };
          }
        }
      }

      // If all caption sources fail, return exact requested failure message
      return {
        success: false,
        errorCode: "TRANSCRIPT_UNAVAILABLE",
        error: "Transcript is unavailable for this YouTube video. You can upload the video/audio file directly if you have permission to do so."
      };
    } catch (err) {
      console.error("YouTube transcript extraction error:", err);
      return {
        success: false,
        errorCode: "EXTRACTION_FAILED",
        error: "Transcript is unavailable for this YouTube video. You can upload the video/audio file directly if you have permission to do so."
      };
    }
  }
}
