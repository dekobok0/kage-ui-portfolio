import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/lib/siteConfig";

export default function CancelPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <Header />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            !
          </div>
          <h1 className="mt-6 text-3xl font-bold text-slate-900">決済がキャンセルされました</h1>
          <p className="mt-4 text-slate-600">
            Stripe の決済画面を閉じたか、キャンセルを選択したためサブスクリプションは開始されていません。
          </p>
          <p className="mt-2 text-sm text-slate-500">
            再度手続きを行うか、ご不明点があれば {siteConfig.contactEmail} までご連絡ください。
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-6 py-3 text-base font-semibold text-slate-700 hover:border-brand hover:text-brand"
            >
              ホームに戻る
            </Link>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-base font-semibold text-white hover:bg-brand-dark"
            >
              料金プランを見る
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
