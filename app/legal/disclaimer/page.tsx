"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">
          法的免責事項と合理的配慮について
        </h1>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-900">1. 本サービスの位置付け</h2>
            <p className="text-slate-600 leading-relaxed">
              Kage（以下「本サービス」）で作成・共有される「特性シート」や「配慮ログ」は、ユーザー個人の主観およびAIによる分析に基づく参考情報です。
              これらは<strong>医師による診断書、鑑定書、または公的な証明書ではありません。</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">2. 企業の法的義務について</h2>
            <p className="text-slate-600 leading-relaxed">
              障害者雇用促進法の改正により、事業主には「合理的配慮の提供」が義務付けられています。
              しかし、個人が持参したメモや口頭での申し出だけでは、企業側が「どのようなプロセスで合意形成したか」を証明することが難しく、
              言った言わないのトラブルに発展するリスクがあります。
            </p>
          </section>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 my-8">
            <h3 className="text-lg font-bold text-amber-900 mb-2">
              ⚠️ 法的リスクを回避するために
            </h3>
            <p className="text-amber-800 text-sm mb-4">
              従業員との対話履歴、配慮内容の合意、定期的な見直しの記録を
              <strong>「改ざん不可能なログ」</strong>として残すことが、企業を守る最も有効な手段です。
            </p>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/auth/signup-b2b">
                Kage 法人プランで記録を管理する
              </Link>
            </Button>
          </div>

          <section>
            <h2 className="text-xl font-bold text-slate-900">3. 医療行為の否定</h2>
            <p className="text-slate-600 leading-relaxed">
              本サービスは医療行為を提供するものではありません。健康状態や障害の診断については、必ず専門の医師にご相談ください。
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

