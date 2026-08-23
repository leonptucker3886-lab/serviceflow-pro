import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("placeholder")
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { typescript: true })
  : null;

export const PLANS = {
  free: { name: "Free", priceId: null as string | null },
  starter: { name: "Starter", priceId: process.env.STRIPE_PRICE_STARTER || null },
  pro: { name: "Pro", priceId: process.env.STRIPE_PRICE_PRO || null },
} as const;

export type PlanKey = keyof typeof PLANS;
