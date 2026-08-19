import { getMongoClient } from "../db/mongodb";
import {
  ProfessionalDocument,
  ProfessionalMeeting,
  ProfessionalTask,
  ProfessionalResearch,
  ProfessionalInsight,
  ProfessionalMemory,
} from "../types/professional-types";

// In-memory fallback server store for Professional Workspace
class ProfessionalStateStore {
  private documents: ProfessionalDocument[] = [
    {
      id: "pdoc_1",
      name: "Vendor_A_Proposal_Q3.pdf",
      fileType: "pdf",
      sizeMb: 3.2,
      uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
      status: "Ready",
      chunksCount: 24,
      textContent: "Vendor A offers cloud migration services at $45,000 with 99.9% uptime SLA and 24/7 dedicated support.",
    },
    {
      id: "pdoc_2",
      name: "Vendor_B_Proposal_Q3.pdf",
      fileType: "pdf",
      sizeMb: 2.8,
      uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
      status: "Ready",
      chunksCount: 18,
      textContent: "Vendor B offers cloud migration services at $38,000 with 99.5% uptime SLA, 3-week completion schedule, and standard email support.",
    },
    {
      id: "pdoc_3",
      name: "Project_Requirements_2026.docx",
      fileType: "docx",
      sizeMb: 1.5,
      uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString().split("T")[0],
      status: "Ready",
      chunksCount: 12,
      textContent: "Project Requirements: Budget limit $50,000. Required timeline under 4 weeks. High uptime SLA required for core API database.",
    },
  ];

  private meetings: ProfessionalMeeting[] = [
    {
      id: "pmeet_1",
      title: "Q3 Vendor Review & Product Sync",
      date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
      transcript: "Swati: We need to finalize the cloud vendor by Friday. Vendor B is cheaper and faster, but Vendor A has better SLA. Alex: Let's start beta testing on Sept 5 and launch product v2 on Sept 15.",
      summary: "Team aligned on vendor evaluation criteria and set hard milestones for beta testing and production launch.",
      decisions: [
        "Launch moved to September 15.",
        "Beta testing starts September 5.",
        "Legal will review Vendor B security addendum by Sept 3.",
      ],
      actionItems: [
        { title: "Prepare beta build", owner: "Product", dueDate: "Sept 5" },
        { title: "Send client update", owner: "Marketing", dueDate: "Sept 2" },
        { title: "Review contract", owner: "Legal", dueDate: "Sept 3" },
      ],
      followUpSuggestions: [
        "Schedule 15-min sync with Legal on Sept 3",
        "Confirm beta user mailing list with Marketing",
      ],
      createdAt: new Date().toISOString(),
    },
  ];

  private tasks: ProfessionalTask[] = [
    {
      id: "ptask_1",
      title: "Review Q3 proposal",
      description: "Compare Vendor A and Vendor B SLA terms and pricing bounds.",
      priority: "High",
      dueDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      owner: "Swati",
      status: "Todo",
      sourceId: "pdoc_1",
      createdAt: new Date().toISOString(),
    },
    {
      id: "ptask_2",
      title: "Follow up with client",
      description: "Send updated timeline schedule for Q3 deployment.",
      priority: "Medium",
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
      owner: "Marketing",
      status: "Todo",
      sourceId: "pmeet_1",
      createdAt: new Date().toISOString(),
    },
    {
      id: "ptask_3",
      title: "Prepare meeting brief",
      description: "Draft agenda for Friday executive sync.",
      priority: "Low",
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
      owner: "Swati",
      status: "In Progress",
      createdAt: new Date().toISOString(),
    },
    {
      id: "ptask_4",
      title: "Finalize legal contract",
      description: "Review security addendum for Vendor B cloud migration.",
      priority: "High",
      dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split("T")[0],
      owner: "Legal",
      status: "Done",
      createdAt: new Date().toISOString(),
    },
    {
      id: "ptask_5",
      title: "Submit budget approval",
      description: "Submit Q3 infrastructure budget to finance team.",
      priority: "Medium",
      dueDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
      owner: "Swati",
      status: "Done",
      createdAt: new Date().toISOString(),
    },
  ];

  private research: ProfessionalResearch[] = [
    {
      id: "pres_1",
      query: "Edtech AI copilot market trends 2026",
      date: new Date().toISOString().split("T")[0],
      synthesis: "The Indian EdTech and AI work copilot sector is rapidly expanding with demand for automated meeting intelligence, RAG document search, and seamless workflow execution.",
      keyFindings: [
        "72% of mid-size enterprises adopt AI work copilots to eliminate meeting notes overhead.",
        "RAG-based search reduces doc retrieval time from 15 mins to under 10 seconds.",
      ],
      trends: [
        "Hyper-personalized workspace memory (Mem0 integration).",
        "Action item extraction directly into task trackers.",
      ],
      recommendations: [
        "Prioritize 1-click task creation from meeting transcripts.",
        "Emphasize strict data privacy with server-side AI execution.",
      ],
      sources: [
        {
          title: "Enterprise AI Workflows 2026 - Gartner Report",
          url: "https://gartner.com/research/ai-workplaces-2026",
          snippet: "Automated task extraction and vector document search drive 35% productivity gains across product management teams.",
        },
      ],
    },
  ];

  private memories: ProfessionalMemory[] = [
    {
      id: "pmem_1",
      category: "Executive Preference",
      preference: "I prefer concise executive summaries with direct recommendations.",
      confidence: 0.98,
      updatedAt: "2026-08-16",
    },
    {
      id: "pmem_2",
      category: "Communication Style",
      preference: "Keep client emails professional, clear, and action-oriented.",
      confidence: 0.94,
      updatedAt: "2026-08-17",
    },
    {
      id: "pmem_3",
      category: "Workflow Tooling",
      preference: "Our team prioritizes key milestones with clear owner tags and due dates.",
      confidence: 0.92,
      updatedAt: "2026-08-18",
    },
  ];

  // Documents
  async getDocuments(): Promise<ProfessionalDocument[]> {
    const client = await getMongoClient();
    if (client) {
      try {
        const db = client.db("ai4life");
        const docs = await db.collection("professional_documents").find({}).toArray();
        if (docs.length > 0) {
          return docs.map((d: any) => ({
            id: d._id.toString(),
            name: d.name,
            fileType: d.fileType,
            sizeMb: d.sizeMb,
            uploadedAt: d.uploadedAt,
            status: d.status,
            chunksCount: d.chunksCount,
            qdrantCollectionRef: d.qdrantCollectionRef,
            textContent: d.textContent,
          }));
        }
      } catch (e) {
        console.warn("MongoDB getDocuments error, using fallback state:", e);
      }
    }
    return this.documents;
  }

  async addDocument(doc: Omit<ProfessionalDocument, "id">): Promise<ProfessionalDocument> {
    const newDoc: ProfessionalDocument = {
      ...doc,
      id: `pdoc_${Date.now()}`,
    };
    const client = await getMongoClient();
    if (client) {
      try {
        const db = client.db("ai4life");
        await db.collection("professional_documents").insertOne(newDoc);
      } catch (e) {
        console.warn("MongoDB addDocument error, using fallback state:", e);
      }
    }
    this.documents.unshift(newDoc);
    return newDoc;
  }

  // Meetings
  async getMeetings(): Promise<ProfessionalMeeting[]> {
    const client = await getMongoClient();
    if (client) {
      try {
        const db = client.db("ai4life");
        const meets = await db.collection("professional_meetings").find({}).toArray();
        if (meets.length > 0) {
          return meets.map((m: any) => ({
            id: m._id.toString(),
            title: m.title,
            date: m.date,
            transcript: m.transcript,
            summary: m.summary,
            decisions: m.decisions || [],
            actionItems: m.actionItems || [],
            followUpSuggestions: m.followUpSuggestions || [],
            createdAt: m.createdAt,
          }));
        }
      } catch (e) {
        console.warn("MongoDB getMeetings error, using fallback state:", e);
      }
    }
    return this.meetings;
  }

  async addMeeting(meeting: Omit<ProfessionalMeeting, "id">): Promise<ProfessionalMeeting> {
    const newMeeting: ProfessionalMeeting = {
      ...meeting,
      id: `pmeet_${Date.now()}`,
    };
    const client = await getMongoClient();
    if (client) {
      try {
        const db = client.db("ai4life");
        await db.collection("professional_meetings").insertOne(newMeeting);
      } catch (e) {
        console.warn("MongoDB addMeeting error, using fallback state:", e);
      }
    }
    this.meetings.unshift(newMeeting);
    return newMeeting;
  }

  // Tasks
  async getTasks(): Promise<ProfessionalTask[]> {
    const client = await getMongoClient();
    if (client) {
      try {
        const db = client.db("ai4life");
        const tsks = await db.collection("professional_tasks").find({}).toArray();
        if (tsks.length > 0) {
          return tsks.map((t: any) => ({
            id: t._id.toString(),
            title: t.title,
            description: t.description,
            priority: t.priority || "Medium",
            dueDate: t.dueDate,
            owner: t.owner || "Swati",
            status: t.status || "Todo",
            sourceId: t.sourceId,
            createdAt: t.createdAt || new Date().toISOString(),
          }));
        }
      } catch (e) {
        console.warn("MongoDB getTasks error, using fallback state:", e);
      }
    }
    return this.tasks;
  }

  async addTask(task: Omit<ProfessionalTask, "id" | "createdAt">): Promise<ProfessionalTask> {
    const newTask: ProfessionalTask = {
      ...task,
      id: `ptask_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    const client = await getMongoClient();
    if (client) {
      try {
        const db = client.db("ai4life");
        await db.collection("professional_tasks").insertOne(newTask);
      } catch (e) {
        console.warn("MongoDB addTask error, using fallback state:", e);
      }
    }
    this.tasks.unshift(newTask);
    return newTask;
  }

  async updateTask(id: string, updates: Partial<ProfessionalTask>): Promise<ProfessionalTask | null> {
    let updatedTask: ProfessionalTask | null = null;
    this.tasks = this.tasks.map((t) => {
      if (t.id === id) {
        updatedTask = { ...t, ...updates };
        return updatedTask;
      }
      return t;
    });

    const client = await getMongoClient();
    if (client) {
      try {
        const db = client.db("ai4life");
        const { ObjectId } = await import("mongodb");
        if (ObjectId.isValid(id)) {
          await db.collection("professional_tasks").updateOne(
            { _id: new ObjectId(id) },
            { $set: updates }
          );
        }
      } catch (e) {
        console.warn("MongoDB updateTask error, fallback used:", e);
      }
    }

    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    this.tasks = this.tasks.filter((t) => t.id !== id);

    const client = await getMongoClient();
    if (client) {
      try {
        const db = client.db("ai4life");
        const { ObjectId } = await import("mongodb");
        if (ObjectId.isValid(id)) {
          await db.collection("professional_tasks").deleteOne({ _id: new ObjectId(id) });
        }
      } catch (e) {
        console.warn("MongoDB deleteTask error, fallback used:", e);
      }
    }

    return true;
  }

  // Research
  async getResearch(): Promise<ProfessionalResearch[]> {
    return this.research;
  }

  async addResearch(res: Omit<ProfessionalResearch, "id">): Promise<ProfessionalResearch> {
    const newRes: ProfessionalResearch = {
      ...res,
      id: `pres_${Date.now()}`,
    };
    this.research.unshift(newRes);
    return newRes;
  }

  // Memories
  async getMemories(): Promise<ProfessionalMemory[]> {
    return this.memories;
  }

  async addMemory(category: string, preference: string): Promise<ProfessionalMemory> {
    const newMem: ProfessionalMemory = {
      id: `pmem_${Date.now()}`,
      category,
      preference,
      confidence: 0.96,
      updatedAt: new Date().toISOString().split("T")[0],
    };
    this.memories.unshift(newMem);
    return newMem;
  }

  async deleteMemory(id: string): Promise<boolean> {
    this.memories = this.memories.filter((m) => m.id !== id);
    return true;
  }

  // Insights (Derived from real data)
  async getInsights(): Promise<ProfessionalInsight[]> {
    const tasks = await this.getTasks();
    const docs = await this.getDocuments();
    const meets = await this.getMeetings();

    if (tasks.length === 0 && docs.length === 0 && meets.length === 0) {
      return [];
    }

    const openHighPriority = tasks.filter(
      (t) => t.status !== "Done" && t.priority === "High"
    );

    const insights: ProfessionalInsight[] = [];

    if (openHighPriority.length > 0) {
      insights.push({
        id: "ins_1",
        category: "PRIORITY",
        title: `${openHighPriority.length} high-priority tasks pending resolution`,
        description: `Tasks such as "${openHighPriority[0].title}" have upcoming deadlines. Focus on high impact items first.`,
        impact: "High Impact",
        createdAt: new Date().toISOString(),
      });
    }

    if (meets.length > 0 && meets[0].actionItems.length > 0) {
      insights.push({
        id: "ins_2",
        category: "PATTERN",
        title: "Action items extracted from recent meeting",
        description: `Recent meeting "${meets[0].title}" generated ${meets[0].actionItems.length} action items. ${meets[0].actionItems.map(a => a.owner).join(", ")} assigned.`,
        impact: "Medium Impact",
        createdAt: new Date().toISOString(),
      });
    }

    if (docs.length > 1) {
      insights.push({
        id: "ins_3",
        category: "SUGGESTION",
        title: "Multi-document comparative analysis available",
        description: `You have ${docs.length} uploaded documents ready. Use AI Copilot or Document Analysis to compare vendor SLA terms.`,
        impact: "Strategic",
        createdAt: new Date().toISOString(),
      });
    }

    return insights;
  }
}

export const professionalState = new ProfessionalStateStore();
