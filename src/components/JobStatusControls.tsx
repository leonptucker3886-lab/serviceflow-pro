"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateJobStatus } from "@/app/actions/jobs";

const STATUSES = ["estimate","scheduled","in_progress","completed","sold","invoiced","paid","cancelled"];

export function JobStatusControls({ jobId, currentStatus }: { jobId: string; currentStatus: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <select className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium"
      value={currentStatus} disabled={pending}
      onChange={(e) => startTransition(async () => { await updateJobStatus(jobId, e.target.value); router.refresh(); })}>
      {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
    </select>
  );
}
