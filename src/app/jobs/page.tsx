import Link from "next/link";
import { Suspense } from "react";
import { requireStaff } from "@/lib/session";
import { getCompanyJobs } from "@/lib/queries";
import { StaffShell } from "@/components/StaffShell";
import { JobsList } from "@/components/JobsList";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await requireStaff();
  const params = await searchParams;
  const status = params.status || "all";
  const jobs = await getCompanyJobs(session.user.companyId!, status === "all" ? undefined : status);

  const rows = jobs.map((j) => ({
    id: j.id,
    title: j.title,
    status: j.status,
    estimateAmount: j.estimateAmount,
    invoiceAmount: j.invoiceAmount,
    scheduledDate: j.scheduledDate,
    customer: { name: j.customer.name, email: j.customer.email },
    assignedTo: j.assignedTo,
  }));

  return (
    <StaffShell userName={session.user.name} userRole={session.user.role} companyName={session.user.companyName}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Jobs</h1>
            <p className="text-slate-500 text-sm mt-0.5">{jobs.length} jobs</p>
          </div>
          <Link href="/jobs/new" className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold">
            + New job
          </Link>
        </div>
        <Suspense fallback={<div className="text-slate-500 text-sm">Loading jobs…</div>}>
          <JobsList jobs={rows} />
        </Suspense>
      </div>
    </StaffShell>
  );
}
