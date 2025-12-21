import Link from "next/link";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const sections = [
  {
    title: "第1条（適用）",
    body: "この利用規約（以下、本規約）は、当社が提供するサービス（以下、本サービス）の利用条件を定めるものです。購入者は本規約に同意のうえ、本サービスを利用するものとします。",
  },
  {
    title: "第2条（利用登録）",
    body: "利用者は所定の登録手続を行い、当社が承認することで利用契約が成立します。登録情報に虚偽があった場合、利用停止の対象となります。",
  },
  {
    title: "第3条（禁止事項）",
    body: "利用者は、本サービスのリバースエンジニアリング、再販、第三者への共有、法令または公序良俗に反する行為、その他当社が不適切と判断する行為を行ってはなりません。",
  },
  {
    title: "第4条（利用料金と支払方法）",
    body: "利用料金は、別途料金ページ（#pricing）に定める金額とします。支払いはStripeを通じたクレジットカード決済により行われます。サブスクリプションはいつでも解約でき、その場合、次回の請求は行われません。サービスの特性上、支払い済みの料金は返金されません。",
  },
  {
    title: "第5条（免責事項）",
    body: "当社は、サービスの停止・変更・中断により利用者に生じた損害について、故意または重過失がない限り責任を負いません。また、クラウドサービスとして提供される本サービスは、インターネット環境やサーバーの状況により、一時的に利用できない場合があることをあらかじめご了承ください。",
  },
  {
    title: "第6条（契約期間・解約）",
    body: "契約期間は、サブスクリプション契約の開始日から、解約されるまで継続します。解約は、アカウントのダッシュボードからいつでも行うことができます。解約した場合、次回の請求は行われませんが、既に支払い済みの料金は返金されません。解約後も、現在の請求期間が終了するまでサービスを利用できます。",
  },
  {
    title: "第7条（準拠法・裁判管轄）",
    body: "本サービスに関する紛争は、東京地方裁判所または東京簡易裁判所を第一審の専属的合意管轄とします。",
  },
];

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="section-shell flex-1 py-16">
        <div className="text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            ホーム
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">利用規約</span>
        </div>

        <article className="mt-8 space-y-8">
          <header className="space-y-3">
            <h1 className="text-3xl font-semibold text-foreground">利用規約</h1>
          </header>

          {sections.map((section) => (
            <section key={section.title} className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">{section.title}</h2>
              <p className="text-sm leading-6 text-muted-foreground">{section.body}</p>
            </section>
          ))}

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">特定商取引法に基づく表示について</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              特定商取引法に基づく表記については、<Link href="/tokushoho" className="text-primary hover:underline">こちら</Link>をご覧ください。
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
