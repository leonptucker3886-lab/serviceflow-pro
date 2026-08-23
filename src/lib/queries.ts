import { prisma } from "@/lib/prisma";
import { startOfDay, startOfWeek, startOfMonth } from "date-fns";

export async function getCompanyJobs(companyId: string, status?: string) {
  return prisma.job.findMany({
    where: {
      companyId,
      ...(status && status !== "all" ? { status } : {}),
    },
    include: {
      customer: true,
      assignedTo: { select: { id: true, name: true } },
      soldBy: { select: { id: true, name: true } },
      invoice: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getJobById(companyId: string, jobId: string) {
  return prisma.job.findFirst({
    where: { id: jobId, companyId },
    include: {
      customer: true,
      assignedTo: { select: { id: true, name: true, email: true } },
      soldBy: { select: { id: true, name: true } },
      files: true,
      invoice: true,
      reviews: true,
    },
  });
}

export async function getDashboardData(companyId: string) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);

  const [jobs, soldJobs, recentJobs, staff] = await Promise.all([
    prisma.job.findMany({
      where: { companyId },
      include: {
        customer: true,
        assignedTo: { select: { id: true, name: true } },
        soldBy: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.job.findMany({
      where: {
        companyId,
        status: { in: ["sold", "invoiced", "paid"] },
        soldAt: { not: null },
      },
      include: {
        soldBy: { select: { id: true, name: true } },
      },
    }),
    prisma.job.findMany({
      where: { companyId },
      include: {
        customer: true,
        assignedTo: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
    prisma.membership.findMany({
      where: { companyId, role: { not: "customer" } },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  const sum = (list: typeof soldJobs) =>
    list.reduce((acc, j) => acc + (j.invoiceAmount || j.estimateAmount || 0), 0);

  const todayJobs = soldJobs.filter((j) => j.soldAt && j.soldAt >= todayStart);
  const weekJobs = soldJobs.filter((j) => j.soldAt && j.soldAt >= weekStart);
  const monthJobs = soldJobs.filter((j) => j.soldAt && j.soldAt >= monthStart);

  const times = soldJobs.filter((j) => j.timeSpentMinutes).map((j) => j.timeSpentMinutes!);
  const avgCompletionMinutes = times.length
    ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
    : 0;

  const metrics = {
    totalSalesToday: sum(todayJobs),
    totalSalesWeek: sum(weekJobs),
    totalSalesMonth: sum(monthJobs),
    jobsSoldToday: todayJobs.length,
    jobsSoldWeek: weekJobs.length,
    jobsSoldMonth: monthJobs.length,
    avgCompletionMinutes,
    openJobs: jobs.filter((j) =>
      ["estimate", "scheduled", "in_progress"].includes(j.status)
    ).length,
    totalJobs: jobs.length,
  };

  const byUser = new Map<string, { name: string; salesAmount: number; jobsSold: number }>();
  for (const j of weekJobs) {
    const uid = j.soldById || "unknown";
    const name = j.soldBy?.name || "Unknown";
    const cur = byUser.get(uid) || { name, salesAmount: 0, jobsSold: 0 };
    cur.salesAmount += j.invoiceAmount || j.estimateAmount || 0;
    cur.jobsSold += 1;
    byUser.set(uid, cur);
  }
  const leaderboard = Array.from(byUser.entries())
    .map(([userId, v]) => ({ userId, ...v }))
    .sort((a, b) => b.salesAmount - a.salesAmount);

  return {
    metrics,
    recentJobs,
    leaderboard,
    staff: staff.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
    })),
  };
}
