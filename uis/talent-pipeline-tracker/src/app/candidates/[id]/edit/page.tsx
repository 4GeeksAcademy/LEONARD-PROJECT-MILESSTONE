import Link from "next/link";
import { CandidateForm } from "@/components/candidates/CandidateForm";
import { getCandidateById } from "@/services/trackerApi";

type EditCandidatePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCandidatePage({ params }: EditCandidatePageProps) {
  const { id } = await params;

  let candidate;

  try {
    candidate = await getCandidateById(id);
  } catch (error) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <article className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <h1 className="text-xl font-black text-red-900">Could not load candidate for editing</h1>
          <p className="mt-2 text-sm text-red-800">{error instanceof Error ? error.message : "Unexpected API error."}</p>
        </article>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-4 px-4 py-8 sm:px-6 lg:px-8">
      <Link href={`/candidates/${id}`} className="text-sm font-semibold text-amber-700">
        Back to candidate profile
      </Link>
      <CandidateForm mode="edit" candidateId={id} initialData={candidate} />
    </main>
  );
}
