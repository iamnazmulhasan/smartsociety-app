// /app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import "inter-ui/inter.css";

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
      <head>
        <link rel="icon" href="https://bloomapp.club/AppIcon.png" type="image/png" />
      </head>
      <body>
        <main className="flex flex-col items-center justify-center min-h-screen p-4">
          {children}
        </main>
      </body>
    </html>
  );
}