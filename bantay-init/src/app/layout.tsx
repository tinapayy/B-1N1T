import type React from "react";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { AppLayout } from "@/components/layouts/app-layout";
import "./globals.css";

export const metadata: Metadata = {
  title: "B-1N1T Dashboard",
  description: "B-1N1T Heat Index Monitoring Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AppLayout>{children}</AppLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
