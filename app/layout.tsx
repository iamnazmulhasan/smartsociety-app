// /app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ['400', '700'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "SmartSociety",
  description: "Integrated Community & Facilities Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <main className="flex flex-col items-center justify-center min-h-screen p-4">
          {children}
        </main>
      </body>
    </html>
  );
}