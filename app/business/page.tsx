"use client";

import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Pricing } from "@/components/Pricing";
import { ShieldAlert, Users, Scale, AlertTriangle, ArrowRight, BrainCircuit, ShieldCheck, FileCheck, ExternalLink, X, Calculator, BookOpen, MousePointerClick, Microscope } from "lucide-react";

// --- 科学的根拠データ (8つに増強) ---
const SCIENCE_REFS = [
  // 1. HEXACO (Toxic検知)
  { 
    id: "hexaco", 
    name: "HEXACO性格特性モデル", 
    researcher: "Thielmann et al. (2020)", 
    desc: "数百の研究を統合した決定版レビュー論文。H因子（正直・謙虚さ）の欠如が、組織内不正の最大予測因子であることを実証。",
    url: "https://journals.sagepub.com/doi/10.1177/1745691619895036" 
  },
  // 2. Sackett (構造化面接)
  { 
    id: "interview", 
    name: "構造化面接の予測妥当性", 
    researcher: "Sackett et al. (2022)", 
    desc: "ミネソタ大学による衝撃的研究。従来のIQテスト(0.31)よりも、構造化面接(0.42〜)の方が職務成果を正確に予測することを証明。",
    url: "https://psycnet.apa.org/record/2023-72738-001" 
  },
  // 3. VPC (H因子改善)
  { 
    id: "vpc", 
    name: "意図的な性格変容 (VPC)", 
    researcher: "Hudson (2022)", 
    desc: "「性格は変わらない」は過去の話。協調性を高める介入により、ダークトライアド（毒性）が副作用的に低減することを実証。",
    url: "https://onlinelibrary.wiley.com/doi/abs/10.1111/jopy.12714" 
  },
  // 4. KAI (配置摩擦)
  { 
    id: "kai", 
    name: "適応・革新理論 (KAI)", 
    researcher: "Kirton (1976) / KAI Centre", 
    desc: "創造性のレベルではなく「スタイル」を測定。20pt以上の認知ギャップが人間関係の摩擦を生むメカニズムを解明。",
    url: "https://www.kaicentre.com/" 
  },
  // 5. OSIVQ (脳タイプ)
  { 
    id: "osivq", 
    name: "OSIVQ認知スタイル", 
    researcher: "Blazhenkova & Kozhevnikov (2009)", 
    desc: "脳科学的基盤（二重経路説）に基づき、視覚思考を「物体」と「空間」に分離。適材適所の脳科学的根拠。",
    url: "https://onlinelibrary.wiley.com/doi/abs/10.1002/acp.1473" 
  },
  // 6. ADHD (成人期)
  { 
    id: "asrs", 
    name: "成人期ADHD (ASRS-v1.1)", 
    researcher: "Harvard Medical School / WHO", 
    desc: "世界保健機関（WHO）が作成したゴールドスタンダード。大人の発達障害特性を高精度にスクリーニング。",
    url: "https://www.hcp.med.harvard.edu/ncs/asrs.php" 
  },
  // 7. ASD (自閉スペクトラム)
  { 
    id: "aq", 
    name: "自閉スペクトラム指数 (AQ)", 
    researcher: "Ruzich et al. (2015)", 
    desc: "数千人のデータを分析したシステマティックレビューにより、高い識別能力を確認。ニューロダイバーシティ対応の基礎。",
    url: "https://molecularautism.biomedcentral.com/articles/10.1186/2040-2392-6-2" 
  },
  // 8. HSP (感覚過敏)
  { 
    id: "sensory", 
    name: "感覚処理感受性 (HSP)", 
    researcher: "Lionetti et al. (2018)", 
    desc: "最新のメタ分析により、SPSが3因子構造であることを確立。環境調整（合理的配慮）のための科学的指標。",
    url: "https://doi.org/10.1038/s41398-017-0090-6" 
  },
];

// --- エビデンス・モーダルコンポーネント ---
function EvidenceModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-center z-10">
          <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-indigo-600" />
            算出ロジックと科学的根拠
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>
        <div className="p-8 space-y-12">
          {/* 1. 早期離職コストの計算 */}
          <section>
            <h4 className="text-lg font-bold text-slate-900 mb-4 border-l-4 border-red-500 pl-3">
              ① 早期離職コスト：1,700万円の内訳
            </h4>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-sm md:text-base">
              <p className="mb-4 text-slate-600">
                年収500万円の社員が、入社後半年で早期離職した場合の損失試算（リクルートワークス研究所・マイナビ等の調査データを統合）。
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
                <div className="flex justify-between border-b border-slate-200 py-2">
                  <span>採用コスト (エージェント35%)</span>
                  <span className="font-bold">175万円</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 py-2">
                  <span>入社後給与 (6ヶ月分)</span>
                  <span className="font-bold">250万円</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 py-2">
                  <span>社会保険・福利厚生 (15%)</span>
                  <span className="font-bold">37.5万円</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 py-2">
                  <span>教育研修・OJT人件費</span>
                  <span className="font-bold">300万円</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 py-2 bg-red-50 px-2">
                  <span>機会損失 (本来上げるべき粗利)</span>
                  <span className="font-bold text-red-600">約1,000万円</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end items-baseline gap-4">
                <span className="text-sm text-slate-500">合計損失額</span>
                <span className="text-3xl font-extrabold text-slate-900">1,762.5万円</span>
              </div>
            </div>
          </section>

          {/* 2. 法的リスクの計算 */}
          <section>
            <h4 className="text-lg font-bold text-slate-900 mb-4 border-l-4 border-indigo-500 pl-3">
              ② 法的・賠償リスク：1億2,000万円の根拠
            </h4>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-sm md:text-base">
              <p className="mb-4 text-slate-600">
                不当解雇やハラスメント訴訟に発展し、敗訴または和解した場合の最大リスク（大和高田市事件などの判例およびブランド毀損を含む）。
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 py-2">
                  <div>
                    <span className="font-bold block">バックペイ (未払い賃金)</span>
                    <span className="text-xs text-slate-500">解雇無効判決が出るまでの期間(約2年)の給与支払い</span>
                  </div>
                  <span className="font-bold text-lg">約1,200万円</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 py-2">
                  <div>
                    <span className="font-bold block">慰謝料・損害賠償</span>
                    <span className="text-xs text-slate-500">ハラスメント認定や精神的苦痛に対する賠償</span>
                  </div>
                  <span className="font-bold text-lg">300〜500万円</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 py-2 bg-indigo-50 px-2 rounded">
                  <div>
                    <span className="font-bold block text-indigo-900">ブランド毀損・採用機会損失</span>
                    <span className="text-xs text-indigo-700">「ブラック企業」の風評による採用単価高騰・売上低下</span>
                  </div>
                  <span className="font-bold text-xl text-indigo-700">1億円以上</span>
                </div>
              </div>
            </div>
          </section>

          {/* 3. 科学的根拠 (アカデミックソース) */}
          <section>
            <h4 className="text-lg font-bold text-slate-900 mb-4 border-l-4 border-green-500 pl-3">
              ③ 解決策の科学的エビデンス (原典)
            </h4>
            <div className="grid gap-4">
              <a href="https://journals.sagepub.com/doi/10.1177/1745691619895036" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all group">
                <BookOpen className="w-6 h-6 text-slate-400 group-hover:text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h5 className="font-bold text-slate-900 group-hover:text-blue-700 flex items-center gap-2">
                    HEXACOモデルと反生産的行動 (CWB) <ExternalLink className="w-3 h-3" />
                  </h5>
                  <p className="text-sm text-slate-600 mt-1">
                    Lee, K., & Ashton, M. C. (2004). "Psychopathy, Machiavellianism, and Narcissism in the Five-Factor Model and the HEXACO model".<br/>
                    H因子（正直・謙虚さ）の低さが、組織内の不正・トラブルの最も強力な予測因子であることを実証。
                  </p>
                </div>
              </a>
              
              <a href="https://www.kaicentre.com/" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all group">
                <BookOpen className="w-6 h-6 text-slate-400 group-hover:text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h5 className="font-bold text-slate-900 group-hover:text-blue-700 flex items-center gap-2">
                    KAI 適応・革新理論と認知的摩擦 <ExternalLink className="w-3 h-3" />
                  </h5>
                  <p className="text-sm text-slate-600 mt-1">
                    Kirton, M. J. (2003). "Adaption-Innovation: In the Context of Diversity and Change".<br/>
                    20ポイント以上のスコア乖離が、コミュニケーションコストの増大と認知的疲労（離職）を招くメカニズムを解明。
                  </p>
                </div>
              </a>
            </div>
          </section>
        </div>
        
        <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 text-center">
          <button onClick={onClose} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors">
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

// --- インタラクティブな統合セクション (損失 + ソリューション + 科学) ---
function InteractiveWallSection() {
  const [activeWall, setActiveWall] = useState<1 | 2 | 3>(1); // 初期値を第1の壁に変更（インパクト重視）

  const WALL_DATA = {
    1: {
      id: 1,
      title: "第1の壁：採用 (Selection)",
      cost: "1,700万円",
      sub: "早期離職・サンクコスト",
      color: "red",
      icon: Users,
      problem: "「破壊的離職」を防ぐ。",
      solution: "面接官を欺く「ダークトライアド（サイコパス・自己愛）」予備軍を検知。SPI等の能力検査では見抜けない、組織を腐らせる「毒性」を入り口でブロックします。",
      // 科学的根拠をここに紐付け
      science: [
        { name: "HEXACOモデル", desc: "H因子(正直・謙虚さ)による毒性検知" },
        { name: "構造化面接", desc: "Sackett(2023)に基づく高精度選抜" }
      ],
      features: [
        { icon: BrainCircuit, text: "6因子性格診断 (H因子特化)" },
        { icon: ShieldCheck, text: "リスク人材アラート機能" },
      ],
      details: [
        "採用エージェント費 (年収35%)：175万円",
        "入社後6ヶ月分の給与・社保：287.5万円",
        "教育研修・OJT人件費：約300万円",
        "機会損失 (本来上げるべき粗利)：約1,000万円"
      ],
      imagePlaceholder: "Toxic検知・アラート画面"
    },
    2: {
      id: 2,
      title: "第2の壁：配置 (Placement)",
      cost: "年200万円/人",
      sub: "配置摩擦・生産性ロス",
      color: "orange",
      icon: ShieldAlert,
      problem: "「疲弊的離職」を防ぐ。",
      solution: "「なぜか上司と合わない」原因は認知OSのギャップです。20pt以上のズレを解消し、さらに既存社員のH因子改善（倫理トレーニング）を行うことで組織を改善します。",
      science: [
        { name: "KAI理論", desc: "認知スタイル摩擦の解消" },
        { name: "OSIVQ", desc: "脳の視覚処理特性による適材適所" },
        { name: "行動変容介入", desc: "倫理観のアップデート(VPC)" }
      ],
      features: [
        { icon: Users, text: "KAI 認知スタイルヒートマップ" },
        { icon: ArrowRight, text: "H因子改善プログラム" },
      ],
      details: [
        "対象：平均年収500万円の社員",
        "認知ギャップによる生産性低下：▲40%",
        "1人あたりの年間損失：200万円",
        "5人チームの場合：年間1,000万円の垂れ流し"
      ],
      imagePlaceholder: "ヒートマップ・配置画面"
    },
    3: {
      id: 3,
      title: "第3の壁：法務 (Legal)",
      cost: "1.2億円〜",
      sub: "訴訟・ブランド毀損",
      color: "indigo",
      icon: Scale,
      problem: "「敵対的離職」に勝つ。",
      solution: "退職トラブルや訴訟リスクを最小化。「会社は十分な配慮を行った」という客観的証拠を自動保存し、不当解雇や安全配慮義務違反の訴えから経営を守ります。",
      science: [
        { name: "安全配慮義務", desc: "大和高田市事件等の判例準拠" },
        { name: "合理的配慮", desc: "改正障害者差別解消法対応" }
      ],
      features: [
        { icon: FileCheck, text: "監査ログの永久保存" },
        { icon: Scale, text: "合理的配慮の記録システム" },
      ],
      details: [
        "不当解雇訴訟のバックペイ：約1,200万円",
        "ハラスメント慰謝料・和解金：300〜500万円",
        "ブラック企業認定による採用ブランド毀損：1億円以上",
        "大和高田市事件等の判例に基づく"
      ],
      imagePlaceholder: "監査ログ・証明書画面"
    }
  };

  const activeData = WALL_DATA[activeWall];

  return (
    <section className="py-24 bg-slate-50 border-b border-slate-200">
      <div className="container px-4 mx-auto max-w-7xl">
        
        {/* 見出し */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900">
            3つの防壁（Walls）が<br/>あなたの会社を守る。
          </h2>
          <p className="text-slate-500 mt-4">
            それぞれの壁をクリックして、防げる「損失額」と「解決策」をご覧ください。
          </p>
          <p className="text-xs text-indigo-600 mt-2 font-bold animate-pulse flex items-center justify-center gap-2">
            <MousePointerClick className="w-4 h-4" />
            クリックで切り替え
          </p>
        </div>

        <div className="flex flex-col xl:flex-row items-start justify-center gap-12">
          
          {/* 左側：操作盤 (3つの壁) */}
          <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] flex-shrink-0 mx-auto xl:mx-0 flex items-center justify-center mb-8 xl:mb-0">
            {/* Wall 1 (外側: 赤) */}
            <button
              onClick={() => setActiveWall(1)}
              className={`absolute rounded-full border-[24px] flex items-start justify-center pt-2 transition-all duration-300 w-full h-full z-10 ${
                activeWall === 1 ? "border-red-500 bg-red-50 shadow-xl scale-100 opacity-100" : "border-red-100 bg-transparent scale-95 opacity-60 hover:opacity-80"
              }`}
            >
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${activeWall === 1 ? "bg-red-600 text-white" : "bg-red-100 text-red-400"}`}>第1の壁</span>
            </button>
            {/* Wall 2 (中間: オレンジ) */}
            <button
              onClick={() => setActiveWall(2)}
              className={`absolute rounded-full border-[24px] flex items-start justify-center pt-2 transition-all duration-300 w-[70%] h-[70%] z-20 ${
                activeWall === 2 ? "border-orange-500 bg-orange-50 shadow-xl scale-110 opacity-100" : "border-orange-100 bg-transparent scale-100 opacity-60 hover:opacity-80"
              }`}
            >
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${activeWall === 2 ? "bg-orange-500 text-white" : "bg-orange-100 text-orange-400"}`}>第2の壁</span>
            </button>
            {/* Wall 3 (内側: 青) */}
            <button
              onClick={() => setActiveWall(3)}
              className={`absolute rounded-full border-[24px] flex items-center justify-center transition-all duration-300 w-[40%] h-[40%] z-30 ${
                activeWall === 3 ? "border-indigo-600 bg-indigo-50 shadow-xl scale-110 sm:scale-125 opacity-100" : "border-indigo-100 bg-transparent scale-100 opacity-60 hover:opacity-80"
              }`}
            >
               <div className="text-center">
                <span className={`text-xs font-bold px-2 py-1 rounded-full block mb-1 ${activeWall === 3 ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-400"}`}>第3の壁</span>
                {activeWall === 3 && <span className="font-bold text-sm text-indigo-900 animate-in fade-in">御社</span>}
              </div>
            </button>
          </div>

          {/* 右側：統合カード (表示エリア) - 幅を広げて2カラム化 */}
          <div className="w-full max-w-4xl"> 
            <div className={`rounded-2xl border bg-white shadow-xl overflow-hidden transition-all duration-300 flex flex-col md:flex-row ${
              activeWall === 1 ? "border-red-500 shadow-red-100" :
              activeWall === 2 ? "border-orange-500 shadow-orange-100" :
              "border-indigo-600 shadow-indigo-100"
            }`}>
              
              {/* カード左側：損失データとロジック */}
              <div className="p-8 md:w-1/2 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-3 rounded-xl ${
                      activeWall === 1 ? "bg-red-100 text-red-600" :
                      activeWall === 2 ? "bg-orange-100 text-orange-600" :
                      "bg-indigo-100 text-indigo-600"
                    }`}>
                      <activeData.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{activeData.title}</h3>
                      <p className="text-sm text-slate-500 font-bold">{activeData.sub}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-slate-500 mb-1">回避できる損失額</p>
                    <div className={`text-4xl font-extrabold ${
                      activeWall === 1 ? "text-red-600" :
                      activeWall === 2 ? "text-orange-600" :
                      "text-indigo-600"
                    }`}>
                      {activeData.cost}
                    </div>
                  </div>

                  {/* 科学的根拠タグ (ここに追加) */}
                  <div className="mb-6">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Microscope className="w-3 h-3" /> 採用されている科学モデル
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeData.science.map((sci, idx) => (
                        <div key={idx} className="bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-700">
                          <span className="font-bold block">{sci.name}</span>
                          <span className="text-[10px] text-slate-500">{sci.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Calculator className="w-3 h-3" /> 算出ロジック
                    </h4>
                    <ul className="space-y-2">
                      {activeData.details.map((detail, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                          <ArrowRight className={`w-3 h-3 mt-0.5 flex-shrink-0 ${
                            activeWall === 1 ? "text-red-400" :
                            activeWall === 2 ? "text-orange-400" :
                            "text-indigo-400"
                          }`} />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* カード右側：ソリューションとスクショ */}
              <div className="p-8 md:w-1/2 bg-slate-50/50 flex flex-col">
                <div className="mb-6">
                  <h4 className={`text-lg font-bold mb-2 ${
                     activeWall === 1 ? "text-red-700" :
                     activeWall === 2 ? "text-orange-700" :
                     "text-indigo-700"
                  }`}>
                    {activeData.problem}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {activeData.solution}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {activeData.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm font-bold text-slate-800">
                        <feature.icon className={`w-4 h-4 ${
                           activeWall === 1 ? "text-red-500" :
                           activeWall === 2 ? "text-orange-500" :
                           "text-indigo-500"
                        }`} />
                        {feature.text}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 画像プレースホルダー (ここに実際のスクショが入る) */}
                <div className="mt-auto aspect-video bg-white rounded-lg border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden relative group">
                  <div className={`absolute inset-0 opacity-10 ${
                     activeWall === 1 ? "bg-red-500" :
                     activeWall === 2 ? "bg-orange-500" :
                     "bg-indigo-500"
                  }`}></div>
                  <span className="text-slate-400 text-xs font-mono">{activeData.imagePlaceholder}</span>
                  {/* 画像を入れるときはここを <img src="..." /> に変える */}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// --- Kage vs 旧来テスト比較セクション (3列構成・完全版) ---
function ScienceComparison() {
  return (
    <section className="py-24 bg-slate-50 border-t border-slate-200">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800 mb-4">
            <Microscope className="w-4 h-4 mr-2" />
            2025 New Standard
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            その採用基準、<br className="md:hidden"/>「1998年の科学」で止まっていませんか？
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
            2022年のパラダイムシフト（Sackettの研究）により、従来の能力検査の信頼性は否定されました。<br/>
            Kageは、エンタメや慣習ではなく「本当に予測できる指標」だけを搭載しています。
          </p>
        </div>

        <div className="flex flex-col xl:flex-row gap-12 items-start">
          
          {/* 左：比較テーブル (3列・完全版) */}
          <div className="w-full xl:w-2/3 overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
            <table className="w-full text-left border-collapse min-w-[800px]"> {/* 横スクロール対応 */}
              <thead>
                <tr className="bg-slate-50 text-slate-900">
                  <th className="p-6 font-bold border-b border-slate-200 text-sm w-1/4">比較項目</th>
                  <th className="p-6 font-bold border-b border-slate-200 text-sm w-1/4 text-slate-500 bg-slate-50/50">
                    📉 旧来の適性検査<br/>
                    <span className="text-xs font-normal">(SPI, 玉手箱など)</span>
                  </th>
                  <th className="p-6 font-bold border-b border-slate-200 text-sm w-1/4 text-slate-500 bg-slate-50/50">
                    🔮 タイプ論テスト<br/>
                    <span className="text-xs font-normal">(MBTI系, 類人猿など)</span>
                  </th>
                  <th className="p-6 font-bold border-b border-indigo-600 bg-indigo-50 text-indigo-700 text-sm w-1/4">
                    🚀 Kage OS<br/>
                    <span className="text-xs font-normal">(次世代リスク管理)</span>
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                
                {/* 1. 科学的根拠 */}
                <tr>
                  <td className="p-6 font-bold text-slate-900 border-b border-slate-100 bg-white">
                    科学的根拠<br/>
                    <span className="text-xs font-normal text-slate-400">(予測妥当性)</span>
                  </td>
                  <td className="p-6 text-slate-600 border-b border-slate-100 bg-slate-50/30 align-top">
                    <span className="font-bold block text-slate-700 mb-1">古い科学 (1998年基準)</span>
                    修正後の相関：<span className="font-bold text-red-500">0.31 📉</span><br/>
                    <span className="text-[10px] text-slate-400">※Sackett et al. (2022)</span>
                  </td>
                  <td className="p-6 text-slate-600 border-b border-slate-100 bg-slate-50/30 align-top">
                    <span className="font-bold block text-slate-700 mb-1">科学的根拠なし</span>
                    相関：<span className="font-bold text-slate-500">ほぼ 0.00</span><br/>
                    <span className="text-[10px] text-slate-400">※採用選抜には不適</span>
                  </td>
                  <td className="p-6 text-indigo-900 border-b border-indigo-100 bg-indigo-50/30 align-top">
                    <span className="font-bold block text-indigo-700 mb-1">最新科学 (2025年基準)</span>
                    構造化面接：<span className="font-bold text-indigo-600">0.42 📈</span><br/>
                    H因子(毒性)：<span className="font-bold text-indigo-600">-0.44 (逆相関)</span>
                  </td>
                </tr>

                {/* 2. 見抜くもの */}
                <tr>
                  <td className="p-6 font-bold text-slate-900 border-b border-slate-100 bg-white">
                    見抜くもの
                  </td>
                  <td className="p-6 text-slate-600 border-b border-slate-100 bg-slate-50/30 align-top">
                    <span className="font-bold block text-slate-700">学校の勉強ができるか</span>
                    (学力・事務処理能力)
                  </td>
                  <td className="p-6 text-slate-600 border-b border-slate-100 bg-slate-50/30 align-top">
                    <span className="font-bold block text-slate-700">どのキャラっぽいか</span>
                    (エンタメ・自己分析)
                  </td>
                  <td className="p-6 text-indigo-900 border-b border-indigo-100 bg-indigo-50/30 align-top">
                    <span className="font-bold block text-indigo-700">組織を壊さないか</span>
                    (毒性・リスク・行動予測)
                  </td>
                </tr>

                {/* 3. コスト感 */}
                <tr>
                  <td className="p-6 font-bold text-slate-900 border-b border-slate-100 bg-white">
                    コスト感
                  </td>
                  <td className="p-6 text-slate-600 border-b border-slate-100 bg-slate-50/30 align-top">
                    <span className="font-bold block text-slate-700">高い</span>
                    (1名 4,000円〜)
                  </td>
                  <td className="p-6 text-slate-600 border-b border-slate-100 bg-slate-50/30 align-top">
                    <span className="font-bold block text-slate-700">中〜高</span>
                    (認定講師などが必要)
                  </td>
                  <td className="p-6 text-indigo-900 border-b border-indigo-100 bg-indigo-50/30 align-top">
                    <span className="font-bold block text-indigo-700">圧倒的コスパ</span>
                    (Lightプランなら月額固定)
                  </td>
                </tr>

                {/* 4. 致命的な弱点 */}
                <tr>
                  <td className="p-6 font-bold text-slate-900 bg-white">
                    致命的な弱点
                  </td>
                  <td className="p-6 text-slate-600 bg-slate-50/30 align-top">
                    <span className="font-bold block text-red-600 mb-1">「地雷人材」を通してしまう</span>
                    能力は高いが性格が悪い人材（H因子低）は、SPIでは高得点を出せてしまう。
                  </td>
                  <td className="p-6 text-slate-600 bg-slate-50/30 align-top">
                    <span className="font-bold block text-red-600 mb-1">「バーナム効果」で騙される</span>
                    誰にでも当てはまる結果が出るだけで、仕事ができるかは予測できない。
                  </td>
                  <td className="p-6 text-indigo-900 bg-indigo-50/30 align-top">
                    <span className="font-bold block text-indigo-700 mb-1">特になし</span>
                    能力・性格・法務の3重防御で死角を消す。
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* 右：棒グラフ (Ranking) */}
          <div className="w-full xl:w-1/3 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600"/>
              採用手法の予測精度ランキング
            </h3>
            
            <div className="space-y-6">
              {/* Rank 1: Kage */}
              <div>
                <div className="flex justify-between text-sm font-bold mb-1">
                  <span className="text-indigo-700 flex items-center gap-2">
                    🥇 Kage OS (複合選抜)
                  </span>
                  <span className="text-indigo-700">0.65</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-indigo-600 h-3 rounded-full" style={{ width: "95%" }}></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">構造化面接 + H因子 + 能力 の組み合わせ</p>
              </div>

              {/* Rank 2: Toxic */}
              <div>
                <div className="flex justify-between text-sm font-bold mb-1">
                  <span className="text-indigo-600 flex items-center gap-2">
                    🥈 H因子 (毒性検知)
                  </span>
                  <span className="text-indigo-600">-0.44</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-indigo-400 h-3 rounded-full" style={{ width: "70%" }}></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">反生産的行動(CWB)に対する強力な逆相関</p>
              </div>

              {/* Rank 3: Interview */}
              <div>
                <div className="flex justify-between text-sm font-bold mb-1">
                  <span className="text-indigo-500 flex items-center gap-2">
                    🥉 構造化面接
                  </span>
                  <span className="text-indigo-500">0.42</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-indigo-300 h-3 rounded-full" style={{ width: "65%" }}></div>
                </div>
              </div>

              {/* Border */}
              <div className="border-t border-dashed border-slate-300 my-4 relative">
                <span className="absolute top-[-10px] left-1/2 transform -translate-x-1/2 bg-white px-2 text-[10px] text-slate-400 font-bold whitespace-nowrap">
                  超えられない壁 (時代遅れ)
                </span>
              </div>

              {/* Rank 4: Old SPI */}
              <div className="opacity-60">
                <div className="flex justify-between text-sm font-bold mb-1">
                  <span className="text-slate-500">旧来の能力検査 (SPI等)</span>
                  <span className="text-slate-500">0.31</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-slate-400 h-3 rounded-full" style={{ width: "40%" }}></div>
                </div>
              </div>
               {/* Rank 5: MBTI */}
               <div className="opacity-40">
                <div className="flex justify-between text-sm font-bold mb-1">
                  <span className="text-slate-500">タイプ論 (MBTI等)</span>
                  <span className="text-slate-500">測定不能</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-slate-300 h-3 rounded-full" style={{ width: "5%" }}></div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

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

export default function BusinessPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans w-full overflow-x-hidden">
      <Header />
      
      <main className="flex-1">
        
        {/* --- Hero: 恐怖訴求 --- */}
        <section id="top" className="relative py-24 bg-slate-900 overflow-hidden scroll-mt-24">
          {/* 背景装飾 */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[200px] h-[200px] md:w-[500px] md:h-[500px] bg-indigo-500 rounded-full blur-[80px] md:blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[200px] h-[200px] md:w-[500px] md:h-[500px] bg-blue-500 rounded-full blur-[80px] md:blur-[120px]" />
          </div>
          <div className="container relative z-10 px-4 mx-auto text-center max-w-5xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full text-sm font-bold mb-8">
              <AlertTriangle className="w-4 h-4" />
              経営者・人事責任者向け
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-8">
              採用ミス1人あたり、<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                最大 1億2,000万円
              </span>
              の損失。
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              「感覚人事」の代償は甚大です。<br/>
              早期離職、組織崩壊、そして法的リスク。<br/>
              Kage OSは、あなたの会社を「3つの防壁」で科学的に守ります。
            </p>
            <a href="#pricing" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-slate-900 bg-white rounded-xl hover:bg-slate-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
              防衛プランを見る <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </div>
        </section>

        {/* --- インタラクティブな統合セクション (損失 + ソリューション + 写真) --- */}
        <InteractiveWallSection />

        {/* --- Kage vs 旧来テスト比較セクション --- */}
        <ScienceComparison />

        {/* デモ動画 (いつでも復活できるようにコメントアウト) */}
        {/* <section id="demo-video" className="py-16 bg-slate-900 text-white">
          <div className="container px-4 max-w-5xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-8">実際の画面を見る (30秒デモ)</h2>
            <div className="relative w-full aspect-video bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center overflow-hidden shadow-2xl">
              <p className="text-slate-500">ここにYouTube動画が入ります</p>
            </div>
          </div>
        </section>
        */}

        {/* 科学的根拠セクション */}
        <ScienceGrid />

        {/* Pricing (既存のものを流用) */}
        <div id="pricing">
          <Pricing />
        </div>
        
        {/* モーダル本体の配置 */}
        <EvidenceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </main>
      <Footer />
    </div>
  );
}
