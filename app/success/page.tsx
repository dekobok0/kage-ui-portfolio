import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/lib/siteConfig";

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <Header />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl rounded-2xl border border-emerald-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            ✓
          </div>
          <h1 className="mt-6 text-3xl font-bold text-slate-900">ご契約ありがとうございます！</h1>
          <p className="mt-4 text-slate-600">
            {siteConfig.name} のサブスクリプションを開始しました。ご登録のメールアドレス宛にオンボーディングガイドとダウンロードリンクをお送りしています。
          </p>
          <p className="mt-2 text-sm text-slate-500">
            数分待ってもメールが届かない場合は迷惑メールをご確認のうえ、{siteConfig.contactEmail} までご連絡ください。
          </p>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-base font-semibold text-white hover:bg-brand-dark"
          >
            ダッシュボードへ進む
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
