import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { resend } from "@/lib/resendClient";

// ■ 環境設定
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// ■ メール送信機能（Resend）
async function sendWelcomeEmail(email: string) {
  if (!resend) return;

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "support@kageaccess.com",
      to: email,
      subject: "[Kage] ご契約ありがとうございます！",
      html: `
        <h2>ご契約ありがとうございます！</h2>
        <p>Kage のサブスクリプションが開始されました。</p>
        <p>以下のリンクからダッシュボードにアクセスしてください。</p>
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard">ダッシュボードへ</a></p>
      `,
    });
  } catch (e) {
    console.error("Email send failed:", e);
  }
}

// ■ データベース更新ロジック（ここが核心）
async function upsertSubscription(
  subscription: Stripe.Subscription,
  userIdFromMetadata?: string // 引数でIDを受け取る
) {
  // 1. IDの決定：引数(Session由来) > メタデータ(Subscription由来)
  const userId = userIdFromMetadata || subscription.metadata?.user_id;

  // IDが特定できない場合、ログを出して終了（無理にDB検索しない）
  if (!userId) {
    console.error(`[Error] user_id not found in metadata for sub: ${subscription.id}`);
    return;
  }

  // Email取得（顧客情報から）
  let email = "";
  try {
    if (typeof subscription.customer === "string") {
      const customer = await stripe.customers.retrieve(subscription.customer);
      if (!customer.deleted && customer.email) {
        email = customer.email;
      }
    }
  } catch (error) {
    console.warn(`[Warning] Failed to retrieve customer email: ${error}`);
  }

  // Emailが取得できない場合は既存レコードから取得を試みる
  if (!email) {
    const { data: existing } = await supabaseAdmin
      .from("subscriptions")
      .select("email")
      .eq("stripe_subscription_id", subscription.id)
      .maybeSingle();
    email = existing?.email || "";
  }

  if (!email) {
    console.error(`[Error] Email not found for subscription: ${subscription.id}`);
    return;
  }

  const subscriptionData = {
    user_id: userId,     // 確定したIDを入れる
    email: email,
    stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id ?? null,
    stripe_subscription_id: subscription.id, // unique key
    plan_id: subscription.items.data[0]?.price.id ?? null,
    status: subscription.status,
    cancel_at_period_end: subscription.cancel_at_period_end ?? false,
    current_period_start: subscription.current_period_start ? new Date(subscription.current_period_start * 1000).toISOString() : null,
    current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
  };

  // 2. Supabaseに保存 (Upsert)
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .upsert(subscriptionData, {
      onConflict: "stripe_subscription_id",
    });

  if (error) {
    console.error("[DB Error] Upsert failed:", error);
  } else {
    console.log(`[Success] Subscription updated: ${subscription.id} for User: ${userId}`);
  }

  // 3. 必要に応じてユーザーテーブルのBilling IDも更新
  if (typeof subscription.customer === "string") {
    await supabaseAdmin
      .from("profiles")
      .update({ billing_customer_id: subscription.customer })
      .eq("id", userId);
  }
}

// ■ メイン処理
export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // SessionからSubscription IDを展開して取得
        const subscriptionId = typeof session.subscription === "string" 
          ? session.subscription 
          : session.subscription?.id;

        if (!subscriptionId) {
          console.warn("[Warning] No subscription ID in checkout session");
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        
        // Sessionのメタデータにあるuser_idを明示的に渡す
        await upsertSubscription(subscription, session.metadata?.user_id);
        
        // メール送信
        if (session.customer_details?.email) {
          await sendWelcomeEmail(session.customer_details.email);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        // Subscription更新時は、Subscription自身が持つメタデータを使うので引数は不要
        await upsertSubscription(subscription);
        break;
      }

      // レースコンディション回避のため、作成イベントは無視する（正解）
      case "customer.subscription.created":
        break;
    }
  } catch (error) {
    console.error("Webhook handler failed:", error);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }

  return NextResponse.json({ received: true });
}
