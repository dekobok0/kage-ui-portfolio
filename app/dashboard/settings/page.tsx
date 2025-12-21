"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/auth/login");
        return;
      }

      setEmail(session.user.email || "");

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
        
      setProfile(data);
      setLoading(false);
    };

    init();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/auth/login");
    router.refresh();
  };


  if (loading) return <div className="p-8">読み込み中...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">設定・プロフィール</h1>
        <p className="text-slate-500 mt-1">アカウント情報と表示設定を管理します。</p>
      </div>

      {/* 基本情報 */}
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
          <CardDescription>企業や他のユーザーに表示される情報です。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500">
              {email[0]?.toUpperCase()}
            </div>
            <Button variant="outline" size="sm">写真を変更</Button>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" value={email} disabled className="bg-slate-50" />
            <p className="text-xs text-slate-500">メールアドレスの変更は管理者に問い合わせてください。</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">表示名（氏名）</Label>
            <Input id="name" placeholder="氏名を入力" defaultValue={profile?.full_name || ""} />
          </div>

          <Button>変更を保存</Button>
        </CardContent>
      </Card>

      {/* アカウント管理 */}
      <Card>
        <CardHeader>
          <CardTitle>アカウント管理</CardTitle>
        </CardHeader>
        <CardContent>
           <Button variant="destructive" size="sm" onClick={handleLogout}>ログアウト</Button>
        </CardContent>
      </Card>
    </div>
  );
}
