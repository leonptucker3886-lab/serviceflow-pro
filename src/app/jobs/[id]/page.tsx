import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/session";
import { getJobById } from "@/lib/queries";
import { StaffShell } from "@/components/StaffShell";
import { JobStatusControls } from "@/components/JobStatusControls";

const statusColor: Record<string, string> = {
  estimate: "bg-amber-100 text-amber-800", scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-indigo-100 text-indigo-800", completed: "bg-emerald-100 text-emerald-800",
  sold: "bg-green-100 text-green-800", invoiced: "bg-violet-100 text-violet-800",
  paid: "bg-teal-100 text-teal-800", cancelled: "bg-slate-100 text-slate-600",
};

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaff();
  const { id } = await params;
  const job = await getJobById(session.user.companyId!, id);
  if (!job) notFound();

  return (
    <StaffShell userName={session.user.name} userRole={session.user.role} companyName={session.user.companyName}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <Link href="/jobs" className="text-sm text-sky-600 font-medium">← Jobs</Link>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">{job.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${statusColor[job.status] || "bg-slate-100"}`}>
                {job.status.replace("_", " ")}
              </span>
              <span className="text-sm text-slate-500">${(job.invoiceAmount || job.estimateAmount || 0).toLocaleString()}</span>
            </div>
          </div>
          <JobStatusControls jobId={job.id} currentStatus={job.status} />
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h2 className="font-semibold text-slate-900 mb-3">Details</h2>
              <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-slate-500">Customer</dt>
                  <dd className="font-medium text-slate-900">{job.customer.name}</dd>
                  <dd className="text-slate-600">{job.customer.email}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Assigned to</dt>
                  <dd className="font-medium text-slate-900">{job.assignedTo?.name || "Unassigned"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Address</dt>
                  <dd className="font-medium text-slate-900">{job.address || "—"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Schedule</dt>
                  <dd className="font-medium text-slate-900">{job.scheduledDate || "Not scheduled"}{job.scheduledTime ? ` · ${job.scheduledTime}` : ""}</dd>
                </div>
              </dl>
              {job.description && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="text-slate-500 text-sm">Description</div>
                  <div className="text-slate-800 text-sm mt-1 whitespace-pre-wrap">{job.description}</div>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-semibold text-slate-900 mb-3">Timeline</h2>
            <ul className="text-sm space-y-2 text-slate-600">
              <li>Created {job.createdAt.toLocaleDateString()}</li>
              {job.soldAt && <li>Sold {job.soldAt.toLocaleDateString()}</li>}
              {job.completedAt && <li>Completed {job.completedAt.toLocaleDateString()}</li>}
            </ul>
          </div>
        </div>
      </div>
    </StaffShell>
  );
}
