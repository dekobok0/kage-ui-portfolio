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

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { Input } from "@/components/ui/input";

const schema = z.object({

  email: z.string().email("メールアドレスの形式が正しくありません"),

  password: z.string().min(1, "パスワードを入力してください"),

});

// ロジックを別のコンポーネント（LoginContent）として切り出す

function LoginContent() {

  const router = useRouter();

  const searchParams = useSearchParams();

  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const [ready, setReady] = useState<boolean>(false);

  const isBusinessLogin = searchParams.get("type") === "business";

  useEffect(() => {

    if (!supabase) return;

    setReady(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {

      if (event === 'SIGNED_IN' && session) {

        setLoading(true);

        

        // ユーザーの正体（個人 or 法人）をDBに問い合わせる

        const { data: profile } = await supabase

          .from("profiles")

          .select("user_type")

          .eq("id", session.user.id)

          .single();

        

        const userType = profile?.user_type || "individual";

        if (isBusinessLogin && userType === "individual") {

          await supabase.auth.signOut();

          setError("個人アカウントでは法人ページからログインできません。トップページからログインしてください。");

          setLoading(false);

          return; 

        }

        if (isBusinessLogin) {

             router.replace("/business"); 

        } else {

             router.replace("/dashboard"); 

        }

      }

    });

    return () => subscription.unsubscribe();

  }, [router, isBusinessLogin]);

  const form = useForm<z.infer<typeof schema>>({

    resolver: zodResolver(schema),

    defaultValues: { email: "", password: "" },

  });

  const onSubmit = async (values: z.infer<typeof schema>) => {

    setLoading(true);

    setError(null);

    

    const { error: signInError } = await supabase.auth.signInWithPassword({

      email: values.email,

      password: values.password,

    });

    if (signInError) {

      setError(signInError.message);

      setLoading(false);

    }

  };

  return (

    <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-background p-8 shadow-sm">

      <div className="space-y-2 text-center">

        <h1 className="text-2xl font-semibold text-foreground">

          {isBusinessLogin ? "法人ログイン" : "ログイン"}

        </h1>

        <p className="text-sm text-muted-foreground">

          {isBusinessLogin 

            ? "法人アカウント情報を入力してください" 

            : "登録済みのメールアドレスとパスワードでサインインしてください"}

        </p>

      </div>

      

      {error && (

        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm font-bold">

          {error}

        </div>

      )}

      <Form {...form}>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>

          <FormField

            control={form.control}

            name="email"

            render={({ field }) => (

              <FormItem>

                <FormLabel>メールアドレス</FormLabel>

                <FormControl><Input placeholder="you@example.com" type="email" {...field} /></FormControl>

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

                <FormControl><Input type="password" placeholder="********" {...field} /></FormControl>

                <FormMessage />

              </FormItem>

            )}

          />

          <Button type="submit" className="w-full" disabled={loading || !ready}>

            {loading ? "認証中..." : "ログイン"}

          </Button>

        </form>

      </Form>

      

      <p className="text-center text-xs text-muted-foreground">

        {isBusinessLogin ? (

           <span>法人アカウントをお持ちでない場合は <Link href="/auth/signup-b2b" className="ml-1 underline">法人登録</Link> へ。</span>

        ) : (

           <span>アカウントをお持ちでない場合は <Link href="/auth/signup" className="ml-1 underline">新規登録</Link> へ。</span>

        )}

      </p>

    </div>

  );

}

// デフォルトエクスポートで Suspense で包む

export default function LoginPage() {

  return (

    <div className="flex min-h-screen flex-col bg-background">

      <Header />

      <main className="flex flex-1 items-center justify-center px-6 py-16">

        <Suspense fallback={<div>Loading...</div>}>

          <LoginContent />

        </Suspense>

      </main>

      <Footer />

    </div>

  );

}
