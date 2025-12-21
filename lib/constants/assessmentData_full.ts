// lib/constants/assessmentData_full.ts
// ===================================================================
// ※ポートフォリオ用: 実際の質問データは非公開です
// ここではUI構造を示すため、ダミーデータを使用しています
// 本番環境では科学的に検証された完全版質問セット（143問）を使用します
// ===================================================================

import type { AssessmentDef } from "./assessmentData";

// 完全版のID定義
export const FULL_ASSESSMENT_IDS = ["hexaco", "kai", "osivq"];

export const FULL_ASSESSMENTS: AssessmentDef[] = [
  // ====================================================================
  // 1. 性格特性 (HEXACO-66 Full) - ダミー版
  // ====================================================================
  {
    id: "hexaco",
    title: "性格特性診断 (Professional)",
    subtitle: "HEXACO-66 Full Inventory",
    description: "採用選考・配置のための精密な性格分析を行います（66項目）。",
    academicSource: "Ref: Ashton & Lee (2009). The HEXACO-60: A Short Group Administration.",
    timeEstimate: "約10分",
    questions: [
      // ダミー質問（実際は66問の精密な質問セット）
      { id: "h1", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Honesty-Humility", scoringType: "positive" },
      { id: "h2", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Honesty-Humility", scoringType: "positive" },
      { id: "h3", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Honesty-Humility", scoringType: "positive" },
      { id: "h4", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Honesty-Humility", scoringType: "positive" },
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
  // 2. 問題解決スタイル (KAI-32 Full) - ダミー版
  // ====================================================================
  {
    id: "kai",
    title: "思考スタイル (Professional)",
    subtitle: "KAI-32 Full Inventory",
    description: "問題解決における適応・革新傾向の精密測定（32項目）。",
    academicSource: "Ref: Kirton (2003). Adaption-Innovation Theory.",
    timeEstimate: "約5分",
    questions: [
      // ダミー質問（実際は32問の詳細な質問セット）
      { id: "k1", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Innovation", scoringType: "positive" },
      { id: "k2", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Innovation", scoringType: "positive" },
      { id: "k3", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Adaption", scoringType: "positive" },
      { id: "k4", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Adaption", scoringType: "positive" },
    ]
  },
  // ====================================================================
  // 3. 認知スタイル (OSIVQ-45 Full) - ダミー版
  // ====================================================================
  {
    id: "osivq",
    title: "認知・学習タイプ (Professional)",
    subtitle: "OSIVQ-45 Full Inventory",
    description: "視覚・空間・言語情報処理の精密分析（45項目）。",
    academicSource: "Ref: Blazhenkova & Kozhevnikov (2009). Object-Spatial-Verbal Cognitive Styles.",
    timeEstimate: "約7分",
    questions: [
      // ダミー質問（実際は45問の詳細な質問セット）
      { id: "o1", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Object", scoringType: "positive" },
      { id: "o2", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Object", scoringType: "positive" },
      { id: "s1", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Spatial", scoringType: "positive" },
      { id: "s2", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Spatial", scoringType: "positive" },
      { id: "v1", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Verbal", scoringType: "positive" },
      { id: "v2", text: "これはサンプル質問です（実際の質問は非公開）。", category: "Verbal", scoringType: "positive" },
    ]
  },
];
