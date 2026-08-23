import Link from "next/link";
import { CandidateDetailClient } from "@/components/candidates/CandidateDetailClient";
import { getCandidateById, getCandidateNotes } from "@/services/trackerApi";

type CandidateDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CandidateDetailPage({ params }: CandidateDetailPageProps) {
  const { id } = await params;

  let candidate;
  let notesResponse;

  try {
    [candidate, notesResponse] = await Promise.all([
      getCandidateById(id),
      getCandidateNotes(id),
    ]);
  } catch (error) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <article className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <h1 className="text-xl font-black text-red-900">Could not load candidate profile</h1>
          <p className="mt-2 text-sm text-red-800">{error instanceof Error ? error.message : "Unexpected API error."}</p>
        </article>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-4 px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/" className="text-sm font-semibold text-amber-700">
        Back to candidate list
      </Link>
      <CandidateDetailClient initialCandidate={candidate} initialNotes={notesResponse.data} />
    </main>
  );
}
