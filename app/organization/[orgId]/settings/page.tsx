"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabaseClient";

import { Settings, CreditCard, Trash2 } from "lucide-react";

export default function SettingsPage({ params }: { params: { orgId: string } }) {

  const { orgId } = params;

  const [orgName, setOrgName] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchOrg = async () => {

      const { data } = await supabase

        .from("organizations")

        .select("name")

        .eq("id", orgId)

        .single();

      if (data) setOrgName(data.name);

      setLoading(false);

    };

    fetchOrg();

  }, [orgId]);

  const updateName = async () => {

    const newName = prompt("新しい組織名を入力してください", orgName);

    if (newName && newName !== orgName) {

      const { error } = await supabase

        .from("organizations")

        .update({ name: newName })

        .eq("id", orgId);

      if (!error) setOrgName(newName);

    }

  };

  if (loading) return <div className="p-8">読み込み中...</div>;

  return (

    <div className="space-y-8">

      <div>

        <h1 className="text-2xl font-bold text-slate-900">Organization Settings</h1>

        <p className="text-slate-500">組織の基本設定と契約管理</p>

      </div>

      {/* 基本設定 */}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">

        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">

          <Settings className="w-5 h-5" /> 基本情報

        </h3>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">

          <div>

            <p className="text-xs text-slate-500 font-bold uppercase">Organization Name</p>

            <p className="font-medium text-slate-900">{orgName}</p>

          </div>

          <button 

            onClick={updateName}

            className="text-sm bg-white border border-slate-300 px-3 py-1.5 rounded hover:bg-slate-50 text-slate-700"

          >

            変更

          </button>

        </div>

      </div>

      {/* 契約・プラン (プレースホルダー) */}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">

        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">

          <CreditCard className="w-5 h-5" /> 契約プラン

        </h3>

        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 flex justify-between items-center">

          <div>

            <p className="text-sm font-bold text-indigo-900">現在のプラン: Free Trial</p>

            <p className="text-xs text-indigo-700">有効期限: 2025/12/31</p>

          </div>

          <button className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700">

            プランを変更

          </button>

        </div>

      </div>

      {/* 危険なエリア */}

      <div className="border border-red-200 rounded-xl p-6 bg-red-50/50">

        <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">

          <Trash2 className="w-5 h-5" /> Danger Zone

        </h3>

        <p className="text-sm text-red-700 mb-4">

          この組織を削除すると、すべてのメンバー、HEXACOデータ、配慮ログが永久に削除されます。

        </p>

        <button className="text-sm bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-bold">

          組織を削除する

        </button>

      </div>

    </div>

  );

}

