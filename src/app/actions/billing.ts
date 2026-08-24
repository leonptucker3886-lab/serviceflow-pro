"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, PLANS, type PlanKey } from "@/lib/stripe";

async function requireOwnerOrAdmin() {
  const session = await auth();
  if (!session?.user?.id || !session.user.companyId) throw new Error("Unauthorized");
  if (!["owner", "admin"].includes(session.user.role || "")) throw new Error("Owner or admin only");
  return session;
}

export async function createSubscriptionCheckout(plan: PlanKey) {
  const session = await requireOwnerOrAdmin();
  if (!stripe) throw new Error("Stripe is not configured");
  if (plan === "free") throw new Error("Cannot checkout free plan");
  const priceId = PLANS[plan].priceId;
  if (!priceId) throw new Error(`Price not configured for ${plan}`);

  const company = await prisma.company.findUniqueOrThrow({ where: { id: session.user.companyId! } });
  let customerId = company.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: company.email || session.user.email || undefined,
      name: company.name,
      metadata: { companyId: company.id },
    });
    customerId = customer.id;
    await prisma.company.update({ where: { id: company.id }, data: { stripeCustomerId: customerId } });
  }

  const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard?billing=success`,
    cancel_url: `${baseUrl}/dashboard?billing=cancel`,
    metadata: { companyId: company.id, plan },
  });
  return { url: checkout.url };
}

export async function createInvoiceCheckout(invoiceId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (!stripe) throw new Error("Stripe is not configured");

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      OR: [
        { companyId: session.user.companyId || undefined },
        { customerId: session.user.customerId || undefined },
      ],
    },
    include: { customer: true, company: true, job: true },
  });
  if (!invoice) throw new Error("Invoice not found");
  if (invoice.status === "paid") throw new Error("Already paid");

  const amountCents = Math.round(invoice.amount * 100);
  if (amountCents < 50) throw new Error("Amount too small for Stripe");

  const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: invoice.customer.email,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: amountCents,
        product_data: { name: `Invoice – ${invoice.job.title}`, description: invoice.company.name },
      },
    }],
    success_url: `${baseUrl}/portal?paid=${invoice.id}`,
    cancel_url: `${baseUrl}/portal`,
    metadata: { invoiceId: invoice.id, companyId: invoice.companyId, jobId: invoice.jobId },
  });
  return { url: checkout.url };
}

export async function createBillingPortal() {
  const session = await requireOwnerOrAdmin();
  if (!stripe) throw new Error("Stripe is not configured");
  const company = await prisma.company.findUniqueOrThrow({ where: { id: session.user.companyId! } });
  if (!company.stripeCustomerId) throw new Error("No billing account yet.");
  const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const portal = await stripe.billingPortal.sessions.create({
    customer: company.stripeCustomerId,
    return_url: `${baseUrl}/dashboard`,
  });
  return { url: portal.url };
}

export async function createPortalCheckoutAction(formData: FormData) {
  const invoiceId = String(formData.get("invoiceId") || "");
  if (!invoiceId) throw new Error("Missing invoice");
  const result = await createInvoiceCheckout(invoiceId);
  if (result.url) {
    const { redirect } = await import("next/navigation");
    redirect(result.url);
  }
  throw new Error("Could not create checkout");
}
