"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireStaff() {
  const session = await auth();
  if (!session?.user?.id || !session.user.companyId) throw new Error("Unauthorized");
  if (session.user.role === "customer") throw new Error("Staff only");
  return session;
}

export async function updateJobStatus(jobId: string, status: string, extra?: { soldById?: string }) {
  const session = await requireStaff();
  const job = await prisma.job.findFirst({
    where: { id: jobId, companyId: session.user.companyId! },
  });
  if (!job) throw new Error("Job not found");

  const data: Record<string, unknown> = { status, updatedAt: new Date() };
  if (status === "sold") {
    data.soldAt = new Date();
    data.soldById = extra?.soldById || session.user.id;
  }
  if (status === "completed" || status === "sold") {
    data.completedAt = data.completedAt || new Date();
  }
  if (status === "paid") {
    // also mark related invoice if exists
  }

  await prisma.job.update({ where: { id: jobId }, data });
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function createJob(form: {
  title: string;
  description?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  address?: string;
  estimateAmount?: number;
  status?: string;
}) {
  const session = await requireStaff();
  const companyId = session.user.companyId!;

  let customer = await prisma.customer.findUnique({
    where: { companyId_email: { companyId, email: form.customerEmail.toLowerCase() } },
  });
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        companyId,
        name: form.customerName,
        email: form.customerEmail.toLowerCase(),
        phone: form.customerPhone,
        address: form.address,
      },
    });
  }

  const job = await prisma.job.create({
    data: {
      companyId,
      customerId: customer.id,
      title: form.title,
      description: form.description,
      status: form.status || "estimate",
      estimateAmount: form.estimateAmount,
      address: form.address || customer.address,
      notes: "",
      privateNotes: "",
    },
  });
  revalidatePath("/jobs");
  return job;
}

export async function markInvoicePaid(invoiceId: string) {
  const session = await requireStaff();
  const inv = await prisma.invoice.findFirst({
    where: { id: invoiceId, companyId: session.user.companyId! },
  });
  if (!inv) throw new Error("Invoice not found");
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: "paid", paidAt: new Date() },
  });
  if (inv.jobId) {
    await prisma.job.update({
      where: { id: inv.jobId },
      data: { status: "paid" },
    });
  }
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return { ok: true };
}
