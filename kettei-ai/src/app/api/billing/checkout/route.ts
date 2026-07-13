import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, AuthError } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { getPlan } from "@/lib/config/plans";
import { getStripeClient } from "@/lib/billing/stripe";

const CheckoutSchema = z.object({
  plan: z.enum(["standard", "professional"]),
});

// 注意: 実際のStripeアカウントへの接続・決済動作の確認は行っていない。
// 本番投入前に必ずStripeのテストモードで一連の流れを検証すること。
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json(
        { error: "決済機能は現在準備中です。STRIPE_SECRET_KEYが設定されていません。" },
        { status: 503 },
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "プランの指定が正しくありません。" }, { status: 400 });
    }
    const targetPlan = getPlan(parsed.data.plan);
    if (!targetPlan.monthlyPriceJpy) {
      return NextResponse.json({ error: "このプランは購入できません。" }, { status: 400 });
    }

    const store = getStore();
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.displayName || undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await store.updateProfile(user.id, { stripeCustomerId: customerId });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "jpy",
            product_data: { name: `KETTEI AI ${targetPlan.name}プラン` },
            unit_amount: targetPlan.monthlyPriceJpy,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: { userId: user.id, plan: targetPlan.id },
      },
      metadata: { userId: user.id, plan: targetPlan.id },
      success_url: `${appUrl}/usage?checkout=success`,
      cancel_url: `${appUrl}/usage?checkout=cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401 });
    const message = err instanceof Error ? err.message : "決済処理の開始に失敗しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
