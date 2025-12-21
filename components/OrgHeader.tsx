"use client";

import * as React from "react";

import Link from "next/link";

import { useRouter, usePathname } from "next/navigation";

import { siteConfig } from "@/lib/siteConfig";

import { Button, buttonVariants } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import { Menu, X, LogOut } from "lucide-react";

import { useUserStatus } from "@/components/providers/AuthContext";

import { supabase } from "@/lib/supabaseClient";

// アンカーリンクの正規化

const normalizeAnchor = (href: string, pathname?: string) => {

  if (href.startsWith("#")) {

    if (pathname?.startsWith("/business")) {

      return `/business${href}`;

    }

    return `/${href}`;

  }

  return href;

};

export function OrgHeader() {

  const router = useRouter();

  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // AuthContextから基本情報を取得

  const { userId, orgId, hasSubscription, isLoading: isAuthLoading } = useUserStatus();

  const isLoggedIn = !!userId;

  // ----------------------------------------------------------------------------

  // ユーザータイプ（個人か法人か）をチェックする

  // ----------------------------------------------------------------------------

  const [userType, setUserType] = React.useState<string | null>(null);

  React.useEffect(() => {

    const checkUserType = async () => {

      // ログアウト状態ならチェック不要

      if (!userId) {

        setUserType(null);

        return;

      }

      // ローカルストレージに答えがあれば、それを即座に使う（高速化）

      // なければDBに取りに行く

      const cachedType = typeof window !== 'undefined' ? localStorage.getItem(`user_type_${userId}`) : null;

      

      if (cachedType) {

        setUserType(cachedType);

        // キャッシュがあっても念の為裏で最新を取りに行く（Stale-while-revalidate）

      }

      const { data } = await supabase

        .from("profiles")

        .select("user_type")

        .eq("id", userId)

        .single();

      

      const realType = data?.user_type || "individual";

      

      setUserType(realType);

      

      // 次回のために保存

      if (typeof window !== 'undefined') {

        localStorage.setItem(`user_type_${userId}`, realType);

      }

    };

    checkUserType();

  }, [userId]);

  // ----------------------------------------------------------------------------

  // ロード中の定義

  // ----------------------------------------------------------------------------

  

  // 「ログインしてるはずなのに、まだuserTypeが分からない（null）」なら、それはロード中である。

  // これにより、初期描画(null)の時点で強制的にisLoadingがtrueになります。

  const isTypeUnknown = isLoggedIn && userType === null;

  const isLoading = isAuthLoading || isTypeUnknown;

  // 判定ロジック: 未ログイン または 個人タイプなら「ゲスト扱い」

  const isGuestOrIndividual = !isLoggedIn || (userType === "individual");

  // ----------------------------------------------------------------------------

  // ページ遷移でメニュー閉じる

  React.useEffect(() => {

    setIsMobileMenuOpen(false);

  }, [pathname]);

  // ログアウト処理

  const handleLogout = async () => {

    await supabase.auth.signOut();

    // ログアウト時はキャッシュも消しておくと安全

    if (userId) localStorage.removeItem(`user_type_${userId}`);

    router.refresh();

    router.push("/auth/login?type=business");

  };

  return (

    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">

        

        {/* ロゴ */}

        <Link 

          href="/" 

          className="flex items-center gap-2 text-sm font-semibold text-foreground hover:opacity-80"

          onClick={() => setIsMobileMenuOpen(false)}

        >

          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-xs font-semibold">

            {siteConfig.brandMark}

          </span>

          <span>

            {siteConfig.name} 

            <span className="ml-1 text-[10px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded">Business</span>

          </span>

        </Link>

        {/* PC用ナビゲーション */}

        <nav className="hidden items-center gap-4 text-sm text-muted-foreground md:flex">

          {siteConfig.navigation.map((item) => {

            const href = normalizeAnchor(item.href, pathname);

            const isContact = item.href === "/contact";

            if (isContact) {

              return (

                <Link

                  key={item.href}

                  href={href}

                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "border border-border text-foreground")}

                >

                  {item.label}

                </Link>

              );

            }

            return (

              <Link key={item.href} href={href} className="transition hover:text-foreground">

                {item.label}

              </Link>

            );

          })}

        </nav>

        {/* --- 右側: 3段階出し分けボタンエリア --- */}

        <div className="hidden md:flex items-center gap-3">

          {isLoading ? (

            // isLoadingがtrueの時は、ボタンを一切描画せずスケルトンのみにする

            <div className="flex gap-3 animate-pulse">

              <div className="h-9 w-20 rounded bg-slate-200/50" />

              <div className="h-9 w-24 rounded bg-slate-200/50" />

            </div>

          ) : isGuestOrIndividual ? (

            // 【状態1: 未ログイン、または「個人アカウント」の場合】

            <>

              <Link href="/auth/login?type=business" className="text-sm font-medium text-muted-foreground hover:text-primary">

                ログイン

              </Link>

              <Link href="/auth/signup-b2b">

                <Button className="bg-slate-900 text-white hover:bg-slate-800">法人登録</Button>

              </Link>

            </>

          ) : !hasSubscription ? (

            // 【状態2: 法人ログイン済み・未契約】

            <>

              <Link href="/business#pricing">

                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">

                  プラン契約

                </Button>

              </Link>

              <Button onClick={handleLogout} variant="ghost" size="sm" className="text-slate-500">

                <LogOut className="w-4 h-4 mr-1" /> ログアウト

              </Button>

            </>

          ) : (

            // 【状態3: 法人契約済み】

            <>

              <Link href={`/organization/${orgId}`}>

                <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">

                  ダッシュボード

                </Button>

              </Link>

              <Button onClick={handleLogout} variant="ghost" size="sm" className="text-slate-500">

                <LogOut className="w-4 h-4" />

              </Button>

            </>

          )}

        </div>

        {/* スマホ用 メニューボタン */}

        <button

          className="flex items-center justify-center p-2 text-muted-foreground md:hidden"

          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}

        >

          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}

        </button>

      </div>

      {/* --- スマホ用 メニュー展開エリア --- */}

      {isMobileMenuOpen && (

        <div className="md:hidden fixed inset-x-0 top-16 z-50 border-b border-border bg-background p-6 shadow-lg animate-in slide-in-from-top-5">

          <nav className="grid gap-4">

            {siteConfig.navigation.map((item, index) => (

              <Link

                key={index}

                href={normalizeAnchor(item.href, pathname)}

                className="text-lg font-medium text-foreground py-2 border-b border-border/50"

                onClick={() => setIsMobileMenuOpen(false)}

              >

                {item.label}

              </Link>

            ))}

            

            <div className="grid gap-3 mt-4 pt-4 border-t border-border">

              {isLoading ? (

                // スマホ版スケルトン

                <div className="flex flex-col gap-3 animate-pulse">

                  <div className="h-10 w-full rounded bg-slate-200/50" />

                  <div className="h-10 w-full rounded bg-slate-200/50" />

                </div>

              ) : isGuestOrIndividual ? (

                 <>

                  <Link href="/auth/login?type=business" onClick={() => setIsMobileMenuOpen(false)}>

                    <Button variant="outline" className="w-full">ログイン</Button>

                  </Link>

                  <Link href="/auth/signup-b2b" onClick={() => setIsMobileMenuOpen(false)}>

                    <Button className="w-full bg-slate-900 text-white">法人登録</Button>

                  </Link>

                 </>

              ) : !hasSubscription ? (

                 <>

                   <Link href="/business#pricing" onClick={() => setIsMobileMenuOpen(false)}>

                     <Button className="w-full bg-indigo-600 text-white">プラン契約</Button>

                   </Link>

                   <Button variant="outline" onClick={handleLogout} className="w-full">ログアウト</Button>

                 </>

              ) : (

                 <>

                   <Link href={`/organization/${orgId}`} onClick={() => setIsMobileMenuOpen(false)}>

                     <Button variant="outline" className="w-full text-indigo-700 border-indigo-200">ダッシュボード</Button>

                   </Link>

                   <Button variant="ghost" onClick={handleLogout} className="w-full">ログアウト</Button>

                 </>

              )}

            </div>

          </nav>

        </div>

      )}

    </header>

  );

}
