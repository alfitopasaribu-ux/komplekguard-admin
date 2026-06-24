import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import "./theme.css";
import { Toaster } from "sonner";

import ThemeToggle from "@/components/ThemeToggle";

const geist = Geist({ subsets: ["latin"] });




export const metadata: Metadata = {
  title: "KomplekGuard AI — Admin Panel",
  description: "Panel Admin Sistem Keamanan Kompleks",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${geist.className} bg-white text-slate-900 dark:bg-[#070d1a] dark:text-white`}>



        {children}


        <Toaster richColors position="top-right" />

      </body>
    </html>

  );
}

