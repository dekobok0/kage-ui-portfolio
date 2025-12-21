"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ShieldCheck, UploadCloud } from "lucide-react";

export default function DeclarationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isDiagnosed, setIsDiagnosed] = useState(false);
  const [diagnosisName, setDiagnosisName] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 初期データ取得
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("diagnosed_status, diagnosed_details")
        .eq("id", user.id)
        .single();

      if (data) {
        setIsDiagnosed(data.diagnosed_status === "declared");
        if (data.diagnosed_details) {
          const details = data.diagnosed_details as any;
          setDiagnosisName(details.diagnosis || "");
          setNotes(details.notes || "");
        }
      }

      setLoading(false);
    };

    loadProfile();
  }, []);

  // 保存処理
  const handleSave = async () => {
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const status = isDiagnosed ? "declared" : "not_declared";
    const details = isDiagnosed ? { diagnosis: diagnosisName, notes: notes } : null;

    const { error } = await supabase
      .from("profiles")
      .update({
        diagnosed_status: status,
        diagnosed_details: details,
        // ※ファイルアップロード機能は別途実装が必要ですが、まずはステータス保存を優先
      })
      .eq("id", user.id);

    if (error) {
      alert("保存に失敗しました");
    } else {
      router.push("/dashboard"); // 保存したら戻る
    }

    setIsSaving(false);
  };

  if (loading) return <div className="p-8 text-center">読み込み中...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center items-start pt-10 px-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-slate-900">医療的根拠の申告 (Track B)</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>医師による診断状況</CardTitle>
                <CardDescription className="mt-2">
                  医師からの診断を受けている場合、ここをオンにしてください。<br />
                  AIが「法的根拠に基づいた支援モード（Track B）」に切り替わります。
                </CardDescription>
              </div>
              <ShieldCheck className={`w-12 h-12 ${isDiagnosed ? "text-indigo-600" : "text-slate-200"}`} />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* メインスイッチ */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="space-y-1">
                <Label htmlFor="diagnosis-mode" className="text-base font-bold">医師による診断を受けていますか？</Label>
                <p className="text-xs text-slate-500">この情報は厳密に管理され、AIの支援精度向上のためにのみ使用されます。</p>
              </div>
              <Switch
                id="diagnosis-mode"
                checked={isDiagnosed}
                onCheckedChange={setIsDiagnosed}
              />
            </div>

            {/* 詳細入力エリア（ONの時だけ表示） */}
            {isDiagnosed && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-3">
                  <Label>診断名（例：ASD、ADHD、聴覚情報処理障害など）</Label>
                  <Input 
                    placeholder="診断名を入力してください" 
                    value={diagnosisName}
                    onChange={(e) => setDiagnosisName(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label>配慮が必要な点・特記事項</Label>
                  <Textarea 
                    placeholder="医師から言われていることや、職場で配慮してほしいことがあれば記入してください。"
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2 bg-slate-50/50">
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-medium text-slate-600">障害者手帳や診断書の画像（任意）</p>
                  <p className="text-xs text-slate-400">※現在はプレビュー機能のため、アップロードはスキップされます</p>
                  <Button variant="outline" size="sm" disabled>ファイルを選択</Button>
                </div>
              </div>
            )}

            <div className="pt-4">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "保存中..." : "設定を保存して戻る"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

