"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  BrainCircuit, 
  Zap, 
  Eye, 
  Activity, 
  Stethoscope, 
  Users, 
  Waves,
  ExternalLink,
  Lock,
  CalendarClock,
  AlertCircle,
  Loader2
} from "lucide-react";

const ASSESSMENT_META = [
  { id: "hexaco", name: "6因子性格診断", desc: "誠実性・謙虚さを含む6つの特性を分析", icon: BrainCircuit },
  { id: "kai", name: "問題解決スタイル", desc: "ルール順守型か、革新・打破型か", icon: Zap },
  { id: "osivq", name: "認知スタイル (視覚/言語)", desc: "映像で考えるか、言葉で考えるか", icon: Eye },
  { id: "asrs", name: "注意・集中スタイル", desc: "不注意や衝動性の傾向チェック", icon: Activity },
  { id: "aq", name: "コミュニケーション特性", desc: "対人関係やこだわりの傾向", icon: Users },
  { id: "sensory", name: "感覚・感受性チェック", desc: "音・光・肌触りへの敏感さ", icon: Waves },
];

const LOCK_PERIOD_DAYS = 90;

export default function DashboardPage() {
  const router = useRouter();
  const [assessmentStatus, setAssessmentStatus] = useState<Record<string, { completedAt: string, isLocked: boolean, unlockDate: string | null }>>({});
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false); // データ保存中かどうか
  const [userName, setUserName] = useState("");
  
  // 2重実行防止用
  const syncAttempted = useRef(false);

  useEffect(() => {
    const initData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/auth/login");
        return;
      }

      // 1. プロフィール確認（法人なら即リダイレクト）
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", session.user.id)
        .single();

      if (profile?.user_type === "corporate") {
        const { data: orgMember } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", session.user.id)
          .limit(1)
          .maybeSingle();

        if (orgMember) {
          router.replace(`/organization/${orgMember.organization_id}`);
          return;
        }
      }

      setUserName(session.user.email?.split("@")[0] || "ゲスト");

      // -------------------------------------------------------------
      // 未保存データの自動吸い上げ (Sync)
      // -------------------------------------------------------------
      if (!syncAttempted.current) {
        syncAttempted.current = true;
        const localData = localStorage.getItem("kage_personal_progress");
        
        if (localData) {
          setIsSyncing(true);
          try {
            const answersMap = JSON.parse(localData);
            
            // DB保存用のデータ形式に変換
            const resultsToInsert = Object.keys(answersMap).map(testId => {
              let resultData = answersMap[testId];
              // Sync時にもLite/Fullを判定してメタデータを付与
              if (testId === 'hexaco') {
                const qCount = Object.keys(resultData).filter(k => !k.startsWith('_')).length;
                resultData = {
                  ...resultData,
                  _meta: {
                    variant: qCount < 40 ? 'lite' : 'full',
                    question_count: qCount,
                    synced_at: new Date().toISOString()
                  }
                };
              }
              return {
                user_id: session.user.id,
                test_type: testId,
                status: "completed",
                result_data: resultData,
                completed_at: new Date().toISOString(),
              };
            });

            // Supabaseに一括保存
            const { error } = await supabase
              .from("assessment_results")
              .insert(resultsToInsert);

            if (!error) {
              console.log("データの同期に成功しました");
              // 保存に成功したら、ローカルストレージを消す（二重保存防止）
              localStorage.removeItem("kage_personal_progress");
            } else {
              console.error("同期エラー:", error);
            }
          } catch (e) {
            console.error("同期エラー:", e);
          } finally {
            setIsSyncing(false);
          }
        }
      }
      // -------------------------------------------------------------

      // 2. 診断データの取得 (ロック判定用)
      const { data: results } = await supabase
        .from("assessment_results")
        .select("test_type, completed_at")
        .eq("user_id", session.user.id)
        .eq("status", "completed");

      if (results) {
        const statusMap: Record<string, any> = {};
        const now = new Date();

        results.forEach((r) => {
          if (!r.completed_at) return;
          
          const completedDate = new Date(r.completed_at);
          // ロック解除日計算
          const unlockDateObj = new Date(completedDate);
          unlockDateObj.setDate(unlockDateObj.getDate() + LOCK_PERIOD_DAYS);
          
          // 現在時刻と比較
          const isLocked = now < unlockDateObj;

          statusMap[r.test_type] = {
            completedAt: r.completed_at,
            isLocked: isLocked,
            unlockDate: isLocked ? unlockDateObj.toLocaleDateString() : null
          };
        });
        setAssessmentStatus(statusMap);
      }
      
      setLoading(false);
    };

    initData();
  }, [router]);

  // スマホ対策済みレポート発行関数
  const handleOpenReport = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. 先に空のウィンドウを開いておく (これならブロックされない)
    const newWindow = window.open('', '_blank');
    let { data: link } = await supabase
      .from("share_links")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!link) {
      const { data: newLink, error } = await supabase
        .from("share_links")
        .insert({ user_id: user.id })
        .select("id")
        .single();
      
      if (error) {
        newWindow?.close(); // エラーなら閉じる
        return;
      }
      link = newLink;
    }
    // 2. URLを後からセットする
    if (newWindow) {
      newWindow.location.href = `/share/${link.id}`;
    } else {
      // それでも開けなかった場合のフォールバック（画面遷移）
      router.push(`/share/${link.id}`);
    }
  };

  if (loading || isSyncing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium">
          {isSyncing ? "診断結果を保存しています..." : "データを読み込んでいます..."}
        </p>
      </div>
    );
  }

  // --- 有効会員向けダッシュボード ---
  const completedCount = Object.keys(assessmentStatus).length;
  const progress = Math.round((completedCount / ASSESSMENT_META.length) * 100);

  // 必須テスト(Basic)が完了しているかチェック
  const MANDATORY_IDS = ["hexaco", "kai", "osivq"];
  const completedIds = Object.keys(assessmentStatus);
  const missingMandatoryIds = MANDATORY_IDS.filter(id => !completedIds.includes(id));
  const isBasicCompleted = missingMandatoryIds.length === 0;

  // 足りないテストの「名前」を取得するロジック
  const missingTestNames = missingMandatoryIds
    .map(id => ASSESSMENT_META.find(m => m.id === id)?.name)
    .filter(Boolean)
    .join("・");

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          おかえりなさい、{userName} さん
        </h1>
        <p className="text-slate-500 mt-1">
          科学的根拠に基づいた特性分析を進めましょう。（現在の完了率: {progress}%）
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 左カラム: テストリスト */}
        <Card className="lg:col-span-2 border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader>
            <CardTitle>科学的特性テスト (Track A)</CardTitle>
            <CardDescription>
              以下の6つのテストを受けることで、あなたの「取扱説明書」が完成します。
            </CardDescription>
            
            {/* 事前警告エリア */}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 text-amber-800">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <strong className="block mb-1 text-amber-900">再診断の期間制限について</strong>
                データの信頼性を担保するため、一度診断を完了すると<span className="font-bold underline">90日間</span>は再受検できません。
                （完了直後の1時間は修正可能です）
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-2">
            {ASSESSMENT_META.map((test) => {
              const status = assessmentStatus[test.id];
              const isDone = !!status;
              const isLocked = status?.isLocked;

              return (
                <button
                  key={test.id}
                  onClick={() => {
                    if (isLocked) {
                      alert(`このテストは再診断期間（90日）の制限により、${status.unlockDate} までロックされています。`);
                      return;
                    }
                    router.push(`/dashboard/assessment/${test.id}`);
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all group text-left
                    ${isLocked 
                      ? "bg-slate-50 border-slate-200 cursor-not-allowed opacity-80" 
                      : "bg-white border-slate-100 hover:border-blue-200 hover:bg-blue-50"
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${isDone ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                      {isLocked ? <Lock className="w-5 h-5" /> : <test.icon className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className={`font-bold flex items-center gap-2 text-sm sm:text-base ${isLocked ? "text-slate-500" : "text-slate-700 group-hover:text-blue-700"}`}>
                        {test.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {isLocked 
                          ? `次回可能日: ${status.unlockDate}` 
                          : test.desc}
                      </div>
                      
                      {!isDone && !isLocked && (
                        <div className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> 完了後90日間ロックされます
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isLocked ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
                        <CalendarClock className="w-3 h-3" /> ロック中
                      </span>
                    ) : isDone ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                        <CheckCircle2 className="w-3 h-3" /> 完了
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                        <Circle className="w-3 h-3" /> 未実施
                      </span>
                    )}
                    
                    {!isLocked && (
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* 右カラム */}
        <div className="space-y-6">
          <Card className="border-l-4 border-l-indigo-500 bg-indigo-50/30 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-indigo-600" />
                医療的根拠 (Track B)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                医師による診断を受けている場合、こちらを申告することで、法的根拠に基づいた強力なサポートが可能になります。
              </p>
              <Button variant="outline" size="sm" className="w-full bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50" onClick={() => router.push("/dashboard/declaration")}>
                診断状況を確認・変更
              </Button>
            </CardContent>
          </Card>

          <Card className={`border-l-4 shadow-sm ${isBasicCompleted ? "border-l-purple-500 bg-purple-50/30" : "border-l-slate-300 bg-slate-50"}`}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-base font-bold flex items-center gap-2 ${isBasicCompleted ? "text-slate-800" : "text-slate-500"}`}>
                <ExternalLink className={`w-5 h-5 ${isBasicCompleted ? "text-purple-600" : "text-slate-400"}`} />
                取扱説明書 (レポート)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                あなたの特性データをまとめたレポートを発行します。<br />
                URLを共有するか、PDFとして保存して企業に提出できます。
              </p>
              
              {/* 条件分岐でボタンを出し分け */}
              {isBasicCompleted ? (
                <Button onClick={handleOpenReport} variant="outline" size="sm" className="w-full bg-white border-purple-200 text-purple-700 hover:bg-purple-50">
                  レポートを表示・印刷
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button disabled variant="outline" size="sm" className="w-full bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed">
                    まだ発行できません
                  </Button>
                  
                  {/* 具体的に何が足りないかを表示 */}
                  <div className="bg-red-50 border border-red-100 p-2 rounded text-center">
                    <p className="text-[10px] text-red-500 font-bold mb-1">
                      ⚠️ 以下の診断が未完了です
                    </p>
                    <p className="text-xs font-bold text-slate-700">
                      {missingTestNames}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}