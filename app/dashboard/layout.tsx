"use client";

import { useEffect, useState } from "react";

import { useRouter, usePathname } from "next/navigation";

import { supabase } from "@/lib/supabaseClient";

import { Footer } from "@/components/Footer";

import Link from "next/link";

import { 

  Lock, Settings, CheckCircle2, LogOut, LayoutDashboard, 

  ChevronDown, ChevronRight, BrainCircuit, Zap, Eye, Activity, Users, Waves,

  Menu, X // ハンバーガーと閉じるアイコン

} from "lucide-react";

// --- サブスクリプション判定の定数 ---

const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

// --- テスト一覧データ ---

const ASSESSMENT_MENU = [

  { id: "hexaco", label: "性格特性 (HEXACO)", icon: BrainCircuit },

  { id: "kai", label: "問題解決スタイル", icon: Zap },

  { id: "osivq", label: "認知スタイル", icon: Eye },

  { id: "asrs", label: "注意・集中", icon: Activity },

  { id: "aq", label: "社会性・交流", icon: Users },

  { id: "sensory", label: "感覚・感受性", icon: Waves },

];

// --- Paywall コンポーネント (変更なし) ---

function PaywallScreen({ router }: { router: any }) {

  return (

    <div className="flex min-h-screen flex-col bg-slate-100">

      <main className="flex flex-1 items-center justify-center px-6 py-16">

        <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-lg">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">

            <Lock className="h-6 w-6" />

          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-900">有料機能エリアへのアクセスが制限されています</h1>

          <p className="mt-4 text-slate-600 leading-relaxed">

            このダッシュボードの機能はサブスクリプション契約が必要です。<br/>

            Kageの全機能（科学的診断、法的保護ログ、レポート発行）を利用するために、プランを選択してください。

          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">

            <button

              onClick={() => router.push("/#pricing")}

              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold"

            >

              プランを見る

            </button>

            <button onClick={() => router.push("/")} className="border border-slate-300 text-slate-700 px-8 py-3 rounded-full hover:bg-slate-50">

              ホームへ戻る

            </button>

          </div>

        </div>

      </main>

      <Footer />

    </div>

  );

}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  const router = useRouter();

  const pathname = usePathname();

  const [loading, setLoading] = useState(true);

  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  const [isIndividual, setIsIndividual] = useState(false);

  

  // UI状態管理

  const [isTestsOpen, setIsTestsOpen] = useState(true);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // スマホメニュー開閉

  // ページ遷移したらスマホメニューを閉じる

  useEffect(() => {

    setIsMobileMenuOpen(false);

  }, [pathname]);

  useEffect(() => {

    const checkAuthAndSubs = async () => {

      const { data: { session } } = await supabase.auth.getSession();

      

      if (!session) {

        router.replace("/auth/login");

        return;

      }

      const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", session.user.id).single();

      const type = profile?.user_type || "individual";

      setIsIndividual(type === "individual");

      if (type === "corporate") {

        const { data: orgMember } = await supabase.from("organization_members").select("organization_id").eq("user_id", session.user.id).limit(1).maybeSingle();

        if (orgMember) {

          router.replace(`/organization/${orgMember.organization_id}`);

          return;

        }

      }

      const { data: sub } = await supabase

        .from("subscriptions")

        .select("status")

        .eq("user_id", session.user.id)

        .in("status", Array.from(ACTIVE_STATUSES))

        .limit(1)

        .maybeSingle();

      

      setHasActiveSubscription(!!sub);

      setLoading(false);

    };

    checkAuthAndSubs();

  }, [router]);

  const handleLogout = async () => {

    await supabase.auth.signOut();

    router.replace("/auth/login");

    router.refresh();

  };

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-slate-100">

        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500"></div>

      </div>

    );

  }


  return (

    <div className="flex min-h-screen flex-col md:flex-row bg-slate-50">

      

      {/* スマホ用ヘッダー (PCでは非表示: md:hidden) */}

      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">

        {/* ロゴをLinkで囲んでトップに戻れるようにしました */}

        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">

          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold">K</div>

          <span className="font-bold text-slate-900 text-lg">Kage</span>

        </Link>

        <button 

          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}

          className="p-2 text-slate-600 hover:bg-slate-100 rounded-md"

        >

          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}

        </button>

      </div>

      {/* サイドバーナビゲーション

        スマホ: isMobileMenuOpenがtrueの時だけ全画面表示 (fixed inset-0)

        PC: 常に左側に表示 (static w-64)

      */}

      <nav className={`

        bg-white border-r border-slate-200 flex flex-col z-30 transition-all duration-300

        ${isMobileMenuOpen ? "fixed inset-0 top-[57px]" : "hidden"} 

        md:flex md:static md:w-64 md:h-screen md:sticky md:top-0

      `}>

        

        {/* PC用ロゴ (スマホではヘッダーにあるので隠す) */}

        <div className="hidden md:flex p-6 border-b border-slate-100 items-center gap-2">

          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">

            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold">K</div>

            <span className="font-bold text-slate-900 text-lg">Kage</span>

          </Link>

        </div>

        {/* メニュー中身 */}

        <div className="p-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">

          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Menu</h3>

          <ul className="space-y-1">

            <li>

              <Link 

                href="/dashboard" 

                className={`flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-all

                  ${pathname === '/dashboard' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'}

                `}

              >

                <LayoutDashboard className="w-4 h-4" /> ダッシュボード

              </Link>

            </li>

            <li>

              <button 

                onClick={() => setIsTestsOpen(!isTestsOpen)}

                className="w-full flex items-center justify-between gap-3 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 px-3 py-2.5 rounded-lg transition-all"

              >

                <div className="flex items-center gap-3">

                  <CheckCircle2 className="w-4 h-4" /> 診断テスト

                </div>

                {isTestsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}

              </button>

              {isTestsOpen && (

                <ul className="mt-1 ml-2 pl-3 border-l-2 border-slate-100 space-y-0.5">

                  {ASSESSMENT_MENU.map((test) => {

                    const isActive = pathname === `/dashboard/assessment/${test.id}`;

                    return (

                      <li key={test.id}>

                        <Link 

                          href={`/dashboard/assessment/${test.id}`}

                          className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-md transition-all

                            ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}

                          `}

                        >

                          <test.icon className="w-3 h-3" /> {test.label}

                        </Link>

                      </li>

                    )

                  })}

                </ul>

              )}

            </li>

            <li>

              <Link href="/dashboard/declaration" className={`flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-all ${pathname === '/dashboard/declaration' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'}`}>

                <Lock className="w-4 h-4" /> 医療的根拠 (Track B)

              </Link>

            </li>

            <li>

              <Link href="/dashboard/settings" className={`flex items-center gap-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-all ${pathname === '/dashboard/settings' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'}`}>

                <Settings className="w-4 h-4" /> 設定・プラン

              </Link>

            </li>

          </ul>

        </div>

        <div className="p-4 border-t border-slate-100">

          <button 

            onClick={handleLogout}

            className="flex items-center gap-3 w-full text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-2.5 rounded-lg transition-all"

          >

            <LogOut className="w-4 h-4" /> ログアウト

          </button>

        </div>

      </nav>

      {/* メインコンテンツ */}

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">

        <div className="max-w-5xl mx-auto pb-20">

          {children}

        </div>

      </main>

    </div>

  );

}
