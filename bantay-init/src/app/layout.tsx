import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Sidebar } from "@/components/sections/sidebar";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

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
    <html lang="en">
      <body className={poppins.className}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-4 md:ml-20 lg:ml-64">{children}</main>
        </div>
      </body>
    </html>
  );
}
