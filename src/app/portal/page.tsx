"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { useApp } from "@/lib/store";

export default function PortalPage() {
  const { isAuthenticated, isCustomer, currentUser, jobs, invoices, reviews, logout, markInvoicePaid, submitReview } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
    else if (!isCustomer) router.replace("/dashboard");
  }, [isAuthenticated, isCustomer, router]);

  if (!isAuthenticated || !isCustomer || !currentUser) return null;

  // Only jobs that are sold/completed/paid/invoiced are visible in portal
  const myJobs = jobs.filter(
    (j) =>
      j.customerId === currentUser.id &&
      ["sold", "completed", "invoiced", "paid", "in_progress"].includes(j.status)
  );
  const myInvoices = invoices.filter((i) => i.customerId === currentUser.id);
  const pendingReview = reviews.find(
    (r) => r.status === "pending" && myJobs.some((j) => j.id === r.jobId)
  );

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 hidden sm:inline">{currentUser.name}</span>
            <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-red-600">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Portal</h1>
          <p className="text-slate-600 mt-1">View jobs, bills, and leave feedback</p>
        </div>

        {/* Pending review CTA */}
        {pendingReview && (
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-5">
            <h2 className="font-semibold text-sky-900">How was your service?</h2>
            <p className="text-sm text-sky-700 mt-1 mb-4">We’d love a quick review.</p>
            <div className="flex gap-2">
              {[5, 4, 3, 2, 1].map((n) => (
                <button
                  key={n}
                  onClick={() => submitReview(pendingReview.id, n, "Great service!")}
                  className="w-10 h-10 rounded-lg bg-white border border-sky-200 hover:bg-sky-100 text-lg"
                >
                  {n}★
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Jobs */}
        <section>
          <h2 className="font-semibold text-slate-900 mb-3">Your Jobs</h2>
          <div className="space-y-3">
            {myJobs.length === 0 && (
              <p className="text-slate-500 text-sm">No active jobs yet.</p>
            )}
            {myJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <div className="font-medium text-slate-900">{job.title}</div>
                    <div className="text-sm text-slate-500 mt-0.5 capitalize">
                      {job.status.replace("_", " ")}
                      {job.scheduledDate && ` · ${job.scheduledDate}`}
                    </div>
                  </div>
                  <div className="font-semibold text-slate-900">
                    ${(job.invoiceAmount || job.estimateAmount || 0).toLocaleString()}
                  </div>
                </div>
                {job.notes && (
                  <p className="mt-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                    {job.notes}
                  </p>
                )}
                {/* Public files only */}
                {job.files.filter((f) => !f.isPrivate).length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {job.files
                      .filter((f) => !f.isPrivate)
                      .map((f) =>
                        f.url.startsWith("http") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={f.id}
                            src={f.url}
                            alt={f.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : null
                      )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Invoices / Bills */}
        <section>
          <h2 className="font-semibold text-slate-900 mb-3">Bills & Payments</h2>
          <div className="space-y-3">
            {myInvoices.map((inv) => (
              <div
                key={inv.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="font-medium text-slate-900">${inv.amount.toLocaleString()}</div>
                  <div className="text-sm text-slate-500">
                    Due {inv.dueDate} · {inv.status}
                  </div>
                  <ul className="mt-2 text-xs text-slate-600 space-y-0.5">
                    {inv.lineItems.map((li, idx) => (
                      <li key={idx}>
                        {li.description}: ${li.amount}
                      </li>
                    ))}
                  </ul>
                </div>
                {inv.status !== "paid" ? (
                  <button
                    onClick={() => markInvoicePaid(inv.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-sm"
                  >
                    Pay now
                  </button>
                ) : (
                  <span className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
                    Paid
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        <p className="text-center text-xs text-slate-400 pt-4">
          Questions? Reply in the portal or call Apex Home Services.
        </p>
      </main>
    </div>
  );
}
