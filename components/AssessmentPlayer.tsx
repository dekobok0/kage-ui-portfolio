"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";

import { ArrowLeft, CheckCircle2, RotateCcw, Save, ChevronLeft } from "lucide-react";

import type { AssessmentDef } from "@/lib/constants/assessmentData";

type Props = {

  assessment: AssessmentDef;

  onComplete: (answers: Record<string, number>) => void; // 完了時の処理（親が決める）

  onBack?: () => void; // 戻るボタンの処理（任意）

};

export default function AssessmentPlayer({ assessment, onComplete, onBack }: Props) {

  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState<Record<string, number>>({});

  const [status, setStatus] = useState<"playing" | "confirm">("playing");

  const currentQuestion = assessment.questions[currentIndex];

  const progress = ((currentIndex) / assessment.questions.length) * 100;

  // 回答時の処理

  const handleAnswer = (score: number) => {

    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: score }));

    if (currentIndex < assessment.questions.length - 1) {

      setCurrentIndex((prev) => prev + 1);

    } else {

      setStatus("confirm");

    }

  };

  // 戻る処理

  const handleBackStep = () => {

    if (status === "confirm") {

      setStatus("playing");

      return;

    }

    if (currentIndex > 0) {

      setCurrentIndex((prev) => prev - 1);

    } else {

      if (onBack) onBack(); // 最初の質問なら親の戻る処理を呼ぶ

    }

  };

  // 確定処理
  // ※ポートフォリオ用: 実際のスコアリングロジックはバックエンドで処理されます

  const handleSubmit = () => {

    // スコアの正規化処理（実装詳細は非公開）
    // 本番環境ではサーバーサイドAPIで処理
    const normalizedData: Record<string, number> = {};

    Object.entries(answers).forEach(([qId, rawScore]) => {
      const numericScore = Number(rawScore);
      if (isNaN(numericScore)) return;
      
      // 実際の計算ロジックはバックエンドに集約
      normalizedData[qId] = numericScore;
    });

    onComplete({
      ...normalizedData,
      _version: 1
    });

  };

  // 確認画面

  if (status === "confirm") {

    return (

      <div className="w-full max-w-lg mx-auto">

        <Card className="shadow-lg animate-in fade-in zoom-in duration-300">

          <CardHeader>

            <CardTitle>回答の確認</CardTitle>

            <CardDescription>すべての質問に回答しました。</CardDescription>

          </CardHeader>

          <CardContent className="space-y-4">

            <div className="bg-slate-100 p-4 rounded-lg text-center">

              <p className="text-sm text-slate-500">回答数</p>

              <p className="text-3xl font-bold text-slate-800">{Object.keys(answers).length} / {assessment.questions.length}</p>

            </div>

          </CardContent>

          <CardFooter className="flex flex-col gap-3">

            <Button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">

              <Save className="w-4 h-4 mr-2" /> 診断を完了する

            </Button>

            <Button variant="outline" onClick={handleBackStep} className="w-full">

              戻って修正する

            </Button>

          </CardFooter>

        </Card>

      </div>

    );

  }

  // プレイ画面

  return (

    <div className="w-full max-w-2xl mx-auto space-y-6">

      {/* 進捗バー */}

      <div className="w-full px-1">

        <Progress value={progress} className="h-2" />

        <div className="flex justify-between text-xs text-slate-400 mt-2 font-mono">

          <span>Q{currentIndex + 1}</span>

          <span>{assessment.questions.length} Questions</span>

        </div>

      </div>

      <Card className="w-full shadow-md border-0 sm:border animate-in fade-in slide-in-from-right-4 duration-300">

        <CardHeader className="text-center pb-2">

          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit mx-auto mb-4">

            Q{currentIndex + 1}

          </span>

          <CardTitle className="text-xl sm:text-2xl leading-relaxed">

            {currentQuestion.text}

          </CardTitle>

          <CardDescription className="pt-4 text-slate-400 text-xs">

            Question {currentIndex + 1} of {assessment.questions.length}

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

          <Button variant="ghost" size="sm" onClick={handleBackStep} className="text-slate-400 hover:text-slate-600">

            <ChevronLeft className="w-4 h-4 mr-1" /> 前に戻る

          </Button>

        </CardFooter>

      </Card>

      <div className="text-center text-xs text-slate-400 max-w-md mx-auto px-4">

        出典・根拠: {assessment.academicSource}

      </div>

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

