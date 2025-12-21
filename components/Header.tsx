"use client";

import { usePathname, useSearchParams } from "next/navigation";

import { SoloHeader } from "@/components/SoloHeader";

import { OrgHeader } from "@/components/OrgHeader";

import { Suspense } from "react";

function HeaderContent() {

  const pathname = usePathname();

  const searchParams = useSearchParams();

  

  // 法人ヘッダーを出す条件（厳格化）

  // 1. URLが /business から始まる

  // 2. 法人登録画面 (/auth/signup-b2b)

  // 3. ログイン画面で ?type=business がある

  // 個人のダッシュボード(/dashboard)などは除外される

  const isBusinessContext = 

    pathname?.startsWith("/business") || 

    pathname?.startsWith("/auth/signup-b2b") || 

    searchParams.get("type") === "business";

  if (isBusinessContext) {

    return <OrgHeader />;

  }

  // それ以外（トップページ、/dashboard、/auth/login(パラメータなし)など）は個人用

  return <SoloHeader />;

}

export function Header() {

  return (

    <Suspense fallback={<SoloHeader />}>

      <HeaderContent />

    </Suspense>

  );

}
