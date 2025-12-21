"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { useUserStatus } from "@/components/providers/AuthContext";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

import { Check, Loader2, Shield, Users, BrainCircuit, Scale } from "lucide-react";

import { supabase } from "@/lib/supabaseClient"; 

// プラン定義に「壁」の情報とカラーテーマを追加

const PLANS = [

  {

    key: "light",

    name: "Light",

    wallLabel: "第1の壁：侵入阻止",

    themeColor: "red", // 赤色テーマ

    icon: Users,

    description: "採用リスクのスクリーニング",

    monthlyPrice: "¥50,000",

    yearlyPrice: "¥500,000", // 10ヶ月分

    monthlyPriceId: "price_light_monthly_xxx", // .envには書かないが概念として

    yearlyPriceId: "price_light_yearly_xxx",

    features: [

      "HEXACO性格診断 (H因子検知)",

      "構造化面接ガイド作成",

      "候補者リスク分析",

      "採用管理ダッシュボード",

      "共有リンク発行 (10件/月)"

    ],

    isPopular: false,

    status: "active",

  },

  {

    key: "standard",

    name: "Standard",

    wallLabel: "第2の壁：摩擦解消",

    themeColor: "orange", // オレンジテーマ（またはブランド色のIndigo）

    icon: BrainCircuit,

    description: "KAIによる配置と組織の最適化",

    monthlyPrice: "¥150,000",

    yearlyPrice: "¥1,500,000", // 10ヶ月分

    monthlyPriceId: "price_std_monthly_xxx",

    yearlyPriceId: "price_std_yearly_xxx",

    features: [

      "Lightプランの全機能",

      "KAI 認知スタイル診断",

      "H因子改善プログラム",

      "上司・部下マッチング予測",

      "チームシミュレーション",

      "無制限の共有リンク"

    ],

    isPopular: true,

    status: "coming_soon",

  },

  {

    key: "enterprise",

    name: "Enterprise",

    wallLabel: "第3の壁：完全防御",

    themeColor: "indigo", // 青色テーマ

    icon: Scale,

    description: "法的防御と全社コンプライアンス",

    monthlyPrice: "要問い合わせ",

    yearlyPrice: "要問い合わせ",

    features: [

      "Standardプランの全機能",

      "監査ログの永久保存",

      "診断書・配慮事項の法的記録",

      "専任サポートマネージャー",

      "SLA (稼働率保証)"

    ],

    isPopular: false,

    status: "contact",

    action: "contact",

  }

];

export function Pricing() {

  const router = useRouter();

  // DB処理は全削除して、AuthContextから取得

  const { userId, userType, hasSubscription, orgId, isLoading } = useUserStatus();

  // 全体ローディングではなく、「どのプランを処理中か」を管理

  const [processingPlanKey, setProcessingPlanKey] = useState<string | null>(null);

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  const handleAction = (plan: any) => {

    // Enterpriseなら即座にお問い合わせページへ

    if (plan.status === "contact" || plan.action === "contact") {

      router.push("/contact");

      return;

    }

    // 処理中のプランキーをセット

    setProcessingPlanKey(plan.key);

    if (!userId) {

      router.push("/auth/signup-b2b");

    } else if (userType === "individual") {

      if(confirm("法人アカウントの作成が必要です。ログアウトして登録画面へ移動しますか？")) {

         supabase.auth.signOut().then(() => router.push("/auth/signup-b2b"));

      } else {

        setProcessingPlanKey(null); // キャンセル時はローディング解除

      }

    } else if (hasSubscription && orgId) {

      router.push(`/organization/${orgId}`);

    } else {

      handleStripeCheckout(plan.key, billingCycle);

    }

  };

  const handleStripeCheckout = async (planKey: string, interval: string) => {

    try {

      const response = await fetch("/api/stripe/checkout", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ 

          userId: userId, 

          plan: planKey,

          interval: interval

        }),

      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      if (data.url) window.location.href = data.url;

    } catch (error: any) {

      alert(`エラー: ${error.message}`);

      setProcessingPlanKey(null); // エラー時は解除

    }

  };

  return (

    <section id="pricing" className="py-24 bg-slate-50 border-t border-slate-200">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-10 max-w-3xl mx-auto">

          <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Pricing</h2>

          <p className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">

            リスクの段階に合わせて選べる、<br />

            透明な料金体系。

          </p>

        </div>

        {/* 月払い/年払い 切り替えスイッチ */}

        <div className="flex justify-center mb-12">

          <div className="bg-white p-1 rounded-xl border border-slate-200 inline-flex shadow-sm">

            <button

              onClick={() => setBillingCycle("monthly")}

              className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${

                billingCycle === "monthly"

                  ? "bg-slate-100 text-slate-900 shadow-inner"

                  : "text-slate-500 hover:text-slate-900"

              }`}

            >

              月払い

            </button>

            <button

              onClick={() => setBillingCycle("yearly")}

              className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${

                billingCycle === "yearly"

                  ? "bg-indigo-600 text-white shadow-md"

                  : "text-slate-500 hover:text-slate-900"

              }`}

            >

              年払い

              <span className={`text-[10px] px-2 py-0.5 rounded-full ${billingCycle === "yearly" ? "bg-white text-indigo-600" : "bg-indigo-100 text-indigo-600"}`}>

                2ヶ月分お得

              </span>

            </button>

          </div>

        </div>

        <div className="grid gap-8 lg:grid-cols-3 lg:gap-8 items-start">

          {PLANS.map((plan) => {

            // テーマカラーに応じたクラス定義

            const borderColor = plan.key === 'light' ? 'hover:border-red-300' : plan.key === 'standard' ? 'border-indigo-600' : 'hover:border-slate-400';

            const shadowClass = plan.isPopular ? "shadow-2xl scale-105 z-10" : "shadow-sm";

            const badgeBg = plan.key === 'light' ? 'bg-red-100 text-red-600 border-red-200' : plan.key === 'standard' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700';

            const iconBg = plan.key === 'light' ? 'bg-red-50 text-red-600' : plan.key === 'standard' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600';

            return (

              <Card 

                key={plan.key} 

                className={`relative flex flex-col h-full transition-all duration-300 border ${borderColor} ${shadowClass} bg-white rounded-2xl overflow-hidden`}

              >

                {/* --- 壁ラベル --- */}

                <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-lg border-b border-l ${badgeBg}`}>

                  {plan.wallLabel}

                </div>

                {plan.isPopular && (

                  <div className="absolute top-0 left-0 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-br-lg text-xs font-bold shadow-sm">

                    人気 No.1

                  </div>

                )}

                

                <CardHeader className="pt-12">

                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${iconBg}`}>

                    <plan.icon className="w-6 h-6" />

                  </div>

                  <CardTitle className="text-2xl font-bold text-slate-900">{plan.name}</CardTitle>

                  <CardDescription className="text-slate-500 min-h-[40px]">{plan.description}</CardDescription>

                </CardHeader>

              

              <CardContent className="flex-1">

                <div className="mb-6 h-16 flex items-baseline gap-1">

                   {/* 価格の表示切り替えアニメーション */}

                   {plan.status === "contact" ? (

                    <span className="text-3xl font-extrabold text-slate-900">要問い合わせ</span>

                  ) : (

                    <>

                      <span key={billingCycle} className="text-4xl font-extrabold text-slate-900 animate-in fade-in duration-300">

                        {billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}

                      </span>

                      <span className="text-base font-medium text-slate-500">

                        /{billingCycle === "monthly" ? "月" : "年"}

                      </span>

                    </>

                  )}

                </div>

                

                <ul className="space-y-4">

                  {plan.features.map((feature, idx) => (

                    <li key={idx} className="flex items-start">

                      <div className="flex-shrink-0">

                        <Check className={`h-5 w-5 ${plan.status === 'coming_soon' ? 'text-slate-300' : (plan.key === 'light' ? 'text-red-500' : (plan.key === 'standard' ? 'text-indigo-500' : 'text-slate-500'))}`} />

                      </div>

                      <p className={`ml-3 text-sm ${plan.status === 'coming_soon' ? 'text-slate-400' : 'text-slate-600'}`}>

                        {/* 太字にするキーワードがあればここで処理できるが、一旦そのまま表示 */}

                        {feature}

                      </p>

                    </li>

                  ))}

                </ul>

              </CardContent>

              

              <CardFooter>

                <Button 

                  className={`w-full ${

                    plan.isPopular 

                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg" 

                      : "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50"

                  }`}

                  size="lg"

                  onClick={() => handleAction(plan)}

                  // ローディング判定をこのボタン固有にする

                  disabled={isLoading || (processingPlanKey !== null) || plan.status === "coming_soon"}

                >

                  {/* 自分が押されたときだけクルクルする */}

                  {processingPlanKey === plan.key ? (

                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                  ) : plan.status === "coming_soon" ? (

                    "Coming Soon"

                  ) : plan.status === "contact" ? (

                    "営業担当へ連絡"

                  ) : (

                    userId 

                      ? (hasSubscription && orgId ? "管理画面へ移動" : (billingCycle === "yearly" ? "年払いで契約する" : "月払いで契約する")) 

                      : "無料で試してみる"

                  )}

                </Button>

              </CardFooter>

            </Card>

            );

          })}

        </div>

        {/* 14日間無料トライアルの表記 */}

        <div className="mt-12 text-center">

          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm mb-4">

            <Check className="w-4 h-4" />

            全プラン 14日間の無料トライアル付き

          </div>

          <p className="text-slate-500 text-sm">

            ※ トライアル期間中に解約すれば、料金は一切かかりません。

          </p>

        </div>

        {/* --- デザインパートナー募集バナー --- */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-center shadow-xl border border-slate-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1">
              審査制・残り5社
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
              🚀 Kage デザインパートナー募集
            </h3>
            <p className="text-slate-300 mb-6 text-sm">
              導入事例としてのロゴ掲載とフィードバックを条件に、<br className="hidden sm:block"/>
              <span className="text-white font-bold">Lightプランを半年間 90%OFF</span> で提供します。
            </p>
            <a 
              href="mailto:your-email@example.com?subject=デザインパートナー応募" 
              className="inline-flex items-center justify-center bg-white text-slate-900 px-6 py-3 rounded-lg font-bold hover:bg-slate-100 transition-all"
            >
              パートナーに応募する
            </a>
          </div>
        </div>

      </div>

    </section>

  );

}
