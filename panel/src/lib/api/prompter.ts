import api from "./client";
import type { Team, TaskType, Complexity } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DraftProposal {
  title: string;
  description: string;
  acceptance_criteria: string[];
  team: Team;
  priority?: number;
  task_type?: TaskType;
  estimated_complexity?: Complexity;
}

export interface ChatResponse {
  reply: string;
  draft?: DraftProposal | null;
  session_id: string;
}

export interface CreateSessionResponse {
  session_id: string;
}

// A message record as returned by the backend (PrompterMessageResponse).
interface BackendMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

// Mirrors the backend's draft-ready signal phrases (services/prompter.py).
// If the backend list ever drifts, the draft simply doesn't auto-surface (the
// user can keep chatting) — it never breaks the conversation flow.
const DRAFT_READY_SIGNALS = [
  "i have enough information",
  "ready to generate a draft",
  "ready to draft",
  "i can now draft",
  "draft_ready=true",
  "draft ready",
];

function replyLooksDraftReady(reply: string): boolean {
  const lower = reply.toLowerCase();
  return DRAFT_READY_SIGNALS.some((s) => lower.includes(s));
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export const prompterApi = {
  /**
   * Create a new prompter session, returning a session ID.
   * The endpoint requires a JSON body (optional `context`), so send `{}`, and
   * map the backend's `id` field onto our `session_id`.
   */
  createSession: async (): Promise<CreateSessionResponse> => {
    const { data } = await api.post<{ id: string }>("/prompter/sessions", {});
    return { session_id: data.id };
  },

  /**
   * Send a chat message in an existing session. The backend appends the user
   * message, replies, and returns the full message list. We surface the latest
   * assistant message as the reply and, when it signals readiness, fetch the
   * structured draft.
   */
  sendMessage: async (
    sessionId: string,
    message: string
  ): Promise<ChatResponse> => {
    const { data: messages } = await api.post<BackendMessage[]>(
      `/prompter/sessions/${sessionId}/messages`,
      { content: message }
    );
    const lastAssistant = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");
    const reply = lastAssistant?.content ?? "";

    let draft: DraftProposal | null = null;
    if (replyLooksDraftReady(reply)) {
      try {
        draft = await prompterApi.getDraft(sessionId);
      } catch {
        draft = null;
      }
    }
    return { reply, draft, session_id: sessionId };
  },

  /**
   * Fetch the current draft for a session (if the LLM has produced one).
   * The backend returns a TaskDraftResponse whose `draft` field holds the task.
   */
  getDraft: async (sessionId: string): Promise<DraftProposal | null> => {
    const { data } = await api.get<{ draft: DraftProposal | null }>(
      `/prompter/sessions/${sessionId}/draft`
    );
    return data.draft;
  },
};
