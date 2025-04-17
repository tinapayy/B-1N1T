"use client";

import type { ReactNode } from "react";
import { Sidebar } from "@/components/sections/sidebar";
import { SidebarProvider } from "@/components/providers/sidebar-provider";
import { MobileTopBar } from "@/components/sections/mobile-top-bar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen">
        {/* Mobile Top Bar - Visible only on mobile */}
        <MobileTopBar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 md:ml-20 lg:ml-64">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
