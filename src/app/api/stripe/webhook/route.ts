import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!stripe) return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "invalid";
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "payment" && session.metadata?.invoiceId) {
        await prisma.invoice.update({
          where: { id: session.metadata.invoiceId },
          data: {
            status: "paid",
            paidAt: new Date(),
            stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || null,
          },
        });
        if (session.metadata.jobId) {
          await prisma.job.update({ where: { id: session.metadata.jobId }, data: { status: "paid" } });
        }
      }
      if (session.mode === "subscription" && session.metadata?.companyId) {
        await prisma.company.update({
          where: { id: session.metadata.companyId },
          data: {
            plan: session.metadata.plan || "starter",
            planStatus: "active",
            stripeSubId: typeof session.subscription === "string" ? session.subscription : session.subscription?.id || null,
          },
        });
      }
    }
  } catch (e) {
    console.error("Webhook handler error", e);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
