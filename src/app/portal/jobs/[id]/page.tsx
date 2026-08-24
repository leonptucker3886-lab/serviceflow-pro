import { requireCustomer } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortalShell, StatusBadge, type PortalBrand } from "@/components/portal/PortalShell";
import { format } from "date-fns";

const STATUS_STEPS = [
  { key: "estimate", label: "Estimate" },
  { key: "scheduled", label: "Scheduled" },
  { key: "in_progress", label: "In progress" },
  { key: "completed", label: "Completed" },
];

export default async function PortalJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireCustomer();
  const customerId = session.user.customerId!;
  const companyId = session.user.companyId!;

  const [company, job] = await Promise.all([
    prisma.company.findUniqueOrThrow({ where: { id: companyId } }),
    prisma.job.findFirst({
      where: { id, customerId },
      include: {
        assignedTo: { select: { name: true, image: true } },
        files: { where: { isPrivate: false }, orderBy: { uploadedAt: "desc" } },
        invoice: true,
        reviews: true,
      },
    }),
  ]);

  if (!job) notFound();

  const brand: PortalBrand = {
    name: company.name,
    logoUrl: company.logoUrl,
    primaryColor: company.primaryColor || "#0ea5e9",
    secondaryColor: company.secondaryColor || "#0f172a",
    accentColor: company.accentColor || "#22c55e",
    showPoweredBy: company.showPoweredBy ?? true,
    supportPhone: company.supportPhone || company.phone,
    supportEmail: company.supportEmail || company.email,
  };

  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === job.status);
  const stepIndex = currentIdx >= 0 ? currentIdx : job.status === "cancelled" ? -1 : 0;

  return (
    <PortalShell brand={brand} userName={session.user.name} active="jobs">
      <div className="mb-4">
        <Link href="/portal/jobs" className="text-sm text-slate-500 hover:text-slate-800">
          ← All jobs
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{job.title}</h1>
              <div className="mt-2">
                <StatusBadge status={job.status} brand={brand} />
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                ${(job.invoiceAmount || job.estimateAmount || 0).toLocaleString()}
              </div>
              <div className="text-xs text-slate-500">
                {job.invoiceAmount ? "Invoice" : "Estimate"}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        {job.status !== "cancelled" && (
          <div className="px-5 sm:px-6 py-5 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Progress</h2>
            <div className="flex items-center gap-1">
              {STATUS_STEPS.map((step, i) => {
                const done = i <= stepIndex;
                const current = i === stepIndex;
                return (
                  <div key={step.key} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-full h-1.5 rounded-full mb-2 ${
                        done ? "" : "bg-slate-200"
                      }`}
                      style={done ? { backgroundColor: brand.primaryColor } : undefined}
                    />
                    <span
                      className={`text-[10px] sm:text-xs font-medium ${
                        current ? "text-slate-900" : done ? "text-slate-600" : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-5">
          {job.description && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Description
              </h3>
              <p className="text-slate-800 text-sm whitespace-pre-wrap">{job.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {job.scheduledDate && (
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Scheduled
                </h3>
                <p className="text-slate-800">
                  {job.scheduledDate}
                  {job.scheduledTime ? ` at ${job.scheduledTime}` : ""}
                </p>
              </div>
            )}
            {job.address && (
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Address
                </h3>
                <p className="text-slate-800">{job.address}</p>
              </div>
            )}
            {job.assignedTo && (
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Technician
                </h3>
                <p className="text-slate-800">{job.assignedTo.name}</p>
              </div>
            )}
            {job.completedAt && (
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Completed
                </h3>
                <p className="text-slate-800">
                  {format(new Date(job.completedAt), "MMM d, yyyy")}
                </p>
              </div>
            )}
          </div>

          {job.files.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Photos & documents
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {job.files.map((f) => (
                  <a
                    key={f.id}
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    className="aspect-square rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-xs text-slate-500 hover:border-slate-300"
                  >
                    {f.mimeType?.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                    ) : (
                      f.name
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          {job.invoice && (
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-slate-900">Invoice</div>
                  <div className="text-sm text-slate-500 mt-0.5">
                    <StatusBadge status={job.invoice.status} brand={brand} />
                    {" · "}${job.invoice.amount.toLocaleString()}
                  </div>
                </div>
                {["sent", "overdue"].includes(job.invoice.status) && (
                  <Link
                    href="/portal/invoices"
                    className="px-4 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90"
                    style={{ backgroundColor: brand.accentColor }}
                  >
                    Pay now
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PortalShell>
  );
}
