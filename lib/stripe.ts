import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2026-04-22.dahlia",
});

export const PLANS = {
  monthly: {
    priceId: process.env.STRIPE_PRICE_MONTHLY || "",
    price: 99,
    label: "99 RON/lună",
    interval: "month" as const,
  },
  annual: {
    priceId: process.env.STRIPE_PRICE_ANNUAL || "",
    price: 79,
    label: "79 RON/lună (948 RON/an)",
    interval: "year" as const,
  },
};
