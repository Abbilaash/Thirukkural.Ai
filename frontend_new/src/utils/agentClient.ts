import { Personality } from './quizLogic';

const DEFAULT_API_BASE = "http://localhost:8000";

const normalizeBaseUrl = (url: string | undefined): string => {
  if (!url) return DEFAULT_API_BASE;
  return url.endsWith("/") ? url.slice(0, -1) : url;
};

export interface AgentResponse {
  response?: any;
  question?: string;
  plan?: any;
  retrieved_kurals?: any[];
  raw_response?: string;
}

export async function fetchAgentResponse(question: string, personality?: Personality, signal?: AbortSignal): Promise<AgentResponse> {
  const sanitized = question?.trim();
  if (!sanitized) {
    throw new Error("Question cannot be empty");
  }

  const baseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_AGENT_API);
  const response = await fetch(`${baseUrl}/api/v1/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question: sanitized, personality }),
    signal,
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const detail = errorPayload?.detail || response.statusText;
    throw new Error(detail || "Agent request failed");
  }

  return response.json();
}
