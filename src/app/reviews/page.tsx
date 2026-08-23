import { requireStaff } from "@/lib/session";
import { StaffShell } from "@/components/StaffShell";
import { prisma } from "@/lib/prisma";

export default async function ReviewsPage() {
  const session = await requireStaff();
  const reviews = await prisma.review.findMany({
    where: { companyId: session.user.companyId! },
    include: { job: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <StaffShell userName={session.user.name} userRole={session.user.role} companyName={session.user.companyName}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Reviews</h1>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          {reviews.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No reviews yet.</div>}
          {reviews.map((r) => (
            <div key={r.id} className="px-5 py-3.5">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium text-slate-900">{r.customerName}</div>
                <div className="text-xs capitalize text-slate-500">{r.status}</div>
              </div>
              <div className="text-sm text-slate-500 mt-0.5">{r.job.title}</div>
              {r.rating > 0 && <div className="text-amber-500 mt-1">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>}
              {r.comment && <p className="text-sm text-slate-700 mt-1">{r.comment}</p>}
            </div>
          ))}
        </div>
      </div>
    </StaffShell>
  );
}
