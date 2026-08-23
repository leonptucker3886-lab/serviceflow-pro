"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createJob } from "@/app/actions/jobs";
import { Logo } from "@/components/Logo";

export default function NewJobPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const estimateRaw = String(fd.get("estimateAmount") || "").trim();
    startTransition(async () => {
      try {
        const job = await createJob({
          title: String(fd.get("title") || "").trim(),
          description: String(fd.get("description") || "").trim() || undefined,
          customerName: String(fd.get("customerName") || "").trim(),
          customerEmail: String(fd.get("customerEmail") || "").trim(),
          customerPhone: String(fd.get("customerPhone") || "").trim() || undefined,
          address: String(fd.get("address") || "").trim() || undefined,
          estimateAmount: estimateRaw ? Number(estimateRaw) : undefined,
          status: "estimate",
        });
        router.push(`/jobs/${job.id}`);
        router.refresh();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Could not create job.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-xl mx-auto px-4 py-8">
        <Link href="/jobs" className="text-sm text-sky-600 font-medium">← Back to jobs</Link>
        <div className="mt-4 mb-6 flex items-center gap-3">
          <Logo size="sm" />
          <h1 className="text-xl font-bold text-slate-900">New job</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input name="title" required className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea name="description" rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-none" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Customer name</label>
              <input name="customerName" required className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Customer email</label>
              <input name="customerEmail" type="email" required className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input name="customerPhone" className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estimate ($)</label>
              <input name="estimateAmount" type="number" min="0" step="0.01" className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <input name="address" className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 outline-none" />
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>}
          <button type="submit" disabled={pending} className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-semibold">
            {pending ? "Creating…" : "Create job"}
          </button>
        </form>
      </div>
    </div>
  );
}
