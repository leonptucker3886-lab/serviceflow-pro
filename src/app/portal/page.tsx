import { requireCustomer } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";

export default async function PortalPage() {
  const session = await requireCustomer();
  const customerId = session.user.customerId!;
  const [jobs, invoices] = await Promise.all([
    prisma.job.findMany({ where: { customerId }, orderBy: { updatedAt: "desc" }, take: 20 }),
    prisma.invoice.findMany({ where: { customerId }, include: { job: true }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-600">{session.user.name}</span>
            <form action={logoutAction}><button type="submit" className="text-slate-500 hover:text-red-600">Sign out</button></form>
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer portal</h1>
          <p className="text-slate-500 text-sm mt-1">{session.user.companyName}</p>
        </div>
        <section>
          <h2 className="font-semibold text-slate-900 mb-3">Your jobs</h2>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {jobs.length === 0 && <div className="p-6 text-sm text-slate-500 text-center">No jobs yet.</div>}
            {jobs.map((j) => (
              <div key={j.id} className="px-4 py-3 flex justify-between gap-3">
                <div>
                  <div className="font-medium text-slate-900">{j.title}</div>
                  <div className="text-xs text-slate-500 capitalize">{j.status.replace("_", " ")}</div>
                </div>
                <div className="text-sm font-semibold text-slate-900">${(j.invoiceAmount || j.estimateAmount || 0).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="font-semibold text-slate-900 mb-3">Invoices</h2>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {invoices.length === 0 && <div className="p-6 text-sm text-slate-500 text-center">No invoices.</div>}
            {invoices.map((inv) => (
              <div key={inv.id} className="px-4 py-3 flex justify-between gap-3">
                <div>
                  <div className="font-medium text-slate-900">{inv.job.title}</div>
                  <div className="text-xs capitalize text-slate-500">{inv.status}</div>
                </div>
                <div className="text-sm font-semibold text-slate-900">${inv.amount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </section>
        <p className="text-center text-sm text-slate-400"><Link href="/" className="hover:text-sky-600">Service-Link</Link></p>
      </main>
    </div>
  );
}
