"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

// 管理する状態の型定義
type AuthState = {
  isLoading: boolean;
  userId: string | null;
  userType: "individual" | "corporate" | null;
  orgId: string | null;
  hasSubscription: boolean;
  planId: string | null;
};

// コンテキスト作成
const AuthContext = createContext<AuthState>({
  isLoading: true,
  userId: null,
  userType: null,
  orgId: null,
  hasSubscription: false,
  planId: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    userId: null,
    userType: null,
    orgId: null,
    hasSubscription: false,
    planId: null,
  });

  // 状態を更新する関数（DBフェッチ含む）
  const refreshAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setState(prev => ({ ...prev, isLoading: false, userId: null, userType: null, orgId: null, hasSubscription: false, planId: null }));
        return;
      }

      const userId = session.user.id;

      // 1. プロフィール取得
      const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", userId).maybeSingle();
      const userType = profile?.user_type || "individual";

      let orgId = null;
      let hasSubscription = false;
      let planId = null;

      if (userType === "corporate") {
        // 2. 組織取得
        const { data: member } = await supabase.from("organization_members").select("organization_id").eq("user_id", userId).maybeSingle();
        orgId = member?.organization_id || null;

        // 3. サブスク取得
        const { data: sub } = await supabase.from("subscriptions").select("status, plan_id").eq("user_id", userId).in("status", ["active", "trialing"]).maybeSingle();
        
        if (sub) {
          hasSubscription = true;
          planId = sub.plan_id;
        }
      }

      setState({ isLoading: false, userId, userType: userType as "individual" | "corporate" | null, orgId, hasSubscription, planId });
    } catch (e) {
      console.error("Auth fetch error:", e);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    // 初回実行
    refreshAuth();

    // 監視開始 (ここが最重要)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        refreshAuth();
        if (event === 'SIGNED_OUT') router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
}

// カスタムフック (便利ツール)
export const useUserStatus = () => useContext(AuthContext);
