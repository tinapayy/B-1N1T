"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import { useSidebar } from "@/components/providers/sidebar-provider";
import Link from "next/link";

export function MobileTopBar() {
  const { setIsMobileMenuOpen } = useSidebar();

  return (
    <div className="flex items-center justify-between p-3 bg-[var(--orange-primary)] text-white md:hidden">
      <Link href="/dashboard">
        <div className="relative w-24 h-8">
          <Image
            src="/assets/logo.svg"
            alt="B-1N1T"
            fill
            className="object-contain"
          />
        </div>
      </Link>
      <button
        type="button"
        className="p-2 rounded-md hover:bg-[var(--orange-secondary)]"
        onClick={() => setIsMobileMenuOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-white" />
      </button>
    </div>
  );
}
