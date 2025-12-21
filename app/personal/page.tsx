"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, BrainCircuit, CheckCircle2, ChevronLeft, Zap, Eye, Activity, Users, Waves, Star } from "lucide-react";
import AssessmentPlayer from "@/components/AssessmentPlayer"; 
import { ASSESSMENTS, MANDATORY_ASSESSMENT_IDS } from "@/lib/constants/assessmentData";
import { supabase } from "@/lib/supabaseClient";
import { SoloHeader } from "@/components/SoloHeader";

const ICONS: Record<string, any> = {
  hexaco: BrainCircuit,
  kai: Zap,
  osivq: Eye,
  asrs: Activity,
  aq: Users,
  sensory: Waves,
};

export default function PersonalPage() {
  const [view, setView] = useState<"landing" | "board" | "playing" | "done">("landing");
  const [currentTestId, setCurrentTestId] = useState<string | null>(null);
  const [completedTests, setCompletedTests] = useState<Record<string, boolean>>({});
  const [resultsBuffer, setResultsBuffer] = useState<any>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("kage_personal_progress");
    if (saved) {
      const parsed = JSON.parse(saved);
      setResultsBuffer(parsed);
      const restoredCompleted: Record<string, boolean> = {};
      ASSESSMENTS.forEach(a => {
        if (parsed[a.id]) restoredCompleted[a.id] = true;
      });
      setCompletedTests(restoredCompleted);
    }

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    checkUser();
  }, []);

  const startTest = (testId: string) => {
    setCurrentTestId(testId);
    setView("playing");
    window.scrollTo(0, 0);
  };

  const handleTestComplete = (answers: Record<string, number>) => {
    if (!currentTestId) return;
    
    const newBuffer = { ...resultsBuffer, [currentTestId]: answers };
    setResultsBuffer(newBuffer);
    
    const newCompleted = { ...completedTests, [currentTestId]: true };
    setCompletedTests(newCompleted);
    localStorage.setItem("kage_personal_progress", JSON.stringify(newBuffer));
    setView("board");
    setCurrentTestId(null);
  };

  // ---------------------------------------------------------
  // 3. プレイ画面
  // ---------------------------------------------------------
  if (view === "playing" && currentTestId) {
    const assessment = ASSESSMENTS.find(a => a.id === currentTestId);
    if (!assessment) return null;
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col w-full overflow-x-hidden">
        <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center sticky top-0 z-10 shadow-sm w-full">
          <Button variant="ghost" size="sm" onClick={() => setView("board")} className="text-slate-500 hover:text-slate-800 shrink-0">
            <ChevronLeft className="w-5 h-5 mr-1" /> 中断
          </Button>
          {/* truncate と min-w-0 で確実にはみ出し防止 */}
          <span className="ml-2 font-bold text-slate-700 text-sm truncate flex-1 min-w-0">{assessment.title}</span>
        </div>
        <div className="flex-1 py-4 px-3 pb-20 md:py-8 w-full max-w-full">
          <AssessmentPlayer key={assessment.id} assessment={assessment} onComplete={handleTestComplete} onBack={() => setView("board")} />
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // 2. ボード画面 (レスポンシブ完全対応)
  // ---------------------------------------------------------
  if (view === "board") {
    const isMandatoryCompleted = MANDATORY_ASSESSMENT_IDS.every(id => completedTests[id]);
    
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col w-full overflow-x-hidden">
        <SoloHeader />
        
        {/* ナビゲーションバー */}
        <div className="bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between sticky top-16 z-30 shadow-sm w-full">
            <Button variant="ghost" size="sm" onClick={() => setView("landing")} className="text-slate-500 hover:text-slate-800 text-xs shrink-0">
               <ChevronLeft className="w-4 h-4 mr-1" /> LPへ
            </Button>
            
            {/* スライドインアニメーションを削除し、単なるフェードインに変更（横ずれ防止） */}
            {isMandatoryCompleted && (
              <div className="animate-in fade-in duration-300">
                {isLoggedIn ? (
                  <Link href="/dashboard">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md text-xs h-8 px-3">
                      保存して完了 <CheckCircle2 className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth/signup?type=individual&source=personal_assessment">
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md text-xs h-8 px-3">
                      結果を見る <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            )}
        </div>
        <div className="flex-1 py-6 px-3 pb-24 w-full">
          <div className="max-w-4xl mx-auto space-y-6 w-full">
            <div className="text-center space-y-2 px-2">
              <h2 className="text-xl font-bold text-slate-900">診断クエストボード</h2>
              <p className="text-slate-500 text-xs leading-relaxed">
                まずは<span className="font-bold text-indigo-600">「Basic」</span>の3つをクリアしてください。<br/>
                これだけであなたの「取扱説明書」が発行されます。
              </p>
            </div>
            {/* グリッドレイアウト: gapを小さくして、はみ出しを防ぐ */}
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full">
              {ASSESSMENTS.map((test) => {
                const isDone = completedTests[test.id];
                const Icon = ICONS[test.id] || BrainCircuit;
                const isMandatory = MANDATORY_ASSESSMENT_IDS.includes(test.id);
                return (
                  <button key={test.id} disabled={isDone} onClick={() => startTest(test.id)} 
                    className={`flex flex-row sm:flex-col items-center sm:items-start p-3 rounded-xl border text-left transition-all relative overflow-hidden w-full gap-3 sm:gap-0
                      ${isDone 
                        ? "bg-slate-50 border-slate-200 opacity-70 cursor-default" 
                        : "bg-white border-slate-200 hover:border-indigo-400 hover:shadow-lg active:scale-[0.98]"
                      }
                      ${isMandatory && !isDone ? "ring-1 ring-indigo-100 border-indigo-300" : ""}
                    `}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start sm:w-full sm:mb-3 shrink-0">
                      <div className={`p-2 rounded-lg ${isDone ? "bg-slate-200 text-slate-500" : isMandatory ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="mt-1 sm:mt-0">
                        {isDone ? (
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> <span className="hidden sm:inline">完了</span>
                          </span>
                        ) : isMandatory ? (
                          <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" /> Basic
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Option
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0 w-full">
                      <h3 className={`font-bold text-sm mb-0.5 truncate ${isDone ? "text-slate-500" : "text-slate-900"}`}>{test.title}</h3>
                      <p className="text-[10px] text-slate-400 mb-1">{test.timeEstimate}</p>
                      {/* 説明文はスマホでは非表示にしてスッキリさせる */}
                      <p className="text-[10px] text-slate-500 leading-tight line-clamp-2 hidden sm:block">
                        {test.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {isMandatoryCompleted && !isLoggedIn && (
               <div className="text-center pt-6 pb-8 w-full px-4">
                 <p className="text-xs text-slate-500 mb-3">
                   <span className="font-bold text-indigo-600">Basicデータ</span>が揃いました！
                 </p>
                 <Link href="/auth/signup?type=individual&source=personal_assessment" className="block w-full">
                    <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xl w-full px-4 py-6 rounded-xl text-base">
                      無料で結果を保存して見る
                    </Button>
                 </Link>
               </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // 1. LP画面 (レスポンシブ完全対応)
  // ---------------------------------------------------------
  return (
    <div className="min-h-screen bg-white flex flex-col w-full overflow-x-hidden">
      <SoloHeader />
      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center max-w-3xl mx-auto space-y-6 animate-in fade-in zoom-in duration-500 w-full">
        <div className="space-y-3 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">
            <ShieldCheck className="w-3 h-3" /> Personal Assessment
          </div>
          {/* 文字サイズをスマホ向けに調整 (3xl -> 2xl) */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight px-2">
            あなたの才能を、<br/><span className="text-indigo-600">科学的に証明</span>する。
          </h1>
          <p className="text-xs sm:text-base text-slate-600">登録不要で、すぐに診断を開始できます。</p>
        </div>
        <button onClick={() => setView("board")} className="bg-slate-900 text-white px-6 py-4 rounded-full font-bold text-sm sm:text-lg hover:bg-slate-800 transition-all hover:shadow-xl hover:-translate-y-1 flex items-center gap-2 w-full max-w-xs justify-center">
           無料で診断を始める <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <p className="text-[10px] text-slate-400">※ 完全無料 / 登録5分</p>
      </main>
      <footer className="py-6 text-center text-[10px] text-slate-400">
        Powered by Kage OS
      </footer>
    </div>
  );
}
