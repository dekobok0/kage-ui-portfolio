"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { 
  LayoutDashboard, 
  BrainCircuit, 
  Stethoscope, 
  ListTodo, 
  Send, 
  Settings,
  LogOut,
  ChevronRight,
  Activity,
  Eye,
  Zap,
  Users,  // 追加アイコン
  Waves   // 追加アイコン
} from "lucide-react";

// メニュー構造の定義
type SidebarItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
};

type SidebarGroup = {
  title: string;
  items: SidebarItem[];
};

const sidebarGroups: SidebarGroup[] = [
  {
    title: "メイン",
    items: [
      { title: "ホーム", href: "/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    title: "科学的特性テスト (Track A)", 
    items: [
      // Rank 1: 基盤ツール
      { title: "6因子性格診断", href: "/dashboard/assessment/hexaco", icon: BrainCircuit },
      { title: "問題解決スタイル", href: "/dashboard/assessment/kai", icon: Zap },
      
      // Rank 2: 実証的ツール
      { title: "認知スタイル", href: "/dashboard/assessment/osivq", icon: Eye },
      { title: "注意・集中スタイル", href: "/dashboard/assessment/asrs", icon: Activity },
      { title: "コミュニケーション特性", href: "/dashboard/assessment/aq", icon: Users },
      
      // Rank 3: 感覚ツール
      { title: "感覚・感受性チェック", href: "/dashboard/assessment/sensory", icon: Waves },
    ]
  },
  {
    title: "医療的根拠 (Track B)",
    items: [
      { title: "医師による診断申告", href: "/dashboard/assessment/declaration", icon: Stethoscope },
    ]
  },
  {
    title: "ワークスペース",
    items: [
      { title: "企業連携タスク", href: "#", icon: ListTodo, disabled: true },
      { title: "企業への要求", href: "#", icon: Send, disabled: true },
    ]
  }
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/auth/login");
    router.refresh();
  };

  return (
    <nav className="w-64 min-h-screen bg-white border-r border-slate-200 hidden md:flex flex-col overflow-y-auto">
      {/* 上部：ロゴ (クリックでホームへ) */}
      <div className="p-6 pb-2">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-sm shadow-md">K</div>
          <span>Kage</span>
        </Link>
      </div>

      {/* メニューエリア */}
      <div className="flex-1 py-4 space-y-6 px-4">
        {sidebarGroups.map((group, i) => (
          <div key={i}>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pl-2">
              {group.title}
            </h2>
            <div className="space-y-1">
              {group.items.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group",
                    item.disabled 
                      ? "text-slate-400 cursor-not-allowed opacity-60" 
                      : pathname === item.href
                        ? "bg-slate-100 text-slate-900 font-semibold shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1"
                  )}
                  onClick={(e) => item.disabled && e.preventDefault()}
                >
                  <item.icon className={cn("w-4 h-4", pathname === item.href ? "text-slate-900" : "text-slate-500 group-hover:text-slate-900")} />
                  {item.title}
                  {item.disabled && (
                    <span className="ml-auto text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded border">
                      準備中
                    </span>
                  )}
                  {!item.disabled && pathname === item.href && (
                    <ChevronRight className="w-3 h-3 ml-auto text-slate-400" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 下部：ユーザー設定とログアウト */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 mt-auto">
        <div className="flex flex-col gap-1">
          <Link
            href="/dashboard/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm transition-all",
              pathname === "/dashboard/settings" ? "bg-white shadow-sm text-slate-900" : ""
            )}
          >
            <Settings className="w-4 h-4" />
            設定・プロフィール
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            ログアウト
          </button>
        </div>
      </div>
    </nav>
  );
}
