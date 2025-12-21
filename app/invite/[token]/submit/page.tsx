"use client";

import { useEffect, useState, useRef } from "react";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabaseClient"; // 共通クライアントに変更（ループ回避）

import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function SubmitPage({ params }: { params: { token: string } }) {

  const { token } = params;

  const router = useRouter();

  const [status, setStatus] = useState("データを保存しています...");

  const [isError, setIsError] = useState(false);

   

  // 2回実行されるのを防ぐためのロック

  const isRunning = useRef(false);

  useEffect(() => {

    // すでに実行中なら何もしない（二重登録防止）

    if (isRunning.current) return;

    const saveData = async () => {

      // 実行フラグをON

      isRunning.current = true;

      // 1. ログイン確認

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {

        router.push(`/auth/signup?redirect=/invite/${token}/submit`);

        return;

      }

      // 2. ブラウザのデータを取得

      const savedData = localStorage.getItem(`kage_invite_${token}`);

      if (!savedData) {

        setStatus("エラー: テストデータが見つかりません。");

        setIsError(true);

        return;

      }

      const answersMap = JSON.parse(savedData);

      try {

        // 3. キャンペーン情報を取得

        const { data: campaign, error: campError } = await supabase

          .from("recruitment_campaigns")

          .select("id, organization_id")

          .eq("public_link_token", token)

          .single();

        if (campError || !campaign) throw new Error("キャンペーンが無効です");

        // 4. DBに保存 (Assessment Results)

        // Lite/Full判定ロジックを追加

        const resultsToInsert = Object.keys(answersMap).map(testId => {

          let resultData = answersMap[testId];

          // HEXACOの場合、質問数をカウントしてメタデータを付与

          if (testId === 'hexaco') {

            // '_'で始まらないキー（質問回答）をすべて数える

            const qCount = Object.keys(resultData).filter(k => !k.startsWith('_')).length;

            resultData = {

              ...resultData,

              _meta: {

                variant: qCount < 40 ? 'lite' : 'full',

                question_count: qCount,

                submitted_at: new Date().toISOString()

              }

            };

          }

          return {

            user_id: user.id,

            test_type: testId,

            status: "completed",

            result_data: resultData,

            completed_at: new Date().toISOString(),

          };

        });

        const { error: resError } = await supabase

          .from("assessment_results")

          .insert(resultsToInsert); // 配列で一括追加（onConflictなし）

        if (resError) throw resError;

        // H因子リスク計算ロジック

        let riskLevel = "medium";

        const hexacoData = answersMap["hexaco"];

        if (hexacoData) {

           const hScores = Object.keys(hexacoData)

             .filter(key => key.startsWith("h")) // H因子の質問だけ抽出

             .map(key => hexacoData[key]);

           

           if (hScores.length > 0) {

             const total = hScores.reduce((a: any, b: any) => a + b, 0);

             const avg = total / hScores.length;

             if (avg <= 2.5) riskLevel = "high";

             else if (avg >= 3.6) riskLevel = "low";

             else riskLevel = "medium";

           }

        }

        // 5. 候補者リストに追加 (Candidate Profiles)

        // upsertを使用

        const { error: candError } = await supabase.from("candidate_profiles").upsert({

          organization_id: campaign.organization_id,

          user_id: user.id,

          campaign_id: campaign.id,

          hiring_status: "screening",

          h_factor_risk_level: riskLevel, // 計算したリスク値をセット

        }, { onConflict: "organization_id, user_id" });

        if (candError) throw candError;

        // 6. 完了！データを消してダッシュボードへ

        localStorage.removeItem(`kage_invite_${token}`);

        setStatus("完了しました！ダッシュボードへ移動します...");

        setTimeout(() => router.push("/dashboard"), 1500);

      } catch (e: any) {

        console.error("Save Error:", e);

        // エラー時はロック解除しない（リロードを促すため）

        setIsError(true);

        setStatus("保存中にエラーが発生しました: " + e.message);

      }

    };

    saveData();

  }, [token, router]);

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-50">

      <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center gap-4 max-w-md text-center">

        {isError ? (

          <AlertCircle className="w-12 h-12 text-red-500" />

        ) : status.includes("完了") ? (

          <CheckCircle2 className="w-12 h-12 text-green-500" />

        ) : (

          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />

        )}

         

        <p className={`font-bold ${isError ? "text-red-600" : "text-slate-700"}`}>

          {status}

        </p>

         

        {isError && (

          <button 

            onClick={() => window.location.reload()}

            className="text-sm text-indigo-600 underline"

          >

            再試行する

          </button>

        )}

      </div>

    </div>

  );

}
