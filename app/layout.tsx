import type { Metadata } from "next";

import "@/styles/globals.css";

import { siteConfig } from "@/lib/siteConfig";

import { AuthProvider } from "@/components/providers/AuthContext"; 

export const metadata: Metadata = {

  title: siteConfig.name,

  description: siteConfig.hero.subheading,

  icons: {

    icon: "/logo.svg",

  },

};

export default function RootLayout({

  children,

}: {

  children: React.ReactNode;

}) {

  return (

    <html lang="ja">

      <body className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">

        <AuthProvider>

          {children}

        </AuthProvider>

      </body>

    </html>

  );

}
