"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const schema = z.object({
  organizationName: z.string().min(1, "法人名を入力してください"),
  email: z.string().email("メールアドレスの形式が正しくありません"),
  password: z.string().min(6, "6文字以上のパスワードを設定してください"),
});

export default function SignupB2BPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState<boolean>(!!supabase);

  useEffect(() => {
    setReady(!!supabase);
  }, []);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { organizationName: "", email: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    if (!supabase) {
      setError("Supabaseクライアントが初期化されていません。環境変数設定を確認してください。");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. ユーザー登録
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/login`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError("ユーザー登録に失敗しました");
        setLoading(false);
        return;
      }

      // 2. 組織を作成
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .insert({
          name: values.organizationName,
          owner_id: authData.user.id, // 作成者ID（owner_id）を追加
        })
        .select()
        .single();

      if (orgError) {
        setError(`組織の作成に失敗しました: ${orgError.message}`);
        setLoading(false);
        return;
      }

      // 3. 組織メンバーとして登録（adminロール）
      const { error: memberError } = await supabase
        .from("organization_members")
        .insert({
          organization_id: orgData.id,
          user_id: authData.user.id,
          role: "admin",
        });

      if (memberError) {
        setError(`組織メンバーの登録に失敗しました: ${memberError.message}`);
        setLoading(false);
        return;
      }

      // 4. プロフィールはトリガー関数で自動作成されるが、user_typeを'corporate'に更新する
      // トリガー関数が正常に動作するまで少し待つ
      await new Promise((resolve) => setTimeout(resolve, 500));

      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          user_type: "corporate",
        })
        .eq("id", authData.user.id);

      if (profileUpdateError) {
        setError(`プロフィールの更新に失敗しました: ${profileUpdateError.message}`);
        setLoading(false);
        return;
      }

      // 登録成功後、組織ダッシュボードへリダイレクト
      router.push(`/organization/${orgData.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "予期しないエラーが発生しました");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-background p-8 shadow-sm">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold text-foreground">法人向け 新規登録</h1>
            <p className="text-sm text-muted-foreground">
              法人情報と管理者アカウントを設定してください。確認メールが送信されます。
            </p>
          </div>

          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="organizationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>法人名</FormLabel>
                    <FormControl>
                      <Input placeholder="株式会社Example" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>管理者メールアドレス</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>パスワード</FormLabel>
                    <FormControl>
                      <Input placeholder="********" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading || !ready}>
                {loading ? "登録中..." : "法人アカウントを作成"}
              </Button>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </form>
          </Form>

          <p className="text-center text-xs text-muted-foreground">
            すでにアカウントをお持ちですか？
            <Link href="/auth/login" className="ml-1 underline">
              ログイン
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

