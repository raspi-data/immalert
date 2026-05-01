import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;
      if (!userId || !plan) break;

      await prisma.user.update({
        where: { id: userId },
        data: { subscriptionStatus: "active" },
      });

      await prisma.subscription.create({
        data: {
          userId,
          stripeSubscriptionId: session.subscription as string,
          plan,
          status: "active",
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const existingSub = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: sub.id },
      });
      if (!existingSub) break;

      const status = sub.status === "active" ? "active" : sub.status === "canceled" ? "canceled" : "inactive";
      const periodEnd = (sub as unknown as { current_period_end?: number }).current_period_end;
      await prisma.subscription.update({
        where: { stripeSubscriptionId: sub.id },
        data: {
          status,
          currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
        },
      });

      await prisma.user.update({
        where: { id: existingSub.userId },
        data: { subscriptionStatus: status },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const existingSub = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: sub.id },
      });
      if (!existingSub) break;

      await prisma.subscription.update({
        where: { stripeSubscriptionId: sub.id },
        data: { status: "canceled" },
      });
      await prisma.user.update({
        where: { id: existingSub.userId },
        data: { subscriptionStatus: "canceled" },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
