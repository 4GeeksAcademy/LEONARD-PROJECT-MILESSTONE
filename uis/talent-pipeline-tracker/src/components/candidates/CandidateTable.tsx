import Link from "next/link";
import { formatEnumLabel } from "@/lib/format";
import type { CandidateRecord } from "@/types/tracker";

type CandidateTableProps = {
  candidates: CandidateRecord[];
};

export function CandidateTable({ candidates }: CandidateTableProps) {
  if (candidates.length === 0) {
    return (
      <article className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-slate-600">
        No candidates match the current filters.
      </article>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="px-4 py-3 font-semibold">Candidate</th>
            <th className="px-4 py-3 font-semibold">Position</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Stage</th>
            <th className="px-4 py-3 font-semibold">Details</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => (
            <tr key={candidate.id} className="border-t border-slate-200">
              <td className="px-4 py-3">
                <p className="font-semibold text-slate-900">{candidate.full_name}</p>
                <p className="text-xs text-slate-500">{candidate.email}</p>
              </td>
              <td className="px-4 py-3 text-slate-700">{candidate.position}</td>
              <td className="px-4 py-3 text-slate-700">{formatEnumLabel(candidate.status)}</td>
              <td className="px-4 py-3 text-slate-700">{formatEnumLabel(candidate.stage)}</td>
              <td className="px-4 py-3">
                <Link
                  href={`/candidates/${candidate.id}`}
                  className="inline-flex rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white"
                >
                  Open Profile
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
