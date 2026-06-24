import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/store/providers";

export const metadata: Metadata = {
  title: "Learn English Platform",
  description: "English learning platform built with Next.js and Django REST API",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body>
      <Providers>{children}</Providers>
      </body>
      </html>
  );
}