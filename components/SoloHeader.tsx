"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { LogIn, LayoutDashboard } from "lucide-react";

export function SoloHeader() {
  // 単なる isLoggedIn ではなく、「個人としてログインしているか」を管理
  const [isIndividualLoggedIn, setIsIndividualLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // ログインしていても、タイプを確認する
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", session.user.id)
          .single();
        
        // 個人(individual)の時だけログイン扱いにする
        // 法人(corporate)なら、ここでは「未ログイン」と同じ扱い（false）にする
        if (profile?.user_type === "individual") {
          setIsIndividualLoggedIn(true);
        } else {
          setIsIndividualLoggedIn(false);
        }
      } else {
        setIsIndividualLoggedIn(false);
      }
      setIsLoading(false);
    };

    checkUser();

    // 認証状態の変更監視も同様にチェックが必要
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", session.user.id)
          .single();
        setIsIndividualLoggedIn(profile?.user_type === "individual");
      } else {
        setIsIndividualLoggedIn(false);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        {/* ロゴ */}
        <Link href="/" className="flex items-center space-x-2 font-bold hover:opacity-80">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-xs font-semibold bg-slate-900 text-white">
            {siteConfig.brandMark}
          </span>
          <span>{siteConfig.name}</span>
        </Link>
        
        {/* 右側メニュー */}
        <div className="flex items-center gap-4">
          {isLoading ? (
            // ロード中はチラつき防止のため空、またはスケルトン
            <div className="w-24" />
          ) : isIndividualLoggedIn ? (
            // 「個人」としてログイン中の場合のみ表示
            <Link href="/dashboard">
              <Button variant="outline" className="gap-2 border-indigo-200 text-indigo-700">
                <LayoutDashboard className="w-4 h-4" /> ダッシュボード
              </Button>
            </Link>
          ) : (
            // 未ログイン、または「法人」としてログイン中の場合
            // ここでは「他人」として振る舞い、新規登録などを表示する
            <>
              <Link href="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-2">
                <LogIn className="w-4 h-4" /> ログイン
              </Link>
              <Link href="/auth/signup?type=individual">
                <Button>無料で始める（個人）</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
