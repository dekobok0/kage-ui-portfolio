import { NextResponse } from "next/server";
import { resend } from "@/lib/resendClient";
import { siteConfig } from '@/lib/siteConfig';

type ContactPayload = {
  name?: string;
  email?: string;
  message?: string;
};

export async function POST(request: Request) {
  if (!resend) {
    return NextResponse.json(
      { error: "Resendが設定されていません。管理者にお問い合わせください。" },
      { status: 500 },
    );
  }

  let payload: ContactPayload = {};

  try {
    payload = (await request.json()) as ContactPayload;
  } catch (error) {
    return NextResponse.json(
      { error: "JSONの形式が不正です", details: String(error) },
      { status: 400 },
    );
  }

  if (!payload.name || !payload.email || !payload.message) {
    return NextResponse.json(
      { error: "お名前・メールアドレス・お問い合わせ内容は必須です" },
      { status: 400 },
    );
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "no-reply@example.com";
  const subject = `[お問い合わせ] ${siteConfig.name}`;

  try {
    await resend.emails.send({
      from: fromEmail,
      to: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? siteConfig.contactEmail,
      reply_to: payload.email,
      subject,
      html: `
        <h2>お問い合わせ内容</h2>
        <p><strong>お名前:</strong> ${payload.name}</p>
        <p><strong>メールアドレス:</strong> ${payload.email}</p>
        <p><strong>メッセージ:</strong></p>
        <p>${payload.message.replace(/\n/g, "<br />")}</p>
      `,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "メール送信に失敗しました" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
