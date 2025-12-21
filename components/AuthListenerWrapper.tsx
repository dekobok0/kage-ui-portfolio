"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { logTime } from "@/utils/performanceLogger";

/**
 * 認証状態変化を監視し、SIGNED_INイベントをログに記録するコンポーネント
 * このコンポーネントはアプリケーションのルートレイアウトなどで使用する
 */
export function AuthListenerWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!supabase) {
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        // T_AUTH_SIGNED_IN: SIGNED_INイベントを受け取った瞬間
        logTime("T_AUTH_SIGNED_IN", "認証状態変化: SIGNED_INイベント受信", {
          hasSession: !!session,
          userId: session?.user?.id,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}

