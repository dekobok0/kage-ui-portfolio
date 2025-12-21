"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, CheckCircle2, Play, ChevronLeft } from "lucide-react";
import Link from "next/link";
import AssessmentPlayer from "@/components/AssessmentPlayer"; 
// 長い方 (60問〜) をインポート
import { FULL_ASSESSMENTS as ASSESSMENTS } from "@/lib/constants/assessmentData_full";

// アイコンマッピング
import { BrainCircuit, Zap, Eye, Activity, Users, Waves } from "lucide-react";
const ICONS: Record<string, any> = {
  hexaco: BrainCircuit,
  kai: Zap,
  osivq: Eye,
  asrs: Activity,
  aq: Users,
  sensory: Waves,
};

export default function InvitePage({ params }: { params: { token: string } }) {
  const { token } = params;
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 画面遷移の状態管理
  // landing: 最初の招待状画面
  // board: 6つのテスト一覧（クエストボード）
  // playing: テスト実施中
  // done: 全完了画面
  const [view, setView] = useState<"landing" | "board" | "playing" | "done">("landing");
  
  const [currentTestId, setCurrentTestId] = useState<string | null>(null);
  const [completedTests, setCompletedTests] = useState<Record<string, boolean>>({});
  const [resultsBuffer, setResultsBuffer] = useState<any>({});

  // 初期ロード：トークン検証と履歴復元
  useEffect(() => {
    const checkToken = async () => {
      const { data, error } = await supabase
        .from("recruitment_campaigns")
        .select("*") // organizationsへの結合を削除し、シンプルに "*" だけにする
        .eq("public_link_token", token)
        .eq("is_active", true)
        .single();

      if (error || !data) {
        setError("この招待リンクは無効か、期限切れです。");
      } else {
        setCampaign(data);
        // 途中経過があれば復元
        const saved = localStorage.getItem(`kage_invite_${token}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          setResultsBuffer(parsed);
          // 完了フラグを再構築
          const restoredCompleted: Record<string, boolean> = {};
          ASSESSMENTS.forEach(a => {
            if (parsed[a.id]) restoredCompleted[a.id] = true;
          });
          setCompletedTests(restoredCompleted);
        }
      }
      setLoading(false);
    };
    checkToken();
  }, [token]);

  // テスト開始ボタン
  const startTest = (testId: string) => {
    setCurrentTestId(testId);
    setView("playing");
    window.scrollTo(0, 0);
  };

  // テスト完了時の処理
  const handleTestComplete = (answers: Record<string, number>) => {
    if (!currentTestId) return;
    
    // バッファに保存
    const newBuffer = { ...resultsBuffer, [currentTestId]: answers };
    setResultsBuffer(newBuffer);
    
    // 完了フラグ更新
    const newCompleted = { ...completedTests, [currentTestId]: true };
    setCompletedTests(newCompleted);

    // ローカルストレージ保存（途中離脱対策）
    localStorage.setItem(`kage_invite_${token}`, JSON.stringify(newBuffer));

    // ビューをボードに戻す
    setView("board");
    setCurrentTestId(null);

    // 全クリアチェック
    const isAllDone = ASSESSMENTS.every(a => newCompleted[a.id]);
    if (isAllDone) {
      setTimeout(() => setView("done"), 800); // 余韻を持たせて完了画面へ
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">読み込み中...</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;

  // ---------------------------------------------------------
  // 4. 全完了画面 (Done)
  // ---------------------------------------------------------
  if (view === "done") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center space-y-6 animate-in zoom-in duration-300">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">クエストコンプリート！</h2>
          <p className="text-slate-600">
            すべての診断が完了しました。<br/>
            {/* 会社名を削除し、汎用的なメッセージに変更 */}
            結果を保存し、採用担当者へ提出するには、アカウントを作成してください。
          </p>
          <div className="pt-4 space-y-3">
            {/* ボタンの文言を「メールアドレスで...」に変更 */}
            <Link 
              href={`/auth/signup?redirect=/invite/${token}/submit`} 
              className="block w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
            >
              メールアドレスで登録して結果を保存
            </Link>
            <p className="text-xs text-slate-400">
              ※アカウント作成は無料です。あなたのデータはあなた自身に帰属します。
            </p>
            {/* デバッグ用リセットボタン */}
            <button 
              onClick={() => {
                localStorage.removeItem(`kage_invite_${token}`);
                window.location.reload();
              }}
              className="text-xs text-red-400 underline hover:text-red-600 mt-4 block mx-auto"
            >
              [開発用] データを消して最初からやり直す
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // 3. プレイ画面 (Playing)
  // ---------------------------------------------------------
  if (view === "playing" && currentTestId) {
    const assessment = ASSESSMENTS.find(a => a.id === currentTestId);
    if (!assessment) return null;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* ヘッダー: 戻るボタン */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center sticky top-0 z-10 shadow-sm">
          <Button variant="ghost" size="sm" onClick={() => setView("board")} className="text-slate-500 hover:text-slate-800">
            <ChevronLeft className="w-5 h-5 mr-1" /> 一覧に戻る
          </Button>
          <span className="ml-4 font-bold text-slate-700 text-sm truncate">{assessment.title}</span>
        </header>

        <div className="flex-1 py-8 px-4">
          <AssessmentPlayer 
            key={assessment.id} 
            assessment={assessment}
            onComplete={handleTestComplete}
            // 最初の質問で戻るを押した時の動作
            onBack={() => setView("board")} 
          />
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // 2. クエストボード画面 (Board)
  // ---------------------------------------------------------
  if (view === "board") {
    const completedCount = Object.values(completedTests).filter(Boolean).length;
    const totalCount = ASSESSMENTS.length;
    const progress = Math.round((completedCount / totalCount) * 100);

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* ヘッダー: LPに戻るボタン */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10">
          <Button variant="ghost" size="sm" onClick={() => setView("landing")} className="text-slate-500 hover:text-slate-800">
            <ChevronLeft className="w-5 h-5 mr-1" /> トップに戻る
          </Button>
        </header>

        <div className="flex-1 py-12 px-4">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">診断クエストボード</h2>
              <p className="text-slate-500">以下の6つのミッションをすべてクリアしてください。</p>
              
              {/* 全体進捗バー */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-4 max-w-md mx-auto">
                <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-xs text-center text-slate-400 mt-1">{completedCount} / {totalCount} 完了</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {ASSESSMENTS.map((test) => {
                const isDone = completedTests[test.id];
                const Icon = ICONS[test.id] || BrainCircuit;

                return (
                  <button
                    key={test.id}
                    disabled={isDone}
                    onClick={() => startTest(test.id)}
                    className={`flex items-center p-4 rounded-xl border text-left transition-all group relative overflow-hidden
                      ${isDone 
                        ? "bg-slate-50 border-slate-200 opacity-60 cursor-default" 
                        : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5"
                      }
                    `}
                  >
                    {isDone && (
                      <div className="absolute top-2 right-2 text-green-500 bg-white rounded-full p-0.5 shadow-sm">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                    
                    <div className={`p-3 rounded-lg mr-4 ${isDone ? "bg-slate-100 text-slate-400" : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100"}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <div>
                      <h3 className={`font-bold text-sm ${isDone ? "text-slate-500" : "text-slate-900"}`}>{test.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{test.timeEstimate}</p>
                    </div>

                    {!isDone && (
                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-5 h-5 text-indigo-400" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // 1. ランディング画面 (LP)
  // ---------------------------------------------------------
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold">
            <ShieldCheck className="w-4 h-4" /> Official Invitation
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            {/* 会社名を削除し、サービス名などを表示 */}
            <span className="text-indigo-600">Selection DX</span><br/>
            適性検査・招待状
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-lg mx-auto">
            従来の堅苦しいテストではありません。<br/>
            RPG感覚の診断で、あなたの隠れた才能（ニューロ・アバター）を発見し、企業との「最高の相性」を確認しましょう。
          </p>
        </div>

        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 w-full max-w-md">
          <ul className="text-sm text-slate-600 space-y-3 text-left">
            <li className="flex gap-2">✅ 対象テスト：{ASSESSMENTS.length}種類（HEXACO, KAI等）</li>
            <li className="flex gap-2">✅ 所要時間：約 15分（途中保存不可）</li>
            <li className="flex gap-2">✅ メリット：あなたの「取扱説明書」が手に入ります</li>
          </ul>
        </div>

        <button 
          onClick={() => setView("board")}
          className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-slate-900 px-8 font-medium text-white transition-all duration-300 hover:bg-slate-800 hover:shadow-xl hover:-translate-y-1"
        >
          <span className="mr-2 text-lg font-bold">診断クエストを開始する</span>
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>
      </main>
      
      <footer className="py-6 text-center text-xs text-slate-400">
        Powered by Kage OS
      </footer>
    </div>
  );
}