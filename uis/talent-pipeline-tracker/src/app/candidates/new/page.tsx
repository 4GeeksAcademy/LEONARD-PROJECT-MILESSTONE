import Link from "next/link";
import { CandidateForm } from "@/components/candidates/CandidateForm";

export default function NewCandidatePage() {
  return (
    <main className="mx-auto max-w-4xl space-y-4 px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/" className="text-sm font-semibold text-amber-700">
        Back to candidate list
      </Link>
      <CandidateForm mode="create" />
    </main>
  );
}
