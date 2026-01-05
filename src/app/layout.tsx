import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers"; // ADD THIS

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Darcho - Ethiopian Coffee Marketplace",
  description: "Direct trade platform connecting Ethiopian coffee farmers with global buyers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers> {/* WRAP WITH PROVIDERS */}
          {children}
        </Providers>
      </body>
    </html>
  );
}