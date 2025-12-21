export const siteConfig = {
  name: "Kage",
  brandMark: "k",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@kageaccess.com",
  navigation: [
    { label: "トップ", href: "/business" },
    { label: "科学的根拠", href: "#science" },
    { label: "3つの防壁", href: "#walls" },
    { label: "料金", href: "#pricing" },
    { label: "お問い合わせ", href: "/contact" },
  ],
  hero: {
    eyebrow: "あなたの影となり、一生付き従いますように。",
    heading: "科学と法で編む、最強の「取扱説明書」",
    subheading:
      "6つの科学的アセスメントと改正障害者差別解消法に基づき、あなたの「生きづらさ」を「才能」と「証拠」に変える。発達・感覚マイノリティのためのキャリア防衛プラットフォーム。",
    primaryCta: { label: "無料で診断を始める", href: "/auth/signup" },
    secondaryCta: { label: "デモ動画を見る", href: "https://www.youtube.com/YOUR_VIDEO_ID" },
    badges: ["HEXACO・KAI対応", "デジタル・ハンドシェイク搭載", "100%証拠保全"],
  },
  highlights: [
    { label: "科学的指標", value: "6種" }, // HEXACO, KAI, OSIVQ, ASRS, AQ, SPS
    { label: "法的準拠", value: "3法" }, // 障害者雇用促進法、差別解消法、権利条約
    { label: "証拠能力", value: "100%" },
  ],
  features: [
    {
      icon: "🧬",
      title: "多角的特性スキャン (Track A)",
      description: "HEXACO、KAI、OSIVQなど、信頼性の高い6つの科学モデルであなたの「性格・認知・感覚」を立体的に分析。MBTIのような曖昧さを排除し、実用的なデータを提供します。",
    },
    {
      icon: "⚖️",
      title: "法的翻訳エンジン (Track B)",
      description: "あなたの特性や困りごとを、障害者差別解消法に基づく「合理的配慮」の言葉に自動翻訳。「わがまま」ではなく「権利」として、企業と対等に交渉できます。",
    },
    {
      icon: "🤝",
      title: "デジタル・ハンドシェイク",
      description: "企業との配慮に関する合意形成をブロックチェーンのように記録。「言った言わない」の水掛け論を防ぎ、万が一の際の強力な法的証拠となります。",
    },
    {
      icon: "🛡️",
      title: "ポータブル・レジュメ",
      description: "診断結果も、配慮の記録も、すべてはあなたの資産です。会社を辞めてもデータは消えません。一生涯、あなたを守る「影」として機能し続けます。",
    },
  ],
  useCases: [
    {
      title: "就職・転職活動の武器として",
      description: "「私の強みはこれです」「この環境なら成果を出せます」を、客観的なデータで証明。ミスマッチを防ぎ、入社後の働きやすさを確保します。",
    },
    {
      title: "職場での相互理解・1on1",
      description: "上司や同僚に「取扱説明書（レポート）」を共有。感覚過敏やコミュニケーションの癖を可視化することで、心理的安全性の高いチームを作ります。",
    },
    {
      title: "企業のコンプライアンス対策",
      description: "属人的な配慮対応をシステム化。法的義務である「合理的配慮の提供」プロセスを透明化し、訴訟リスクと現場の負担を同時に低減します。",
    },
  ],
  pricing: {
    description:
      "個人の自己分析は無料から始められます。より詳細なレポートや、法的証拠能力を持つログ機能はサブスクリプションで提供します。",
    bullets: [
      "✅ Track A (科学的診断): 基本無料",
      "✅ Track B (医療的根拠の統合): Proプラン",
      "✅ デジタル・ハンドシェイク (ログ保全): Proプラン",
      "✅ 法人向けプラン: 従業員数に応じたボリュームライセンス",
    ],
  },
  contact: {
    title: "お問い合わせ",
    description:
      "サービスに関するご質問、法人導入のご相談、取材依頼など、お気軽にお問い合わせください。",
    successHeadline: "送信完了",
    successMessage: "お問い合わせありがとうございます。内容を確認次第、担当者よりご連絡いたします。",
    submitLabel: "送信する",
  },
  faq: [
    {
      question: "この診断結果は、医学的な診断書として使えますか？",
      answer: "いいえ。本サービスは自己理解とコミュニケーション支援を目的としたものであり、医師による診断書ではありません。ただし、医師の診断がある場合は、それをシステムに登録し、法的根拠として活用することが可能です（Track B機能）。",
    },
    {
      question: "会社に勝手に診断結果を見られませんか？",
      answer: "絶対にありません。あなたのデータはあなただけのものです。あなたが「共有リンク」を発行し、相手に教えない限り、企業側から勝手に閲覧することはできません。",
    },
    {
      question: "退職したらデータはどうなりますか？",
      answer: "Kageのアカウントは個人に紐付いているため、会社を辞めてもデータは消えません。新しい職場でも、過去の配慮記録や特性データをそのまま活用できます。",
    },
  ],
};

export type SiteConfig = typeof siteConfig;
