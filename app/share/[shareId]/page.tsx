"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, Share2, CheckCircle2, AlertTriangle, Sparkles, Brain, MessageSquare, Zap, Palette, Box, Info, ExternalLink, BookOpen, Scale, Activity, Waves, UserPlus, Building2, Loader2 } from "lucide-react";

// --- 定数: 科学的根拠と外部リンク (エビデンスレベルの高い決定版ソース) ---
const SCIENCE_REFS = [
  { 
    id: "hexaco", 
    name: "HEXACO性格特性モデル", 
    researcher: "Thielmann et al. (2020)", 
    // 数百の研究を統合した決定版レビュー論文
    url: "https://journals.sagepub.com/doi/10.1177/1745691619895036" 
  },
  { 
    id: "kai", 
    name: "適応・革新理論 (KAI)", 
    researcher: "KAI Centre / Kirton (1976)", 
    // ライセンス管理元の公式リソース
    url: "https://kaicentre.com/" 
  },
  { 
    id: "osivq", 
    name: "OSIVQ認知スタイルモデル", 
    researcher: "Blazhenkova & Kozhevnikov (2009)", 
    // 3因子モデルを確立した原著論文
    url: "https://onlinelibrary.wiley.com/doi/abs/10.1002/acp.1473" 
  },
  { 
    id: "asrs", 
    name: "成人期ADHD自己記入式 (ASRS-v1.1)", 
    researcher: "Harvard Medical School / WHO", 
    // 世界的権威による公式リソース
    url: "https://www.hcp.med.harvard.edu/ncs/asrs.php" 
  },
  { 
    id: "aq", 
    name: "自閉症スペクトラム指数 (AQ)", 
    researcher: "Ruzich et al. (2015)", 
    // 臨床群と非臨床群の差を示したオープンアクセス・レビュー論文
    url: "https://molecularautism.biomedcentral.com/articles/10.1186/2040-2392-6-2" 
  },
  { 
    id: "sensory", 
    name: "感覚処理感受性 (HSP/SPS)", 
    researcher: "Lionetti et al. (2018)", 
    // 3因子構造を確立したオープンアクセス・メタ分析論文
    url: "https://doi.org/10.1038/s41398-017-0090-6" 
  },
];

// --- 定数: テスト名の定義 (日本語変換マップ) ---
const TEST_NAMES: Record<string, string> = {
  hexaco: "性格特性 (HEXACOモデル)",
  kai: "問題解決スタイル (適応・革新理論)",
  osivq: "認知スタイル (OSIVQモデル)",
  asrs: "注意・集中スタイル (ASRS準拠)",
  aq: "コミュニケーション特性 (AQ準拠)",
  sensory: "感覚・感受性 (SPSモデル)",
};

// --- 1. グラフ描画コンポーネント ---
function PolygonRadarChart({ data, size = 300, colorClass, maxVal = 5 }: { data: { label: string; value: number }[]; size?: number; colorClass: string; maxVal?: number }) {
  const center = size / 2;
  const radius = (size / 2) - 40;
  const angleStep = (Math.PI * 2) / data.length;

  const getPoint = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (Math.min(value, maxVal) / maxVal) * radius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const dataPath = data.map((d, i) => {
    const p = getPoint(i, d.value);
    return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
  }).join(" ") + " Z";

  const getColor = (cls: string) => {
    if (cls.includes("emerald")) return "#10b981";
    if (cls.includes("rose")) return "#e11d48";
    if (cls.includes("orange")) return "#f97316";
    if (cls.includes("cyan")) return "#06b6d4";
    if (cls.includes("blue")) return "#3b82f6";
    if (cls.includes("purple")) return "#a855f7";
    return "#475569"; 
  };

  const strokeColor = getColor(colorClass);

  return (
    <div className="relative flex justify-center items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="overflow-visible">
        {/* 背景のクモの巣 */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((scale, idx) => (
           <path key={idx} d={data.map((_, i) => { const p = getPoint(i, scale * maxVal); return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`; }).join(" ") + " Z"} fill={idx === 4 ? "#f8fafc" : "none"} stroke="#e2e8f0" strokeWidth="1" />
        ))}
        {/* 中心からの放射線 */}
        {data.map((_, i) => { const p = getPoint(i, maxVal); return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#e2e8f0" strokeWidth="1" />; })}
        
        {/* データ領域の描画 */}
        <path d={dataPath} fill={strokeColor} fillOpacity="0.2" stroke={strokeColor} strokeWidth="2.5" strokeLinejoin="round" />
        
        {/* データポイントの丸ポチ */}
        {data.map((d, i) => { const p = getPoint(i, d.value); return <circle key={i} cx={p.x} cy={p.y} r="4" fill={strokeColor} stroke="white" strokeWidth="2" />; })}
        
        {/* ラベルと数値を表示 */}
        {data.map((d, i) => {
          // ラベル位置（グラフの少し外側）
          const p = getPoint(i, maxVal * 1.25);
          return (
            <g key={i}>
              {/* 項目名 (例: 革新力) */}
              <text x={p.x} y={p.y - 7} textAnchor="middle" dominantBaseline="middle" className="text-[10px] sm:text-xs font-bold fill-slate-600 uppercase tracking-wider">
                {d.label}
              </text>
              {/* 数値表示 (例: 3.5) */}
              <text x={p.x} y={p.y + 7} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'monospace', fill: strokeColor }}>
                {d.value.toFixed(1)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// 2. OSIVQ用 3要素バーチャート
function CognitiveChart({ object, spatial, verbal }: { object: number, spatial: number, verbal: number }) {
  const total = (object + spatial + verbal) || 3;
  const oPer = Math.round((object / total) * 100);
  const sPer = Math.round((spatial / total) * 100);
  const vPer = Math.round((verbal / total) * 100);

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-700 px-1">
        <span className="flex items-center gap-1 text-pink-600"><Palette className="w-4 h-4" /> 物体</span>
        <span className="flex items-center gap-1 text-blue-600"><Box className="w-4 h-4" /> 空間</span>
        <span className="flex items-center gap-1 text-emerald-600">言語 <MessageSquare className="w-4 h-4" /></span>
      </div>
      <div className="h-8 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
        <div className="h-full bg-pink-500 flex items-center justify-center text-[10px] text-white font-bold" style={{ width: `${oPer}%` }}>{oPer > 10 && `${oPer}%`}</div>
        <div className="h-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold" style={{ width: `${sPer}%` }}>{sPer > 10 && `${sPer}%`}</div>
        <div className="h-full bg-emerald-500 flex items-center justify-center text-[10px] text-white font-bold" style={{ width: `${vPer}%` }}>{vPer > 10 && `${vPer}%`}</div>
      </div>
      <p className="text-xs text-slate-500 text-center mt-2">
        {object >= spatial && object >= verbal && "色彩や質感などの「鮮明なイメージ」で思考する芸術家タイプ。"}
        {spatial > object && spatial >= verbal && "位置関係や構造などの「空間的図式」で思考するエンジニアタイプ。"}
        {verbal > object && verbal > spatial && "言葉や論理による「言語的記述」で思考するアナリストタイプ。"}
      </p>
    </div>
  );
}

// 3. KAI用 スライダーチャート（適応 vs 革新）
function KaiChart({ adaption, innovation }: { adaption: number, innovation: number }) {
  const total = adaption + innovation || 2;
  const percent = (innovation / total) * 100; // 革新性の割合（右寄り）

  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-700 px-1">
        <span className="text-amber-600">適応型 (規律・改善)</span>
        <span className="text-purple-600">革新型 (破壊・創造)</span>
      </div>
      <div className="relative h-6 w-full bg-slate-200 rounded-full shadow-inner">
        {/* マーカー */}
        <div 
          className="absolute top-0 bottom-0 w-6 h-6 bg-white border-4 border-slate-700 rounded-full shadow-md transition-all duration-1000"
          style={{ left: `calc(${percent}% - 12px)` }}
        ></div>
      </div>
      <p className="text-xs text-slate-500 text-center mt-2">
        {percent < 40 ? "既存のルールや枠組みの中で、着実な改善を行うことを好みます。" :
         percent > 60 ? "既存の枠組みを壊し、全く新しい方法で解決することを好みます。" :
         "状況に応じて、規律と革新のバランスを取ることができます。"}
      </p>
    </div>
  );
}

// 4. 汎用バーチャート (ASRS, AQ, Sensory用)
function SimpleBarChart({ label, value, max = 5, color = "bg-slate-500" }: { label: string, value: number, max?: number, color?: string }) {
  const percent = (value / max) * 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-600 font-medium">{label}</span>
        <span className="font-bold text-slate-900">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}

// 数字表示用の行コンポーネント
function ScoreRow({ label, score, max = 5 }: { label: string, score: number, max?: number }) {
  return (
    <div className="flex items-center justify-between text-xs sm:text-sm py-1 border-b border-slate-100 last:border-0">
      <span className="text-slate-600 font-medium">{label}</span>
      <span className="font-mono font-bold text-slate-700">
        {score.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">/ {max}</span>
      </span>
    </div>
  );
}

function getArchetype(scores: Record<string, number>, integratedData: {label: string, value: number}[]) {
  const sorted = [...integratedData].sort((a, b) => b.value - a.value);
  const topTrait = sorted[0]?.label;

  if (topTrait === "革新力") return { title: "創造的イノベーター", color: "text-purple-600", bg: "bg-purple-50", desc: "常識に囚われず、新しい可能性と美的価値を探求する開拓者。", borderColor: "border-purple-100" };
  if (topTrait === "実行力") return { title: "完遂する実務家", color: "text-blue-600", bg: "bg-blue-50", desc: "高い規律と計画性で、確実に成果を積み上げるプロフェッショナル。", borderColor: "border-blue-100" };
  if (topTrait === "対話力") return { title: "情熱的リーダー", color: "text-orange-600", bg: "bg-orange-50", desc: "周囲を巻き込み、エネルギーを持って前進させる牽引者。", borderColor: "border-orange-100" };
  if (topTrait === "共感力") return { title: "調和の守護者", color: "text-emerald-600", bg: "bg-emerald-50", desc: "公正さと誠実さを武器に、組織の信頼と心理的安全性を築く。", borderColor: "border-emerald-100" };
  if (topTrait === "論理力") return { title: "論理的ストラテジスト", color: "text-cyan-600", bg: "bg-cyan-50", desc: "感情に流されず、データと論理に基づいて最適解を導き出す。", borderColor: "border-cyan-100" };
  if (topTrait === "安定性") return { title: "不動のバランサー", color: "text-rose-600", bg: "bg-rose-50", desc: "プレッシャーの中でも冷静さを保ち、組織の安定に貢献する。", borderColor: "border-rose-100" };
  
  return { title: "多才なジェネラリスト", color: "text-slate-600", bg: "bg-slate-100", desc: "特定の枠に収まらない、柔軟な適応力を持つ人物。", borderColor: "border-slate-200" };
}

// 面接官用シークレットパネル (Medium対応・Full版優先ロジック)
function InterviewerPanel({ candidateId, orgId, hScore, isFullVersion }: { candidateId: string, orgId: string, hScore: number, isFullVersion: boolean }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, { score: number, note: string }>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchQ = async () => {
      // 1. 質問を取得
      const { data: qs } = await supabase.from('interview_questions').select('*');
      if (qs) setQuestions(qs);
      
      // 2. 過去の回答を取得（保存済みなら表示）
      const { data: logs } = await supabase.from('interview_results')
        .select('*')
        .eq('candidate_id', candidateId)
        .eq('organization_id', orgId);
        
      if (logs) {
        const loaded: any = {};
        logs.forEach((l: any) => {
          loaded[l.question_id] = { score: l.score, note: l.notes };
        });
        setAnswers(loaded);
      }
    };
    fetchQ();
  }, [candidateId, orgId]);

  const handleSave = async (qid: string) => {
    const ans = answers[qid];
    if (!ans) return;
    setSaving(true);
    
    // UPSERT (UNIQUE制約を利用して上書き)
    const { error } = await supabase.from('interview_results').upsert({
      organization_id: orgId,
      candidate_id: candidateId,
      question_id: qid,
      score: ans.score,
      notes: ans.note
    }, { onConflict: 'organization_id, candidate_id, question_id' });
    
    if (error) {
      alert('エラー: ' + error.message);
    } else {
      alert('保存しました（デジタル・ハンドシェイク完了）');
    }
    setSaving(false);
  };

  // ※ポートフォリオ用: リスク判定ロジックはバックエンドで処理
  // 実際の閾値はビジネスロジックとして非公開
  if (hScore > 3.0) return null; // ダミー値

  const isHighRisk = hScore < 3.0; // ダミー判定
  
  // デザインの出し分け（Tailwindの動的クラス名問題を回避するため、完全なクラス名を定義）
  const theme = isHighRisk ? {
    bg: "bg-red-50",
    border: "border-red-500",
    text: "text-red-800",
    cardBorder: "border-red-200",
    buttonBg: "bg-red-100",
    buttonBorder: "border-red-300",
    buttonHover: "hover:bg-red-200",
    title: "⚠ 警告: High Risk (毒性懸念)",
    desc: "スコアが極めて低いです。採用は慎重に検討し、必ず以下の面接でリスクを確認してください。"
  } : {
    bg: "bg-amber-50",
    border: "border-amber-400",
    text: "text-amber-800",
    cardBorder: "border-amber-200",
    buttonBg: "bg-amber-100",
    buttonBorder: "border-amber-300",
    buttonHover: "hover:bg-amber-200",
    title: "⚠ 注意: Medium Risk (要確認)",
    desc: "スコアが平均を下回っています(グレーゾーン)。猫を被っている可能性があるため、構造化面接で本性を確認してください。"
  };

  return (
    <div className={`mt-12 border-t-4 ${theme.border} ${theme.bg} p-6 rounded-xl animate-in slide-in-from-bottom-10 print:hidden`}>
      <div className={`flex items-center gap-2 mb-4 ${theme.text} font-bold text-lg`}>
        <AlertTriangle className="w-6 h-6" />
        <span>【採用担当者のみ表示】 {theme.title}</span>
      </div>
      
      <div className={`text-sm ${theme.text} mb-6`}>
        <p className="font-bold mb-1">{theme.desc}</p>
        <p className="opacity-80 text-xs">
           H因子スコア: {hScore.toFixed(1)} 
           {!isFullVersion && <span className="ml-2 font-bold">(※Lite版データのため、精度が低い可能性があります。Full版の受検を推奨します)</span>}
        </p>
      </div>

      <div className="space-y-6">
        {questions.map(q => {
          const ans = answers[q.id] || { score: 0, note: '' };
          return (
            <Card key={q.id} className={`${theme.cardBorder} shadow-sm`}>
              <CardHeader className="bg-white pb-2 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-800">{q.question_text}</CardTitle>
                <p className="text-xs text-slate-400 mt-1">ターゲット特性: {q.target_trait}</p>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* BARs 選択肢 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { val: 1, label: "危険 (1点)", desc: q.bars_1, color: `${theme.buttonBg} ${theme.buttonBorder} ${theme.buttonHover}` },
                    { val: 3, label: "普通 (3点)", desc: q.bars_3, color: "bg-slate-100 border-slate-300 hover:bg-slate-200" },
                    { val: 5, label: "優秀 (5点)", desc: q.bars_5, color: "bg-blue-100 border-blue-300 hover:bg-blue-200" }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => setAnswers({ ...answers, [q.id]: { ...ans, score: opt.val } })}
                      className={`p-3 rounded-lg border text-left transition-all ${opt.color} ${ans.score === opt.val ? 'ring-2 ring-offset-1 ring-slate-500 shadow-md scale-[1.02]' : 'opacity-60 hover:opacity-100'}`}
                    >
                      <div className="font-bold text-sm mb-1">{opt.label}</div>
                      <div className="text-xs leading-tight">{opt.desc}</div>
                    </button>
                  ))}
                </div>

                {/* メモと保存 */}
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="回答の要約や気になった発言をメモ..." 
                    className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm"
                    value={ans.note}
                    onChange={(e) => setAnswers({ ...answers, [q.id]: { ...ans, note: e.target.value } })}
                  />
                  <Button onClick={() => handleSave(q.id)} disabled={saving} size="sm" className="bg-slate-800 text-white shrink-0">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span className="ml-1 hidden sm:inline">保存</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// --- メインページ ---
export default function SharePage({ params }: { params: { shareId: string } }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);

  // 法人側の閲覧ステータス
  const [viewerOrgId, setViewerOrgId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isImported, setIsImported] = useState(false);
  
  // キャンペーン選択用
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. シェアデータの取得
        const { data: shareData } = await supabase.from("share_links").select("user_id, is_active").eq("id", params.shareId).single();
        if (!shareData || !shareData.is_active) { setError("ページが見つかりません"); setLoading(false); return; }
        
        const candidateUserId = shareData.user_id;
        const { data: userData } = await supabase.from("profiles").select("*").eq("id", candidateUserId).single();
        setProfile(userData);
        const { data: resultData } = await supabase.from("assessment_results").select("*").eq("user_id", candidateUserId);
        setResults(resultData || []);

        // 2. 閲覧者（自分）が法人かどうかチェック
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // 法人メンバーか確認
          const { data: member } = await supabase
            .from("organization_members")
            .select("organization_id")
            .eq("user_id", session.user.id)
            .limit(1)
            .maybeSingle();
          
          if (member) {
            setViewerOrgId(member.organization_id);
            
            // アクティブなキャンペーン一覧を取得
            const { data: activeCampaigns } = await supabase
              .from("recruitment_campaigns")
              .select("id, name")
              .eq("organization_id", member.organization_id)
              .eq("is_active", true)
              .order("created_at", { ascending: false });
            
            if (activeCampaigns) setCampaigns(activeCampaigns);
            
            // 既に追加済みかチェック
            const { data: existing } = await supabase
              .from("candidate_profiles")
              .select("id")
              .eq("organization_id", member.organization_id)
              .eq("user_id", candidateUserId)
              .maybeSingle();
            if (existing) setIsImported(true);
          }
        }

        setLoading(false);
      } catch (e) { setError("読み込みエラー"); setLoading(false); }
    };
    fetchData();
  }, [params.shareId]);

  // スコア計算機能付きインポート
  const handleImport = async (campaignId: string | null) => {
    if (!viewerOrgId || !profile) return;
    setIsImporting(true);
    try {
      // 1. まず、この候補者の HEXACO テスト結果を取得する
      const { data: results } = await supabase
        .from("assessment_results")
        .select("result_data")
        .eq("user_id", profile.id)
        .eq("test_type", "hexaco") // H因子が含まれるテスト
        .order("completed_at", { ascending: false })
        .limit(1)
        .single();

      // 2. リスクレベルを計算する (H因子の平均スコアに基づく)
      let riskLevel = "medium"; // デフォルト
      
      if (results && results.result_data) {
        const data = results.result_data;
        
        // "h"で始まる全てのキーを取得して計算する
        // これにより、Short版ならh1-h2、Full版ならh1-h16全てが計算対象になる
        const hKeys = Object.keys(data).filter(k => k.startsWith("h") && !isNaN(Number((data as any)[k])));
        
        let totalScore = 0;
        let count = 0;
        
        hKeys.forEach(key => {
          const score = Number((data as any)[key]);
          if (!isNaN(score)) {
            totalScore += score;
            count++;
          }
        });
        
        if (count > 0) {
          const avg = totalScore / count;
          // ※ポートフォリオ用: 実際の判定ロジックは非公開
          // リスク判定はバックエンドで処理されます
          if (avg < 3.0) {
            riskLevel = "high";
          } else {
            riskLevel = "low";
          }
        }
      }

      // 3. 計算したリスクレベルで登録する
      const { error } = await supabase.from("candidate_profiles").insert({
        organization_id: viewerOrgId,
        user_id: profile.id, 
        hiring_status: "screening",
        campaign_id: campaignId,
        // 計算結果を入れる
        h_factor_risk_level: riskLevel 
      });

      if (error) {
        if (error.code === '23505') {
           setIsImported(true);
           alert("既にリストに追加済みです。");
        } else {
           throw error;
        }
      } else {
        setIsImported(true);
        setIsModalOpen(false);
        alert(`候補者を追加しました！\n(判定結果: ${riskLevel.toUpperCase()})`);
      }
    } catch (e: any) {
      alert("エラーが発生しました: " + e.message);
      console.error(e);
    } finally {
      setIsImporting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">読み込み中...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">{error}</div>;

  const userName = profile?.full_name || profile?.email?.split("@")[0] || "ユーザー";

  const getScore = (type: string, key: string) => {
    const r = results.find(r => r.test_type === type);
    return r?.result_data?.[key] || 0;
  };

  // ※ポートフォリオ用: 実際のスコアリングロジックはバックエンドで処理されます
  // UIコンポーネントの構造のみを示すため、計算式は簡略化しています
  
  const calculateAverageScore = (resultData: Record<string, number> | undefined, prefix: string): number => {
    // 実際の計算ロジックはサーバーサイドAPIで処理
    // ここではダミーデータを返す
    return resultData?.[`${prefix}_calculated`] || 0;
  };

  const calculateSumOrAvg = (resultData: Record<string, number> | undefined, ids: string[], mode: 'sum' | 'avg' = 'sum'): number => {
    // 実際の計算ロジックはサーバーサイドAPIで処理
    return 0;
  };

  // HEXACOデータ取得ロジック (Full優先・Lite無視)
  // 1. まずFull版(test_type="hexaco_full")を探す
  let targetHexaco = results.find(r => r.test_type === "hexaco_full");
  let isFullVersion = true;

  // 2. Fullがない場合のみ、Lite(test_type="hexaco")を探す
  if (!targetHexaco) {
    targetHexaco = results.find(r => r.test_type === "hexaco");
    isFullVersion = false;
  }
  
  const hexacoResult = targetHexaco?.result_data;
  const hasHexaco = !!hexacoResult; // データが存在するか

  // スコア計算 (特定されたResultデータを使用)
  const h = calculateAverageScore(hexacoResult, "h"); 
  const e = calculateAverageScore(hexacoResult, "e"); 
  const x = calculateAverageScore(hexacoResult, "x"); 
  const a = calculateAverageScore(hexacoResult, "a"); 
  const c = calculateAverageScore(hexacoResult, "c"); 
  const o = calculateAverageScore(hexacoResult, "o");

  // 総合能力データ（完全版・簡易版の両方に対応）
  const kaiResult = results.find(r => r.test_type === "kai")?.result_data;
  
  // Short版(k1-k6)とFull版(k1-k32)のID重複問題を解決
  // Short版の定義: k1-k3=Adaption, k4-k6=Innovation
  // Full版の定義: k1-k13=Innovation, k14-k32=Adaption (※ここが逆なので判定が必要)
  // 判定基準を厳密にする（30未満ならShort版として扱う）
  const isKaiShort = kaiResult && Object.keys(kaiResult).length < 30; // 項目数で判定
  
  let kaiInnovationKeys: string[] = [];
  let kaiAdaptionKeys: string[] = [];
  
  if (isKaiShort) {
    // Short版のID割り当て
    kaiAdaptionKeys = ["k1", "k2", "k3"];
    kaiInnovationKeys = ["k4", "k5", "k6"];
  } else {
    // Full版のID割り当て
    kaiInnovationKeys = Object.keys(kaiResult || {}).filter(k => {
      const num = parseInt(k.replace('k', ''));
      return !isNaN(num) && num >= 1 && num <= 13;
    });
    kaiAdaptionKeys = Object.keys(kaiResult || {}).filter(k => {
      const num = parseInt(k.replace('k', ''));
      return !isNaN(num) && num >= 14 && num <= 32;
    });
  }
  
  const kaiInnovationAvg = calculateSumOrAvg(kaiResult, kaiInnovationKeys, 'avg');
  const kaiAdaptionAvg = calculateSumOrAvg(kaiResult, kaiAdaptionKeys, 'avg');
  
  const aqResult = results.find(r => r.test_type === "aq")?.result_data;
  const aqAvg = calculateAverageScore(aqResult, "aq");
  
  const osivqResult = results.find(r => r.test_type === "osivq")?.result_data;
  const verbalAvg = calculateAverageScore(osivqResult, "v");
  
  const sensoryResult = results.find(r => r.test_type === "sensory")?.result_data;
  const hasSensory = results.some(r => r.test_type === "sensory");
  const sn6 = getScore("sensory", "sn6");
  const sn4 = getScore("sensory", "sn4");
  
  // ※ポートフォリオ用: 安定性の計算ロジックは非公開
  // 実際の計算式はバックエンドで処理されます
  let stability = 0;
  if (hasSensory && sn4 > 0) {
    stability = (e + sn4) / 2; // ダミー計算式
  } else {
    stability = e; // ダミー計算式
  }
  
  // 共感力の計算: Sensoryを受けていない場合はHEXACOだけで評価
  let empathy = 0;
  if (hasSensory && sn6 > 0) {
    // 両方あるなら平均
    empathy = (a + sn6) / 2;
  } else {
    // HEXACOしかないなら、HEXACOだけで評価
    empathy = a;
  }
  
  const integratedData = [
    { label: "革新力", value: (o + kaiInnovationAvg) / 2 || 0 },
    { label: "実行力", value: (c + kaiAdaptionAvg) / 2 || 0 },
    { label: "対話力", value: (x + aqAvg) / 2 || 0 },
    { label: "共感力", value: empathy },
    { label: "論理力", value: (verbalAvg + (5 - getScore("asrs", "as2"))) / 2 || 0 },
    { label: "安定性", value: stability },
  ];

  // 称号（Full版優先のhexacoResultを使用）
  const hexacoData = hexacoResult || {};
  const archetype = hasHexaco ? getArchetype(hexacoData, integratedData) : { title: "未測定", color: "text-slate-400", bg: "bg-slate-50", desc: "", borderColor: "border-slate-200" };

  // 3. 認知スタイル (OSIVQ 3要素)（完全版・簡易版の両方に対応）
  // Object(物体), Spatial(空間), Verbal(言語)
  const objectScore = calculateAverageScore(osivqResult, "o") * (Object.keys(osivqResult || {}).filter(k => k.startsWith("o")).length || 1);
  const spatialScore = calculateAverageScore(osivqResult, "s") * (Object.keys(osivqResult || {}).filter(k => k.startsWith("s")).length || 1);
  const verbalScore = calculateAverageScore(osivqResult, "v") * (Object.keys(osivqResult || {}).filter(k => k.startsWith("v")).length || 1);
  const hasOsivq = results.some(r => r.test_type === "osivq");

  // 4. KAI (問題解決スタイル)（完全版・簡易版の両方に対応）
  const adaptionScore = calculateSumOrAvg(kaiResult, kaiAdaptionKeys, isKaiShort ? 'sum' : 'sum');
  const innovationScore = calculateSumOrAvg(kaiResult, kaiInnovationKeys, isKaiShort ? 'sum' : 'sum');
  const hasKai = results.some(r => r.test_type === "kai");

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white font-sans pb-20">
      {/* ヘッダー */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200 px-4 sm:px-6 py-3 print:hidden flex justify-between items-center">
        {/* ロゴエリア: スマホでは "特性レポート" を隠す */}
        <span className="font-bold text-slate-800 flex items-center gap-2 truncate">
          Kage <span className="hidden sm:inline-block text-xs font-normal bg-slate-100 px-2 py-1 rounded text-slate-500">特性レポート</span>
        </span>
        
        <div className="flex items-center gap-2">
          {/* 法人向けアクションエリア */}
          {viewerOrgId && (
            <div className="flex items-center gap-2 mr-2 pr-2 sm:mr-4 sm:pl-4 sm:border-l border-slate-200">
              <span className="hidden md:inline text-xs font-bold text-slate-500">採用担当者メニュー:</span>
              {isImported ? (
                <Button disabled variant="secondary" size="sm" className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 sm:px-4">
                  <CheckCircle2 className="w-4 h-4 sm:mr-2" /> 
                  <span className="hidden sm:inline">リスト追加済み</span>
                </Button>
              ) : (
                // クリックでモーダルを開くように変更
                <Button onClick={() => setIsModalOpen(true)} size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-md px-3 sm:px-4">
                  <UserPlus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">候補者リストに追加</span>
                  <span className="inline sm:hidden">追加</span>
                </Button>
              )}
            </div>
          )}
          {/* シェア・印刷ボタン: スマホではアイコンのみ */}
          <Button variant="outline" size="sm" className="px-2 sm:px-3" onClick={() => window.open(`https://twitter.com/intent/tweet?text=My Kage Report&url=${window.location.href}`, '_blank')}>
            <Share2 className="w-4 h-4" /> <span className="hidden sm:inline ml-2">シェア</span>
          </Button>
          <Button onClick={() => window.print()} size="sm" variant="ghost" className="text-slate-600 px-2 sm:px-3">
            <Printer className="w-4 h-4" /> <span className="hidden sm:inline ml-2">印刷</span>
          </Button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto py-12 px-6 print:p-0">
        
        {/* 法人向けインフォメーションバー */}
        {viewerOrgId && !isImported && (
          <div className="mb-8 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <Building2 className="w-5 h-5 text-indigo-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-indigo-900">この候補者をスカウト候補に入れますか？</h3>
              <p className="text-xs text-indigo-700 mt-1">
                右上の「候補者リストに追加」ボタンを押すと、あなたの組織の候補者一覧に保存されます。
                ご本人のダッシュボードには通知されません。
              </p>
            </div>
          </div>
        )}

        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="inline-block mb-3">
             {profile?.diagnosed_status === "declared" ? (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                  <CheckCircle2 className="w-3 h-3" /> 医療的根拠あり (Track B)
                </span>
             ) : (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                  自己分析レポート (Track A)
                </span>
             )}
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">{userName}</h1>
          <p className="text-slate-500 text-sm">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* 1. メインビジュアル: 統合チャート & 称号 */}
        {hasHexaco && (
          <div className="mb-12 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden print:shadow-none print:border-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className={`p-10 text-center ${archetype.bg} border-b-2 ${archetype.borderColor}`}>
              <Sparkles className={`w-10 h-10 mx-auto mb-4 ${archetype.color}`} />
              <h2 className={`text-3xl font-bold ${archetype.color} mb-3`}>{archetype.title}</h2>
              <p className="text-sm sm:text-base text-slate-700 opacity-90 max-w-lg mx-auto leading-relaxed">{archetype.desc}</p>
            </div>
            <div className="p-8 flex flex-col items-center bg-white">
               <div className="w-full max-w-xs">
                 <PolygonRadarChart data={integratedData} size={300} colorClass={archetype.color} maxVal={5} />
               </div>
               
               {/* 注釈を配置 */}
               <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100 text-center max-w-lg mx-auto">
                 <div className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full border border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-2">
                   <Info className="w-3 h-3" /> 統合特性チャート
                 </div>
                 <p className="text-xs text-slate-500 leading-relaxed">
                   ※このチャートは、HEXACOやKAI等の科学的理論モデルを枠組みとして採用し、Kage独自のアルゴリズムで6つのテスト結果を統合・算出した独自の指標です。
                 </p>
               </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 2. 認知スタイル (OSIVQ) */}
          {hasOsivq && (
            <Card className="border-blue-100 bg-blue-50/30 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600" /> 認知スタイル (OSIVQ)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* 既存のバーチャート */}
                <CognitiveChart object={objectScore} spatial={spatialScore} verbal={verbalScore} />
                
                {/* 数字リストと自動分母計算 */}
                {(() => {
                   // 質問数を数えて分母(Max)を決める (ショートなら2問×5=10、フルなら15問×5=75)
                   const oCount = Object.keys(osivqResult || {}).filter(k => k.startsWith("o")).length;
                   const sCount = Object.keys(osivqResult || {}).filter(k => k.startsWith("s")).length;
                   const vCount = Object.keys(osivqResult || {}).filter(k => k.startsWith("v")).length;
                   
                   const oMax = oCount * 5 || 10;
                   const sMax = sCount * 5 || 10;
                   const vMax = vCount * 5 || 10;
                   return (
                     <div className="mt-4 bg-white/50 p-3 rounded-lg border border-blue-100 space-y-1">
                       <ScoreRow label="物体 (Object)" score={objectScore} max={oMax} />
                       <ScoreRow label="空間 (Spatial)" score={spatialScore} max={sMax} />
                       <ScoreRow label="言語 (Verbal)" score={verbalScore} max={vMax} />
                     </div>
                   );
                })()}
              </CardContent>
            </Card>
          )}

          {/* 3. 性格特性 (HEXACO) */}
          {hasHexaco && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-slate-500" /> 性格特性 (HEXACO)
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center pt-4">
                <PolygonRadarChart 
                  data={[
                    { label: "正直・謙虚", value: h },
                    // ※ポートフォリオ用: 実際の計算式は非公開
                    { label: "情緒安定", value: e },
                    { label: "外向性", value: x },
                    { label: "協調性", value: a },
                    { label: "誠実性", value: c },
                    { label: "開放性", value: o }
                  ]} 
                  size={220} colorClass="text-slate-500" maxVal={5} 
                />
                {/* 数字の詳細リスト */}
                <div className="w-full mt-8 grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl">
                  <ScoreRow label="正直・謙虚さ (H)" score={h} max={5} />
                  {/* ※ポートフォリオ用: 実際の計算式は非公開 */}
                  <ScoreRow label="情緒安定性 (E)" score={e} max={5} />
                  <ScoreRow label="外向性 (X)" score={x} max={5} />
                  <ScoreRow label="協調性 (A)" score={a} max={5} />
                  <ScoreRow label="誠実性 (C)" score={c} max={5} />
                  <ScoreRow label="開放性 (O)" score={o} max={5} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 4. その他の測定結果 (ビジュアル化) */}
        <div className="mt-12">
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Detailed Analysis</h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             
             {/* KAI (問題解決スタイル) */}
             {hasKai && (
                <Card className="break-inside-avoid shadow-sm border-amber-200 border-2">
                  <CardHeader className="pb-2 bg-amber-50 rounded-t-xl border-b border-amber-100">
                    <CardTitle className="text-sm font-bold text-amber-800 flex items-center gap-2">
                      <Scale className="w-4 h-4" /> 問題解決スタイル (KAI)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {/* グラフ */}
                    <KaiChart adaption={adaptionScore} innovation={innovationScore} />
                    
                    {/* 自動分母計算 */}
                    <div className="mt-4 bg-slate-50 p-3 rounded-lg space-y-1">
                      <ScoreRow label="適応型スコア (規律)" score={adaptionScore} max={kaiAdaptionKeys.length * 5} />
                      <ScoreRow label="革新型スコア (創造)" score={innovationScore} max={kaiInnovationKeys.length * 5} />
                    </div>
                  </CardContent>
                </Card>
             )}

             {/* ASRS (注意特性) */}
             {results.some(r => r.test_type === 'asrs') && (
                <Card className="break-inside-avoid shadow-sm border-rose-200 border-2">
                  <CardHeader className="pb-2 bg-rose-50 rounded-t-xl border-b border-rose-100">
                    <CardTitle className="text-sm font-bold text-rose-800 flex items-center gap-2">
                      <Activity className="w-4 h-4" /> 注意・集中スタイル (ASRS)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    {(() => {
                      const asrsResult = results.find(r => r.test_type === "asrs")?.result_data;
                      // ASRS: 不注意 (as1-as3) と 多動・衝動性 (as4-as6) を動的に計算
                      const inattentionKeys = Object.keys(asrsResult || {}).filter(k => k.match(/^as[1-3]$/));
                      const hyperactivityKeys = Object.keys(asrsResult || {}).filter(k => k.match(/^as[4-6]$/));
                      const inattentionSum = calculateSumOrAvg(asrsResult, inattentionKeys, 'sum');
                      const hyperactivitySum = calculateSumOrAvg(asrsResult, hyperactivityKeys, 'sum');
                      
                      // 分母を自動計算（質問数 × 5点）
                      const iCount = inattentionKeys.length;
                      const hCount = hyperactivityKeys.length;
                      const iMax = iCount * 5;
                      const hMax = hCount * 5;
                      
                      return (
                        <>
                          <SimpleBarChart label="不注意傾向" value={inattentionSum} max={iMax || 15} color="bg-rose-500" />
                          <SimpleBarChart label="多動・衝動性" value={hyperactivitySum} max={hMax || 15} color="bg-rose-400" />
                          
                          {/* 分母を自動計算 */}
                          <div className="mt-4 bg-slate-50 p-3 rounded-lg space-y-1">
                            <ScoreRow label="不注意 (Inattention)" score={inattentionSum} max={iMax || 15} />
                            <ScoreRow label="多動・衝動 (Hyperactivity)" score={hyperactivitySum} max={hMax || 15} />
                            <div className="text-right text-[10px] text-slate-400 mt-1">※合計24点以上で要注意</div>
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
             )}

             {/* AQ (コミュニケーション特性) */}
             {results.some(r => r.test_type === 'aq') && (
                <Card className="break-inside-avoid shadow-sm border-emerald-200 border-2">
                  <CardHeader className="pb-2 bg-emerald-50 rounded-t-xl border-b border-emerald-100">
                    <CardTitle className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> コミュニケーション特性 (AQ)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    {(() => {
                      // AQ-10（短縮版）ならMAX10、AQ-50（フル版）ならMAX50
                      const aqKeys = Object.keys(aqResult || {}).filter(k => k.startsWith("aq"));
                      const aqSum = calculateSumOrAvg(aqResult, aqKeys, 'sum');
                      const maxScore = aqKeys.length * 5; 
                      return (
                        <>
                          <SimpleBarChart 
                            label="自閉傾向スコア" 
                            value={aqSum} 
                            max={maxScore} 
                            color="bg-emerald-500" 
                          />
                          
                          {/* 数値表示エリア */}
                          <div className="mt-4 bg-slate-50 p-3 rounded-lg">
                            <ScoreRow label="AQ総合スコア" score={aqSum} max={maxScore} />
                          </div>
                        </>
                      );
                    })()}
                    <p className="text-[10px] text-slate-500 text-center mt-2">
                      ※スコアが高いほど、独自のこだわりやパターン認識を好む傾向があります。
                    </p>
                  </CardContent>
                </Card>
             )}

             {/* 感覚特性 (SPS) */}
             {results.some(r => r.test_type === 'sensory') && (
                <Card className="break-inside-avoid shadow-sm border-cyan-200 border-2">
                  <CardHeader className="pb-2 bg-cyan-50 rounded-t-xl border-b border-cyan-100">
                    <CardTitle className="text-sm font-bold text-cyan-800 flex items-center gap-2">
                      <Waves className="w-4 h-4" /> 感覚・感受性 (SPS)
                     </CardTitle>
                   </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    {(() => {
                      // Sensory: 感覚過敏性 (sn1-sn3) と 美的感受性 (sn5-sn6) を動的に計算
                      const sensitivityKeys = Object.keys(sensoryResult || {}).filter(k => k.match(/^sn[1-3]$/));
                      const aestheticKeys = Object.keys(sensoryResult || {}).filter(k => k.match(/^sn[5-6]$/));
                      const sensitivitySum = calculateSumOrAvg(sensoryResult, sensitivityKeys, 'sum');
                      const aestheticSum = calculateSumOrAvg(sensoryResult, aestheticKeys, 'sum');
                      const sensitivityMax = sensitivityKeys.length * 5;
                      const aestheticMax = aestheticKeys.length * 5;
                      return (
                        <>
                          <SimpleBarChart label="感覚過敏性" value={sensitivitySum} max={sensitivityMax || 15} color="bg-cyan-500" />
                          <SimpleBarChart label="美的感受性" value={aestheticSum} max={aestheticMax || 10} color="bg-cyan-400" />
                          
                          {/* 数値表示エリア */}
                          <div className="mt-4 bg-slate-50 p-3 rounded-lg space-y-1">
                             <ScoreRow label="過敏性 (Sensitivity)" score={sensitivitySum} max={sensitivityMax || 15} />
                             <ScoreRow label="美的感受 (Aesthetic)" score={aestheticSum} max={aestheticMax || 10} />
                          </div>
                        </>
                      );
                    })()}
                   </CardContent>
                 </Card>
             )}

           </div>
        </div>

        {/* 5. 科学的背景 (リンク集) */}
        <div className="mt-16 border-t border-slate-200 pt-10">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-500" />
            採用されている科学的モデルと理論的背景
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SCIENCE_REFS.map((ref) => (
              <a 
                key={ref.id} 
                href={ref.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 transition-all group"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700">{ref.name}</span>
                  <span className="text-[10px] text-slate-400">{ref.researcher}</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-blue-400" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 text-center text-xs text-slate-400">
          <div className="inline-flex items-center justify-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg mb-4 border border-amber-200">
            <AlertTriangle className="w-4 h-4" /> 免責事項
          </div>
          <p className="leading-relaxed max-w-2xl mx-auto">
            本レポートは、HEXACOやKAI等の科学的理論モデルを枠組みとして採用し、Kage独自のアルゴリズムで分析を行ったものです。<br/>
            自己理解および職場でのコミュニケーション支援を目的としており、医学的な診断書ではありません。
          </p>
          <p className="text-[10px] text-slate-300 mt-6 font-mono tracking-wider">Generated by Kage System</p>
        </div>

        {/* 企業が見ている場合のみ、面接パネルを表示 */}
        {viewerOrgId && profile && (
          <InterviewerPanel 
            candidateId={profile.id} 
            orgId={viewerOrgId} 
            hScore={h} // すでに計算済みのH因子スコア
            isFullVersion={isFullVersion} // Full版かどうかのフラグ
          />
        )}
      </main>

      {/* キャンペーン選択モーダル (mainタグの外、一番下に配置) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">追加先のキャンペーンを選択</h3>
              <p className="text-xs text-slate-500">この候補者をどの採用枠で管理しますか？</p>
            </div>
            <div className="p-2 max-h-[60vh] overflow-y-auto">
              {/* キャンペーン一覧 */}
              {campaigns.map((camp) => (
                <button
                  key={camp.id}
                  onClick={() => handleImport(camp.id)}
                  disabled={isImporting}
                  className="w-full text-left p-3 hover:bg-indigo-50 rounded-lg text-sm font-medium text-slate-700 hover:text-indigo-700 transition-colors flex items-center justify-between group"
                >
                  {camp.name}
                  <UserPlus className="w-4 h-4 opacity-0 group-hover:opacity-100 text-indigo-500" />
                </button>
              ))}
              
              {/* 一般（紐付けなし） */}
              <button
                onClick={() => handleImport(null)}
                disabled={isImporting}
                className="w-full text-left p-3 hover:bg-slate-100 rounded-lg text-sm text-slate-500 hover:text-slate-900 transition-colors border-t border-slate-100 mt-2"
              >
                キャンペーンに紐付けない (All Candidatesのみ)
              </button>
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="w-full text-slate-500">
                キャンセル
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
