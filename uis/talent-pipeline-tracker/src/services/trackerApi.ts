import { API_URL } from "@/lib/constants";
import type {
  CandidateCreateInput,
  CandidateListQuery,
  CandidateListResponse,
  CandidateNotesResponse,
  CandidatePatchInput,
  CandidateRecord,
} from "@/types/tracker";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "Unexpected API error";

    try {
      const payload = (await response.json()) as { detail?: Array<{ msg?: string }> };
      message = payload?.detail?.[0]?.msg ?? message;
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function toQueryString(query: CandidateListQuery): string {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export async function getCandidates(query: CandidateListQuery): Promise<CandidateListResponse> {
  return request<CandidateListResponse>(`/records${toQueryString(query)}`);
}

export async function getCandidateById(id: string): Promise<CandidateRecord> {
  return request<CandidateRecord>(`/records/${id}`);
}

export async function createCandidate(input: CandidateCreateInput): Promise<CandidateRecord> {
  return request<CandidateRecord>("/records", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function replaceCandidate(id: string, input: CandidateCreateInput): Promise<CandidateRecord> {
  return request<CandidateRecord>(`/records/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function patchCandidate(id: string, input: CandidatePatchInput): Promise<CandidateRecord> {
  return request<CandidateRecord>(`/records/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function getCandidateNotes(id: string): Promise<CandidateNotesResponse> {
  return request<CandidateNotesResponse>(`/records/${id}/notes`);
}

export async function addCandidateNote(id: string, content: string): Promise<void> {
  await request<void>(`/records/${id}/notes`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export async function deleteCandidateNote(id: string, noteId: string): Promise<void> {
  await request<void>(`/records/${id}/notes/${noteId}`, {
    method: "DELETE",
  });
}
