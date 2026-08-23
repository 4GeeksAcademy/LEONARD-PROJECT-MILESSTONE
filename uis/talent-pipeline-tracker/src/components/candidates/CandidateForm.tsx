"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createCandidate, replaceCandidate } from "@/services/trackerApi";
import type { CandidateCreateInput, CandidateRecord } from "@/types/tracker";

type CandidateFormProps = {
  mode: "create" | "edit";
  candidateId?: string;
  initialData?: CandidateRecord;
};

type FormState = {
  full_name: string;
  email: string;
  phone: string;
  position: string;
  linkedin_url: string;
  cv_url: string;
  experience_years: string;
};

function toPayload(state: FormState): CandidateCreateInput {
  return {
    full_name: state.full_name.trim(),
    email: state.email.trim(),
    phone: state.phone.trim(),
    position: state.position.trim(),
    linkedin_url: state.linkedin_url.trim() ? state.linkedin_url.trim() : null,
    cv_url: state.cv_url.trim() ? state.cv_url.trim() : null,
    experience_years: Number(state.experience_years),
  };
}

export function CandidateForm({ mode, candidateId, initialData }: CandidateFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const initialState = useMemo<FormState>(
    () => ({
      full_name: initialData?.full_name ?? "",
      email: initialData?.email ?? "",
      phone: initialData?.phone ?? "",
      position: initialData?.position ?? "",
      linkedin_url: initialData?.linkedin_url ?? "",
      cv_url: initialData?.cv_url ?? "",
      experience_years: String(initialData?.experience_years ?? ""),
    }),
    [initialData],
  );

  const [formState, setFormState] = useState<FormState>(initialState);

  function onChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setFormState((previous) => ({ ...previous, [key]: value }));
  }

  function validate(): string | null {
    if (!formState.full_name.trim()) return "Full name is required.";
    if (!formState.email.trim()) return "Email is required.";
    if (!formState.phone.trim()) return "Phone is required.";
    if (!formState.position.trim()) return "Position is required.";

    const years = Number(formState.experience_years);
    if (Number.isNaN(years) || years < 0) {
      return "Years of experience must be a number greater than or equal to zero.";
    }

    return null;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage(null);
    setSuccessMessage(null);

    const validationMessage = validate();
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    try {
      setIsSaving(true);
      const payload = toPayload(formState);

      if (mode === "create") {
        const created = await createCandidate(payload);
        setSuccessMessage("Candidate registered successfully.");
        router.push(`/candidates/${created.id}`);
        return;
      }

      if (!candidateId) {
        throw new Error("Missing candidate id for edit mode.");
      }

      await replaceCandidate(candidateId, payload);
      setSuccessMessage("Candidate profile updated successfully.");
      router.push(`/candidates/${candidateId}`);
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save candidate.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black text-slate-900">
        {mode === "create" ? "Register New Candidate" : "Edit Candidate Profile"}
      </h2>

      {errorMessage ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p> : null}
      {successMessage ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">
          Full Name *
          <input
            value={formState.full_name}
            onChange={(event) => onChange("full_name", event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Email *
          <input
            type="email"
            value={formState.email}
            onChange={(event) => onChange("email", event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Phone *
          <input
            value={formState.phone}
            onChange={(event) => onChange("phone", event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Position *
          <input
            value={formState.position}
            onChange={(event) => onChange("position", event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm font-semibold text-slate-700">
          LinkedIn URL
          <input
            value={formState.linkedin_url}
            onChange={(event) => onChange("linkedin_url", event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm font-semibold text-slate-700">
          CV URL
          <input
            value={formState.cv_url}
            onChange={(event) => onChange("cv_url", event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm font-semibold text-slate-700 md:col-span-2">
          Years of Experience *
          <input
            type="number"
            min="0"
            step="0.5"
            value={formState.experience_years}
            onChange={(event) => onChange("experience_years", event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {isSaving ? "Saving..." : mode === "create" ? "Create Candidate" : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
