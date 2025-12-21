"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabaseClient";

import { Network, Plus, Users } from "lucide-react";

export default function TeamsPage({ params }: { params: { orgId: string } }) {

  const { orgId } = params;

  const [teams, setTeams] = useState<any[]>([]);

  

  useEffect(() => {

    const fetchTeams = async () => {

      // 組織チームの取得

      const { data } = await supabase

        .from("org_teams")

        .select("*")

        .eq("organization_id", orgId);

      if (data) setTeams(data);

    };

    fetchTeams();

  }, [orgId]);

  const createTeam = async () => {

    const name = prompt("チーム名を入力（例: 営業一課）");

    if (!name) return;

    const { error } = await supabase.from("org_teams").insert({

      organization_id: orgId,

      name: name

    });

    if (!error) window.location.reload();

  };

  return (

    <div className="space-y-8">

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-2xl font-bold text-slate-900">Placement DX (組織・配置)</h1>

          <p className="text-slate-500">KAI理論に基づく認知スタイル適合と配置最適化</p>

        </div>

        <button onClick={createTeam} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700">

          <Plus className="w-4 h-4" /> チームを作成

        </button>

      </div>

      {/* 組織図エリア */}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {teams.length === 0 && <p className="text-slate-400 col-span-3">チームが作成されていません。</p>}

        

        {teams.map((team) => (

          <div key={team.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-indigo-300 transition-colors cursor-pointer group">

            <div className="flex justify-between items-start mb-4">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">

                  <Network className="w-5 h-5" />

                </div>

                <div>

                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-700">{team.name}</h3>

                  <p className="text-xs text-slate-500">0 members</p>

                </div>

              </div>

            </div>

            

            {/* シミュレーション用プレースホルダー */}

            <div className="space-y-2">

              <div className="h-10 bg-slate-50 rounded border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400">

                + ドラッグしてメンバーを追加

              </div>

              <div className="p-2 bg-yellow-50 text-yellow-800 text-xs rounded border border-yellow-100 hidden">

                ⚡ 認知スタイル衝突リスクあり

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}

