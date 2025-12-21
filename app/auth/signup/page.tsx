"use client";

import Link from "next/link";

import { useEffect, useState, Suspense } from "react";

import { useForm } from "react-hook-form";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import { useRouter, useSearchParams } from "next/navigation";

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
import { CheckCircle2, Loader2 } from "lucide-react";

const schema = z.object({

  email: z.string().email("メールアドレスの形式が正しくありません"),

  password: z.string().min(6, "6文字以上のパスワードを設定してください"),

  company: z.string().optional(),

});

// ロジック部分を別コンポーネントとして分離

function SignupContent() {

  const router = useRouter();

  const searchParams = useSearchParams(); 

  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const [ready, setReady] = useState<boolean>(!!supabase);

  const redirectPath = searchParams.get("redirect") || "/dashboard";
  
  // テスト結果を保存するための登録かどうかを判定
  const hasAssessmentData = searchParams.get("source") === "personal_assessment";

  useEffect(() => {

    setReady(!!supabase);

  }, []);

  const form = useForm<z.infer<typeof schema>>({

    resolver: zodResolver(schema),

    defaultValues: { email: "", password: "", company: "" },

  });

  const handleGoogleLogin = async () => {

    if (!supabase) return;

    const origin = window.location.origin;

    const fullRedirectUrl = `${origin}${redirectPath}`;

    

    await supabase.auth.signInWithOAuth({

      provider: 'google',

      options: {

        redirectTo: fullRedirectUrl,

      },

    });

  };

  const onSubmit = async (values: z.infer<typeof schema>) => {

    if (!supabase) {

      setError("Supabaseクライアントが初期化されていません。");

      return;

    }

    setLoading(true);

    setError(null);

    try {

      const { data: authData, error: signUpError } = await supabase.auth.signUp({

        email: values.email,

        password: values.password,

        options: {

          data: {

            company: values.company ?? "",
            user_type: "individual", // 個人ユーザーとして登録

          },

          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`,

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

      await new Promise((resolve) => setTimeout(resolve, 500));

      if (authData.session) {

        router.push(redirectPath);

      } else {

        setError("確認メールを送信しました。メール内のリンクをクリックしてください。");

      }

    } catch (err) {

      setError(err instanceof Error ? err.message : "予期しないエラーが発生しました");

      setLoading(false);

    }

  };

  return (

    <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-background p-8 shadow-sm">

      <div className="space-y-2 text-center">

        <h1 className="text-2xl font-semibold text-foreground">アカウント作成</h1>

        {/* テスト結果がある場合の特別表示 */}
        {hasAssessmentData && (
          <div className="mt-4 p-3 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold flex items-center gap-2 justify-center border border-indigo-100 animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4" />
            診断結果を保存する準備ができました
          </div>
        )}

        <p className="text-sm text-muted-foreground mt-2">

          {hasAssessmentData 
            ? "結果を保存して閲覧するために、アカウントを作成してください。" 
            : "メールアドレスで無料で開始できます。"}

        </p>

      </div>

      <div className="grid gap-2">

        <Button 

          variant="outline" 

          type="button" 

          onClick={handleGoogleLogin}

          disabled={!ready}

          className="w-full"

        >

          Googleで登録/ログイン

        </Button>

      </div>

      <div className="relative">

        <div className="absolute inset-0 flex items-center">

          <span className="w-full border-t" />

        </div>

        <div className="relative flex justify-center text-xs uppercase">

          <span className="bg-background px-2 text-muted-foreground">

            または メールで登録

          </span>

        </div>

      </div>

      <Form {...form}>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>

          <FormField

            control={form.control}

            name="email"

            render={({ field }) => (

              <FormItem>

                <FormLabel>メールアドレス</FormLabel>

                <FormControl>

                  <Input placeholder="you@example.com" type="email" {...field} />

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

          <FormField

            control={form.control}

            name="company"

            render={({ field }) => (

              <FormItem>

                <FormLabel>会社名 / プロジェクト名（任意）</FormLabel>

                <FormControl>

                  <Input placeholder="Example Inc." {...field} />

                </FormControl>

                <FormMessage />

              </FormItem>

            )}

          />

          <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={loading || !ready}>

            {loading ? (
              <>
                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                登録中...
              </>
            ) : hasAssessmentData ? "アカウントを作成して保存" : "メールで登録"}

          </Button>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

        </form>

      </Form>

      <p className="text-center text-xs text-muted-foreground">

        すでにアカウントをお持ちですか？

        <Link href={`/auth/login?redirect=${encodeURIComponent(redirectPath)}`} className="ml-1 underline">

          ログイン

        </Link>

      </p>

    </div>

  );

}

// メインコンポーネントでSuspenseを使ってラップする

// これにより「読み込み中は中身を表示しない」とNext.jsに明示できるため、ビルドエラーが消えます。

export default function SignupPage() {

  return (

    <div className="flex min-h-screen flex-col bg-background">

      <Header />

      <main className="flex flex-1 items-center justify-center px-6 py-16">

        <Suspense fallback={<div>読み込み中...</div>}>

          <SignupContent />

        </Suspense>

      </main>

      <Footer />

    </div>

  );

}
