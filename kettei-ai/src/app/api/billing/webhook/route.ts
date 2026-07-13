import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/billing/stripe";
import { getStore } from "@/lib/db";

// Stripe Webhook。署名検証のため必ずrawボディを使用すること（JSONパース済みボディでは検証できない）。
// 注意: 実際のStripeアカウントからのWebhook配信での動作確認は行っていない。
// 本番投入前にStripe CLI（`stripe listen`）等でテストすること。
export async function POST(request: Request) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "決済Webhookは未設定です。" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "署名がありません。" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid signature";
    return NextResponse.json({ error: `Webhook署名の検証に失敗しました: ${message}` }, { status: 400 });
  }

  const store = getStore();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;
      if (userId && (plan === "standard" || plan === "professional")) {
        await store.updateProfile(userId, {
          plan,
          stripeCustomerId: typeof session.customer === "string" ? session.customer : (session.customer?.id ?? null),
          stripeSubscriptionId:
            typeof session.subscription === "string" ? session.subscription : (session.subscription?.id ?? null),
        });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      if (userId) {
        await store.updateProfile(userId, { plan: "free", stripeSubscriptionId: null });
      }
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      const plan = subscription.metadata?.plan;
      if (userId && (plan === "standard" || plan === "professional")) {
        const isActive = subscription.status === "active" || subscription.status === "trialing";
        await store.updateProfile(userId, { plan: isActive ? plan : "free" });
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
