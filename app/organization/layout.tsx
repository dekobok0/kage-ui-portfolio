"use client";

import { useEffect, useState } from "react";

import { useRouter, useParams } from "next/navigation";

import { supabase } from "@/lib/supabaseClient";

import Link from "next/link";

import { OrganizationSidebar } from "@/components/OrganizationSidebar";

import { 

  Menu, X, ShieldAlert, CreditCard, LogOut 

} from "lucide-react";

// --- サブスクリプション判定の定数 ---

const ACTIVE_STATUSES = ["active", "trialing", "past_due"];

// ========================================================

// 1. アクセス拒否画面 (世界標準の「門前払い」画面)

// ========================================================

function AccessDeniedScreen({ router, orgId, currentUserEmail }: { router: any; orgId: string; currentUserEmail?: string }) {

  return (

    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">

      <div className="w-full max-w-md rounded-xl border border-red-100 bg-white p-8 text-center shadow-lg">

        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">

          <ShieldAlert className="h-8 w-8 text-red-600" />

        </div>

        

        <h2 className="text-xl font-bold text-slate-900">アクセス権限がありません</h2>

        

        <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">

          <p className="mb-2 font-medium text-slate-900">現在のアカウント:</p>

          <p className="font-mono text-xs">{currentUserEmail || "読み込み中..."}</p>

        </div>

        <p className="mt-4 text-sm text-slate-500">

          このアカウントは組織 ({orgId}) のメンバーではありません。<br />

          正しい法人アカウントに切り替えてください。

        </p>

        

        <button 

          onClick={async () => { 

            await supabase.auth.signOut(); 

            // ログアウト後は、明示的に法人ログイン画面へ飛ばす

            router.push("/auth/login"); 

          }} 

          className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"

        >

          <LogOut className="h-4 w-4" />

          ログアウトしてアカウントを切り替える

        </button>

        

        <div className="mt-4">

             <Link href="/dashboard" className="text-xs text-slate-400 hover:underline">

               個人のダッシュボードに戻る場合はこちら

             </Link>

        </div>

      </div>

    </div>

  );

}

// ========================================================

// 2. 課金ウォール画面 (未払い法人)

// ========================================================

function SubscriptionWallScreen({ router, orgName }: { router: any; orgName: string }) {

  return (

    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">

      <div className="w-full max-w-lg rounded-2xl border border-indigo-100 bg-white p-8 text-center shadow-xl">

        <CreditCard className="mx-auto mb-6 h-16 w-16 text-indigo-600" />

        <h1 className="mb-2 text-2xl font-bold text-slate-900">{orgName}</h1>

        <p className="mb-6 font-bold text-indigo-600">法人プランの契約が必要です</p>

        

        <p className="mb-8 text-sm leading-relaxed text-slate-600">

          現在、この組織には有効なプランが適用されていません。<br/>

          管理者の方は、プラン契約をお願いいたします。

        </p>

        

        <div className="flex flex-col gap-3">

          {/* 契約ボタン: ビジネスLPのPricingへ飛ばす */}

          <button 

            onClick={() => router.push("/business#pricing")} 

            className="w-full rounded-lg bg-indigo-600 py-3 font-bold text-white transition-all hover:bg-indigo-700"

          >

            プランを選択して契約する

          </button>

          

          <button 

            onClick={async () => { await supabase.auth.signOut(); router.push("/auth/login"); }}

            className="mt-2 text-sm text-slate-400 hover:text-slate-600"

          >

            ログアウト

          </button>

        </div>

      </div>

    </div>

  );

}

// ========================================================

// メインレイアウト

// ========================================================

export default function OrganizationLayout({ children }: { children: React.ReactNode }) {

  const router = useRouter();

  const params = useParams();

  const orgId = params.orgId as string;

  const [loading, setLoading] = useState(true);

  const [isMember, setIsMember] = useState(false);

  const [hasSubscription, setHasSubscription] = useState(false);

  const [orgName, setOrgName] = useState("");

  const [currentUserEmail, setCurrentUserEmail] = useState(""); // アドレス表示用

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);

  useEffect(() => {

    const checkAccess = async () => {

      // 1. ログイン確認 (セッション取得)

      const { data: { session } } = await supabase.auth.getSession();

      

      if (!session) {

        // セッションがなければログイン画面へ

        router.replace("/auth/login");

        return;

      }

      setCurrentUserEmail(session.user.email || "");

      try {

        // 並列実行で高速チェック

        const [orgResult, memberResult, mySubResult] = await Promise.all([

          // A. 組織情報の存在確認

          supabase.from("organizations").select("id, name, owner_id").eq("id", orgId).single(),

          // B. このユーザーがメンバーか確認

          supabase.from("organization_members").select("role").eq("organization_id", orgId).eq("user_id", session.user.id).single(),

          // C. 自分のサブスク状況確認

          supabase.from("subscriptions").select("status, plan_id").eq("user_id", session.user.id).in("status", ACTIVE_STATUSES).maybeSingle()

        ]);

        const org = orgResult.data;

        const member = memberResult.data;

        const mySub = mySubResult.data;

        // そもそも組織が存在しない -> 404へ (今回は便宜上AccessDenied)

        if (!org) { 

           setLoading(false); 

           return; 

        }

        setOrgName(org.name);

        // メンバーでなければ即終了

        if (!member) { 

          setIsMember(false); 

          setLoading(false); 

          return; 

        }

        

        // ここまで来たらメンバー確定

        setIsMember(true);

        // 4. サブスク判定ロジック

        if (mySub) {

          setHasSubscription(true);

          setCurrentPlanId(mySub.plan_id);

        } else {

          // 自分が払ってないならオーナーの支払いをチェック

          if (org.owner_id) {

             const { data: ownerSub } = await supabase

              .from("subscriptions")

              .select("status, plan_id")

              .eq("user_id", org.owner_id)

              .in("status", ACTIVE_STATUSES)

              .maybeSingle();

             

             if (ownerSub) {

               setHasSubscription(true);

               setCurrentPlanId(ownerSub.plan_id);

             }

          }

        }

      } catch (e) {

        console.error(e);

      } finally {

        setLoading(false);

      }

    };

    checkAccess();

  }, [orgId, router]);

  const handleLogout = async () => {

    await supabase.auth.signOut();

    router.push("/auth/login");

  };

  // --- 表示分岐 ---

  if (loading) return (

    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">

      <div className="flex flex-col items-center gap-2">

        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600"></div>

        <span className="text-sm font-medium">権限を確認中...</span>

      </div>

    </div>

  );

  

  // 1. 部外者はここでストップ (Access Denied)

  if (!isMember) return <AccessDeniedScreen router={router} orgId={orgId} currentUserEmail={currentUserEmail} />;

  

  // 2. 金払ってない法人はここでストップ (Paywall)

  if (!hasSubscription) return <SubscriptionWallScreen router={router} orgName={orgName} />;

  // 3. 選ばれし者のみがここを通る (Dashboard)

  return (

    <div className="flex min-h-screen flex-col md:flex-row bg-slate-50">

      

      {/* スマホヘッダー */}

      <div className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white p-4 md:hidden">

        <Link href="/business" className="flex items-center gap-2">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-900 font-bold text-white">K</div>

          <span className="font-bold text-slate-900">Kage OS</span>

        </Link>

        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">

          {isMobileMenuOpen ? <X /> : <Menu />}

        </button>

      </div>

      {/* サイドバー */}

      <OrganizationSidebar 

        orgId={orgId} 

        planId={currentPlanId}

        isMobileOpen={isMobileMenuOpen}

        onMobileClose={() => setIsMobileMenuOpen(false)}

      />

      {isMobileMenuOpen && (

        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />

      )}

      <main className="h-[calc(100vh-64px)] flex-1 overflow-y-auto p-4 md:h-screen md:p-8">

        <div className="mx-auto max-w-6xl">

          {children}

        </div>

      </main>

    </div>

  );

}
