// /app/(auth)/layout.tsx
"use client";

import { useEffect } from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Store original body classes
    const originalClasses = document.body.className;

    // Clear existing background classes and add bg-black
    document.body.className = '';
    document.body.classList.add('bg-black');

    // When the layout unmounts, restore the original classes
    return () => {
      document.body.className = originalClasses;
    };
  }, []); // Runs only once when the component mounts

  return <>{children}</>;
}