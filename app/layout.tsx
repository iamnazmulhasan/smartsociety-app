import type { Metadata } from "next";
import "./globals.css";

export const metadata = {
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
          rel="stylesheet"
        />
        {/*
          This is the corrected tag. It uses a standard <style> tag
          which works perfectly on the server and fixes the build error.
        */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              body {
                font-family: 'Inter', sans-serif;
              }
            `,
          }}
        />
      </head>
      <body>
        <main className="flex flex-col items-center justify-center min-h-screen p-4">
          {children}
        </main>
      </body>
    </html>
  );
}