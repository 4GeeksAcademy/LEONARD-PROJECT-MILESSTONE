import Link from "next/link";
import { CandidateFilters } from "@/components/candidates/CandidateFilters";
import { CandidateTable } from "@/components/candidates/CandidateTable";
import { getCandidates } from "@/services/trackerApi";

type HomePageProps = {
  searchParams: Promise<{
    status?: string;
    stage?: string;
    search?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;

  let response;

  try {
    response = await getCandidates({
      status: params.status,
      stage: params.stage,
      search: params.search,
      limit: 100,
    });
  } catch (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <article className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <h1 className="text-xl font-black text-red-900">Could not load candidate list</h1>
          <p className="mt-2 text-sm text-red-800">
            {error instanceof Error ? error.message : "Unexpected API error while loading records."}
          </p>
        </article>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-5 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Brasaland People and Culture</p>
          <h1 className="text-3xl font-black text-slate-900">Talent Pipeline Tracker</h1>
          <p className="text-sm text-slate-600">Recruitment control desk for active campaigns across Colombia and Florida.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="http://localhost:3000/project-shell.html"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Milestone Navigator
          </a>
          <Link href="/candidates/new" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white">
            Register New Candidate
          </Link>
        </div>
      </header>

      <CandidateFilters />
      <p className="text-sm text-slate-600">Showing {response.data.length} of {response.total} candidates.</p>
      <CandidateTable candidates={response.data} />
    </main>
  );
}
