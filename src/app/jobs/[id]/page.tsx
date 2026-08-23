"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StaffShell } from "@/components/StaffShell";
import { useApp } from "@/lib/store";
import { JobStatus } from "@/lib/types";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isAuthenticated, isStaff, jobs, updateJobStatus, requestReview, currentUser } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
    else if (!isStaff) router.replace("/portal");
  }, [isAuthenticated, isStaff, router]);

  if (!isAuthenticated || !isStaff) return null;

  const job = jobs.find((j) => j.id === id);
  if (!job) {
    return (
      <StaffShell>
        <div className="text-center py-20">
          <p className="text-slate-500">Job not found.</p>
          <Link href="/jobs" className="text-sky-600 mt-2 inline-block">
            ← Back to jobs
          </Link>
        </div>
      </StaffShell>
    );
  }

  const statuses: JobStatus[] = ["estimate", "scheduled", "in_progress", "completed", "sold", "invoiced", "paid"];

  const handleStatus = (status: JobStatus) => {
    updateJobStatus(job.id, status, {
      soldBy: status === "sold" ? currentUser?.id : job.soldBy,
    });
  };

  return (
    <StaffShell>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href="/jobs" className="text-sm text-sky-600 hover:text-sky-700 mb-2 inline-block">
              ← All jobs
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
            <p className="text-slate-600 mt-1">{job.customerName} · {job.address}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900">
              ${(job.invoiceAmount || job.estimateAmount || 0).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">
              {job.invoiceAmount ? "Invoice" : "Estimate"}
            </div>
          </div>
        </div>

        {/* Status pipeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Status</div>
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => handleStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition ${
                  job.status === s
                    ? "bg-sky-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {s.replace("_", " ")}
              </button>
            ))}
          </div>
          {job.status === "sold" || job.status === "completed" || job.status === "paid" ? (
            <p className="mt-3 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
              ✓ Job is visible in the customer portal. Files marked public are shared; private files stay internal.
            </p>
          ) : null}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Details */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h2 className="font-semibold text-slate-900">Details</h2>
            <div>
              <div className="text-xs text-slate-500">Description</div>
              <p className="text-slate-800 mt-0.5">{job.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-500">Assigned</div>
                <p className="font-medium">{job.assignedName || "—"}</p>
              </div>
              <div>
                <div className="text-xs text-slate-500">Scheduled</div>
                <p className="font-medium">
                  {job.scheduledDate ? `${job.scheduledDate} ${job.scheduledTime || ""}` : "—"}
                </p>
              </div>
              <div>
                <div className="text-xs text-slate-500">Time spent</div>
                <p className="font-medium">{job.timeSpentMinutes ? `${job.timeSpentMinutes} min` : "—"}</p>
              </div>
              <div>
                <div className="text-xs text-slate-500">Sold by</div>
                <p className="font-medium">{job.soldBy ? "Team member" : "—"}</p>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Public notes (customer can see)</div>
              <p className="text-slate-800 mt-0.5 whitespace-pre-wrap">{job.notes || "—"}</p>
            </div>
          </div>

          {/* Private + Files */}
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-amber-700 font-semibold text-sm">🔒 Private (company only)</span>
              </div>
              <p className="text-slate-800 text-sm whitespace-pre-wrap">
                {job.privateNotes || "No private notes yet."}
              </p>
              <p className="text-xs text-amber-700 mt-3">
                This section is never shared with the customer portal.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-3">Files & Photos</h2>
              {job.files.length === 0 ? (
                <p className="text-sm text-slate-500">No files attached.</p>
              ) : (
                <div className="space-y-3">
                  {job.files.map((f) => (
                    <div key={f.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                      {f.url.startsWith("http") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={f.url} alt={f.name} className="w-12 h-12 object-cover rounded" />
                      ) : (
                        <div className="w-12 h-12 bg-slate-200 rounded flex items-center justify-center text-xs">
                          FILE
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{f.name}</div>
                        <div className="text-xs text-slate-500">
                          {f.isPrivate ? "🔒 Private" : "Visible to customer"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {(job.status === "completed" || job.status === "sold" || job.status === "paid") && (
              <button
                onClick={() => requestReview(job.id)}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-2.5 rounded-lg transition"
              >
                Request Customer Review
              </button>
            )}
          </div>
        </div>
      </div>
    </StaffShell>
  );
}
