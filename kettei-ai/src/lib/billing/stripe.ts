import Stripe from "stripe";

let cached: Stripe | null = null;

// Stripeクライアントの取得。STRIPE_SECRET_KEY未設定の場合はnullを返し、
// 呼び出し側で「決済機能は未設定です」という明確なエラーを表示する。
export function getStripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  if (cached) return cached;
  cached = new Stripe(secretKey);
  return cached;
}

export function isBillingConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
