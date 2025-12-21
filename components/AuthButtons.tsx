"use client";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabaseClient";

import { Button, buttonVariants } from "@/components/ui/button";

import { cn } from "@/lib/utils";

// Contextから状態をもらうためのフックをインポート

import { useUserStatus } from "@/components/providers/AuthContext";

export function AuthButtons() {

  const router = useRouter();

  

  // 独自にsupabaseに問い合わせるのをやめ、親(AuthContext)から
  // 「確定済みのログイン情報」をもらいます。これでHeaderやPricingと完全に同期します。

  const { userId, orgId, isLoading } = useUserStatus();

  

  // 判定ロジック

  const isLoggedIn = !!userId;

  const handleSignOut = async () => {

    // ログアウト処理

    await supabase.auth.signOut();

    // ContextがonAuthStateChangeを検知して自動で状態を更新しますが、

    // 念のため画面遷移とリフレッシュを行います

    router.refresh();

    router.replace("/auth/login");

  };

  // ロード中はガタつき防止のため何も表示しない（またはスケルトンを表示）

  if (isLoading) return null;

  // ------------------------------------------------

  // パターンA: ログイン済みの場合

  // ------------------------------------------------

  if (isLoggedIn) {

    // 組織IDがある場合は組織ページ、なければ個人ダッシュボードへ

    const dashboardHref = orgId 

      ? `/organization/${orgId}`

      : "/dashboard";

    

    return (

      <div className="flex items-center gap-2">

        {/* 必要に応じてここにユーザー名などを表示してもOK */}

        

        <Link href={dashboardHref} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>

          ダッシュボード

        </Link>

        

        <Button size="sm" onClick={handleSignOut}>

          ログアウト

        </Button>

      </div>

    );

  }

  // ------------------------------------------------

  // パターンB: 未ログインの場合

  // ------------------------------------------------

  return (

    <div className="flex items-center gap-2">

      <Link href="/auth/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>

        ログイン

      </Link>

      

      <Button size="sm" asChild>

        <Link href="/auth/signup-b2b">法人登録</Link>

      </Button>

    </div>

  );

}
