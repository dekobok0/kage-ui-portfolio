"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ASSESSMENTS, type AssessmentDef } from "@/lib/constants/assessmentData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, RotateCcw, Save, ChevronLeft, Lock, CalendarClock } from "lucide-react";

export default function AssessmentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  // --- 状態管理 ---
  const [assessment, setAssessment] = useState<AssessmentDef | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<"loading" | "locked" | "playing" | "confirm" | "submitting" | "completed">("loading");
  const [nextAvailableDate, setNextAvailableDate] = useState<string | null>(null);
  
  // --- 初期化 & ロック判定 ---
  useEffect(() => {
    const init = async () => {
      // 1. 定義のロード
    const target = ASSESSMENTS.find((a) => a.id === id);
      if (!target) {
        router.replace("/dashboard");
        return;
      }
      setAssessment(target);

      // 2. ユーザー確認
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      // 3. 前回の結果を確認（ロック判定）
      const { data: prevResult } = await supabase
        .from("assessment_results")
        .select("completed_at")
        .eq("user_id", user.id)
        .eq("test_type", id)
        .single();

      if (prevResult?.completed_at) {
        const lastDate = new Date(prevResult.completed_at);
        const now = new Date();
        
        // 制限期間: 90日 (約3ヶ月)
        const LOCK_PERIOD_DAYS = 90;
        // 救済期間: 1時間 (操作ミス修正用)
        const GRACE_PERIOD_MINUTES = 60;
        const daysSince = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
        const minutesSince = (now.getTime() - lastDate.getTime()) / (1000 * 60);

        // 「3ヶ月経っていない」かつ「1時間を過ぎている」場合はロック
        if (daysSince < LOCK_PERIOD_DAYS && minutesSince > GRACE_PERIOD_MINUTES) {
          const unlockDate = new Date(lastDate);
          unlockDate.setDate(unlockDate.getDate() + LOCK_PERIOD_DAYS);
          
          setNextAvailableDate(unlockDate.toLocaleDateString());
          setStatus("locked");
          return;
    }
      }

      setStatus("playing");
    };

    init();
  }, [id, router]);

  if (!assessment || status === "loading") return <div className="p-8 text-center">読み込み中...</div>;

  // --- ロック画面 ---
  if (status === "locked") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md text-center py-10 shadow-lg border-t-4 border-t-slate-400">
          <CardContent className="space-y-6">
            <div className="mx-auto w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
              <Lock className="w-10 h-10 text-slate-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">再診断は制限されています</h2>
              <p className="text-slate-500 mt-4 text-sm leading-relaxed">
                データの信頼性を保つため、診断のやり直しには期間制限（90日）を設けています。<br/>
                あなたの特性は短期間で大きく変化するものではありません。
              </p>
              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100 inline-flex items-center gap-3">
                <CalendarClock className="w-5 h-5 text-amber-600" />
                <div className="text-left">
                  <div className="text-xs text-amber-600 font-bold">次回診断可能日</div>
                  <div className="text-sm font-bold text-slate-800">{nextAvailableDate} 以降</div>
                </div>
              </div>
            </div>
            <Button onClick={() => router.push("/dashboard")} className="w-full bg-slate-900 text-white hover:bg-slate-800">
              ダッシュボードに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- 以下、通常の診断ロジック ---

  const currentQuestion = assessment.questions[currentIndex];
  const progress = status === "playing" ? ((currentIndex) / assessment.questions.length) * 100 : 100;

  const handleAnswer = (score: number) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: score }));
    if (currentIndex < assessment.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setStatus("confirm");
    }
  };

  const handleBack = () => {
    if (status === "confirm") {
      setStatus("playing");
      return;
    }
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const submitResults = async () => {
    setStatus("submitting");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const normalizedData: Record<string, number> = {};
    
    Object.entries(answers).forEach(([qId, rawScore]) => {
      const questionDef = assessment.questions.find(q => q.id === qId);
      if (questionDef?.scoringType === "negative") {
        normalizedData[qId] = 6 - rawScore;
      } else {
        normalizedData[qId] = rawScore;
      }
    });

    // insertを使用（履歴として保存するため、upsertは使用しない）
    const { error } = await supabase
      .from("assessment_results")
      .insert({
        user_id: user.id,
        test_type: id,
        status: "completed",
        result_data: normalizedData,
        completed_at: new Date().toISOString(), // 日時を更新＝ここからまた90日カウント
      });

    if (error) {
      alert("保存に失敗しました。");
      setStatus("confirm");
    } else {
      setStatus("completed");
    }
  };

  const handleRetry = () => {
    if (confirm("回答がリセットされます。よろしいですか？")) {
      setAnswers({});
      setCurrentIndex(0);
      setStatus("playing");
    }
  };

  if (status === "submitting") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
          <p className="text-slate-500">結果を保存しています...</p>
        </div>
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md text-center py-12 shadow-lg border-t-4 border-t-emerald-500">
          <CardContent className="space-y-6">
            <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">診断完了！</h2>
              <p className="text-slate-500 mt-2">結果をデータベースに保存しました。</p>
            </div>
            <div className="flex flex-col gap-3 pt-4">
              <Button onClick={() => router.push("/dashboard")} className="w-full bg-slate-900 text-white hover:bg-slate-800">
                ダッシュボードに戻る
              </Button>
              {/* 完了直後はロックしない（1時間以内なら修正可能というUXのため、あえて再診断ボタンを残すか、または消すか） */}
              {/* ここでは「完了直後＝救済期間」なので、修正ボタンは残しておきます */}
              <Button variant="ghost" onClick={handleRetry} className="text-slate-500">
                <RotateCcw className="w-4 h-4 mr-2" /> 修正してやり直す (1時間以内)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "confirm") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader>
            <CardTitle>回答の確認</CardTitle>
            <CardDescription>すべての質問に回答しました。この内容で診断を終了しますか？</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-100 p-4 rounded-lg text-center">
              <p className="text-sm text-slate-500">回答数</p>
              <p className="text-3xl font-bold text-slate-800">{Object.keys(answers).length} / {assessment.questions.length}</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button onClick={submitResults} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
              <Save className="w-4 h-4 mr-2" /> 診断結果を保存する
            </Button>
            <Button variant="outline" onClick={handleBack} className="w-full">
              戻って修正する
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-sm font-bold text-slate-900">{assessment.title}</h1>
          <p className="text-xs text-slate-500">{assessment.subtitle}</p>
        </div>
        <div className="ml-auto text-xs font-mono text-slate-400">
          {currentIndex + 1} / {assessment.questions.length}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full">
        <div className="w-full mb-8 px-1">
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="w-full shadow-md border-0 sm:border animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="text-center pb-2">
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit mx-auto mb-4">
              Q{currentIndex + 1}
            </span>
            <CardTitle className="text-xl sm:text-2xl leading-relaxed">
              {currentQuestion.text}
            </CardTitle>
            <CardDescription className="pt-4 text-slate-400 text-xs">
              カテゴリー: {currentQuestion.category}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-8 space-y-3">
            <AnswerButton score={5} label="非常によくあてはまる" currentAnswer={answers[currentQuestion.id]} onClick={handleAnswer} />
            <AnswerButton score={4} label="ややあてはまる" currentAnswer={answers[currentQuestion.id]} onClick={handleAnswer} />
            <AnswerButton score={3} label="どちらともいえない" currentAnswer={answers[currentQuestion.id]} onClick={handleAnswer} />
            <AnswerButton score={2} label="あまりあてはまらない" currentAnswer={answers[currentQuestion.id]} onClick={handleAnswer} />
            <AnswerButton score={1} label="全くあてはまらない" currentAnswer={answers[currentQuestion.id]} onClick={handleAnswer} />
          </CardContent>
          <CardFooter className="pt-0 pb-6 flex justify-start">
            <Button variant="ghost" size="sm" onClick={handleBack} disabled={currentIndex === 0} className="text-slate-400 hover:text-slate-600">
              <ChevronLeft className="w-4 h-4 mr-1" /> 前の質問に戻る
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-xs text-slate-400 max-w-md px-4">
          出典・根拠: {assessment.academicSource}
        </div>
      </main>
    </div>
  );
}

function AnswerButton({ score, label, currentAnswer, onClick }: { score: number, label: string, currentAnswer?: number, onClick: (s: number) => void }) {
  const isSelected = currentAnswer === score;
  
  return (
    <button
      onClick={() => onClick(score)}
      className={`group relative flex items-center w-full p-4 text-left border rounded-xl transition-all active:scale-[0.98]
        ${isSelected ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-slate-200 hover:border-blue-400 hover:bg-blue-50/50"}
      `}
    >
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors
        ${isSelected ? "border-blue-500 bg-blue-500 text-white" : "border-slate-300 bg-white text-slate-500 group-hover:border-blue-500 group-hover:text-blue-600"}
      `}>
        {score}
      </span>
      <span className={`ml-4 text-sm font-medium ${isSelected ? "text-blue-900" : "text-slate-700 group-hover:text-slate-900"}`}>
        {label}
      </span>
    </button>
  );
}
