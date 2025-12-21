import Link from "next/link";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const sections = [
  {
    title: "1. 収集する情報",
    body: "当社は、サービス提供に必要な以下の個人情報を収集します：ユーザー登録時に取得する氏名、メールアドレス、サービス利用ログ、決済情報（Stripe経由で処理され、当社は決済完了情報のみを保持）、その他サービス提供に必要な情報。",
  },
  {
    title: "2. 利用目的",
    body: "収集した個人情報は、以下の目的で利用します：本人確認、サービス提供、お問い合わせ対応、利用状況の分析、重要なお知らせの配信、不正利用の防止。",
  },
  {
    title: "3. 第三者提供・委託",
    body: "決済で利用するStripe、メール配信で利用するResendなど、個人情報を扱う委託先・第三者提供先に個人情報を提供する場合があります。これらのサービスプロバイダーは、当社との契約に基づき、適切な安全管理措置を講じています。",
  },
  {
    title: "4. 保管期間・安全管理",
    body: "個人情報は、サービス提供期間中および法令に基づく保存期間中、適切に保管します。当社は、個人情報への不正アクセス、紛失、破壊、改ざん、漏洩を防止するため、アクセス権限の管理、暗号化通信の使用、定期的なセキュリティ監査などの安全管理措置を講じています。",
  },
  {
    title: "5. 利用者の権利",
    body: "ご本人は、当社に対して、ご自身の個人情報の開示、訂正、削除、利用停止を請求することができます。これらの請求は、以下の連絡先までご連絡ください。",
  },
  {
    title: "6. Cookie・外部サービス",
    body: "当社のサービスでは、サービス品質向上のため、Cookieを使用する場合があります。Cookieの使用を希望しない場合は、ブラウザの設定によりCookieを無効にすることができます。ただし、Cookieを無効にした場合、一部の機能が利用できなくなる可能性があります。",
  },
  {
    title: "7. 改定",
    body: "本プライバシーポリシーは、法令の変更やサービス内容の変更に伴い、予告なく改定する場合があります。改定後は、本ページに掲載された時点で効力を生じます。重要な変更がある場合は、メールまたはサービス内で通知いたします。",
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="section-shell flex-1 py-16">
        <div className="text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            ホーム
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">プライバシーポリシー</span>
        </div>

        <article className="mt-8 space-y-8">
          <header className="space-y-3">
            <h1 className="text-3xl font-semibold text-foreground">プライバシーポリシー</h1>
          </header>

          {sections.map((section) => (
            <section key={section.title} className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">{section.title}</h2>
              <p className="text-sm leading-6 text-muted-foreground">{section.body}</p>
            </section>
          ))}

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">問い合わせ窓口</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              個人情報に関するお問い合わせは、以下のメールアドレスまでご連絡ください：<a href="mailto:support@kageaccess.com" className="text-primary hover:underline">support@kageaccess.com</a>
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
