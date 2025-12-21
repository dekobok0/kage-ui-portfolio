import Link from "next/link";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const items = [
  {
    title: "販売事業者名",
    body: "鈴木幹太",
  },
  {
    title: "運営統括責任者名",
    body: "鈴木幹太",
  },
  {
    title: "所在地",
    body: "〒160-0023 東京都新宿区西新宿三丁目3番13号　西新宿水間ビル6階",
  },
  {
    title: "電話番号",
    body: "050-1722-5566",
  },
  {
    title: "メールアドレス",
    body: "support@kageaccess.com",
  },
  {
    title: "販売価格",
    body: "料金ページ（#pricing）に記載の金額",
  },
  {
    title: "支払い方法",
    body: "クレジットカード決済（Stripe）",
  },
  {
    title: "商品の引渡し時期",
    body: "決済完了後、直ちにサービスをご利用いただけます。",
  },
  {
    title: "返品・キャンセルに関する特約",
    body: "サービスの特性上、決済完了後の返金・キャンセルは原則としてお受けできません。サブスクリプションはいつでも解約でき、その場合、次回の請求は行われません。",
  },
];

export default function TokushohoPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="section-shell flex-1 py-16">
        <div className="text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            ホーム
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">特定商取引法に基づく表記</span>
        </div>

        <article className="mt-8 space-y-8">
          <header className="space-y-3">
            <h1 className="text-3xl font-semibold text-foreground">特定商取引法に基づく表記</h1>
          </header>

          {items.map((item) => (
            <section key={item.title} className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">{item.title}</h2>
              <p className="text-sm leading-6 text-muted-foreground">{item.body}</p>
            </section>
          ))}

          <section className="space-y-2">
            <p className="text-sm leading-6 text-muted-foreground">
              ※販売事業者名（氏名）、住所、電話番号については、お客様からご請求があり次第、遅滞なくこれを開示いたします。
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}

