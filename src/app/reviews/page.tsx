"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { StaffShell } from "@/components/StaffShell";
import { useApp } from "@/lib/store";

export default function ReviewsPage() {
  const { isAuthenticated, isStaff, reviews } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
    else if (!isStaff) router.replace("/portal");
  }, [isAuthenticated, isStaff, router]);

  if (!isAuthenticated || !isStaff) return null;

  return (
    <StaffShell>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reviews</h1>
          <p className="text-slate-600 text-sm mt-0.5">
            Collect and manage customer feedback after jobs
          </p>
        </div>

        <div className="grid gap-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-slate-900">{r.customerName}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {r.status === "pending" ? "Review requested" : `Submitted ${r.createdAt.slice(0, 10)}`}
                  </div>
                </div>
                {r.status === "published" ? (
                  <div className="flex gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>{i < r.rating ? "★" : "☆"}</span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    Pending
                  </span>
                )}
              </div>
              {r.comment && <p className="mt-3 text-slate-700 text-sm">{r.comment}</p>}
            </div>
          ))}
        </div>
      </div>
    </StaffShell>
  );
}
