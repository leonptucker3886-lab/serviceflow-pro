"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { updateJobStatus } from "@/app/actions/jobs";

const statusColor: Record<string, string> = {
  estimate: "bg-amber-100 text-amber-800", scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-indigo-100 text-indigo-800", completed: "bg-emerald-100 text-emerald-800",
  sold: "bg-green-100 text-green-800", invoiced: "bg-violet-100 text-violet-800",
  paid: "bg-teal-100 text-teal-800", cancelled: "bg-slate-100 text-slate-600",
};

const FILTERS = ["all", "estimate", "scheduled", "in_progress", "completed", "sold", "invoiced", "paid"] as const;

type JobRow = {
  id: string; title: string; status: string;
  estimateAmount: number | null; invoiceAmount: number | null; scheduledDate: string | null;
  customer: { name: string; email: string };
  assignedTo: { id: string; name: string | null } | null;
};

export function JobsList({ jobs }: { jobs: JobRow[] }) {
  const searchParams = useSearchParams();
  const filter = searchParams.get("status") || "all";
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const setFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "all") params.delete("status");
    else params.set("status", status);
    router.push(`/jobs?${params.toString()}`);
  };

  const onStatusChange = (jobId: string, status: string) => {
    startTransition(async () => {
      await updateJobStatus(jobId, status);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition ${
              filter === f ? "bg-sky-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}>{f.replace("_", " ")}</button>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {jobs.length === 0 ? (
          <div className="px-5 py-12 text-center text-slate-500 text-sm">No jobs match this filter.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {jobs.map((job) => (
              <div key={job.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-5 py-4 hover:bg-slate-50/80">
                <Link href={`/jobs/${job.id}`} className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 truncate">{job.title}</div>
                  <div className="text-sm text-slate-500 truncate">
                    {job.customer.name} · {job.assignedTo?.name || "Unassigned"}
                    {job.scheduledDate ? ` · ${job.scheduledDate}` : ""}
                  </div>
                </Link>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColor[job.status] || "bg-slate-100"}`}>
                    {job.status.replace("_", " ")}
                  </span>
                  <div className="text-sm font-semibold text-slate-900 w-20 text-right">
                    ${(job.invoiceAmount || job.estimateAmount || 0).toLocaleString()}
                  </div>
                  <select className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700"
                    value={job.status} disabled={pending} onChange={(e) => onStatusChange(job.id, e.target.value)}>
                    {FILTERS.filter((f) => f !== "all").map((s) => (
                      <option key={s} value={s}>{s.replace("_", " ")}</option>
                    ))}
                    <option value="cancelled">cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
