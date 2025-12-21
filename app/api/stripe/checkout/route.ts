import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // サーバー側で動く正しいクライアント

// Stripeの初期化（バージョンは2024-06-20で固定）
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20", 
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // frontendから interval も受け取る
    const { userId, plan, interval } = body; 

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    console.log(`[Checkout] Plan: ${plan}, Interval: ${interval}`);

    // ■ 価格ID決定ロジック (ここを修正！ NEXT_PUBLIC_ をつける)
    let targetPriceId = "";
    
    if (plan === "light") {
      if (interval === "yearly") {
        // Vercelの設定名に合わせて NEXT_PUBLIC_ をつける
        targetPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_LIGHT_YEARLY!;
      } else {
        targetPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_LIGHT_MONTHLY!;
      }
    } 
    else if (plan === "standard") {
      if (interval === "yearly") {
        targetPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD_YEARLY!;
      } else {
        targetPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD_MONTHLY!;
      }
    }

    if (!targetPriceId) {
      console.error("[Error] Price ID is missing. Check env variables.");
      return NextResponse.json({ error: "Price ID not found configuration" }, { status: 500 });
    }

    // ユーザー情報取得
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .single();

    // Stripeセッション作成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: targetPriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 14, // 14日間無料
        metadata: {
          user_id: userId,
        },
      },
      // いったんサンクスページ (/success) を表示する
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`, // キャンセル時は /cancel へ
      customer_email: profile?.email,
      metadata: {
        user_id: userId,
        plan: plan,
        interval: interval, // 期間も記録
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}