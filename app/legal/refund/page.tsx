import Link from "next/link";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const items = [
  {
    title: "第1条（返金の可否）",
    body: "サービスの特性上、デジタルコンテンツを提供するため、決済完了後（サブスクリプション契約後）の返金・キャンセルは原則としてお受けできません。",
  },
  {
    title: "第2条（サブスクリプションの解約について）",
    body: "サブスクリプションは、アカウントのダッシュボードからいつでも解約手続きが可能です。解約した場合、次回の請求は発生しません。",
  },
];

export default function RefundPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="section-shell flex-1 py-16">
        <div className="text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            ホーム
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">返金ポリシー</span>
        </div>

        <article className="mt-8 space-y-6">
          <header className="space-y-3">
            <h1 className="text-3xl font-semibold text-foreground">返金ポリシー</h1>
          </header>

          {items.map((item) => (
            <section key={item.title} className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">{item.title}</h2>
              <p className="text-sm leading-6 text-muted-foreground">{item.body}</p>
            </section>
          ))}
        </article>
      </main>
      <Footer />
    </div>
  );
}
