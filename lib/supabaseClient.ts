import { createClient } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { SupabaseCustomStorageLogger } from "@/utils/SupabaseCustomStorageLogger";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 環境変数がなければアプリを起動させない（Fail Fast）
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing in .env.local");
}

// カスタムストレージを作成（ブラウザ環境でのみ）
// サーバー側では undefined になり、問題なく動作します
const customStorage =
  typeof window !== "undefined" && window.localStorage
    ? new SupabaseCustomStorageLogger(window.localStorage)
    : undefined;

// これにより、exportされるsupabaseは絶対にnullになりません
// サーバーコンポーネントとクライアントコンポーネントの両方で使用可能
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    storage: customStorage,
  },
});

export type { Session };
