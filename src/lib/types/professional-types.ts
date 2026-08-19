export type ProfessionalTab =
  | "dashboard"
  | "copilot"
  | "documents"
  | "meetings"
  | "tasks"
  | "research"
  | "insights"
  | "memory"
  | "settings";

export type CopilotMode =
  | "Summarize"
  | "Analyze"
  | "Compare"
  | "Draft"
  | "Plan"
  | "Explain";

export interface ProfessionalTask {
  id: string;
  title: string;
  description?: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  owner: string;
  status: "Todo" | "In Progress" | "Done";
  sourceId?: string;
  createdAt: string;
}

export interface ProfessionalDocument {
  id: string;
  name: string;
  fileType: "pdf" | "docx" | "pptx" | "txt";
  sizeMb: number;
  uploadedAt: string;
  status: "Uploading" | "Processing" | "Ready" | "Failed";
  chunksCount: number;
  qdrantCollectionRef?: string;
  textContent?: string;
}

export interface ProfessionalMeeting {
  id: string;
  title: string;
  date: string;
  transcript: string;
  summary: string;
  decisions: string[];
  actionItems: {
    title: string;
    owner: string;
    dueDate: string;
  }[];
  followUpSuggestions: string[];
  createdAt: string;
}

export interface ProfessionalResearch {
  id: string;
  query: string;
  date: string;
  synthesis: string;
  keyFindings: string[];
  trends: string[];
  recommendations: string[];
  sources: {
    title: string;
    url: string;
    snippet: string;
  }[];
}

export interface ProfessionalInsight {
  id: string;
  category: "PRIORITY" | "PATTERN" | "SUGGESTION";
  title: string;
  description: string;
  impact: string;
  createdAt: string;
}

export interface ProfessionalMemory {
  id: string;
  category: string;
  preference: string;
  confidence: number;
  updatedAt: string;
}

export interface CopilotSource {
  title: string;
  chunkText: string;
  page?: number;
}

export interface StructuredWorkAction {
  decision?: string;
  actionItems?: {
    title: string;
    owner: string;
    dueDate: string;
    priority?: "High" | "Medium" | "Low";
  }[];
  summary?: string;
  recommendation?: string;
  sources?: string[];
}

export interface CopilotResponse {
  success: boolean;
  answer: string;
  sources?: CopilotSource[];
  suggestedActions?: string[];
  structuredResult?: StructuredWorkAction;
}
