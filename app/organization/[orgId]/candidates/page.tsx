"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabaseClient";

import Link from "next/link";

import { 

  Plus, Link as LinkIcon, Copy, Check, AlertTriangle, CheckCircle, Trash2, 

  Users, ExternalLink, RefreshCw, Calculator // Calculatorアイコン追加

} from "lucide-react";

// ドメイン定数

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "";

// HEXACO結果データの型定義
interface HexacoResultData {
  _meta?: {
    variant?: string;
    question_count?: number;
    submitted_at?: string;
  };
  [key: string]: string | number | boolean | { [key: string]: any } | any[] | undefined;
}

export default function CandidatesPage({ params }: { params: { orgId: string } }) {

  const { orgId } = params;

  const [campaigns, setCampaigns] = useState<any[]>([]);

  const [candidates, setCandidates] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  // データ取得

  const fetchData = async () => {

    try {

      // 1. キャンペーン取得

      const { data: camps } = await supabase

        .from("recruitment_campaigns")

        .select("*")

        .eq("organization_id", orgId)

        .order("created_at", { ascending: false });

      if (camps) setCampaigns(camps);

      // 2. 候補者取得

      const { data: cands, error: candError } = await supabase

        .from("candidate_profiles")

        .select(`

          *,

          profiles (

            id,

            email,

            share_links ( id, is_active )

          )

        `)

        .eq("organization_id", orgId)

        .order("created_at", { ascending: false });

      if (candError) throw candError;

      if (cands) {

        // 3. アセスメント結果を別途取得

        const userIds = cands.map((c: any) => c.user_id);

        

        const { data: assessments } = await supabase

          .from("assessment_results")

          .select("user_id, test_type, result_data")

          .eq("test_type", "hexaco")

          .in("user_id", userIds);

        // 4. マージして整形 & スコア計算

        const formatted = cands.map((c: any) => {

          const hexaco = assessments?.find((a: any) => a.user_id === c.user_id);

          

          let isLite = false;

          let hScore = null; // スコア用変数

          if (hexaco?.result_data) {
            // 型安全なアクセスのために型アサーション
            const resultData = hexaco.result_data as unknown as HexacoResultData;

            // Lite/Full判定

            if (resultData._meta?.variant === 'lite') {

              isLite = true;

            } else {

              const count = Object.keys(resultData).filter(k => !k.startsWith('_')).length;

              isLite = count > 0 && count < 40;

            }

            // ※ポートフォリオ用: 実際のスコアリングロジックはバックエンドで処理されます
            // スコア計算とリスク判定はサーバーサイドAPIで実行
            
            // ダミーのスコア表示用
            hScore = resultData.h_calculated || null;

          }
          
          // リスク判定はバックエンドで処理されたものを使用
          let riskLevel = c.h_factor_risk_level;

          return { ...c, isLite, hScore, h_factor_risk_level: riskLevel }; // 上書きした値を返す

        });

        setCandidates(formatted);

      }

    } catch (e) {

      console.error("Data Fetch Error:", e);

      alert("データの取得中にエラーが発生しました。");

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchData();

  }, [orgId]);

  // フィルタリングロジック

  const filteredCandidates = selectedCampaignId

    ? candidates.filter(c => c.campaign_id === selectedCampaignId)

    : candidates;

  // キャンペーン作成

  const createCampaign = async () => {

    const name = prompt("募集タイトルを入力してください");

    if (!name) return;

    const { error } = await supabase.from("recruitment_campaigns").insert({

      organization_id: orgId,

      name: name,

    });

    if (error) {

      alert("エラーが発生しました: " + error.message);

    } else {

      fetchData();

    }

  };

  const copyLink = (token: string) => {

    const url = `${BASE_URL}/invite/${token}`;

    navigator.clipboard.writeText(url);

    setCopiedId(token);

    setTimeout(() => setCopiedId(null), 2000);

  };

  const copyReTestLink = (campaignId: string) => {

    const camp = campaigns.find(c => c.id === campaignId);

    if (!camp) return;

    const url = `${BASE_URL}/invite/${camp.public_link_token}?mode=full`;

    navigator.clipboard.writeText(url);

    alert("再テスト(Full版)用のURLをコピーしました。\n候補者にこのURLを送付してください。");

  };

  const deleteCampaign = async (id: string, e: React.MouseEvent) => {

    e.stopPropagation();

    if (!confirm("本当にこのキャンペーンを削除しますか？")) return;

    

    const { error } = await supabase.from("recruitment_campaigns").delete().eq("id", id);

    if (error) alert("削除エラー: " + error.message);

    else fetchData();

  };

  const deleteCandidate = async (candidateId: string) => {

    if (!confirm("リストから削除しますか？")) return;

    const { error } = await supabase.from("candidate_profiles").delete().eq("id", candidateId);

    if (error) alert("削除エラー: " + error.message);

    else fetchData();

  };

  if (loading) return <div className="p-8 text-slate-500">読み込み中...</div>;

  return (

    <div className="space-y-8">

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-2xl font-bold text-slate-900">Selection DX (採用・選抜)</h1>

          <p className="text-slate-500">HEXACO H因子によるリスクスクリーニングと候補者管理</p>

        </div>

        <button 

          onClick={createCampaign} 

          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 font-bold transition-all shadow-sm"

        >

          <Plus className="w-4 h-4" /> 公開リンクを作成

        </button>

      </div>

      <div>

        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">

          Active Campaigns <span className="text-xs font-normal text-slate-400 ml-2">(クリックで絞り込み)</span>

        </h3>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

          <div 

            onClick={() => setSelectedCampaignId(null)}

            className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-center items-center gap-2 min-h-[120px] ${

              selectedCampaignId === null

                ? "bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500"

                : "bg-white border-slate-200 hover:border-indigo-300 border-dashed"

            }`}

          >

            <div className={`p-2 rounded-full ${selectedCampaignId === null ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"}`}>

              <Users className="w-6 h-6" />

            </div>

            <span className={`font-bold ${selectedCampaignId === null ? "text-indigo-900" : "text-slate-500"}`}>All Candidates</span>

          </div>

          {campaigns.map((camp) => (

            <div 

              key={camp.id} 

              onClick={() => setSelectedCampaignId(selectedCampaignId === camp.id ? null : camp.id)}

              className={`p-5 rounded-xl border shadow-sm transition-all cursor-pointer group relative ${

                selectedCampaignId === camp.id

                  ? "bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500"

                  : "bg-white border-slate-200 hover:border-indigo-300"

              }`}

            >

              <div className="flex justify-between items-start mb-3">

                <h3 className="font-bold text-slate-900 truncate pr-2">{camp.name}</h3>

                <div className="flex gap-2 items-center">

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${camp.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>

                    {camp.is_active ? "ACTIVE" : "CLOSED"}

                  </span>

                  <button 

                    onClick={(e) => deleteCampaign(camp.id, e)}

                    className="text-slate-400 hover:text-red-500 transition-colors p-1"

                  >

                    <Trash2 className="w-4 h-4" />

                  </button>

                </div>

              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-100">

                <LinkIcon className="w-3 h-3 text-slate-400 flex-shrink-0" />

                <code className="text-xs text-slate-600 truncate flex-1 font-mono">

                  .../invite/{camp.public_link_token}

                </code>

                <button 

                  onClick={(e) => {

                    e.stopPropagation();

                    copyLink(camp.public_link_token);

                  }}

                  className="p-1.5 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-all text-slate-500"

                >

                  {copiedId === camp.public_link_token ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}

                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        <table className="w-full text-sm text-left">

          <thead className="bg-slate-50 text-slate-500 font-medium">

            <tr>

              <th className="px-6 py-3 whitespace-nowrap">候補者 (Email)</th>

              <th className="px-6 py-3 whitespace-nowrap">応募日</th>

              <th className="px-6 py-3 whitespace-nowrap">ステータス</th>

              <th className="px-6 py-3 whitespace-nowrap">H因子リスク (Score)</th>

              <th className="px-6 py-3 whitespace-nowrap">アクション</th>

            </tr>

          </thead>

          <tbody className="divide-y divide-slate-100">

            {filteredCandidates.length === 0 && (

              <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">

                {selectedCampaignId ? "このキャンペーンの応募者はまだいません" : "まだ候補者がいません"}

              </td></tr>

            )}

            {filteredCandidates.map((candidate) => {

              const shareId = candidate.profiles?.share_links?.id || candidate.profiles?.share_links?.[0]?.id;

              const linkHref = shareId ? `/share/${shareId}` : "#";

              const isLinkDisabled = !shareId;

              return (

                <tr key={candidate.id} className="hover:bg-slate-50 transition-colors">

                  <td className="px-6 py-4 font-medium text-slate-900">

                    <div>{candidate.profiles?.email || "Unknown User"}</div>

                    <div className="mt-1">

                      {candidate.isLite ? (

                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">Lite版 (簡易)</span>

                      ) : (

                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">Full版 (精密)</span>

                      )}

                    </div>

                  </td>

                  <td className="px-6 py-4 text-slate-500">

                    {new Date(candidate.created_at).toLocaleDateString()}

                  </td>

                  <td className="px-6 py-4">

                    <span className="capitalize px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">

                      {candidate.hiring_status}

                    </span>

                  </td>

                  <td className="px-6 py-4">

                    <div className="flex flex-col gap-1">

                       <div className="flex items-center gap-2">

                         {candidate.h_factor_risk_level === 'high' ? (

                           <span className="inline-flex items-center gap-1.5 text-red-700 font-bold bg-red-50 px-3 py-1 rounded-full border border-red-100 text-xs">

                             <AlertTriangle className="w-3 h-3" /> High Risk

                           </span>

                         ) : candidate.h_factor_risk_level === 'medium' ? (

                           <span className="inline-flex items-center gap-1.5 text-orange-700 font-bold bg-orange-50 px-3 py-1 rounded-full border border-orange-100 text-xs">

                             <AlertTriangle className="w-3 h-3" /> Medium

                           </span>

                         ) : (

                           <span className="inline-flex items-center gap-1.5 text-green-700 font-bold bg-green-50 px-3 py-1 rounded-full border border-green-100 text-xs">

                             <CheckCircle className="w-3 h-3" /> Safe

                           </span>

                         )}

                         

                         {/* スコア表示 */}

                         {candidate.hScore && (

                           <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200" title="H因子平均スコア">

                             {candidate.hScore}

                           </span>

                         )}

                       </div>

                       {/* Lite版なら表示 */}
                       {candidate.isLite && (

                         <button

                           onClick={() => copyReTestLink(candidate.campaign_id)}

                           className="text-[10px] text-indigo-600 underline flex items-center gap-1 hover:text-indigo-800 w-fit mt-1"

                         >

                           <RefreshCw className="w-3 h-3" /> 再テストURL

                         </button>

                       )}

                    </div>

                  </td>

                  <td className="px-6 py-4 flex items-center gap-3">

                    <Link 

                      href={linkHref}

                      target="_blank"

                      className={`text-indigo-600 hover:text-indigo-900 font-medium flex items-center gap-1 hover:underline text-xs ${isLinkDisabled && "opacity-50 pointer-events-none"}`}

                    >

                      詳細 <ExternalLink className="w-3 h-3" />

                    </Link>

                    <button

                      onClick={() => deleteCandidate(candidate.id)}

                      className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"

                    >

                      <Trash2 className="w-4 h-4" />

                    </button>

                  </td>

                </tr>

              );

            })}

          </tbody>

        </table>

      </div>

    </div>

  );

}
