"use client";

import Link from "next/link";

import { usePathname, useRouter } from "next/navigation";

import { supabase } from "@/lib/supabaseClient";

import { cn } from "@/lib/utils";

import { getPlanTier, canAccessFeature } from "@/lib/planHelpers";

import { 

  BarChart3, UserPlus, Network, Users, Settings, LogOut, Lock 

} from "lucide-react";

export function OrganizationSidebar({ 

  orgId, 

  planId,

  isMobileOpen,

  onMobileClose

}: { 

  orgId: string; 

  planId: string | null | undefined;

  isMobileOpen?: boolean;

  onMobileClose?: () => void;

}) {

  const pathname = usePathname();

  const router = useRouter();

  

  const currentTier = getPlanTier(planId);

  const handleLogout = async () => {

    await supabase.auth.signOut();

    router.push("/auth/login");

  };

  const menuItems = [

    {

      title: "ダッシュボード",

      href: `/organization/${orgId}`,

      icon: BarChart3,

      requiredTier: "light" as const,

    },

    {

      title: "採用・選抜 (Selection)",

      href: `/organization/${orgId}/candidates`,

      icon: UserPlus,

      requiredTier: "light" as const,

    },

    {

      title: "組織・配置 (Placement)",

      href: `/organization/${orgId}/teams`,

      icon: Network,

      requiredTier: "standard" as const,

    },

  ];

  // メニュー項目レンダリング用コンポーネント（PC/スマホ共通化）

  const renderMenuItem = (item: typeof menuItems[0]) => {

    const isLocked = !canAccessFeature(currentTier, item.requiredTier);

    
    // 完全一致ではなく「その文字から始まるか」で判定する
    // これで /candidates/detail/xxx に居ても、メニューが光るようになります
    const isActive = pathname === item.href || (item.href !== `/organization/${orgId}` && pathname.startsWith(item.href));

    // ロック時の表示

    if (isLocked) {

      return (

        <div key={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 cursor-not-allowed group relative bg-slate-50/50">

          <item.icon className="w-4 h-4" />

          <span>{item.title}</span>

          <Lock className="w-3 h-3 ml-auto opacity-50" />

          {/* PCのみツールチップ */}

          <div className="hidden md:block absolute left-full ml-2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none">

            {item.requiredTier === "standard" ? "Standardプランで解放" : "プラン契約が必要"}

          </div>

        </div>

      );

    }

    // 通常時の表示

    return (

      <Link

        key={item.href}

        href={item.href}

        onClick={onMobileClose} // スマホなら閉じる

        className={cn(

          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",

          // isActive を使う

          isActive

            ? "bg-indigo-50 text-indigo-600"

            : "text-slate-700 hover:bg-slate-50 hover:text-indigo-600"

        )}

      >

        <item.icon className="w-4 h-4" />

        {item.title}

      </Link>

    );

  };

  return (

    <>

      {/* PC版サイドバー */}

      <nav className="hidden md:flex flex-col w-64 min-h-screen bg-white border-r border-slate-200">

        {/* ロゴエリア (リンク付き) */}

        <div className="p-6 border-b border-slate-100">

          <Link href="/business" className="flex items-center gap-2 hover:opacity-80 transition-opacity">

            <div className="w-8 h-8 bg-indigo-900 rounded-lg flex items-center justify-center text-white font-bold">K</div>

            <div className="flex flex-col">

              <span className="font-bold text-slate-900 text-lg leading-tight">Kage OS</span>

              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Organization</span>

            </div>

          </Link>

        </div>

        {/* メニューエリア */}

        <div className="flex-1 p-4 space-y-1 overflow-y-auto">

          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Apps</h3>

          {menuItems.map(renderMenuItem)}

          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-8 mb-4 px-2">Management</h3>

          <Link href={`/organization/${orgId}/members`} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50", pathname.includes("members") ? "text-indigo-600" : "text-slate-700")}>

            <Users className="w-4 h-4" /> メンバー管理

          </Link>

          <Link href={`/organization/${orgId}/settings`} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50", pathname.includes("settings") ? "text-indigo-600" : "text-slate-700")}>

            <Settings className="w-4 h-4" /> 組織設定

          </Link>

        </div>

        {/* ログアウト */}

        <div className="p-4 border-t border-slate-100">

          <button onClick={handleLogout} className="flex items-center gap-3 w-full text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-2.5 rounded-lg transition-colors">

            <LogOut className="w-4 h-4" /> ログアウト

          </button>

        </div>

      </nav>

      {/* スマホ版サイドバー */}

      <nav className={cn(

        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:hidden",

        isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"

      )}>

         {/* ロゴ */}

         <div className="p-6 border-b border-slate-100">

           <Link href="/business" className="flex items-center gap-2" onClick={onMobileClose}>

              <div className="w-8 h-8 bg-indigo-900 rounded-lg flex items-center justify-center text-white font-bold">K</div>

              <span className="font-bold text-slate-900 text-lg">Kage OS</span>

           </Link>

        </div>

        

        {/* メニュー */}

        <div className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-80px)]">

           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Apps</h3>

           

           {/* nullを返さず、PCと同じロジックでレンダリングする */}

           {menuItems.map(renderMenuItem)}

           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-8 mb-4 px-2">Management</h3>

           <Link href={`/organization/${orgId}/members`} onClick={onMobileClose} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700">

             <Users className="w-4 h-4" /> メンバー管理

           </Link>

           <Link href={`/organization/${orgId}/settings`} onClick={onMobileClose} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700">

             <Settings className="w-4 h-4" /> 組織設定

           </Link>

           <div className="border-t my-4"></div>

           <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-3 text-red-600 w-full text-left font-medium text-sm">

             <LogOut className="w-4 h-4" /> ログアウト

           </button>

        </div>

      </nav>

    </>

  );

}
