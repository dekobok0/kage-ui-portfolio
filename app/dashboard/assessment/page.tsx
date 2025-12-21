"use client"; // ローカルストレージを使うためにクライアント化

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { DiagnosedDeclaration } from "@/components/DiagnosedDeclaration";

export default function AssessmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      if (!supabase) return;

      // 1. セッション取得 (ローカルストレージ)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/auth/login");
        return;
      }

      setUserId(session.user.id);

      // 2. プロフィール取得
      const { data } = await supabase
        .from("profiles")
        .select("diagnosed_status, diagnosed_details")
        .eq("id", session.user.id)
        .single();

      if (data) setProfile(data);
      setLoading(false);
    };

    init();
  }, [router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">読み込み中...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">キャリア・アセスメント</h1>
      
      {/* AI生成の前に申告させる */}
      {userId && (
        <DiagnosedDeclaration 
          userId={userId}
          initialStatus={profile?.diagnosed_status || 'not_declared'}
          initialDetails={profile?.diagnosed_details}
        />
      )}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">AI問診スタート</h2>
        <p className="text-slate-600 mb-4">
          あなたの職場での「強み」と「苦しさ」を分析します。（※ここにチャットUIなどが入ります）
        </p>
        <div className="p-4 bg-slate-100 rounded text-center text-slate-500">
          [アセスメント機能の実装エリア]
        </div>
      </div>
    </div>
  );
}

