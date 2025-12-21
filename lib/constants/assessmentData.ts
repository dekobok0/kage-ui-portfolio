// lib/constants/assessmentData.ts

export type Question = {
  id: string;
  text: string;
  category: string;
  scoringType: "positive" | "negative";
};

export type AssessmentDef = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  academicSource: string;
  timeEstimate: string;
  questions: Question[];
};

// 必須IDの定義（ここにあるものが終われば登録可能）
export const MANDATORY_ASSESSMENT_IDS = ["hexaco", "kai", "osivq"];

// ===================================================================
// ※ポートフォリオ用: 実際の質問データは非公開です
// ここではUI構造を示すため、ダミーデータを使用しています
// 本番環境では科学的に検証された質問セットを使用します
// ===================================================================

export const ASSESSMENTS: AssessmentDef[] = [
  // ====================================================================
  // 【必須】 1. 性格特性 (HEXACO)
  // ====================================================================
  {
    id: "hexaco",
    title: "性格特性 (HEXACO)",
    subtitle: "Core Personality",
    description: "「正直・謙虚さ」を含む6つの主要な性格因子を測定します。",
    academicSource: "Ref: IPIP-HEXACO Scales (24-item inventory)",
    timeEstimate: "約3分",
    questions: [
      // ダミー質問（実際の質問内容は非公開）
      { id: "h1", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Honesty-Humility", scoringType: "positive" },
      { id: "h2", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Honesty-Humility", scoringType: "positive" },
      { id: "e1", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Emotionality", scoringType: "positive" },
      { id: "e2", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Emotionality", scoringType: "positive" },
      { id: "x1", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Extraversion", scoringType: "positive" },
      { id: "x2", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Extraversion", scoringType: "positive" },
      { id: "a1", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Agreeableness", scoringType: "positive" },
      { id: "a2", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Agreeableness", scoringType: "positive" },
      { id: "c1", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Conscientiousness", scoringType: "positive" },
      { id: "c2", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Conscientiousness", scoringType: "positive" },
      { id: "o1", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Openness", scoringType: "positive" },
      { id: "o2", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Openness", scoringType: "positive" },
    ]
  },
  // ====================================================================
  // 【必須】 2. 問題解決スタイル (KAI)
  // ====================================================================
  {
    id: "kai",
    title: "思考スタイル (KAI)",
    subtitle: "Adaption-Innovation",
    description: "既存の枠組みを「改善」するか「刷新」するかを判定します。",
    academicSource: "Ref: KAI Theory (Short Form)",
    timeEstimate: "約1分",
    questions: [
      { id: "k1", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Adaption", scoringType: "positive" },
      { id: "k2", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Innovation", scoringType: "positive" },
    ]
  },
  // ====================================================================
  // 【必須】 3. 認知スタイル (OSIVQ)
  // ====================================================================
  {
    id: "osivq",
    title: "認知・学習タイプ",
    subtitle: "Visual / Verbal",
    description: "情報を「映像」で処理するか「言語」で処理するかを判定します。",
    academicSource: "Ref: OSIVQ Model (Object-Spatial-Verbal)",
    timeEstimate: "約1分",
    questions: [
      { id: "o1", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Object", scoringType: "positive" },
      { id: "s1", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Spatial", scoringType: "positive" },
      { id: "v1", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Verbal", scoringType: "positive" },
    ]
  },
  // ====================================================================
  // 【任意】 4. 注意特性 (ASRS)
  // ====================================================================
  {
    id: "asrs",
    title: "注意・集中スタイル",
    subtitle: "Optional / WHO ASRS",
    description: "不注意や衝動性の傾向をチェックします（任意）。",
    academicSource: "Source: WHO ASRS-v1.1",
    timeEstimate: "約1分",
    questions: [
      { id: "as1", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Inattention", scoringType: "positive" },
      { id: "as2", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Hyperactivity", scoringType: "positive" },
    ]
  },
  // ====================================================================
  // 【任意】 5. 社会性特性 (AQ)
  // ====================================================================
  {
    id: "aq",
    title: "社会性・交流特性",
    subtitle: "Optional / AQ Short",
    description: "対人関係やこだわり、パターン認識の傾向を測定します（任意）。",
    academicSource: "Ref: AQ-10 (Short Form)",
    timeEstimate: "約1分",
    questions: [
      { id: "aq1", text: "これはサンプル質問です（実際の質問は非公開）。", category: "SocialSkill", scoringType: "positive" },
      { id: "aq2", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Details", scoringType: "positive" },
    ]
  },
  // ====================================================================
  // 【任意】 6. 感覚特性 (Sensory)
  // ====================================================================
  {
    id: "sensory",
    title: "感覚・感受性",
    subtitle: "Optional / HSP Scale",
    description: "音、光、肌触りなどの感覚刺激に対する敏感さを測定します（任意）。",
    academicSource: "Ref: HSP Scale (Short)",
    timeEstimate: "約1分",
    questions: [
      { id: "sn1", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Auditory", scoringType: "positive" },
      { id: "sn2", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Aesthetic", scoringType: "positive" },
    ]
  }
];
