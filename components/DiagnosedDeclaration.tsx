"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export function DiagnosedDeclaration({ 
  userId, 
  initialStatus, 
  initialDetails 
}: { 
  userId: string; 
  initialStatus: string; 
  initialDetails: any; 
}) {
  const router = useRouter();
  const [isDeclared, setIsDeclared] = useState(initialStatus === 'declared');
  const [diagnosisName, setDiagnosisName] = useState(initialDetails?.diagnosis || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData = {
        diagnosed_status: isDeclared ? 'declared' : 'not_declared',
        diagnosed_details: isDeclared ? { diagnosis: diagnosisName } : null,
      };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId);

      if (error) throw error;

      alert("設定を保存しました。");
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-8 border-l-4 border-l-blue-500 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">診断状況の申告（任意）</CardTitle>
        <CardDescription>
          医師による診断を受けている場合、ここをONにすることで、AIが「障害者雇用促進法」などの法的根拠に基づいた強力なアドバイスを行います。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="diagnosis-mode"
            checked={isDeclared}
            onCheckedChange={setIsDeclared}
          />
          <Label htmlFor="diagnosis-mode" className="font-bold cursor-pointer">
            私は医師による診断を受けています
          </Label>
        </div>
        {isDeclared && (
          <div className="pl-4 border-l-2 border-slate-200 space-y-3 animate-in fade-in slide-in-from-top-2">
             <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="diagnosis">診断名 / 特性名</Label>
              <Input
                id="diagnosis"
                placeholder="例: ASD, ADHD, 聴覚過敏など"
                value={diagnosisName}
                onChange={(e) => setDiagnosisName(e.target.value)}
              />
            </div>
            <p className="text-xs text-slate-500">
               ※この情報はAIのプロンプト生成（デュアル・トラック）にのみ使用され、許可なく公開されることはありません。
            </p>
          </div>
        )}
        
        <Button onClick={handleSave} disabled={loading} size="sm" className="mt-2">
          {loading ? "保存中..." : "設定を保存"}
        </Button>
      </CardContent>
    </Card>
  );
}

