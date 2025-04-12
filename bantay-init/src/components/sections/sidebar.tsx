"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  BarChart2,
  HelpCircle,
  Settings,
  Moon,
  Sun,
  Info,
  AlertTriangle,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { AdminLoginModal } from "@/components/sections/admin-login-modal";
import { ReportIssueModal } from "@/components/sections/report-issue-modal";
import { useTheme } from "next-themes";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
  { name: "FAQs", href: "/faqs", icon: HelpCircle },
];

export function Sidebar({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navigateToFAQs = () => {
    router.push("/faqs");
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-48 flex-col rounded-r-2xl bg-[var(--orange-primary)] shadow-lg transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden`}
      >
        <div className="flex h-16 items-center px-8 mt-6 mb-10">
          <Image
            src="/assets/logo.svg"
            alt="Full Logo"
            width={120}
            height={32}
            priority
          />
        </div>

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
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon className="h-6 w-6 flex-shrink-0" />
                <span>{name}</span>
              </Link>
            );
          })}

          {/* Settings Dropdown (Mobile) */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center space-x-4 py-3 text-sm font-medium text-white/70 hover:text-white w-full">
                <Settings className="h-6 w-6 flex-shrink-0" />
                <span>Settings</span>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 mt-1 w-48 rounded-md bg-white py-1 shadow-lg"
                sideOffset={5}
                align="start"
              >
                <DropdownMenu.Item
                  className="flex items-center gap-2 cursor-pointer px-4 py-2 text-sm text-black hover:bg-gray-100"
                  onClick={toggleTheme}
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex items-center gap-2 cursor-pointer px-4 py-2 text-sm text-black hover:bg-gray-100"
                  onClick={navigateToFAQs}
                >
                  <Info className="w-4 h-4" />
                  About This Project
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex items-center gap-2 cursor-pointer px-4 py-2 text-sm text-black hover:bg-gray-100"
                  onClick={() => setIsReportModalOpen(true)}
                >
                  <AlertTriangle className="w-4 h-4" />
                  Report an Issue
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />
                <DropdownMenu.Item
                  className="cursor-pointer px-4 py-2 text-sm text-black hover:bg-gray-100"
                  onClick={() => setIsAdminModalOpen(true)}
                >
                  Admin Login
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </nav>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden md:flex w-20 lg:w-64 flex-col rounded-r-2xl bg-[var(--orange-primary)] shadow-lg">
        <div className="flex h-16 items-center justify-center px-4 mt-12 mb-16">
          <Image
            src="/assets/logov2.svg"
            alt="Short Logo"
            width={42}
            height={32}
            className="md:block lg:hidden"
            priority
          />
          <Image
            src="/assets/logo.svg"
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

          {/* Settings Dropdown (Desktop) */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="relative flex items-center pl-7 lg:pl-14 rounded-lg py-3 text-sm font-medium text-white/70 hover:text-white w-full">
                <Settings className="h-6 w-6 flex-shrink-0" />
                <span className="hidden lg:inline-block ml-3">Settings</span>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 mt-1 w-48 rounded-md bg-white py-1 shadow-lg"
                sideOffset={5}
                align="end"
              >
                <DropdownMenu.Item
                  className="flex items-center gap-2 cursor-pointer px-4 py-2 text-sm text-black hover:bg-gray-100"
                  onClick={toggleTheme}
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex items-center gap-2 cursor-pointer px-4 py-2 text-sm text-black hover:bg-gray-100"
                  onClick={navigateToFAQs}
                >
                  <Info className="w-4 h-4" />
                  About This Project
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex items-center gap-2 cursor-pointer px-4 py-2 text-sm text-black hover:bg-gray-100"
                  onClick={() => setIsReportModalOpen(true)}
                >
                  <AlertTriangle className="w-4 h-4" />
                  Report an Issue
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />
                <DropdownMenu.Item
                  className="cursor-pointer px-4 py-2 text-sm text-black hover:bg-gray-100"
                  onClick={() => setIsAdminModalOpen(true)}
                >
                  Admin Login
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </nav>
      </aside>

      {/* Modals */}
      <AdminLoginModal
        open={isAdminModalOpen}
        onOpenChange={setIsAdminModalOpen}
      />
      <ReportIssueModal
        open={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
      />
    </>
  );
}
