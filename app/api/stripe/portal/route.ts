import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  console.warn("STRIPE_SECRET_KEY is not set. Stripe portal route will throw when invoked.");
}

const stripe = secretKey
  ? new Stripe(secretKey, {
      apiVersion: "2024-06-20",
    })
  : null;

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase admin client is not configured." }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  let payload: { userId?: string } = {};

  try {
    payload = (await request.json()) as { userId?: string };
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body", details: String(error) }, { status: 400 });
  }

  if (!payload.userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", payload.userId)
    .not("stripe_customer_id", "is", null)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to query subscriptions", error);
    return NextResponse.json({ error: "Failed to locate subscription" }, { status: 500 });
  }

  const customerId = data?.stripe_customer_id;

  if (!customerId) {
    return NextResponse.json({ error: "Active subscription not found" }, { status: 404 });
  }

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${siteUrl}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (stripeError) {
    console.error("Failed to create billing portal session", stripeError);
    return NextResponse.json({ error: "Unable to create billing portal session" }, { status: 500 });
  }
}
