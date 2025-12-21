"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabaseClient";

import { AiPlayground } from "@/components/AiPlayground";

// 型定義

type Organization = {

  id: string;

  name: string;

  created_at: string | null;

};

type OrganizationMember = {

  user_id: string;

  role: string;

  profiles: { email: string } | null;

};

type SubscriptionRow = {

  status: string;

  current_period_end: string | null;

};

export default function OrganizationDashboardPage({

  params,

}: {

  params: { orgId: string };

}) {

  const router = useRouter();

  const { orgId } = params;

  const [organization, setOrganization] = useState<Organization | null>(null);

  const [members, setMembers] = useState<OrganizationMember[]>([]);

  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadData = async () => {

      // 1. 組織情報の取得

      const { data: orgData } = await supabase

        .from("organizations")

        .select("id, name, created_at")

        .eq("id", orgId)

        .maybeSingle();

      if (orgData) setOrganization(orgData as Organization);

      // 2. メンバーの取得

      const { data: membersData } = await supabase

        .from("organization_members")

        .select(`user_id, role, profiles ( email )`)

        .eq("organization_id", orgId);

      if (membersData) {

        setMembers(

          membersData.map((m: any) => ({

            user_id: m.user_id,

            role: m.role,

            profiles: m.profiles,

          }))

        );

      }

      // 3. サブスク状態 (簡易チェック)

      const { data: { session } } = await supabase.auth.getSession();

      if (session) {

        const { data: subData } = await supabase

          .from("subscriptions")

          .select("status, current_period_end")

          .eq("user_id", session.user.id)

          .in("status", ["active", "trialing", "past_due"])

          .order("current_period_end", { ascending: false })

          .limit(1)

          .maybeSingle();

        if (subData) setSubscription(subData);

      }

      setLoading(false);

    };

    loadData();

  }, [orgId]);

  if (loading) {

    return (

      <div className="flex items-center justify-center py-12">

        <div className="flex flex-col items-center gap-3">

          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>

          <span className="text-sm text-slate-500">データを取得中...</span>

        </div>

      </div>

    );

  }

  if (!organization) {

    return (

      <div className="flex items-center justify-center py-12">

        <p className="text-slate-600">組織データが見つかりません</p>

      </div>

    );

  }

  return (

    <div className="space-y-8">

      {/* ヘッダーセクション */}

      <div className="flex items-center justify-between border-b border-slate-200 pb-6">

        <div>

          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">

            Organization Dashboard

          </span>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">{organization.name}</h1>

          <p className="text-sm text-slate-500">

            Created: {organization.created_at ? new Date(organization.created_at).toLocaleDateString() : 'N/A'}

          </p>

        </div>

        <div className="flex items-center gap-3">

          <span

            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${

              subscription ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"

            }`}

          >

            ● {subscription?.status ?? "Free / Inactive"} Plan

          </span>

        </div>

      </div>

      {/* グリッドレイアウト */}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* 左: メンバーリスト */}

        <div className="lg:col-span-1">

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">

              <h3 className="font-semibold text-slate-900">チームメンバー</h3>

            </div>

            <ul className="divide-y divide-slate-100">

              {members.map((member) => (

                <li key={member.user_id} className="flex items-center justify-between px-4 py-3">

                  <div className="flex items-center gap-3">

                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">

                      {member.profiles?.email?.slice(0, 2).toUpperCase() ?? "??"}

                    </div>

                    <div className="flex flex-col">

                      <span className="text-sm font-medium text-slate-900 truncate max-w-[120px]">

                        {member.profiles?.email}

                      </span>

                      <span className="text-xs text-slate-500 capitalize">{member.role}</span>

                    </div>

                  </div>

                </li>

              ))}

            </ul>

          </div>

        </div>

        {/* 右: AIプレイグラウンド */}

        <div className="lg:col-span-2 space-y-6">

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <h3 className="mb-4 text-lg font-bold text-slate-900">法人向け AI ワークスペース</h3>

            <p className="mb-6 text-sm text-slate-600">

              組織プランでは高度なモデルと共有履歴が利用可能です。

            </p>

            <AiPlayground />

          </div>

        </div>

      </div>

    </div>

  );

}
