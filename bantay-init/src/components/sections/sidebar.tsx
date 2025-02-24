"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logoShort from "@/assets/logov2.svg";
import logoFull from "@/assets/logo.svg";
import { Home, BarChart2, HelpCircle, Settings } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
  { name: "FAQs", href: "/faqs", icon: HelpCircle },
  { name: "Settings", href: "/settings", icon: Settings },
];

// Accept props from Dashboard
export function Sidebar({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Sidebar Overlay (Closes sidebar when clicked) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)} // Close when tapping outside
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-48 flex-col rounded-r-2xl bg-[var(--orange-primary)] shadow-lg transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden`}
      >
        {/* Sidebar Logo */}
        <div className="flex h-16 items-center px-8 mt-6 mb-10">
          <Image
            src={logoFull}
            alt="Full Logo"
            width={120}
            height={32}
            priority
          />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-6 px-8">
          {navigation.map(({ name, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={name}
                href={href}
                className={`flex items-center space-x-4 py-3 text-sm font-medium ${
                  isActive ? "text-white" : "text-white/70 hover:text-white"
                }`}
                onClick={() => setIsMobileMenuOpen(false)} // Close on link click
              >
                <Icon className="h-6 w-6 flex-shrink-0" />
                <span>{name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Desktop Sidebar (Unchanged) */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden md:flex w-20 lg:w-64 flex-col rounded-r-2xl bg-[var(--orange-primary)] shadow-lg">
        <div className="flex h-16 items-center justify-center px-4 mt-12 mb-16">
          <Image
            src={logoShort}
            alt="Short Logo"
            width={42}
            height={32}
            className="md:block lg:hidden"
            priority
          />
          <Image
            src={logoFull}
            alt="Full Logo"
            width={144}
            height={32}
            className="hidden lg:block"
            priority
          />
        </div>

        <nav className="flex-1 space-y-4">
          {navigation.map(({ name, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={name}
                href={href}
                className={`relative flex items-center pl-7 lg:pl-14 rounded-lg py-3 text-sm font-medium ${
                  isActive ? "text-white" : "text-white/70 hover:text-white"
                }`}
              >
                {isActive && (
                  <span className="absolute left-2 top-0 hidden h-full w-1 bg-white rounded-full lg:block" />
                )}
                <Icon className="h-6 w-6 flex-shrink-0" />
                <span className="hidden lg:inline-block ml-3">{name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
