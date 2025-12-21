# Kage UI Portfolio

> ⚠️ **このリポジトリはポートフォリオ参照用です**
> 実際のビジネスロジック、スコアリングアルゴリズム、質問データは知的財産保護のため非公開（スタブ化）としています。
> UIデザイン、コンポーネント設計、およびアーキテクチャ構成のみを公開しています。

## 🎯 プロジェクト概要

**発達・感覚マイノリティのためのキャリア防衛プラットフォーム『Kage OS』**

### 主な機能
- **多角的特性スキャン**: HEXACO、KAI、OSIVQなど6つの科学モデルによる性格・認知・感覚分析
- **デジタル・ハンドシェイク**: 企業との合意形成を記録する証拠保全機能
- **法的翻訳エンジン**: 特性を「合理的配慮」の言葉に翻訳
- **ポータブル・レジュメ**: 転職してもデータを持ち運べる設計

## 🛠️ 技術スタック

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS, Shadcn/ui
- **Backend / DB**: Supabase (PostgreSQL + Auth)
- **Data Access**: Server Actions (No API Layer)
- **Payment**: Stripe
- **AI Integration**: OpenAI, Anthropic Claude, Google Gemini

## 📂 プロジェクト構造

```
kage-ui-portfolio/
├── app/                  # Next.js App Router (Server Components Default)
│   ├── dashboard/        # 個人用ダッシュボード
│   ├── organization/     # 法人用管理画面
│   ├── share/            # 結果共有ページ
│   └── api/stripe/       # Webhook処理のみAPIルートを使用
├── components/           # React Components
│   ├── AssessmentPlayer.tsx  # 複雑な状態管理を行うクライアント機能
│   └── ui/               # 再利用可能な共通UIパーツ (Atomic Design)
├── lib/                  # ビジネスロジック・ユーティリティ
│   ├── constants/        # テスト定義（※ポートフォリオ用にダミー化）
│   └── supabaseClient.ts # DB接続クライアント
└── types/                # Supabaseから自動生成された型定義
```

## ✨ こだわりの設計ポイント

### 1. モダンなデータフェッチ (Server Actions)
従来のREST API層を介さず、Next.jsの **Server Actions** を活用してDBへ直接アクセスすることで、タイプセーフかつ高速なデータ操作を実現しています。

### 2. 型安全性の徹底
Supabaseからデータベースの型定義を自動生成し、フロントエンド全体で共有。APIレスポンスからコンポーネントのPropsに至るまで、TypeScriptによる型安全性を担保しています。

### 3. パフォーマンスとUX
- **App Router**: Server ComponentsとClient Componentsを適切に分離し、初期ロード時間を短縮。
- **UI/UX**: "Dark Academia" をテーマに、感覚過敏なユーザーでも疲れにくい配色とインタラクションを設計。

## 🔒 セキュリティ・知財保護について

本リポジトリでは、以下のコアロジックを意図的に除外・変更しています：
- 独自のスコアリングアルゴリズム
- 28項目(Short) / 143項目(Full) の質問データセット
- リスク判定ロジック

これらは面談時に、デモ環境にて動作をお見せすることが可能です。

---

**Built with ❤️ for neurodivergent talents**
