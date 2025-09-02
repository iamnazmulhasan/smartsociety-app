// /app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Configure Inter for the entire app
const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter', // Use a CSS variable
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
    <html lang="en">
      {/* Apply the font variable to the html tag for global scope */}
      <body className={`${inter.variable} font-sans`}>
        <main className="flex flex-col items-center justify-center min-h-screen p-4">
          {children}
        </main>
      </body>
    </html>
  );
}