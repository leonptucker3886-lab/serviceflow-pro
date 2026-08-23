"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StaffShell } from "@/components/StaffShell";
import { useApp } from "@/lib/store";

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
  const { isAuthenticated, isStaff, jobs, users, addJob, currentUser } = useApp();
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    address: "",
    estimateAmount: "",
    assignedTo: "",
    scheduledDate: "",
    scheduledTime: "09:00",
    notes: "",
    privateNotes: "",
    status: "estimate" as const,
  });

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
    else if (!isStaff) router.replace("/portal");
  }, [isAuthenticated, isStaff, router]);

  if (!isAuthenticated || !isStaff) return null;

  const staff = users.filter((u) => u.role !== "customer");
  const filtered = filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const assigned = staff.find((u) => u.id === form.assignedTo);
    addJob({
      companyId: "comp_apex",
      customerId: form.customerEmail.includes("john")
        ? "user_cust1"
        : form.customerEmail.includes("emily")
        ? "user_cust2"
        : `cust_${Date.now()}`,
      customerName: form.customerName,
      customerEmail: form.customerEmail,
      customerPhone: form.customerPhone,
      title: form.title,
      description: form.description,
      status: form.status,
      assignedTo: form.assignedTo || undefined,
      assignedName: assigned?.name,
      estimateAmount: form.estimateAmount ? Number(form.estimateAmount) : undefined,
      scheduledDate: form.scheduledDate || undefined,
      scheduledTime: form.scheduledTime || undefined,
      address: form.address,
      notes: form.notes,
      privateNotes: form.privateNotes,
      soldBy: form.status === "sold" ? currentUser?.id : undefined,
    });
    setShowForm(false);
    setForm({
      title: "",
      description: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      address: "",
      estimateAmount: "",
      assignedTo: "",
      scheduledDate: "",
      scheduledTime: "09:00",
      notes: "",
      privateNotes: "",
      status: "estimate",
    });
  };

  return (
    <StaffShell>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Jobs & Estimates</h1>
            <p className="text-slate-600 text-sm mt-0.5">{jobs.length} total</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm shadow-sm"
          >
            {showForm ? "Cancel" : "+ New Estimate / Job"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4"
          >
            <h2 className="font-semibold text-slate-900 text-lg">Create Estimate / Job</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Job title *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  placeholder="e.g. AC repair & tune-up"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  rows={2}
                  placeholder="What needs to be done..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Customer name *</label>
                <input
                  required
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Customer email</label>
                <input
                  type="email"
                  value={form.customerEmail}
                  onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  placeholder="john.smith@email.com for demo portal"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                <input
                  value={form.customerPhone}
                  onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Estimate $</label>
                <input
                  type="number"
                  value={form.estimateAmount}
                  onChange={(e) => setForm({ ...form, estimateAmount: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  placeholder="350"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Service address</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Assign to</label>
                <select
                  value={form.assignedTo}
                  onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                >
                  <option value="">Unassigned</option>
                  {staff.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as "estimate" })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                >
                  <option value="estimate">Estimate</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Schedule date</label>
                <input
                  type="date"
                  value={form.scheduledDate}
                  onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Time</label>
                <input
                  type="time"
                  value={form.scheduledTime}
                  onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Public notes (customer sees)</label>
                <input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Private notes (company only)</label>
                <input
                  value={form.privateNotes}
                  onChange={(e) => setForm({ ...form, privateNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-5 py-2.5 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

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
              <div className="px-5 py-10 text-center text-slate-500">
                No jobs yet. Tap “+ New Estimate / Job” to create one.
              </div>
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
                  <span
                    className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                      statusColor[job.status]
                    }`}
                  >
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
