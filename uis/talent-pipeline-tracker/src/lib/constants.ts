import type { CandidateStage, CandidateStatus } from "@/types/tracker";

export const STATUS_OPTIONS: Array<{ value: CandidateStatus; label: string }> = [
  { value: "received", label: "Received" },
  { value: "in_progress", label: "In Progress" },
  { value: "selected", label: "Selected" },
  { value: "discarded", label: "Discarded" },
];

export const STAGE_OPTIONS: Array<{ value: CandidateStage; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "review", label: "Review" },
  { value: "personal_interview", label: "Personal Interview" },
  { value: "technical_interview", label: "Technical Interview" },
  { value: "offer_presented", label: "Offer Presented" },
];

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://playground.4geeks.com/tracker/api/v1";
