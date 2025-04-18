"use client";

import { useEffect, useState } from "react";
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
  UserCog,
  LogOut,
  Shield,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { AdminLoginModal } from "@/components/sections/admin-login-modal";
import { ReportIssueModal } from "@/components/sections/report-issue-modal";
import { useTheme } from "next-themes";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { useAuth } from "@/components/providers/auth-provider";
import useMedia from "use-media";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
  { name: "FAQs", href: "/faqs", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, isAdmin, logout } = useAuth();
  const {
    dropdownOpen,
    setDropdownOpen,
    isAdminModalOpen,
    setIsAdminModalOpen,
    isReportModalOpen,
    setIsReportModalOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  } = useSidebar();

  const isMobile = useMedia({ maxWidth: 767 });
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  useEffect(() => {
    if (isAdminModalOpen || isReportModalOpen) {
      setDropdownOpen(false);
    }
  }, [isAdminModalOpen, isReportModalOpen, setDropdownOpen]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navigateToFAQs = () => {
    router.push("/faqs");
    setDropdownOpen(false);
  };

  const handleOpenAdminModal = () => {
    setDropdownOpen(false);
    setTimeout(() => {
      setIsAdminModalOpen(true);
    }, 100);
  };

  const handleOpenReportModal = () => {
    setDropdownOpen(false);
    setTimeout(() => {
      setIsReportModalOpen(true);
    }, 100);
  };

  const handleLogout = () => {
    logout();
    setIsLogoutDialogOpen(false);
    setDropdownOpen(false);
  };

  return (
    <>
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
        <div className="flex h-16 items-center justify-center px-8 mt-6 mb-10">
          <div className="relative w-32 h-10">
            <Image
              src="/assets/logov2.svg"
              alt="B-1N1T"
              fill
              className="object-contain"
            />
          </div>
        </div>

        <nav className="flex-1 space-y-6 px-8">
          {navigation.map(({ name, href, icon: Icon }) => {
            const isActive =
              pathname === href || (href === "/dashboard" && pathname === "/");
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

          {/* Admin Dashboard Link - Only visible to admins */}
          {isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center space-x-4 py-3 text-sm font-medium ${
                pathname.startsWith("/admin")
                  ? "text-white"
                  : "text-white/70 hover:text-white"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Shield className="h-6 w-6 flex-shrink-0" />
              <span>Admin</span>
            </Link>
          )}

          {isMobile && (
            <DropdownMenu.Root
              open={dropdownOpen}
              onOpenChange={setDropdownOpen}
            >
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
                    onClick={handleOpenReportModal}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Report an Issue
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />
                  {user ? (
                    <Dialog
                      open={isLogoutDialogOpen}
                      onOpenChange={setIsLogoutDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <DropdownMenu.Item
                          className="flex items-center gap-2 cursor-pointer px-4 py-2 text-sm text-black hover:bg-gray-100"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </DropdownMenu.Item>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Are you sure you want to logout?
                          </DialogTitle>
                          <DialogDescription>
                            You will be signed out of your account and
                            redirected to the login page.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            className="mt-2"
                            variant="outline"
                            onClick={() => setIsLogoutDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={handleLogout}>
                            Logout
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <DropdownMenu.Item
                      className="flex items-center gap-2 cursor-pointer px-4 py-2 text-sm text-black hover:bg-gray-100"
                      onClick={handleOpenAdminModal}
                    >
                      <UserCog className="w-4 h-4" />
                      Admin Login
                    </DropdownMenu.Item>
                  )}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          )}
        </nav>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden md:flex w-20 lg:w-64 flex-col rounded-r-2xl bg-[var(--orange-primary)] shadow-lg">
        <div className="flex h-16 items-center justify-center px-4 mt-12 mb-16">
          {/* Logo for collapsed sidebar (md screens) */}
          <div className="relative w-10 h-10 md:block lg:hidden">
            <Image
              src="/assets/logov2.svg"
              alt="B"
              fill
              className="object-contain"
            />
          </div>
          {/* Full logo for expanded sidebar (lg screens) */}
          <div className="relative w-32 h-10 hidden lg:block">
            <Image
              src="/assets/logo.svg"
              alt="B-1N1T"
              fill
              className="object-contain"
            />
          </div>
        </div>

        <nav className="flex-1 space-y-4">
          {navigation.map(({ name, href, icon: Icon }) => {
            const isActive =
              pathname === href || (href === "/dashboard" && pathname === "/");
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

          {/* Admin Dashboard Link - Only visible to admins */}
          {isAdmin && (
            <Link
              href="/admin"
              className={`relative flex items-center pl-7 lg:pl-14 rounded-lg py-3 text-sm font-medium ${
                pathname.startsWith("/admin")
                  ? "text-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {pathname.startsWith("/admin") && (
                <span className="absolute left-2 top-0 hidden h-full w-1 bg-white rounded-full lg:block" />
              )}
              <Shield className="h-6 w-6 flex-shrink-0" />
              <span className="hidden lg:inline-block ml-3">Admin</span>
            </Link>
          )}

          {!isMobile && (
            <DropdownMenu.Root
              open={dropdownOpen}
              onOpenChange={setDropdownOpen}
            >
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
                    onClick={handleOpenReportModal}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Report an Issue
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />
                  {user ? (
                    <Dialog
                      open={isLogoutDialogOpen}
                      onOpenChange={setIsLogoutDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <DropdownMenu.Item
                          className="flex items-center gap-2 cursor-pointer px-4 py-2 text-sm text-black hover:bg-gray-100"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </DropdownMenu.Item>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Are you sure you want to logout?
                          </DialogTitle>
                          <DialogDescription>
                            You will be signed out of your account and
                            redirected to the login page.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsLogoutDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={handleLogout}>
                            Logout
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <DropdownMenu.Item
                      className="flex items-center gap-2 cursor-pointer px-4 py-2 text-sm text-black hover:bg-gray-100"
                      onClick={handleOpenAdminModal}
                    >
                      <UserCog className="w-4 h-4" />
                      Admin Login
                    </DropdownMenu.Item>
                  )}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          )}
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
