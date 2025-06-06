"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Providers } from "@/components/providers/Providers";

export function DashboardClient({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="h-screen flex bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto bg-white">{children}</main>
        </div>
      </div>
    </Providers>
  );
}
