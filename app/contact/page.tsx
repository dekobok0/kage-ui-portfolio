"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/lib/siteConfig";
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
import { Textarea } from "@/components/ui/textarea";

const contactSchema = z.object({
  name: z.string().min(1, "お名前を入力してください"),
  email: z.string().email("メールアドレスの形式が正しくありません"),
  message: z.string().min(1, "お問い合わせ内容を入力してください"),
});

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof contactSchema>) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const payload = (await res.json()) as { error?: string };
        throw new Error(payload.error ?? "送信に失敗しました");
      }

      form.reset();
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              ホーム
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">お問い合わせ</span>
          </div>

          <div className="rounded-3xl border border-border bg-background p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-foreground">{siteConfig.contact.title}</h1>
            <p className="mt-3 text-sm text-muted-foreground">{siteConfig.contact.description}</p>

            {submitted ? (
              <div className="mt-8 space-y-4 rounded-xl border border-border bg-slate-50 p-6 text-sm text-slate-600">
                <p className="text-base font-semibold text-slate-900">
                  {siteConfig.contact.successHeadline}
                </p>
                <p>{siteConfig.contact.successMessage}</p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="rounded-full">
                    <Link href="/">ホームへ戻る</Link>
                  </Button>
                  <a
                    href={`mailto:${siteConfig.contactEmail}`}
                    className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-800 transition hover:border-slate-500 hover:text-slate-600"
                  >
                    直接メールする
                  </a>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form className="mt-8 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>お名前</FormLabel>
                        <FormControl>
                          <Input placeholder="山田 太郎" {...field} />
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
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>お問い合わせ内容</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="導入時期やご質問事項を記入してください。"
                            rows={6}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? "送信中..." : siteConfig.contact.submitLabel}
                  </Button>
                  {error ? <p className="text-sm text-destructive">{error}</p> : null}
                </form>
              </Form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
