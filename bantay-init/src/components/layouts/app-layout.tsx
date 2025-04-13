"use client";

import type { ReactNode } from "react";
import { Sidebar } from "@/components/sections/sidebar";
import { SidebarProvider } from "@/components/providers/sidebar-provider";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 md:ml-20 lg:ml-64">{children}</main>
      </div>
    </SidebarProvider>
  );
}
