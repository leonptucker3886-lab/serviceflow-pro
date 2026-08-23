"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StaffShell } from "@/components/StaffShell";
import { useApp } from "@/lib/store";
import { JobStatus } from "@/lib/types";

const statusColor: Record<string, string> = {
  estimate: "bg-amber-100 text-amber-800",
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-indigo-100 text-indigo-800",
  completed: "bg-emerald-100 text-emerald-800",
  sold: "bg-sky-100 text-sky-800",
  invoiced: "bg-violet-100 text-violet-800",
  paid: "bg-green-100 text-green-800",
  cancelled: "bg-slate-100 text-slate-600",
};

export default function JobsPage() {
  const { isAuthenticated, isStaff, jobs } = useApp();
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
    else if (!isStaff) router.replace("/portal");
  }, [isAuthenticated, isStaff, router]);

  if (!isAuthenticated || !isStaff) return null;

  const filtered =
    filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

  return (
    <StaffShell>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Jobs</h1>
            <p className="text-slate-600 text-sm mt-0.5">{jobs.length} total jobs</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {["all", "estimate", "scheduled", "in_progress", "sold", "paid"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                filter === s
                  ? "bg-sky-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {s === "all" ? "All" : s.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-2 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <div className="col-span-4">Job</div>
            <div className="col-span-2">Customer</div>
            <div className="col-span-2">Assigned</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>
          <div className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <div className="px-5 py-10 text-center text-slate-500">No jobs match this filter.</div>
            )}
            {filtered.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-2 px-5 py-4 hover:bg-slate-50 transition items-center"
              >
                <div className="sm:col-span-4">
                  <div className="font-medium text-slate-900">{job.title}</div>
                  <div className="text-xs text-slate-500 sm:hidden mt-0.5">
                    {job.customerName} · {job.status.replace("_", " ")}
                  </div>
                </div>
                <div className="hidden sm:block sm:col-span-2 text-sm text-slate-600 truncate">
                  {job.customerName}
                </div>
                <div className="hidden sm:block sm:col-span-2 text-sm text-slate-600">
                  {job.assignedName || "—"}
                </div>
                <div className="hidden sm:block sm:col-span-2">
                  <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[job.status]}`}>
                    {job.status.replace("_", " ")}
                  </span>
                </div>
                <div className="sm:col-span-2 text-right font-semibold text-slate-900">
                  ${(job.invoiceAmount || job.estimateAmount || 0).toLocaleString()}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </StaffShell>
  );
}
