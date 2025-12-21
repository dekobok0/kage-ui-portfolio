// app/page.tsx
import Link from "next/link";
import { ArrowRight, User, Building2, ShieldCheck, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// 科学的根拠データ
const SCIENCE_REFS = [
  { 
    id: "hexaco", 
    name: "HEXACO性格特性モデル", 
    researcher: "Thielmann et al. (2020)", 
    desc: "数百の研究を統合した決定版レビュー論文。H因子（正直・謙虚さ）の重要性を実証。",
    url: "https://journals.sagepub.com/doi/10.1177/1745691619895036" 
  },
  { 
    id: "kai", 
    name: "適応・革新理論 (KAI)", 
    researcher: "Kirton (1976) / KAI Centre", 
    desc: "創造性のレベルではなく「スタイル」を測定。40年以上の信頼性研究に基づく。",
    url: "https://www.kaicentre.com/" 
  },
  { 
    id: "osivq", 
    name: "OSIVQ認知スタイル", 
    researcher: "Blazhenkova & Kozhevnikov (2009)", 
    desc: "脳科学的基盤（二重経路説）に基づき、視覚思考を「物体」と「空間」に分離。",
    url: "https://onlinelibrary.wiley.com/doi/abs/10.1002/acp.1473" 
  },
  { 
    id: "asrs", 
    name: "成人期ADHD (ASRS-v1.1)", 
    researcher: "Harvard Medical School / WHO", 
    desc: "世界保健機関（WHO）が作成した、成人特有の症状を検出するゴールドスタンダード。",
    url: "https://www.hcp.med.harvard.edu/ncs/asrs.php" 
  },
  { 
    id: "aq", 
    name: "自閉症スペクトラム指数 (AQ)", 
    researcher: "Ruzich et al. (2015)", 
    desc: "数千人のデータを分析したシステマティックレビューにより、高い識別能力を確認。",
    url: "https://molecularautism.biomedcentral.com/articles/10.1186/2040-2392-6-2" 
  },
  { 
    id: "sensory", 
    name: "感覚処理感受性 (HSP)", 
    researcher: "Lionetti et al. (2018)", 
    desc: "最新のメタ分析により、SPSが3因子構造（EOE, LST, AES）であることを確立。",
    url: "https://doi.org/10.1038/s41398-017-0090-6" 
  },
];

function ScienceGrid() {
  return (
    <section id="science" className="py-20 bg-white border-t border-slate-100 scroll-mt-24">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* 左カラム */}
          <div className="md:w-1/3 md:sticky top-24">
            <div className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 mb-4">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Evidence-Based
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-slate-900">
              信頼できる科学的モデルのみを採用
            </h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Kageは、MBTIのような科学的根拠に乏しいモデルを排除し、心理学・脳科学の分野で高いエビデンスレベルを持つ指標のみを厳選して統合しています。
            </p>
          </div>
          
          {/* 右カラム */}
          <div className="md:w-2/3 grid gap-4 sm:grid-cols-2">
            {SCIENCE_REFS.map((ref) => (
              <a 
                key={ref.id} 
                href={ref.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-700 flex items-center gap-2 text-sm sm:text-base">
                    {ref.name}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                </div>
                <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">{ref.researcher}</p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {ref.desc}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function GatewayPage() {
  // サーバー側でデータ取得
  const { data } = await supabase.from('organizations').select('*');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      
      {/* メインエリア (ヘッダーなしで画面中央に配置) */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 min-h-[80vh]">
        
        {/* ロゴ */}
        <div className="mb-12 flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-500">
          <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">K</div>
          <span className="font-bold text-slate-900 text-xl tracking-tight">Kage OS</span>
        </div>
        
        {/* 分岐カード */}
        <div className="max-w-5xl w-full grid md:grid-cols-2 gap-6 md:gap-12 items-stretch">
          
          {/* 左：個人向け (無料で診断) */}
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 flex flex-col items-center text-center transition-all hover:scale-[1.02] hover:shadow-2xl hover:border-indigo-100 group">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-indigo-100 transition-colors">
              <User className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4">
              自分の才能を<br/>科学的に発見する
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed text-sm md:text-base">
              ゲーム感覚の診断で「隠れた強み」を可視化。<br/>
              あなただけの取扱説明書を手に入れましょう。
            </p>
            
            <Link 
              href="/personal" 
              className="mt-auto w-full bg-indigo-600 text-white px-6 py-4 rounded-xl text-lg font-bold shadow-lg hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all"
            >
              無料で診断を始める <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="mt-4 text-xs text-slate-400">※ 完全無料 / 登録5分</p>
          </div>
          
          {/* 右：法人向け (LPへ誘導) */}
          <div className="bg-slate-900 rounded-3xl p-8 md:p-12 shadow-xl flex flex-col items-center text-center transition-all hover:scale-[1.02] hover:shadow-2xl group text-white">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6 group-hover:bg-slate-700 transition-colors">
              <Building2 className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-4">
              採用、配置、法的リスクを<br/>三つの壁でブロックする
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed text-sm md:text-base">
              採用ミスによる損失は平均
              <span className="inline-block px-2 py-1 mx-1 bg-red-500/20 text-red-300 rounded-md font-bold text-base border border-red-400/30">
                1,700万～1億2,000万円
              </span>
              <br/>
              H因子とKAI理論、OSIVQ理論などで、組織のリスクと可能性を可視化します。
            </p>
            
            {/* 法人LP (/business) へ飛ばす */}
            <Link 
              href="/business" 
              className="mt-auto w-full bg-white text-slate-900 px-6 py-4 rounded-xl text-lg font-bold shadow-lg hover:bg-slate-100 flex items-center justify-center gap-2 transition-all"
            >
              法人向け機能を見る <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="mt-4 text-xs text-slate-500">※ 14日間無料トライアルあり</p>
          </div>
        </div>
      </main>
      
      {/* 科学的根拠エリア (フッター代わり) */}
      <ScienceGrid />
      
      {/* 極小フッター */}
      <footer className="py-6 text-center text-xs text-slate-400 bg-slate-50">
        © 2025 Kage OS. All rights reserved.
      </footer>
    </div>
  );
}