"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabaseClient";

import { User, ShieldCheck } from "lucide-react";

export default function MembersPage({ params }: { params: { orgId: string } }) {

  const { orgId } = params;

  const [members, setMembers] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchMembers = async () => {

      // メンバー一覧を取得（プロファイル情報も一緒に）

      const { data } = await supabase

        .from("organization_members")

        .select(`

          user_id, 

          role, 

          profiles ( email )

        `)

        .eq("organization_id", orgId);

      

      if (data) setMembers(data);

      setLoading(false);

    };

    fetchMembers();

  }, [orgId]);

  if (loading) return <div className="p-8">読み込み中...</div>;

  return (

    <div className="space-y-8">

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-2xl font-bold text-slate-900">Member Management</h1>

          <p className="text-slate-500">社員リストと法的防御ログ（Defense）の管理</p>

        </div>

      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        <table className="w-full text-sm text-left">

          <thead className="bg-slate-50 text-slate-500 font-medium">

            <tr>

              <th className="px-6 py-3">社員 (Email)</th>

              <th className="px-6 py-3">権限</th>

              <th className="px-6 py-3">コンプライアンス状況</th>

              <th className="px-6 py-3">操作</th>

            </tr>

          </thead>

          <tbody className="divide-y divide-slate-100">

            {members.length === 0 && (

              <tr>

                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">

                  まだメンバーが登録されていません

                </td>

              </tr>

            )}

            {members.map((member) => (

              <tr key={member.user_id} className="hover:bg-slate-50 cursor-pointer">

                <td className="px-6 py-4 flex items-center gap-3">

                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">

                    {member.profiles?.email?.charAt(0).toUpperCase() || "?"}

                  </div>

                  <span className="font-medium text-slate-900">{member.profiles?.email || "Unknown"}</span>

                </td>

                <td className="px-6 py-4 capitalize text-slate-600">{member.role}</td>

                <td className="px-6 py-4">

                  {/* 将来ここを「配慮合意済み」などのステータスにします */}

                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-50 text-green-700 text-xs font-medium">

                    <ShieldCheck className="w-3 h-3" /> 正常

                  </span>

                </td>

                <td className="px-6 py-4">

                  <button className="text-indigo-600 hover:text-indigo-800 font-medium text-xs">

                    詳細・配慮ログへ &rarr;

                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}

